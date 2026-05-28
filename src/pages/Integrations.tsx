import { useState } from 'react';
import type { ReactNode } from 'react';
import {
  AtSign,
  CheckCircle2,
  Clock,
  Globe,
  Hash,
  Mail,
  MessageCircle,
  Pencil,
  Send,
  Smartphone,
  X,
  XCircle,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getIntegrations, updateIntegration } from '@/lib/integrationStore';
import { canManageIntegrations } from '@/lib/permissions';
import type { Integration, IntegrationStatus } from '@/types';

const iconMap: Record<string, ReactNode> = {
  Globe: <Globe size={28} />,
  Mail: <Mail size={28} />,
  Facebook: <Hash size={28} />,
  Instagram: <AtSign size={28} />,
  MessageCircle: <MessageCircle size={28} />,
  Smartphone: <Smartphone size={28} />,
  Send: <Send size={28} />,
};

const iconChoices = Object.keys(iconMap);

const statusConfig = {
  Connected: {
    icon: <CheckCircle2 size={14} />,
    color: 'bg-green-100 text-green-700',
    btnLabel: 'Connected',
    btnStyle: 'bg-green-50 text-green-700 border-green-200',
  },
  'Coming Soon': {
    icon: <Clock size={14} />,
    color: 'bg-amber-100 text-amber-700',
    btnLabel: 'Coming Soon',
    btnStyle: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  'Not Connected': {
    icon: <XCircle size={14} />,
    color: 'bg-gray-100 text-gray-500',
    btnLabel: 'Connect Later',
    btnStyle: 'bg-gray-50 text-gray-500 border-gray-200',
  },
};

const statuses: IntegrationStatus[] = ['Connected', 'Coming Soon', 'Not Connected'];
const channels: Integration['channel'][] = ['website', 'email', 'facebook', 'instagram', 'whatsapp', 'sms', 'telegram'];

export default function Integrations() {
  const { user } = useAuth();
  const canEdit = canManageIntegrations(user);
  const [integrations, setIntegrations] = useState<Integration[]>(() => getIntegrations());
  const [draftIntegration, setDraftIntegration] = useState<Integration | null>(null);
  const [integrationError, setIntegrationError] = useState('');

  const refreshIntegrations = () => setIntegrations(getIntegrations());

  const openEditModal = (integration: Integration) => {
    if (!canEdit) return;

    setDraftIntegration({ ...integration });
    setIntegrationError('');
  };

  const closeEditModal = () => {
    setDraftIntegration(null);
    setIntegrationError('');
  };

  const updateDraft = (updates: Partial<Integration>) => {
    setDraftIntegration((current) => (current ? { ...current, ...updates } : current));
  };

  const saveIntegration = () => {
    if (!draftIntegration || !canEdit) return;

    if (!draftIntegration.name.trim()) {
      setIntegrationError('Integration name is required.');
      return;
    }

    if (!draftIntegration.description.trim()) {
      setIntegrationError('Description is required.');
      return;
    }

    const connectedAt = draftIntegration.status === 'Connected'
      ? draftIntegration.connectedAt || new Date().toISOString().slice(0, 10)
      : undefined;

    updateIntegration(draftIntegration.id, {
      ...draftIntegration,
      name: draftIntegration.name.trim(),
      description: draftIntegration.description.trim(),
      connectedAt,
    });
    refreshIntegrations();
    closeEditModal();
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
        <p className="text-sm text-gray-500">Connect your communication channels to receive and route inquiries</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {integrations.map((integration) => {
          const status = statusConfig[integration.status];

          return (
            <div key={integration.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="rounded-lg bg-gradient-to-br from-ocean-50 to-teal-50 p-3 text-ocean-600">
                  {iconMap[integration.icon] ?? <Globe size={28} />}
                </div>
                <div className="flex items-start gap-2">
                  <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${status.color}`}>
                    {status.icon} {integration.status}
                  </span>
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => openEditModal(integration)}
                      className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                      aria-label={`Edit ${integration.name}`}
                    >
                      <Pencil size={14} />
                    </button>
                  )}
                </div>
              </div>

              <h3 className="text-base font-semibold text-gray-900">{integration.name}</h3>
              <p className="mt-1 text-xs text-gray-500">{integration.description}</p>
              {integration.connectedAt && (
                <p className="mt-1 text-[11px] text-gray-400">Connected since {integration.connectedAt}</p>
              )}
              <button
                type="button"
                className={`mt-4 w-full rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${status.btnStyle}`}
              >
                {status.btnLabel}
              </button>
            </div>
          );
        })}
      </div>

      {draftIntegration && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/45 px-4 py-8">
          <div role="dialog" aria-modal="true" className="w-full max-w-2xl rounded-2xl border border-gray-200 bg-white shadow-xl">
            <div className="flex items-start justify-between border-b border-gray-100 px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Edit Integration</h2>
                <p className="text-sm text-gray-500">Update the demo channel metadata and connection status.</p>
              </div>
              <button
                type="button"
                onClick={closeEditModal}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 px-5 py-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600">Integration name</label>
                  <input
                    value={draftIntegration.name}
                    onChange={(event) => updateDraft({ name: event.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-ocean-500"
                    placeholder="Website Form"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600">Channel</label>
                  <select
                    value={draftIntegration.channel}
                    onChange={(event) => updateDraft({ channel: event.target.value as Integration['channel'] })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 outline-none focus:border-ocean-500"
                  >
                    {channels.map((channel) => (
                      <option key={channel} value={channel}>{channel}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600">Status</label>
                  <select
                    value={draftIntegration.status}
                    onChange={(event) => updateDraft({ status: event.target.value as IntegrationStatus })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 outline-none focus:border-ocean-500"
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600">Icon</label>
                  <select
                    value={draftIntegration.icon}
                    onChange={(event) => updateDraft({ icon: event.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 outline-none focus:border-ocean-500"
                  >
                    {iconChoices.map((icon) => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-medium text-gray-600">Description</label>
                  <textarea
                    rows={3}
                    value={draftIntegration.description}
                    onChange={(event) => updateDraft({ description: event.target.value })}
                    className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-ocean-500"
                    placeholder="Collect inquiries from your corporate website"
                  />
                </div>
                {draftIntegration.status === 'Connected' && (
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-600">Connected since</label>
                    <input
                      type="date"
                      value={draftIntegration.connectedAt ?? ''}
                      onChange={(event) => updateDraft({ connectedAt: event.target.value || undefined })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-ocean-500"
                    />
                  </div>
                )}
              </div>

              {integrationError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {integrationError}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-5 py-4">
              <button
                type="button"
                onClick={closeEditModal}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveIntegration}
                className="rounded-lg bg-gradient-to-r from-ocean-500 to-teal-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-95"
              >
                Save Integration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
