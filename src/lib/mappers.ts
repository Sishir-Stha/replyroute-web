import type {
  ActivityLog,
  Channel,
  Department,
  DepartmentInfo,
  FormField,
  Inquiry,
  InquiryForm,
  InquiryFormStatus,
  InquiryStatus,
  Integration,
  IntegrationStatus,
  InternalNote,
  Priority,
  RoutingRule,
  TeamMember,
  UserRole,
} from '@/types';

export type BackendChannel = 'FACEBOOK' | 'INSTAGRAM' | 'WHATSAPP' | 'WEBSITE_FORM' | 'EMAIL' | 'SMS' | 'TELEGRAM' | 'MANUAL';
export type BackendStatus = 'NEW' | 'ASSIGNED' | 'IN_PROGRESS' | 'PENDING' | 'RESOLVED' | 'ESCALATED';
export type BackendPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type BackendFormStatus = 'DRAFT' | 'PUBLISHED' | 'INACTIVE';
export type BackendIntegrationStatus = 'CONNECTED' | 'DISCONNECTED' | 'COMING_SOON' | 'ERROR';

export type BackendUserDto = {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  department?: string | null;
  departmentId?: string | null;
  company?: string | null;
  companyId?: string | null;
};

export type BackendLoginResponse = {
  token: string;
  user: BackendUserDto;
};

export type BackendInquiryDto = {
  id: string;
  customerName: string;
  customerEmail?: string | null;
  customerPhone?: string | null;
  customerCompanyName?: string | null;
  message: string;
  channel: BackendChannel;
  category?: string | null;
  priority: BackendPriority;
  routedDepartmentId: string;
  routedDepartment: string;
  assignedDepartmentId: string;
  assignedDepartment: string;
  assignedOwnerId?: string | null;
  assignedOwner?: string | null;
  status: BackendStatus;
  sourcePage?: string | null;
  leadSource?: string | null;
  matchedRuleId?: string | null;
  matchedRule?: string | null;
  matchedKeywords?: string[] | null;
  confidence: number;
  routingReason?: string | null;
  nextAction?: string | null;
  routingOverridden: boolean;
  slaDeadline?: string | null;
  firstResponseAt?: string | null;
  lastResponseAt?: string | null;
  resolvedAt?: string | null;
  externalConversationId?: string | null;
  externalMessageId?: string | null;
  externalSenderId?: string | null;
  createdAt: string;
  updatedAt: string;
  notes?: BackendInquiryNoteDto[] | null;
  timeline?: BackendInquiryTimelineDto[] | null;
};

type BackendInquiryNoteDto = {
  id: string;
  authorUserId: string;
  authorName?: string | null;
  note: string;
  internal: boolean;
  createdAt: string;
};

type BackendInquiryTimelineDto = {
  id: string;
  actorUserId?: string | null;
  actorName?: string | null;
  eventType: string;
  description: string;
  createdAt: string;
};

export type BackendRoutingRuleDto = {
  id: string;
  name: string;
  description?: string | null;
  keywords: string[];
  targetDepartmentId: string;
  targetDepartment: string;
  priority: BackendPriority;
  active: boolean;
  sortOrder: number;
  routingReason?: string | null;
  nextAction?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type BackendDepartmentDto = {
  id: string;
  name: string;
  description?: string | null;
  active: boolean;
  slaMinutes: number;
  createdAt: string;
  updatedAt: string;
};

export type BackendTeamUserDto = {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  department?: string | null;
  departmentId?: string | null;
  active: boolean;
};

export type BackendInquiryFormDto = {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  departmentId: string;
  department: string;
  inquiryType: string;
  status: BackendFormStatus;
  fields: string;
  createdByUserId?: string | null;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type BackendPublicFormDto = {
  title: string;
  slug: string;
  description?: string | null;
  inquiryType: string;
  fields: string;
};

export type BackendPublicFormSubmissionResponse = {
  inquiryId: string;
  routedDepartmentId: string;
  routedDepartment: string;
  message: string;
};

export type BackendIntegrationDto = {
  id: string;
  provider: string;
  displayName: string;
  externalAccountId?: string | null;
  status: BackendIntegrationStatus;
  metadata?: string | null;
  tokenExpiresAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type BackendDashboardSummaryDto = {
  totalInquiries: number;
  pendingMessages: number;
  resolved: number;
  highPriority: number;
  scope: string;
};

export type BackendChartPointDto = {
  name: string;
  value: number;
};

export type BackendTeamPerformanceDto = {
  name: string;
  department: string;
  role: string;
  active: number;
  resolvedToday: number;
  avgResponse: string;
};

const departmentFallback: Department = 'Admin';

export function mapUserDtoToUser(dto: BackendUserDto) {
  return {
    id: dto.id,
    name: dto.fullName,
    email: dto.email,
    role: dto.role,
    department: (dto.department ?? 'All') as Department | 'All',
    departmentId: dto.departmentId ?? undefined,
    company: dto.company ?? undefined,
    companyId: dto.companyId ?? undefined,
  };
}

export function toBackendChannel(channel: Channel): BackendChannel {
  const map: Record<Channel, BackendChannel> = {
    facebook: 'FACEBOOK',
    instagram: 'INSTAGRAM',
    whatsapp: 'WHATSAPP',
    website: 'WEBSITE_FORM',
    email: 'EMAIL',
  };
  return map[channel];
}

export function fromBackendChannel(channel: BackendChannel): Channel {
  const map: Record<BackendChannel, Channel> = {
    FACEBOOK: 'facebook',
    INSTAGRAM: 'instagram',
    WHATSAPP: 'whatsapp',
    WEBSITE_FORM: 'website',
    EMAIL: 'email',
    SMS: 'website',
    TELEGRAM: 'website',
    MANUAL: 'website',
  };
  return map[channel] ?? 'website';
}

export function toBackendStatus(status: InquiryStatus): BackendStatus {
  const map: Record<InquiryStatus, BackendStatus> = {
    New: 'NEW',
    Assigned: 'ASSIGNED',
    'In Progress': 'IN_PROGRESS',
    Pending: 'PENDING',
    Resolved: 'RESOLVED',
    Escalated: 'ESCALATED',
  };
  return map[status];
}

export function fromBackendStatus(status: BackendStatus): InquiryStatus {
  const map: Record<BackendStatus, InquiryStatus> = {
    NEW: 'New',
    ASSIGNED: 'Assigned',
    IN_PROGRESS: 'In Progress',
    PENDING: 'Pending',
    RESOLVED: 'Resolved',
    ESCALATED: 'Escalated',
  };
  return map[status];
}

export function toBackendPriority(priority: Priority): BackendPriority {
  return priority.toUpperCase() as BackendPriority;
}

export function fromBackendPriority(priority: BackendPriority): Priority {
  const map: Record<BackendPriority, Priority> = {
    LOW: 'Low',
    MEDIUM: 'Medium',
    HIGH: 'High',
    URGENT: 'Urgent',
  };
  return map[priority];
}

export function toBackendFormStatus(status: InquiryFormStatus): BackendFormStatus {
  const map: Record<InquiryFormStatus, BackendFormStatus> = {
    Draft: 'DRAFT',
    Published: 'PUBLISHED',
    Inactive: 'INACTIVE',
  };
  return map[status];
}

export function fromBackendFormStatus(status: BackendFormStatus): InquiryFormStatus {
  const map: Record<BackendFormStatus, InquiryFormStatus> = {
    DRAFT: 'Draft',
    PUBLISHED: 'Published',
    INACTIVE: 'Inactive',
  };
  return map[status];
}

function getMessagePreview(message: string) {
  return message.length > 74 ? `${message.slice(0, 71)}...` : message;
}

function mapTimelineType(eventType: string): ActivityLog['type'] {
  const normalized = eventType.toLowerCase();
  if (normalized.includes('status')) return 'status_change';
  if (normalized.includes('assign') || normalized.includes('override')) return 'assignment';
  if (normalized.includes('note')) return 'note';
  if (normalized.includes('reply')) return 'reply';
  if (normalized.includes('escalat')) return 'escalation';
  if (normalized.includes('rout')) return 'routing';
  return 'created';
}

function mapNote(dto: BackendInquiryNoteDto): InternalNote {
  return {
    id: dto.id,
    message: dto.note,
    author: dto.authorName ?? 'ReplyRoute User',
    timestamp: dto.createdAt,
  };
}

function mapTimeline(dto: BackendInquiryTimelineDto): ActivityLog {
  return {
    id: dto.id,
    type: mapTimelineType(dto.eventType),
    message: dto.description,
    timestamp: dto.createdAt,
    user: dto.actorName ?? undefined,
  };
}

export function mapInquiryDtoToInquiry(dto: BackendInquiryDto): Inquiry {
  const customerEmail = dto.customerEmail ?? '';
  const customerPhone = dto.customerPhone ?? '';
  const assignedDepartment = (dto.assignedDepartment || departmentFallback) as Department;
  const routedDepartment = (dto.routedDepartment || assignedDepartment) as Department;
  const priority = fromBackendPriority(dto.priority);
  const status = fromBackendStatus(dto.status);
  const matchedKeywords = dto.matchedKeywords ?? [];
  const category = dto.category ?? 'General Inquiry';
  const isOverdue = Boolean(dto.slaDeadline && new Date(dto.slaDeadline).getTime() < Date.now() && status !== 'Resolved');

  return {
    id: dto.id,
    customerName: dto.customerName,
    customerEmail,
    customerPhone,
    companyName: dto.customerCompanyName ?? undefined,
    customer: {
      id: dto.externalSenderId ?? dto.id,
      name: dto.customerName,
      email: customerEmail,
      phone: customerPhone,
      company: dto.customerCompanyName ?? undefined,
    },
    message: dto.message,
    messagePreview: getMessagePreview(dto.message),
    channel: fromBackendChannel(dto.channel),
    category,
    routedDepartment,
    routedDepartmentId: dto.routedDepartmentId,
    assignedDepartment,
    assignedDepartmentId: dto.assignedDepartmentId,
    assignedOwnerId: dto.assignedOwnerId ?? undefined,
    assignedOwner: dto.assignedOwner ?? undefined,
    priority,
    matchedRule: dto.matchedRule ?? 'No rule matched',
    matchedKeywords,
    routingReason: dto.routingReason ?? '',
    confidence: dto.confidence,
    department: assignedDepartment,
    assignee: dto.assignedOwner ?? undefined,
    responseOwner: dto.assignedOwner ?? undefined,
    status,
    tags: Array.from(new Set([category.toLowerCase(), fromBackendChannel(dto.channel), ...matchedKeywords.slice(0, 3)])),
    createdAt: dto.createdAt,
    slaDeadline: dto.slaDeadline ?? dto.createdAt,
    isOverdue,
    lastResponseAt: dto.lastResponseAt ?? undefined,
    sourcePage: dto.sourcePage ?? undefined,
    leadSource: dto.leadSource ?? undefined,
    nextAction: dto.nextAction ?? undefined,
    routingOverridden: dto.routingOverridden,
    timeline: (dto.timeline ?? []).map(mapTimeline),
    notes: (dto.notes ?? []).map(mapNote),
  };
}

export function mapInquiryToCreatePayload(inquiry: {
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  companyName?: string;
  message: string;
  channel: Channel;
  category?: string;
  sourcePage?: string;
  leadSource?: string;
}) {
  return {
    customerName: inquiry.customerName,
    customerEmail: inquiry.customerEmail,
    customerPhone: inquiry.customerPhone,
    customerCompanyName: inquiry.companyName,
    message: inquiry.message,
    channel: toBackendChannel(inquiry.channel),
    category: inquiry.category,
    sourcePage: inquiry.sourcePage,
    leadSource: inquiry.leadSource,
  };
}

export function mapRoutingRuleDtoToRule(dto: BackendRoutingRuleDto): RoutingRule {
  return {
    id: dto.id,
    name: dto.name,
    keywords: dto.keywords,
    targetDepartmentId: dto.targetDepartmentId,
    targetDepartment: dto.targetDepartment as Department,
    priority: fromBackendPriority(dto.priority),
    active: dto.active,
    description: dto.description ?? undefined,
    routingReason: dto.routingReason ?? undefined,
    nextAction: dto.nextAction ?? undefined,
    createdAt: dto.createdAt,
  };
}

export function mapRoutingRuleToPayload(rule: Omit<RoutingRule, 'id' | 'createdAt'> | RoutingRule) {
  return {
    name: rule.name,
    description: rule.description,
    keywords: rule.keywords,
    targetDepartmentId: rule.targetDepartmentId,
    priority: toBackendPriority(rule.priority),
    active: rule.active,
    sortOrder: 0,
    routingReason: rule.routingReason,
    nextAction: rule.nextAction,
  };
}

function departmentIcon(name: string) {
  const icons: Record<string, string> = {
    Marketing: 'TrendingUp',
    HR: 'Users',
    'Customer Support': 'Headphones',
    Sales: 'TrendingUp',
    Operations: 'Settings',
    'Accounts / Finance': 'CreditCard',
    'PR / Media': 'Newspaper',
    'IT Support': 'Monitor',
    Admin: 'Shield',
    'Legal / Compliance': 'Scale',
    'Business Development': 'Handshake',
  };
  return icons[name] ?? 'Shield';
}

export function mapDepartmentDtoToDepartment(dto: BackendDepartmentDto): DepartmentInfo {
  return {
    id: dto.id,
    name: dto.name as Department,
    icon: departmentIcon(dto.name),
    openInquiries: 0,
    avgResponseTime: '1h',
    members: [],
    slaTarget: `${Math.round(dto.slaMinutes / 60)} hours`,
    health: dto.active ? 'healthy' : 'warning',
    resolvedToday: 0,
    description: dto.description ?? '',
    active: dto.active,
    slaMinutes: dto.slaMinutes,
  };
}

export function mapDepartmentToPayload(department: DepartmentInfo) {
  return {
    name: department.name,
    description: department.description,
    slaMinutes: department.slaMinutes ?? 240,
    active: department.active ?? true,
  };
}

export function mapUserDtoToTeamMember(dto: BackendTeamUserDto): TeamMember {
  return {
    id: dto.id,
    name: dto.fullName,
    email: dto.email,
    role: dto.role,
    department: (dto.department ?? 'Admin') as Department,
    departmentId: dto.departmentId ?? undefined,
    activeTickets: 0,
    resolvedToday: 0,
    avgResponseTime: '1h',
    status: dto.active ? 'online' : 'offline',
  };
}

export function mapTeamMemberToPayload(member: TeamMember & { password?: string }) {
  return {
    fullName: member.name,
    email: member.email,
    password: member.password,
    role: member.role,
    departmentId: member.departmentId,
    active: member.status !== 'offline',
  };
}

function parseFields(fields: string): FormField[] {
  try {
    const parsed = JSON.parse(fields) as Array<Partial<FormField>>;
    if (!Array.isArray(parsed)) return [];
    return parsed.map((field, index) => ({
      id: field.id ?? `field-${index}`,
      label: field.label ?? field.name ?? `Field ${index + 1}`,
      name: field.name ?? `field${index + 1}`,
      type: field.type ?? 'text',
      required: Boolean(field.required),
      options: field.options,
    })) as FormField[];
  } catch {
    return [];
  }
}

export function stringifyFields(fields: FormField[]) {
  return JSON.stringify(fields.map(({ id: _id, ...field }) => field));
}

export function mapInquiryFormDtoToForm(dto: BackendInquiryFormDto): InquiryForm {
  return {
    id: dto.id,
    title: dto.title,
    slug: dto.slug,
    description: dto.description ?? '',
    departmentId: dto.departmentId,
    department: dto.department as Department,
    inquiryType: dto.inquiryType,
    status: fromBackendFormStatus(dto.status),
    fields: parseFields(dto.fields),
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
    createdBy: dto.createdBy ?? 'ReplyRoute User',
  };
}

export function mapPublicFormDtoToForm(dto: BackendPublicFormDto): InquiryForm {
  const now = new Date().toISOString();
  return {
    id: dto.slug,
    title: dto.title,
    slug: dto.slug,
    description: dto.description ?? '',
    department: 'Admin',
    inquiryType: dto.inquiryType,
    status: 'Published',
    fields: parseFields(dto.fields),
    createdAt: now,
    updatedAt: now,
    createdBy: 'ReplyRoute',
  };
}

export function mapInquiryFormToPayload(form: InquiryForm) {
  return {
    title: form.title,
    slug: form.slug,
    description: form.description,
    departmentId: form.departmentId,
    inquiryType: form.inquiryType,
    status: toBackendFormStatus(form.status),
    fields: stringifyFields(form.fields),
  };
}

export function mapIntegrationDtoToIntegration(dto: BackendIntegrationDto): Integration {
  const channel = dto.provider.toLowerCase() as Integration['channel'];
  const statusMap: Record<BackendIntegrationStatus, IntegrationStatus> = {
    CONNECTED: 'Connected',
    DISCONNECTED: 'Not Connected',
    COMING_SOON: 'Coming Soon',
    ERROR: 'Not Connected',
  };
  const iconMap: Record<string, string> = {
    WEBSITE_FORM: 'Globe',
    EMAIL: 'Mail',
    FACEBOOK: 'Facebook',
    INSTAGRAM: 'Instagram',
    WHATSAPP: 'MessageCircle',
    SMS: 'Smartphone',
    TELEGRAM: 'Send',
  };

  return {
    id: dto.id,
    name: dto.displayName,
    channel,
    status: statusMap[dto.status],
    description: dto.metadata ?? `${dto.displayName} integration`,
    icon: iconMap[dto.provider] ?? 'Globe',
    connectedAt: dto.status === 'CONNECTED' ? dto.createdAt.slice(0, 10) : undefined,
  };
}
