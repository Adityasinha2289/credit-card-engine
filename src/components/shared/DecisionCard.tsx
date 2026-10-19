import { ChevronRight, Zap } from 'lucide-react';

export interface DecisionCardProps {
  title?: string;
  bestFit: string;
  why: string;
  expectedValue: string;
  tradeoff?: string;
  actionText?: string;
  onAction?: () => void;
  confidence?: number;
}

/**
 * One recommendation: the card to use, what it earns, why, and the runner-up.
 * Single column so it reads the same in a sidebar, a drawer or a full page.
 */
export function DecisionCard({
  title = 'Best fit',
  bestFit,
  why,
  expectedValue,
  tradeoff,
  actionText = 'Use this',
  onAction,
  confidence,
}: DecisionCardProps) {
  return (
    <div className="relative overflow-hidden rounded-[26px] bg-rc-ink p-5 text-rc-cream md:p-6">
      <div aria-hidden className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[radial-gradient(closest-side,rgba(227,238,212,0.16),transparent)]" />
      <div className="relative">
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-rc-mist">
            <span aria-hidden className="h-2 w-2 rounded-full bg-rc-pistachio" /> {title}
          </span>
          {confidence ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-medium text-rc-pistachio">
              <Zap size={10} /> {confidence}% match
            </span>
          ) : null}
        </div>

        <div className="mt-3 flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
          <p className="font-display text-[26px] font-semibold leading-[1.08] tracking-[-0.02em]">{bestFit}</p>
          <p className="font-display text-[30px] font-semibold leading-none tabular-nums text-rc-pistachio">{expectedValue}</p>
        </div>

        <p className="mt-3 text-[14px] leading-relaxed text-rc-mist">{why}</p>
        {tradeoff && <p className="mt-2 border-t border-white/10 pt-2 text-[13px] text-rc-mist/80">{tradeoff}</p>}

        {onAction && (
          <button
            type="button"
            onClick={onAction}
            className="group mt-4 inline-flex items-center gap-1.5 rounded-full bg-rc-cream px-4 py-2 text-[13px] font-medium text-rc-ink transition-colors hover:bg-white"
          >
            {actionText} <ChevronRight size={15} className="transition-transform group-hover:translate-x-0.5" />
          </button>
        )}
      </div>
    </div>
  );
}
