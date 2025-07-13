
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Search, Eye, Edit, FileText, Image, Download, ExternalLink } from 'lucide-react';

interface CaseData {
  id: string;
  case_number: string;
  title: string;
  amount: number;
  status: string;
  created_at: string;
  updated_at: string;
  description: string;
  scam_type: string;
  evidence: string | null;
  user_id: string;
  user?: {
    name: string;
    email: string;
  };
}

interface EvidenceFile {
  name: string;
  url: string;
  type: string;
  size: number;
}

const CASE_STATUSES = [
  'pending',
  'under_review',
  'in_progress',
  'resolved',
  'rejected'
];

export default function AdminPortal() {
  const { isAdmin, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [cases, setCases] = useState<CaseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCase, setSelectedCase] = useState<CaseData | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editingCase, setEditingCase] = useState<Partial<CaseData>>({});
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!user || !isAdmin) {
      navigate('/admin/login');
      return;
    }
    fetchCases();
  }, [user, isAdmin, navigate]);

  const fetchCases = async () => {
    try {
      setLoading(true);
      
      // Fetch cases with user profile information
      const { data: casesData, error } = await supabase
        .from('cases')
        .select(`
          *,
          profiles!cases_user_id_fkey(name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to match our interface
      const transformedCases = casesData?.map(caseItem => ({
        ...caseItem,
        user: caseItem.profiles ? {
          name: caseItem.profiles.name,
          email: caseItem.profiles.email
        } : undefined
      })) || [];

      setCases(transformedCases);
    } catch (error) {
      console.error('Error fetching cases:', error);
      toast({
        title: "Error",
        description: "Failed to fetch cases",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (caseData: CaseData) => {
    setSelectedCase(caseData);
    setDetailsModalOpen(true);
  };

  const handleEditCase = (caseData: CaseData) => {
    setEditingCase(caseData);
    setEditModalOpen(true);
  };

  const handleUpdateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCase.id) return;

    setUpdating(true);
    try {
      const { error } = await supabase
        .from('cases')
        .update({
          status: editingCase.status,
          title: editingCase.title,
          description: editingCase.description,
          amount: editingCase.amount,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingCase.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Case updated successfully"
      });

      setEditModalOpen(false);
      setEditingCase({});
      fetchCases();
    } catch (error) {
      console.error('Error updating case:', error);
      toast({
        title: "Error",
        description: "Failed to update case",
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  const parseEvidence = (evidenceString: string | null): EvidenceFile[] => {
    if (!evidenceString) return [];
    try {
      return JSON.parse(evidenceString);
    } catch {
      return [];
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

  const handleDownloadFile = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'default';
      case 'in_progress':
        return 'secondary';
      case 'under_review':
        return 'outline';
      case 'rejected':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const filteredCases = cases.filter(caseItem => {
    const matchesSearch = 
      caseItem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caseItem.case_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caseItem.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caseItem.user?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || caseItem.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Portal</h1>
          <p className="text-gray-600">Manage recovery cases and user requests</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <CardTitle>Recovery Cases ({filteredCases.length})</CardTitle>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search cases..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full sm:w-64"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {CASE_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.replace('_', ' ').toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Case #</TableHead>    
                    <TableHead>Title</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCases.map((caseItem) => (
                    <TableRow key={caseItem.id}>
                      <TableCell className="font-mono text-sm">
                        {caseItem.case_number || 'N/A'}
                      </TableCell>
                      <TableCell className="font-medium">
                        {caseItem.title}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{caseItem.user?.name || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{caseItem.user?.email || 'N/A'}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        ${caseItem.amount?.toLocaleString() || '0'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(caseItem.status)}>
                          {caseItem.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(caseItem.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetails(caseItem)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditCase(caseItem)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredCases.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {searchTerm || statusFilter !== 'all' 
                  ? 'No cases found matching your criteria.' 
                  : 'No cases found.'}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Case Details Modal */}
        <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Case Details - {selectedCase?.case_number || 'N/A'}
              </DialogTitle>
            </DialogHeader>
            
            {selectedCase && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">Basic Information</h3>
                    <div className="mt-2 space-y-2">
                      <p><span className="font-medium">Title:</span> {selectedCase.title}</p>
                      <p><span className="font-medium">Status:</span> 
                        <Badge variant={getStatusBadgeVariant(selectedCase.status)} className="ml-2">
                          {selectedCase.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </p>
                      <p><span className="font-medium">Amount:</span> ${selectedCase.amount?.toLocaleString() || '0'}</p>
                      <p><span className="font-medium">Scam Type:</span> {selectedCase.scam_type || 'N/A'}</p>
                      <p><span className="font-medium">Created:</span> {new Date(selectedCase.created_at).toLocaleString()}</p>
                      <p><span className="font-medium">Updated:</span> {new Date(selectedCase.updated_at).toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900">User Information</h3>
                    <div className="mt-2 space-y-2">
                      <p><span className="font-medium">Name:</span> {selectedCase.user?.name || 'N/A'}</p>
                      <p><span className="font-medium">Email:</span> {selectedCase.user?.email || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900">Description</h3>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                    <p className="whitespace-pre-wrap">{selectedCase.description || 'No description provided.'}</p>
                  </div>
                </div>

                {selectedCase.evidence && (
                  <div>
                    <h3 className="font-semibold text-gray-900">Evidence Files</h3>
                    <div className="mt-2 space-y-3">
                      {parseEvidence(selectedCase.evidence).map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            {getFileIcon(file.type)}
                            <div>
                              <p className="font-medium">{file.name}</p>
                              <p className="text-sm text-gray-500">
                                {formatFileSize(file.size)} • {file.type}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(file.url, '_blank')}
                            >
                              <ExternalLink className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownloadFile(file.url, file.name)}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Case Modal */}
        <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Case - {editingCase.case_number || 'N/A'}</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleUpdateCase} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <Input
                  value={editingCase.title || ''}
                  onChange={(e) => setEditingCase({...editingCase, title: e.target.value})}
                  disabled={updating}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <Select 
                  value={editingCase.status || ''} 
                  onValueChange={(value) => setEditingCase({...editingCase, status: value})}
                  disabled={updating}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CASE_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.replace('_', ' ').toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (USD)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editingCase.amount || ''}
                  onChange={(e) => setEditingCase({...editingCase, amount: parseFloat(e.target.value) || 0})}
                  disabled={updating}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <Textarea
                  value={editingCase.description || ''}
                  onChange={(e) => setEditingCase({...editingCase, description: e.target.value})}
                  className="min-h-[100px]"
                  disabled={updating}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditModalOpen(false)}
                  disabled={updating}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updating}>
                  {updating ? 'Updating...' : 'Update Case'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
