import type { DemoUser, Inquiry, InquiryForm } from '@/types';

export type AppRoutePath =
  | '/dashboard'
  | '/inbox'
  | '/routing-rules'
  | '/departments'
  | '/team'
  | '/analytics'
  | '/integrations'
  | '/form-builder'
  | '/settings';

export type NavItemAccess = {
  to: AppRoutePath;
  label: string;
};

const superAdminRoutes: AppRoutePath[] = [
  '/dashboard',
  '/inbox',
  '/routing-rules',
  '/departments',
  '/team',
  '/analytics',
  '/integrations',
  '/form-builder',
  '/settings',
];

const departmentHeadRoutes: AppRoutePath[] = [
  '/dashboard',
  '/inbox',
  '/analytics',
  '/form-builder',
];

const socialMediaHandlerRoutes: AppRoutePath[] = [
  '/dashboard',
  '/inbox',
];

const routeLabels: Record<AppRoutePath, string> = {
  '/dashboard': 'Dashboard',
  '/inbox': 'Inbox',
  '/routing-rules': 'Routing Rules',
  '/departments': 'Departments',
  '/team': 'Team',
  '/analytics': 'Analytics',
  '/integrations': 'Integrations',
  '/form-builder': 'Inquiry Forms',
  '/settings': 'Settings',
};

function getAllowedRoutes(user: DemoUser | null): AppRoutePath[] {
  if (!user) return [];
  if (user.role === 'SUPER_ADMIN') return superAdminRoutes;
  if (user.role === 'DEPARTMENT_HEAD') return departmentHeadRoutes;
  return socialMediaHandlerRoutes;
}

function ownsInquiry(user: DemoUser | null, inquiry: Inquiry) {
  if (!user) return false;
  if (canViewAllDepartments(user)) return true;
  if (user.department === 'All') return false;

  return inquiry.assignedDepartment === user.department;
}

export function canAccessRoute(user: DemoUser | null, routePath: string) {
  const allowedRoutes = getAllowedRoutes(user);
  if (allowedRoutes.some((route) => route === routePath)) return true;
  if (routePath.startsWith('/departments/') && allowedRoutes.includes('/departments')) return true;

  return false;
}

export function getAllowedNavItems(user: DemoUser | null): NavItemAccess[] {
  return getAllowedRoutes(user).map((route) => ({
    to: route,
    label: routeLabels[route],
  }));
}

export function canViewAllDepartments(user: DemoUser | null) {
  return user?.role === 'SUPER_ADMIN';
}

export function canViewAnalytics(user: DemoUser | null) {
  return user?.role === 'SUPER_ADMIN' || user?.role === 'DEPARTMENT_HEAD';
}

export function canViewFormBuilder(user: DemoUser | null) {
  return user?.role === 'SUPER_ADMIN' || user?.role === 'DEPARTMENT_HEAD';
}

export function canViewInquiryForms(user: DemoUser | null) {
  return canViewFormBuilder(user);
}

export function canCreateInquiryForm(user: DemoUser | null) {
  return user?.role === 'SUPER_ADMIN' || user?.role === 'DEPARTMENT_HEAD';
}

function ownsForm(user: DemoUser | null, form: InquiryForm) {
  if (!user) return false;
  if (user.role === 'SUPER_ADMIN') return true;
  if (user.role !== 'DEPARTMENT_HEAD' || user.department === 'All') return false;

  return form.department === user.department;
}

export function canEditInquiryForm(user: DemoUser | null, form: InquiryForm) {
  return ownsForm(user, form);
}

export function canDeleteInquiryForm(user: DemoUser | null, form: InquiryForm) {
  return ownsForm(user, form);
}

export function canPublishInquiryForm(user: DemoUser | null, form: InquiryForm) {
  return ownsForm(user, form);
}

export function canShareInquiryForm(user: DemoUser | null, form: InquiryForm) {
  return ownsForm(user, form);
}

export function canManageRoutingRules(user: DemoUser | null) {
  return user?.role === 'SUPER_ADMIN';
}

export function canManageDepartments(user: DemoUser | null) {
  return user?.role === 'SUPER_ADMIN';
}

export function canManageTeam(user: DemoUser | null) {
  return user?.role === 'SUPER_ADMIN';
}

export function canManageIntegrations(user: DemoUser | null) {
  return user?.role === 'SUPER_ADMIN';
}

export function canManageSettings(user: DemoUser | null) {
  return user?.role === 'SUPER_ADMIN';
}

export function canOverrideDepartment(user: DemoUser | null) {
  return user?.role === 'SUPER_ADMIN';
}

export function canAssignOwner(user: DemoUser | null) {
  return user?.role === 'SUPER_ADMIN' || user?.role === 'DEPARTMENT_HEAD';
}

export function canAssignOwnerWithinDepartment(user: DemoUser | null, inquiry: Inquiry) {
  if (!user) return false;
  if (user.role === 'SUPER_ADMIN') return true;
  if (user.role !== 'DEPARTMENT_HEAD') return false;

  return ownsInquiry(user, inquiry);
}

export function canUpdateStatus(user: DemoUser | null, inquiry: Inquiry) {
  return ownsInquiry(user, inquiry);
}

export function canAddNote(user: DemoUser | null, inquiry: Inquiry) {
  return ownsInquiry(user, inquiry);
}

export function canReply(user: DemoUser | null, inquiry: Inquiry) {
  return ownsInquiry(user, inquiry);
}

export function canEscalate(user: DemoUser | null, inquiry: Inquiry) {
  return ownsInquiry(user, inquiry);
}

export function getRoleLabel(user: DemoUser | null) {
  if (!user) return '';

  return user.role
    .split('_')
    .map((word) => word[0] + word.slice(1).toLowerCase())
    .join(' ');
}
