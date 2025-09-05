
import { createContext, useContext, useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

export interface UserCase {
  id: string;
  title: string;
  amount: number;
  amount_recovered: number;
  recovery_notes: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  case_number: string | null;
  description: string | null;
  scam_type: string | null;
  evidence: string | null;
  submission_id: string | null;
}

// Export Case as alias for UserCase for backward compatibility
export type Case = UserCase;

interface UserBalance {
  id: string;
  amount_lost: number;
  amount_recovered: number;
  recovery_notes: string | null;
  total_cases: number;
  completed_cases: number;
  pending_cases: number;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  cases: UserCase[];
  balance: UserBalance | null;
  isAdmin: boolean;
  loading: boolean;
  refreshUserData: () => Promise<void>;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>;
  adminLogin: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [cases, setCases] = useState<UserCase[]>([]);
  const [balance, setBalance] = useState<UserBalance | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      try {
        console.log('AuthProvider initializing...');
        console.log('Getting initial session...');
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          console.log('Setting user from session:', session.user.id);
          setUser(session.user);
          await refreshUserData(session.user);
        }
      } catch (error) {
        console.error("Error getting session:", error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      setUser(session?.user ?? null);
      if (session?.user) {
        console.log('User signed in, fetching data...');
        console.log('Fetching user data for:', session.user.id);
        // Use setTimeout to avoid blocking the auth state change
        setTimeout(() => {
          refreshUserData(session.user);
        }, 0);
      } else {
        setProfile(null);
        setCases([]);
        setBalance(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    // Failsafe to ensure loading doesn't stay true indefinitely
    const timeout = setTimeout(() => {
      console.log('Failsafe: Setting loading to false after 5 seconds');
      setLoading(false);
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  // Set up real-time subscriptions for balance and case updates
  useEffect(() => {
    if (!user) return;

    const balanceChannel = supabase
      .channel(`auth-balance-updates-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'balances',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('AuthContext: Real-time balance update received:', payload);
          refreshUserData();
        }
      )
      .subscribe();

    const caseChannel = supabase
      .channel(`auth-case-updates-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cases',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('AuthContext: Real-time case update received:', payload);
          refreshUserData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(balanceChannel);
      supabase.removeChannel(caseChannel);
    };
  }, [user]);

  const refreshUserData = async (currentUser?: User) => {
    const userToUse = currentUser || user;
    if (!userToUse) return;

    try {
      console.log('Refreshing user data for:', userToUse.id);

      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userToUse.id)
        .single();

      if (profileData) {
        setProfile(profileData);
      }

      // Fetch cases with recovery amounts
      const { data: casesData } = await supabase
        .from('cases')
        .select('*, amount_recovered, recovery_notes')
        .eq('user_id', userToUse.id)
        .order('created_at', { ascending: false });

      if (casesData) {
        setCases(casesData);
      }

      // Fetch balance with better error handling
      const { data: balanceData, error: balanceError } = await supabase
        .from('balances')
        .select('*')
        .eq('user_id', userToUse.id)
        .maybeSingle();

      console.log('Balance query result:', { balanceData, balanceError });
      
      if (balanceData) {
        setBalance(balanceData);
      } else {
        console.log('No balance data found for user:', userToUse.id);
        setBalance(null);
      }

      // Check admin role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userToUse.id)
        .eq('role', 'admin')
        .single();

      setIsAdmin(!!roleData);

    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, name: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
        },
        emailRedirectTo: `${window.location.origin}/`,
      },
    });
    return { error };
  };

  const adminLogin = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Admin login error:', error);
        return false;
      }

      if (!data.user) {
        console.error('No user data after login');
        return false;
      }

      // Check if user has admin role after login
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', data.user.id)
        .eq('role', 'admin')
        .single();

      const hasAdminRole = !!roleData;
      console.log('Admin role check result:', hasAdminRole);
      
      return hasAdminRole;
    } catch (error) {
      console.error('Admin login error:', error);
      return false;
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      setCases([]);
      setBalance(null);
      setIsAdmin(false);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const logout = signOut; // Alias for signOut

  const value = {
    user,
    profile,
    cases,
    balance,
    isAdmin,
    loading,
    refreshUserData: () => refreshUserData(),
    signOut,
    signIn,
    signUp,
    adminLogin,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
