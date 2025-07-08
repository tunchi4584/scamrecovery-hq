
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, User, ArrowRight, Shield, TrendingUp, AlertTriangle } from 'lucide-react';

export default function Blog() {
  const featuredArticle = {
    id: 1,
    title: "The Ultimate Guide to Avoiding Investment Scams in 2024",
    excerpt: "Learn the latest tactics scammers use to steal your money through fake investment platforms and how to protect yourself.",
    content: "Investment scams have become increasingly sophisticated, with criminals using fake trading platforms, celebrity endorsements, and promises of guaranteed returns to lure victims...",
    author: "Sarah Johnson",
    date: "March 15, 2024",
    readTime: "8 min read",
    category: "Prevention",
    image: "🔒"
  };

  const articles = [
    {
      id: 2,
      title: "Red Flags: How to Spot Romance Scams Before It's Too Late",
      excerpt: "Protect your heart and wallet by learning the warning signs of online dating scammers.",
      author: "Michael Chen",
      date: "March 10, 2024",
      readTime: "6 min read",
      category: "Prevention",
      image: "💔"
    },
    {
      id: 3,
      title: "Cryptocurrency Recovery: What You Need to Know",
      excerpt: "Understanding the process and realistic expectations for recovering stolen cryptocurrency.",
      author: "David Rodriguez",
      date: "March 8, 2024",
      readTime: "10 min read",
      category: "Recovery",
      image: "₿"
    },
    {
      id: 4,
      title: "Tech Support Scams: Don't Fall for Fake Microsoft Calls",
      excerpt: "Learn how to identify and handle suspicious tech support calls claiming to fix your computer.",
      author: "Emily Watson",
      date: "March 5, 2024",
      readTime: "5 min read",
      category: "Prevention",
      image: "💻"
    },
    {
      id: 5,
      title: "What to Do Immediately After Being Scammed",
      excerpt: "A step-by-step guide to maximize your chances of recovery after falling victim to fraud.",
      author: "Sarah Johnson",
      date: "March 1, 2024",
      readTime: "7 min read",
      category: "Recovery",
      image: "🚨"
    },
    {
      id: 6,
      title: "Business Email Compromise: Protecting Your Company",
      excerpt: "How cybercriminals target businesses and what you can do to prevent financial losses.",
      author: "Michael Chen",
      date: "February 28, 2024",
      readTime: "9 min read",
      category: "Business",
      image: "🏢"
    }
  ];

  const faqs = [
    {
      question: "How quickly should I act after being scammed?",
      answer: "Time is critical in scam recovery. Contact us immediately - preferably within 24-48 hours. The sooner we can start the recovery process, the better your chances of getting your money back."
    },
    {
      question: "What information do I need to provide for recovery?",
      answer: "We'll need transaction records, communication with the scammer, bank statements, and any other relevant documentation. Don't worry if you don't have everything - we'll guide you through gathering the necessary information."
    },
    {
      question: "How much does scam recovery cost?",
      answer: "We offer free initial consultations. Our fee structure is based on successful recovery, meaning you only pay when we recover your funds. Contact us for detailed pricing information."
    },
    {
      question: "Can you recover cryptocurrency?",
      answer: "Yes, we specialize in cryptocurrency recovery using advanced blockchain analysis tools. While crypto recovery can be complex, we have successfully recovered millions in stolen digital assets."
    },
    {
      question: "How long does the recovery process take?",
      answer: "Recovery timeframes vary depending on the case complexity, amount involved, and cooperation from financial institutions. Most cases are resolved within 30-90 days."
    },
    {
      question: "What if the scammer is in another country?",
      answer: "We have extensive experience with international cases and work with law enforcement agencies worldwide. Many of our successful recoveries involve cross-border fraud."
    }
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Prevention': return 'bg-green-100 text-green-800';
      case 'Recovery': return 'bg-blue-100 text-blue-800';
      case 'Business': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              Scam Prevention & Recovery Resources
            </h1>
            <p className="text-xl lg:text-2xl text-blue-100 max-w-4xl mx-auto leading-relaxed">
              Stay informed with expert advice on preventing scams and what to do if you become a victim. 
              Knowledge is your best defense against fraud.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Article */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Article</h2>
            <p className="text-xl text-gray-600">Essential reading for scam prevention</p>
          </div>

          <Card className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="p-12 flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
                <div className="text-8xl">{featuredArticle.image}</div>
              </div>
              <div className="p-12">
                <div className="flex items-center space-x-4 mb-4">
                  <Badge className={getCategoryColor(featuredArticle.category)}>
                    {featuredArticle.category}
                  </Badge>
                  <span className="text-gray-500">{featuredArticle.readTime}</span>
                </div>
                
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  {featuredArticle.title}
                </h3>
                
                <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                  {featuredArticle.excerpt}
                </p>
                
                <div className="flex items-center text-gray-500 mb-6">
                  <User className="h-4 w-4 mr-2" />
                  <span className="mr-4">{featuredArticle.author}</span>
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{featuredArticle.date}</span>
                </div>
                
                <Button size="lg">
                  Read Full Article
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Latest Articles & Guides</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Stay updated with the latest scam trends, prevention strategies, and recovery success stories.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <Card key={article.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="text-center mb-4">
                    <div className="text-4xl mb-3">{article.image}</div>
                    <Badge className={getCategoryColor(article.category)}>
                      {article.category}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl text-gray-900 leading-tight">
                    {article.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {article.excerpt}
                  </p>
                  
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <User className="h-4 w-4 mr-1" />
                    <span className="mr-3">{article.author}</span>
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{article.date}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{article.readTime}</span>
                    <Button variant="outline" size="sm">
                      Read More
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              Get answers to the most common questions about scam recovery and prevention.
            </p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-start">
                    <AlertTriangle className="h-6 w-6 text-orange-500 mr-3 mt-1 flex-shrink-0" />
                    {faq.question}
                  </h3>
                  <p className="text-gray-700 leading-relaxed ml-9">
                    {faq.answer}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Educational Video Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-6">Educational Videos</h2>
            <p className="text-xl text-blue-100 leading-relaxed">
              Watch our expert-led videos on scam prevention and recovery strategies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="bg-white/10 border-white/20">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <TrendingUp className="h-10 w-10" />
                </div>
                <h3 className="text-2xl font-bold mb-4">How Investment Scams Work</h3>
                <p className="text-blue-100 mb-6">
                  Learn the common tactics used by investment scammers and how to protect your money.
                </p>
                <Button 
                  variant="outline" 
                  className="border-white text-white hover:bg-white hover:text-blue-600"
                  onClick={() => window.open('https://youtube.com/watch?v=example1', '_blank')}
                >
                  Watch Video
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Shield className="h-10 w-10" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Steps to Take After Being Scammed</h3>
                <p className="text-blue-100 mb-6">
                  A comprehensive guide on what to do immediately after discovering you've been scammed.
                </p>
                <Button 
                  variant="outline" 
                  className="border-white text-white hover:bg-white hover:text-blue-600"
                  onClick={() => window.open('https://youtube.com/watch?v=example2', '_blank')}
                >
                  Watch Video
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Need Immediate Help?</h2>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            If you've been scammed or suspect fraudulent activity, don't wait. 
            Contact our expert recovery team for immediate assistance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 py-4">
              Get Free Case Review
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-4">
              Call Emergency Line
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
