
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
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (data && !error) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchUserCases = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('cases')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (data && !error) {
        setCases(data);
      }
    } catch (error) {
      console.error('Error fetching user cases:', error);
    }
  };

  const checkAdminRole = async (): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();
      
      const hasAdminRole = !error && data?.role === 'admin';
      setIsAdmin(hasAdminRole);
      return hasAdminRole;
    } catch (error) {
      console.error('Error checking admin role:', error);
      setIsAdmin(false);
      return false;
    }
  };

  const refreshUserData = async () => {
    if (user) {
      await Promise.all([
        fetchUserProfile(user.id),
        fetchUserCases(user.id),
        checkAdminRole()
      ]);
    }
  };

  const adminLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('Attempting admin login for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Admin login auth error:', error);
        return false;
      }

      if (!data.user) {
        console.error('No user data returned');
        return false;
      }

      console.log('Auth successful, checking admin role for user:', data.user.id);

      // Check if user has admin role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', data.user.id)
        .eq('role', 'admin')
        .maybeSingle();

      console.log('Role check result:', { roleData, roleError });

      if (roleError || !roleData || roleData.role !== 'admin') {
        console.error('User is not admin or role check failed:', roleError);
        await supabase.auth.signOut();
        return false;
      }

      console.log('Admin login successful');
      setIsAdmin(true);
      return true;
    } catch (error) {
      console.error('Admin login exception:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setIsAdmin(false);
      setUser(null);
      setProfile(null);
      setCases([]);
      setSession(null);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        
        // Get current session
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
        }

        if (mounted && currentSession) {
          console.log('Found existing session:', currentSession.user.email);
          setSession(currentSession);
          setUser(currentSession.user);
          
          // Check admin role and fetch data
          const isAdminUser = await checkAdminRole();
          if (isAdminUser) {
            setIsAdmin(true);
          }
          
          // Fetch user data
          await fetchUserProfile(currentSession.user.id);
          await fetchUserCases(currentSession.user.id);
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

        console.log('Auth state change:', event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user && event === 'SIGNED_IN') {
          console.log('User signed in, fetching data...');
          
          // Check admin role
          const isAdminUser = await checkAdminRole();
          if (isAdminUser) {
            setIsAdmin(true);
          }
          
          // Fetch user data
          await fetchUserProfile(session.user.id);
          await fetchUserCases(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out');
          setProfile(null);
          setCases([]);
          setIsAdmin(false);
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
  }, []);

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
