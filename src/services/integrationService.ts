import { apiClient } from '@/lib/apiClient';
import {
  mapIntegrationDtoToIntegration,
  type BackendIntegrationDto,
} from '@/lib/mappers';
import type { Integration } from '@/types';

export async function getIntegrations() {
  const response = await apiClient.get<BackendIntegrationDto[]>('/integrations');
  return response.map(mapIntegrationDtoToIntegration);
}

export async function connectPlaceholder(provider: string) {
  const response = await apiClient.post<BackendIntegrationDto>(`/integrations/${provider}/connect-placeholder`);
  return mapIntegrationDtoToIntegration(response);
}

export async function disconnectIntegration(id: string) {
  const response = await apiClient.patch<BackendIntegrationDto>(`/integrations/${id}/disconnect`);
  return mapIntegrationDtoToIntegration(response);
}

export function providerFromIntegration(integration: Integration) {
  if (integration.channel === 'website') return 'WEBSITE_FORM';
  return integration.channel.toUpperCase();
}
