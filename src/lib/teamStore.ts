import { mockTeam } from '@/data/mockData';
import type { TeamMember } from '@/types';

const STORAGE_KEY = 'replyroute_team_members';

function canUseStorage() {
  return typeof window !== 'undefined' && Boolean(window.localStorage);
}

function cloneTeam(members: TeamMember[]) {
  return members.map((member) => ({ ...member }));
}

function isTeamMember(value: unknown): value is TeamMember {
  if (!value || typeof value !== 'object') return false;

  const member = value as Partial<TeamMember>;
  return Boolean(
    member.id
    && member.name
    && member.email
    && member.role
    && member.department
    && member.status,
  );
}

export function getTeamMembers() {
  if (!canUseStorage()) return cloneTeam(mockTeam);

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    const defaults = cloneTeam(mockTeam);
    saveTeamMembers(defaults);
    return defaults;
  }

  try {
    const parsed = JSON.parse(stored) as unknown;
    if (!Array.isArray(parsed) || !parsed.every(isTeamMember)) {
      const defaults = cloneTeam(mockTeam);
      saveTeamMembers(defaults);
      return defaults;
    }

    return cloneTeam(parsed);
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return cloneTeam(mockTeam);
  }
}

export function saveTeamMembers(members: TeamMember[]) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cloneTeam(members)));
}

export function addTeamMember(member: TeamMember) {
  const members = getTeamMembers();
  const newMember = {
    ...member,
    id: member.id || `team-${crypto.randomUUID()}`,
  };

  saveTeamMembers([newMember, ...members]);
  return newMember;
}

export function updateTeamMember(memberId: string, updates: Partial<TeamMember>) {
  const members = getTeamMembers();
  let updatedMember: TeamMember | undefined;
  const next = members.map((member) => {
    if (member.id !== memberId) return member;

    updatedMember = {
      ...member,
      ...updates,
    };

    return updatedMember;
  });

  saveTeamMembers(next);
  return updatedMember;
}

export function deleteTeamMember(memberId: string) {
  const next = getTeamMembers().filter((member) => member.id !== memberId);
  saveTeamMembers(next);
}
