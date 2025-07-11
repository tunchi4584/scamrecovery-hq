import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Search, Edit2, Trash2, Eye, Mail } from 'lucide-react';

interface SubmissionData {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone?: string;
  scam_type: string;
  amount_lost: number;
  description: string;
  evidence?: string;
  status: string;
  internal_notes?: string;
  created_at: string;
  updated_at: string;
}

export default function AdminSubmissions() {
  const { isAdmin, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<SubmissionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [scamTypeFilter, setScamTypeFilter] = useState<string>('all');
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionData | null>(null);
  const [editingSubmission, setEditingSubmission] = useState<SubmissionData | null>(null);

  useEffect(() => {
    if (!user || !isAdmin) {
      navigate('/admin/login');
      return;
    }
    fetchSubmissions();
  }, [user, isAdmin, navigate]);

  const fetchSubmissions = async () => {
    try {
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
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSubmissionStatus = async (submissionId: string, status: string, internalNotes?: string) => {
    try {
      // Update submission
      const { data: submissionData, error: submissionError } = await supabase
        .from('submissions')
        .update({ 
          status, 
          internal_notes: internalNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', submissionId)
        .select()
        .single();

      if (submissionError) throw submissionError;

      // Also update or create related case
      const submission = submissions.find(sub => sub.id === submissionId);
      if (submission) {
        // Check if case exists
        const { data: existingCase } = await supabase
          .from('cases')
          .select('*')
          .eq('submission_id', submissionId)
          .single();

        if (existingCase) {
          // Update existing case
          const { error: caseError } = await supabase
            .from('cases')
            .update({
              status,
              amount: submission.amount_lost,
              updated_at: new Date().toISOString()
            })
            .eq('submission_id', submissionId);

          if (caseError) throw caseError;
        } else {
          // Create new case
          const { error: caseError } = await supabase
            .from('cases')
            .insert({
              user_id: submission.user_id,
              title: `${submission.scam_type} Recovery Case`,
              status,
              amount: submission.amount_lost,
              submission_id: submissionId
            });

          if (caseError) throw caseError;
        }
      }

      // Update local state
      setSubmissions(submissions.map(sub => 
        sub.id === submissionId ? submissionData : sub
      ));

      toast({
        title: "Success",
        description: "Submission and case updated successfully",
      });
      setEditingSubmission(null);

      // Send email notification to user
      await sendEmailToUser(submission?.email || '', submissionId, status);
      
    } catch (error) {
      console.error('Error updating submission:', error);
      toast({
        title: "Error",
        description: "Failed to update submission",
        variant: "destructive"
      });
    }
  };

  const deleteSubmission = async (submissionId: string) => {
    if (!confirm('Are you sure you want to delete this submission?')) return;

    try {
      const { error } = await supabase
        .from('submissions')
        .delete()
        .eq('id', submissionId);

      if (error) throw error;

      setSubmissions(submissions.filter(sub => sub.id !== submissionId));
      toast({
        title: "Success",
        description: "Submission deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting submission:', error);
      toast({
        title: "Error",
        description: "Failed to delete submission",
        variant: "destructive"
      });
    }
  };

  const sendEmailToUser = async (email: string, submissionId: string, newStatus?: string) => {
    try {
      const submission = submissions.find(sub => sub.id === submissionId);
      if (!submission) return;

      const statusToUse = newStatus || submission.status;
      
      console.log('Sending email notification:', {
        email,
        submissionId,
        status: statusToUse,
        caseTitle: submission.scam_type,
        amount: submission.amount_lost
      });

      const { error } = await supabase.functions.invoke('send-admin-notification', {
        body: {
          type: 'submission_update',
          email: email,
          message: `Your submission "${submission.scam_type}" has been updated to status: ${statusToUse}. ${submission.internal_notes ? 'Additional notes: ' + submission.internal_notes : ''}`,
          userName: submission.name,
          caseTitle: submission.scam_type,
          amount: submission.amount_lost,
          status: statusToUse
        }
      });

      if (error) {
        console.error('Email function error:', error);
        throw error;
      }

      toast({
        title: "Success",
        description: `Email notification sent to ${email}`,
      });
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: "Warning",
        description: "Update successful but email notification failed",
        variant: "destructive"
      });
    }
  };

  const getUniqueScamTypes = () => {
    const types = [...new Set(submissions.map(sub => sub.scam_type))];
    return types;
  };

  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch = 
      submission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.scam_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || submission.status === statusFilter;
    const matchesScamType = scamTypeFilter === 'all' || submission.scam_type === scamTypeFilter;
    
    return matchesSearch && matchesStatus && matchesScamType;
  });

  if (loading) {
    return (
      <AdminLayout title="Scam Submissions">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Scam Submissions">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Submissions ({submissions.length})</CardTitle>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search submissions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={scamTypeFilter} onValueChange={setScamTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Scam Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {getUniqueScamTypes().map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
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
                  <TableHead>User</TableHead>
                  <TableHead>Scam Type</TableHead>
                  <TableHead>Amount Lost</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubmissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{submission.name}</div>
                        <div className="text-sm text-gray-500">{submission.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>{submission.scam_type}</TableCell>
                    <TableCell>${submission.amount_lost.toLocaleString()}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          submission.status === 'resolved'
                            ? 'bg-green-100 text-green-800'
                            : submission.status === 'in-progress'
                            ? 'bg-blue-100 text-blue-800'
                            : submission.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {submission.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(submission.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedSubmission(submission)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Submission Details</DialogTitle>
                            </DialogHeader>
                            {selectedSubmission && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium">Name:</label>
                                    <p>{selectedSubmission.name}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Email:</label>
                                    <p>{selectedSubmission.email}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Phone:</label>
                                    <p>{selectedSubmission.phone || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Amount Lost:</label>
                                    <p>${selectedSubmission.amount_lost.toLocaleString()}</p>
                                  </div>
                                </div>
                                
                                <div>
                                  <label className="text-sm font-medium">Description:</label>
                                  <p className="mt-1 p-2 bg-gray-50 rounded">{selectedSubmission.description}</p>
                                </div>
                                {selectedSubmission.evidence && (
                                  <div>
                                    <label className="text-sm font-medium">Evidence:</label>
                                    <p className="mt-1 p-2 bg-gray-50 rounded">{selectedSubmission.evidence}</p>
                                  </div>
                                )}
                                {selectedSubmission.internal_notes && (
                                  <div>
                                    <label className="text-sm font-medium">Internal Notes:</label>
                                    <p className="mt-1 p-2 bg-blue-50 rounded">{selectedSubmission.internal_notes}</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingSubmission(submission)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Update Submission</DialogTitle>
                            </DialogHeader>
                            {editingSubmission && (
                              <EditSubmissionForm
                                submission={editingSubmission}
                                onUpdate={updateSubmissionStatus}
                                onCancel={() => setEditingSubmission(null)}
                              />
                            )}
                          </DialogContent>
                        </Dialog>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => sendEmailToUser(submission.email, submission.id)}
                        >
                          <Mail className="h-4 w-4" />
                        </Button>

                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteSubmission(submission.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredSubmissions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {searchTerm || statusFilter !== 'all' || scamTypeFilter !== 'all' 
                ? 'No submissions found matching your filters.' 
                : 'No submissions found.'}
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}

interface EditSubmissionFormProps {
  submission: SubmissionData;
  onUpdate: (id: string, status: string, notes?: string) => void;
  onCancel: () => void;
}

function EditSubmissionForm({ submission, onUpdate, onCancel }: EditSubmissionFormProps) {
  const [status, setStatus] = useState(submission.status);
  const [internalNotes, setInternalNotes] = useState(submission.internal_notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(submission.id, status, internalNotes);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Status</label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Internal Notes</label>
        <Textarea
          value={internalNotes}
          onChange={(e) => setInternalNotes(e.target.value)}
          placeholder="Add internal notes..."
          rows={4}
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Update Submission
        </Button>
      </div>
    </form>
  );
}
