
import { Link } from 'react-router-dom';
import { Shield, Phone, Mail, MapPin, MessageCircle } from 'lucide-react';
import { useContacts } from '@/hooks/useContacts';

export function Footer() {
  const { contacts } = useContacts();
  
  const getContactByType = (type: string) => {
    return contacts.find(contact => contact.platform === type);
  };
  return (
    <footer className="bg-gradient-to-br from-primary via-primary to-primary/90 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-accent/20 rounded-xl">
                <Shield className="h-10 w-10 text-accent" />
              </div>
              <span className="text-3xl font-heading font-bold">ScamRecovery Pro</span>
            </div>
            <p className="text-white/80 mb-8 text-lg leading-relaxed font-body max-w-md">
              Professional scam recovery services helping victims reclaim their stolen funds. 
              With over 10 years of experience, we've successfully recovered millions for our clients.
            </p>
            <div className="flex space-x-4">
              {contacts
                .filter(contact => contact.platform === 'whatsapp' || contact.platform === 'telegram')
                .map(contact => (
                  <a 
                    key={contact.id}
                    href={contact.value}
                    className={`p-4 rounded-2xl transition-all duration-200 hover:scale-110 ${
                      contact.platform === 'whatsapp' 
                        ? 'bg-green-500 hover:bg-green-400' 
                        : 'bg-blue-500 hover:bg-blue-400'
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
          <div>
            <h3 className="text-xl font-heading font-bold mb-6">Quick Links</h3>
            <ul className="space-y-4">
              <li><Link to="/about" className="text-white/80 hover:text-accent transition-colors text-lg font-body hover:underline">About Us</Link></li>
              <li><Link to="/services" className="text-white/80 hover:text-accent transition-colors text-lg font-body hover:underline">Our Services</Link></li>
              <li><Link to="/testimonials" className="text-white/80 hover:text-accent transition-colors text-lg font-body hover:underline">Success Stories</Link></li>
              <li><Link to="/blog" className="text-white/80 hover:text-accent transition-colors text-lg font-body hover:underline">Blog & Resources</Link></li>
              <li><Link to="/contact" className="text-white/80 hover:text-accent transition-colors text-lg font-body hover:underline">Contact Us</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-heading font-bold mb-6">Contact Info</h3>
            <div className="space-y-4">
              {getContactByType('phone') && (
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-accent/20 rounded-lg">
                    <Phone className="h-5 w-5 text-accent" />
                  </div>
                  <span className="text-white/80 text-lg font-body">{getContactByType('phone')?.value}</span>
                </div>
              )}
              {getContactByType('email') && (
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-accent/20 rounded-lg">
                    <Mail className="h-5 w-5 text-accent" />
                  </div>
                  <span className="text-white/80 text-lg font-body">{getContactByType('email')?.value}</span>
                </div>
              )}
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-accent/20 rounded-lg">
                  <MapPin className="h-5 w-5 text-accent" />
                </div>
                <span className="text-white/80 text-lg font-body">New York, NY 10001</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-white/70 text-lg font-body mb-4 md:mb-0">
              © 2024 ScamRecovery Pro. All rights reserved.
            </p>
            <div className="flex space-x-8">
              <Link to="/legal" className="text-white/70 hover:text-accent transition-colors text-lg font-body hover:underline">
                Privacy Policy
              </Link>
              <Link to="/legal" className="text-white/70 hover:text-accent transition-colors text-lg font-body hover:underline">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
