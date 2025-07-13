
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, DollarSign, Upload, X } from 'lucide-react';

export function CreateCaseModal() {
  const { user, refreshUserData } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    scam_type: '',
    evidence: ''
  });
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  const scamTypes = [
    'Romance Scam',
    'Investment Fraud',
    'Cryptocurrency Scam',
    'Phone/SMS Scam',
    'Email Phishing',
    'Identity Theft',
    'Online Shopping Fraud',
    'Tech Support Scam',
    'Advance Fee Fraud',
    'Other'
  ];

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !user) return;

    setUploadingFiles(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

        const { data, error } = await supabase.storage
          .from('evidence')
          .upload(fileName, file);

        if (error) {
          console.error('Upload error:', error);
          throw error;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('evidence')
          .getPublicUrl(data.path);

        uploadedUrls.push(publicUrl);
      }

      setUploadedFiles(prev => [...prev, ...uploadedUrls]);
      toast({
        title: "Files uploaded",
        description: `${uploadedUrls.length} file(s) uploaded successfully.`,
      });
    } catch (error) {
      console.error('File upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload files. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploadingFiles(false);
    }
  };

  const removeFile = (urlToRemove: string) => {
    setUploadedFiles(prev => prev.filter(url => url !== urlToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      console.error('No user found');
      toast({
        title: "Error",
        description: "You must be logged in to create a case.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Creating case for user:', user.id);
      console.log('Form data:', formData);

      // Combine text evidence with uploaded file URLs
      const allEvidence = [
        formData.evidence.trim(),
        ...uploadedFiles
      ].filter(Boolean).join('\n\n---\n\n');

      // Create the case directly - let database triggers handle balance updates
      const caseData = {
        user_id: user.id,
        title: formData.title.trim(),
        description: formData.description.trim(),
        amount: parseFloat(formData.amount) || 0,
        scam_type: formData.scam_type,
        evidence: allEvidence || null,
        status: 'pending'
      };

      console.log('Inserting case with data:', caseData);

      const { data: newCase, error: caseError } = await supabase
        .from('cases')
        .insert(caseData)
        .select()
        .single();

      if (caseError) {
        console.error('Error creating case:', caseError);
        throw caseError;
      }

      console.log('Case created successfully:', newCase);

      toast({
        title: "Success",
        description: "Your case has been created successfully. You will receive updates via email.",
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        amount: '',
        scam_type: '',
        evidence: ''
      });
      setUploadedFiles([]);

      setOpen(false);
      
      // Refresh user data to show the new case
      setTimeout(() => {
        refreshUserData();
      }, 1000);

    } catch (error) {
      console.error('Error in case creation process:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create case. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Create New Case
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-blue-600" />
            Create New Recovery Case
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Case Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Brief description of your case"
              required
            />
          </div>

          <div>
            <Label htmlFor="scam_type">Scam Type *</Label>
            <Select 
              value={formData.scam_type} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, scam_type: value }))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select the type of scam" />
              </SelectTrigger>
              <SelectContent>
                {scamTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="amount">Amount Lost ($) *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Detailed Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what happened, how you were scammed, when it occurred, and any other relevant details..."
              rows={4}
              required
            />
          </div>

          <div>
            <Label htmlFor="evidence">Evidence & Documentation</Label>
            <Textarea
              id="evidence"
              value={formData.evidence}
              onChange={(e) => setFormData(prev => ({ ...prev, evidence: e.target.value }))}
              placeholder="List any evidence you have: screenshots, transaction IDs, email addresses, phone numbers, websites, etc."
              rows={3}
            />
            
            <div className="mt-3">
              <Label htmlFor="file-upload" className="cursor-pointer">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600">
                    {uploadingFiles ? 'Uploading...' : 'Click to upload evidence files (images, documents, etc.)'}
                  </p>
                </div>
              </Label>
              <Input
                id="file-upload"
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx,.txt"
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploadingFiles}
              />
            </div>

            {uploadedFiles.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="text-sm font-medium text-gray-700">Uploaded Files:</p>
                {uploadedFiles.map((url, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <span className="text-sm text-gray-600 truncate">
                      {url.split('/').pop()?.split('-').slice(1).join('-') || `File ${index + 1}`}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(url)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || uploadingFiles}>
              {loading ? 'Creating...' : 'Create Case'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
