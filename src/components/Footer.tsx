
import { Link } from 'react-router-dom';
import { Shield, Phone, Mail, MapPin, MessageCircle } from 'lucide-react';
import { useContacts } from '@/hooks/useContacts';

export function Footer() {
  const { contacts } = useContacts();
  
  const getContactByType = (type: string) => {
    return contacts.find(contact => contact.platform === type);
  };

  const quickLinks = [
    { name: 'About', href: '/about' },
    { name: 'Services', href: '/services' },
    { name: 'Success Stories', href: '/testimonials' },
    { name: 'Contact', href: '/contact' },
  ];

  const legalLinks = [
    { name: 'Privacy Policy', href: '/legal' },
    { name: 'Terms of Service', href: '/legal' },
  ];

  return (
    <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.05),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(174,72,56,0.1),transparent_50%)]"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 mb-16">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-4 mb-8">
              <div className="p-3 bg-gradient-to-br from-accent/20 to-accent/10 rounded-2xl backdrop-blur-sm border border-accent/20">
                <Shield className="h-10 w-10 text-accent" />
              </div>
              <span className="text-3xl font-heading font-bold">
                ScamRecovery Pro
              </span>
            </div>
            <p className="text-slate-300 mb-8 text-lg leading-relaxed font-body max-w-sm">
              Professional recovery services with proven results. Trusted by thousands worldwide.
            </p>
            
            {/* Social Icons */}
            <div className="flex space-x-4">
              {contacts
                .filter(contact => contact.platform === 'whatsapp' || contact.platform === 'telegram')
                .map(contact => (
                  <a 
                    key={contact.id}
                    href={contact.value}
                    className={`p-4 rounded-xl backdrop-blur-sm border transition-all duration-300 hover:scale-110 hover:shadow-xl ${
                      contact.platform === 'whatsapp' 
                        ? 'bg-green-500/10 border-green-500/30 hover:bg-green-500/20 text-green-400' 
                        : 'bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20 text-blue-400'
                    }`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="h-6 w-6" />
                  </a>
                ))
              }
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-1">
            <h3 className="text-xl font-heading font-semibold mb-8 text-white">Quick Links</h3>
            <ul className="space-y-4">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href} 
                    className="text-slate-300 hover:text-accent transition-all duration-200 text-lg font-body relative group"
                  >
                    <span className="relative z-10">{link.name}</span>
                    <span className="absolute inset-x-0 bottom-0 h-0.5 bg-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="lg:col-span-1">
            <h3 className="text-xl font-heading font-semibold mb-8 text-white">Get In Touch</h3>
            <div className="space-y-6">
              {getContactByType('phone') && (
                <div className="flex items-center space-x-4 group">
                  <div className="p-3 bg-accent/10 rounded-xl border border-accent/20 group-hover:bg-accent/20 transition-colors duration-200">
                    <Phone className="h-5 w-5 text-accent" />
                  </div>
                  <span className="text-slate-300 text-lg font-body group-hover:text-white transition-colors duration-200">
                    {getContactByType('phone')?.value}
                  </span>
                </div>
              )}
              {getContactByType('email') && (
                <div className="flex items-center space-x-4 group">
                  <div className="p-3 bg-accent/10 rounded-xl border border-accent/20 group-hover:bg-accent/20 transition-colors duration-200">
                    <Mail className="h-5 w-5 text-accent" />
                  </div>
                  <span className="text-slate-300 text-lg font-body group-hover:text-white transition-colors duration-200">
                    {getContactByType('email')?.value}
                  </span>
                </div>
              )}
              <div className="flex items-center space-x-4 group">
                <div className="p-3 bg-accent/10 rounded-xl border border-accent/20 group-hover:bg-accent/20 transition-colors duration-200">
                  <MapPin className="h-5 w-5 text-accent" />
                </div>
                <span className="text-slate-300 text-lg font-body group-hover:text-white transition-colors duration-200">
                  New York, NY
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-slate-700/50">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-400 text-base font-body mb-4 md:mb-0">
              © 2024 ScamRecovery Pro. All rights reserved.
            </p>
            <div className="flex space-x-8">
              {legalLinks.map((link) => (
                <Link 
                  key={link.name}
                  to={link.href} 
                  className="text-slate-400 hover:text-accent transition-colors duration-200 text-base font-body"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
