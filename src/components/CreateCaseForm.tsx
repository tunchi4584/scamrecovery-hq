
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

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

interface CreateCaseFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function CreateCaseForm({ onSuccess, onCancel }: CreateCaseFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scamType: '',
    amount: ''
  });
  const [loading, setLoading] = useState(false);
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

  const validateForm = () => {
    if (!formData.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a case title",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.description.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a description",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.scamType) {
      toast({
        title: "Validation Error",
        description: "Please select a scam type",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.amount || isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid amount",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
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

    setLoading(true);
    console.log('Starting case creation for user:', user.id);

    try {
      const caseData = {
        user_id: user.id,
        title: formData.title.trim(),
        description: formData.description.trim(),
        scam_type: formData.scamType,
        amount: parseFloat(formData.amount),
        status: 'pending'
      };

      console.log('Inserting case data:', caseData);

      const { data: newCase, error: caseError } = await supabase
        .from('cases')
        .insert(caseData)
        .select()
        .single();

      if (caseError) {
        console.error('Case creation error:', caseError);
        throw new Error(caseError.message || 'Failed to create case');
      }

      console.log('Case created successfully:', newCase);

      // Show success message
      toast({
        title: "Success!",
        description: `Recovery case "${formData.title}" has been created successfully`
      });

      // Reset form
      resetForm();

      // Refresh user data in background
      setTimeout(() => {
        refreshUserData().catch(console.error);
      }, 100);

      // Call success callback
      onSuccess();

    } catch (error: any) {
      console.error('Error creating case:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to create case. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    resetForm();
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Case Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Enter a descriptive title for your case"
          disabled={loading}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="scam-type">Scam Type *</Label>
        <Select 
          value={formData.scamType} 
          onValueChange={(value) => setFormData(prev => ({ ...prev, scamType: value }))} 
          disabled={loading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select the type of scam" />
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

      <div className="space-y-2">
        <Label htmlFor="amount">Amount Lost (USD) *</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          min="0"
          value={formData.amount}
          onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
          placeholder="0.00"
          disabled={loading}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Provide detailed information about the scam incident..."
          className="min-h-[120px]"
          disabled={loading}
          required
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loading ? 'Creating...' : 'Create Case'}
        </Button>
      </div>
    </form>
  );
}
