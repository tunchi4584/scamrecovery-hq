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

interface UserCase {
  id: string;
  title: string;
  amount: number;
  status: string;
  created_at: string;
  case_number: string | null;
}

interface UserBalance {
  id: string;
  amount_lost: number;
  amount_recovered: number;
  recovery_notes: string | null;
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
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
      } catch (error) {
        console.error("Error getting session:", error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  const setSession = (session: Session | null) => {
    if (session) {
      setUser(session.user);
      refreshUserData();
    } else {
      setUser(null);
      setProfile(null);
      setCases([]);
      setBalance(null);
      setIsAdmin(false);
    }
  };

  const refreshUserData = async () => {
    if (!user) return;

    try {
      console.log('Refreshing user data for:', user.id);

      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
      }

      // Fetch cases
      const { data: casesData } = await supabase
        .from('cases')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (casesData) {
        setCases(casesData);
      }

      // Fetch balance
      const { data: balanceData } = await supabase
        .from('balances')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (balanceData) {
        setBalance(balanceData);
      }

      // Check admin role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();

      setIsAdmin(!!roleData);

    } catch (error) {
      console.error('Error refreshing user data:', error);
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

  const value = {
    user,
    profile,
    cases,
    balance,
    isAdmin,
    loading,
    refreshUserData,
    signOut
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
