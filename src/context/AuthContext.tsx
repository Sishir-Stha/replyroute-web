/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { clearStoredAuth, getStoredToken, getStoredUser, setStoredToken, setStoredUser } from '@/lib/authStorage';
import { getCurrentUser, loginRequest } from '@/services/authService';
import type { DemoUser, UserRole } from '@/types';

export const demoUsers: DemoUser[] = [
  {
    id: 'u-super-admin',
    name: 'Super Admin',
    email: 'admin@replyroute.com',
    role: 'SUPER_ADMIN',
    department: 'All',
  },
  {
    id: 'u-hr-head',
    name: 'Aayush HR Head',
    email: 'hr.head@yeti.com',
    role: 'DEPARTMENT_HEAD',
    department: 'HR',
  },
  {
    id: 'u-marketing-head',
    name: 'Maya Marketing Head',
    email: 'marketing.head@yeti.com',
    role: 'DEPARTMENT_HEAD',
    department: 'Marketing',
  },
  {
    id: 'u-support-head',
    name: 'Suman Support Head',
    email: 'support.head@yeti.com',
    role: 'DEPARTMENT_HEAD',
    department: 'Customer Support',
  },
  {
    id: 'u-hr-handler',
    name: 'Rita HR Handler',
    email: 'hr.user@yeti.com',
    role: 'SOCIAL_MEDIA_HANDLER',
    department: 'HR',
  },
  {
    id: 'u-marketing-handler',
    name: 'Nisha Marketing Handler',
    email: 'marketing.user@yeti.com',
    role: 'SOCIAL_MEDIA_HANDLER',
    department: 'Marketing',
  },
  {
    id: 'u-support-handler',
    name: 'Prakash Support Handler',
    email: 'support.user@yeti.com',
    role: 'SOCIAL_MEDIA_HANDLER',
    department: 'Customer Support',
  },
  {
    id: 'u-accounts-handler',
    name: 'Bina Accounts Handler',
    email: 'accounts.user@yeti.com',
    role: 'SOCIAL_MEDIA_HANDLER',
    department: 'Accounts / Finance',
  },
];

type LoginResult = {
  success: boolean;
  message?: string;
};

type AuthContextValue = {
  user: DemoUser | null;
  currentUser: DemoUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => void;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<DemoUser | null>(() => getStoredUser());
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [isLoading, setIsLoading] = useState(Boolean(getStoredToken()));

  const logout = useCallback(() => {
    clearStoredAuth();
    setUser(null);
    setToken(null);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const storedToken = getStoredToken();

    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    getCurrentUser()
      .then((freshUser) => {
        if (cancelled) return;
        setStoredUser(freshUser);
        setUser(freshUser);
        setToken(storedToken);
      })
      .catch(() => {
        if (cancelled) return;
        logout();
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [logout]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    currentUser: user,
    token,
    isAuthenticated: Boolean(user && token),
    isLoading,
    login: async (email: string, password: string) => {
      try {
        const result = await loginRequest(email.trim().toLowerCase(), password);
        setStoredToken(result.token);
        setStoredUser(result.user);
        setToken(result.token);
        setUser(result.user);
        return { success: true };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to sign in.';
        return { success: false, message };
      }
    },
    logout,
    hasRole: (role) => user?.role === role,
    hasAnyRole: (roles) => (user ? roles.includes(user.role) : false),
  }), [isLoading, logout, token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
