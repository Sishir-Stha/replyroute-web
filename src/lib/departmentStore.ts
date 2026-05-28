import { mockDepartments } from '@/data/mockData';
import type { DepartmentInfo } from '@/types';

const STORAGE_KEY = 'replyroute_departments';

function canUseStorage() {
  return typeof window !== 'undefined' && Boolean(window.localStorage);
}

function cloneDepartments(departments: DepartmentInfo[]) {
  return departments.map((department) => ({
    ...department,
    members: [...department.members],
  }));
}

function isDepartmentInfo(value: unknown): value is DepartmentInfo {
  if (!value || typeof value !== 'object') return false;

  const department = value as Partial<DepartmentInfo>;
  return Boolean(
    department.id
    && department.name
    && department.icon
    && department.description !== undefined
    && Array.isArray(department.members),
  );
}

export function getDepartments() {
  if (!canUseStorage()) return cloneDepartments(mockDepartments);

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    const defaults = cloneDepartments(mockDepartments);
    saveDepartments(defaults);
    return defaults;
  }

  try {
    const parsed = JSON.parse(stored) as unknown;
    if (!Array.isArray(parsed) || !parsed.every(isDepartmentInfo)) {
      const defaults = cloneDepartments(mockDepartments);
      saveDepartments(defaults);
      return defaults;
    }

    return cloneDepartments(parsed);
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return cloneDepartments(mockDepartments);
  }
}

export function saveDepartments(departments: DepartmentInfo[]) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cloneDepartments(departments)));
}

export function addDepartment(department: DepartmentInfo) {
  const departments = getDepartments();
  const newDepartment = {
    ...department,
    id: department.id || `dept-${crypto.randomUUID()}`,
  };

  saveDepartments([newDepartment, ...departments]);
  return newDepartment;
}

export function updateDepartment(departmentId: string, updates: Partial<DepartmentInfo>) {
  const departments = getDepartments();
  let updatedDepartment: DepartmentInfo | undefined;
  const next = departments.map((department) => {
    if (department.id !== departmentId) return department;

    updatedDepartment = {
      ...department,
      ...updates,
      members: updates.members ? [...updates.members] : department.members,
    };

    return updatedDepartment;
  });

  saveDepartments(next);
  return updatedDepartment;
}

export function deleteDepartment(departmentId: string) {
  const next = getDepartments().filter((department) => department.id !== departmentId);
  saveDepartments(next);
}
