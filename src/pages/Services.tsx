
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { TrendingUp, Heart, Bitcoin, CreditCard, Globe, Shield, CheckCircle, ArrowRight } from 'lucide-react';

export default function Services() {
  const services = [
    {
      icon: TrendingUp,
      title: "Investment Scam Recovery",
      description: "Recover funds from fake investment platforms, Ponzi schemes, binary options, and fraudulent trading apps.",
      features: [
        "Forex trading scams",
        "Cryptocurrency investments",
        "Binary options fraud",
        "Ponzi and pyramid schemes",
        "Fake stock trading platforms"
      ],
      successRate: "96%",
      avgRecovery: "$25,000"
    },
    {
      icon: Heart,
      title: "Romance Scam Recovery",
      description: "Get your money back from online dating scammers, catfish operations, and relationship fraud.",
      features: [
        "Online dating scams",
        "Military romance scams",
        "Social media catfish",
        "Inheritance fraud",
        "Emergency money requests"
      ],
      successRate: "88%",
      avgRecovery: "$12,000"
    },
    {
      icon: Bitcoin,
      title: "Cryptocurrency Recovery",
      description: "Specialized recovery services for stolen Bitcoin, Ethereum, and other digital currencies.",
      features: [
        "Bitcoin recovery",
        "Ethereum and altcoins",
        "Wallet access recovery",
        "Exchange fraud",
        "Mining scam recovery"
      ],
      successRate: "92%",
      avgRecovery: "$35,000"
    },
    {
      icon: CreditCard,
      title: "Credit Card & Banking Fraud",
      description: "Recover funds from unauthorized transactions, identity theft, and banking fraud schemes.",
      features: [
        "Unauthorized transactions",
        "Identity theft recovery",
        "Account takeover fraud",
        "Wire transfer fraud",
        "Credit card skimming"
      ],
      successRate: "94%",
      avgRecovery: "$8,500"
    },
    {
      icon: Globe,
      title: "International Wire Fraud",
      description: "Cross-border fund recovery from international scammers and fraudulent money transfers.",
      features: [
        "International wire transfers",
        "Cross-border investigations",
        "Money mule networks",
        "Business email compromise",
        "Advance fee fraud"
      ],
      successRate: "85%",
      avgRecovery: "$45,000"
    },
    {
      icon: Shield,
      title: "Tech Support Scams",
      description: "Recover funds from fake tech support calls, computer repair scams, and software fraud.",
      features: [
        "Fake Microsoft/Apple support",
        "Computer repair scams",
        "Antivirus software fraud",
        "Remote access scams",
        "Tech support subscriptions"
      ],
      successRate: "91%",
      avgRecovery: "$3,200"
    }
  ];

  const process = [
    {
      step: "1",
      title: "Free Consultation",
      description: "Contact us for a no-cost case review. We'll assess your situation and explain your options."
    },
    {
      step: "2",
      title: "Case Investigation",
      description: "Our expert team conducts a thorough investigation using advanced forensic techniques."
    },
    {
      step: "3",
      title: "Recovery Action",
      description: "We work with financial institutions, law enforcement, and legal channels to recover your funds."
    },
    {
      step: "4",
      title: "Fund Recovery",
      description: "Once successful, we ensure your recovered funds are safely returned to you."
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
              Our Recovery Services
            </h1>
            <p className="text-xl lg:text-2xl text-blue-100 max-w-4xl mx-auto leading-relaxed">
              Comprehensive scam recovery solutions for all types of financial fraud. 
              Our experts have successfully recovered millions in stolen funds.
            </p>
            <div className="mt-8">
              <Link to="/contact">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-4">
                  Get Free Case Review
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Specialized Recovery Services</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              No matter what type of scam you've fallen victim to, our specialized teams have the expertise to help you recover your funds.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                      <service.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-gray-900">{service.title}</CardTitle>
                    </div>
                  </div>
                  <p className="text-gray-600 leading-relaxed">{service.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">What We Cover:</h4>
                      <ul className="space-y-2">
                        {service.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                            <span className="text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="flex justify-between items-center pt-4 border-t">
                      <div className="flex space-x-4">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Success Rate</p>
                          <Badge className="bg-green-100 text-green-800">{service.successRate}</Badge>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Avg. Recovery</p>
                          <Badge className="bg-blue-100 text-blue-800">{service.avgRecovery}</Badge>
                        </div>
                      </div>
                      <Link to="/contact">
                        <Button variant="outline" size="sm">
                          Get Help
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Recovery Process</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We follow a proven 4-step process that has helped thousands of victims recover their stolen funds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {process.map((step, index) => (
              <div key={index} className="text-center">
                <div className="relative mb-8">
                  <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto">
                    {step.step}
                  </div>
                  {index < process.length - 1 && (
                    <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-blue-200 transform -translate-y-1/2"></div>
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Start Your Recovery?</h2>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            Don't let scammers keep your hard-earned money. Contact us today for a free consultation 
            and let our experts help you get your funds back.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-4">
                Get Free Case Review
              </Button>
            </Link>
            <a href="tel:+15551234567">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-4">
                Call Now: (555) 123-4567
              </Button>
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
