
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
import { Plus, DollarSign } from 'lucide-react';

export function CreateCaseModal() {
  const { user, refreshUserData } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    scam_type: '',
    evidence: ''
  });

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

      // First, ensure user has a balance record
      const { data: existingBalance, error: balanceCheckError } = await supabase
        .from('balances')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (balanceCheckError) {
        console.error('Error checking balance:', balanceCheckError);
      }

      // Create balance record if it doesn't exist
      if (!existingBalance) {
        console.log('Creating balance record for user');
        const { error: balanceCreateError } = await supabase
          .from('balances')
          .insert({
            user_id: user.id,
            amount_lost: 0,
            amount_recovered: 0,
            total_cases: 0,
            completed_cases: 0,
            pending_cases: 0
          });

        if (balanceCreateError) {
          console.error('Error creating balance record:', balanceCreateError);
        }
      }

      // Create the case
      const caseData = {
        user_id: user.id,
        title: formData.title.trim(),
        description: formData.description.trim(),
        amount: parseFloat(formData.amount) || 0,
        scam_type: formData.scam_type,
        evidence: formData.evidence.trim() || null,
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

      setOpen(false);
      
      // Refresh user data to show the new case
      setTimeout(() => {
        refreshUserData();
      }, 500);

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
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Case'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
