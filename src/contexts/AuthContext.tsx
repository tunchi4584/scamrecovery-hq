
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  email: string;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserCase {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  scam_type: string | null;
  amount: number;
  evidence: string | null;
  status: string;
  case_number: string | null;
  submission_id: string | null;
  created_at: string;
  updated_at: string;
}

interface Balance {
  id: string;
  user_id: string;
  amount_lost: number;
  amount_recovered: number;
  total_cases: number | null;
  completed_cases: number | null;
  pending_cases: number | null;
  recovery_notes: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  cases: UserCase[];
  balance: Balance | null;
  loading: boolean;
  isAdmin: boolean;
  refreshUserData: () => Promise<void>;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>;
  adminLogin: (email: string, password: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  cases: [],
  balance: null,
  loading: true,
  isAdmin: false,
  refreshUserData: async () => {},
  signOut: async () => {},
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  adminLogin: async () => false,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [cases, setCases] = useState<UserCase[]>([]);
  const [balance, setBalance] = useState<Balance | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const { toast } = useToast();

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name: name,
          }
        }
      });
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const adminLogin = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Admin login error:', error);
        return false;
      }

      // Check if user has admin role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (roleError || !roleData) {
        console.log('User is not an admin');
        await supabase.auth.signOut();
        return false;
      }

      return true;
    } catch (error) {
      console.error('Admin login error:', error);
      return false;
    }
  };

  const fetchUserData = async (currentUser: User) => {
    if (dataLoading) {
      console.log('Data fetch already in progress, skipping...');
      return;
    }

    setDataLoading(true);
    try {
      console.log('Fetching user data for:', currentUser.id);

      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
      } else {
        console.log('Profile fetched:', profileData);
        setProfile(profileData);
      }

      // Fetch cases
      const { data: casesData, error: casesError } = await supabase
        .from('cases')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (casesError) {
        console.error('Error fetching cases:', casesError);
      } else {
        console.log('Cases fetched:', casesData?.length || 0);
        setCases(casesData || []);
      }

      // Fetch balance
      const { data: balanceData, error: balanceError } = await supabase
        .from('balances')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (balanceError) {
        console.error('Error fetching balance:', balanceError);
      } else {
        console.log('Balance fetched:', balanceData);
        setBalance(balanceData);
      }

      // Check admin role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', currentUser.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (roleError) {
        console.log('No admin role found (this is normal for regular users)');
        setIsAdmin(false);
      } else {
        console.log('Admin role check:', !!roleData);
        setIsAdmin(!!roleData);
      }

    } catch (error) {
      console.error('Error fetching user data:', error);
      toast({
        title: "Error",
        description: "Failed to load user data",
        variant: "destructive"
      });
    } finally {
      setDataLoading(false);
    }
  };

  const refreshUserData = async () => {
    if (user) {
      await fetchUserData(user);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear all state
      setUser(null);
      setProfile(null);
      setCases([]);
      setBalance(null);
      setIsAdmin(false);
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    let mounted = true;
    console.log('AuthProvider initializing...');

    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id || 'no user');
        
        if (!mounted) {
          console.log('Component unmounted, ignoring auth state change');
          return;
        }

        if (session?.user) {
          console.log('Setting user from session:', session.user.id);
          setUser(session.user);
          
          // Only fetch data on sign in, not on every token refresh
          if (event === 'SIGNED_IN') {
            console.log('User signed in, fetching data...');
            await fetchUserData(session.user);
          }
        } else {
          console.log('No session, clearing user data');
          setUser(null);
          setProfile(null);
          setCases([]);
          setBalance(null);
          setIsAdmin(false);
        }
      }
    );

    // Get initial session
    const initializeAuth = async () => {
      try {
        console.log('Getting initial session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          return;
        }

        if (session?.user && mounted) {
          console.log('Initial session found for user:', session.user.id);
          setUser(session.user);
          await fetchUserData(session.user);
        } else {
          console.log('No initial session found');
        }
      } catch (error) {
        console.error('Error in initializeAuth:', error);
      } finally {
        if (mounted) {
          console.log('Setting loading to false');
          setLoading(false);
        }
      }
    };

    // Initialize auth
    initializeAuth();

    return () => {
      console.log('AuthProvider cleanup');
      mounted = false;
      subscription.unsubscribe();
    };
  }, []); // Empty dependency array is correct

  // Separate timeout to ensure loading is set to false even if initialization fails
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      console.log('Failsafe: Setting loading to false after 5 seconds');
      setLoading(false);
    }, 5000);

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        cases,
        balance,
        loading,
        isAdmin,
        refreshUserData,
        signOut,
        signIn,
        signUp,
        adminLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
