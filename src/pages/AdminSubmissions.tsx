
import { useEffect, useState, useCallback } from 'react';
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
import { Search, Edit2, Trash2, Eye, Mail, Loader2, AlertTriangle, RefreshCw } from 'lucide-react';

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
  const { isAdmin, user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<SubmissionData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [scamTypeFilter, setScamTypeFilter] = useState<string>('all');
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionData | null>(null);
  const [editingSubmission, setEditingSubmission] = useState<SubmissionData | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  const fetchSubmissions = useCallback(async () => {
    if (!user || !isAdmin) {
      console.log('User not authenticated or not admin, skipping fetch');
      return;
    }

    try {
      console.log('Fetching submissions...');
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching submissions:', error);
        setError(`Failed to fetch submissions: ${error.message}`);
        toast({
          title: "Error",
          description: "Failed to fetch submissions. Please try again.",
          variant: "destructive"
        });
        return;
      }
      
      console.log('Submissions fetched successfully:', data?.length || 0);
      setSubmissions(data || []);
    } catch (error) {
      console.error('Exception in fetchSubmissions:', error);
      setError('An unexpected error occurred while fetching submissions');
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user, isAdmin, toast]);

  // Check authentication and redirect if needed
  useEffect(() => {
    if (authLoading) {
      console.log('Auth still loading...');
      return;
    }

    setAuthChecked(true);

    if (!user) {
      console.log('No user found, redirecting to admin login');
      navigate('/admin/login', { replace: true });
      return;
    }

    if (!isAdmin) {
      console.log('User is not admin, redirecting to admin login');
      navigate('/admin/login', { replace: true });
      return;
    }

    console.log('User is authenticated admin, fetching submissions');
  }, [authLoading, user, isAdmin, navigate]);

  // Fetch submissions when auth is confirmed
  useEffect(() => {
    if (authChecked && user && isAdmin && !authLoading) {
      fetchSubmissions();
    }
  }, [authChecked, user, isAdmin, authLoading, fetchSubmissions]);

  const updateSubmissionStatus = async (submissionId: string, newStatus: string, internalNotes?: string) => {
    try {
      setUpdating(submissionId);
      console.log('Updating submission:', submissionId, 'to status:', newStatus);

      const submission = submissions.find(sub => sub.id === submissionId);
      if (!submission) {
        throw new Error('Submission not found');
      }

      // Update submission in database
      const { data: updatedSubmission, error: submissionError } = await supabase
        .from('submissions')
        .update({ 
          status: newStatus, 
          internal_notes: internalNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', submissionId)
        .select()
        .single();

      if (submissionError) {
        console.error('Submission update error:', submissionError);
        throw submissionError;
      }

      console.log('Submission updated successfully');

      // Update or create related case
      const { data: existingCase } = await supabase
        .from('cases')
        .select('*')
        .eq('submission_id', submissionId)
        .maybeSingle();

      if (existingCase) {
        console.log('Updating existing case:', existingCase.id);
        const { error: caseError } = await supabase
          .from('cases')
          .update({
            status: newStatus,
            amount: submission.amount_lost,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingCase.id);

        if (caseError) {
          console.error('Case update error:', caseError);
        } else {
          console.log('Case updated successfully');
        }
      } else {
        console.log('Creating new case for submission');
        const { error: caseError } = await supabase
          .from('cases')
          .insert({
            user_id: submission.user_id,
            title: `${submission.scam_type} Recovery Case`,
            status: newStatus,
            amount: submission.amount_lost,
            submission_id: submissionId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (caseError) {
          console.error('Case creation error:', caseError);
        } else {
          console.log('Case created successfully');
        }
      }

      // Update local state
      setSubmissions(prevSubmissions => 
        prevSubmissions.map(sub => 
          sub.id === submissionId ? updatedSubmission : sub
        )
      );

      // Send email notification
      try {
        console.log('Sending email notification to:', submission.email);
        await sendEmailToUser(
          submission.email, 
          submissionId, 
          newStatus, 
          submission.name, 
          submission.scam_type, 
          submission.amount_lost, 
          internalNotes
        );
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        toast({
          title: "Warning",
          description: "Status updated but email notification failed",
          variant: "destructive"
        });
      }

      toast({
        title: "Success",
        description: "Submission updated successfully",
      });
      
      setEditingSubmission(null);
      
    } catch (error) {
      console.error('Error updating submission:', error);
      toast({
        title: "Error",
        description: "Failed to update submission. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUpdating(null);
    }
  };

  const sendEmailToUser = async (
    email: string, 
    submissionId: string, 
    newStatus?: string, 
    userName?: string,
    caseTitle?: string,
    amount?: number,
    notes?: string
  ) => {
    try {
      const submission = submissions.find(sub => sub.id === submissionId);
      if (!submission) return;

      const statusToUse = newStatus || submission.status;
      
      console.log('Sending email notification:', {
        email,
        submissionId,
        status: statusToUse,
        userName,
        caseTitle,
        amount
      });

      const { data, error } = await supabase.functions.invoke('send-admin-notification', {
        body: {
          type: 'submission_update',
          email: email,
          message: `Your submission "${caseTitle || submission.scam_type}" has been updated to status: ${statusToUse}. ${notes ? 'Additional notes: ' + notes : ''}`,
          userName: userName || submission.name,
          caseTitle: caseTitle || submission.scam_type,
          amount: amount || submission.amount_lost,
          status: statusToUse
        }
      });

      if (error) {
        console.error('Email function error:', error);
        throw error;
      }

      console.log('Email sent successfully:', data);
      
      toast({
        title: "Success",
        description: `Email notification sent to ${email}`,
      });
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
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

  // Show loading while auth is loading
  if (authLoading || !authChecked) {
    return (
      <AdminLayout title="Scam Submissions">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="text-lg">Authenticating...</span>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Show loading while data is loading
  if (loading) {
    return (
      <AdminLayout title="Scam Submissions">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="text-lg">Loading submissions...</span>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Show error state
  if (error) {
    return (
      <AdminLayout title="Scam Submissions">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center space-y-4">
            <AlertTriangle className="h-12 w-12 text-red-500" />
            <div className="text-center">
              <h3 className="text-lg font-semibold text-red-700">Error Loading Submissions</h3>
              <p className="text-red-600 mt-2">{error}</p>
              <Button 
                onClick={fetchSubmissions} 
                className="mt-4"
                variant="outline"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
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
              <Button onClick={fetchSubmissions} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
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
                              disabled={updating === submission.id}
                            >
                              {updating === submission.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Edit2 className="h-4 w-4" />
                              )}
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
                                isUpdating={updating === editingSubmission.id}
                              />
                            )}
                          </DialogContent>
                        </Dialog>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => sendEmailToUser(
                            submission.email, 
                            submission.id, 
                            submission.status,
                            submission.name,
                            submission.scam_type,
                            submission.amount_lost,
                            submission.internal_notes
                          )}
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

          {filteredSubmissions.length === 0 && !loading && (
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
  isUpdating?: boolean;
}

function EditSubmissionForm({ submission, onUpdate, onCancel, isUpdating }: EditSubmissionFormProps) {
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
        <Select value={status} onValueChange={setStatus} disabled={isUpdating}>
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
          disabled={isUpdating}
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isUpdating}>
          Cancel
        </Button>
        <Button type="submit" disabled={isUpdating}>
          {isUpdating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            'Update Submission'
          )}
        </Button>
      </div>
    </form>
  );
}
