/**
 * The top of every app screen, in the website's language: a forest panel with a
 * soft pool of light, a dotted eyebrow, a serif title (an italic part reads in
 * pistachio), an optional row of key numbers and an optional visual on the right.
 */
import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

export interface HeroStat { value: ReactNode; label: string }

export function AppHero({ eyebrow, title, lede, stats, actions, aside, className }: {
  eyebrow?: ReactNode;
  title: ReactNode;
  lede?: ReactNode;
  stats?: HeroStat[];
  actions?: ReactNode;
  aside?: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('relative overflow-hidden rounded-[36px] bg-rc-night px-7 py-9 text-rc-cream md:px-10 md:py-11', className)}>
      <div aria-hidden className="pointer-events-none absolute -left-24 -top-32 h-[420px] w-[520px] rounded-full bg-[radial-gradient(closest-side,rgba(227,238,212,0.12),transparent)]" />
      <div aria-hidden className="pointer-events-none absolute -bottom-40 right-0 h-[420px] w-[520px] rounded-full bg-[radial-gradient(closest-side,rgba(42,157,92,0.16),transparent)]" />
      <div className={cn('relative grid items-center gap-9', aside && 'md:grid-cols-[1fr_auto]')}>
        <div className="min-w-0">
          {eyebrow && (
            <p className="flex items-center gap-2.5 text-[12px] font-semibold uppercase tracking-[0.2em] text-rc-mist">
              <span aria-hidden className="h-2 w-2 rounded-full bg-rc-pistachio" /> {eyebrow}
            </p>
          )}
          <h1 className="mt-5 font-display text-[clamp(2.3rem,4.4vw,3.6rem)] font-semibold leading-[1.02] tracking-[-0.03em] lining-nums [&_.italic]:text-rc-pistachio">
            {title}
          </h1>
          {lede && <p className="mt-4 max-w-[48ch] text-[16px] leading-relaxed text-rc-mist">{lede}</p>}
          {stats && stats.length > 0 && (
            <dl className="mt-7 flex flex-wrap gap-x-9 gap-y-4">
              {stats.map((s) => (
                <div key={s.label}>
                  <dt className="sr-only">{s.label}</dt>
                  <dd className="font-display text-[34px] font-semibold leading-none tracking-[-0.02em] text-rc-pistachio lining-nums tabular-nums">{s.value}</dd>
                  <p className="mt-1.5 text-[12px] text-rc-mist">{s.label}</p>
                </div>
              ))}
            </dl>
          )}
          {actions && <div className="mt-7 flex flex-wrap gap-3">{actions}</div>}
        </div>
        {aside && <div className="hidden md:block">{aside}</div>}
      </div>
    </section>
  );
}
