
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

  // Direct admin role check without using context state
  const checkAdminRoleDirect = async (userId: string): Promise<boolean> => {
    try {
      console.log('Checking admin role for user:', userId);
      
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
      
      const hasAdminRole = data?.role === 'admin';
      console.log('Admin role check result:', hasAdminRole);
      return hasAdminRole;
    } catch (error) {
      console.error('Exception in admin role check:', error);
      return false;
    }
  };

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
        return null;
      }
      
      console.log('Profile fetched successfully:', data);
      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
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
        return [];
      }
      
      console.log('Cases fetched successfully:', data?.length || 0, 'cases');
      return data || [];
    } catch (error) {
      console.error('Error fetching user cases:', error);
      return [];
    }
  };

  const checkAdminRole = async (): Promise<boolean> => {
    if (!user?.id) {
      console.log('No user ID available for admin check');
      return false;
    }
    
    return checkAdminRoleDirect(user.id);
  };

  const refreshUserData = async () => {
    if (!user?.id) {
      console.log('No user ID for refresh');
      return;
    }
    
    console.log('Refreshing user data for:', user.id);
    
    try {
      // Fetch admin role and user data in parallel
      const [adminResult, profileResult, casesResult] = await Promise.all([
        checkAdminRoleDirect(user.id),
        fetchUserProfile(user.id),
        fetchUserCases(user.id)
      ]);
      
      setIsAdmin(adminResult);
      if (profileResult) setProfile(profileResult);
      setCases(casesResult);
      
      console.log('User data refresh completed');
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  const adminLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('Starting admin login for:', email);
      setLoading(true);
      
      // Clear any existing session
      await supabase.auth.signOut();
      
      // Attempt login
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

      // Check admin role directly
      const hasAdminRole = await checkAdminRoleDirect(data.user.id);

      if (!hasAdminRole) {
        console.error('User is not admin');
        await supabase.auth.signOut();
        return false;
      }

      console.log('Admin login successful');
      
      // Set states for successful admin login
      setUser(data.user);
      setSession(data.session);
      setIsAdmin(true);
      
      // Fetch additional data
      const [profileResult, casesResult] = await Promise.all([
        fetchUserProfile(data.user.id),
        fetchUserCases(data.user.id)
      ]);
      
      if (profileResult) setProfile(profileResult);
      setCases(casesResult);
      
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
      console.log('Logging out user');
      setLoading(true);
      
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
    } finally {
      setLoading(false);
    }
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
          if (mounted) setLoading(false);
          return;
        }

        if (mounted && currentSession?.user) {
          console.log('Found existing session for user:', currentSession.user.email);
          
          setSession(currentSession);
          setUser(currentSession.user);
          
          // Fetch user data
          const [adminResult, profileResult, casesResult] = await Promise.all([
            checkAdminRoleDirect(currentSession.user.id),
            fetchUserProfile(currentSession.user.id),
            fetchUserCases(currentSession.user.id)
          ]);
          
          if (mounted) {
            setIsAdmin(adminResult);
            if (profileResult) setProfile(profileResult);
            setCases(casesResult);
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

        if (session?.user && event === 'SIGNED_IN') {
          console.log('User signed in, updating state');
          
          setSession(session);
          setUser(session.user);
          
          // Fetch user data in background
          setTimeout(async () => {
            if (!mounted) return;
            
            try {
              const [adminResult, profileResult, casesResult] = await Promise.all([
                checkAdminRoleDirect(session.user.id),
                fetchUserProfile(session.user.id),
                fetchUserCases(session.user.id)
              ]);
              
              if (mounted) {
                setIsAdmin(adminResult);
                if (profileResult) setProfile(profileResult);
                setCases(casesResult);
              }
            } catch (error) {
              console.error('Error fetching user data after sign in:', error);
            }
          }, 0);
        }
        
        if (event === 'TOKEN_REFRESHED' && session) {
          console.log('Token refreshed');
          setSession(session);
          setUser(session.user);
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
  }, []); // Empty dependency array

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
