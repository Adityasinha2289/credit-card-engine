/**
 * The small set of pieces every My RenoCred page is built from, so the six
 * sections read as one product: a section heading, a paper panel, a list row
 * with an icon tile, and a number tile.
 */
import type { ElementType, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

export function SectionHead({ title, note, action, className }: { title: ReactNode; note?: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={cn('mb-4 flex items-end justify-between gap-4', className)}>
      <div className="min-w-0">
        <h2 className="font-serif text-[26px] font-semibold leading-tight tracking-[-0.02em] text-rc-ink sm:text-[30px]">{title}</h2>
        {note && <p className="mt-1 text-[14px] leading-snug text-rc-muted">{note}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/** A quiet text action for a section heading ("See all", "Add"). */
export function HeadAction({ to, onClick, children }: { to?: string; onClick?: () => void; children: ReactNode }) {
  const cls = 'inline-flex h-9 items-center gap-1 rounded-full bg-rc-ink/[0.06] px-3.5 text-[13px] font-medium text-rc-ink transition-colors hover:bg-rc-ink/[0.1]';
  return to ? <Link to={to} className={cls}>{children}</Link> : <button type="button" onClick={onClick} className={cls}>{children}</button>;
}

export function Panel({ children, className, as: Tag = 'div' }: { children: ReactNode; className?: string; as?: ElementType }) {
  return <Tag className={cn('overflow-hidden rounded-[26px] border border-rc-ink/[0.08] bg-rc-paper', className)}>{children}</Tag>;
}

export type Tone = 'ink' | 'danger' | 'warn' | 'good' | 'quiet';

const TILE: Record<Tone, string> = {
  ink: 'bg-rc-ink text-rc-pistachio',
  danger: 'bg-[#C2410C]/10 text-[#C2410C]',
  warn: 'bg-[#B7791F]/12 text-[#9A6412]',
  good: 'bg-rc-pistachio text-rc-forest',
  quiet: 'bg-rc-ink/[0.06] text-rc-forest',
};

export function IconTile({ icon: Icon, tone = 'quiet', className }: { icon: ElementType; tone?: Tone; className?: string }) {
  return (
    <span className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px]', TILE[tone], className)}>
      <Icon size={19} strokeWidth={1.8} />
    </span>
  );
}

/** One row of a list panel: icon tile, title and note, then a value or a chevron. */
export function Row({ icon, tone, title, note, trailing, to, href, onClick, chevron = true, className }: {
  icon?: ElementType;
  tone?: Tone;
  title: ReactNode;
  note?: ReactNode;
  trailing?: ReactNode;
  to?: string;
  href?: string;
  onClick?: () => void;
  chevron?: boolean;
  className?: string;
}) {
  const interactive = Boolean(to || href || onClick);
  const inner = (
    <>
      {icon && <IconTile icon={icon} tone={tone} />}
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-medium leading-snug text-rc-ink">{title}</span>
        {note && <span className="mt-0.5 block text-[13px] leading-snug text-rc-muted">{note}</span>}
      </span>
      {trailing && <span className="shrink-0 text-right">{trailing}</span>}
      {interactive && chevron && <ChevronRight aria-hidden size={18} className="shrink-0 text-rc-ink/30" />}
    </>
  );
  const cls = cn(
    'flex w-full items-center gap-3.5 px-4 py-3.5 text-left sm:px-5',
    interactive && 'transition-colors hover:bg-white/70 active:bg-white',
    className,
  );
  if (to) return <Link to={to} className={cls}>{inner}</Link>;
  if (href) return <a href={href} className={cls}>{inner}</a>;
  if (onClick) return <button type="button" onClick={onClick} className={cls}>{inner}</button>;
  return <div className={cls}>{inner}</div>;
}

/** Rows inside a panel, separated by hairlines. */
export function RowList({ children, className }: { children: ReactNode; className?: string }) {
  return <Panel className={cn('divide-y divide-rc-ink/[0.07]', className)}>{children}</Panel>;
}

/** A serif amount, for the trailing side of a row. */
export function Amount({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn('font-serif text-[18px] font-semibold tabular-nums lining-nums text-rc-ink', className)}>{children}</span>;
}

/** A dashed box that says what will appear here, with an optional action. */
export function EmptyState({ icon: Icon, title, note, action }: { icon?: ElementType; title: ReactNode; note?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-[26px] border border-dashed border-rc-ink/15 px-6 py-9 text-center">
      {Icon && <IconTile icon={Icon} tone="good" />}
      <p className="mt-4 font-serif text-[21px] font-semibold text-rc-ink">{title}</p>
      {note && <p className="mt-1 max-w-[40ch] text-[14px] leading-relaxed text-rc-muted">{note}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/** A pill button in the page palette. */
export function Pill({ children, onClick, type = 'button', variant = 'ink', disabled, className }: {
  children: ReactNode; onClick?: () => void; type?: 'button' | 'submit'; variant?: 'ink' | 'cream' | 'pistachio' | 'ghost'; disabled?: boolean; className?: string;
}) {
  const v = {
    ink: 'bg-rc-ink text-rc-cream hover:bg-rc-moss',
    cream: 'bg-rc-cream text-rc-ink hover:bg-white',
    pistachio: 'bg-rc-pistachio text-rc-ink hover:bg-[#d6e6c2]',
    ghost: 'bg-rc-ink/[0.06] text-rc-ink hover:bg-rc-ink/[0.1]',
  }[variant];
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cn('inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-[14px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-45', v, className)}>
      {children}
    </button>
  );
}
