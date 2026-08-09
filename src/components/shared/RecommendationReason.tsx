import { ShieldCheck } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { RecommendationReason as ReasonType } from '../../features/optimization/types';

interface RecommendationReasonProps {
  reason: string | ReasonType;
  className?: string;
}

export function RecommendationReason({ reason, className }: RecommendationReasonProps) {
  const primaryReason = typeof reason === 'string' ? reason : reason.primary;

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
          {primaryReason}
        </p>
        {typeof reason !== 'string' && reason.supportingFactors && reason.supportingFactors.length > 0 && (
          <ul className="mt-1 space-y-0.5 text-[10px] text-text-muted/80 list-disc list-inside">
            {reason.supportingFactors.map((factor, idx) => (
              <li key={idx}>{factor}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
