import { CalendarDays, User } from 'lucide-react';

interface ContentMetaProps {
  /** Author display name */
  author: string;
  /** Author role / title */
  role?: string;
  /** ISO date string (YYYY-MM-DD) for "Last updated" */
  date: string;
  /** Optional: show "Reviewed by" instead of "Written by" */
  variant?: 'written' | 'reviewed';
}

/**
 * E-E-A-T compliant author byline + last-updated date.
 * Critical for YMYL (finance) content — Google's Search Quality
 * guidelines weight authorship and freshness signals heavily.
 */
export function ContentMeta({
  author,
  role,
  date,
  variant = 'written',
}: ContentMetaProps) {
  const formattedDate = new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const label = variant === 'reviewed' ? 'Reviewed by' : 'Written by';

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-gray-400 py-4 border-b border-white/[0.06]">
      <div className="flex items-center gap-2">
        <User size={14} className="text-emerald-500/70" />
        <span>
          {label}{' '}
          <span className="font-semibold text-gray-300">{author}</span>
          {role && (
            <span className="text-gray-500">, {role}</span>
          )}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <CalendarDays size={14} className="text-emerald-500/70" />
        <span>
          Last updated{' '}
          <time dateTime={date} className="font-semibold text-gray-300">
            {formattedDate}
          </time>
        </span>
      </div>
    </div>
  );
}
