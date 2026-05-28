import type { InquiryStatus } from '@/types';

const styles: Record<InquiryStatus, string> = {
  New: 'bg-purple-100 text-purple-700',
  Assigned: 'bg-blue-100 text-blue-700',
  'In Progress': 'bg-sky-100 text-sky-700',
  Pending: 'bg-amber-100 text-amber-700',
  Resolved: 'bg-green-100 text-green-700',
  Escalated: 'bg-red-100 text-red-700',
};

export function StatusBadge({ status }: { status: InquiryStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${styles[status]}`}>
      {status}
    </span>
  );
}
