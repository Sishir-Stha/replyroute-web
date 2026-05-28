import { AlertTriangle, Clock } from 'lucide-react';

export function SLAIndicator({ deadline, isOverdue }: { deadline: string; isOverdue: boolean }) {
  const now = new Date();
  const dl = new Date(deadline);
  const diff = dl.getTime() - now.getTime();
  const hoursLeft = Math.round(diff / 3600000 * 10) / 10;

  if (isOverdue) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700">
        <AlertTriangle size={12} /> Overdue
      </span>
    );
  }

  if (hoursLeft <= 1) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
        <Clock size={12} /> Due soon
      </span>
    );
  }

  return null;
}
