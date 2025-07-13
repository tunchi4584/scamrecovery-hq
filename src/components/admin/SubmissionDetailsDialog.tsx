
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

interface SubmissionDetailsDialogProps {
  submission: SubmissionData;
}

export function SubmissionDetailsDialog({ submission }: SubmissionDetailsDialogProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Name:</label>
          <p>{submission.name}</p>
        </div>
        <div>
          <label className="text-sm font-medium">Email:</label>
          <p>{submission.email}</p>
        </div>
        <div>
          <label className="text-sm font-medium">Phone:</label>
          <p>{submission.phone || 'N/A'}</p>
        </div>
        <div>
          <label className="text-sm font-medium">Amount Lost:</label>
          <p>${submission.amount_lost.toLocaleString()}</p>
        </div>
      </div>
      
      <div>
        <label className="text-sm font-medium">Description:</label>
        <p className="mt-1 p-2 bg-gray-50 rounded">{submission.description}</p>
      </div>
      
      {submission.evidence && (
        <div>
          <label className="text-sm font-medium">Evidence:</label>
          <p className="mt-1 p-2 bg-gray-50 rounded">{submission.evidence}</p>
        </div>
      )}
      
      {submission.internal_notes && (
        <div>
          <label className="text-sm font-medium">Internal Notes:</label>
          <p className="mt-1 p-2 bg-blue-50 rounded">{submission.internal_notes}</p>
        </div>
      )}
    </div>
  );
}
