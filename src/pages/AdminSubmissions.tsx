
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Loader2, AlertTriangle, Eye, Edit2, Mail, Trash2, RefreshCw, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
  const { user, isAdmin, loading: authLoading } = useAuth();
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
  const [editStatus, setEditStatus] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  // Check authentication
  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate('/admin/login', { replace: true });
    }
  }, [user, isAdmin, authLoading, navigate]);

  // Fetch submissions
  const fetchSubmissions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching submissions...');
      
      const { data, error: fetchError } = await supabase
        .from('submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      console.log('Submissions fetched:', data?.length || 0);
      setSubmissions(data || []);
    } catch (err: any) {
      console.error('Error fetching submissions:', err);
      setError(err.message || 'Failed to fetch submissions');
      toast({
        title: "Error",
        description: "Failed to load submissions. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && isAdmin) {
      fetchSubmissions();
    }
  }, [user, isAdmin]);

  // Get unique scam types for filter
  const scamTypes = useMemo(() => {
    return [...new Set(submissions.map(sub => sub.scam_type))];
  }, [submissions]);

  // Filter submissions
  const filteredSubmissions = useMemo(() => {
    return submissions.filter(submission => {
      const matchesSearch = 
        submission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.scam_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || submission.status === statusFilter;
      const matchesScamType = scamTypeFilter === 'all' || submission.scam_type === scamTypeFilter;
      
      return matchesSearch && matchesStatus && matchesScamType;
    });
  }, [submissions, searchTerm, statusFilter, scamTypeFilter]);

  // Update submission
  const updateSubmission = async (submissionId: string, updates: { status?: string; internal_notes?: string }) => {
    setUpdating(true);
    try {
      console.log('Updating submission:', submissionId, updates);

      const { data: updatedSubmission, error: updateError } = await supabase
        .from('submissions')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', submissionId)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      // Update local state
      setSubmissions(prev => 
        prev.map(sub => 
          sub.id === submissionId ? updatedSubmission : sub
        )
      );

      // Handle case creation/update if status changed
      if (updates.status) {
        const submission = submissions.find(s => s.id === submissionId);
        if (submission) {
          try {
            // Check for existing case
            const { data: existingCase } = await supabase
              .from('cases')
              .select('*')
              .eq('submission_id', submission.id)
              .maybeSingle();

            if (existingCase) {
              // Update existing case
              await supabase
                .from('cases')
                .update({
                  status: updates.status,
                  amount: submission.amount_lost,
                  updated_at: new Date().toISOString()
                })
                .eq('id', existingCase.id);
            } else {
              // Create new case
              await supabase
                .from('cases')
                .insert({
                  user_id: submission.user_id,
                  title: `${submission.scam_type} Recovery Case`,
                  status: updates.status,
                  amount: submission.amount_lost,
                  submission_id: submission.id,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                });
            }
          } catch (err) {
            console.error('Error handling case update:', err);
            // Don't throw here - submission update was successful
          }
        }
      }

      toast({
        title: "Success",
        description: "Submission updated successfully",
      });

      setEditingSubmission(null);
    } catch (err: any) {
      console.error('Error updating submission:', err);
      toast({
        title: "Error",
        description: "Failed to update submission",
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  // Delete submission
  const deleteSubmission = async (submissionId: string) => {
    if (!confirm('Are you sure you want to delete this submission?')) {
      return;
    }

    try {
      const { error: deleteError } = await supabase
        .from('submissions')
        .delete()
        .eq('id', submissionId);

      if (deleteError) {
        throw deleteError;
      }

      setSubmissions(prev => prev.filter(sub => sub.id !== submissionId));
      
      toast({
        title: "Success",
        description: "Submission deleted successfully",
      });
    } catch (err: any) {
      console.error('Error deleting submission:', err);
      toast({
        title: "Error",
        description: "Failed to delete submission",
        variant: "destructive"
      });
    }
  };

  // Send email notification
  const sendEmailNotification = async (submission: SubmissionData) => {
    try {
      console.log('Sending email notification to:', submission.email);

      const { error: emailError } = await supabase.functions.invoke('send-admin-notification', {
        body: {
          type: 'submission_update',
          email: submission.email,
          message: `Your submission "${submission.scam_type}" has been updated to status: ${submission.status}. ${submission.internal_notes ? 'Additional notes: ' + submission.internal_notes : ''}`,
          userName: submission.name,
          caseTitle: submission.scam_type,
          amount: submission.amount_lost,
          status: submission.status
        }
      });

      if (emailError) {
        throw emailError;
      }

      toast({
        title: "Success",
        description: `Email notification sent to ${submission.email}`,
      });
    } catch (err: any) {
      console.error('Error sending email:', err);
      toast({
        title: "Error",
        description: "Failed to send email notification",
        variant: "destructive"
      });
    }
  };

  // Handle edit submission
  const handleEditSubmission = (submission: SubmissionData) => {
    setEditingSubmission(submission);
    setEditStatus(submission.status);
    setEditNotes(submission.internal_notes || '');
  };

  const handleSaveEdit = () => {
    if (!editingSubmission) return;
    
    updateSubmission(editingSubmission.id, {
      status: editStatus,
      internal_notes: editNotes
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (authLoading) {
    return (
      <AdminLayout title="Scam Submissions">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="text-lg">Loading...</span>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

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

  if (error) {
    return (
      <AdminLayout title="Scam Submissions">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center space-y-4">
            <AlertTriangle className="h-12 w-12 text-red-500" />
            <div className="text-center">
              <h3 className="text-lg font-semibold text-red-700">Error Loading Submissions</h3>
              <p className="text-red-600 mt-2">{error}</p>
              <Button onClick={fetchSubmissions} className="mt-4">
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
            
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search submissions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
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
                  {scamTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button onClick={fetchSubmissions} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredSubmissions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {submissions.length === 0 ? 'No submissions found.' : 'No submissions found matching your filters.'}
            </div>
          ) : (
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
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                          {submission.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        {new Date(submission.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          {/* View Details */}
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

                          {/* Edit */}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditSubmission(submission)}
                                disabled={updating}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Update Submission</DialogTitle>
                              </DialogHeader>
                              {editingSubmission && (
                                <div className="space-y-4">
                                  <div>
                                    <label className="text-sm font-medium mb-2 block">Status</label>
                                    <Select value={editStatus} onValueChange={setEditStatus}>
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
                                    <label className="text-sm font-medium mb-2 block">Internal Notes</label>
                                    <Textarea
                                      value={editNotes}
                                      onChange={(e) => setEditNotes(e.target.value)}
                                      placeholder="Add internal notes..."
                                      rows={3}
                                    />
                                  </div>
                                  
                                  <div className="flex justify-end space-x-2">
                                    <Button 
                                      variant="outline" 
                                      onClick={() => setEditingSubmission(null)}
                                      disabled={updating}
                                    >
                                      Cancel
                                    </Button>
                                    <Button onClick={handleSaveEdit} disabled={updating}>
                                      {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                      Save Changes
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>

                          {/* Send Email */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => sendEmailNotification(submission)}
                          >
                            <Mail className="h-4 w-4" />
                          </Button>

                          {/* Delete */}
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
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
