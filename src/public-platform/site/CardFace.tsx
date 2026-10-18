/**
 * A credit card rendered as an object: issuer colours, a matte finish, the card
 * name and network. No fake card numbers. Width drives everything else, so the
 * same component works from a 160px thumbnail to a 420px hero.
 */
import type { CSSProperties } from 'react';
import { getIssuerTheme, PRODUCT_THEMES, type IssuerTheme } from '../../features/cards/config/issuerThemes';
import { cn } from '../../lib/utils';
import { bankLabel } from './banks';

export { bankLabel };

const ACRONYMS = new Set(['HDFC', 'ICICI', 'IDFC', 'SBI', 'HSBC', 'AMEX', 'BPCL', 'HPCL', 'IOCL', 'IRCTC', 'RBL', 'YES', 'PVR', 'MMT', 'EMI', 'UPI', 'BYOC', 'ICAI', 'SWYP']);

/** Issuers write product names in capitals ("ATLAS", "FIRST"); keep real acronyms only. */
function fixCase(s: string): string {
  return s.replace(/\b[A-Z]{4,}\b/g, (w) => (ACRONYMS.has(w) ? w : w[0] + w.slice(1).toLowerCase()));
}

/** "Axis Bank ATLAS Credit Card" → "Axis Atlas". Keeps the bank, so it reads on its own in lists. */
export function displayCardName(name: string): string {
  const cleaned = name
    .replace(/®/g, '')
    .replace(/\s*\bcredit card\b/i, '')
    .replace(/\b(Axis|ICICI|HDFC|Kotak|IDFC FIRST|IDFC|Yes|YES|RBL|AU|IndusInd|Federal)\s+Bank\b/, '$1')
    .replace(/\s{2,}/g, ' ')
    .trim();
  return fixCase(cleaned || name);
}

/** The bank-free product name ("Atlas"), for the card face where the bank is printed above it. */
export function shortCardName(name: string, bank: string): string {
  const label = bankLabel(bank);
  const cleaned = displayCardName(name)
    .replace(new RegExp(`\\b${label.replace(/\s+/g, '\\s+')}\\b`, 'i'), '')
    .replace(new RegExp(`\\b${label.split(' ')[0]}\\b`, 'i'), '')
    .replace(new RegExp(`\\b${bank}\\b`, 'i'), '')
    .replace(/\s{2,}/g, ' ')
    .trim();
  return cleaned || displayCardName(name);
}

function NetworkMark({ network, size }: { network: string; size: number }) {
  const n = network.toLowerCase();
  if (n.includes('master')) {
    return (
      <svg viewBox="0 0 40 24" width={size * 1.5} height={size * 0.9} aria-label="Mastercard">
        <circle cx="14" cy="12" r="10" fill="#EB001B" opacity="0.92" />
        <circle cx="26" cy="12" r="10" fill="#F79E1B" opacity="0.92" />
        <path d="M20 4a10 10 0 0 1 0 16 10 10 0 0 1 0-16z" fill="#FF5F00" />
      </svg>
    );
  }
  const label = n.includes('amex') ? 'AMEX' : n.includes('rupay') ? 'RuPay' : n.includes('diners') ? 'Diners' : 'VISA';
  return (
    <span
      aria-label={network}
      className={cn('font-sans text-white/90', label === 'RuPay' ? 'font-bold italic' : 'font-extrabold tracking-tight')}
      style={{ fontSize: size * (label === 'VISA' ? 0.95 : 0.7), letterSpacing: label === 'AMEX' ? '0.12em' : undefined }}
    >
      {label}
    </span>
  );
}

const THEME_STOP = new Set(['bank', 'credit', 'card', 'edition', 'metal']);
const words = (s: string) => new Set(s.toLowerCase().replace(/[^a-z0-9+\s]/g, ' ').split(/\s+/).filter((w) => w && !THEME_STOP.has(w)));

/**
 * Product themes are keyed by one spelling ("Swiggy HDFC Bank Credit Card") while
 * data uses others ("Swiggy HDFC"); match on significant words, then fall back
 * to the issuer's colours.
 */
export function themeFor(name: string, bank: string): IssuerTheme {
  const nameWords = words(name);
  const key = Object.keys(PRODUCT_THEMES).find((k) => [...words(k)].every((w) => nameWords.has(w)));
  return key ? PRODUCT_THEMES[key] : getIssuerTheme(bankLabel(bank), name);
}

export interface CardFaceProps {
  name: string;
  bank: string;
  network?: string;
  /** Rendered width in px; height follows the ID-1 card ratio. */
  width?: number;
  className?: string;
  style?: CSSProperties;
  /** Draw a soft shadow under the card (off inside dense grids). */
  lifted?: boolean;
  /** Paint the card in these two colours instead of the issuer's (decorative uses). */
  tint?: [string, string];
}

export function CardFace({ name, bank, network = 'Visa', width = 320, className, style, lifted = true, tint }: CardFaceProps) {
  const theme = themeFor(name, bank);
  const unit = width / 320; // 1 at the design size
  const label = shortCardName(name, bank);
  // below ~120px the type would be unreadable noise; thumbnails show colour and chip only
  const showText = width >= 120;

  return (
    <div
      role="img"
      aria-label={`${name} by ${bankLabel(bank)}`}
      className={cn('relative shrink-0 select-none overflow-hidden', className)}
      style={{
        width,
        height: width / 1.586,
        borderRadius: 16 * unit,
        background: `linear-gradient(140deg, ${tint?.[0] ?? theme.primary} 0%, ${tint?.[1] ?? theme.secondary} 100%)`,
        boxShadow: lifted
          ? `0 ${18 * unit}px ${40 * unit}px -${14 * unit}px rgba(10,31,21,0.45), 0 ${2 * unit}px ${6 * unit}px rgba(10,31,21,0.18)`
          : undefined,
        ...style,
      }}
    >
      {/* light falloff + hairline edge give the card some material */}
      <div aria-hidden className="absolute inset-0" style={{ background: 'radial-gradient(120% 90% at 0% 0%, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 55%)' }} />
      <div aria-hidden className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0) 55%, rgba(0,0,0,0.22) 100%)' }} />
      <div aria-hidden className="absolute inset-0" style={{ borderRadius: 16 * unit, boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.14)' }} />

      <div className="relative flex h-full flex-col justify-between" style={{ padding: `${18 * unit}px ${20 * unit}px` }}>
        <div className={cn('flex items-start justify-between', !showText && 'invisible')}>
          <span className="font-sans font-semibold uppercase text-white/85" style={{ fontSize: 10.5 * unit, letterSpacing: '0.16em' }}>
            {bankLabel(bank)}
          </span>
          <svg aria-hidden viewBox="0 0 24 24" width={16 * unit} height={16 * unit} fill="none" className="opacity-70">
            <path d="M8 6.5a8 8 0 0 1 0 11M12 4a12 12 0 0 1 0 16M4.5 9a4 4 0 0 1 0 6" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </div>

        <div
          aria-hidden
          style={{
            width: 34 * unit, height: 25 * unit, borderRadius: 5 * unit,
            background: theme.chipStyle === 'gold'
              ? 'linear-gradient(135deg,#f3dc8c 0%,#c9a13b 55%,#efd27a 100%)'
              : 'linear-gradient(135deg,#eceff1 0%,#aeb4b8 55%,#e3e6e8 100%)',
            boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.18)',
          }}
        />

        <div className={cn('flex items-end justify-between gap-3', !showText && 'invisible')}>
          <span className="line-clamp-2 font-sans font-medium leading-tight text-white" style={{ fontSize: 13.5 * unit, maxWidth: '70%' }}>
            {label}
          </span>
          <NetworkMark network={theme.network ?? network} size={22 * unit} />
        </div>
      </div>
    </div>
  );
}
