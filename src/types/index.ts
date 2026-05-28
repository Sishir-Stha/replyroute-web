export type Channel = 'facebook' | 'instagram' | 'whatsapp' | 'website' | 'email';

export type Department = 'Marketing' | 'HR' | 'Customer Support' | 'Sales' | 'Operations' | 'Accounts / Finance' | 'PR / Media' | 'IT Support' | 'Admin' | 'Legal / Compliance' | 'Business Development';

export type InquiryStatus = 'New' | 'Assigned' | 'In Progress' | 'Pending' | 'Resolved' | 'Escalated';

export type Priority = 'Low' | 'Medium' | 'High' | 'Urgent';

export type TeamRole = 'SUPER_ADMIN' | 'DEPARTMENT_HEAD' | 'SOCIAL_MEDIA_HANDLER';

export type UserRole = 'SUPER_ADMIN' | 'DEPARTMENT_HEAD' | 'SOCIAL_MEDIA_HANDLER';

export type UserDepartment = Department | 'All';

export type OnlineStatus = 'online' | 'offline' | 'away';

export type IntegrationStatus = 'Connected' | 'Coming Soon' | 'Not Connected';

export type InquiryFormStatus = 'Published' | 'Draft' | 'Inactive';

export type FormFieldType = 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'priority' | 'file';

export interface DemoUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: UserDepartment;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  company?: string;
}

export interface InternalNote {
  id: string;
  message: string;
  author: string;
  timestamp: string;
}

export interface ActivityLog {
  id: string;
  type: 'status_change' | 'assignment' | 'note' | 'reply' | 'escalation' | 'created' | 'routing';
  message: string;
  timestamp: string;
  user?: string;
}

export interface RoutingDecision {
  routedDepartment: Department;
  assignedDepartment: Department;
  priority: Priority;
  matchedRule: string;
  matchedKeywords: string[];
  confidence: number;
  routingReason: string;
  nextAction: string;
}

export interface Inquiry {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  companyName?: string;
  customer: Customer;
  message: string;
  messagePreview: string;
  channel: Channel;
  category: string;
  routedDepartment: Department;
  assignedDepartment: Department;
  assignedOwner?: string;
  priority: Priority;
  matchedRule: string;
  matchedKeywords: string[];
  routingReason: string;
  confidence: number;
  department: Department;
  assignee?: string;
  responseOwner?: string;
  status: InquiryStatus;
  tags: string[];
  createdAt: string;
  slaDeadline: string;
  isOverdue: boolean;
  lastResponseAt?: string;
  sourcePage?: string;
  leadSource?: string;
  nextAction?: string;
  routingOverridden: boolean;
  timeline: ActivityLog[];
  notes: InternalNote[];
}

export interface DepartmentInfo {
  id: string;
  name: Department;
  icon: string;
  openInquiries: number;
  avgResponseTime: string;
  members: string[];
  slaTarget: string;
  health: 'healthy' | 'warning' | 'critical';
  resolvedToday: number;
  description: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: TeamRole;
  department: Department;
  activeTickets: number;
  resolvedToday: number;
  avgResponseTime: string;
  status: OnlineStatus;
  avatar?: string;
}

export interface RoutingRule {
  id: string;
  name: string;
  keywords: string[];
  targetDepartment: Department;
  priority: Priority;
  active: boolean;
  description?: string;
  routingReason?: string;
  nextAction?: string;
  createdAt: string;
}

export interface Integration {
  id: string;
  name: string;
  channel: Channel | 'sms' | 'telegram';
  status: IntegrationStatus;
  description: string;
  icon: string;
  connectedAt?: string;
}

export interface FormField {
  id: string;
  label: string;
  name: string;
  type: FormFieldType;
  required: boolean;
  options?: string[];
}

export interface InquiryForm {
  id: string;
  title: string;
  slug: string;
  description: string;
  department: Department;
  inquiryType: string;
  status: InquiryFormStatus;
  fields: FormField[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}
