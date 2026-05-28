import { mockIntegrations } from '@/data/mockData';
import type { Integration } from '@/types';

const STORAGE_KEY = 'replyroute_integrations';

function canUseStorage() {
  return typeof window !== 'undefined' && Boolean(window.localStorage);
}

function cloneIntegrations(integrations: Integration[]) {
  return integrations.map((integration) => ({ ...integration }));
}

function isIntegration(value: unknown): value is Integration {
  if (!value || typeof value !== 'object') return false;

  const integration = value as Partial<Integration>;
  return Boolean(
    integration.id
    && integration.name
    && integration.channel
    && integration.status
    && integration.description
    && integration.icon,
  );
}

export function getIntegrations() {
  if (!canUseStorage()) return cloneIntegrations(mockIntegrations);

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    const defaults = cloneIntegrations(mockIntegrations);
    saveIntegrations(defaults);
    return defaults;
  }

  try {
    const parsed = JSON.parse(stored) as unknown;
    if (!Array.isArray(parsed) || !parsed.every(isIntegration)) {
      const defaults = cloneIntegrations(mockIntegrations);
      saveIntegrations(defaults);
      return defaults;
    }

    return cloneIntegrations(parsed);
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return cloneIntegrations(mockIntegrations);
  }
}

export function saveIntegrations(integrations: Integration[]) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cloneIntegrations(integrations)));
}

export function updateIntegration(integrationId: string, updates: Partial<Integration>) {
  const integrations = getIntegrations();
  let updatedIntegration: Integration | undefined;
  const next = integrations.map((integration) => {
    if (integration.id !== integrationId) return integration;

    updatedIntegration = {
      ...integration,
      ...updates,
    };

    return updatedIntegration;
  });

  saveIntegrations(next);
  return updatedIntegration;
}
