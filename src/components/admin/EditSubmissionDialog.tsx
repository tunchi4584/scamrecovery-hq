
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

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

interface EditSubmissionDialogProps {
  submission: SubmissionData;
  onUpdate: (id: string, updates: { status?: string; internal_notes?: string }) => Promise<void>;
  onCancel: () => void;
  isUpdating?: boolean;
}

export function EditSubmissionDialog({ submission, onUpdate, onCancel, isUpdating }: EditSubmissionDialogProps) {
  const [status, setStatus] = useState(submission.status);
  const [internalNotes, setInternalNotes] = useState(submission.internal_notes || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdate(submission.id, { status, internal_notes: internalNotes });
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
