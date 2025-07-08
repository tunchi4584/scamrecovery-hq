
import { Link } from 'react-router-dom';
import { Shield, Phone, Mail, MapPin, MessageCircle } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="h-8 w-8 text-blue-400" />
              <span className="text-2xl font-bold">ScamRecovery Pro</span>
            </div>
            <p className="text-gray-300 mb-6 text-lg leading-relaxed">
              Professional scam recovery services helping victims reclaim their stolen funds. 
              With over 10 years of experience, we've successfully recovered millions for our clients.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://wa.me/1234567890" 
                className="bg-green-600 hover:bg-green-700 p-3 rounded-full transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="h-5 w-5" />
              </a>
              <a 
                href="https://t.me/scamrecovery" 
                className="bg-blue-500 hover:bg-blue-600 p-3 rounded-full transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link to="/about" className="text-gray-300 hover:text-white transition-colors text-lg">About Us</Link></li>
              <li><Link to="/services" className="text-gray-300 hover:text-white transition-colors text-lg">Our Services</Link></li>
              <li><Link to="/testimonials" className="text-gray-300 hover:text-white transition-colors text-lg">Success Stories</Link></li>
              <li><Link to="/blog" className="text-gray-300 hover:text-white transition-colors text-lg">Blog & Resources</Link></li>
              <li><Link to="/contact" className="text-gray-300 hover:text-white transition-colors text-lg">Contact Us</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-blue-400" />
                <span className="text-gray-300 text-lg">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-blue-400" />
                <span className="text-gray-300 text-lg">help@scamrecovery.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-blue-400" />
                <span className="text-gray-300 text-lg">New York, NY 10001</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-300 text-lg mb-4 md:mb-0">
              © 2024 ScamRecovery Pro. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link to="/legal" className="text-gray-300 hover:text-white transition-colors text-lg">
                Privacy Policy
              </Link>
              <Link to="/legal" className="text-gray-300 hover:text-white transition-colors text-lg">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
