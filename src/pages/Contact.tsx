
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
import { 
  Shield, 
  Phone, 
  Mail, 
  MapPin, 
  MessageSquare, 
  Send,
  AlertTriangle,
  DollarSign,
  FileText
} from 'lucide-react';

export default function Contact() {
  const { user, profile, refreshUserData } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to submit a case.",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }
    
    setLoading(true);

    try {
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
          evidence: formData.evidence
        })
        .select()
        .single();

      if (submissionError) throw submissionError;

      // Create corresponding case
      const { error: caseError } = await supabase
        .from('cases')
        .insert({
          user_id: user.id,
          submission_id: submission.id,
          title: `${formData.scamType} Case`,
          status: 'pending',
          amount: parseFloat(formData.amountLost) || 0
        });

      if (caseError) throw caseError;

      toast({
        title: "Case Submitted Successfully",
        description: "Your case has been submitted and is now under review. We'll contact you soon.",
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
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <AlertTriangle className="h-16 w-16 text-red-600 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Get Your Money Back</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Submit your case details and let our expert team help you recover your lost funds. 
              We specialize in various types of fraud recovery with a high success rate.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Case Submission Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center">
                    <FileText className="h-6 w-6 mr-2" />
                    Submit Your Case
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name *
                        </label>
                        <Input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address *
                        </label>
                        <Input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          placeholder="Enter your email"
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
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Type of Scam *
                        </label>
                        <Select value={formData.scamType} onValueChange={(value) => setFormData({...formData, scamType: value})}>
                          <SelectTrigger>
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
                          className="pl-10"
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
                        className="resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Evidence/Additional Information
                      </label>
                      <Textarea
                        rows={4}
                        value={formData.evidence}
                        onChange={(e) => setFormData({...formData, evidence: e.target.value})}
                        placeholder="Any additional evidence, screenshots, emails, transaction IDs, or other relevant information..."
                        className="resize-none"
                      />
                    </div>

                    <Button 
                      type="submit" 
                      size="lg" 
                      className="w-full"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Submitting Case...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Submit Case for Review
                        </>
                      )}
                    </Button>

                    {!user && (
                      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-blue-800 text-sm">
                          You need to be logged in to submit a case. 
                          <Button variant="link" className="p-0 h-auto text-blue-600" onClick={() => navigate('/login')}>
                            Sign in here
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
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-start space-x-3">
                    <Phone className="h-5 w-5 text-blue-600 mt-1" />
                    <div>
                      <p className="font-medium text-gray-900">Emergency Hotline</p>
                      <p className="text-gray-600">+1 (555) 123-4567</p>
                      <p className="text-sm text-gray-500">24/7 Support Available</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Mail className="h-5 w-5 text-blue-600 mt-1" />
                    <div>
                      <p className="font-medium text-gray-900">Email Support</p>
                      <p className="text-gray-600">help@scamrecovery.com</p>
                      <p className="text-sm text-gray-500">Response within 2 hours</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-blue-600 mt-1" />
                    <div>
                      <p className="font-medium text-gray-900">Office Location</p>
                      <p className="text-gray-600">123 Recovery Street<br />Suite 456<br />New York, NY 10001</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">What Happens Next?</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</div>
                      <div>
                        <p className="font-medium">Case Review</p>
                        <p className="text-sm text-gray-600">Our experts will review your case within 24 hours</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</div>
                      <div>
                        <p className="font-medium">Investigation</p>
                        <p className="text-sm text-gray-600">We'll begin investigating and tracking your funds</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</div>
                      <div>
                        <p className="font-medium">Recovery</p>
                        <p className="text-sm text-gray-600">We'll work to recover your lost funds</p>
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
