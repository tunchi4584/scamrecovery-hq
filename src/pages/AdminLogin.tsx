
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Shield, Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const { adminLogin, isAdmin, user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirect if already logged in as admin
  useEffect(() => {
    console.log('AdminLogin - Auth state check:', { authLoading, user: user?.email, isAdmin });
    
    if (!authLoading && user && isAdmin) {
      console.log('User is already admin, redirecting to dashboard');
      navigate('/admin/dashboard', { replace: true });
    }
  }, [user, isAdmin, navigate, authLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Validation Error",
        description: "Please enter both email and password.",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);

    try {
      console.log('Attempting admin login for:', email);
      const success = await adminLogin(email, password);
      
      if (success) {
        console.log('Admin login successful, navigating to dashboard');
        toast({
          title: "Admin Login Successful",
          description: "Welcome to the admin portal.",
        });
        navigate('/admin/dashboard', { replace: true });
      } else {
        console.log('Admin login failed');
        toast({
          title: "Access Denied",
          description: "Invalid credentials or insufficient permissions.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Admin login error:', error);
      toast({
        title: "Login Error",
        description: "An error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetEmail) {
      toast({
        title: "Validation Error",
        description: "Please enter your email address.",
        variant: "destructive"
      });
      return;
    }
    
    setResetLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/admin/login`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: redirectUrl
      });

      if (error) throw error;

      toast({
        title: "Password Reset Email Sent",
        description: "Check your email for password reset instructions.",
      });
      setShowForgotPassword(false);
      setResetEmail('');
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send password reset email.",
        variant: "destructive"
      });
    } finally {
      setResetLoading(false);
    }
  };

  // Show loading while auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center px-4">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
          <span className="text-white text-lg">Loading...</span>
        </div>
      </div>
    );
  }

  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
            <p className="text-slate-400">Enter your admin email to reset password</p>
          </div>

          <Card className="shadow-2xl border-0">
            <CardHeader>
              <Button
                variant="ghost"
                onClick={() => setShowForgotPassword(false)}
                className="w-fit p-0 h-auto font-normal text-sm"
                disabled={resetLoading}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Login
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleForgotPassword} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admin Email
                  </label>
                  <Input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="Enter your admin email"
                    disabled={resetLoading}
                  />
                </div>

                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={resetLoading}
                >
                  {resetLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {resetLoading ? 'Sending...' : 'Send Reset Email'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Portal</h1>
          <p className="text-slate-400">Restricted access - Authorized personnel only</p>
        </div>

        <Card className="shadow-2xl border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Administrator Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Email
                </label>
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter admin email"
                  disabled={loading}
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="pr-12"
                    disabled={loading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                size="lg" 
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? 'Authenticating...' : 'Access Admin Portal'}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-blue-600 hover:text-blue-700 underline"
                  disabled={loading}
                >
                  Forgot Password?
                </button>
              </div>
            </form>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Admin Access Required</strong><br />
                Contact system administrator for access credentials.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
