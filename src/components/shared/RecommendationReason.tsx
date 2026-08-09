import { ShieldCheck } from 'lucide-react';
import { cn } from '../../lib/utils';

interface RecommendationReasonProps {
  reason: string;
  className?: string;
}

export function RecommendationReason({ reason, className }: RecommendationReasonProps) {
  return (
    <div className={cn("flex gap-2 items-start bg-brand-emerald/5 border border-brand-emerald/10 p-3 rounded-lg", className)}>
      <div className="mt-0.5 text-brand-emerald shrink-0">
        <ShieldCheck size={16} />
      </div>
      <div>
        <p className="text-[10px] font-bold tracking-widest uppercase text-brand-emerald mb-1">
          Why RenoCred Recommends This
        </p>
        <p className="text-xs text-text-secondary leading-relaxed">
          {reason}
        </p>
      </div>
    </div>
  );
}
