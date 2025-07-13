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

export function CreateCaseForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scamType: '',
    amount: ''
  });
  
  const { toast } = useToast();
  const { user, refreshUserData } = useAuth();

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      scamType: '',
      amount: ''
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const { title, description, scamType, amount } = formData;
    
    if (!title.trim()) {
      toast({
        title: "Validation Error",
        description: "Case title is required",
        variant: "destructive"
      });
      return false;
    }

    if (!description.trim()) {
      toast({
        title: "Validation Error", 
        description: "Case description is required",
        variant: "destructive"
      });
      return false;
    }

    if (!scamType) {
      toast({
        title: "Validation Error",
        description: "Please select a scam type",
        variant: "destructive"
      });
      return false;
    }

    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid amount greater than 0",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to create a case",
        variant: "destructive"
      });
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log('Creating case for user:', user.id);
      
      const caseData = {
        user_id: user.id,
        title: formData.title.trim(),
        description: formData.description.trim(),
        scam_type: formData.scamType,
        amount: parseFloat(formData.amount),
        status: 'pending'
      };

      console.log('Case data:', caseData);

      const { data, error } = await supabase
        .from('cases')
        .insert(caseData)
        .select('*')
        .single();

      if (error) {
        console.error('Database insert error:', error);
        throw new Error(error.message);
      }

      console.log('Case created successfully:', data);

      toast({
        title: "Success",
        description: "Your case has been created successfully"
      });

      resetForm();
      setIsOpen(false);
      
      // Refresh user data to show the new case
      console.log('Refreshing user data...');
      await refreshUserData();
      console.log('User data refresh completed');

    } catch (error: any) {
      console.error('Case creation error:', error);
      toast({
        title: "Error Creating Case",
        description: error.message || "Failed to create case. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create New Case
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Recovery Case</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="case-title">Case Title *</Label>
            <Input
              id="case-title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Brief title for your case"
              disabled={isSubmitting}
              required
            />
          </div>

          <div>
            <Label htmlFor="case-type">Scam Type *</Label>
            <Select 
              value={formData.scamType} 
              onValueChange={(value) => handleChange('scamType', value)}
              disabled={isSubmitting}
              required
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
            <Label htmlFor="case-amount">Amount Lost (USD) *</Label>
            <Input
              id="case-amount"
              type="number"
              step="0.01"
              min="0.01"
              value={formData.amount}
              onChange={(e) => handleChange('amount', e.target.value)}
              placeholder="0.00"
              disabled={isSubmitting}
              required
            />
          </div>

          <div>
            <Label htmlFor="case-description">Description *</Label>
            <Textarea
              id="case-description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Describe what happened in detail..."
              rows={4}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Case'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}