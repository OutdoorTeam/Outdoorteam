import * as React from 'react';
import { supabase } from '@/supabase';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { apiRequest } from '@/utils/error-handling';

interface UserFeatures {
  habits: boolean;
  training: boolean;
  nutrition: boolean;
  meditation: boolean;
  active_breaks: boolean;
}

interface AppUser {
  id: string; // Our internal DB id, now a UUID string
  email: string;
  full_name: string;
  role: string;
  plan_type?: string | null;
  features: UserFeatures;
}

interface AuthContextType {
  user: AppUser | null;
  session: Session | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  assignPlan: (planId: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = React.useState<AppUser | null>(null);
  const [session, setSession] = React.useState<Session | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session?.user) {
        await fetchAppUser(session.user);
      }
      setIsLoading(false);
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        if (session?.user) {
          await fetchAppUser(session.user);
        } else {
          setUser(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchAppUser = async (supabaseUser: SupabaseUser) => {
    try {
      // Use our backend to get the user profile from our public.users table
      const appUser = await apiRequest<AppUser>('/api/auth/me');
      setUser(appUser);
    } catch (error) {
      console.error('Error fetching app user profile:', error);
      // If fetching our profile fails, the user might not be synced yet.
      // This can happen on first login. We can log them out or show a limited state.
      setUser(null);
    }
  };

  const refreshUser = async () => {
    const { data: { user: supabaseUser } } = await supabase.auth.getUser();
    if (supabaseUser) {
      await fetchAppUser(supabaseUser);
    }
  };

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const register = async (fullName: string, email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    if (error) throw error;
    // After sign up, a Supabase trigger/webhook should sync the user to our public.users table.
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    setSession(null);
  };

  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    if (error) throw error;
  };

  const assignPlan = async (planId: string) => {
    if (!user) throw new Error('No user logged in');
    // This logic remains, as it's a custom backend operation
    await apiRequest(`/api/users/${user.id}/assign-plan`, {
      method: 'POST',
      body: JSON.stringify({ planId }),
    });
    await refreshUser();
  };

  const value = React.useMemo(() => ({
    user,
    session,
    isLoading,
    login,
    register,
    logout,
    loginWithGoogle,
    assignPlan,
    refreshUser,
  }), [user, session, isLoading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
