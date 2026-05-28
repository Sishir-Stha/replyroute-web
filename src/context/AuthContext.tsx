/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { DemoUser } from '@/types';

const STORAGE_KEY = 'replyroute.currentUser';

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

type AuthContextValue = {
  user: DemoUser | null;
  currentUser: DemoUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => { success: boolean; message?: string };
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function getStoredUser() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;

  try {
    const parsed = JSON.parse(stored) as DemoUser;
    return demoUsers.find((user) => user.email === parsed.email) ?? null;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<DemoUser | null>(() => getStoredUser());

  const value = useMemo<AuthContextValue>(() => ({
    user,
    currentUser: user,
    isAuthenticated: Boolean(user),
    login: (email: string, _password: string) => {
      const normalizedEmail = email.trim().toLowerCase();
      const matchedUser = demoUsers.find((demoUser) => demoUser.email === normalizedEmail);

      if (!matchedUser) {
        return { success: false, message: 'Use one of the demo emails listed below.' };
      }

      if (_password !== 'demo123') {
        return { success: false, message: 'Demo password is demo123.' };
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(matchedUser));
      setUser(matchedUser);
      return { success: true };
    },
    logout: () => {
      localStorage.removeItem(STORAGE_KEY);
      setUser(null);
    },
  }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
