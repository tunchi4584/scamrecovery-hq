import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Upload,
  X,
  Gift
} from 'lucide-react';

export default function Contact() {
  const { user, profile, refreshUserData } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { contacts } = useContacts();
  
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    email: profile?.email || '',
    phone: '',
    scamType: '',
    amountLost: '',
    description: '',
    evidence: ''
  });
  const [loading, setLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const scamTypes = [
    'Investment Scam',
    'Romance Scam', 
    'Tech Support Scam',
    'Cryptocurrency Scam',
    'Online Shopping Scam',
    'Identity Theft',
    'Phishing Scam',
    'Business Email Compromise',
    'Other'
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      const maxSize = 10 * 1024 * 1024; // 10MB
      const allowedTypes = ['image/', 'application/pdf', 'text/', '.doc', '.docx'];
      
      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: `${file.name} is larger than 10MB`,
          variant: "destructive"
        });
        return false;
      }
      
      const isAllowed = allowedTypes.some(type => 
        file.type.startsWith(type) || file.name.toLowerCase().includes(type.replace('.', ''))
      );
      
      if (!isAllowed) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported file type`,
          variant: "destructive"
        });
        return false;
      }
      
      return true;
    });
    
    setUploadedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Create Free Account",
        description: "Sign up for free to submit your case for review.",
        variant: "default"
      });
      navigate('/register');
      return;
    }
    
    setLoading(true);

    try {
      // Prepare evidence with file information
      let evidenceText = formData.evidence;
      if (uploadedFiles.length > 0) {
        const fileList = uploadedFiles.map(file => `${file.name} (${(file.size / 1024).toFixed(1)}KB)`).join(', ');
        evidenceText += `\n\nAttached files: ${fileList}`;
      }

      // Create submission
      const { data: submission, error: submissionError } = await supabase
        .from('submissions')
        .insert({
          user_id: user.id,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          scam_type: formData.scamType,
          amount_lost: parseFloat(formData.amountLost) || 0,
          description: formData.description,
          evidence: evidenceText
        })
        .select()
        .single();

      if (submissionError) throw submissionError;

      // Case creation removed - will be handled separately

      toast({
        title: "Free Case Review Submitted!",
        description: "Your case has been submitted for free review. We'll contact you within 24 hours.",
      });

      // Refresh user data to show the new case
      await refreshUserData();
      
      // Reset form
      setFormData({
        name: profile?.name || '',
        email: profile?.email || '',
        phone: '',
        scamType: '',
        amountLost: '',
        description: '',
        evidence: ''
      });
      setUploadedFiles([]);

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error submitting case:', error);
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit your case. Please try again.",
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Full Name *
                        </label>
                        <Input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          placeholder="Enter your full name"
                          className="text-lg py-3"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Email Address *
                        </label>
                        <Input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          placeholder="Enter your email"
                          className="text-lg py-3"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <Input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          placeholder="Enter your phone number"
                          className="text-lg py-3"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Type of Scam *
                        </label>
                        <Select value={formData.scamType} onValueChange={(value) => setFormData({...formData, scamType: value})}>
                          <SelectTrigger className="text-lg py-3">
                            <SelectValue placeholder="Select scam type" />
                          </SelectTrigger>
                          <SelectContent>
                            {scamTypes.map((type) => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Amount Lost (USD) *
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          type="number"
                          required
                          min="0"
                          step="0.01"
                          value={formData.amountLost}
                          onChange={(e) => setFormData({...formData, amountLost: e.target.value})}
                          className="pl-10 text-lg py-3"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Detailed Description *
                      </label>
                      <Textarea
                        required
                        rows={6}
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        placeholder="Please provide detailed information about the scam, including dates, how you were contacted, what happened, and any other relevant details..."
                        className="resize-none text-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Evidence/Additional Information & Media
                      </label>
                      <Textarea
                        rows={4}
                        value={formData.evidence}
                        onChange={(e) => setFormData({...formData, evidence: e.target.value})}
                        placeholder="Any additional evidence, screenshots, emails, transaction IDs, or other relevant information..."
                        className="resize-none mb-4"
                      />
                      
                      {/* File Upload Section */}
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                        <input
                          type="file"
                          multiple
                          accept="image/*,.pdf,.doc,.docx,.txt"
                          onChange={handleFileUpload}
                          className="hidden"
                          id="file-upload"
                        />
                        <label htmlFor="file-upload" className="cursor-pointer">
                          <div className="text-center">
                            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-lg font-medium text-gray-700">Upload Evidence Files</p>
                            <p className="text-sm text-gray-500">Screenshots, PDFs, documents (max 10MB each)</p>
                            <Button type="button" variant="outline" className="mt-2">
                              Choose Files
                            </Button>
                          </div>
                        </label>
                      </div>
                      
                      {/* Uploaded Files Display */}
                      {uploadedFiles.length > 0 && (
                        <div className="mt-4 space-y-2">
                          <p className="text-sm font-medium text-gray-700">Uploaded Files:</p>
                          {uploadedFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                              <div className="flex items-center space-x-2">
                                <FileText className="h-4 w-4 text-blue-600" />
                                <span className="text-sm text-gray-700">{file.name}</span>
                                <span className="text-xs text-gray-500">({(file.size / 1024).toFixed(1)}KB)</span>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFile(index)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <Button 
                      type="submit" 
                      size="lg" 
                      className="w-full text-lg py-4 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Submitting for FREE Review...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Submit for FREE Case Review
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
