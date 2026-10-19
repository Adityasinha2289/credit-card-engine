/**
 * Pill tabs for a section with several views (Money, Discover). The active tab
 * lives in ?tab= so refresh, sharing and the back button all keep it.
 */
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export function useTab<T extends string>(ids: readonly T[], fallback: T): [T, (t: T) => void] {
  const [params, setParams] = useSearchParams();
  const raw = params.get('tab') as T | null;
  const tab = raw && ids.includes(raw) ? raw : fallback;
  const set = (t: T) => {
    const next = new URLSearchParams(params);
    if (t === fallback) next.delete('tab'); else next.set('tab', t);
    setParams(next);
    window.scrollTo({ top: 0 });
  };
  return [tab, set];
}

export function AppTabs<T extends string>({ tabs, value, onChange, layoutId }: {
  tabs: { id: T; label: string; count?: number }[];
  value: T;
  onChange: (t: T) => void;
  layoutId: string;
}) {
  return (
    <div className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden">
      <div role="tablist" className="flex w-max gap-1 rounded-full border border-rc-ink/10 bg-rc-paper p-1">
        {tabs.map((t) => {
          const on = t.id === value;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => onChange(t.id)}
              className={cn('relative whitespace-nowrap rounded-full px-4 py-2 text-[14px] font-medium transition-colors sm:px-5', on ? 'text-rc-pistachio' : 'text-rc-muted hover:text-rc-ink')}
            >
              {on && <motion.span layoutId={layoutId} className="absolute inset-0 rounded-full bg-rc-ink" transition={{ type: 'spring', stiffness: 420, damping: 36 }} />}
              <span className="relative">
                {t.label}
                {t.count != null && t.count > 0 && <span className={cn('ml-1.5 tabular-nums', on ? 'text-rc-mist' : 'text-rc-muted/70')}>{t.count}</span>}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
