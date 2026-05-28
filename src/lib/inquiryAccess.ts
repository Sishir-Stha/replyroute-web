import type { DemoUser, Department, Inquiry } from '@/types';
import { canViewAllDepartments } from '@/lib/permissions';

export function getVisibleInquiries(inquiries: Inquiry[], user: DemoUser | null) {
  if (!user) return [];
  if (canViewAllDepartments(user)) return inquiries;
  if (user.department === 'All') return [];

  return inquiries.filter((inquiry) => inquiry.assignedDepartment === user.department);
}

export function getViewingLabel(user: DemoUser | null) {
  if (!user) return 'Viewing: No Inbox';
  if (canViewAllDepartments(user)) return 'Viewing: All Departments';
  if (user.department === 'All') return 'Viewing: No Department Inbox';

  return `Viewing: ${user.department} Department Inbox`;
}

export function getAllowedDepartmentFilters(
  allDepartments: Department[],
  user: DemoUser | null,
): Array<Department | 'all'> {
  if (!user) return [];
  if (canViewAllDepartments(user)) return ['all', ...allDepartments];
  if (user.department === 'All') return [];

  return [user.department];
}
