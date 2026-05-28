import type { Department, Priority, RoutingDecision, RoutingRule } from '@/types';

type IncomingMessage = {
  message: string;
  category?: string;
  sourcePage?: string;
};

const priorityRank: Record<Priority, number> = {
  Low: 1,
  Medium: 2,
  High: 3,
  Urgent: 4,
};

export const departments: Department[] = [
  'Marketing',
  'HR',
  'Customer Support',
  'Sales',
  'Operations',
  'Accounts / Finance',
  'PR / Media',
  'IT Support',
  'Admin',
  'Legal / Compliance',
  'Business Development',
];

export const defaultRoutingRules: RoutingRule[] = [
  {
    id: 'r1',
    name: 'Vacancy Inquiry Rule',
    keywords: ['vacancy', 'job', 'cv', 'resume', 'internship', 'career'],
    targetDepartment: 'HR',
    priority: 'Medium',
    active: true,
    description: 'Routes job, CV, internship, and career inquiries to HR',
    routingReason: 'Message contains career-related keywords.',
    nextAction: 'HR team should review candidate inquiry.',
    createdAt: '2026-01-15',
  },
  {
    id: 'r2',
    name: 'Marketing Campaign Rule',
    keywords: ['offer', 'campaign', 'promotion', 'collaboration', 'sponsorship', 'advertising'],
    targetDepartment: 'Marketing',
    priority: 'Medium',
    active: true,
    description: 'Routes offers, campaigns, and collaborations to Marketing',
    routingReason: 'Message contains marketing, offer, or collaboration keywords.',
    nextAction: 'Marketing team should qualify the campaign opportunity.',
    createdAt: '2026-01-15',
  },
  {
    id: 'r3',
    name: 'Finance Payment Rule',
    keywords: ['refund', 'payment', 'deducted', 'bill', 'invoice', 'transaction'],
    targetDepartment: 'Accounts / Finance',
    priority: 'High',
    active: true,
    description: 'Routes refunds, payment deductions, bills, invoices, and transactions to Finance',
    routingReason: 'Message contains billing or payment keywords.',
    nextAction: 'Finance team should verify the transaction and respond.',
    createdAt: '2026-01-15',
  },
  {
    id: 'r4',
    name: 'Customer Complaint Rule',
    keywords: ['complaint', 'complain', 'bad service', 'delay', 'delayed', 'no response', 'not satisfied'],
    targetDepartment: 'Customer Support',
    priority: 'High',
    active: true,
    description: 'Routes complaints and dissatisfaction reports to Customer Support',
    routingReason: 'Message contains complaint or service dissatisfaction keywords.',
    nextAction: 'Support team should acknowledge the complaint and escalate if needed.',
    createdAt: '2026-01-20',
  },
  {
    id: 'r5',
    name: 'Operations Fulfillment Rule',
    keywords: ['order', 'delivery', 'booking', 'ticket', 'tracking'],
    targetDepartment: 'Operations',
    priority: 'High',
    active: true,
    description: 'Routes order, delivery, booking, ticket, and tracking issues to Operations',
    routingReason: 'Message contains order or fulfillment keywords.',
    nextAction: 'Operations team should check fulfillment status.',
    createdAt: '2026-01-20',
  },
  {
    id: 'r6',
    name: 'Sales Opportunity Rule',
    keywords: ['price', 'quote', 'bulk', 'corporate package', 'business inquiry'],
    targetDepartment: 'Sales',
    priority: 'High',
    active: true,
    description: 'Routes pricing, quotes, bulk requests, and corporate package inquiries to Sales',
    routingReason: 'Message contains pricing or sales-opportunity keywords.',
    nextAction: 'Sales team should contact the lead and qualify the opportunity.',
    createdAt: '2026-02-01',
  },
  {
    id: 'r7',
    name: 'PR Media Rule',
    keywords: ['media', 'press', 'interview', 'news', 'statement'],
    targetDepartment: 'PR / Media',
    priority: 'High',
    active: true,
    description: 'Routes media, press, interview, news, and statement requests to PR',
    routingReason: 'Message contains media or public statement keywords.',
    nextAction: 'PR team should prepare an official response.',
    createdAt: '2026-02-01',
  },
  {
    id: 'r8',
    name: 'IT Support Rule',
    keywords: ['website error', 'app issue', 'app error', 'login problem', 'login error', 'technical error', 'system not working'],
    targetDepartment: 'IT Support',
    priority: 'High',
    active: true,
    description: 'Routes website, app, login, technical, and system issues to IT Support',
    routingReason: 'Message contains application or technical failure keywords.',
    nextAction: 'IT Support should reproduce the issue and update the customer.',
    createdAt: '2026-02-10',
  },
  {
    id: 'r9',
    name: 'Business Development Rule',
    keywords: ['vendor', 'partnership', 'proposal', 'business deal', 'contract'],
    targetDepartment: 'Business Development',
    priority: 'Medium',
    active: true,
    description: 'Routes vendor, partnership, proposal, and business deal inquiries to Business Development',
    routingReason: 'Message contains vendor, proposal, or partnership keywords.',
    nextAction: 'Business Development should review the proposal fit.',
    createdAt: '2026-02-15',
  },
  {
    id: 'r10',
    name: 'Legal Compliance Rule',
    keywords: ['legal', 'policy', 'compliance', 'agreement', 'fake page', 'unauthorized'],
    targetDepartment: 'Legal / Compliance',
    priority: 'Urgent',
    active: true,
    description: 'Routes legal, policy, compliance, agreement, fake page, and unauthorized-use matters to Legal',
    routingReason: 'Message contains legal or compliance risk keywords.',
    nextAction: 'Legal team should review risk and define the response.',
    createdAt: '2026-03-01',
  },
];

function normalize(value: string) {
  return value.toLowerCase().replace(/\s+/g, ' ').trim();
}

function getSearchText(input: string | IncomingMessage) {
  if (typeof input === 'string') return normalize(input);

  return normalize([input.message, input.category, input.sourcePage].filter(Boolean).join(' '));
}

function getConfidence(matchedKeywords: string[]) {
  if (matchedKeywords.length === 0) return 30;

  const longestKeyword = Math.max(...matchedKeywords.map((keyword) => keyword.length));
  return Math.min(98, 68 + matchedKeywords.length * 9 + Math.min(12, Math.floor(longestKeyword / 2)));
}

function getMatchedKeywords(searchText: string, keywords: string[]) {
  return keywords.filter((keyword) => searchText.includes(normalize(keyword)));
}

export function routeInquiry(
  input: string | IncomingMessage,
  rules: RoutingRule[] = defaultRoutingRules,
): RoutingDecision {
  const searchText = getSearchText(input);

  const matches = rules
    .filter((rule) => rule.active)
    .map((rule, index) => ({
      rule,
      index,
      matchedKeywords: getMatchedKeywords(searchText, rule.keywords),
    }))
    .filter((match) => match.matchedKeywords.length > 0)
    .sort((a, b) => {
      const keywordDelta = b.matchedKeywords.length - a.matchedKeywords.length;
      if (keywordDelta !== 0) return keywordDelta;

      const priorityDelta = priorityRank[b.rule.priority] - priorityRank[a.rule.priority];
      if (priorityDelta !== 0) return priorityDelta;

      return a.index - b.index;
    });

  const bestMatch = matches[0];

  if (!bestMatch) {
    return {
      routedDepartment: 'Admin',
      assignedDepartment: 'Admin',
      priority: 'Low',
      matchedRule: 'No Matching Rule',
      matchedKeywords: [],
      confidence: 30,
      routingReason: 'No configured keyword matched this message.',
      nextAction: 'Admin should review and assign the inquiry manually.',
    };
  }

  return {
    routedDepartment: bestMatch.rule.targetDepartment,
    assignedDepartment: bestMatch.rule.targetDepartment,
    priority: bestMatch.rule.priority,
    matchedRule: bestMatch.rule.name,
    matchedKeywords: bestMatch.matchedKeywords,
    confidence: getConfidence(bestMatch.matchedKeywords),
    routingReason:
      bestMatch.rule.routingReason ??
      `Message contains keywords for ${bestMatch.rule.targetDepartment}.`,
    nextAction:
      bestMatch.rule.nextAction ??
      `${bestMatch.rule.targetDepartment} should review and respond.`,
  };
}
