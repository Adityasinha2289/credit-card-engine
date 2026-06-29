import { memo } from 'react';
import { motion } from 'framer-motion';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';

import { cn, formatCents } from '../../../lib/utils';
import type { Transaction } from '../../dashboard/types/dashboard.types';
import { CATEGORY_STYLES } from '../../cards/components/CategoryIcon';

// ─────────────────────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day:   'numeric',
    hour:  'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(iso));
}

// ─────────────────────────────────────────────────────────────────────────────
//  ROW ANIMATION VARIANTS
//  Enhanced organic entrance with subtle rotateX for a "card flip" feel
// ─────────────────────────────────────────────────────────────────────────────

const rowVariants = {
  /** Hidden state — below canvas, transparent, slight perspective tilt */
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.97,
    rotateX: 4,
  },
  /** Visible state — natural position */
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    rotateX: 0,
    transition: {
      delay:     i * 0.06,          // stagger: 60ms between rows
      duration:  0.45,
      ease:      [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  }),
  /** Exit — slides up and fades (used when a row is removed) */
  exit: {
    opacity: 0,
    y: -12,
    scale: 0.97,
    transition: { duration: 0.22, ease: 'easeIn' },
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
//  COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

interface TransactionRowProps {
  transaction: Transaction;
  /** Index within the list — used for stagger delay */
  index: number;
  /** Whether this is a newly added item (gets slide-in-from-top treatment) */
  isNew?: boolean;
}

export const TransactionRow = memo(function TransactionRow({
  transaction,
  index,
  isNew = false,
}: TransactionRowProps) {
  const { merchant, amount, date, category, type, pending, rewardPoints } = transaction;
  const style  = CATEGORY_STYLES[category];
  const Icon   = style.Icon;

  const isCredit  = type === 'credit' || type === 'refund';
  const isDebit   = type === 'debit';
  const amountStr = formatCents(amount);

  // New transactions animate from the top (slide-down from above)
  const newItemVariants = {
    hidden:  { opacity: 0, y: -24, scale: 0.96 },
    visible: { opacity: 1, y: 0,   scale: 1,
      transition: { type: 'spring' as const, stiffness: 320, damping: 28, mass: 1 } },
    exit:    rowVariants.exit,
  };

  return (
    <motion.li
      layout                                     // smooth layout shift when list reorders
      layoutId={transaction.id}                  // unique key for Framer's FLIP animations
      variants={isNew ? newItemVariants : rowVariants}
      custom={index}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={cn(
        // Premium floating row with glass surface
        'group relative flex items-center gap-4 px-4 py-3.5',
        'bg-surface/80 dark:bg-surface/40 rounded-2xl',
        'border border-canvas-200/60 dark:border-white/[0.04]',
        // Hover: lift + shadow upgrade + left accent reveal
        'hover:shadow-ag-card hover:-translate-y-[2px]',
        'transition-all duration-250 ease-ag-smooth',
        // Pending rows get subtle pulse
        pending && 'opacity-70',
      )}
      style={{
        // Soft inner glow for premium depth
        boxShadow: 'inset 0 1px 0 rgb(255 255 255 / 0.04), 0 1px 3px rgb(0 0 0 / 0.02)',
        perspective: '800px',
      }}
      aria-label={`${merchant}, ${isCredit ? 'credit' : 'charge'} ${amountStr}`}
    >
      {/* ── Category accent bar (left edge, appears on hover) ─────────── */}
      <div
        className={cn(
          'absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-0 rounded-r-full',
          'group-hover:h-6 transition-all duration-300 ease-ag-spring',
        )}
        style={{ backgroundColor: style.glowColor }}
        aria-hidden="true"
      />

      {/* ── Category icon bubble ─────────────────────────────────────── */}
      <div
        className={cn(
          'flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center',
          'transition-transform duration-300 group-hover:scale-105',
          style.bgClass,
        )}
        style={{
          boxShadow: `0 2px 8px ${style.glowColor}`,
        }}
        aria-hidden="true"
      >
        <Icon size={18} strokeWidth={1.8} className={style.iconClass} />
      </div>

      {/* ── Merchant + meta ──────────────────────────────────────────── */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-ink-primary truncate leading-tight">
            {merchant}
          </p>
          {pending && (
            <span className="flex items-center gap-1 flex-shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-caution pulse-subtle" />
              <span className="text-[10px] font-semibold tracking-wide uppercase text-caution">
                Pending
              </span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <p className="text-xs text-ink-tertiary">
            {style.label}
          </p>
          <span className="text-ink-disabled text-xs">·</span>
          <p className="text-xs text-ink-tertiary">
            {formatDate(date)}
          </p>
        </div>
      </div>

      {/* ── Amount + reward points ───────────────────────────────────── */}
      <div className="flex-shrink-0 flex flex-col items-end gap-0.5">
        {/* Amount with directional arrow */}
        <div className="flex items-center gap-1">
          {isDebit
            ? <ArrowUpRight   size={13} strokeWidth={2.5} className="text-loss"   aria-hidden />
            : <ArrowDownLeft  size={13} strokeWidth={2.5} className="text-profit" aria-hidden />
          }
          <span
            className={cn(
              'text-sm font-bold tabular-nums tracking-tight',
              isCredit ? 'text-profit' : 'text-ink-primary',
            )}
          >
            {isCredit ? '+' : ''}{amountStr}
          </span>
        </div>

        {/* Reward points — only show if earned */}
        {rewardPoints != null && rewardPoints > 0 && (
          <span className="text-[10px] font-medium text-brand-500 dark:text-brand-400 tabular-nums">
            +{rewardPoints.toLocaleString()} pts
          </span>
        )}
      </div>
    </motion.li>
  );
});
