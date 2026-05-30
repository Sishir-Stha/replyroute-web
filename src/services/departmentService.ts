import { apiClient } from '@/lib/apiClient';
import {
  mapDepartmentDtoToDepartment,
  mapDepartmentToPayload,
  type BackendDepartmentDto,
} from '@/lib/mappers';
import type { Department, DepartmentInfo } from '@/types';

export async function getDepartments() {
  const response = await apiClient.get<BackendDepartmentDto[]>('/departments');
  return response.map(mapDepartmentDtoToDepartment);
}

export async function createDepartment(payload: DepartmentInfo) {
  const response = await apiClient.post<BackendDepartmentDto>('/departments', mapDepartmentToPayload(payload));
  return mapDepartmentDtoToDepartment(response);
}

export async function updateDepartment(id: string, payload: DepartmentInfo) {
  const response = await apiClient.put<BackendDepartmentDto>(`/departments/${id}`, mapDepartmentToPayload(payload));
  return mapDepartmentDtoToDepartment(response);
}

export async function toggleDepartment(id: string) {
  const response = await apiClient.patch<BackendDepartmentDto>(`/departments/${id}/toggle`);
  return mapDepartmentDtoToDepartment(response);
}

export async function resolveDepartmentId(name: Department) {
  const departments = await getDepartments();
  const department = departments.find((item) => item.name === name);
  return department?.id;
}
