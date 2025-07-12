
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

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('Fetching user profile for:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Profile fetch error:', error);
        return;
      }
      
      if (data) {
        console.log('Profile fetched successfully:', data);
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchUserCases = async (userId: string) => {
    try {
      console.log('Fetching user cases for:', userId);
      const { data, error } = await supabase
        .from('cases')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Cases fetch error:', error);
        return;
      }
      
      if (data) {
        console.log('Cases fetched successfully:', data.length, 'cases');
        setCases(data);
      }
    } catch (error) {
      console.error('Error fetching user cases:', error);
    }
  };

  const checkAdminRole = async (): Promise<boolean> => {
    if (!user?.id) {
      console.log('No user ID available for admin check');
      return false;
    }
    
    try {
      console.log('Checking admin role for user:', user.id);
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();
      
      if (error) {
        console.error('Admin role check error:', error);
        return false;
      }
      
      const hasAdminRole = data?.role === 'admin';
      console.log('Admin role check result:', hasAdminRole);
      return hasAdminRole;
    } catch (error) {
      console.error('Exception in admin role check:', error);
      return false;
    }
  };

  const refreshUserData = async () => {
    if (!user?.id) return;
    
    console.log('Refreshing user data for:', user.id);
    
    try {
      // Check admin role first
      const isAdminUser = await checkAdminRole();
      setIsAdmin(isAdminUser);
      
      // Fetch user data in parallel
      await Promise.all([
        fetchUserProfile(user.id),
        fetchUserCases(user.id)
      ]);
      
      console.log('User data refresh completed');
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  const adminLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('Attempting admin login for:', email);
      
      // Clear any existing session first
      await supabase.auth.signOut();
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Admin login auth error:', error);
        return false;
      }

      if (!data.user || !data.session) {
        console.error('No user or session data returned');
        return false;
      }

      console.log('Auth successful, checking admin role for user:', data.user.id);

      // Check admin role directly with the new user ID
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', data.user.id)
        .eq('role', 'admin')
        .maybeSingle();

      console.log('Admin role check result:', { roleData, roleError });

      if (roleError || !roleData || roleData.role !== 'admin') {
        console.error('User is not admin or role check failed');
        await supabase.auth.signOut();
        return false;
      }

      console.log('Admin login successful');
      
      // Set states immediately for admin
      setUser(data.user);
      setSession(data.session);
      setIsAdmin(true);
      
      return true;
    } catch (error) {
      console.error('Admin login exception:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      console.log('Logging out user');
      await supabase.auth.signOut();
      
      // Clear all state
      setUser(null);
      setProfile(null);
      setCases([]);
      setSession(null);
      setIsAdmin(false);
      
      console.log('Logout completed');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        setLoading(true);
        
        // Get current session
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
        }

        if (mounted && currentSession?.user) {
          console.log('Found existing session for user:', currentSession.user.email);
          
          setSession(currentSession);
          setUser(currentSession.user);
          
          // Check admin role and set state
          const isAdminUser = await checkAdminRole();
          if (mounted) {
            setIsAdmin(isAdminUser);
            
            // Fetch user data
            await Promise.all([
              fetchUserProfile(currentSession.user.id),
              fetchUserCases(currentSession.user.id)
            ]);
          }
        }
        
        if (mounted) {
          setLoading(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log('Auth state change:', event, session?.user?.email || 'no user');
        
        if (event === 'SIGNED_OUT') {
          console.log('User signed out - clearing state');
          setSession(null);
          setUser(null);
          setProfile(null);
          setCases([]);
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
          console.log('User signed in or token refreshed');
          
          setSession(session);
          setUser(session.user);
          
          // For admin login, we handle the role check separately
          if (event === 'SIGNED_IN') {
            // Check admin role
            const isAdminUser = await checkAdminRole();
            setIsAdmin(isAdminUser);
            
            // Fetch user data
            await Promise.all([
              fetchUserProfile(session.user.id),
              fetchUserCases(session.user.id)
            ]);
          }
        }
        
        setLoading(false);
      }
    );

    // Initialize auth
    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []); // Empty dependency array to avoid re-running

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
