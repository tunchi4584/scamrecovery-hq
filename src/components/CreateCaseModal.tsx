
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Upload, X, FileText, Image } from 'lucide-react';

interface CreateCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCaseCreated: () => void;
}

interface UploadedFile {
  name: string;
  url: string;
  type: string;
  size: number;
}

const SCAM_TYPES = [
  'Investment Scam',
  'Romance Scam',
  'Phishing',
  'Identity Theft',
  'Cryptocurrency Scam',
  'Online Shopping Scam',
  'Tech Support Scam',
  'Other'
];

export default function CreateCaseModal({ isOpen, onClose, onCaseCreated }: CreateCaseModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scamType, setScamType] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const { toast } = useToast();
  const { user, refreshUserData } = useAuth();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !user) return;

    setUploading(true);
    const newFiles: UploadedFile[] = [];

    try {
      for (const file of Array.from(files)) {
        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          toast({
            title: "File too large",
            description: `${file.name} is larger than 10MB`,
            variant: "destructive"
          });
          continue;
        }

        // Create unique filename with user ID folder structure
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

        const { data, error } = await supabase.storage
          .from('evidence')
          .upload(fileName, file);

        if (error) {
          console.error('Upload error:', error);
          toast({
            title: "Upload failed",
            description: `Failed to upload ${file.name}`,
            variant: "destructive"
          });
          continue;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('evidence')
          .getPublicUrl(fileName);

        newFiles.push({
          name: file.name,
          url: publicUrl,
          type: file.type,
          size: file.size
        });
      }

      setUploadedFiles(prev => [...prev, ...newFiles]);
      
      if (newFiles.length > 0) {
        toast({
          title: "Upload successful",
          description: `${newFiles.length} file(s) uploaded successfully`
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "An error occurred while uploading files",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const removeFile = async (fileUrl: string, fileName: string) => {
    try {
      // Extract the file path from the URL
      const urlParts = fileUrl.split('/');
      const filePath = urlParts.slice(-2).join('/'); // Get user_id/filename part

      const { error } = await supabase.storage
        .from('evidence')
        .remove([filePath]);

      if (error) {
        console.error('Delete error:', error);
      }

      setUploadedFiles(prev => prev.filter(file => file.url !== fileUrl));
      
      toast({
        title: "File removed",
        description: `${fileName} has been removed`
      });
    } catch (error) {
      console.error('Remove file error:', error);
      toast({
        title: "Error",
        description: "Failed to remove file",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to create a case",
        variant: "destructive"
      });
      return;
    }

    if (!title.trim() || !description.trim() || !scamType || !amount) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount < 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    console.log('Creating case for user:', user.id);

    try {
      // First, ensure the user has a balance record
      const { data: existingBalance, error: balanceCheckError } = await supabase
        .from('balances')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (balanceCheckError) {
        console.error('Balance check error:', balanceCheckError);
        throw balanceCheckError;
      }

      // Create balance record if it doesn't exist
      if (!existingBalance) {
        console.log('Creating balance record for user:', user.id);
        const { error: balanceCreateError } = await supabase
          .from('balances')
          .insert({
            user_id: user.id,
            amount_lost: 0,
            amount_recovered: 0
          });

        if (balanceCreateError) {
          console.error('Balance creation error:', balanceCreateError);
          throw balanceCreateError;
        }
      }

      // Prepare evidence data
      const evidenceData = uploadedFiles.length > 0 ? JSON.stringify(uploadedFiles) : null;

      // Create the case
      const caseData = {
        user_id: user.id,
        title: title.trim(),
        description: description.trim(),
        scam_type: scamType,
        amount: parsedAmount,
        evidence: evidenceData,
        status: 'pending'
      };

      console.log('Inserting case data:', caseData);

      const { data: newCase, error: caseError } = await supabase
        .from('cases')
        .insert(caseData)
        .select()
        .single();

      if (caseError) {
        console.error('Case creation error:', caseError);
        throw caseError;
      }

      console.log('Case created successfully:', newCase);

      // Refresh user data to update the UI
      await refreshUserData();

      toast({
        title: "Case Created",
        description: `Recovery case "${title}" has been created successfully`
      });

      // Reset form
      setTitle('');
      setDescription('');
      setScamType('');
      setAmount('');
      setUploadedFiles([]);
      
      onCaseCreated();
      onClose();

    } catch (error: any) {
      console.error('Error creating case:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to create case. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setScamType('');
    setAmount('');
    setUploadedFiles([]);
  };

  const handleClose = () => {
    if (!loading) {
      resetForm();
      onClose();
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <Image className="h-4 w-4" />;
    }
    return <FileText className="h-4 w-4" />;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Recovery Case</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Case Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a descriptive title for your case"
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="scam-type">Scam Type *</Label>
            <Select value={scamType} onValueChange={setScamType} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="Select the type of scam" />
              </SelectTrigger>
              <SelectContent>
                {SCAM_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount Lost (USD) *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide detailed information about the scam incident..."
              className="min-h-[120px]"
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Evidence Files</Label>
            <div className="space-y-4">
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="evidence-upload"
                  className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 ${
                    uploading || loading ? 'pointer-events-none opacity-50' : ''
                  }`}
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {uploading ? (
                      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    ) : (
                      <Upload className="h-8 w-8 text-gray-400" />
                    )}
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> evidence files
                    </p>
                    <p className="text-xs text-gray-500">
                      Images, documents, screenshots (MAX 10MB each)
                    </p>
                  </div>
                  <input
                    id="evidence-upload"
                    type="file"
                    className="hidden"
                    multiple
                    accept="image/*,.pdf,.doc,.docx,.txt"
                    onChange={handleFileUpload}
                    disabled={uploading || loading}
                  />
                </label>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Uploaded Files:</p>
                  <div className="space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          {getFileIcon(file.type)}
                          <div>
                            <p className="text-sm font-medium truncate max-w-[200px]">
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(file.url, file.name)}
                          disabled={loading}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Creating...' : 'Create Case'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
