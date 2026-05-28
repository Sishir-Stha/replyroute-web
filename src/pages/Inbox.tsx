import { useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  AtSign,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Filter,
  Globe,
  Hash,
  Mail,
  MessageCircle,
  MessageSquare,
  Send,
  Search,
  StickyNote,
  User,
  Zap,
} from 'lucide-react';
import { ChannelIcon } from '@/components/common/ChannelIcon';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { SLAIndicator } from '@/components/common/SLAIndicator';
import { StatusBadge } from '@/components/common/StatusBadge';
import { useAuth } from '@/context/AuthContext';
import { useInquiries } from '@/context/InquiryContext';
import { departmentOwners } from '@/data/mockData';
import { getAllowedDepartmentFilters, getVisibleInquiries } from '@/lib/inquiryAccess';
import {
  canAddNote,
  canAssignOwnerWithinDepartment,
  canEscalate,
  canOverrideDepartment,
  canReply,
  canUpdateStatus,
} from '@/lib/permissions';
import { departments } from '@/lib/routingEngine';
import type { Channel, Department, Inquiry, InquiryStatus } from '@/types';

const channelFilters: { value: Channel | 'all'; label: string }[] = [
  { value: 'all', label: 'All Channels' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'website', label: 'Website' },
  { value: 'email', label: 'Email' },
];

const statusFilters: { value: InquiryStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Status' },
  { value: 'New', label: 'New' },
  { value: 'Assigned', label: 'Assigned' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Resolved', label: 'Resolved' },
  { value: 'Escalated', label: 'Escalated' },
];

const quickFilters = [
  { key: 'all', label: 'All' },
  { key: 'unassigned', label: 'Unassigned' },
  { key: 'high', label: 'High Priority' },
  { key: 'overdue', label: 'Overdue' },
];

function getChannelSmallIcon(channel: Channel) {
  const size = 14;

  switch (channel) {
    case 'facebook':
      return <Hash size={size} className="text-blue-500" />;
    case 'instagram':
      return <AtSign size={size} className="text-pink-500" />;
    case 'whatsapp':
      return <MessageCircle size={size} className="text-green-500" />;
    case 'website':
      return <Globe size={size} className="text-teal-500" />;
    case 'email':
      return <Mail size={size} className="text-orange-500" />;
  }
}

function timeAgo(dateString: string) {
  const diff = Date.now() - new Date(dateString).getTime();
  const mins = Math.max(0, Math.floor(diff / 60000));
  if (mins < 60) return `${mins}m ago`;

  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;

  return `${Math.floor(hours / 24)}d ago`;
}

function getInitials(name: string) {
  return name.split(' ').map((part) => part[0]).join('');
}

function getButtonClass(disabled: boolean) {
  return `flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
    disabled
      ? 'cursor-not-allowed border-gray-100 bg-gray-50 text-gray-300'
      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
  }`;
}

function getReplyMessage(message: string) {
  return message.replace(/^Reply sent: "/, '').replace(/"$/, '');
}

function addTimelineEntry(inquiry: Inquiry, message: string, userName: string, type: Inquiry['timeline'][number]['type']) {
  const timestamp = new Date().toISOString();

  return [
    ...inquiry.timeline,
    {
      id: `tl-${timestamp}`,
      type,
      message,
      timestamp,
      user: userName,
    },
  ];
}

export default function Inbox() {
  const { user } = useAuth();
  const { inquiries, updateInquiry } = useInquiries();
  const [selectedId, setSelectedId] = useState('');
  const [search, setSearch] = useState('');
  const [channelFilter, setChannelFilter] = useState<Channel | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<InquiryStatus | 'all'>('all');
  const [deptFilter, setDeptFilter] = useState<Department | 'all'>('all');
  const [quickFilter, setQuickFilter] = useState('all');
  const [newNote, setNewNote] = useState('');
  const [replyText, setReplyText] = useState('');
  const [timelineOpen, setTimelineOpen] = useState(true);
  const [messageListWidth, setMessageListWidth] = useState(384);
  const resizeStateRef = useRef({ startX: 0, startWidth: 384 });

  const visibleInquiries = useMemo(() => getVisibleInquiries(inquiries, user), [inquiries, user]);
  const allowedDepartmentFilters = useMemo(
    () => getAllowedDepartmentFilters(departments, user),
    [user],
  );
  const effectiveDeptFilter = allowedDepartmentFilters.length === 1
    ? allowedDepartmentFilters[0]
    : allowedDepartmentFilters.includes(deptFilter)
      ? deptFilter
      : 'all';

  const filtered = useMemo(() => {
    let result = visibleInquiries;

    if (search) {
      const normalizedSearch = search.toLowerCase();
      result = result.filter((inquiry) => (
        inquiry.customerName.toLowerCase().includes(normalizedSearch)
        || inquiry.message.toLowerCase().includes(normalizedSearch)
        || inquiry.category.toLowerCase().includes(normalizedSearch)
        || inquiry.matchedKeywords.some((keyword) => keyword.toLowerCase().includes(normalizedSearch))
      ));
    }

    if (channelFilter !== 'all') result = result.filter((inquiry) => inquiry.channel === channelFilter);
    if (statusFilter !== 'all') result = result.filter((inquiry) => inquiry.status === statusFilter);
    if (effectiveDeptFilter !== 'all') result = result.filter((inquiry) => inquiry.assignedDepartment === effectiveDeptFilter);
    if (quickFilter === 'unassigned') result = result.filter((inquiry) => !inquiry.assignedOwner);
    if (quickFilter === 'high') result = result.filter((inquiry) => inquiry.priority === 'High' || inquiry.priority === 'Urgent');
    if (quickFilter === 'overdue') result = result.filter((inquiry) => inquiry.isOverdue);

    return result;
  }, [channelFilter, effectiveDeptFilter, quickFilter, search, statusFilter, visibleInquiries]);

  const selected = filtered.find((inquiry) => inquiry.id === selectedId) ?? filtered[0];
  const activeSelectedId = selected?.id ?? '';
  const replyEntries = selected?.timeline.filter((entry) => entry.type === 'reply') ?? [];

  const counts = useMemo(() => ({
    all: visibleInquiries.length,
    unassigned: visibleInquiries.filter((inquiry) => !inquiry.assignedOwner).length,
    high: visibleInquiries.filter((inquiry) => inquiry.priority === 'High' || inquiry.priority === 'Urgent').length,
    overdue: visibleInquiries.filter((inquiry) => inquiry.isOverdue).length,
  }), [visibleInquiries]);

  const actor = user?.name ?? 'Demo User';
  const allowDepartmentOverride = canOverrideDepartment(user);
  const allowAssignOwner = selected ? canAssignOwnerWithinDepartment(user, selected) : false;
  const allowStatusUpdate = selected ? canUpdateStatus(user, selected) : false;
  const allowNote = selected ? canAddNote(user, selected) : false;
  const allowReply = selected ? canReply(user, selected) : false;
  const allowEscalate = selected ? canEscalate(user, selected) : false;

  const addNote = () => {
    if (!newNote.trim() || !selected || !allowNote) return;

    const timestamp = new Date().toISOString();

    updateInquiry(selected.id, {
      notes: [
        ...selected.notes,
        {
          id: `n-${timestamp}`,
          message: newNote,
          author: actor,
          timestamp,
        },
      ],
      timeline: addTimelineEntry(
        selected,
        `Note added: "${newNote.slice(0, 50)}${newNote.length > 50 ? '...' : ''}"`,
        actor,
        'note',
      ),
    });
    setNewNote('');
  };

  const assignToMe = () => {
    if (!selected || !allowAssignOwner) return;

    updateInquiry(selected.id, {
      assignedOwner: actor,
      assignee: actor,
      responseOwner: actor,
      status: 'Assigned',
      timeline: addTimelineEntry(selected, `Assigned to ${actor}`, actor, 'assignment'),
    });
  };

  const updateStatus = (status: InquiryStatus) => {
    if (!selected || !allowStatusUpdate) return;

    updateInquiry(selected.id, {
      status,
      isOverdue: status === 'Resolved' ? false : selected.isOverdue,
      lastResponseAt: new Date().toISOString(),
      timeline: addTimelineEntry(selected, `Status changed to ${status}`, actor, 'status_change'),
    });
  };

  const sendReply = () => {
    if (!selected || !allowReply || !replyText.trim()) return;

    updateInquiry(selected.id, {
      lastResponseAt: new Date().toISOString(),
      status: selected.status === 'New' ? 'In Progress' : selected.status,
      timeline: addTimelineEntry(
        selected,
        `Reply sent: "${replyText.slice(0, 50)}${replyText.length > 50 ? '...' : ''}"`,
        actor,
        'reply',
      ),
    });
    setReplyText('');
  };

  const overrideDepartment = (department: Department) => {
    if (!selected || !allowDepartmentOverride || department === selected.assignedDepartment) return;

    const owner = departmentOwners[department];
    updateInquiry(selected.id, {
      assignedDepartment: department,
      department,
      assignedOwner: owner,
      assignee: owner,
      responseOwner: owner,
      routingOverridden: true,
      timeline: addTimelineEntry(
        selected,
        `Department manually changed from ${selected.assignedDepartment} to ${department} by ${actor}`,
        actor,
        'assignment',
      ),
    });
  };

  const startMessageListResize = (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    resizeStateRef.current = {
      startX: event.clientX,
      startWidth: messageListWidth,
    };
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const delta = moveEvent.clientX - resizeStateRef.current.startX;
      const nextWidth = resizeStateRef.current.startWidth + delta;
      const maxWidth = Math.min(640, Math.max(320, window.innerWidth - 560));
      setMessageListWidth(Math.min(Math.max(nextWidth, 280), maxWidth));
    };

    const stopResize = () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', stopResize);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', stopResize, { once: true });
  };

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      <div className="w-56 shrink-0 overflow-y-auto border-r border-gray-200 bg-white p-3">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Quick Filters</h3>
        <div className="mb-4 space-y-0.5">
          {quickFilters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setQuickFilter(filter.key)}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                quickFilter === filter.key ? 'bg-ocean-50 font-medium text-ocean-700' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span>{filter.label}</span>
              <span className={`text-xs font-medium ${quickFilter === filter.key ? 'text-ocean-500' : 'text-gray-400'}`}>
                {counts[filter.key as keyof typeof counts]}
              </span>
            </button>
          ))}
        </div>

        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Channel</h3>
        <select
          value={channelFilter}
          onChange={(event) => setChannelFilter(event.target.value as Channel | 'all')}
          className="mb-4 w-full rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-sm text-gray-700 outline-none focus:border-ocean-400"
        >
          {channelFilters.map((filter) => <option key={filter.value} value={filter.value}>{filter.label}</option>)}
        </select>

        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Status</h3>
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as InquiryStatus | 'all')}
          className="mb-4 w-full rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-sm text-gray-700 outline-none focus:border-ocean-400"
        >
          {statusFilters.map((filter) => <option key={filter.value} value={filter.value}>{filter.label}</option>)}
        </select>

        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Department</h3>
        <select
          value={effectiveDeptFilter}
          disabled={allowedDepartmentFilters.length === 1}
          onChange={(event) => setDeptFilter(event.target.value as Department | 'all')}
          className="w-full rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-sm text-gray-700 outline-none focus:border-ocean-400 disabled:cursor-not-allowed disabled:text-gray-400"
        >
          {allowedDepartmentFilters.map((department) => (
            <option key={department} value={department}>
              {department === 'all' ? 'All Departments' : department}
            </option>
          ))}
        </select>
      </div>

      <div
        className="flex shrink-0 flex-col bg-white"
        style={{ width: messageListWidth }}
      >
        <div className="border-b border-gray-200 p-3">
          <div className="relative">
            <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search messages, keywords..."
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-8 pr-3 text-sm outline-none focus:border-ocean-400"
            />
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-gray-500">{filtered.length} messages</span>
            <span className="flex items-center gap-1 text-xs text-gray-500"><Filter size={12} /> Auto-routed</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filtered.map((inquiry) => (
            <button
              key={inquiry.id}
              onClick={() => setSelectedId(inquiry.id)}
              className={`w-full border-b border-gray-100 p-3 text-left transition-colors hover:bg-gray-50 ${
                activeSelectedId === inquiry.id ? 'border-l-2 border-l-ocean-500 bg-ocean-50/50' : ''
              }`}
            >
              <div className="flex items-start gap-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-ocean-100 to-teal-100 text-xs font-bold text-ocean-700">
                  {getInitials(inquiry.customerName)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-semibold text-gray-900">{inquiry.customerName}</span>
                    <span className="shrink-0 text-[11px] text-gray-400">{timeAgo(inquiry.createdAt)}</span>
                  </div>
                  {inquiry.companyName && (
                    <span className="text-[11px] text-gray-400">{inquiry.companyName}</span>
                  )}
                  <p className="mt-0.5 truncate text-xs text-gray-500">{inquiry.messagePreview}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    {getChannelSmallIcon(inquiry.channel)}
                    <PriorityBadge priority={inquiry.priority} />
                    <StatusBadge status={inquiry.status} />
                    <SLAIndicator deadline={inquiry.slaDeadline} isOverdue={inquiry.isOverdue} />
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-[11px] text-gray-400">
                    <span className="flex items-center gap-0.5"><Building2 size={10} /> {inquiry.assignedDepartment}</span>
                    {inquiry.assignedOwner && <span className="flex items-center gap-0.5"><User size={10} /> {inquiry.assignedOwner}</span>}
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-[11px] text-ocean-600">
                    <Zap size={10} /> {inquiry.matchedRule}
                  </div>
                </div>
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <MessageSquare size={32} className="mb-2" />
              <p className="text-sm">No messages match your filters</p>
            </div>
          )}
        </div>
      </div>

      <div
        role="separator"
        aria-label="Resize message list"
        title="Drag to resize message list"
        onPointerDown={startMessageListResize}
        className="group relative w-2 shrink-0 cursor-col-resize border-x border-gray-100 bg-white transition-colors hover:bg-ocean-50"
      >
        <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-gray-200 group-hover:bg-ocean-400" />
      </div>

      {selected ? (
        <div className="flex flex-1 flex-col overflow-hidden bg-white">
          <div className="border-b border-gray-200 p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-ocean-500 to-teal-500 text-sm font-bold text-white">
                  {getInitials(selected.customerName)}
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-900">{selected.customerName}</h2>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                    {selected.companyName && <span className="font-medium">{selected.companyName}</span>}
                    <span>{selected.customerEmail}</span>
                    <span>{selected.customerPhone}</span>
                  </div>
                </div>
              </div>
              <ChannelIcon channel={selected.channel} showLabel size={14} />
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            <div className="rounded-xl border border-ocean-200 bg-ocean-50/70 p-4 shadow-sm">
              <div className="mb-2 flex items-center justify-between">
                <span className="rounded-full bg-ocean-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-ocean-700">
                  Main inquiry
                </span>
                <span className="text-[11px] text-ocean-600">{selected.assignedDepartment}</span>
              </div>
              <p className="text-sm leading-relaxed text-gray-800">{selected.message}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-400">
                {getChannelSmallIcon(selected.channel)}
                <span>via {selected.channel}</span>
                <span>-</span>
                <span>{new Date(selected.createdAt).toLocaleString()}</span>
                {selected.sourcePage && <><span>-</span><span>Source: {selected.sourcePage}</span></>}
              </div>
            </div>

            {replyEntries.length > 0 && (
              <div className="space-y-2">
                {replyEntries.map((entry) => (
                  <div key={entry.id} className="flex justify-end">
                    <div className="max-w-[82%] rounded-2xl rounded-br-md border border-teal-100 bg-teal-50 px-3 py-2 text-teal-900 shadow-sm">
                      <p className="text-sm leading-relaxed">{getReplyMessage(entry.message)}</p>
                      <p className="mt-1 text-right text-[10px] text-teal-600">
                        {entry.user} - {new Date(entry.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {allowDepartmentOverride && (
              <div className="rounded-xl border border-gray-200 bg-white p-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Manual Override</p>
                    <p className="text-xs text-gray-500">System routing stays visible even when responsibility is changed.</p>
                  </div>
                  <select
                    value={selected.assignedDepartment}
                    onChange={(event) => overrideDepartment(event.target.value as Department)}
                    className="min-w-56 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 outline-none focus:border-ocean-400"
                  >
                    {departments.map((department) => <option key={department} value={department}>{department}</option>)}
                  </select>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {allowAssignOwner && (
                <button onClick={assignToMe} className={getButtonClass(false)}>
                  <User size={14} /> Assign to me
                </button>
              )}
              <button onClick={() => updateStatus('Pending')} disabled={!allowStatusUpdate} className={getButtonClass(!allowStatusUpdate)}>
                <Clock size={14} /> Mark Pending
              </button>
              <button onClick={() => updateStatus('Resolved')} disabled={!allowStatusUpdate} className={getButtonClass(!allowStatusUpdate)}>
                <CheckCircle2 size={14} /> Mark Resolved
              </button>
              <button onClick={() => updateStatus('Escalated')} disabled={!allowEscalate} className={getButtonClass(!allowEscalate)}>
                <AlertTriangle size={14} /> Escalate
              </button>
            </div>

            {selected.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="mr-1 text-xs text-gray-400">Tags:</span>
                {selected.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600">{tag}</span>
                ))}
              </div>
            )}

            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Internal Notes</h3>
              {selected.notes.length > 0 ? (
                <div className="space-y-2">
                  {selected.notes.map((note) => (
                    <div key={note.id} className="rounded-lg border border-amber-100 bg-amber-50/50 p-2.5">
                      <p className="text-xs text-gray-700">{note.message}</p>
                      <p className="mt-1 text-[11px] text-gray-400">{note.author} - {new Date(note.timestamp).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs italic text-gray-400">No internal notes yet.</p>
              )}
              <div className="mt-2 flex gap-2">
                <input
                  type="text"
                  value={newNote}
                  disabled={!allowNote}
                  onChange={(event) => setNewNote(event.target.value)}
                  placeholder="Add a note..."
                  onKeyDown={(event) => event.key === 'Enter' && addNote()}
                  className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs outline-none focus:border-ocean-400 disabled:cursor-not-allowed disabled:text-gray-400"
                />
                <button
                  onClick={addNote}
                  disabled={!allowNote}
                  className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-amber-600 disabled:cursor-not-allowed disabled:bg-gray-200"
                >
                  <StickyNote size={14} />
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white">
              <button
                type="button"
                onClick={() => setTimelineOpen((open) => !open)}
                className="flex w-full items-center justify-between px-4 py-3 text-left"
              >
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Activity Timeline
                </span>
                <span className="flex items-center gap-2 text-xs text-gray-400">
                  {selected.timeline.length} events
                  {timelineOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </span>
              </button>
              {timelineOpen && (
                <div className="space-y-2 border-t border-gray-100 p-3">
                  {selected.timeline.map((entry) => {
                    const isReply = entry.type === 'reply';

                    return (
                      <div
                        key={entry.id}
                        className={`flex items-start gap-2 rounded-lg border p-2.5 text-xs ${
                          isReply
                            ? 'border-teal-200 bg-teal-50'
                            : 'border-gray-100 bg-gray-50/60'
                        }`}
                      >
                        <div className={`mt-1 h-2 w-2 shrink-0 rounded-full ${isReply ? 'bg-teal-500' : 'bg-ocean-400'}`} />
                        <div>
                          <p className={isReply ? 'font-medium text-teal-800' : 'text-gray-700'}>{entry.message}</p>
                          <p className="text-gray-400">
                            {new Date(entry.timestamp).toLocaleString()}{entry.user && ` - ${entry.user}`}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-gray-200 bg-white p-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={replyText}
                disabled={!allowReply}
                onChange={(event) => setReplyText(event.target.value)}
                onKeyDown={(event) => event.key === 'Enter' && sendReply()}
                placeholder="Type a reply..."
                className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-ocean-400 disabled:cursor-not-allowed disabled:text-gray-400"
              />
              <button
                onClick={sendReply}
                disabled={!allowReply}
                className="rounded-lg bg-gradient-to-r from-ocean-500 to-teal-500 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:from-gray-200 disabled:to-gray-200 disabled:text-gray-400"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center bg-gray-50">
          <div className="text-center text-gray-400">
            <MessageSquare size={48} className="mx-auto mb-3" />
            <p className="text-sm">Select a message to view details</p>
          </div>
        </div>
      )}
    </div>
  );
}
