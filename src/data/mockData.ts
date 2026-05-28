import type {
  ActivityLog,
  Channel,
  Department,
  DepartmentInfo,
  Inquiry,
  InquiryStatus,
  Integration,
  Priority,
  RoutingRule,
  TeamMember,
} from '@/types';
import { defaultRoutingRules, routeInquiry } from '@/lib/routingEngine';

const customers = [
  { id: 'c1', name: 'Ramesh Shrestha', email: 'ramesh@gmail.com', phone: '9841234567', company: 'Nepal Media Group' },
  { id: 'c2', name: 'Aayushma Karki', email: 'aayushma@daraz.com', phone: '9851234567', company: 'Daraz Nepal' },
  { id: 'c3', name: 'Nabin Gurung', email: 'nabin@gmail.com', phone: '9861234567' },
  { id: 'c4', name: 'Priya Thapa', email: 'priya@ncell.com', phone: '9871234567', company: 'Ncell' },
  { id: 'c5', name: 'Suman Rai', email: 'suman@gmail.com', phone: '9801234567' },
  { id: 'c6', name: 'Anisha Basnet', email: 'anisha@nabil.com', phone: '9811234567', company: 'Nabil Bank' },
  { id: 'c7', name: 'Bikash Adhikari', email: 'bikash@gmail.com', phone: '9821234567' },
  { id: 'c8', name: 'Srijana Maharjan', email: 'srijana@mediainc.com', phone: '9831234567', company: 'Media Inc.' },
  { id: 'c9', name: 'Dipesh Pandey', email: 'dipesh@techsol.com', phone: '9841112233', company: 'TechSolutions' },
  { id: 'c10', name: 'Kabita Limbu', email: 'kabita@gmail.com', phone: '9851112233' },
  { id: 'c11', name: 'Rajesh Tamang', email: 'rajesh@vendorcorp.com', phone: '9861112233', company: 'VendorCorp' },
  { id: 'c12', name: 'Manisha Poudel', email: 'manisha@gmail.com', phone: '9871112233' },
  { id: 'c13', name: 'Sabin KC', email: 'sabin@lawfirm.com', phone: '9801112233', company: 'KC & Associates' },
  { id: 'c14', name: 'Roshani Lama', email: 'roshani@gmail.com', phone: '9811112233' },
  { id: 'c15', name: 'Hari Bahadur Thapa', email: 'hari@bigcorp.com', phone: '9821112233', company: 'BigCorp Nepal' },
];

export const departmentOwners: Record<Department, string> = {
  Marketing: 'Aayushma Karki',
  HR: 'Kabita Limbu',
  'Customer Support': 'Suman Rai',
  Sales: 'Bikash Adhikari',
  Operations: 'Dipesh Pandey',
  'Accounts / Finance': 'Manisha Poudel',
  'PR / Media': 'Srijana Maharjan',
  'IT Support': 'Nabin Gurung',
  Admin: 'Rajesh Tamang',
  'Legal / Compliance': 'Sabin KC',
  'Business Development': 'Priya Thapa',
};

export const mockRoutingRules: RoutingRule[] = defaultRoutingRules;

type InquirySeed = {
  customerIndex: number;
  message: string;
  channel: Channel;
  category: string;
  status: InquiryStatus;
  createdAt: string;
  sourcePage: string;
  isOverdue?: boolean;
  priorityOverride?: Priority;
};

const inquirySeeds: InquirySeed[] = [
  {
    customerIndex: 9,
    message: 'Do you have any vacancy for customer service officer? I want to send my CV.',
    channel: 'email',
    category: 'Vacancy / Career',
    status: 'Assigned',
    createdAt: '2026-05-27T07:00:00',
    sourcePage: 'careers-page',
  },
  {
    customerIndex: 1,
    message: 'We want to collaborate with your company for Dashain campaign offer.',
    channel: 'facebook',
    category: 'Campaign Collaboration',
    status: 'New',
    createdAt: '2026-05-27T08:00:00',
    sourcePage: 'fb-page',
  },
  {
    customerIndex: 2,
    message: 'My payment was deducted but my ticket/order is not confirmed.',
    channel: 'whatsapp',
    category: 'Payment Issue',
    status: 'Escalated',
    createdAt: '2026-05-26T14:00:00',
    sourcePage: 'wa-business',
    isOverdue: true,
    priorityOverride: 'Urgent',
  },
  {
    customerIndex: 4,
    message: 'I want to complain about delayed response from your support team.',
    channel: 'facebook',
    category: 'Complaint',
    status: 'In Progress',
    createdAt: '2026-05-27T05:00:00',
    sourcePage: 'fb-page',
  },
  {
    customerIndex: 8,
    message: 'Your mobile app is showing login error.',
    channel: 'whatsapp',
    category: 'Technical Issue',
    status: 'In Progress',
    createdAt: '2026-05-26T16:00:00',
    sourcePage: 'wa-business',
  },
  {
    customerIndex: 14,
    message: 'Can your sales team contact us for corporate package?',
    channel: 'email',
    category: 'Sales Inquiry',
    status: 'Assigned',
    createdAt: '2026-05-27T06:00:00',
    sourcePage: 'email-general',
  },
  {
    customerIndex: 7,
    message: 'I am from media and need an official statement.',
    channel: 'facebook',
    category: 'Media Inquiry',
    status: 'New',
    createdAt: '2026-05-27T08:30:00',
    sourcePage: 'fb-messenger',
  },
  {
    customerIndex: 10,
    message: 'We are a vendor and want to submit a business proposal.',
    channel: 'email',
    category: 'Vendor Proposal',
    status: 'Assigned',
    createdAt: '2026-05-27T03:00:00',
    sourcePage: 'email-general',
  },
  {
    customerIndex: 11,
    message: 'Can I get an invoice for my transaction?',
    channel: 'email',
    category: 'Billing',
    status: 'Resolved',
    createdAt: '2026-05-27T07:30:00',
    sourcePage: 'email-support',
  },
  {
    customerIndex: 12,
    message: 'There is a fake page using your company name.',
    channel: 'instagram',
    category: 'Brand Risk',
    status: 'Escalated',
    createdAt: '2026-05-25T11:00:00',
    sourcePage: 'ig-dm',
    isOverdue: true,
  },
  {
    customerIndex: 3,
    message: 'My delivery is late and I need tracking for this booking.',
    channel: 'instagram',
    category: 'Delivery Issue',
    status: 'Pending',
    createdAt: '2026-05-26T10:00:00',
    sourcePage: 'ig-dm',
    isOverdue: true,
  },
  {
    customerIndex: 0,
    message: 'Please connect me with the concerned department.',
    channel: 'website',
    category: 'General Inquiry',
    status: 'New',
    createdAt: '2026-05-27T09:00:00',
    sourcePage: 'contact-form',
  },
  {
    customerIndex: 5,
    message: 'Can you explain the policy for corporate travel agreement?',
    channel: 'email',
    category: 'Policy Question',
    status: 'Assigned',
    createdAt: '2026-05-27T04:30:00',
    sourcePage: 'email-legal',
  },
  {
    customerIndex: 6,
    message: 'Please send a price quote for bulk corporate service.',
    channel: 'website',
    category: 'Quote Request',
    status: 'Resolved',
    createdAt: '2026-05-27T02:15:00',
    sourcePage: 'contact-form',
  },
];

function getSlaHours(priority: Priority) {
  if (priority === 'Urgent') return 2;
  if (priority === 'High') return 4;
  return 8;
}

function getPreview(message: string) {
  return message.length > 74 ? `${message.slice(0, 71)}...` : message;
}

function buildInquiry(seed: InquirySeed, index: number): Inquiry {
  const customer = customers[seed.customerIndex];
  const routing = routeInquiry({ message: seed.message, category: seed.category, sourcePage: seed.sourcePage });
  const priority = seed.priorityOverride ?? routing.priority;
  const created = new Date(seed.createdAt);
  const slaDeadline = new Date(created.getTime() + getSlaHours(priority) * 60 * 60 * 1000);
  const assignedOwner = seed.status === 'New' ? undefined : departmentOwners[routing.routedDepartment];
  const timeline: ActivityLog[] = [
    {
      id: `tl-${index}-created`,
      type: 'created',
      message: `Inquiry received via ${seed.channel}`,
      timestamp: seed.createdAt,
    },
    {
      id: `tl-${index}-routing`,
      type: 'routing',
      message: `Automatically routed to ${routing.routedDepartment} by ${routing.matchedRule}`,
      timestamp: new Date(created.getTime() + 2 * 60 * 1000).toISOString(),
      user: 'ReplyRoute Engine',
    },
  ];

  if (assignedOwner) {
    timeline.push({
      id: `tl-${index}-assignment`,
      type: 'assignment',
      message: `Assigned to ${assignedOwner} (${routing.routedDepartment})`,
      timestamp: new Date(created.getTime() + 10 * 60 * 1000).toISOString(),
      user: 'ReplyRoute Engine',
    });
  }

  return {
    id: `inq-${index + 1}`,
    customerName: customer.name,
    customerEmail: customer.email,
    customerPhone: customer.phone,
    companyName: customer.company,
    customer,
    message: seed.message,
    messagePreview: getPreview(seed.message),
    channel: seed.channel,
    category: seed.category,
    routedDepartment: routing.routedDepartment,
    assignedDepartment: routing.assignedDepartment,
    assignedOwner,
    priority,
    matchedRule: routing.matchedRule,
    matchedKeywords: routing.matchedKeywords,
    routingReason: routing.routingReason,
    confidence: routing.confidence,
    department: routing.routedDepartment,
    assignee: assignedOwner,
    responseOwner: assignedOwner,
    status: seed.status,
    tags: Array.from(new Set([seed.category.toLowerCase(), seed.channel, ...routing.matchedKeywords.slice(0, 3)])),
    createdAt: seed.createdAt,
    slaDeadline: slaDeadline.toISOString(),
    isOverdue: Boolean(seed.isOverdue),
    lastResponseAt: seed.status === 'New' ? undefined : new Date(created.getTime() + 30 * 60 * 1000).toISOString(),
    sourcePage: seed.sourcePage,
    leadSource: seed.channel,
    nextAction: routing.nextAction,
    routingOverridden: false,
    timeline,
    notes: index % 4 === 0 && assignedOwner
      ? [{
        id: `n-${index}`,
        message: 'Follow up before SLA deadline.',
        author: assignedOwner,
        timestamp: new Date(created.getTime() + 20 * 60 * 1000).toISOString(),
      }]
      : [],
  };
}

export const mockInquiries: Inquiry[] = inquirySeeds.map(buildInquiry);

export const mockDepartments: DepartmentInfo[] = [
  { id: 'd1', name: 'Customer Support', icon: 'Headphones', openInquiries: 5, avgResponseTime: '45m', members: ['Suman Rai', 'Roshani Lama'], slaTarget: '2 hours', health: 'healthy', resolvedToday: 14, description: 'Handles complaints, issues, and general support' },
  { id: 'd2', name: 'Sales', icon: 'TrendingUp', openInquiries: 3, avgResponseTime: '1h 20m', members: ['Bikash Adhikari', 'Hari Bahadur Thapa'], slaTarget: '4 hours', health: 'healthy', resolvedToday: 8, description: 'Handles pricing, bulk orders, and corporate sales' },
  { id: 'd3', name: 'HR', icon: 'Users', openInquiries: 4, avgResponseTime: '3h', members: ['Kabita Limbu'], slaTarget: '8 hours', health: 'warning', resolvedToday: 2, description: 'Handles recruitment, job inquiries, and career applications' },
  { id: 'd4', name: 'Operations', icon: 'Settings', openInquiries: 3, avgResponseTime: '1h 45m', members: ['Dipesh Pandey', 'Nabin Gurung'], slaTarget: '4 hours', health: 'warning', resolvedToday: 6, description: 'Handles orders, deliveries, bookings, and logistics' },
  { id: 'd5', name: 'Accounts / Finance', icon: 'CreditCard', openInquiries: 3, avgResponseTime: '2h 30m', members: ['Manisha Poudel'], slaTarget: '4 hours', health: 'critical', resolvedToday: 3, description: 'Handles payments, refunds, invoices, and billing' },
  { id: 'd6', name: 'Marketing', icon: 'Megaphone', openInquiries: 2, avgResponseTime: '2h', members: ['Aayushma Karki'], slaTarget: '8 hours', health: 'healthy', resolvedToday: 4, description: 'Handles campaigns, offers, collaborations, and promotions' },
  { id: 'd7', name: 'IT Support', icon: 'Monitor', openInquiries: 2, avgResponseTime: '1h', members: ['Nabin Gurung'], slaTarget: '2 hours', health: 'healthy', resolvedToday: 5, description: 'Handles technical issues, app errors, and system problems' },
  { id: 'd8', name: 'PR / Media', icon: 'Newspaper', openInquiries: 1, avgResponseTime: '3h', members: ['Srijana Maharjan'], slaTarget: '4 hours', health: 'healthy', resolvedToday: 1, description: 'Handles press inquiries, media requests, and public statements' },
  { id: 'd9', name: 'Business Development', icon: 'Handshake', openInquiries: 2, avgResponseTime: '2h', members: ['Priya Thapa'], slaTarget: '8 hours', health: 'healthy', resolvedToday: 2, description: 'Handles partnerships, vendor proposals, and business deals' },
  { id: 'd10', name: 'Admin', icon: 'Shield', openInquiries: 1, avgResponseTime: '1h 30m', members: ['Rajesh Tamang'], slaTarget: '8 hours', health: 'healthy', resolvedToday: 3, description: 'Handles general administration and fallback routing' },
  { id: 'd11', name: 'Legal / Compliance', icon: 'Scale', openInquiries: 2, avgResponseTime: '4h', members: ['Sabin KC'], slaTarget: '4 hours', health: 'critical', resolvedToday: 1, description: 'Handles legal issues, fraud reports, and compliance matters' },
];

export const mockTeam: TeamMember[] = [
  { id: 't1', name: 'Suman Rai', email: 'support.head@yeti.com', role: 'DEPARTMENT_HEAD', department: 'Customer Support', activeTickets: 3, resolvedToday: 8, avgResponseTime: '35m', status: 'online' },
  { id: 't2', name: 'Roshani Lama', email: 'support.user@yeti.com', role: 'SOCIAL_MEDIA_HANDLER', department: 'Customer Support', activeTickets: 2, resolvedToday: 6, avgResponseTime: '50m', status: 'online' },
  { id: 't3', name: 'Bikash Adhikari', email: 'sales.head@yeti.com', role: 'DEPARTMENT_HEAD', department: 'Sales', activeTickets: 2, resolvedToday: 5, avgResponseTime: '1h 10m', status: 'online' },
  { id: 't4', name: 'Kabita Limbu', email: 'hr.head@yeti.com', role: 'DEPARTMENT_HEAD', department: 'HR', activeTickets: 4, resolvedToday: 2, avgResponseTime: '3h', status: 'online' },
  { id: 't5', name: 'Dipesh Pandey', email: 'operations.head@yeti.com', role: 'DEPARTMENT_HEAD', department: 'Operations', activeTickets: 3, resolvedToday: 4, avgResponseTime: '1h 30m', status: 'online' },
  { id: 't6', name: 'Manisha Poudel', email: 'accounts.user@yeti.com', role: 'SOCIAL_MEDIA_HANDLER', department: 'Accounts / Finance', activeTickets: 3, resolvedToday: 3, avgResponseTime: '2h 30m', status: 'online' },
  { id: 't7', name: 'Aayushma Karki', email: 'marketing.head@yeti.com', role: 'DEPARTMENT_HEAD', department: 'Marketing', activeTickets: 2, resolvedToday: 4, avgResponseTime: '2h', status: 'away' },
  { id: 't8', name: 'Nabin Gurung', email: 'it.user@yeti.com', role: 'SOCIAL_MEDIA_HANDLER', department: 'IT Support', activeTickets: 2, resolvedToday: 5, avgResponseTime: '1h', status: 'online' },
  { id: 't9', name: 'Srijana Maharjan', email: 'pr.user@yeti.com', role: 'SOCIAL_MEDIA_HANDLER', department: 'PR / Media', activeTickets: 1, resolvedToday: 1, avgResponseTime: '3h', status: 'offline' },
  { id: 't10', name: 'Priya Thapa', email: 'bd.head@yeti.com', role: 'DEPARTMENT_HEAD', department: 'Business Development', activeTickets: 2, resolvedToday: 2, avgResponseTime: '2h', status: 'online' },
  { id: 't11', name: 'Super Admin', email: 'admin@replyroute.com', role: 'SUPER_ADMIN', department: 'Admin', activeTickets: 1, resolvedToday: 3, avgResponseTime: '1h 30m', status: 'online' },
  { id: 't12', name: 'Sabin KC', email: 'legal.head@yeti.com', role: 'DEPARTMENT_HEAD', department: 'Legal / Compliance', activeTickets: 2, resolvedToday: 1, avgResponseTime: '4h', status: 'online' },
];

export const mockIntegrations: Integration[] = [
  { id: 'i1', name: 'Website Form', channel: 'website', status: 'Connected', description: 'Collect inquiries from your corporate website', icon: 'Globe', connectedAt: '2026-01-15' },
  { id: 'i2', name: 'Email', channel: 'email', status: 'Connected', description: 'Route inbound email inquiries automatically', icon: 'Mail', connectedAt: '2026-01-15' },
  { id: 'i3', name: 'Facebook Messenger', channel: 'facebook', status: 'Coming Soon', description: 'Connect your corporate Facebook Page', icon: 'Facebook' },
  { id: 'i4', name: 'Instagram DM', channel: 'instagram', status: 'Coming Soon', description: 'Receive Instagram Direct Messages', icon: 'Instagram' },
  { id: 'i5', name: 'WhatsApp Business', channel: 'whatsapp', status: 'Coming Soon', description: 'Connect WhatsApp Business API', icon: 'MessageCircle' },
  { id: 'i6', name: 'SMS', channel: 'sms', status: 'Not Connected', description: 'Send and receive SMS messages', icon: 'Smartphone' },
  { id: 'i7', name: 'Telegram', channel: 'telegram', status: 'Not Connected', description: 'Connect Telegram bot', icon: 'Send' },
];

export const channelChartData = [
  { name: 'Facebook', value: 28 },
  { name: 'Email', value: 24 },
  { name: 'WhatsApp', value: 20 },
  { name: 'Website', value: 16 },
  { name: 'Instagram', value: 12 },
];

export const departmentChartData = [
  { name: 'Support', value: 18 },
  { name: 'Sales', value: 14 },
  { name: 'Operations', value: 12 },
  { name: 'Accounts', value: 10 },
  { name: 'HR', value: 8 },
  { name: 'Marketing', value: 6 },
  { name: 'IT', value: 5 },
  { name: 'Legal', value: 4 },
  { name: 'PR', value: 3 },
];

export const weeklyVolumeData = [
  { name: 'Mon', inquiries: 32, resolved: 28 },
  { name: 'Tue', inquiries: 45, resolved: 40 },
  { name: 'Wed', inquiries: 38, resolved: 35 },
  { name: 'Thu', inquiries: 52, resolved: 44 },
  { name: 'Fri', inquiries: 48, resolved: 42 },
  { name: 'Sat', inquiries: 25, resolved: 22 },
  { name: 'Sun', inquiries: 18, resolved: 15 },
];

export const responseStatusData = [
  { name: 'Resolved', value: 45, fill: '#10b981' },
  { name: 'In Progress', value: 20, fill: '#0ea5e9' },
  { name: 'Pending', value: 15, fill: '#f59e0b' },
  { name: 'New', value: 12, fill: '#8b5cf6' },
  { name: 'Escalated', value: 8, fill: '#ef4444' },
];

export const monthlyTrendData = [
  { name: 'Jan', volume: 180, responseTime: 3.2 },
  { name: 'Feb', volume: 210, responseTime: 2.8 },
  { name: 'Mar', volume: 195, responseTime: 2.5 },
  { name: 'Apr', volume: 240, responseTime: 2.2 },
  { name: 'May', volume: 258, responseTime: 1.9 },
];

export const deptResponseTimeData = [
  { name: 'Support', time: 0.75 },
  { name: 'IT', time: 1.0 },
  { name: 'Sales', time: 1.33 },
  { name: 'Operations', time: 1.75 },
  { name: 'Accounts', time: 2.5 },
  { name: 'HR', time: 3.0 },
  { name: 'Marketing', time: 2.0 },
  { name: 'PR', time: 3.0 },
  { name: 'Legal', time: 4.0 },
];

export const topCategoriesData = [
  { name: 'Complaints', count: 24 },
  { name: 'Payment Issues', count: 20 },
  { name: 'Sales Inquiries', count: 16 },
  { name: 'Recruitment', count: 14 },
  { name: 'Technical Issues', count: 12 },
  { name: 'Media Requests', count: 6 },
];
