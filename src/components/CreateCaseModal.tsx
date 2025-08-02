import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, DollarSign, CalendarIcon, Info, Mail, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export function CreateCaseModal() {
  const { user, refreshUserData } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [incidentDate, setIncidentDate] = useState<Date>();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    currency: 'USD',
    scam_type: ''
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
    if (!user) return;

    setLoading(true);
    try {
      // Use the atomic function to create case with auto-generated case number
      const { data, error } = await supabase.rpc('create_case_atomic', {
        p_user_id: user.id,
        p_title: formData.title,
        p_description: formData.description,
        p_scam_type: formData.scam_type,
        p_amount: parseFloat(formData.amount) || 0,
        p_currency: formData.currency,
        p_incident_date: incidentDate ? format(incidentDate, 'yyyy-MM-dd') : null
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
        currency: 'USD',
        scam_type: ''
      });
      setIncidentDate(undefined);

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
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Create New Case
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Create New Recovery Case
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
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
              <Label htmlFor="incident_date">Incident Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !incidentDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {incidentDate ? format(incidentDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={incidentDate}
                    onSelect={setIncidentDate}
                    disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label htmlFor="amount">Amount Lost *</Label>
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
              <Label htmlFor="currency">Currency *</Label>
              <Select value={formData.currency} onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}>
                <SelectTrigger>
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

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Evidence & Documentation Submission</p>
                <p className="text-sm">
                  For evidence and documentation (screenshots, transaction IDs, emails, etc.), please submit them directly through our contact channels:
                </p>
                <div className="flex flex-col sm:flex-row gap-2 mt-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">Email:</span>
                    <a href="mailto:support@example.com" className="text-blue-600 hover:underline">
                      support@example.com
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MessageCircle className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">Telegram:</span>
                    <a href="https://t.me/supportteam" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                      @supportteam
                    </a>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Please include your case number in your correspondence for faster processing.
                </p>
              </div>
            </AlertDescription>
          </Alert>

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