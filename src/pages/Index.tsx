
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Link } from 'react-router-dom';
import { Shield, CheckCircle, Users, Clock, Star, ArrowRight, Phone, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

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

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Case Review Submitted",
      description: "We'll contact you within 24 hours for your free consultation.",
    });
    setReviewForm({
      name: '',
      email: '',
      phone: '',
      scamType: '',
      amount: '',
      description: ''
    });
  };

  const stats = [
    { icon: Users, label: "Clients Helped", value: "10,000+" },
    { icon: CheckCircle, label: "Success Rate", value: "95%" },
    { icon: Clock, label: "Years Experience", value: "10+" },
    { icon: Star, label: "Client Rating", value: "4.9/5" }
  ];

  return (
    <div className="min-h-screen bg-white">
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
                <Link to="#free-review">
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-4">
                    Free Case Review
                  </Button>
                </Link>
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
                    <MessageCircle className="h-6 w-6" />
                    <span className="text-lg">WhatsApp: +1 (762) 203-5587</span>
                  </a>
                  <a 
                    href="https://t.me/Assetrecovery_HQ" 
                    className="flex items-center space-x-3 p-4 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="h-6 w-6" />
                    <span className="text-lg">Telegram: @Assetrecovery_HQ</span>
                  </a>
                  <a 
                    href="mailto:assetrecovery36@gmail.com" 
                    className="flex items-center space-x-3 p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    <MessageCircle className="h-6 w-6" />
                    <span className="text-lg">Email: assetrecovery36@gmail.com</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full mb-4">
                  <stat.icon className="h-8 w-8" />
                </div>
                <div className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-lg text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              How We Can Help You
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
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
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{service.title}</h3>
                  <p className="text-gray-600 text-lg leading-relaxed">{service.description}</p>
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
      <section id="free-review" className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Free Case Review
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              Get a professional assessment of your case at no cost. Our experts will review your situation and provide guidance.
            </p>
          </div>

          <Card>
            <CardContent className="p-8">
              <form onSubmit={handleReviewSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-lg font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <Input
                      type="text"
                      required
                      value={reviewForm.name}
                      onChange={(e) => setReviewForm({...reviewForm, name: e.target.value})}
                      className="text-lg py-3"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-lg font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <Input
                      type="email"
                      required
                      value={reviewForm.email}
                      onChange={(e) => setReviewForm({...reviewForm, email: e.target.value})}
                      className="text-lg py-3"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-lg font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <Input
                      type="tel"
                      value={reviewForm.phone}
                      onChange={(e) => setReviewForm({...reviewForm, phone: e.target.value})}
                      className="text-lg py-3"
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div>
                    <label className="block text-lg font-medium text-gray-700 mb-2">
                      Amount Lost (USD)
                    </label>
                    <Input
                      type="number"
                      value={reviewForm.amount}
                      onChange={(e) => setReviewForm({...reviewForm, amount: e.target.value})}
                      className="text-lg py-3"
                      placeholder="Enter amount lost"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-2">
                    Type of Scam
                  </label>
                  <Input
                    type="text"
                    value={reviewForm.scamType}
                    onChange={(e) => setReviewForm({...reviewForm, scamType: e.target.value})}
                    className="text-lg py-3"
                    placeholder="e.g., Investment scam, Romance scam, etc."
                  />
                </div>

                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-2">
                    Describe Your Case *
                  </label>
                  <Textarea
                    required
                    value={reviewForm.description}
                    onChange={(e) => setReviewForm({...reviewForm, description: e.target.value})}
                    className="text-lg"
                    rows={5}
                    placeholder="Please provide details about what happened, when it occurred, and any relevant information..."
                  />
                </div>

                <Button type="submit" size="lg" className="w-full text-lg py-4">
                  Submit Free Case Review
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
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Success Stories
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
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
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  "I lost $15,000 to a fake investment platform. ScamRecovery Pro helped me get every penny back in just 3 weeks. Their team was professional and kept me updated throughout the process."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    M
                  </div>
                  <div className="ml-4">
                    <p className="font-semibold text-lg">Margaret S.</p>
                    <p className="text-gray-600">Recovered $15,000</p>
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
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  "After being scammed out of $8,500 in a romance scam, I thought I'd never see my money again. This team proved me wrong. Excellent service and results!"
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    R
                  </div>
                  <div className="ml-4">
                    <p className="font-semibold text-lg">Robert K.</p>
                    <p className="text-gray-600">Recovered $8,500</p>
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
