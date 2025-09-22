import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Shield, 
  CheckCircle, 
  Users, 
  Clock, 
  Star, 
  ArrowRight, 
  Phone,
  CreditCard,
  Heart,
  Bitcoin,
  TrendingUp,
  Award,
  Zap,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useState } from 'react';
import React from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

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

  const autoplayPlugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  );

  useScrollAnimation();

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
    { icon: Users, label: "Clients Helped", value: "10,000+", color: "text-accent" },
    { icon: CheckCircle, label: "Success Rate", value: "95%", color: "text-green-500" },
    { icon: Clock, label: "Years Experience", value: "10+", color: "text-blue-500" },
    { icon: Award, label: "Client Rating", value: "4.9/5", color: "text-yellow-500" }
  ];

  const services = [
    {
      title: "Investment Scams",
      description: "Recover funds from fake investment platforms, Ponzi schemes, and fraudulent trading apps with our specialized recovery techniques.",
      icon: TrendingUp,
      features: ["Forex Scams", "Crypto Trading Fraud", "Binary Options", "Stock Scams"],
      successRate: "94%"
    },
    {
      title: "Romance Scams",
      description: "Get your money back from online dating scammers and catfish operations using advanced tracking methods.",
      icon: Heart,
      features: ["Dating App Fraud", "Catfish Scams", "Military Romance", "Social Media Fraud"],
      successRate: "89%"
    },
    {
      title: "Cryptocurrency Recovery",
      description: "Specialized recovery services for stolen Bitcoin, Ethereum, and other cryptocurrencies from various platforms.",
      icon: Bitcoin,
      features: ["Wallet Recovery", "Exchange Fraud", "ICO Scams", "DeFi Exploitation"],
      successRate: "87%"
    }
  ];

  const testimonials = [
    {
      name: "Margaret S.",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b647?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
      amount: "$15,000",
      rating: 5,
      text: "I lost $15,000 to a fake investment platform. ScamRecovery Pro helped me get every penny back in just 3 days. Their team was professional and kept me updated throughout the process.",
      scamType: "Investment Fraud"
    },
    {
      name: "Robert K.",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
      amount: "$8,500",
      rating: 5,
      text: "After being scammed out of $8,500 in a romance scam, I thought I'd never see my money again. This team proved me wrong. Excellent service and results!",
      scamType: "Romance Scam"
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=60 height=60 viewBox=0 0 60 60 xmlns=http://www.w3.org/2000/svg%3E%3Cg fill=none fill-rule=evenodd%3E%3Cg fill=%23ffffff fill-opacity=0.05%3E%3Ccircle cx=30 cy=30 r=2/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-5xl lg:text-7xl font-heading font-bold mb-8 leading-tight">
                Get Your Money Back From
                <span className="block text-accent font-extrabold">Scammers</span>
              </h1>
              <p className="text-xl lg:text-2xl mb-10 text-white/90 leading-relaxed font-body">
                Professional scam recovery services with a <span className="font-semibold text-accent">proven 95% success rate</span>. 
                We've helped thousands recover their stolen funds with our expert team.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start">
                <a href="#free-review">
                  <Button size="lg" variant="premium" className="text-lg px-10 py-6 font-heading group">
                    <Zap className="mr-2 h-5 w-5 icon-hover" />
                    Free Case Review
                  </Button>
                </a>
                <Link to="/services">
                  <Button size="lg" variant="glassmorphism" className="text-lg px-10 py-6 font-heading group">
                    Our Services
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute inset-0 bg-accent/20 rounded-3xl blur-3xl"></div>
                <img 
                  src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80"
                  alt="Professional team working on recovery"
                  className="relative rounded-3xl shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-br from-secondary via-muted to-secondary relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,hsl(var(--primary)/0.1),transparent_50%)]"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className={`slide-up stagger-${index + 1}`}>
                <div className="text-center group card-hover bg-card/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-border/50">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-primary/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-muted to-secondary rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300">
                      <stat.icon className={`h-10 w-10 ${stat.color} icon-hover`} />
                    </div>
                  </div>
                  <div className="text-4xl lg:text-5xl font-heading font-bold text-foreground mb-3 group-hover:text-accent transition-colors duration-300">
                    {stat.value}
                  </div>
                  <div className="text-lg font-body text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-24 bg-gradient-to-br from-background via-secondary/30 to-muted/20 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,hsl(var(--accent)/0.1),transparent_50%)]"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 slide-up">
            <h2 className="text-5xl lg:text-6xl font-heading font-bold text-foreground mb-8">
              How We <span className="text-accent">Help You</span>
            </h2>
            <p className="text-xl font-body text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Our experienced team specializes in recovering funds from various types of scams.
              We use cutting-edge technology and proven strategies to get your money back.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {services.map((service, index) => (
              <div key={index} className={`slide-up stagger-${index + 1}`}>
                <Card className="group card-hover border border-border/50 shadow-xl bg-card/80 backdrop-blur-sm h-full overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <CardContent className="relative p-10 text-center h-full flex flex-col">
                    <div className="relative mb-8">
                      <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-primary/20 rounded-2xl blur-lg animate-glow opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-accent to-accent/80 rounded-2xl shadow-lg group-hover:shadow-2xl transition-all duration-300 animate-float">
                        <service.icon className="h-10 w-10 text-white icon-hover" />
                      </div>
                    </div>
                    
                    <h3 className="text-2xl font-heading font-bold text-foreground mb-4 group-hover:text-accent transition-colors duration-300">
                      {service.title}
                    </h3>
                    <p className="font-body text-muted-foreground text-lg leading-relaxed mb-6 flex-grow">
                      {service.description}
                    </p>
                    
                    <div className="space-y-3 mb-6">
                      {service.features.map((feature, i) => (
                        <div key={i} className={`flex items-center justify-center text-sm font-body text-muted-foreground transition-all duration-300 hover:text-foreground stagger-${i + 1}`}>
                          <CheckCircle className="h-4 w-4 text-accent mr-2 icon-hover" />
                          {feature}
                        </div>
                      ))}
                    </div>
                    
                    <div className="inline-flex items-center bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold shadow-sm hover:shadow-md transition-shadow duration-300">
                      <Award className="h-4 w-4 mr-2 animate-bounce-soft" />
                      {service.successRate} Success Rate
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          <div className="text-center mt-16 slide-up">
            <Link to="/services">
              <Button size="lg" variant="accent" className="text-lg px-10 py-6 font-heading group">
                View All Services
                <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Free Case Review Form */}
      <section id="free-review" className="py-24 bg-gradient-to-br from-secondary to-muted">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl lg:text-6xl font-heading font-bold text-foreground mb-8">
              Free Case <span className="text-accent">Review</span>
            </h2>
            <p className="text-xl font-body text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              Get a professional assessment of your case at no cost. Our experts will review your situation 
              and provide personalized guidance on the best recovery strategy.
            </p>
            {!user && (
              <div className="mt-8 p-6 bg-accent/10 border-2 border-accent/20 rounded-2xl max-w-2xl mx-auto">
                <p className="text-accent font-semibold text-lg font-body">
                  ⚠️ Please create a free account to submit your case for professional review
                </p>
              </div>
            )}
          </div>

          <Card className="shadow-2xl border border-border/30 overflow-hidden bg-card/50 backdrop-blur-sm">
            <div className="bg-gradient-to-r from-accent/10 to-primary/10 p-2">
              <CardContent className="p-10 bg-card/80 rounded-lg backdrop-blur-sm">
                <form onSubmit={handleReviewSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-lg font-heading font-semibold text-foreground mb-3">
                        Full Name *
                      </label>
                      <Input
                        type="text"
                        required
                        value={reviewForm.name}
                        onChange={(e) => setReviewForm({...reviewForm, name: e.target.value})}
                        className="text-lg py-4 font-body border-2 focus:border-accent"
                        placeholder="Enter your full name"
                        disabled={!user}
                      />
                    </div>
                    <div>
                      <label className="block text-lg font-heading font-semibold text-foreground mb-3">
                        Email Address *
                      </label>
                      <Input
                        type="email"
                        required
                        value={reviewForm.email}
                        onChange={(e) => setReviewForm({...reviewForm, email: e.target.value})}
                        className="text-lg py-4 font-body border-2 focus:border-accent"
                        placeholder="Enter your email"
                        disabled={!user}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-lg font-heading font-semibold text-foreground mb-3">
                        Phone Number
                      </label>
                      <Input
                        type="tel"
                        value={reviewForm.phone}
                        onChange={(e) => setReviewForm({...reviewForm, phone: e.target.value})}
                        className="text-lg py-4 font-body border-2 focus:border-accent"
                        placeholder="+1 (762) 203-5587"
                        disabled={!user}
                      />
                    </div>
                    <div>
                      <label className="block text-lg font-heading font-semibold text-foreground mb-3">
                        Amount Lost (USD)
                      </label>
                      <Input
                        type="number"
                        value={reviewForm.amount}
                        onChange={(e) => setReviewForm({...reviewForm, amount: e.target.value})}
                        className="text-lg py-4 font-body border-2 focus:border-accent"
                        placeholder="Enter amount lost"
                        disabled={!user}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-lg font-heading font-semibold text-foreground mb-3">
                      Type of Scam
                    </label>
                    <Input
                      type="text"
                      value={reviewForm.scamType}
                      onChange={(e) => setReviewForm({...reviewForm, scamType: e.target.value})}
                      className="text-lg py-4 font-body border-2 focus:border-accent"
                      placeholder="e.g., Investment scam, Romance scam, Cryptocurrency theft"
                      disabled={!user}
                    />
                  </div>

                  <div>
                    <label className="block text-lg font-heading font-semibold text-foreground mb-3">
                      Describe Your Case *
                    </label>
                    <Textarea
                      required
                      value={reviewForm.description}
                      onChange={(e) => setReviewForm({...reviewForm, description: e.target.value})}
                      className="text-lg font-body border-2 focus:border-accent"
                      rows={6}
                      placeholder="Please provide details about what happened, when it occurred, any evidence you have, and any relevant information that might help us assess your case..."
                      disabled={!user}
                    />
                  </div>

                  <div className="pt-6">
                  <Button type="submit" size="lg" variant="premium" className="w-full text-xl py-6 font-heading">
                    {!user ? 'Create Account to Submit' : 'Submit Free Case Review'}
                    <ArrowRight className="ml-3 h-6 w-6" />
                  </Button>
                  </div>
                </form>
              </CardContent>
            </div>
          </Card>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gradient-to-br from-background via-secondary to-muted/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--accent)/0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(var(--primary)/0.1),transparent_50%)]"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl lg:text-6xl font-heading font-bold text-foreground mb-8">
              Success <span className="text-accent">Stories</span>
            </h2>
            <p className="text-xl font-body text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Read how we've helped thousands of people recover their stolen funds and get their lives back on track.
              Real clients, real results, real recovery.
            </p>
          </div>

          <div className="relative">
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              plugins={[autoplayPlugin.current]}
              className="w-full max-w-6xl mx-auto"
            >
              <CarouselContent className="-ml-2 md:-ml-4">
                {testimonials.map((testimonial, index) => (
                  <CarouselItem key={index} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/2">
                    <div className="p-1">
                      <Card className="group hover:shadow-2xl transition-all duration-500 border border-border/30 shadow-xl bg-gradient-to-br from-card/90 via-card/90 to-card/70 backdrop-blur-sm hover:-translate-y-2 hover:scale-105">
                        <CardContent className="p-8 lg:p-10 relative overflow-hidden">
                          {/* Subtle gradient overlay */}
                          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                          
                          <div className="relative z-10">
                            <div className="flex items-center mb-6">
                              {[...Array(testimonial.rating)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className="h-6 w-6 text-yellow-400 fill-current transform group-hover:scale-110 transition-transform duration-300" 
                                  style={{
                                    transitionDelay: `${i * 100}ms`
                                  }}
                                />
                              ))}
                            </div>
                            
                            <div className="relative mb-8">
                              <div className="absolute -left-2 -top-2 text-6xl text-accent/20 font-serif leading-none">"</div>
                              <p className="text-lg font-body text-muted-foreground leading-relaxed italic pl-8 pr-4 relative z-10">
                                {testimonial.text}
                              </p>
                              <div className="absolute -right-2 -bottom-4 text-6xl text-accent/20 font-serif leading-none rotate-180">"</div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="relative">
                                  <div className="absolute inset-0 bg-accent/30 rounded-full blur-md group-hover:scale-110 transition-transform duration-300"></div>
                                  <img 
                                    src={testimonial.image}
                                    alt={testimonial.name}
                                    className="relative w-16 h-16 rounded-full object-cover ring-4 ring-slate-600 shadow-lg"
                                  />
                                </div>
                                <div className="ml-4">
                                  <p className="font-heading font-bold text-lg text-foreground group-hover:text-accent transition-colors duration-300">
                                    {testimonial.name}
                                  </p>
                                  <p className="font-body text-muted-foreground text-sm">
                                    {testimonial.scamType}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="bg-gradient-to-r from-accent to-accent/80 bg-clip-text text-transparent">
                                  <p className="text-2xl font-heading font-bold">
                                    {testimonial.amount}
                                  </p>
                                </div>
                                <p className="text-sm font-body text-muted-foreground">
                                  Recovered
                                </p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              
              {/* Custom Navigation Buttons */}
              <CarouselPrevious className="hidden md:flex -left-16 lg:-left-20 w-12 h-12 bg-card/80 backdrop-blur-sm border-2 border-accent/30 hover:border-accent hover:bg-accent hover:text-accent-foreground shadow-lg transition-all duration-300" />
              <CarouselNext className="hidden md:flex -right-16 lg:-right-20 w-12 h-12 bg-card/80 backdrop-blur-sm border-2 border-accent/30 hover:border-accent hover:bg-accent hover:text-accent-foreground shadow-lg transition-all duration-300" />
              
              {/* Dots Indicator */}
              <div className="flex justify-center mt-12 space-x-3">
                {testimonials.map((_, index) => (
                  <div
                    key={index}
                    className="w-3 h-3 rounded-full bg-accent/30 hover:bg-accent transition-colors duration-300 cursor-pointer"
                  />
                ))}
              </div>
            </Carousel>
          </div>

          <div className="text-center mt-16">
            <Link to="/testimonials">
              <Button size="lg" variant="outline" className="text-lg px-10 py-6 font-heading border-2 border-primary hover:bg-primary hover:text-white transition-all duration-300 group">
                Read More Success Stories
                <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=60 height=60 viewBox=0 0 60 60 xmlns=http://www.w3.org/2000/svg%3E%3Cg fill=none fill-rule=evenodd%3E%3Cg fill=%23ffffff fill-opacity=0.1%3E%3Cpath d=M30 30c0-11.046 8.954-20 20-20s20 8.954 20 20-8.954 20-20 20-20-8.954-20-20z/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-heading font-bold mb-6">
            Ready to Get Your Money Back?
          </h2>
          <p className="text-xl font-body text-white/90 mb-10 max-w-3xl mx-auto leading-relaxed">
            Don't let scammers get away with your hard-earned money. Our expert team is standing by 
            to help you recover what's rightfully yours.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <a href="#free-review">
              <Button size="lg" variant="premium" className="text-lg px-10 py-6 font-heading group">
                <Phone className="mr-2 h-5 w-5 icon-hover" />
                Start Your Recovery Today
              </Button>
            </a>
            <Link to="/contact">
              <Button size="lg" variant="glassmorphism" className="text-lg px-10 py-6 font-heading group">
                Contact Our Experts
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}