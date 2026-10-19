/**
 * This month as a till receipt: it prints out of the slot line by line, and
 * totals to what's safe to spend. Income is edited right on the slip.
 */
import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Pencil } from 'lucide-react';
import { BrandMark } from '../../../public-platform/site/Brand';
import { formatRupees } from '../../../features/money/lib/moneyMath';
import type { SafeToSpendResult } from '../../../features/money/engines/SafeToSpendEngine';

const PAPER = '#FBFAF6';

function Teeth() {
  const w = 300;
  const step = 12;
  let d = `M0 0 H${w} V2`;
  for (let x = w; x > 0; x -= step) d += ` L${x - step / 2} 10 L${x - step} 2`;
  d += ' Z';
  return (
    <svg aria-hidden viewBox={`0 0 ${w} 10`} preserveAspectRatio="none" className="block h-[10px] w-full">
      <path d={d} fill={PAPER} />
    </svg>
  );
}

export function Receipt({ safe, month, monthlyIncomePaise, onSaveIncome }: {
  safe: SafeToSpendResult;
  month: string;
  monthlyIncomePaise: number | null;
  onSaveIncome: (monthlyRupees: number) => void;
}) {
  const reduce = useReducedMotion();
  const [editing, setEditing] = useState(!safe.hasIncome);
  const [income, setIncome] = useState(monthlyIncomePaise ? String(Math.round(monthlyIncomePaise / 100)) : '');

  const lines = safe.hasIncome ? [
    { k: 'Spent so far', v: -safe.netSpent },
    ...(safe.upcomingSubscriptions > 0 ? [{ k: 'Renewals still due', v: -safe.upcomingSubscriptions }] : []),
    ...(safe.savingsTarget > 0 ? [{ k: 'Set aside for goals', v: -safe.savingsTarget }] : []),
    ...(safe.reservedForBudgets > 0 ? [{ k: 'Kept for budgets', v: -safe.reservedForBudgets }] : []),
  ] : [];

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const n = Number(income.replace(/[^\d]/g, ''));
    if (n > 0) { onSaveIncome(n); setEditing(false); }
  };

  const line = (i: number) => (reduce ? {} : {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.25, delay: 0.55 + i * 0.12 },
  });

  return (
    <div className="relative mx-auto w-[300px]">
      {/* the printer's slot */}
      <div aria-hidden className="relative z-10 mx-auto h-4 w-[324px] -translate-x-3 rounded-full bg-gradient-to-b from-[#1d2e24] to-[#0b1610] shadow-[0_10px_20px_-10px_rgba(0,0,0,0.8)] ring-1 ring-white/10">
        <span className="absolute inset-x-4 top-1/2 h-1 -translate-y-1/2 rounded-full bg-black" />
      </div>
      <div className="-mt-2 overflow-hidden px-1 pb-2">
        <motion.div
          initial={reduce ? false : { y: '-100%' }}
          animate={{ y: '0%' }}
          transition={{ duration: 1.5, ease: [0.3, 0.7, 0.2, 1] }}
        >
          <div className="px-6 pb-5 pt-6 text-rc-ink" style={{ background: PAPER }}>
            <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.16em] text-rc-ink/55">
              <span className="flex items-center gap-1.5"><BrandMark size={13} /> RenoCred</span>
              <span>{month}</span>
            </div>
            <div className="mt-3 border-t border-dashed border-rc-ink/25" />

            <form onSubmit={save} className="flex min-h-[44px] items-center justify-between gap-3 py-2 text-[14px]">
              <span className="text-rc-ink/70">Income</span>
              {editing ? (
                <span className="flex items-center gap-1.5">
                  <span className="flex h-9 items-center rounded-full border border-rc-ink/20 bg-white px-3">
                    <span className="text-rc-ink/50">₹</span>
                    <input
                      autoFocus={safe.hasIncome}
                      aria-label="Monthly take-home pay in rupees"
                      inputMode="numeric"
                      value={income ? Number(income).toLocaleString('en-IN') : ''}
                      onChange={(e) => setIncome(e.target.value.replace(/[^\d]/g, '').slice(0, 8))}
                      placeholder="a month"
                      className="ml-1 w-[88px] bg-transparent text-right tabular-nums outline-none placeholder:text-rc-ink/35"
                    />
                  </span>
                  <button type="submit" disabled={!income} className="h-9 rounded-full bg-rc-ink px-3 text-[13px] font-medium text-rc-cream disabled:opacity-40">Save</button>
                </span>
              ) : (
                <button type="button" onClick={() => setEditing(true)} className="group flex items-center gap-1.5 font-semibold tabular-nums">
                  {formatRupees(safe.totalIncome)}
                  <Pencil size={12} className="text-rc-ink/35 group-hover:text-rc-ink" />
                </button>
              )}
            </form>

            {lines.map((l, i) => (
              <motion.div key={l.k} {...line(i)} className="flex items-center justify-between gap-3 py-1.5 text-[14px]">
                <span className="text-rc-ink/70">{l.k}</span>
                <span className="tabular-nums">−{formatRupees(Math.abs(l.v))}</span>
              </motion.div>
            ))}

            <div className="mt-3 border-t border-dashed border-rc-ink/25" />
            {safe.hasIncome ? (
              <motion.div {...line(lines.length + 1)} className="pt-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-rc-ink/55">Safe to spend</p>
                <p className="mt-1 font-serif text-[44px] font-semibold leading-none tabular-nums lining-nums text-rc-forest">{formatRupees(safe.safeToSpend)}</p>
                <p className="mt-2 text-[13px] text-rc-ink/65">About {formatRupees(safe.perDay)} a day for the next {safe.daysLeft} {safe.daysLeft === 1 ? 'day' : 'days'}</p>
              </motion.div>
            ) : (
              <p className="pt-4 text-[13px] leading-relaxed text-rc-ink/65">Add your monthly take-home pay and this slip totals what you can spend without touching bills, renewals or savings.</p>
            )}
            <p aria-hidden className="mt-5 text-center text-[10px] tracking-[0.3em] text-rc-ink/35">THANK YOU · VISIT AGAIN</p>
          </div>
          <Teeth />
        </motion.div>
      </div>
    </div>
  );
}
