
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  created_at: string;
  is_active: boolean;
}

export interface Case {
  id: string;
  title: string;
  status: string;
  amount: number;
  created_at: string;
  submission_id?: string | null;
  updated_at: string;
  user_id: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  cases: Case[];
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshUserData: () => Promise<void>;
  adminLogin: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAdminRole: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [cases, setCases] = useState<Case[]>([]);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Simple admin check without recursion
  const checkIsAdmin = async (userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();
      
      if (error) {
        console.error('Admin check error:', error);
        return false;
      }
      
      return data?.role === 'admin';
    } catch (error) {
      console.error('Admin check exception:', error);
      return false;
    }
  };

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (!error && data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
    }
  };

  const fetchCases = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('cases')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        setCases(data);
      }
    } catch (error) {
      console.error('Cases fetch error:', error);
    }
  };

  const updateUserData = async (currentUser: User) => {
    if (!currentUser?.id) return;

    try {
      // Check admin status
      const adminStatus = await checkIsAdmin(currentUser.id);
      setIsAdmin(adminStatus);
      
      // Fetch profile and cases
      await Promise.all([
        fetchProfile(currentUser.id),
        fetchCases(currentUser.id)
      ]);
    } catch (error) {
      console.error('Error updating user data:', error);
    }
  };

  const checkAdminRole = async (): Promise<boolean> => {
    if (!user?.id) return false;
    return checkIsAdmin(user.id);
  };

  const refreshUserData = async () => {
    if (!user?.id) return;
    await updateUserData(user);
  };

  const adminLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('Admin login attempt for:', email);
      setLoading(true);
      
      // Sign out any existing session
      await supabase.auth.signOut();
      
      // Attempt login
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error || !data.user || !data.session) {
        console.error('Login failed:', error);
        return false;
      }

      // Check admin role
      const hasAdminRole = await checkIsAdmin(data.user.id);
      if (!hasAdminRole) {
        console.error('User is not admin');
        await supabase.auth.signOut();
        return false;
      }

      console.log('Admin login successful');
      return true;
    } catch (error) {
      console.error('Admin login exception:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          name: name
        }
      }
    });
    
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    return { error };
  };

  const signOut = async () => {
    await logout();
  };

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log('Auth state change:', event, session?.user?.email || 'no user');
        
        if (event === 'SIGNED_OUT' || !session) {
          setSession(null);
          setUser(null);
          setProfile(null);
          setCases([]);
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        if (session?.user) {
          setSession(session);
          setUser(session.user);
          
          // Update user data in background
          if (event === 'SIGNED_IN') {
            setTimeout(() => {
              updateUserData(session.user);
            }, 0);
          }
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
        } else if (currentSession?.user) {
          console.log('Found existing session');
          setSession(currentSession);
          setUser(currentSession.user);
          
          // Update user data
          setTimeout(() => {
            updateUserData(currentSession.user);
          }, 0);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = {
    user,
    profile,
    cases,
    session,
    loading,
    isAdmin,
    signUp,
    signIn,
    signOut,
    refreshUserData,
    adminLogin,
    logout,
    checkAdminRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
