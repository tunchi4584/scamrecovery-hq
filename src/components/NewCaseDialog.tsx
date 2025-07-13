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

export function NewCaseDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scamType, setScamType] = useState('');
  const [amount, setAmount] = useState('');
  
  const { toast } = useToast();
  const { user, refreshUserData } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "Please log in to create a case",
        variant: "destructive"
      });
      return;
    }

    if (!title || !description || !scamType || !amount) {
      toast({
        title: "Error",
        description: "All fields are required",
        variant: "destructive"
      });
      return;
    }

    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    console.log('Starting atomic case creation with data:', {
      user_id: user.id,
      title: title.trim(),
      description: description.trim() || null,
      scam_type: scamType,
      amount: amountValue
    });
    
    try {
      // Use the atomic database function that handles both case creation and balance updates
      const { data, error } = await supabase.rpc('create_case_atomic', {
        p_user_id: user.id,
        p_title: title.trim(),
        p_description: description.trim() || null,
        p_scam_type: scamType,
        p_amount: amountValue
      });

      if (error) {
        console.error('Atomic case creation error:', error);
        throw new Error(error.message || 'Failed to create case');
      }

      const result = data?.[0];
      if (!result?.success) {
        console.error('Case creation failed:', result?.error_message);
        throw new Error(result?.error_message || 'Case creation failed');
      }

      console.log('Case created successfully:', result);

      toast({
        title: "Success",
        description: `Case ${result.case_number} created successfully!`
      });

      // Reset form
      setTitle('');
      setDescription('');
      setScamType('');
      setAmount('');
      setOpen(false);
      
      // Refresh data
      await refreshUserData();
      console.log('User data refreshed successfully');

    } catch (error: any) {
      console.error('Error creating case:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create case. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      console.log('Case creation process completed');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Case
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Case</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief case title"
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="scam-type">Scam Type</Label>
            <Select value={scamType} onValueChange={setScamType} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
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
            <Label htmlFor="amount">Amount Lost ($)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what happened..."
              rows={3}
              disabled={loading}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
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