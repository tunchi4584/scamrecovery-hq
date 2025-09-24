import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useContacts } from '@/hooks/useContacts';
import { 
  Shield, 
  Phone, 
  Mail, 
  MapPin, 
  MessageSquare, 
  Send,
  AlertTriangle,
  DollarSign,
  FileText,
  Gift,
  Info,
  Loader2
} from 'lucide-react';

export default function Contact() {
  const { user, profile, refreshUserData } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { contacts } = useContacts();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    currency: 'USD',
    scam_type: '',
    incident_date: ''
  });
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to create a case.",
        variant: "destructive"
      });
      navigate('/register');
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
      
      // Refresh user data and redirect to dashboard
      await refreshUserData();
      navigate('/dashboard');

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/50">
      <Header />
      
      <div className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="flex justify-center items-center gap-3 mb-6">
              <Gift className="h-16 w-16 text-primary" />
              <AlertTriangle className="h-16 w-16 text-destructive" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">FREE Case Review & Recovery</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
              Submit your case details for a <span className="text-primary font-bold">completely free</span> initial review. 
              Our expert team will evaluate your case and provide guidance at no cost.
            </p>
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 max-w-2xl mx-auto">
              <p className="text-primary font-semibold">
                ✅ No upfront fees • ✅ Free consultation • ✅ Expert analysis • ✅ 24-hour response
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Case Submission Form */}
            <div className="lg:col-span-2">
              <Card className="shadow-xl border-0 bg-card/90 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-t-lg">
                  <CardTitle className="text-2xl flex items-center">
                    <FileText className="h-6 w-6 mr-2" />
                    Submit Your Case for FREE Review
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
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
                            {contacts.map(contact => {
                              const getIcon = () => {
                                switch (contact.icon_type) {
                                  case 'phone':
                                    return <Phone className="h-4 w-4 text-green-600" />;
                                  case 'email':
                                    return <Mail className="h-4 w-4 text-gray-600" />;
                                  case 'whatsapp':
                                    return <MessageSquare className="h-4 w-4 text-green-600" />;
                                  case 'telegram':
                                    return <MessageSquare className="h-4 w-4 text-blue-500" />;
                                  default:
                                    return <Phone className="h-4 w-4 text-gray-600" />;
                                }
                              };

                              const getHref = () => {
                                switch (contact.platform) {
                                  case 'phone':
                                    return `tel:${contact.value}`;
                                  case 'email':
                                    return `mailto:${contact.value}`;
                                  default:
                                    return contact.value;
                                }
                              };

                              const getClassName = () => {
                                switch (contact.platform) {
                                  case 'whatsapp':
                                    return 'text-green-600 hover:underline';
                                  case 'telegram':
                                    return 'text-blue-500 hover:underline';
                                  case 'email':
                                    return 'text-gray-600 hover:underline';
                                  default:
                                    return 'text-gray-600 hover:underline';
                                }
                              };

                              return (
                                <div key={contact.id} className="flex items-center gap-2 text-sm">
                                  {getIcon()}
                                  <span className="font-medium">{contact.label}:</span>
                                  <a 
                                    href={getHref()} 
                                    target={contact.value.startsWith('http') ? '_blank' : undefined}
                                    rel={contact.value.startsWith('http') ? 'noopener noreferrer' : undefined}
                                    className={getClassName()}
                                  >
                                    {contact.platform === 'telegram' && contact.value.includes('t.me') 
                                      ? contact.value.split('/').pop() 
                                      : contact.value
                                    }
                                  </a>
                                </div>
                              );
                            })}
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            Please include your case number in your correspondence for faster processing.
                          </p>
                        </div>
                      </AlertDescription>
                    </Alert>

                    <Button 
                      type="submit" 
                      size="lg" 
                      className="w-full text-lg py-4 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                      disabled={loading || !formData.title || !formData.description || !formData.amount || !formData.scam_type}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Creating Case...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Create Case
                        </>
                      )}
                    </Button>

                    {!user && (
                      <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-green-800 text-sm">
                          <strong>Create a free account to submit your case.</strong> No payment required! 
                          <Button variant="link" className="p-0 h-auto text-green-600 ml-1" onClick={() => navigate('/register')}>
                            Sign up here for free
                          </Button>
                        </p>
                      </div>
                    )}
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {contacts.map(contact => {
                    const getIcon = () => {
                      switch (contact.icon_type) {
                        case 'phone':
                          return <Phone className="h-5 w-5 text-blue-600 mt-1" />;
                        case 'email':
                          return (
                            <svg className="h-5 w-5 text-blue-600 mt-1" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                            </svg>
                          );
                        case 'whatsapp':
                          return (
                            <svg className="h-5 w-5 text-green-600 mt-1" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.333"/>
                            </svg>
                          );
                        case 'telegram':
                          return (
                            <svg className="h-5 w-5 text-blue-500 mt-1" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                            </svg>
                          );
                        default:
                          return <Phone className="h-5 w-5 text-blue-600 mt-1" />;
                      }
                    };

                    const getLabel = () => {
                      switch (contact.platform) {
                        case 'phone':
                          return 'Emergency Hotline';
                        case 'email':
                          return 'Email Support';
                        case 'whatsapp':
                          return 'WhatsApp';
                        case 'telegram':
                          return 'Telegram';
                        default:
                          return contact.label;
                      }
                    };

                    const getSubtext = () => {
                      switch (contact.platform) {
                        case 'phone':
                          return '24/7 Support Available';
                        case 'email':
                          return 'Response within 2 hours';
                        case 'whatsapp':
                          return 'Quick responses via WhatsApp';
                        case 'telegram':
                          return 'Secure messaging via Telegram';
                        default:
                          return `Contact us via ${contact.label}`;
                      }
                    };

                    const displayValue = contact.platform === 'telegram' && contact.value.includes('t.me') 
                      ? `@${contact.value.split('/').pop()}` 
                      : contact.value;

                    return (
                      <div key={contact.id} className="flex items-start space-x-3">
                        {getIcon()}
                        <div>
                          <p className="font-medium text-gray-900">{getLabel()}</p>
                          <p className="text-gray-600">{displayValue}</p>
                          <p className="text-sm text-gray-500">{getSubtext()}</p>
                        </div>
                      </div>
                    );
                  })}
                  
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-blue-600 mt-1" />
                    <div>
                      <p className="font-medium text-gray-900">Office Location</p>
                      <p className="text-gray-600">123 Recovery Street<br />Suite 456<br />New York, NY 10001</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl text-green-600">FREE Review Process</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</div>
                      <div>
                        <p className="font-medium">FREE Case Review</p>
                        <p className="text-sm text-gray-600">Our experts will review your case within 24 hours - completely free</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</div>
                      <div>
                        <p className="font-medium">Expert Consultation</p>
                        <p className="text-sm text-gray-600">Free consultation to discuss your case and recovery options</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</div>
                      <div>
                        <p className="font-medium">Recovery Action</p>
                        <p className="text-sm text-gray-600">We'll work to recover your lost funds with no upfront costs</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
