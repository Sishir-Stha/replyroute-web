import { apiClient } from '@/lib/apiClient';
import {
  mapUserDtoToTeamMember,
  type BackendTeamUserDto,
} from '@/lib/mappers';
import { resolveDepartmentId } from '@/services/departmentService';
import type { TeamMember } from '@/types';

type UserPayload = TeamMember & { password?: string };

async function toPayload(member: UserPayload) {
  const departmentId = member.departmentId ?? await resolveDepartmentId(member.department);
  return {
    fullName: member.name,
    email: member.email,
    password: member.password,
    role: member.role,
    departmentId,
    active: member.status !== 'offline',
  };
}

export async function getUsers() {
  const response = await apiClient.get<BackendTeamUserDto[]>('/users');
  return response.map(mapUserDtoToTeamMember);
}

export async function createUser(payload: UserPayload) {
  const response = await apiClient.post<BackendTeamUserDto>('/users', await toPayload(payload));
  return mapUserDtoToTeamMember(response);
}

export async function updateUser(id: string, payload: UserPayload) {
  const response = await apiClient.put<BackendTeamUserDto>(`/users/${id}`, await toPayload(payload));
  return mapUserDtoToTeamMember(response);
}

export async function toggleUser(id: string) {
  const response = await apiClient.patch<BackendTeamUserDto>(`/users/${id}/toggle`);
  return mapUserDtoToTeamMember(response);
}
