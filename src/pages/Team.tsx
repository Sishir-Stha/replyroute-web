import { useEffect, useState } from 'react';
import { Circle, Pencil, Plus, Trash2, X } from 'lucide-react';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { useAuth } from '@/context/AuthContext';
import { canManageTeam } from '@/lib/permissions';
import { departments } from '@/lib/routingEngine';
import { createUser, getUsers, toggleUser, updateUser } from '@/services/userService';
import type { Department, OnlineStatus, TeamMember, TeamRole } from '@/types';

type TeamModalMode = 'create' | 'edit';

const statusColors = {
  online: 'text-green-500',
  offline: 'text-gray-300',
  away: 'text-amber-400',
};

const roleStyles = {
  SUPER_ADMIN: 'bg-purple-100 text-purple-700',
  DEPARTMENT_HEAD: 'bg-blue-100 text-blue-700',
  SOCIAL_MEDIA_HANDLER: 'bg-gray-100 text-gray-700',
};

const teamRoles: TeamRole[] = ['SUPER_ADMIN', 'DEPARTMENT_HEAD', 'SOCIAL_MEDIA_HANDLER'];
const onlineStatuses: OnlineStatus[] = ['online', 'offline', 'away'];

function formatRole(role: TeamRole) {
  return role
    .split('_')
    .map((word) => word[0] + word.slice(1).toLowerCase())
    .join(' ');
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function parsePositiveNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function createEmptyMember(): TeamMember {
  return {
    id: `team-${crypto.randomUUID()}`,
    name: '',
    email: '',
    role: 'SOCIAL_MEDIA_HANDLER',
    department: 'Customer Support',
    activeTickets: 0,
    resolvedToday: 0,
    avgResponseTime: '1h',
    status: 'online',
  };
}

export default function Team() {
  const { user } = useAuth();
  const canManage = canManageTeam(user);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [modalMode, setModalMode] = useState<TeamModalMode | null>(null);
  const [draftMember, setDraftMember] = useState<TeamMember | null>(null);
  const [memberError, setMemberError] = useState('');
  const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null);

  const refreshMembers = async () => {
    setLoading(true);
    setLoadError('');
    try {
      setMembers(await getUsers());
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Unable to load team members.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshMembers();
  }, []);

  const openCreateModal = () => {
    if (!canManage) return;

    setDraftMember(createEmptyMember());
    setMemberError('');
    setModalMode('create');
  };

  const openEditModal = (member: TeamMember) => {
    if (!canManage) return;

    setDraftMember({ ...member });
    setMemberError('');
    setModalMode('edit');
  };

  const closeModal = () => {
    setModalMode(null);
    setDraftMember(null);
    setMemberError('');
  };

  const updateDraft = (updates: Partial<TeamMember>) => {
    setDraftMember((current) => (current ? { ...current, ...updates } : current));
  };

  const saveMember = async () => {
    if (!draftMember || !modalMode || !canManage) return;

    if (!draftMember.name.trim()) {
      setMemberError('Name is required.');
      return;
    }

    if (!draftMember.email.trim()) {
      setMemberError('Email is required.');
      return;
    }

    const payload: TeamMember = {
      ...draftMember,
      name: draftMember.name.trim(),
      email: draftMember.email.trim().toLowerCase(),
      avgResponseTime: draftMember.avgResponseTime.trim() || '1h',
    };

    try {
      if (modalMode === 'create') {
        await createUser({ ...payload, password: 'demo123' });
      } else {
        await updateUser(payload.id, payload);
      }

      await refreshMembers();
      closeModal();
    } catch (error) {
      setMemberError(error instanceof Error ? error.message : 'Unable to save team member.');
    }
  };

  const confirmDeleteMember = () => {
    if (!memberToDelete) return;

    void toggleUser(memberToDelete.id)
      .then(async () => {
        setMemberToDelete(null);
        await refreshMembers();
      })
      .catch((error) => {
        setLoadError(error instanceof Error ? error.message : 'Unable to toggle team member.');
        setMemberToDelete(null);
      });
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Members</h1>
          <p className="text-sm text-gray-500">Staff managing incoming inquiries across departments</p>
        </div>
        {canManage && (
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-ocean-500 to-teal-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-95"
          >
            <Plus size={16} />
            Create Member
          </button>
        )}
      </div>

      {loadError && (
        <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
          {loadError}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              {['Name', 'Role', 'Department', 'Active Tickets', 'Resolved Today', 'Avg Response', 'Status'].map((header) => (
                <th key={header} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">{header}</th>
              ))}
              {canManage && <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {members.map((member) => (
              <tr key={member.id} className="transition-colors hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-ocean-100 to-teal-100 text-xs font-bold text-ocean-700">
                      {getInitials(member.name)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{member.name}</p>
                      <p className="text-[11px] text-gray-400">{member.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${roleStyles[member.role]}`}>
                    {formatRole(member.role)}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">{member.department}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{member.activeTickets}</td>
                <td className="px-4 py-3 text-sm font-medium text-green-600">{member.resolvedToday}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{member.avgResponseTime}</td>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-1 text-xs capitalize">
                    <Circle size={8} fill="currentColor" className={statusColors[member.status]} />
                    {member.status}
                  </span>
                </td>
                {canManage && (
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => openEditModal(member)}
                        className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                        aria-label={`Edit ${member.name}`}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setMemberToDelete(member)}
                        className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                        aria-label={`Delete ${member.name}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {members.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
          {loading ? 'Loading team members...' : 'No team members found.'}
        </div>
      )}

      {draftMember && modalMode && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/45 px-4 py-8">
          <div role="dialog" aria-modal="true" className="w-full max-w-3xl rounded-2xl border border-gray-200 bg-white shadow-xl">
            <div className="flex items-start justify-between border-b border-gray-100 px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {modalMode === 'create' ? 'Create Team Member' : 'Edit Team Member'}
                </h2>
                <p className="text-sm text-gray-500">Manage demo users shown in team and analytics views.</p>
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
                  <label className="text-xs font-medium text-gray-600">Name</label>
                  <input
                    value={draftMember.name}
                    onChange={(event) => updateDraft({ name: event.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-ocean-500"
                    placeholder="Rita HR Handler"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600">Email</label>
                  <input
                    type="email"
                    value={draftMember.email}
                    onChange={(event) => updateDraft({ email: event.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-ocean-500"
                    placeholder="name@yeti.com"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600">Role</label>
                  <select
                    value={draftMember.role}
                    onChange={(event) => updateDraft({ role: event.target.value as TeamRole })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 outline-none focus:border-ocean-500"
                  >
                    {teamRoles.map((role) => (
                      <option key={role} value={role}>{formatRole(role)}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600">Department</label>
                  <select
                    value={draftMember.department}
                    onChange={(event) => updateDraft({ department: event.target.value as Department })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 outline-none focus:border-ocean-500"
                  >
                    {departments.map((department) => (
                      <option key={department} value={department}>{department}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600">Active Tickets</label>
                  <input
                    type="number"
                    min={0}
                    value={draftMember.activeTickets}
                    onChange={(event) => updateDraft({ activeTickets: parsePositiveNumber(event.target.value) })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-ocean-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600">Resolved Today</label>
                  <input
                    type="number"
                    min={0}
                    value={draftMember.resolvedToday}
                    onChange={(event) => updateDraft({ resolvedToday: parsePositiveNumber(event.target.value) })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-ocean-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600">Avg Response Time</label>
                  <input
                    value={draftMember.avgResponseTime}
                    onChange={(event) => updateDraft({ avgResponseTime: event.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-ocean-500"
                    placeholder="1h 30m"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600">Status</label>
                  <select
                    value={draftMember.status}
                    onChange={(event) => updateDraft({ status: event.target.value as OnlineStatus })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 outline-none focus:border-ocean-500"
                  >
                    {onlineStatuses.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>

              {memberError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {memberError}
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
                onClick={saveMember}
                className="rounded-lg bg-gradient-to-r from-ocean-500 to-teal-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-95"
              >
                {modalMode === 'create' ? 'Create Member' : 'Save Member'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(memberToDelete)}
        title="Archive team member?"
        description={(
          <span>
            This will toggle <span className="font-semibold text-gray-900">{memberToDelete?.name}</span> active status in the backend.
          </span>
        )}
        confirmLabel="Archive Member"
        variant="danger"
        onCancel={() => setMemberToDelete(null)}
        onConfirm={confirmDeleteMember}
      />
    </div>
  );
}
