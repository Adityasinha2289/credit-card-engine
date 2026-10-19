/**
 * The top of a signed-in page, built like the website's inner pages: a full-width
 * dark band with a pool of light, the "My RenoCred" sub-nav, a dotted eyebrow, a
 * serif title (an italic part reads in pistachio), key numbers and actions.
 */
import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { Container } from '../../public-platform/site/primitives';
import { MY_RENOCRED } from '../../public-platform/site/nav';
import { useAskTaqdeer } from '../layout/SiteAppLayout';

export interface HeroStat { value: ReactNode; label: string }

/** Pill links between the signed-in pages; shown on those pages only. */
export function MyNav() {
  const { pathname } = useLocation();
  const active = MY_RENOCRED.find((l) => (l.to === '/app' ? pathname === '/app' || pathname === '/app/' : pathname.startsWith(l.to)));
  if (!active) return null;
  return (
    <nav aria-label="My RenoCred" className="mb-8 hidden md:block">
      <ul className="flex w-max gap-1 rounded-full border border-white/10 bg-white/[0.04] p-1">
        {MY_RENOCRED.map((l) => {
          const on = l === active;
          return (
            <li key={l.to} className="relative">
              {on && <motion.span layoutId="my-nav" className="absolute inset-0 rounded-full bg-rc-pistachio" transition={{ type: 'spring', stiffness: 420, damping: 36 }} />}
              <Link
                to={l.to}
                aria-current={on ? 'page' : undefined}
                className={cn('relative block whitespace-nowrap rounded-full px-4 py-2 text-[14px] font-medium transition-colors', on ? 'text-rc-ink' : 'text-rc-mist hover:text-rc-cream')}
              >
                {l.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function AppHero({ eyebrow, title, lede, stats, actions, aside }: {
  eyebrow?: ReactNode;
  title: ReactNode;
  lede?: ReactNode;
  stats?: HeroStat[];
  actions?: ReactNode;
  aside?: ReactNode;
}) {
  const ask = useAskTaqdeer();
  return (
    <section className="relative overflow-hidden text-rc-cream">
      <div aria-hidden className="pointer-events-none absolute -left-[15%] -top-[45%] h-[900px] w-[1000px] rounded-full bg-[radial-gradient(closest-side,rgba(227,238,212,0.10),transparent)]" />
      <div aria-hidden className="pointer-events-none absolute -bottom-[40%] right-[-10%] h-[700px] w-[800px] rounded-full bg-[radial-gradient(closest-side,rgba(42,157,92,0.14),transparent)]" />
      <Container className="relative pb-20 pt-5 md:pb-24 md:pt-6 lg:pb-28 lg:pt-8">
        <MyNav />
        <div className={cn('grid items-center gap-10', aside && 'lg:grid-cols-[1fr_auto]')}>
          <div className="min-w-0">
            <div className="flex min-h-9 items-center justify-between gap-3">
              {eyebrow && (
                <p className="flex items-center gap-2.5 text-[12px] font-semibold uppercase tracking-[0.2em] text-rc-mist">
                  <span aria-hidden className="h-2 w-2 rounded-full bg-rc-pistachio" /> {eyebrow}
                </p>
              )}
              {ask && (
                <button type="button" onClick={ask} className="ml-auto inline-flex h-9 shrink-0 items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] pl-1 pr-3.5 text-[13px] font-medium text-rc-cream active:bg-white/10 md:hidden">
                  <img src="/taqdeer-logo.png" alt="" className="h-7 w-7 rounded-full object-cover" /> Ask Taqdeer
                </button>
              )}
            </div>
            <h1 className="mt-4 max-w-[18ch] font-serif text-[clamp(2.4rem,5.4vw,4.6rem)] font-semibold leading-[1] tracking-[-0.035em] lining-nums [&_.italic]:text-rc-pistachio">
              {title}
            </h1>
            {lede && <p className="mt-5 max-w-[52ch] text-[17px] leading-relaxed text-rc-mist">{lede}</p>}
            {stats && stats.length > 0 && (
              <dl className="mt-7 grid grid-cols-3 gap-4 sm:flex sm:flex-wrap sm:gap-x-10 sm:gap-y-5">
                {stats.map((s) => (
                  <div key={s.label}>
                    <dt className="sr-only">{s.label}</dt>
                    <dd className="truncate font-serif text-[26px] font-semibold leading-none sm:text-[38px] tracking-[-0.02em] text-rc-pistachio lining-nums tabular-nums">{s.value}</dd>
                    <p className="mt-1.5 text-[12px] leading-snug text-rc-mist sm:mt-2 sm:text-[13px]">{s.label}</p>
                  </div>
                ))}
              </dl>
            )}
            {actions && <div className="mt-8">{actions}</div>}
          </div>
          {aside && <div className="hidden lg:block">{aside}</div>}
        </div>
      </Container>
    </section>
  );
}

/**
 * The top of a My RenoCred page: a compact title over the page's own visual
 * (the card holder, the card stack, the receipt...), on the dark band.
 */
export function AppBand({ eyebrow, title, children, center }: { eyebrow?: ReactNode; title?: ReactNode; children?: ReactNode; center?: boolean }) {
  const ask = useAskTaqdeer();
  return (
    <section className="relative overflow-hidden text-rc-cream">
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-[30%] h-[720px] w-[1000px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(227,238,212,0.10),transparent)]" />
      <Container className="relative pb-[4.5rem] pt-4 md:pb-24 md:pt-6">
        <MyNav />
        <div className={cn('flex min-h-9 items-center justify-between gap-3', center && 'md:justify-center')}>
          {eyebrow && <p className="min-w-0 truncate text-[13px] font-medium text-rc-mist">{eyebrow}</p>}
          {ask && (
            <button type="button" onClick={ask} className="ml-auto inline-flex h-9 shrink-0 items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] pl-1 pr-3.5 text-[13px] font-medium text-rc-cream active:bg-white/10 md:hidden">
              <img src="/taqdeer-logo.png" alt="" className="h-7 w-7 rounded-full object-cover" /> Ask Taqdeer
            </button>
          )}
        </div>
        {title && (
          <h1 className={cn('mt-1 font-serif text-[30px] font-semibold leading-[1.08] tracking-[-0.03em] lining-nums sm:text-[38px] lg:text-[46px] [&_.italic]:text-rc-pistachio', center && 'md:text-center')}>
            {title}
          </h1>
        )}
        {children && <div className="mt-6 md:mt-8">{children}</div>}
      </Container>
    </section>
  );
}
