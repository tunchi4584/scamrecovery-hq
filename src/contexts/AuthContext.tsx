
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

interface Case {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  scam_type: string | null;
  amount: number;
  evidence: string | null;
  status: string;
  case_number: string | null;
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
  cases: Case[];
  balance: Balance | null;
  loading: boolean;
  isAdmin: boolean;
  refreshUserData: () => Promise<void>;
  signOut: () => Promise<void>;
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
  const [cases, setCases] = useState<Case[]>([]);
  const [balance, setBalance] = useState<Balance | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();

  const fetchUserData = async (currentUser: User) => {
    try {
      console.log('Refreshing user data for:', currentUser.id);

      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        throw profileError;
      }

      setProfile(profileData);

      // Fetch cases
      const { data: casesData, error: casesError } = await supabase
        .from('cases')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (casesError) {
        console.error('Error fetching cases:', casesError);
        throw casesError;
      }

      setCases(casesData || []);

      // Fetch balance - handle potential duplicates
      const { data: balanceData, error: balanceError } = await supabase
        .from('balances')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (balanceError) {
        console.error('Error fetching balance:', balanceError);
        // Don't throw error for balance, create one if needed
      } else {
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
        setIsAdmin(!!roleData);
      }

    } catch (error) {
      console.error('Error fetching user data:', error);
      toast({
        title: "Error",
        description: "Failed to load user data",
        variant: "destructive"
      });
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
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setLoading(false);
          return;
        }

        if (session?.user) {
          console.log('Auth state changed: INITIAL_SESSION', session.user.id);
          setUser(session.user);
          await fetchUserData(session.user);
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id || 'no user');
        
        if (session?.user) {
          setUser(session.user);
          await fetchUserData(session.user);
        } else {
          setUser(null);
          setProfile(null);
          setCases([]);
          setBalance(null);
          setIsAdmin(false);
        }
        
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
