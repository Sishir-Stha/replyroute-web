import { useState } from 'react';
import {
  ArrowRight,
  GitBranch,
  Pencil,
  Plus,
  Power,
  PowerOff,
  Shield,
  Trash2,
  X,
  Zap,
} from 'lucide-react';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { useAuth } from '@/context/AuthContext';
import { useInquiries } from '@/context/InquiryContext';
import { canManageRoutingRules } from '@/lib/permissions';
import { departments } from '@/lib/routingEngine';
import type { Department, Priority, RoutingRule } from '@/types';

type RuleModalMode = 'create' | 'edit';

type RuleDraft = {
  id?: string;
  name: string;
  keywordsText: string;
  targetDepartment: Department;
  priority: Priority;
  active: boolean;
  description: string;
  routingReason: string;
  nextAction: string;
};

const priorities: Priority[] = ['Low', 'Medium', 'High', 'Urgent'];

function createEmptyDraft(): RuleDraft {
  return {
    name: '',
    keywordsText: '',
    targetDepartment: 'Admin',
    priority: 'Medium',
    active: true,
    description: '',
    routingReason: '',
    nextAction: '',
  };
}

function createDraftFromRule(rule: RoutingRule): RuleDraft {
  return {
    id: rule.id,
    name: rule.name,
    keywordsText: rule.keywords.join(', '),
    targetDepartment: rule.targetDepartment,
    priority: rule.priority,
    active: rule.active,
    description: rule.description ?? '',
    routingReason: rule.routingReason ?? '',
    nextAction: rule.nextAction ?? '',
  };
}

function parseKeywords(value: string) {
  return value
    .split(',')
    .map((keyword) => keyword.trim())
    .filter(Boolean);
}

export default function RoutingRules() {
  const { user } = useAuth();
  const {
    routingRules: rules,
    toggleRoutingRule,
    updateRoutingRule,
    deleteRoutingRule,
    addRoutingRule,
  } = useInquiries();
  const canEdit = canManageRoutingRules(user);
  const [modalMode, setModalMode] = useState<RuleModalMode | null>(null);
  const [draft, setDraft] = useState<RuleDraft>(() => createEmptyDraft());
  const [ruleError, setRuleError] = useState('');
  const [ruleToDelete, setRuleToDelete] = useState<RoutingRule | null>(null);

  const toggleRule = (id: string) => {
    if (!canEdit) return;
    toggleRoutingRule(id);
  };

  const openCreateModal = () => {
    if (!canEdit) return;

    setDraft(createEmptyDraft());
    setRuleError('');
    setModalMode('create');
  };

  const openEditModal = (rule: RoutingRule) => {
    if (!canEdit) return;

    setDraft(createDraftFromRule(rule));
    setRuleError('');
    setModalMode('edit');
  };

  const closeRuleModal = () => {
    setModalMode(null);
    setRuleError('');
    setDraft(createEmptyDraft());
  };

  const updateDraft = (updates: Partial<RuleDraft>) => {
    setDraft((current) => ({ ...current, ...updates }));
  };

  const saveRule = () => {
    if (!canEdit || !modalMode) return;

    const name = draft.name.trim();
    const keywords = parseKeywords(draft.keywordsText);

    if (!name) {
      setRuleError('Rule name is required.');
      return;
    }

    if (keywords.length === 0) {
      setRuleError('Add at least one keyword.');
      return;
    }

    const description = draft.description.trim()
      || `Routes matching messages to ${draft.targetDepartment}`;
    const routingReason = draft.routingReason.trim()
      || `Message contains keywords for ${draft.targetDepartment}.`;
    const nextAction = draft.nextAction.trim()
      || `${draft.targetDepartment} should review and respond.`;

    if (modalMode === 'create') {
      addRoutingRule({
        name,
        keywords,
        targetDepartment: draft.targetDepartment,
        priority: draft.priority,
        active: draft.active,
        description,
        routingReason,
        nextAction,
      });
    } else if (draft.id) {
      updateRoutingRule(draft.id, {
        name,
        keywords,
        targetDepartment: draft.targetDepartment,
        priority: draft.priority,
        active: draft.active,
        description,
        routingReason,
        nextAction,
      });
    }

    closeRuleModal();
  };

  const confirmDeleteRule = () => {
    if (!ruleToDelete) return;

    deleteRoutingRule(ruleToDelete.id);
    setRuleToDelete(null);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Routing Rules</h1>
          <p className="text-sm text-gray-500">Automatically route incoming messages to the correct department based on keywords</p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          disabled={!canEdit}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-ocean-500 to-teal-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:from-gray-200 disabled:to-gray-200 disabled:text-gray-400"
        >
          <Plus size={16} /> Create Rule
        </button>
      </div>

      <div className="rounded-xl border border-ocean-200 bg-gradient-to-r from-ocean-50 to-teal-50 p-5">
        <div className="mb-3 flex items-center gap-2">
          <Zap size={18} className="text-ocean-600" />
          <h3 className="text-sm font-semibold text-ocean-800">How Intelligent Routing Works</h3>
        </div>
        <div className="flex items-center gap-4 text-xs text-ocean-700">
          <div className="flex items-center gap-2 rounded-lg bg-white/60 px-3 py-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ocean-500 text-[10px] font-bold text-white">1</span>
            Customer sends message
          </div>
          <ArrowRight size={14} className="text-ocean-400" />
          <div className="flex items-center gap-2 rounded-lg bg-white/60 px-3 py-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ocean-500 text-[10px] font-bold text-white">2</span>
            Keywords detected
          </div>
          <ArrowRight size={14} className="text-ocean-400" />
          <div className="flex items-center gap-2 rounded-lg bg-white/60 px-3 py-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ocean-500 text-[10px] font-bold text-white">3</span>
            Routed to department
          </div>
          <ArrowRight size={14} className="text-ocean-400" />
          <div className="flex items-center gap-2 rounded-lg bg-white/60 px-3 py-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ocean-500 text-[10px] font-bold text-white">4</span>
            Owner assigned + SLA started
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Rule Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Keywords</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Target Department</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Priority</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rules.map((rule) => (
              <tr key={rule.id} className={`transition-colors hover:bg-gray-50 ${!rule.active ? 'opacity-50' : ''}`}>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2">
                    <GitBranch size={16} className="text-ocean-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{rule.name}</p>
                      {rule.description && <p className="text-[11px] text-gray-400">{rule.description}</p>}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex max-w-xs flex-wrap gap-1">
                    {rule.keywords.map((keyword) => (
                      <span key={keyword} className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <span className="inline-flex items-center gap-1 rounded-lg bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700">
                    <Shield size={12} /> {rule.targetDepartment}
                  </span>
                </td>
                <td className="px-4 py-3.5"><PriorityBadge priority={rule.priority} /></td>
                <td className="px-4 py-3.5">
                  <button
                    type="button"
                    onClick={() => toggleRule(rule.id)}
                    disabled={!canEdit}
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed ${rule.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                  >
                    {rule.active ? <><Power size={12} /> Active</> : <><PowerOff size={12} /> Inactive</>}
                  </button>
                </td>
                <td className="px-4 py-3.5 text-right">
                  <div className="flex justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => openEditModal(rule)}
                      disabled={!canEdit}
                      className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-400"
                      aria-label={`Edit ${rule.name}`}
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => canEdit && setRuleToDelete(rule)}
                      disabled={!canEdit}
                      className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-400"
                      aria-label={`Delete ${rule.name}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
          <p className="text-2xl font-bold text-ocean-600">{rules.filter((rule) => rule.active).length}</p>
          <p className="text-xs text-gray-500">Active Rules</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
          <p className="text-2xl font-bold text-teal-600">{new Set(rules.map((rule) => rule.targetDepartment)).size}</p>
          <p className="text-xs text-gray-500">Departments Covered</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
          <p className="text-2xl font-bold text-brand-600">{rules.reduce((total, rule) => total + rule.keywords.length, 0)}</p>
          <p className="text-xs text-gray-500">Total Keywords</p>
        </div>
      </div>

      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/45 px-4 py-8">
          <div role="dialog" aria-modal="true" className="w-full max-w-3xl rounded-2xl border border-gray-200 bg-white shadow-xl">
            <div className="flex items-start justify-between border-b border-gray-100 px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {modalMode === 'create' ? 'Create Routing Rule' : 'Edit Routing Rule'}
                </h2>
                <p className="text-sm text-gray-500">Define keywords, destination department, and routing guidance.</p>
              </div>
              <button
                type="button"
                onClick={closeRuleModal}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 px-5 py-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-medium text-gray-600">Rule name</label>
                  <input
                    value={draft.name}
                    onChange={(event) => updateDraft({ name: event.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-ocean-500"
                    placeholder="Vacancy Inquiry Rule"
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-medium text-gray-600">Keywords separated by commas</label>
                  <textarea
                    rows={3}
                    value={draft.keywordsText}
                    onChange={(event) => updateDraft({ keywordsText: event.target.value })}
                    className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-ocean-500"
                    placeholder="vacancy, job, cv, resume"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600">Target department</label>
                  <select
                    value={draft.targetDepartment}
                    onChange={(event) => updateDraft({ targetDepartment: event.target.value as Department })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 outline-none focus:border-ocean-500"
                  >
                    {departments.map((department) => (
                      <option key={department} value={department}>{department}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600">Priority</label>
                  <select
                    value={draft.priority}
                    onChange={(event) => updateDraft({ priority: event.target.value as Priority })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 outline-none focus:border-ocean-500"
                  >
                    {priorities.map((priority) => (
                      <option key={priority} value={priority}>{priority}</option>
                    ))}
                  </select>
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-600 md:col-span-2">
                  <input
                    type="checkbox"
                    checked={draft.active}
                    onChange={(event) => updateDraft({ active: event.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-ocean-600"
                  />
                  Rule is active
                </label>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-medium text-gray-600">Description</label>
                  <input
                    value={draft.description}
                    onChange={(event) => updateDraft({ description: event.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-ocean-500"
                    placeholder={`Routes matching messages to ${draft.targetDepartment}`}
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-medium text-gray-600">Routing reason</label>
                  <input
                    value={draft.routingReason}
                    onChange={(event) => updateDraft({ routingReason: event.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-ocean-500"
                    placeholder={`Message contains keywords for ${draft.targetDepartment}.`}
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-medium text-gray-600">Next action</label>
                  <input
                    value={draft.nextAction}
                    onChange={(event) => updateDraft({ nextAction: event.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-ocean-500"
                    placeholder={`${draft.targetDepartment} should review and respond.`}
                  />
                </div>
              </div>

              {ruleError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {ruleError}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-5 py-4">
              <button
                type="button"
                onClick={closeRuleModal}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveRule}
                className="rounded-lg bg-gradient-to-r from-ocean-500 to-teal-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-95"
              >
                {modalMode === 'create' ? 'Create Rule' : 'Save Rule'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(ruleToDelete)}
        title="Delete routing rule?"
        description={(
          <span>
            This will remove <span className="font-semibold text-gray-900">{ruleToDelete?.name}</span> from the routing rules list.
          </span>
        )}
        confirmLabel="Delete Rule"
        variant="danger"
        onCancel={() => setRuleToDelete(null)}
        onConfirm={confirmDeleteRule}
      />
    </div>
  );
}
