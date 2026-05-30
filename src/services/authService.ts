import { apiClient } from '@/lib/apiClient';
import { mapUserDtoToUser } from '@/lib/mappers';
import type { BackendLoginResponse, BackendUserDto } from '@/lib/mappers';

export async function loginRequest(email: string, password: string) {
  const response = await apiClient.post<BackendLoginResponse>('/auth/login', { email, password }, { skipAuth: true });
  return {
    token: response.token,
    user: mapUserDtoToUser(response.user),
  };
}

export async function getCurrentUser() {
  const response = await apiClient.get<BackendUserDto>('/auth/me');
  return mapUserDtoToUser(response);
}
