
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

export function useSubmissions() {
  const [submissions, setSubmissions] = useState<SubmissionData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchSubmissions = useCallback(async () => {
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
  }, [toast]);

  const updateSubmission = useCallback(async (
    submissionId: string, 
    updates: { status?: string; internal_notes?: string }
  ): Promise<void> => {
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
          await handleCaseUpdate(submission, updates.status);
        }
      }

      toast({
        title: "Success",
        description: "Submission updated successfully",
      });
    } catch (err: any) {
      console.error('Error updating submission:', err);
      toast({
        title: "Error",
        description: "Failed to update submission",
        variant: "destructive"
      });
      throw err;
    }
  }, [submissions, toast]);

  const handleCaseUpdate = useCallback(async (submission: SubmissionData, newStatus: string) => {
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
            status: newStatus,
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
            status: newStatus,
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
  }, []);

  const deleteSubmission = useCallback(async (submissionId: string): Promise<void> => {
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
      throw err;
    }
  }, [toast]);

  const sendEmailNotification = useCallback(async (
    email: string,
    submissionId: string,
    status: string,
    userName: string,
    caseTitle: string,
    amount: number,
    notes?: string
  ): Promise<void> => {
    try {
      console.log('Sending email notification to:', email);

      const { error: emailError } = await supabase.functions.invoke('send-admin-notification', {
        body: {
          type: 'submission_update',
          email: email,
          message: `Your submission "${caseTitle}" has been updated to status: ${status}. ${notes ? 'Additional notes: ' + notes : ''}`,
          userName: userName,
          caseTitle: caseTitle,
          amount: amount,
          status: status
        }
      });

      if (emailError) {
        throw emailError;
      }

      toast({
        title: "Success",
        description: `Email notification sent to ${email}`,
      });
    } catch (err: any) {
      console.error('Error sending email:', err);
      toast({
        title: "Error",
        description: "Failed to send email notification",
        variant: "destructive"
      });
      throw err;
    }
  }, [toast]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  return {
    submissions,
    loading,
    error,
    fetchSubmissions,
    updateSubmission,
    deleteSubmission,
    sendEmailNotification
  };
}
