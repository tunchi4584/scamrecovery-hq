
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
  const [initialized, setInitialized] = useState(false);

  // Simple admin role check function
  const checkAdminRoleDirect = async (userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();
      
      if (error) {
        console.error('Admin role check error:', error);
        return false;
      }
      
      return data?.role === 'admin';
    } catch (error) {
      console.error('Exception in admin role check:', error);
      return false;
    }
  };

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Profile fetch error:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  const fetchUserCases = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('cases')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Cases fetch error:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Error fetching user cases:', error);
      return [];
    }
  };

  const updateUserData = async (currentUser: User) => {
    if (!currentUser?.id) return;

    try {
      const [adminResult, profileResult, casesResult] = await Promise.all([
        checkAdminRoleDirect(currentUser.id),
        fetchUserProfile(currentUser.id),
        fetchUserCases(currentUser.id)
      ]);
      
      setIsAdmin(adminResult);
      if (profileResult) setProfile(profileResult);
      setCases(casesResult);
    } catch (error) {
      console.error('Error updating user data:', error);
    }
  };

  const checkAdminRole = async (): Promise<boolean> => {
    if (!user?.id) return false;
    return checkAdminRoleDirect(user.id);
  };

  const refreshUserData = async () => {
    if (!user?.id) return;
    await updateUserData(user);
  };

  const adminLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('Starting admin login for:', email);
      setLoading(true);
      
      // Clear existing session
      await supabase.auth.signOut();
      
      // Attempt login
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error || !data.user || !data.session) {
        console.error('Admin login failed:', error);
        return false;
      }

      // Check admin role
      const hasAdminRole = await checkAdminRoleDirect(data.user.id);
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
      setLoading(true);
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setLoading(false);
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

    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        
        // Get current session
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          if (mounted) {
            setLoading(false);
            setInitialized(true);
          }
          return;
        }

        if (mounted && currentSession?.user) {
          console.log('Found existing session for user:', currentSession.user.email);
          
          setSession(currentSession);
          setUser(currentSession.user);
          
          // Update user data in background
          setTimeout(() => {
            if (mounted) {
              updateUserData(currentSession.user);
            }
          }, 0);
        }
        
        if (mounted) {
          setLoading(false);
          setInitialized(true);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;

        console.log('Auth state change:', event, session?.user?.email || 'no user');
        
        if (event === 'SIGNED_OUT') {
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
          
          // Update user data in background for sign in events
          if (event === 'SIGNED_IN') {
            setTimeout(() => {
              if (mounted) {
                updateUserData(session.user);
              }
            }, 0);
          }
        }
        
        setLoading(false);
      }
    );

    // Initialize auth only if not already initialized
    if (!initialized) {
      initializeAuth();
    }

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [initialized]);

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
