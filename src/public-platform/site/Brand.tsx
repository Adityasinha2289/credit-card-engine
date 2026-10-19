/**
 * The RenoCred mark, redrawn as SVG from /logo.jpg so it stays sharp at any size
 * and can take the surface's colours: a bar that rolls into the bowl of an R,
 * and a separate diagonal leg, all with rounded ends.
 */
import { useId } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';

type MarkTone = 'green' | 'cream' | 'ink' | 'pistachio';

const FLAT: Record<Exclude<MarkTone, 'green'>, string> = {
  cream: '#F6F4EC',
  ink: '#0F2A1D',
  pistachio: '#E3EED4',
};

export function BrandMark({ size = 24, tone = 'green', className }: { size?: number; tone?: MarkTone; className?: string }) {
  const id = useId();
  const stroke = tone === 'green' ? `url(#${id})` : FLAT[tone];
  return (
    <svg aria-hidden viewBox="285 270 500 500" width={size} height={size} className={className} fill="none">
      {tone === 'green' && (
        <defs>
          <linearGradient id={id} x1="320" y1="280" x2="720" y2="760" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#4CAF5A" />
            <stop offset="1" stopColor="#1E6B2E" />
          </linearGradient>
        </defs>
      )}
      <path d="M370 335H575A120 120 0 0 1 645.5 552" stroke={stroke} strokeWidth="110" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M372 528L596 712" stroke={stroke} strokeWidth="110" strokeLinecap="round" />
    </svg>
  );
}

/** Mark in its tile plus the name. `dark` is the surface the logo sits on. */
export function Wordmark({ dark, size = 'md', compact, className }: { dark: boolean; size?: 'md' | 'lg'; compact?: boolean; className?: string }) {
  // compact: a touch smaller on phones, where the header is slim
  const tile = size === 'lg' ? 'h-10 w-10 rounded-[12px]' : compact ? 'h-8 w-8 rounded-[10px] sm:h-9 sm:w-9 sm:rounded-[11px]' : 'h-9 w-9 rounded-[11px]';
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <span className={cn('flex shrink-0 items-center justify-center', tile, dark ? 'bg-rc-pistachio' : 'bg-rc-ink')}>
        <BrandMark size={size === 'lg' ? 24 : 21} tone={dark ? 'green' : 'pistachio'} />
      </span>
      <span className={cn('font-semibold tracking-[-0.02em]', size === 'lg' ? 'text-[20px]' : compact ? 'text-[17px] sm:text-[18px]' : 'text-[18px]', dark ? 'text-rc-cream' : 'text-rc-ink')}>
        Reno<span className={dark ? 'text-rc-pistachio' : 'text-rc-forest'}>Cred</span>
      </span>
    </span>
  );
}

export function LogoLink({ dark, compact, onClick, className }: { dark: boolean; compact?: boolean; onClick?: () => void; className?: string }) {
  return (
    <Link
      to="/"
      onClick={onClick}
      aria-label="RenoCred home"
      className={cn('shrink-0 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4', className)}
    >
      <Wordmark dark={dark} compact={compact} />
    </Link>
  );
}
