import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { isHardcodedRootAdmin, roleToKelasScope, type UserRole as AdminRoleType } from '@/lib/adminRoles';

export type UserRole = AdminRoleType | null;

type AuthContextType = {
  session: Session | null;
  user: User | null;
  isAdmin: boolean;
  userRole: UserRole;
  isRootAdmin: boolean;
  managerKelas: 'neutrino' | null;
  loading: boolean;
  userName: string;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  isAdmin: false,
  userRole: null,
  isRootAdmin: false,
  managerKelas: null,
  loading: true,
  userName: '',
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  const checkAdminRole = useCallback(async (email?: string) => {
    if (!email) {
      setIsAdmin(false);
      setUserRole(null);
      return;
    }

    const lowerEmail = email.toLowerCase();

    if (isHardcodedRootAdmin(lowerEmail)) {
      setIsAdmin(true);
      setUserRole('root');
      return;
    }

    try {
      const { data } = await supabase.from('admin_users').select('role').eq('email', lowerEmail).maybeSingle();
      const dbRole = data?.role as UserRole;
      if (dbRole && ['root', 'manager_ikhwa'].includes(dbRole)) {
        setIsAdmin(true);
        setUserRole(dbRole);
      } else {
        setIsAdmin(false);
        setUserRole(null);
      }
    } catch {
      setIsAdmin(false);
      setUserRole(null);
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      checkAdminRole(currentSession?.user?.email);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      checkAdminRole(currentSession?.user?.email);
    });

    return () => subscription.unsubscribe();
  }, [checkAdminRole]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
    setUserRole(null);
  };

  const user = session?.user ?? null;
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || '';
  const isRootAdmin = isAdmin && userRole === 'root';
  const managerKelas = roleToKelasScope(userRole);

  return (
    <AuthContext.Provider value={{ session, user, isAdmin, userRole, isRootAdmin, managerKelas, loading, userName, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
