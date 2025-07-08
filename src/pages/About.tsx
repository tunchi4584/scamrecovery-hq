
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Users, Award, Clock, CheckCircle, Star } from 'lucide-react';

export default function About() {
  const teamMembers = [
    {
      name: "Sarah Johnson",
      role: "CEO & Founder",
      experience: "15+ years in financial recovery",
      description: "Former federal investigator specializing in financial crimes and fraud recovery."
    },
    {
      name: "Michael Chen",
      role: "Head of Investigations",
      experience: "12+ years in cybersecurity",
      description: "Expert in blockchain analysis and cryptocurrency recovery with advanced certifications."
    },
    {
      name: "David Rodriguez",
      role: "Legal Counsel",
      experience: "20+ years in financial law",
      description: "Specialized in international financial law and cross-border fund recovery."
    },
    {
      name: "Emily Watson",
      role: "Client Relations Director",
      experience: "8+ years in client advocacy",
      description: "Dedicated to providing compassionate support throughout the recovery process."
    }
  ];

  const achievements = [
    { icon: Users, label: "Clients Served", value: "10,000+" },
    { icon: CheckCircle, label: "Success Rate", value: "95%" },
    { icon: Award, label: "Funds Recovered", value: "$50M+" },
    { icon: Clock, label: "Years of Service", value: "10+" }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              About ScamRecovery Pro
            </h1>
            <p className="text-xl lg:text-2xl text-blue-100 max-w-4xl mx-auto leading-relaxed">
              We are the leading scam recovery service with over a decade of experience 
              helping victims reclaim their stolen funds and rebuild their financial security.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                At ScamRecovery Pro, our mission is simple: to help scam victims recover their stolen funds 
                and restore their financial peace of mind. We understand the devastating impact that financial 
                fraud can have on individuals and families.
              </p>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                With our team of experienced investigators, legal experts, and financial recovery specialists, 
                we've developed proven strategies to track down scammers and recover funds across various 
                types of fraud schemes.
              </p>
              <div className="flex items-center space-x-4">
                <Shield className="h-12 w-12 text-blue-600" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Trusted & Secure</h3>
                  <p className="text-gray-600">Licensed and bonded with the highest security standards</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              {achievements.map((achievement, index) => (
                <Card key={index} className="text-center">
                  <CardContent className="p-6">
                    <achievement.icon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                    <div className="text-3xl font-bold text-gray-900">{achievement.value}</div>
                    <div className="text-gray-600 font-medium">{achievement.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Our Process */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">How We Help You</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Our proven 4-step process has helped thousands of victims recover their stolen funds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Case Assessment",
                description: "We analyze your case details and determine the best recovery strategy for your specific situation."
              },
              {
                step: "02", 
                title: "Investigation",
                description: "Our expert team traces the scammers using advanced forensic techniques and blockchain analysis."
              },
              {
                step: "03",
                title: "Recovery Action",
                description: "We work with financial institutions, law enforcement, and legal channels to recover your funds."
              },
              {
                step: "04",
                title: "Fund Return",
                description: "Once recovered, we ensure your funds are safely returned to you through secure channels."
              }
            ].map((process, index) => (
              <Card key={index} className="relative">
                <CardContent className="p-8 text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-4">{process.step}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{process.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{process.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Meet Our Expert Team</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Our team combines decades of experience in financial investigations, legal expertise, 
              and cybersecurity to deliver the best possible outcomes for our clients.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {teamMembers.map((member, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
                      <p className="text-blue-600 font-semibold mb-2">{member.role}</p>
                      <p className="text-gray-600 mb-3">{member.experience}</p>
                      <p className="text-gray-700">{member.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">Why Choose ScamRecovery Pro?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Award,
                title: "Proven Track Record",
                description: "95% success rate with over $50 million recovered for our clients"
              },
              {
                icon: Shield,
                title: "Secure & Confidential",
                description: "Bank-level security and complete confidentiality throughout the process"
              },
              {
                icon: Clock,
                title: "Fast Results",
                description: "Average recovery time of 30-90 days depending on case complexity"
              }
            ].map((feature, index) => (
              <div key={index} className="text-center">
                <feature.icon className="h-16 w-16 mx-auto mb-6" />
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-blue-100 text-lg leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
