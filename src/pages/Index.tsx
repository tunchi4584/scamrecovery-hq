
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, CheckCircle, Users, Clock, Star, ArrowRight, Phone } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export default function Index() {
  const [reviewForm, setReviewForm] = useState({
    name: '',
    email: '',
    phone: '',
    scamType: '',
    amount: '',
    description: ''
  });
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Account Required",
        description: "Please create a free account to submit your case for review.",
        variant: "destructive"
      });
      navigate('/register');
      return;
    }

    // Redirect to contact page for actual submission
    navigate('/contact');
  };

  const stats = [
    { icon: Users, label: "Clients Helped", value: "10,000+" },
    { icon: CheckCircle, label: "Success Rate", value: "95%" },
    { icon: Clock, label: "Years Experience", value: "10+" },
    { icon: Star, label: "Client Rating", value: "4.9/5" }
  ];

  return (
    <div className="min-h-screen bg-background dark:bg-gray-900">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
                Get Your Money Back From Scammers
              </h1>
              <p className="text-xl lg:text-2xl mb-8 text-blue-100 leading-relaxed">
                Professional scam recovery services with a proven track record. 
                We've helped thousands recover their stolen funds with our expert team.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="#free-review">
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-4">
                    Free Case Review
                  </Button>
                </a>
                <a href="tel:+17622035587">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-4">
                    <Phone className="mr-2 h-5 w-5" />
                    Call Now
                  </Button>
                </a>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
                <h3 className="text-2xl font-bold mb-6">Quick Contact</h3>
                <div className="space-y-4">
                  <a 
                    href="https://wa.me/17622035587" 
                    className="flex items-center space-x-3 p-4 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.333"/>
                    </svg>
                    <span className="text-lg">WhatsApp: +1 (762) 203-5587</span>
                  </a>
                  <a 
                    href="https://t.me/Assetrecovery_HQ" 
                    className="flex items-center space-x-3 p-4 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                    </svg>
                    <span className="text-lg">Telegram: @Assetrecovery_HQ</span>
                  </a>
                  <a 
                    href="mailto:assetrecovery36@gmail.com" 
                    className="flex items-center space-x-3 p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                    </svg>
                    <span className="text-lg">Email: assetrecovery36@gmail.com</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full mb-4">
                  <stat.icon className="h-8 w-8" />
                </div>
                <div className="text-3xl lg:text-4xl font-bold text-foreground dark:text-white mb-2">{stat.value}</div>
                <div className="text-lg text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-foreground dark:text-white mb-6">
              How We Can Help You
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Our experienced team specializes in recovering funds from various types of scams.
              We work tirelessly to get your money back.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Investment Scams",
                description: "Recover funds from fake investment platforms, Ponzi schemes, and fraudulent trading apps.",
                icon: "📈"
              },
              {
                title: "Romance Scams",
                description: "Get your money back from online dating scammers and catfish operations.",
                icon: "💕"
              },
              {
                title: "Cryptocurrency Theft",
                description: "Specialized recovery services for stolen Bitcoin, Ethereum, and other cryptocurrencies.",
                icon: "₿"
              }
            ].map((service, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-8 text-center">
                  <div className="text-4xl mb-4">{service.icon}</div>
                  <h3 className="text-2xl font-bold text-foreground dark:text-white mb-4">{service.title}</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/services">
              <Button size="lg" className="text-lg px-8 py-4">
                View All Services
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Free Case Review Form */}
      <section id="free-review" className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-bold text-foreground dark:text-white mb-6">
              Free Case Review
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Get a professional assessment of your case at no cost. Our experts will review your situation and provide guidance.
            </p>
            {!user && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800 text-lg font-medium">
                  ⚠️ Please create a free account to submit your case for review
                </p>
              </div>
            )}
          </div>

          <Card>
            <CardContent className="p-8">
              <form onSubmit={handleReviewSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-lg font-medium text-foreground dark:text-white mb-2">
                      Full Name *
                    </label>
                    <Input
                      type="text"
                      required
                      value={reviewForm.name}
                      onChange={(e) => setReviewForm({...reviewForm, name: e.target.value})}
                      className="text-lg py-3"
                      placeholder="Enter your full name"
                      disabled={!user}
                    />
                  </div>
                  <div>
                    <label className="block text-lg font-medium text-foreground dark:text-white mb-2">
                      Email Address *
                    </label>
                    <Input
                      type="email"
                      required
                      value={reviewForm.email}
                      onChange={(e) => setReviewForm({...reviewForm, email: e.target.value})}
                      className="text-lg py-3"
                      placeholder="Enter your email"
                      disabled={!user}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-lg font-medium text-foreground dark:text-white mb-2">
                      Phone Number
                    </label>
                    <Input
                      type="tel"
                      value={reviewForm.phone}
                      onChange={(e) => setReviewForm({...reviewForm, phone: e.target.value})}
                      className="text-lg py-3"
                      placeholder="+1 (762) 203-5587"
                      disabled={!user}
                    />
                  </div>
                  <div>
                    <label className="block text-lg font-medium text-foreground dark:text-white mb-2">
                      Amount Lost (USD)
                    </label>
                    <Input
                      type="number"
                      value={reviewForm.amount}
                      onChange={(e) => setReviewForm({...reviewForm, amount: e.target.value})}
                      className="text-lg py-3"
                      placeholder="Enter amount lost"
                      disabled={!user}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-lg font-medium text-foreground dark:text-white mb-2">
                    Type of Scam
                  </label>
                  <Input
                    type="text"
                    value={reviewForm.scamType}
                    onChange={(e) => setReviewForm({...reviewForm, scamType: e.target.value})}
                    className="text-lg py-3"
                    placeholder="e.g., Investment scam, Romance scam, etc."
                    disabled={!user}
                  />
                </div>

                <div>
                  <label className="block text-lg font-medium text-foreground dark:text-white mb-2">
                    Describe Your Case *
                  </label>
                  <Textarea
                    required
                    value={reviewForm.description}
                    onChange={(e) => setReviewForm({...reviewForm, description: e.target.value})}
                    className="text-lg"
                    rows={5}
                    placeholder="Please provide details about what happened, when it occurred, and any relevant information..."
                    disabled={!user}
                  />
                </div>

                <Button type="submit" size="lg" className="w-full text-lg py-4">
                  {!user ? 'Create Account to Submit' : 'Submit Free Case Review'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Testimonial Preview */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-foreground dark:text-white mb-6">
              Success Stories
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Read how we've helped thousands of people recover their stolen funds and get their lives back on track.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  "I lost $15,000 to a fake investment platform. ScamRecovery Pro helped me get every penny back in just 3 days. Their team was professional and kept me updated throughout the process."
                </p>
                <div className="flex items-center">
                  <img 
                    src="https://images.unsplash.com/photo-1494790108755-2616b612b647?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"
                    alt="Margaret S."
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="ml-4">
                    <p className="font-semibold text-lg text-foreground dark:text-white">Margaret S.</p>
                    <p className="text-muted-foreground">Recovered $15,000</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  "After being scammed out of $8,500 in a romance scam, I thought I'd never see my money again. This team proved me wrong. Excellent service and results!"
                </p>
                <div className="flex items-center">
                  <img 
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"
                    alt="Robert K."
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="ml-4">
                    <p className="font-semibold text-lg text-foreground dark:text-white">Robert K.</p>
                    <p className="text-muted-foreground">Recovered $8,500</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Link to="/testimonials">
              <Button size="lg" variant="outline" className="text-lg px-8 py-4">
                Read More Success Stories
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
