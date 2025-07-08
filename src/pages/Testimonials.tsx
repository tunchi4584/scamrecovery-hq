
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const testimonials = [
    {
      id: 1,
      name: "Margaret Thompson",
      location: "Phoenix, AZ",
      amount: "$15,000",
      scamType: "Investment Scam",
      rating: 5,
      date: "March 2024",
      testimonial: "I lost $15,000 to a fake investment platform that promised huge returns. I thought I'd never see that money again. ScamRecovery Pro not only got every penny back but did it in just 3 weeks. Their team was professional, kept me updated throughout the process, and truly cared about helping me. I can't thank them enough!",
      avatar: "M"
    },
    {
      id: 2,
      name: "Robert Mitchell",
      location: "Houston, TX", 
      amount: "$8,500",
      scamType: "Romance Scam",
      rating: 5,
      date: "February 2024",
      testimonial: "After being scammed out of $8,500 in what I thought was a genuine romantic relationship online, I was devastated. ScamRecovery Pro helped me understand it wasn't my fault and worked tirelessly to get my money back. They recovered the full amount and helped me report the scammer to authorities. Excellent service!",
      avatar: "R"
    },
    {
      id: 3,
      name: "Linda Rodriguez",
      location: "Miami, FL",
      amount: "$22,000",
      scamType: "Cryptocurrency Fraud",
      rating: 5,
      date: "January 2024",
      testimonial: "I invested $22,000 in what I believed was a legitimate cryptocurrency exchange. When I tried to withdraw my profits, they demanded more money and eventually disappeared. ScamRecovery Pro used advanced blockchain analysis to trace my funds and recovered 95% of my investment. Their expertise in crypto recovery is unmatched.",
      avatar: "L"
    },
    {
      id: 4,
      name: "James Wilson",
      location: "Denver, CO",
      amount: "$5,200",
      scamType: "Tech Support Scam",
      rating: 5,
      date: "April 2024",
      testimonial: "I received a call from someone claiming to be from Microsoft saying my computer was infected. They convinced me to give them remote access and pay $5,200 for 'protection services.' When I realized it was a scam, I contacted ScamRecovery Pro. They recovered my money and helped me secure my computer. Great team!",
      avatar: "J"
    },
    {
      id: 5,
      name: "Patricia Davis",
      location: "Seattle, WA",
      amount: "$12,800",
      scamType: "Business Email Compromise",
      rating: 5,
      date: "March 2024",
      testimonial: "My small business was targeted by scammers who compromised our email and tricked us into wiring $12,800 to a fraudulent account. I thought the money was gone forever, but ScamRecovery Pro's international recovery team worked with banks across multiple countries to get our money back. They saved my business!",
      avatar: "P"
    },
    {
      id: 6,
      name: "David Chen",
      location: "San Francisco, CA",
      amount: "$18,500",
      scamType: "Forex Trading Scam",
      rating: 5,
      date: "February 2024",
      testimonial: "I was lured into a fake Forex trading platform that showed fake profits to get me to invest more. When I couldn't withdraw my $18,500, I knew I'd been scammed. ScamRecovery Pro's investigation team traced the money through multiple offshore accounts and recovered the full amount. Their persistence was incredible.",
      avatar: "D"
    }
  ];

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const stats = [
    { label: "Success Stories", value: "5,000+" },
    { label: "Funds Recovered", value: "$50M+" },
    { label: "Average Rating", value: "4.9/5" },
    { label: "Client Satisfaction", value: "98%" }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              Success Stories
            </h1>
            <p className="text-xl lg:text-2xl text-blue-100 max-w-4xl mx-auto leading-relaxed">
              Read how we've helped thousands of scam victims recover their stolen funds 
              and get their lives back on track.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-blue-600 mb-2">{stat.value}</div>
                <div className="text-lg text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Testimonial Carousel */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Recovery Stories</h2>
            <p className="text-xl text-gray-600">Real stories from real clients who got their money back</p>
          </div>

          <div className="relative">
            <Card className="min-h-[400px]">
              <CardContent className="p-12">
                <div className="text-center mb-8">
                  <Quote className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <div className="flex justify-center mb-4">
                    {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                      <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>
                
                <blockquote className="text-xl text-gray-700 leading-relaxed mb-8 text-center">
                  "{testimonials[currentIndex].testimonial}"
                </blockquote>
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                      {testimonials[currentIndex].avatar}
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-xl text-gray-900">{testimonials[currentIndex].name}</p>
                      <p className="text-gray-600">{testimonials[currentIndex].location}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-center space-x-6 text-sm text-gray-600">
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                      Recovered: {testimonials[currentIndex].amount}
                    </span>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                      {testimonials[currentIndex].scamType}
                    </span>
                    <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full font-medium">
                      {testimonials[currentIndex].date}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Navigation Buttons */}
            <button
              onClick={prevTestimonial}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-6 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="h-6 w-6 text-gray-600" />
            </button>
            
            <button
              onClick={nextTestimonial}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-6 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-colors"
            >
              <ChevronRight className="h-6 w-6 text-gray-600" />
            </button>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* All Testimonials Grid */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">More Success Stories</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Every recovery is a victory. Here are more stories from clients who trusted us to help them get their money back.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={testimonial.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  
                  <p className="text-gray-700 mb-6 leading-relaxed line-clamp-4">
                    "{testimonial.testimonial.substring(0, 150)}..."
                  </p>
                  
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-lg text-gray-900">{testimonial.name}</p>
                      <p className="text-gray-600">{testimonial.location}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Amount Recovered:</span>
                      <span className="font-bold text-green-600">{testimonial.amount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Case Type:</span>
                      <span className="text-sm font-medium text-gray-900">{testimonial.scamType}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Write Your Success Story?</h2>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            Join thousands of satisfied clients who have successfully recovered their stolen funds. 
            Don't let scammers keep what's rightfully yours.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-4">
              Get Free Case Review
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-4">
              Call Now: (555) 123-4567
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
