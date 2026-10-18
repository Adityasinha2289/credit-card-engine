/**
 * The top of every inner page, in the same language as the home page: a dark
 * forest band with a pool of light, a dotted eyebrow and a big serif headline,
 * then the page body in cream, overlapping it with a rounded top.
 */
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Container, EASE_OUT } from './primitives';

export interface Crumb { label: string; to?: string }

/** Rises into place on first render; static when the visitor prefers less motion. */
function Enter({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 26 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease: EASE_OUT, delay }}
    >
      {children}
    </motion.div>
  );
}

export function Breadcrumbs({ items, tone = 'cream' }: { items: Crumb[]; tone?: 'cream' | 'ink' }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className={cn('flex flex-wrap items-center gap-1.5 text-[13px]', tone === 'cream' ? 'text-rc-mist' : 'text-rc-muted')}>
        {items.map((c, i) => (
          <li key={c.label} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight aria-hidden className="h-3.5 w-3.5 opacity-50" />}
            {c.to
              ? <Link to={c.to} className={cn('rounded-full transition-colors', tone === 'cream' ? 'hover:text-rc-cream' : 'hover:text-rc-ink')}>{c.label}</Link>
              : <span aria-current="page" className={tone === 'cream' ? 'text-rc-cream' : 'text-rc-ink'}>{c.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function PageHero({ eyebrow, title, lede, crumbs, meta, actions, aside, wide = false }: {
  eyebrow?: ReactNode;
  title: ReactNode;
  lede?: ReactNode;
  crumbs?: Crumb[];
  /** small line under the lede, e.g. "Last updated" */
  meta?: ReactNode;
  actions?: ReactNode;
  /** right-hand visual on wide screens */
  aside?: ReactNode;
  /** let the headline run the full width (no aside) */
  wide?: boolean;
}) {
  return (
    <section className="relative overflow-hidden bg-rc-night text-rc-cream">
      <div aria-hidden className="pointer-events-none absolute -left-[15%] -top-[45%] h-[900px] w-[1000px] rounded-full bg-[radial-gradient(closest-side,rgba(227,238,212,0.10),transparent)]" />
      <div aria-hidden className="pointer-events-none absolute -bottom-[40%] right-[-10%] h-[700px] w-[800px] rounded-full bg-[radial-gradient(closest-side,rgba(42,157,92,0.14),transparent)]" />

      <Container className="relative grid gap-12 pb-28 pt-8 lg:grid-cols-12 lg:items-center lg:gap-10 lg:pb-36 lg:pt-12">
        <div className={cn(aside ? 'lg:col-span-7' : wide ? 'lg:col-span-12' : 'lg:col-span-10')}>
          {crumbs && <Enter><Breadcrumbs items={crumbs} /></Enter>}
          {eyebrow && (
            <Enter delay={0.04}>
              <p className={cn('flex items-center gap-3 text-[12px] font-semibold uppercase tracking-[0.2em] text-rc-mist', crumbs && 'mt-8')}>
                <span aria-hidden className="h-2 w-2 rounded-full bg-rc-pistachio" /> {eyebrow}
              </p>
            </Enter>
          )}
          <Enter delay={0.1}>
            {/* pages pass their accent as an italic span; on the dark band it reads in pistachio */}
            <h1 className="mt-6 max-w-[17ch] font-serif text-[clamp(2.8rem,6.4vw,5.75rem)] font-semibold leading-[0.98] tracking-[-0.035em] [&_.italic]:text-rc-pistachio">
              {title}
            </h1>
          </Enter>
          {lede && (
            <Enter delay={0.18}>
              <p className="mt-7 max-w-[54ch] text-[18px] leading-relaxed text-rc-mist">{lede}</p>
            </Enter>
          )}
          {meta && <Enter delay={0.22}><div className="mt-6 text-[13px] text-rc-mist">{meta}</div></Enter>}
          {actions && <Enter delay={0.26}><div className="mt-10 flex flex-wrap items-center gap-3">{actions}</div></Enter>}
        </div>
        {aside && <Enter delay={0.2} className="lg:col-span-5">{aside}</Enter>}
      </Container>
    </section>
  );
}

/** The cream page body that tucks over the hero with a rounded top. */
export function PageBody({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('relative z-10 -mt-12 flex-1 rounded-t-[40px] bg-rc-cream text-rc-ink lg:-mt-16 lg:rounded-t-[56px]', className)}>
      {children}
    </div>
  );
}
