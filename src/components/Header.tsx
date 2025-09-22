
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Menu, X, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ContactIcons } from '@/components/ContactIcons';
import { useAuth } from '@/contexts/AuthContext';
import { useScrolled } from '@/hooks/useScrolled';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const isScrolled = useScrolled();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Services', href: '/services' },
    { name: 'Testimonials', href: '/testimonials' },
    { name: 'Blog', href: '/blog' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <>
      <header className={`bg-slate-900/95 backdrop-blur-md border-b sticky top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'shadow-lg border-slate-600/50' 
          : 'shadow-none border-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="p-2 bg-gradient-to-br from-primary to-primary/80 rounded-xl group-hover:scale-110 transition-all duration-300 shadow-lg group-hover:shadow-xl">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <span className="text-2xl font-heading font-bold text-white group-hover:text-accent transition-colors duration-200">
              ScamRecovery Pro
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-slate-300 hover:text-accent px-4 py-3 text-sm font-heading font-medium transition-all duration-200 rounded-lg hover:bg-accent/10"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right side - Auth & Theme */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            
            {user ? (
              <div className="flex items-center space-x-4">
                {/* Dashboard Link */}
                <Link to="/dashboard">
                  <Button variant="outline" size="sm" className="font-heading border-2">
                    Dashboard
                  </Button>
                </Link>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center space-x-2 font-heading">
                      <User className="h-4 w-4" />
                      <span className="hidden sm:inline">{profile?.name || 'User'}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => navigate('/dashboard')} className="font-body">
                      <User className="h-4 w-4 mr-2" />
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="font-body">
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login">
                  <Button variant="outline" size="sm" className="font-heading border-2">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" variant="premium" className="font-heading">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}

            <button
              className="md:hidden p-2 rounded-lg hover:bg-accent/10 transition-colors duration-200"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6 text-white" />
              ) : (
                <Menu className="h-6 w-6 text-white" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-6 border-t border-slate-600/50 bg-slate-900/98 backdrop-blur-md shadow-lg">
            <nav className="space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="block px-4 py-3 text-slate-300 hover:text-accent hover:bg-accent/10 text-sm font-heading font-medium rounded-lg transition-all duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              {user && (
                <>
                  <Link
                    to="/dashboard"
                    className="block px-4 py-3 text-slate-300 hover:text-accent hover:bg-accent/10 text-sm font-heading font-medium rounded-lg transition-all duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-3 text-slate-300 hover:text-accent hover:bg-accent/10 text-sm font-heading font-medium rounded-lg transition-all duration-200"
                  >
                    Sign Out
                  </button>
                </>
              )}
            </nav>
          </div>
        )}
        </div>
      </header>
      <ContactIcons />
    </>
  );
}
