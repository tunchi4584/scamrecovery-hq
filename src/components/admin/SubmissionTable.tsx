
import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Eye, Edit2, Mail, Trash2, Loader2 } from 'lucide-react';
import { SubmissionDetailsDialog } from './SubmissionDetailsDialog';
import { EditSubmissionDialog } from './EditSubmissionDialog';

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

interface SubmissionTableProps {
  submissions: SubmissionData[];
  onUpdate: (id: string, updates: { status?: string; internal_notes?: string }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onSendEmail: (email: string, submissionId: string, status: string, userName: string, caseTitle: string, amount: number, notes?: string) => Promise<void>;
}

export function SubmissionTable({ submissions, onUpdate, onDelete, onSendEmail }: SubmissionTableProps) {
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionData | null>(null);
  const [editingSubmission, setEditingSubmission] = useState<SubmissionData | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

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

  const handleUpdate = async (id: string, updates: { status?: string; internal_notes?: string }) => {
    setUpdating(id);
    try {
      await onUpdate(id, updates);
      setEditingSubmission(null);
    } finally {
      setUpdating(null);
    }
  };

  const handleSendEmail = async (submission: SubmissionData) => {
    try {
      await onSendEmail(
        submission.email,
        submission.id,
        submission.status,
        submission.name,
        submission.scam_type,
        submission.amount_lost,
        submission.internal_notes
      );
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this submission?')) {
      try {
        await onDelete(id);
      } catch (error) {
        // Error is handled in the hook
      }
    }
  };

  if (submissions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No submissions found.
      </div>
    );
  }

  return (
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
          {submissions.map((submission) => (
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
                        <SubmissionDetailsDialog submission={selectedSubmission} />
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
                        <EditSubmissionDialog
                          submission={editingSubmission}
                          onUpdate={handleUpdate}
                          onCancel={() => setEditingSubmission(null)}
                          isUpdating={updating === editingSubmission.id}
                        />
                      )}
                    </DialogContent>
                  </Dialog>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSendEmail(submission)}
                  >
                    <Mail className="h-4 w-4" />
                  </Button>

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(submission.id)}
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
  );
}
