
import { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Phone, 
  Mail, 
  MapPin, 
  MessageCircle, 
  Clock,
  Shield,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    scamType: '',
    amount: '',
    urgency: 'medium',
    description: ''
  });
  const [reportForm, setReportForm] = useState({
    scammerInfo: '',
    scamDetails: '',
    evidence: ''
  });
  const { toast } = useToast();
  const { user } = useAuth();

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message Sent Successfully",
      description: "We'll contact you within 24 hours for your free consultation.",
    });
    setFormData({
      name: '',
      email: '',
      phone: '',
      scamType: '',
      amount: '',
      urgency: 'medium',
      description: ''
    });
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to report a scam.",
        variant: "destructive"
      });
      return;
    }
    toast({
      title: "Scam Report Submitted",
      description: "Thank you for reporting this scam. We'll investigate and take appropriate action.",
    });
    setReportForm({
      scammerInfo: '',
      scamDetails: '',
      evidence: ''
    });
  };

  const contactMethods = [
    {
      icon: Phone,
      title: "Phone Support",
      description: "Speak directly with our recovery experts",
      contact: "+1 (762) 203-5587",
      action: "tel:+17622035587",
      availability: "24/7 Emergency Line"
    },
    {
      icon: MessageCircle,
      title: "WhatsApp",
      description: "Quick response via WhatsApp messaging",
      contact: "+1 (762) 203-5587",
      action: "https://wa.me/17622035587",
      availability: "Usually responds in minutes"
    },
    {
      icon: MessageCircle,
      title: "Telegram",
      description: "Secure messaging on Telegram",
      contact: "@Assetrecovery_HQ",
      action: "https://t.me/Assetrecovery_HQ",
      availability: "Secure & encrypted"
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "Detailed case information and documents",
      contact: "assetrecovery36@gmail.com",
      action: "mailto:assetrecovery36@gmail.com",
      availability: "Response within 2 hours"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              Get Help Now
            </h1>
            <p className="text-xl lg:text-2xl text-blue-100 max-w-4xl mx-auto leading-relaxed">
              Contact our expert recovery team for immediate assistance. 
              We're available 24/7 to help you recover your stolen funds.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Multiple Ways to Reach Us</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Choose your preferred method of communication. Our team is ready to help you 24/7.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {contactMethods.map((method, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                      <method.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{method.title}</h3>
                      <p className="text-gray-600 mb-3">{method.description}</p>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-lg text-blue-600">{method.contact}</p>
                          <p className="text-sm text-gray-500">{method.availability}</p>
                        </div>
                        <a href={method.action} target="_blank" rel="noopener noreferrer">
                          <Button size="sm">Contact Now</Button>
                        </a>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Forms */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Free Case Review Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  <CheckCircle className="h-6 w-6 mr-2 text-green-600" />
                  Free Case Review
                </CardTitle>
                <p className="text-gray-600">Get a professional assessment of your case at no cost.</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleContactSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        Amount Lost (USD)
                      </label>
                      <Input
                        type="number"
                        value={formData.amount}
                        onChange={(e) => setFormData({...formData, amount: e.target.value})}
                        placeholder="Enter amount lost"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Type of Scam
                      </label>
                      <select
                        value={formData.scamType}
                        onChange={(e) => setFormData({...formData, scamType: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select scam type</option>
                        <option value="investment">Investment Scam</option>
                        <option value="romance">Romance Scam</option>
                        <option value="crypto">Cryptocurrency Theft</option>
                        <option value="tech-support">Tech Support Scam</option>
                        <option value="banking">Banking Fraud</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Urgency Level
                      </label>
                      <select
                        value={formData.urgency}
                        onChange={(e) => setFormData({...formData, urgency: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="low">Low - Can wait a few days</option>
                        <option value="medium">Medium - Need help soon</option>
                        <option value="high">High - Very urgent</option>
                        <option value="emergency">Emergency - Need immediate help</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Describe Your Case *
                    </label>
                    <Textarea
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows={5}
                      placeholder="Please provide details about what happened, when it occurred, and any relevant information..."
                    />
                  </div>

                  <Button type="submit" size="lg" className="w-full">
                    Submit Free Case Review
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Report a Scam Form (Login Required) */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  <AlertCircle className="h-6 w-6 mr-2 text-orange-600" />
                  Report a Scam
                </CardTitle>
                <p className="text-gray-600">
                  {user ? "Help us stop scammers by reporting fraudulent activities." : "Login required to report scams."}
                </p>
              </CardHeader>
              <CardContent>
                {user ? (
                  <form onSubmit={handleReportSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Scammer Information *
                      </label>
                      <Textarea
                        required
                        value={reportForm.scammerInfo}
                        onChange={(e) => setReportForm({...reportForm, scammerInfo: e.target.value})}
                        rows={3}
                        placeholder="Website URLs, phone numbers, email addresses, social media profiles, etc."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Scam Details *
                      </label>
                      <Textarea
                        required
                        value={reportForm.scamDetails}
                        onChange={(e) => setReportForm({...reportForm, scamDetails: e.target.value})}
                        rows={4}
                        placeholder="Describe the scam method, how they contacted you, what they promised, etc."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Evidence & Additional Information
                      </label>
                      <Textarea
                        value={reportForm.evidence}
                        onChange={(e) => setReportForm({...reportForm, evidence: e.target.value})}
                        rows={3}
                        placeholder="Screenshots, transaction IDs, communication records, etc."
                      />
                    </div>

                    <Button type="submit" size="lg" className="w-full bg-orange-600 hover:bg-orange-700">
                      Submit Scam Report
                    </Button>
                  </form>
                ) : (
                  <div className="text-center py-12">
                    <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Login Required</h3>
                    <p className="text-gray-600 mb-6">
                      You need to be logged in to report scams and help protect other potential victims.
                    </p>
                    <div className="space-y-3">
                      <a href="/login" className="block">
                        <Button className="w-full">Login to Your Account</Button>
                      </a>
                      <a href="/register" className="block">
                        <Button variant="outline" className="w-full">Create New Account</Button>
                      </a>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Business Hours & Location */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  <Clock className="h-6 w-6 mr-2 text-blue-600" />
                  Business Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium">Emergency Line</span>
                    <span className="text-blue-600 font-semibold">24/7 Available</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium">Monday - Friday</span>
                    <span>8:00 AM - 8:00 PM EST</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium">Saturday</span>
                    <span>9:00 AM - 5:00 PM EST</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium">Sunday</span>
                    <span>10:00 AM - 4:00 PM EST</span>
                  </div>
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <p className="text-blue-800 font-medium">
                      🚨 Emergency cases are handled 24/7. If you've been recently scammed, contact us immediately!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  <MapPin className="h-6 w-6 mr-2 text-blue-600" />
                  Our Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-lg mb-2">Headquarters</h4>
                    <p className="text-gray-700">
                      ScamRecovery Pro LLC<br />
                      123 Financial District<br />
                      New York, NY 10001<br />
                      United States
                    </p>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <h4 className="font-semibold text-lg mb-2">Mailing Address</h4>
                    <p className="text-gray-700">
                      PO Box 12345<br />
                      New York, NY 10001<br />
                      United States
                    </p>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-semibold text-lg mb-2">International Offices</h4>
                    <p className="text-gray-700">
                      We also have partner offices in London, Toronto, and Sydney 
                      to assist with international recovery cases.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
