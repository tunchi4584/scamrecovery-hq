import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, DollarSign, Info, Mail, MessageCircle, Phone, Loader2 } from 'lucide-react';

interface CreateCaseModalProps {
  onCaseCreated?: () => void;
}

export function CreateCaseModal({ onCaseCreated }: CreateCaseModalProps) {
  const { user, refreshUserData } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    currency: 'USD',
    scam_type: '',
    incident_date: ''
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
    'Business Email Compromise',
    'Other'
  ];

  const currencies = [
    { value: 'USD', label: '$ USD - US Dollar' },
    { value: 'EUR', label: '€ EUR - Euro' },
    { value: 'GBP', label: '£ GBP - British Pound' },
    { value: 'CAD', label: '$ CAD - Canadian Dollar' },
    { value: 'AUD', label: '$ AUD - Australian Dollar' },
    { value: 'JPY', label: '¥ JPY - Japanese Yen' },
    { value: 'CHF', label: 'CHF - Swiss Franc' },
    { value: 'BTC', label: '₿ BTC - Bitcoin' },
    { value: 'ETH', label: 'Ξ ETH - Ethereum' },
    { value: 'USDT', label: '₮ USDT - Tether' },
    { value: 'BNB', label: 'BNB - Binance Coin' },
    { value: 'XRP', label: 'XRP - Ripple' },
    { value: 'ADA', label: 'ADA - Cardano' },
    { value: 'DOGE', label: 'DOGE - Dogecoin' },
    { value: 'LTC', label: 'LTC - Litecoin' },
    { value: 'OTHER', label: 'Other Currency' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to create a case.",
        variant: "destructive"
      });
      return;
    }

    // Validate required fields
    if (!formData.title.trim() || !formData.description.trim() || !formData.amount || !formData.scam_type) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than 0.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      // Convert date from MM/DD/YYYY to YYYY-MM-DD if provided
      let formattedDate = null;
      if (formData.incident_date) {
        const dateParts = formData.incident_date.split('/');
        if (dateParts.length === 3) {
          const [month, day, year] = dateParts;
          formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
      }

      // Use the reliable create_case_simple function
      const { data: result, error: functionError } = await supabase.rpc('create_case_simple', {
        p_user_id: user.id,
        p_title: formData.title.trim(),
        p_description: formData.description.trim(),
        p_scam_type: formData.scam_type,
        p_amount: amount,
        p_currency: formData.currency,
        p_incident_date: formattedDate
      });

      if (functionError) {
        console.error('Function call error:', functionError);
        throw new Error(functionError.message || 'Failed to create case');
      }

      // Parse the JSON result properly
      const parsedResult = result as { success: boolean; case_number?: string; case_id?: string; error?: string };
      
      if (!parsedResult || !parsedResult.success) {
        throw new Error(parsedResult?.error || 'Failed to create case');
      }

      toast({
        title: "Success!",
        description: `Your case has been created successfully. Case Number: ${parsedResult.case_number}`,
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        amount: '',
        currency: 'USD',
        scam_type: '',
        incident_date: ''
      });

      setOpen(false);
      
      // Refresh user data and trigger parent callback
      await refreshUserData();
      onCaseCreated?.();

    } catch (error) {
      console.error('Error creating case:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create case. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Remove any non-numeric characters except forward slashes
    const cleaned = value.replace(/[^\d/]/g, '');
    
    // Format as MM/DD/YYYY
    let formatted = cleaned;
    if (cleaned.length >= 2 && cleaned.indexOf('/') === -1) {
      formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2);
    }
    if (cleaned.length >= 5 && cleaned.split('/').length === 2) {
      const parts = cleaned.split('/');
      formatted = parts[0] + '/' + parts[1].slice(0, 2) + '/' + parts[1].slice(2);
    }
    
    // Limit length to MM/DD/YYYY format
    if (formatted.length <= 10) {
      setFormData(prev => ({ ...prev, incident_date: formatted }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 shadow-lg transition-all duration-300 hover:shadow-xl">
          <Plus className="h-4 w-4 mr-2" />
          Create New Case
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <DollarSign className="h-5 w-5 text-primary" />
            Create New Recovery Case
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="title" className="text-sm font-medium">Case Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Brief description of your case"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="scam_type" className="text-sm font-medium">Scam Type *</Label>
              <Select value={formData.scam_type} onValueChange={(value) => setFormData(prev => ({ ...prev, scam_type: value }))}>
                <SelectTrigger className="mt-1">
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
              <Label htmlFor="incident_date" className="text-sm font-medium">Incident Date (MM/DD/YYYY)</Label>
              <Input
                id="incident_date"
                type="text"
                value={formData.incident_date}
                onChange={handleDateChange}
                placeholder="MM/DD/YYYY"
                maxLength={10}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="amount" className="text-sm font-medium">Amount Lost *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="0.00"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="currency" className="text-sm font-medium">Currency *</Label>
              <Select value={formData.currency} onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {currencies.map((currency) => (
                    <SelectItem key={currency.value} value={currency.value}>
                      {currency.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description" className="text-sm font-medium">Detailed Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what happened, how you were scammed, when it occurred, and any other relevant details..."
              rows={4}
              required
              className="mt-1 resize-none"
            />
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Evidence & Documentation Submission</p>
                <p className="text-sm">
                  For evidence and documentation (screenshots, transaction IDs, emails, etc.), please submit them directly through our contact channels:
                </p>
                <div className="flex flex-col gap-3 mt-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-green-600" />
                    <span className="font-medium">WhatsApp:</span>
                    <a href="https://wa.me/17622035587" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">
                      +1 (762) 203-5587
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MessageCircle className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">Telegram:</span>
                    <a href="https://t.me/Assetrecovery_HQ" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                      @Assetrecovery_HQ
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-600" />
                    <span className="font-medium">Email:</span>
                    <a href="mailto:assetrecovery36@gmail.com" className="text-gray-600 hover:underline">
                      assetrecovery36@gmail.com
                    </a>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Please include your case number in your correspondence for faster processing.
                </p>
              </div>
            </AlertDescription>
          </Alert>

          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !formData.title || !formData.description || !formData.amount || !formData.scam_type}
              className="min-w-[120px]"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Case'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}