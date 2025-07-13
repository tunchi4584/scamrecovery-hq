
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
    if (!user) return;

    setLoading(true);
    try {
      // Use the atomic function to create case with auto-generated case number
      const { data, error } = await supabase.rpc('create_case_atomic', {
        p_user_id: user.id,
        p_title: formData.title,
        p_description: formData.description,
        p_scam_type: formData.scam_type,
        p_amount: parseFloat(formData.amount) || 0
      });

      if (error || !data?.[0]?.success) {
        throw new Error(data?.[0]?.error_message || 'Failed to create case');
      }

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
      refreshUserData();
    } catch (error) {
      console.error('Error creating case:', error);
      toast({
        title: "Error",
        description: "Failed to create case. Please try again.",
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
            <Select value={formData.scam_type} onValueChange={(value) => setFormData(prev => ({ ...prev, scam_type: value }))}>
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
