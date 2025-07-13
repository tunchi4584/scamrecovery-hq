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
    console.log('Starting case creation...');
    
    try {
      // Step 1: Insert the case
      const { data: caseData, error: caseError } = await supabase
        .from('cases')
        .insert({
          user_id: user.id,
          title: title.trim(),
          description: description.trim(),
          scam_type: scamType,
          amount: amountValue,
          status: 'pending'
        })
        .select('*')
        .single();

      if (caseError) {
        console.error('Case insert error:', caseError);
        throw caseError;
      }

      console.log('Case created:', caseData);

      // Step 2: Update balance stats manually (no triggers)
      const { data: existingBalance } = await supabase
        .from('balances')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (existingBalance) {
        const { error: updateError } = await supabase
          .from('balances')
          .update({
            amount_lost: (existingBalance.amount_lost || 0) + amountValue,
            total_cases: (existingBalance.total_cases || 0) + 1,
            pending_cases: (existingBalance.pending_cases || 0) + 1,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);

        if (updateError) {
          console.error('Balance update error:', updateError);
        }
      } else {
        const { error: insertError } = await supabase
          .from('balances')
          .insert({
            user_id: user.id,
            amount_lost: amountValue,
            amount_recovered: 0,
            total_cases: 1,
            pending_cases: 1,
            completed_cases: 0
          });

        if (insertError) {
          console.error('Balance insert error:', insertError);
        }
      }

      console.log('Balance updated successfully');

      toast({
        title: "Success",
        description: "Case created successfully"
      });

      // Reset form
      setTitle('');
      setDescription('');
      setScamType('');
      setAmount('');
      setOpen(false);
      
      // Refresh data
      await refreshUserData();
      console.log('Data refreshed');

    } catch (error: any) {
      console.error('Error creating case:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create case",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      console.log('Case creation completed');
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