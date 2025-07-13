
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
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scamType, setScamType] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user, refreshUserData } = useAuth();

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

    if (!title.trim() || !description.trim() || !scamType || !amount) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount < 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    console.log('Creating case for user:', user.id);

    try {
      // Create the case directly - the database trigger will handle balance updates
      const caseData = {
        user_id: user.id,
        title: title.trim(),
        description: description.trim(),
        scam_type: scamType,
        amount: parsedAmount,
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
        throw caseError;
      }

      console.log('Case created successfully:', newCase);

      // Refresh user data to update the UI
      await refreshUserData();

      toast({
        title: "Case Created",
        description: `Recovery case "${title}" has been created successfully`
      });

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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Case Title *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter a descriptive title for your case"
          disabled={loading}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="scam-type">Scam Type *</Label>
        <Select value={scamType} onValueChange={setScamType} disabled={loading}>
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
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          disabled={loading}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
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
          onClick={onCancel}
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
