import { cn } from '../../../lib/utils';
import type { CardData } from '../types/card.types';
import { getIssuerTheme } from '../config/issuerThemes';
import {
  VisaLogo,
  MastercardLogo,
  AmexLogo,
  DiscoverLogo,
  RupayLogo,
} from './NetworkLogo';

// ─────────────────────────────────────────────────────────────────────────────
//  TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type CreditCardVariant = 'wallet' | 'recommendation' | 'compact' | 'featured' | 'comparison';

export interface CreditCardProps {
  card: CardData;
  variant?: CreditCardVariant;
  revealed?: boolean;
  selected?: boolean;
  recommended?: boolean;
  onClick?: () => void;
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
//  SIZE TOKENS BY VARIANT
//  All sizes maintain the ISO/IEC 7810 ID-1 aspect ratio: 85.6 × 53.98 mm ≈ 1.586
// ─────────────────────────────────────────────────────────────────────────────

const VARIANT_TOKENS: Record<CreditCardVariant, {
  wrapper: string;
  padX: string;
  padY: string;
  radius: string;
  issuer: string;
  product: string;
  pan: string;
  label: string;
  holder: string;
  chip: string;
  chipInner: string;
  networkScale: string;
}> = {
  compact: {
    wrapper: 'w-full max-w-[280px] aspect-[1.586]',
    padX: 'px-4 sm:px-5',
    padY: 'py-3 sm:py-4',
    radius: 'rounded-[14px] sm:rounded-[16px]',
    issuer: 'text-[9px] sm:text-[10px] tracking-[0.14em]',
    product: 'text-[10px] sm:text-[11px]',
    pan: 'text-[12px] sm:text-[14px] tracking-[0.2em]',
    label: 'text-[11px] sm:text-[12px]',
    holder: 'text-[9px] sm:text-[10px]',
    chip: 'w-[32px] h-[20px] sm:w-[36px] sm:h-[24px]',
    chipInner: 'w-[20px] h-[12px] sm:w-[24px] sm:h-[16px]',
    networkScale: 'scale-[0.75] sm:scale-[0.85]',
  },
  wallet: {
    wrapper: 'w-full max-w-[360px] aspect-[1.586]',
    padX: 'px-5 sm:px-7',
    padY: 'py-4 sm:py-6',
    radius: 'rounded-[16px] sm:rounded-[20px]',
    issuer: 'text-[10px] sm:text-[12px] tracking-[0.15em]',
    product: 'text-[12px] sm:text-[14px]',
    pan: 'text-[15px] sm:text-[18px] tracking-[0.22em]',
    label: 'text-[12px] sm:text-[14px]',
    holder: 'text-[10px] sm:text-[11px]',
    chip: 'w-[40px] h-[28px] sm:w-[48px] sm:h-[34px]',
    chipInner: 'w-[26px] h-[18px] sm:w-[32px] sm:h-[22px]',
    networkScale: 'scale-[0.85] sm:scale-[1]',
  },
  comparison: {
    wrapper: 'w-full max-w-[280px] aspect-[1.586]',
    padX: 'px-4 sm:px-5',
    padY: 'py-3 sm:py-4',
    radius: 'rounded-[14px] sm:rounded-[16px]',
    issuer: 'text-[9px] sm:text-[10px] tracking-[0.14em]',
    product: 'text-[10px] sm:text-[11px]',
    pan: 'text-[12px] sm:text-[14px] tracking-[0.2em]',
    label: 'text-[11px] sm:text-[12px]',
    holder: 'text-[9px] sm:text-[10px]',
    chip: 'w-[32px] h-[20px] sm:w-[36px] sm:h-[24px]',
    chipInner: 'w-[20px] h-[12px] sm:w-[24px] sm:h-[16px]',
    networkScale: 'scale-[0.75] sm:scale-[0.85]',
  },
  recommendation: { 
    wrapper: 'w-full max-w-[420px] aspect-[1.586]',
    padX: 'px-6 sm:px-8',
    padY: 'py-5 sm:py-7',
    radius: 'rounded-[18px] sm:rounded-[24px]',
    issuer: 'text-[12px] sm:text-[14px] tracking-[0.16em]',
    product: 'text-[14px] sm:text-[16px]',
    pan: 'text-[17px] sm:text-[21px] tracking-[0.22em]',
    label: 'text-[14px] sm:text-[16px]',
    holder: 'text-[11px] sm:text-[13px]',
    chip: 'w-[46px] h-[32px] sm:w-[54px] sm:h-[38px]',
    chipInner: 'w-[30px] h-[22px] sm:w-[36px] sm:h-[26px]',
    networkScale: 'scale-[1] sm:scale-[1.15]',
  },
  featured: {
    wrapper: 'w-full max-w-[420px] aspect-[1.586]',
    padX: 'px-6 sm:px-8',
    padY: 'py-5 sm:py-7',
    radius: 'rounded-[18px] sm:rounded-[24px]',
    issuer: 'text-[12px] sm:text-[14px] tracking-[0.16em]',
    product: 'text-[14px] sm:text-[16px]',
    pan: 'text-[17px] sm:text-[21px] tracking-[0.22em]',
    label: 'text-[14px] sm:text-[16px]',
    holder: 'text-[11px] sm:text-[13px]',
    chip: 'w-[46px] h-[32px] sm:w-[54px] sm:h-[38px]',
    chipInner: 'w-[30px] h-[22px] sm:w-[36px] sm:h-[26px]',
    networkScale: 'scale-[1] sm:scale-[1.15]',
  },
};

const NetworkLogoMap: Record<string, React.FC> = {
  visa: VisaLogo,
  mastercard: MastercardLogo,
  amex: AmexLogo,
  discover: DiscoverLogo,
  rupay: RupayLogo,
};

function EmvChip({ chipClass, chipInnerClass, style = 'silver' }: { chipClass: string; chipInnerClass: string; style?: string }) {
  if (style === 'none') return null;

  const gradient = style === 'gold' 
    ? 'linear-gradient(145deg, #f5d76e 0%, #d4af37 40%, #aa7c11 80%, #f5d76e 100%)'
    : 'linear-gradient(145deg, #e0e0e0 0%, #bdbdbd 40%, #757575 80%, #e0e0e0 100%)';
    
  const borderColor = style === 'gold' ? 'border-yellow-900/30' : 'border-gray-800/30';
  const blockColor = style === 'gold' ? 'bg-yellow-900/20' : 'bg-gray-800/20';

  return (
    <div
      className={cn('relative rounded-[6px] flex items-center justify-center shrink-0 shadow-sm overflow-hidden', chipClass)}
      style={{
        background: gradient,
        boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.6), inset 0 -1px 2px rgba(0,0,0,0.2), 0 1px 2px rgba(0,0,0,0.3)',
      }}
    >
      <div
        className={cn('border rounded-[3px] grid grid-cols-3 grid-rows-3 gap-[1px] p-[1px] opacity-75', borderColor, chipInnerClass)}
      >
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className={cn('rounded-[1px]', blockColor)} />
        ))}
      </div>
    </div>
  );
}

function ContactlessIcon({ size, color }: { size: number, color: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-label="Contactless"
      className="opacity-75"
    >
      <path d="M5 12.5C5 8.91 7.91 6 11.5 6" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M8.5 12.5C8.5 10.57 10.07 9 12 9" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="12" cy="12.5" r="1.5" fill={color} />
      <path d="M15.5 12.5C15.5 10.57 13.93 9 12 9" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M19 12.5C19 8.91 16.09 6 12.5 6" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export function CreditCard({
  card,
  variant = 'compact',
  revealed = false,
  selected = false,
  recommended = false,
  onClick,
  className,
}: CreditCardProps) {
  const tokens = VARIANT_TOKENS[variant];
  const displayLabel = card.label || card.name || 'Credit Card';
  const theme = getIssuerTheme(card.bank, displayLabel);

  const networkName = theme.network || card.network?.toLowerCase() || 'visa';
  const NetworkLogo = NetworkLogoMap[networkName] || VisaLogo;
  
  const last4 = card.pan ? card.pan.replace(/\s/g, '').slice(-4) : '••••';
  const maskedPan = revealed ? card.pan : `•••• •••• •••• ${last4}`;

  const isInteractive = !!onClick;
  const contactlessSize = variant === 'featured' || variant === 'recommendation' ? 24 : variant === 'wallet' ? 20 : 16;

  // Patterns
  let patternStyle: React.CSSProperties = {};
  if (theme.pattern === 'geometric') {
    patternStyle = {
      backgroundImage: `linear-gradient(30deg, ${theme.secondary} 12%, transparent 12.5%, transparent 87%, ${theme.secondary} 87.5%, ${theme.secondary}),
                        linear-gradient(150deg, ${theme.secondary} 12%, transparent 12.5%, transparent 87%, ${theme.secondary} 87.5%, ${theme.secondary}),
                        linear-gradient(30deg, ${theme.secondary} 12%, transparent 12.5%, transparent 87%, ${theme.secondary} 87.5%, ${theme.secondary}),
                        linear-gradient(150deg, ${theme.secondary} 12%, transparent 12.5%, transparent 87%, ${theme.secondary} 87.5%, ${theme.secondary}),
                        linear-gradient(60deg, rgba(255,255,255,0.03) 25%, transparent 25.5%, transparent 75%, rgba(255,255,255,0.03) 75%, rgba(255,255,255,0.03)), 
                        linear-gradient(60deg, rgba(255,255,255,0.03) 25%, transparent 25.5%, transparent 75%, rgba(255,255,255,0.03) 75%, rgba(255,255,255,0.03))`,
      backgroundSize: '40px 70px',
      backgroundPosition: '0 0, 0 0, 20px 35px, 20px 35px, 0 0, 20px 35px',
      opacity: 0.15
    };
  } else if (theme.pattern === 'dots') {
    patternStyle = {
      backgroundImage: `radial-gradient(rgba(255,255,255,0.15) 2px, transparent 2px)`,
      backgroundSize: '20px 20px',
    };
  } else if (theme.pattern === 'lines') {
    patternStyle = {
      backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px)`,
    };
  }

  const PhysicalCard = (
    <div
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onClick={onClick}
      onKeyDown={isInteractive ? (e) => e.key === 'Enter' && onClick?.() : undefined}
      aria-label={`${displayLabel} ending in ${last4}`}
      className={cn(
        'group relative overflow-hidden select-none shrink-0 transition-all duration-300',
        tokens.wrapper,
        tokens.radius,
        isInteractive && 'cursor-pointer hover:-translate-y-1',
        selected && 'ring-[3px] ring-[#2A9D5C] ring-offset-4 ring-offset-[#0A0A0A]',
        className
      )}
      style={{
        background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
        boxShadow: selected
          ? '0 12px 32px rgba(42, 157, 92, 0.3), inset 0 1px 1px rgba(255,255,255,0.2)'
          : '0 8px 24px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.2), inset 0 -1px 1px rgba(0,0,0,0.3)',
      }}
    >
      {/* Pattern Layer */}
      {theme.pattern && theme.pattern !== 'none' && (
        <div className="absolute inset-0 pointer-events-none mix-blend-overlay" style={patternStyle} />
      )}

      {/* Noise texture for premium depth */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.25] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '120px',
        }}
      />

      {/* Diagonal gloss highlight */}
      <div
        aria-hidden="true"
        className={cn(
          "absolute inset-0 pointer-events-none transition-opacity duration-300",
          theme.material === 'matte' ? 'bg-gradient-to-tr from-transparent via-white/[0.03] to-white/[0.08]' 
          : theme.material === 'glossy' ? 'bg-gradient-to-tr from-transparent via-white/[0.1] to-white/[0.25]'
          : 'bg-gradient-to-tr from-transparent via-white/[0.05] to-white/[0.15]'
        )}
      />

      {/* Bottom vignette for text legibility */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent pointer-events-none"
      />

      {/* ── Card Content ──────────────────────────────────────────────────── */}
      <div className={cn('relative z-10 h-full flex flex-col justify-between', tokens.padX, tokens.padY)} style={{ color: theme.text }}>
        
        {/* TOP: Issuer & Product */}
        <div className="flex items-start justify-between w-full">
          <div className="flex flex-col items-start max-w-[80%]">
            <span className={cn('font-bold opacity-95 uppercase tracking-widest drop-shadow-sm truncate w-full', tokens.issuer)}>
              {card.bank || 'BANK'}
            </span>
            <span className={cn('font-medium opacity-80 truncate w-full mt-0.5', tokens.product)}>
              {displayLabel}
            </span>
          </div>
          <ContactlessIcon size={contactlessSize} color={theme.text} />
        </div>

        {/* MIDDLE: Chip & PAN */}
        <div className="flex flex-col justify-center flex-1 w-full" style={{ paddingBottom: variant === 'compact' ? '0' : '4%' }}>
          <div className="mb-2">
            <EmvChip chipClass={tokens.chip} chipInnerClass={tokens.chipInner} style={theme.chipStyle} />
          </div>
          <p className={cn('font-mono opacity-95 leading-none drop-shadow-md w-full mt-1', tokens.pan)}>
            {maskedPan}
          </p>
        </div>

        {/* BOTTOM: Holder, Validity, Network */}
        <div className="flex items-end justify-between w-full pt-1">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1 opacity-75">
              <span className="text-[5px] sm:text-[6px] uppercase leading-[0.8] max-w-[20px] font-medium break-words">Valid Thru</span>
              <span className={cn('font-mono leading-none', tokens.holder)}>12/28</span>
            </div>
            <p className={cn('font-bold opacity-95 truncate drop-shadow-sm uppercase tracking-wider', tokens.holder)}>
              {card.cardholderName || 'CARDHOLDER NAME'}
            </p>
          </div>
          
          <div className={cn('shrink-0 origin-bottom-right drop-shadow-sm opacity-95', tokens.networkScale)}>
            <NetworkLogo />
          </div>
        </div>

      </div>
    </div>
  );

  if (recommended) {
    return (
      <div className="relative inline-block shrink-0">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap">
          <span className="bg-[#2A9D5C] text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full shadow-lg border border-[#2A9D5C]/50">
            RenoCred Pick
          </span>
        </div>
        {PhysicalCard}
      </div>
    );
  }

  return PhysicalCard;
}

export default CreditCard;
