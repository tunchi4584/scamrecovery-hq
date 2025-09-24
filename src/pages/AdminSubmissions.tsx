import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Eye, Search, Filter, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Submission {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string | null;
  scam_type: string;
  description: string;
  evidence: string | null;
  status: string;
  internal_notes: string | null;
  amount_lost: number;
  created_at: string;
  updated_at: string;
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  reviewing: 'bg-blue-100 text-blue-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  completed: 'bg-gray-100 text-gray-800',
};

export default function AdminSubmissions() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const { toast } = useToast();

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch submissions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch = 
      submission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.scam_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || submission.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const updateSubmissionStatus = async (submissionId: string, newStatus: string, notes?: string) => {
    try {
      setUpdatingStatus(true);
      const updateData: any = { 
        status: newStatus,
        updated_at: new Date().toISOString(),
      };
      
      if (notes) {
        updateData.internal_notes = notes;
      }

      const { error } = await supabase
        .from('submissions')
        .update(updateData)
        .eq('id', submissionId);

      if (error) throw error;

      // Update local state
      setSubmissions(prev => 
        prev.map(sub => 
          sub.id === submissionId 
            ? { ...sub, status: newStatus, internal_notes: notes || sub.internal_notes }
            : sub
        )
      );

      toast({
        title: "Success",
        description: "Submission status updated successfully",
      });

      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error updating submission:', error);
      toast({
        title: "Error",
        description: "Failed to update submission status",
        variant: "destructive",
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <AdminLayout title="Case Submissions">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{submissions.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {submissions.filter(s => s.status === 'pending').length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {submissions.filter(s => s.status === 'approved').length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Amount Lost</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(submissions.reduce((sum, s) => sum + s.amount_lost, 0))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search submissions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="reviewing">Reviewing</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              
              <Button onClick={fetchSubmissions} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Submissions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Submissions ({filteredSubmissions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin" />
              </div>
            ) : filteredSubmissions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No submissions found
              </div>  
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Name & Email</TableHead>
                      <TableHead>Scam Type</TableHead>
                      <TableHead>Amount Lost</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubmissions.map((submission) => (
                      <TableRow key={submission.id}>
                        <TableCell>
                          <div className="text-sm">
                            {format(new Date(submission.created_at), 'MMM dd, yyyy')}
                            <div className="text-xs text-gray-500">
                              {format(new Date(submission.created_at), 'hh:mm a')}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{submission.name}</div>
                            <div className="text-sm text-gray-500">{submission.email}</div>
                            {submission.phone && (
                              <div className="text-xs text-gray-400">{submission.phone}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{submission.scam_type}</span>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{formatCurrency(submission.amount_lost)}</span>
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[submission.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}>
                            {submission.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Dialog open={isDialogOpen && selectedSubmission?.id === submission.id} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedSubmission(submission)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                              {selectedSubmission && (
                                <div>
                                  <DialogHeader>
                                    <DialogTitle>Submission Details</DialogTitle>
                                  </DialogHeader>
                                  
                                  <div className="space-y-6 mt-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <label className="text-sm font-medium text-gray-700">Name</label>
                                        <p className="text-sm text-gray-900">{selectedSubmission.name}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium text-gray-700">Email</label>
                                        <p className="text-sm text-gray-900">{selectedSubmission.email}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium text-gray-700">Phone</label>
                                        <p className="text-sm text-gray-900">{selectedSubmission.phone || 'Not provided'}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium text-gray-700">Amount Lost</label>
                                        <p className="text-sm text-gray-900 font-medium">{formatCurrency(selectedSubmission.amount_lost)}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium text-gray-700">Scam Type</label>
                                        <p className="text-sm text-gray-900">{selectedSubmission.scam_type}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium text-gray-700">Current Status</label>
                                        <Badge className={statusColors[selectedSubmission.status as keyof typeof statusColors]}>
                                          {selectedSubmission.status}
                                        </Badge>
                                      </div>
                                    </div>
                                    
                                    <div>
                                      <label className="text-sm font-medium text-gray-700">Description</label>
                                      <p className="text-sm text-gray-900 mt-1 p-3 bg-gray-50 rounded-md">
                                        {selectedSubmission.description}
                                      </p>
                                    </div>
                                    
                                    {selectedSubmission.evidence && (
                                      <div>
                                        <label className="text-sm font-medium text-gray-700">Evidence</label>
                                        <p className="text-sm text-gray-900 mt-1 p-3 bg-gray-50 rounded-md">
                                          {selectedSubmission.evidence}
                                        </p>
                                      </div>
                                    )}
                                    
                                    {selectedSubmission.internal_notes && (
                                      <div>
                                        <label className="text-sm font-medium text-gray-700">Internal Notes</label>
                                        <p className="text-sm text-gray-900 mt-1 p-3 bg-blue-50 rounded-md">
                                          {selectedSubmission.internal_notes}
                                        </p>
                                      </div>
                                    )}
                                    
                                    <div className="border-t pt-4">
                                      <label className="text-sm font-medium text-gray-700">Update Status</label>
                                      <div className="flex gap-2 mt-2">
                                        <Select 
                                          defaultValue={selectedSubmission.status}
                                          onValueChange={(newStatus) => {
                                            updateSubmissionStatus(selectedSubmission.id, newStatus);
                                          }}
                                          disabled={updatingStatus}
                                        >
                                          <SelectTrigger className="w-48">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="reviewing">Reviewing</SelectItem>
                                            <SelectItem value="approved">Approved</SelectItem>
                                            <SelectItem value="rejected">Rejected</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </div>
                                    
                                    <div className="text-xs text-gray-500 border-t pt-4">
                                      <p>Submitted: {format(new Date(selectedSubmission.created_at), 'PPpp')}</p>
                                      <p>Last Updated: {format(new Date(selectedSubmission.updated_at), 'PPpp')}</p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}