import { apiClient } from '@/lib/apiClient';
import {
  mapRoutingRuleDtoToRule,
  mapRoutingRuleToPayload,
  type BackendRoutingRuleDto,
} from '@/lib/mappers';
import { resolveDepartmentId } from '@/services/departmentService';
import type { RoutingRule } from '@/types';

async function withDepartmentId(rule: Omit<RoutingRule, 'id' | 'createdAt'> | RoutingRule) {
  const targetDepartmentId = await resolveDepartmentId(rule.targetDepartment) ?? rule.targetDepartmentId;
  if (!targetDepartmentId) {
    throw new Error(`Could not find department id for ${rule.targetDepartment}`);
  }

  return {
    ...mapRoutingRuleToPayload(rule),
    targetDepartmentId,
  };
}

export async function getRoutingRules() {
  const response = await apiClient.get<BackendRoutingRuleDto[]>('/routing-rules');
  return response.map(mapRoutingRuleDtoToRule);
}

export async function createRoutingRule(payload: Omit<RoutingRule, 'id' | 'createdAt'>) {
  const response = await apiClient.post<BackendRoutingRuleDto>('/routing-rules', await withDepartmentId(payload));
  return mapRoutingRuleDtoToRule(response);
}

export async function updateRoutingRule(id: string, payload: RoutingRule) {
  const response = await apiClient.put<BackendRoutingRuleDto>(`/routing-rules/${id}`, await withDepartmentId(payload));
  return mapRoutingRuleDtoToRule(response);
}

export async function toggleRoutingRule(id: string) {
  const response = await apiClient.patch<BackendRoutingRuleDto>(`/routing-rules/${id}/toggle`);
  return mapRoutingRuleDtoToRule(response);
}

export async function deleteRoutingRule(id: string) {
  await apiClient.delete<void>(`/routing-rules/${id}`);
}
