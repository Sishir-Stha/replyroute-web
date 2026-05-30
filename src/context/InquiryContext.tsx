/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  addInquiryNote,
  assignOwner,
  createInquiry,
  getInquiries,
  overrideDepartment,
  replyToInquiry,
  updateInquiryStatus,
} from '@/services/inquiryService';
import {
  createRoutingRule,
  deleteRoutingRule,
  getRoutingRules,
  toggleRoutingRule,
  updateRoutingRule,
} from '@/services/routingRuleService';
import type { Channel, Inquiry, InquiryStatus, RoutingRule } from '@/types';

type NewInquiryInput = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  companyName?: string;
  message: string;
  channel: Channel;
  category: string;
  sourcePage: string;
  leadSource?: string;
  status?: InquiryStatus;
};

type InquiryContextValue = {
  inquiries: Inquiry[];
  routingRules: RoutingRule[];
  isLoading: boolean;
  error: string;
  refreshInquiries: () => Promise<void>;
  refreshRoutingRules: () => Promise<void>;
  addInquiry: (input: NewInquiryInput) => Promise<Inquiry>;
  updateInquiry: (id: string, updates: Partial<Inquiry>) => void;
  replaceInquiry: (inquiry: Inquiry) => void;
  updateStatus: (id: string, status: InquiryStatus) => Promise<Inquiry>;
  addNote: (id: string, note: string, internal?: boolean) => Promise<Inquiry>;
  assignInquiryOwner: (id: string, ownerId: string) => Promise<Inquiry>;
  overrideInquiryDepartment: (id: string, departmentId: string) => Promise<Inquiry>;
  reply: (id: string, message: string) => Promise<Inquiry>;
  toggleRoutingRule: (id: string) => Promise<void>;
  updateRoutingRule: (id: string, updates: Partial<RoutingRule>) => Promise<void>;
  deleteRoutingRule: (id: string) => Promise<void>;
  addRoutingRule: (rule: Omit<RoutingRule, 'id' | 'createdAt'>) => Promise<void>;
};

const InquiryContext = createContext<InquiryContextValue | undefined>(undefined);

type InquiryProviderProps = {
  children: ReactNode;
};

export function InquiryProvider({ children }: InquiryProviderProps) {
  const { isAuthenticated, user } = useAuth();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [routingRules, setRoutingRules] = useState<RoutingRule[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const replaceInquiry = useCallback((inquiry: Inquiry) => {
    setInquiries((current) => current.map((item) => (
      item.id === inquiry.id ? inquiry : item
    )));
  }, []);

  const refreshInquiries = useCallback(async () => {
    if (!isAuthenticated) {
      setInquiries([]);
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      setInquiries(await getInquiries());
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to load inquiries.');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const refreshRoutingRules = useCallback(async () => {
    if (!isAuthenticated || user?.role !== 'SUPER_ADMIN') {
      setRoutingRules([]);
      return;
    }

    try {
      setRoutingRules(await getRoutingRules());
    } catch {
      setRoutingRules([]);
    }
  }, [isAuthenticated, user?.role]);

  useEffect(() => {
    void refreshInquiries();
    void refreshRoutingRules();
  }, [refreshInquiries, refreshRoutingRules]);

  const value = useMemo<InquiryContextValue>(() => ({
    inquiries,
    routingRules,
    isLoading,
    error,
    refreshInquiries,
    refreshRoutingRules,
    addInquiry: async (input) => {
      const inquiry = await createInquiry(input);
      setInquiries((current) => [inquiry, ...current]);
      return inquiry;
    },
    updateInquiry: (id, updates) => {
      setInquiries((current) => current.map((inquiry) => (
        inquiry.id === id ? { ...inquiry, ...updates } : inquiry
      )));
    },
    replaceInquiry,
    updateStatus: async (id, status) => {
      const inquiry = await updateInquiryStatus(id, status);
      replaceInquiry(inquiry);
      return inquiry;
    },
    addNote: async (id, note, internal = true) => {
      const inquiry = await addInquiryNote(id, note, internal);
      replaceInquiry(inquiry);
      return inquiry;
    },
    assignInquiryOwner: async (id, ownerId) => {
      const inquiry = await assignOwner(id, ownerId);
      replaceInquiry(inquiry);
      return inquiry;
    },
    overrideInquiryDepartment: async (id, departmentId) => {
      const inquiry = await overrideDepartment(id, departmentId);
      replaceInquiry(inquiry);
      return inquiry;
    },
    reply: async (id, message) => {
      const inquiry = await replyToInquiry(id, message);
      replaceInquiry(inquiry);
      return inquiry;
    },
    toggleRoutingRule: async (id) => {
      const rule = await toggleRoutingRule(id);
      setRoutingRules((current) => current.map((item) => (item.id === id ? rule : item)));
    },
    updateRoutingRule: async (id, updates) => {
      const currentRule = routingRules.find((rule) => rule.id === id);
      if (!currentRule) return;
      const rule = await updateRoutingRule(id, { ...currentRule, ...updates });
      setRoutingRules((current) => current.map((item) => (item.id === id ? rule : item)));
    },
    deleteRoutingRule: async (id) => {
      await deleteRoutingRule(id);
      setRoutingRules((current) => current.filter((rule) => rule.id !== id));
    },
    addRoutingRule: async (ruleInput) => {
      const rule = await createRoutingRule(ruleInput);
      setRoutingRules((current) => [...current, rule]);
    },
  }), [
    error,
    inquiries,
    isLoading,
    refreshInquiries,
    refreshRoutingRules,
    replaceInquiry,
    routingRules,
  ]);

  return <InquiryContext.Provider value={value}>{children}</InquiryContext.Provider>;
}

export function useInquiries() {
  const context = useContext(InquiryContext);
  if (!context) {
    throw new Error('useInquiries must be used inside InquiryProvider');
  }

  return context;
}
