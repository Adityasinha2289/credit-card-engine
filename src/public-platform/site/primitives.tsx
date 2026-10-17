/**
 * Building blocks for the public website. One container width, one eyebrow
 * style, one button family and one reveal motion keep every page on the same
 * rhythm, instead of each section inventing its own.
 */
import { useEffect, useState, type ReactNode, type ElementType } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { cn } from '../../lib/utils';

export const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export function Container({ children, className, as: Tag = 'div' }: { children: ReactNode; className?: string; as?: ElementType }) {
  return <Tag className={cn('mx-auto w-full max-w-[1280px] px-5 sm:px-8 lg:px-12', className)}>{children}</Tag>;
}

/** Small uppercase label that introduces a section. `index` renders a leading "01". */
export function Eyebrow({ children, index, tone = 'ink', className }: {
  children: ReactNode; index?: string; tone?: 'ink' | 'cream'; className?: string;
}) {
  return (
    <p className={cn(
      'flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.2em]',
      tone === 'ink' ? 'text-rc-muted' : 'text-rc-mist',
      className,
    )}>
      {index && <span className={cn('tabular-nums', tone === 'ink' ? 'text-rc-ink' : 'text-rc-cream')}>{index}</span>}
      {index && <span aria-hidden className={cn('h-px w-8', tone === 'ink' ? 'bg-rc-ink/25' : 'bg-rc-cream/30')} />}
      <span>{children}</span>
    </p>
  );
}

type ButtonVariant = 'ink' | 'cream' | 'outline' | 'outline-cream';

const BUTTON_STYLES: Record<ButtonVariant, string> = {
  ink: 'bg-rc-ink text-rc-cream hover:bg-rc-moss',
  cream: 'bg-rc-cream text-rc-ink hover:bg-white',
  outline: 'border border-rc-ink/20 text-rc-ink hover:border-rc-ink/60 hover:bg-rc-ink/[0.03]',
  'outline-cream': 'border border-rc-cream/25 text-rc-cream hover:border-rc-cream/70 hover:bg-white/[0.04]',
};

interface ButtonLinkProps {
  to?: string;
  href?: string;
  children: ReactNode;
  variant?: ButtonVariant;
  size?: 'md' | 'lg';
  arrow?: boolean;
  external?: boolean;
  className?: string;
  onClick?: () => void;
}

/** Pill CTA. Internal routes use `to`, anchors and external links use `href`. */
export function ButtonLink({ to, href, children, variant = 'ink', size = 'md', arrow = true, external, className, onClick }: ButtonLinkProps) {
  const classes = cn(
    'group inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors duration-300',
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-rc-forest',
    size === 'lg' ? 'h-14 px-7 text-[15px]' : 'h-12 px-6 text-[14px]',
    BUTTON_STYLES[variant],
    className,
  );
  const Icon = external ? ArrowUpRight : ArrowRight;
  const content = (
    <>
      <span>{children}</span>
      {arrow && <Icon aria-hidden className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />}
    </>
  );
  if (to) return <Link to={to} className={classes} onClick={onClick}>{content}</Link>;
  return (
    <a href={href} className={classes} onClick={onClick} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
      {content}
    </a>
  );
}

/** Quiet text link with an arrow, for secondary navigation inside sections. */
export function ArrowLink({ to, href, children, tone = 'ink', className }: {
  to?: string; href?: string; children: ReactNode; tone?: 'ink' | 'cream'; className?: string;
}) {
  const classes = cn(
    'group inline-flex items-center gap-2 text-[14px] font-medium underline decoration-1 underline-offset-[6px] transition-colors',
    tone === 'ink' ? 'text-rc-ink decoration-rc-ink/25 hover:decoration-rc-ink' : 'text-rc-cream decoration-rc-cream/30 hover:decoration-rc-cream',
    className,
  );
  const inner = (
    <>
      {children}
      <ArrowRight aria-hidden className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
    </>
  );
  return to ? <Link to={to} className={classes}>{inner}</Link> : <a href={href} className={classes}>{inner}</a>;
}

/** Fade-and-rise on first scroll into view. Renders static content for reduced motion. */
export function Reveal({ children, delay = 0, y = 28, className, as = 'div' }: {
  children: ReactNode; delay?: number; y?: number; className?: string; as?: 'div' | 'li' | 'section' | 'span';
}) {
  const reduce = useReducedMotion();
  const Tag = motion[as];
  if (reduce) {
    const Plain = as;
    return <Plain className={className}>{children}</Plain>;
  }
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 0.9, ease: EASE_OUT, delay }}
    >
      {children}
    </Tag>
  );
}

/** Large serif display heading. Sizes are fluid so one class works from phone to desktop. */
export function Display({ children, as: Tag = 'h2', size = 'lg', className }: {
  children: ReactNode; as?: ElementType; size?: 'xl' | 'lg' | 'md'; className?: string;
}) {
  const sizes = {
    xl: 'text-[clamp(3rem,8.4vw,7.75rem)] leading-[0.92]',
    lg: 'text-[clamp(2.5rem,5.6vw,5rem)] leading-[0.98]',
    md: 'text-[clamp(2rem,3.6vw,3.25rem)] leading-[1.04]',
  };
  return <Tag className={cn('font-serif font-medium tracking-[-0.025em]', sizes[size], className)}>{children}</Tag>;
}

export const formatINR = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

/** True while the media query matches (SSR-safe default: false). */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatches(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [query]);
  return matches;
}
