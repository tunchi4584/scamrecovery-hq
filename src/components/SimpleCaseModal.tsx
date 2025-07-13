
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Plus } from 'lucide-react';

const SCAM_TYPES = [
  'Investment Scam',
  'Romance Scam', 
  'Phishing',
  'Identity Theft',
  'Cryptocurrency Scam',
  'Online Shopping Scam',
  'Tech Support Scam',
  'Other'
];

export function SimpleCaseModal() {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scamType: '',
    amount: ''
  });
  
  const { toast } = useToast();
  const { user, refreshUserData } = useAuth();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      scamType: '',
      amount: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast({
        title: "Authentication Error",
        description: "Please log in to create a case",
        variant: "destructive"
      });
      return;
    }

    if (!formData.title || !formData.description || !formData.scamType || !formData.amount) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    const amountValue = parseFloat(formData.amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('cases')
        .insert({
          user_id: user.id,
          title: formData.title,
          description: formData.description,
          scam_type: formData.scamType,
          amount: amountValue,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your case has been created successfully"
      });

      resetForm();
      setOpen(false);
      refreshUserData();

    } catch (error: any) {
      console.error('Case creation error:', error);
      toast({
        title: "Error",
        description: "Failed to create case. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create New Case
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Recovery Case</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Case Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Brief description of your case"
              disabled={submitting}
            />
          </div>

          <div>
            <Label htmlFor="scam-type">Scam Type</Label>
            <Select 
              value={formData.scamType} 
              onValueChange={(value) => handleInputChange('scamType', value)}
              disabled={submitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select scam type" />
              </SelectTrigger>
              <SelectContent>
                {SCAM_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="amount">Amount Lost (USD)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              placeholder="0.00"
              disabled={submitting}
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Provide details about what happened..."
              className="min-h-[100px]"
              disabled={submitting}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Case'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
