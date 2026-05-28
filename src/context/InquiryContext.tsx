/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { departmentOwners, mockRoutingRules } from '@/data/mockData';
import { addInquiry as persistInquiry, getInquiries, saveInquiries } from '@/lib/inquiryStore';
import { routeInquiry } from '@/lib/routingEngine';
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
  addInquiry: (input: NewInquiryInput) => Inquiry;
  updateInquiry: (id: string, updates: Partial<Inquiry>) => void;
  toggleRoutingRule: (id: string) => void;
  updateRoutingRule: (id: string, updates: Partial<RoutingRule>) => void;
  deleteRoutingRule: (id: string) => void;
  addRoutingRule: (rule: Omit<RoutingRule, 'id' | 'createdAt'>) => void;
};

const InquiryContext = createContext<InquiryContextValue | undefined>(undefined);

function getSlaHours(priority: Inquiry['priority']) {
  if (priority === 'Urgent') return 2;
  if (priority === 'High') return 4;
  return 8;
}

function getPreview(message: string) {
  return message.length > 74 ? `${message.slice(0, 71)}...` : message;
}

type InquiryProviderProps = {
  children: ReactNode;
};

export function InquiryProvider({ children }: InquiryProviderProps) {
  const [inquiries, setInquiries] = useState<Inquiry[]>(() => getInquiries());
  const [routingRules, setRoutingRules] = useState<RoutingRule[]>(() => mockRoutingRules);

  const value = useMemo<InquiryContextValue>(() => ({
    inquiries,
    routingRules,
    addInquiry: (input) => {
      const routing = routeInquiry(
        { message: input.message, category: input.category, sourcePage: input.sourcePage },
        routingRules,
      );
      const createdAt = new Date();
      const status = input.status ?? 'Assigned';
      const assignedOwner = status === 'New' ? undefined : departmentOwners[routing.routedDepartment];
      const inquiry: Inquiry = {
        id: `inq-${Date.now()}`,
        customerName: input.customerName,
        customerEmail: input.customerEmail,
        customerPhone: input.customerPhone,
        companyName: input.companyName || undefined,
        customer: {
          id: `customer-${Date.now()}`,
          name: input.customerName,
          email: input.customerEmail,
          phone: input.customerPhone,
          company: input.companyName || undefined,
        },
        message: input.message,
        messagePreview: getPreview(input.message),
        channel: input.channel,
        category: input.category,
        routedDepartment: routing.routedDepartment,
        assignedDepartment: routing.assignedDepartment,
        assignedOwner,
        priority: routing.priority,
        matchedRule: routing.matchedRule,
        matchedKeywords: routing.matchedKeywords,
        routingReason: routing.routingReason,
        confidence: routing.confidence,
        department: routing.routedDepartment,
        assignee: assignedOwner,
        responseOwner: assignedOwner,
        status,
        tags: Array.from(new Set([input.category.toLowerCase(), input.channel, ...routing.matchedKeywords.slice(0, 3)])),
        createdAt: createdAt.toISOString(),
        slaDeadline: new Date(createdAt.getTime() + getSlaHours(routing.priority) * 60 * 60 * 1000).toISOString(),
        isOverdue: false,
        lastResponseAt: undefined,
        sourcePage: input.sourcePage,
        leadSource: input.leadSource ?? input.channel,
        nextAction: routing.nextAction,
        routingOverridden: false,
        timeline: [
          {
            id: `tl-${Date.now()}-created`,
            type: 'created',
            message: `Inquiry received via ${input.channel}`,
            timestamp: createdAt.toISOString(),
          },
          {
            id: `tl-${Date.now()}-routing`,
            type: 'routing',
            message: `Automatically routed to ${routing.routedDepartment} by ${routing.matchedRule}`,
            timestamp: createdAt.toISOString(),
            user: 'ReplyRoute Engine',
          },
          ...(assignedOwner
            ? [{
              id: `tl-${Date.now()}-assignment`,
              type: 'assignment' as const,
              message: `Assigned to ${assignedOwner} (${routing.routedDepartment})`,
              timestamp: createdAt.toISOString(),
              user: 'ReplyRoute Engine',
            }]
            : []),
        ],
        notes: [],
      };

      setInquiries((current) => {
        const next = [inquiry, ...current];
        persistInquiry(inquiry);
        return next;
      });
      return inquiry;
    },
    updateInquiry: (id, updates) => {
      setInquiries((current) => {
        const next = current.map((inquiry) => (
          inquiry.id === id ? { ...inquiry, ...updates } : inquiry
        ));
        saveInquiries(next);
        return next;
      });
    },
    toggleRoutingRule: (id) => {
      setRoutingRules((current) => current.map((rule) => (
        rule.id === id ? { ...rule, active: !rule.active } : rule
      )));
    },
    updateRoutingRule: (id, updates) => {
      setRoutingRules((current) => current.map((rule) => (
        rule.id === id ? { ...rule, ...updates } : rule
      )));
    },
    deleteRoutingRule: (id) => {
      setRoutingRules((current) => current.filter((rule) => rule.id !== id));
    },
    addRoutingRule: (rule) => {
      setRoutingRules((current) => [
        ...current,
        {
          ...rule,
          id: `r-${Date.now()}`,
          createdAt: new Date().toISOString().slice(0, 10),
        },
      ]);
    },
  }), [inquiries, routingRules]);

  return <InquiryContext.Provider value={value}>{children}</InquiryContext.Provider>;
}

export function useInquiries() {
  const context = useContext(InquiryContext);
  if (!context) {
    throw new Error('useInquiries must be used inside InquiryProvider');
  }

  return context;
}
