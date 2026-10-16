/**
 * moneyMath.ts
 *
 * Single source of truth for money units and "what counts as spend" across
 * Money Manager, budgets, analytics and reports.
 *
 * Units: every transaction / budget / subscription / credit-account amount in
 * the dashboard store is stored in PAISE (integer, ₹1 = 100). Profile salary is
 * ANNUAL RUPEES. Convert at the boundary with the helpers below — never mix.
 */
import type { Transaction, TransactionCategory } from '../../dashboard/types/dashboard.types';

export const PAISE_PER_RUPEE = 100;

export const toPaise = (rupees: number): number => Math.round(rupees * PAISE_PER_RUPEE);
export const fromPaise = (paise: number): number => paise / PAISE_PER_RUPEE;

/** ₹1,23,456 style, no decimals. Accepts paise. */
export function formatRupees(paise: number, opts: { signed?: boolean } = {}): string {
  const rupees = Math.round(Math.abs(paise) / PAISE_PER_RUPEE);
  const body = `₹${rupees.toLocaleString('en-IN')}`;
  if (!opts.signed || paise === 0) return body;
  return paise < 0 ? `−${body}` : `+${body}`;
}

/** Ledger rows written by payBill. These move money between bank and card — not spend, not income. */
export const CARD_PAYMENT_MERCHANT = 'Bill Payment';

export function isCardPayment(t: Pick<Transaction, 'merchant'>): boolean {
  return t.merchant === CARD_PAYMENT_MERCHANT;
}

/** A purchase that reduces disposable money. */
export function isSpend(t: Pick<Transaction, 'type' | 'merchant' | 'amount'>): boolean {
  return t.type === 'debit' && !isCardPayment(t) && t.amount !== 0;
}

/** A refund / cashback / incoming credit that offsets spend. Card bill payments are excluded. */
export function isRefund(t: Pick<Transaction, 'type' | 'merchant'>): boolean {
  return (t.type === 'refund' || t.type === 'credit') && !isCardPayment(t);
}

// ─────────────────────────────────────────────────────────────────────────────
//  Calendar helpers — months are evaluated in India Standard Time so a ₹500
//  purchase at 00:30 IST on the 1st lands in the new month, not the old one.
// ─────────────────────────────────────────────────────────────────────────────

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

/** Returns { year, month (0-11), day } of the instant as seen in IST. */
export function istParts(d: Date | string | number): { year: number; month: number; day: number } {
  const t = new Date(d).getTime() + IST_OFFSET_MS;
  const u = new Date(t);
  return { year: u.getUTCFullYear(), month: u.getUTCMonth(), day: u.getUTCDate() };
}

export function monthKey(d: Date | string | number): string {
  const { year, month } = istParts(d);
  return `${year}-${String(month + 1).padStart(2, '0')}`;
}

export function isSameMonth(a: Date | string | number, b: Date | string | number): boolean {
  return monthKey(a) === monthKey(b);
}

/** Days left in the IST month containing `now`, including today. */
export function daysLeftInMonth(now: Date = new Date()): number {
  const { year, month, day } = istParts(now);
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return daysInMonth - day + 1;
}

/** Whole days from `now` until `target` in IST calendar days (0 = today, negative = past). */
export function daysUntil(target: Date | string, now: Date = new Date()): number {
  const a = istParts(now);
  const b = istParts(target);
  const ua = Date.UTC(a.year, a.month, a.day);
  const ub = Date.UTC(b.year, b.month, b.day);
  return Math.round((ub - ua) / 86_400_000);
}

export function isValidDate(value: unknown): value is string {
  if (typeof value !== 'string' || value.length < 8) return false;
  const t = Date.parse(value);
  return !Number.isNaN(t);
}

// ─────────────────────────────────────────────────────────────────────────────
//  Aggregates
// ─────────────────────────────────────────────────────────────────────────────

export interface MonthSummary {
  /** Gross purchases, paise */
  spent: number;
  /** Refunds / credits (positive number), paise */
  refunds: number;
  /** spent − refunds, never below 0, paise */
  netSpent: number;
  byCategory: Partial<Record<TransactionCategory, number>>;
  count: number;
}

export function summarizeMonth(transactions: Transaction[], ref: Date = new Date()): MonthSummary {
  const key = monthKey(ref);
  let spent = 0;
  let refunds = 0;
  let count = 0;
  const byCategory: Partial<Record<TransactionCategory, number>> = {};
  for (const t of transactions) {
    if (!isValidDate(t.date) || monthKey(t.date) !== key) continue;
    if (isSpend(t)) {
      const amt = Math.abs(t.amount);
      spent += amt;
      count += 1;
      const cat = (t.category || 'other') as TransactionCategory;
      byCategory[cat] = (byCategory[cat] ?? 0) + amt;
    } else if (isRefund(t)) {
      refunds += Math.abs(t.amount);
      count += 1;
    }
  }
  return { spent, refunds, netSpent: Math.max(0, spent - refunds), byCategory, count };
}

/** Current-month spend for one category, paise. */
export function categorySpendThisMonth(
  transactions: Transaction[],
  category: TransactionCategory,
  ref: Date = new Date(),
): number {
  return summarizeMonth(transactions, ref).byCategory[category] ?? 0;
}
