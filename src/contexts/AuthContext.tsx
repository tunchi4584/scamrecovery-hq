
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
  const [refreshing, setRefreshing] = useState(false);

  const refreshUserData = async (currentUser?: User) => {
    const userToUse = currentUser || user;
    if (!userToUse || refreshing) {
      console.log('No user to refresh data for or already refreshing');
      return;
    }

    setRefreshing(true);
    try {
      console.log('Refreshing user data for:', userToUse.id);

      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userToUse.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
      } else if (profileData) {
        setProfile(profileData);
      }

      // Fetch cases
      const { data: casesData, error: casesError } = await supabase
        .from('cases')
        .select('*')
        .eq('user_id', userToUse.id)
        .order('created_at', { ascending: false });

      if (casesError) {
        console.error('Error fetching cases:', casesError);
      } else if (casesData) {
        setCases(casesData || []);
      }

      // Fetch balance
      const { data: balanceData, error: balanceError } = await supabase
        .from('balances')
        .select('*')
        .eq('user_id', userToUse.id)
        .single();

      if (balanceError) {
        console.error('Error fetching balance:', balanceError);
      } else if (balanceData) {
        setBalance(balanceData);
      }

      // Check admin role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userToUse.id)
        .eq('role', 'admin')
        .single();

      if (roleError) {
        console.log('No admin role found (this is normal for regular users)');
        setIsAdmin(false);
      } else {
        setIsAdmin(!!roleData);
      }

    } catch (error) {
      console.error('Error refreshing user data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Error getting session:", error);
          return;
        }
        
        if (mounted) {
          if (session?.user) {
            setUser(session.user);
            await refreshUserData(session.user);
          }
          setLoading(false);
        }
      } catch (error) {
        console.error("Error getting session:", error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      if (mounted) {
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Use setTimeout to avoid blocking the auth state change
          setTimeout(() => {
            if (mounted) {
              refreshUserData(session.user);
            }
          }, 0);
        } else {
          setProfile(null);
          setCases([]);
          setBalance(null);
          setIsAdmin(false);
        }
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []); // Remove refreshUserData from dependencies to prevent loops

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
