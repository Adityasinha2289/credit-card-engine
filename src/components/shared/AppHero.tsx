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

export interface HeroStat { value: ReactNode; label: string }

/** Pill links between the signed-in pages; shown on those pages only. */
export function MyNav() {
  const { pathname } = useLocation();
  const active = MY_RENOCRED.find((l) => (l.to === '/app' ? pathname === '/app' || pathname === '/app/' : pathname.startsWith(l.to)));
  if (!active) return null;
  return (
    <nav aria-label="My RenoCred" className="-mx-5 mb-8 overflow-x-auto px-5 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
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
  return (
    <section className="relative overflow-hidden text-rc-cream">
      <div aria-hidden className="pointer-events-none absolute -left-[15%] -top-[45%] h-[900px] w-[1000px] rounded-full bg-[radial-gradient(closest-side,rgba(227,238,212,0.10),transparent)]" />
      <div aria-hidden className="pointer-events-none absolute -bottom-[40%] right-[-10%] h-[700px] w-[800px] rounded-full bg-[radial-gradient(closest-side,rgba(42,157,92,0.14),transparent)]" />
      <Container className="relative pb-24 pt-6 lg:pb-28 lg:pt-8">
        <MyNav />
        <div className={cn('grid items-center gap-10', aside && 'lg:grid-cols-[1fr_auto]')}>
          <div className="min-w-0">
            {eyebrow && (
              <p className="flex items-center gap-2.5 text-[12px] font-semibold uppercase tracking-[0.2em] text-rc-mist">
                <span aria-hidden className="h-2 w-2 rounded-full bg-rc-pistachio" /> {eyebrow}
              </p>
            )}
            <h1 className="mt-5 max-w-[18ch] font-serif text-[clamp(2.5rem,5.4vw,4.6rem)] font-semibold leading-[1] tracking-[-0.035em] lining-nums [&_.italic]:text-rc-pistachio">
              {title}
            </h1>
            {lede && <p className="mt-5 max-w-[52ch] text-[17px] leading-relaxed text-rc-mist">{lede}</p>}
            {stats && stats.length > 0 && (
              <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-5">
                {stats.map((s) => (
                  <div key={s.label}>
                    <dt className="sr-only">{s.label}</dt>
                    <dd className="font-serif text-[38px] font-semibold leading-none tracking-[-0.02em] text-rc-pistachio lining-nums tabular-nums">{s.value}</dd>
                    <p className="mt-2 text-[13px] text-rc-mist">{s.label}</p>
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
