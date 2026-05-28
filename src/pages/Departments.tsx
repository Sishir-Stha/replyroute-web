import { useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard,
  Handshake,
  Headphones,
  Megaphone,
  Monitor,
  Newspaper,
  Pencil,
  Plus,
  Scale,
  Settings,
  Shield,
  Trash2,
  TrendingUp,
  Users,
  X,
} from 'lucide-react';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { useAuth } from '@/context/AuthContext';
import { addDepartment, deleteDepartment, getDepartments, updateDepartment } from '@/lib/departmentStore';
import { canManageDepartments } from '@/lib/permissions';
import { departments as departmentNames } from '@/lib/routingEngine';
import type { Department, DepartmentInfo } from '@/types';

type DepartmentModalMode = 'create' | 'edit';

const iconMap: Record<string, ReactNode> = {
  Headphones: <Headphones size={22} />,
  TrendingUp: <TrendingUp size={22} />,
  Users: <Users size={22} />,
  Settings: <Settings size={22} />,
  CreditCard: <CreditCard size={22} />,
  Megaphone: <Megaphone size={22} />,
  Monitor: <Monitor size={22} />,
  Newspaper: <Newspaper size={22} />,
  Handshake: <Handshake size={22} />,
  Shield: <Shield size={22} />,
  Scale: <Scale size={22} />,
};

const iconChoices = Object.keys(iconMap);

const healthColors = {
  healthy: 'bg-green-500',
  warning: 'bg-amber-500',
  critical: 'bg-red-500',
};

const healthLabels = {
  healthy: 'Healthy',
  warning: 'Needs Attention',
  critical: 'Critical',
};

function createEmptyDepartment(): DepartmentInfo {
  return {
    id: `dept-${crypto.randomUUID()}`,
    name: 'Admin',
    icon: 'Shield',
    openInquiries: 0,
    avgResponseTime: '1h',
    members: [],
    slaTarget: '4 hours',
    health: 'healthy',
    resolvedToday: 0,
    description: '',
  };
}

export default function Departments() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const canManage = canManageDepartments(user);
  const [departments, setDepartments] = useState<DepartmentInfo[]>(() => getDepartments());
  const [modalMode, setModalMode] = useState<DepartmentModalMode | null>(null);
  const [draftDepartment, setDraftDepartment] = useState<DepartmentInfo | null>(null);
  const [departmentError, setDepartmentError] = useState('');
  const [departmentToDelete, setDepartmentToDelete] = useState<DepartmentInfo | null>(null);

  const refreshDepartments = () => setDepartments(getDepartments());

  const openCreateModal = () => {
    if (!canManage) return;

    setDraftDepartment(createEmptyDepartment());
    setDepartmentError('');
    setModalMode('create');
  };

  const openEditModal = (department: DepartmentInfo) => {
    if (!canManage) return;

    setDraftDepartment({
      ...department,
      members: [...department.members],
    });
    setDepartmentError('');
    setModalMode('edit');
  };

  const closeModal = () => {
    setModalMode(null);
    setDraftDepartment(null);
    setDepartmentError('');
  };

  const updateDraft = (updates: Partial<DepartmentInfo>) => {
    setDraftDepartment((current) => (current ? { ...current, ...updates } : current));
  };

  const saveDepartment = () => {
    if (!draftDepartment || !modalMode || !canManage) return;

    if (!draftDepartment.description.trim()) {
      setDepartmentError('Department description is required.');
      return;
    }

    const payload: DepartmentInfo = {
      ...draftDepartment,
      description: draftDepartment.description.trim(),
      avgResponseTime: draftDepartment.avgResponseTime.trim() || '1h',
    };

    if (modalMode === 'create') {
      addDepartment(payload);
    } else {
      updateDepartment(payload.id, payload);
    }

    refreshDepartments();
    closeModal();
  };

  const confirmDeleteDepartment = () => {
    if (!departmentToDelete) return;

    deleteDepartment(departmentToDelete.id);
    setDepartmentToDelete(null);
    refreshDepartments();
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
          <p className="text-sm text-gray-500">Manage departments and monitor workload distribution</p>
        </div>
        {canManage && (
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-ocean-500 to-teal-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-95"
          >
            <Plus size={16} />
            Create Department
          </button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {departments.map((department) => (
          <div
            key={department.id}
            onDoubleClick={() => navigate(`/departments/${department.id}`)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') navigate(`/departments/${department.id}`);
            }}
            role="button"
            tabIndex={0}
            title="Double-click to open department details"
            className="cursor-pointer rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ocean-200"
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="rounded-lg bg-gradient-to-br from-ocean-500 to-teal-500 p-2.5 text-white">
                  {iconMap[department.icon] || <Shield size={22} />}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900">{department.name}</h3>
                </div>
              </div>
              <div className="flex shrink-0 items-start gap-2">
                <div className="flex items-center gap-1.5 pt-1">
                  <div className={`h-2 w-2 rounded-full ${healthColors[department.health]}`} />
                  <span className="text-[11px] text-gray-500">{healthLabels[department.health]}</span>
                </div>
                {canManage && (
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => openEditModal(department)}
                      className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                      aria-label={`Edit ${department.name}`}
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDepartmentToDelete(department)}
                      className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                      aria-label={`Delete ${department.name}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="mb-3 grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-gray-50 p-2.5 text-center">
                <p className="text-lg font-bold text-gray-900">{department.openInquiries}</p>
                <p className="text-[10px] text-gray-400">Open Inquiries</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-2.5 text-center">
                <p className="text-lg font-bold text-gray-900">{department.resolvedToday}</p>
                <p className="text-[10px] text-gray-400">Resolved Today</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {draftDepartment && modalMode && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/45 px-4 py-8">
          <div role="dialog" aria-modal="true" className="w-full max-w-3xl rounded-2xl border border-gray-200 bg-white shadow-xl">
            <div className="flex items-start justify-between border-b border-gray-100 px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {modalMode === 'create' ? 'Create Department' : 'Edit Department'}
                </h2>
                <p className="text-sm text-gray-500">Manage department metadata used in the admin view.</p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 px-5 py-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600">Department name</label>
                  <select
                    value={draftDepartment.name}
                    onChange={(event) => updateDraft({ name: event.target.value as Department })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 outline-none focus:border-ocean-500"
                  >
                    {departmentNames.map((name) => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600">Icon</label>
                  <select
                    value={draftDepartment.icon}
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
                    value={draftDepartment.description}
                    onChange={(event) => updateDraft({ description: event.target.value })}
                    className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-ocean-500"
                    placeholder="Handles general administration and fallback routing"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600">Health</label>
                  <select
                    value={draftDepartment.health}
                    onChange={(event) => updateDraft({ health: event.target.value as DepartmentInfo['health'] })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 outline-none focus:border-ocean-500"
                  >
                    <option value="healthy">Healthy</option>
                    <option value="warning">Needs Attention</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600">Avg Response Time</label>
                  <input
                    value={draftDepartment.avgResponseTime}
                    onChange={(event) => updateDraft({ avgResponseTime: event.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-ocean-500"
                    placeholder="1h 30m"
                  />
                </div>
              </div>

              {departmentError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {departmentError}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-5 py-4">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveDepartment}
                className="rounded-lg bg-gradient-to-r from-ocean-500 to-teal-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-95"
              >
                {modalMode === 'create' ? 'Create Department' : 'Save Department'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(departmentToDelete)}
        title="Delete department?"
        description={(
          <span>
            This will remove <span className="font-semibold text-gray-900">{departmentToDelete?.name}</span> from the department admin list.
          </span>
        )}
        confirmLabel="Delete Department"
        variant="danger"
        onCancel={() => setDepartmentToDelete(null)}
        onConfirm={confirmDeleteDepartment}
      />
    </div>
  );
}
