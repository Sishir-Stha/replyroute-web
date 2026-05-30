import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Circle, Plus, Trash2 } from 'lucide-react';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { useAuth } from '@/context/AuthContext';
import { canManageDepartments } from '@/lib/permissions';
import { getDepartments } from '@/services/departmentService';
import { getUsers, toggleUser, updateUser } from '@/services/userService';
import type { DepartmentInfo, TeamMember, TeamRole } from '@/types';

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

export default function DepartmentDetails() {
  const { departmentId } = useParams();
  const { user } = useAuth();
  const canManage = canManageDepartments(user);
  const [departments, setDepartments] = useState<DepartmentInfo[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [memberToRemove, setMemberToRemove] = useState<TeamMember | null>(null);
  const department = departments.find((item) => item.id === departmentId);

  const refreshData = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const [departmentList, userList] = await Promise.all([getDepartments(), getUsers()]);
      setDepartments(departmentList);
      setMembers(userList);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Unable to load department details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshData();
  }, []);

  if (!department) {
    return (
      <div className="space-y-6 p-6">
        <Link to="/departments" className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900">
          <ArrowLeft size={16} /> Back to Departments
        </Link>
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-gray-900">{loading ? 'Loading department...' : 'Department not found'}</h1>
          <p className="mt-2 text-sm text-gray-500">{loadError || 'The selected department is no longer available.'}</p>
        </div>
      </div>
    );
  }

  const departmentMembers = members.filter((member) => member.department === department.name);
  const availableMembers = members.filter((member) => member.department !== department.name);

  const addSelectedMember = () => {
    if (!selectedMemberId || !canManage) return;

    const member = members.find((item) => item.id === selectedMemberId);
    if (!member) return;

    void updateUser(member.id, { ...member, department: department.name, departmentId: department.id })
      .then(async () => {
        setSelectedMemberId('');
        await refreshData();
      })
      .catch((error) => setLoadError(error instanceof Error ? error.message : 'Unable to add member.'));
  };

  const confirmRemoveMember = () => {
    if (!memberToRemove || !canManage) return;

    void toggleUser(memberToRemove.id)
      .then(async () => {
        setMemberToRemove(null);
        await refreshData();
      })
      .catch((error) => {
        setLoadError(error instanceof Error ? error.message : 'Unable to remove member.');
        setMemberToRemove(null);
      });
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link to="/departments" className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900">
            <ArrowLeft size={16} /> Back to Departments
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{department.name}</h1>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-600">
              <span className={`h-2 w-2 rounded-full ${healthColors[department.health]}`} />
              {healthLabels[department.health]}
            </span>
          </div>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">{department.description}</p>
        </div>
      </div>

      {loadError && (
        <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
          {loadError}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {[
          { label: 'Open Inquiries', value: department.openInquiries },
          { label: 'Resolved Today', value: department.resolvedToday },
          { label: 'Avg Response Time', value: department.avgResponseTime },
          { label: 'SLA Target', value: department.slaTarget },
          { label: 'Members', value: departmentMembers.length },
        ].map((metric) => (
          <div key={metric.label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs text-gray-500">{metric.label}</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{metric.value}</p>
            <p className="mt-1 text-[11px] text-gray-400">Read-only</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 border-b border-gray-100 pb-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Department Members</h2>
            <p className="text-sm text-gray-500">Add an existing team member to this department or remove a member from the team list.</p>
          </div>
          {canManage && (
            <div className="flex flex-col gap-2 sm:flex-row">
              <select
                value={selectedMemberId}
                onChange={(event) => setSelectedMemberId(event.target.value)}
                className="min-w-64 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 outline-none focus:border-ocean-500"
              >
                <option value="">Select member from whole team</option>
                {availableMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} - {member.department}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={addSelectedMember}
                disabled={!selectedMemberId}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-ocean-500 to-teal-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-95 disabled:cursor-not-allowed disabled:from-gray-200 disabled:to-gray-200 disabled:text-gray-400"
              >
                <Plus size={15} /> Add Member
              </button>
            </div>
          )}
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-gray-200">
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                {['Name', 'Role', 'Active Tickets', 'Resolved Today', 'Avg Response', 'Status'].map((header) => (
                  <th key={header} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">{header}</th>
                ))}
                {canManage && <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {departmentMembers.map((member) => (
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
                      <button
                        type="button"
                        onClick={() => setMemberToRemove(member)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs font-medium text-red-600 transition-colors hover:bg-red-100"
                      >
                        <Trash2 size={14} /> Remove
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          {departmentMembers.length === 0 && (
            <div className="p-8 text-center text-sm text-gray-500">
              No members are currently assigned to this department.
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(memberToRemove)}
        title="Remove member?"
        description={(
          <span>
            This will deactivate <span className="font-semibold text-gray-900">{memberToRemove?.name}</span> in the backend.
          </span>
        )}
        confirmLabel="Remove Member"
        variant="danger"
        onCancel={() => setMemberToRemove(null)}
        onConfirm={confirmRemoveMember}
      />
    </div>
  );
}
