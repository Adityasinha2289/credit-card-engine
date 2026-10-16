/**
 * billingCycle.ts — calendar maths for recurring charges.
 *
 * Pure functions on IST calendar dates ("YYYY-MM-DD"). No React / Supabase
 * imports: this module is shared by the browser and the reminder cron
 * (api/reminders.ts).
 */
import type { BillingCycle } from '../dashboard/types/dashboard.types';

export type { BillingCycle };

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const DAY_MS = 86_400_000;

/** IST calendar date of an instant, as YYYY-MM-DD. */
export function istDate(d: Date | string | number = new Date()): string {
  const t = new Date(d).getTime();
  if (Number.isNaN(t)) throw new Error(`Invalid date: ${String(d)}`);
  return new Date(t + IST_OFFSET_MS).toISOString().slice(0, 10);
}

/** Normalise "2026-10-20", "2026-10-20T00:00:00Z" etc. to an IST calendar date; null when invalid. */
export function toCalendarDate(value: string | null | undefined): string | null {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const t = Date.parse(value);
  return Number.isNaN(t) ? null : istDate(t);
}

function parts(date: string): [number, number, number] {
  const [y, m, d] = date.split('-').map(Number);
  return [y, m, d];
}

function fmt(y: number, m: number, d: number): string {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function daysInMonth(y: number, m: number): number {
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

export function addDays(date: string, days: number): string {
  const [y, m, d] = parts(date);
  return new Date(Date.UTC(y, m - 1, d) + days * DAY_MS).toISOString().slice(0, 10);
}

/** Whole days from `from` to `to` (both calendar dates). */
export function daysBetween(from: string, to: string): number {
  const [y1, m1, d1] = parts(from);
  const [y2, m2, d2] = parts(to);
  return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / DAY_MS);
}

/**
 * Advance a date by `n` cycles. Month-based cycles keep the anchor day and
 * clamp to month end (31 Jan → 28/29 Feb → 31 Mar), like card billers do.
 */
export function addCycles(date: string, cycle: BillingCycle, n = 1, anchorDay?: number): string {
  if (cycle === 'weekly') return addDays(date, 7 * n);
  const months = cycle === 'monthly' ? n : cycle === 'quarterly' ? 3 * n : 12 * n;
  const [y, m, d] = parts(date);
  const anchor = anchorDay ?? d;
  const total = (y * 12 + (m - 1)) + months;
  const ny = Math.floor(total / 12);
  const nm = (total % 12) + 1;
  return fmt(ny, nm, Math.min(anchor, daysInMonth(ny, nm)));
}

/**
 * First charge date on or after `today`, starting from a possibly stale
 * `next` date. Never loops forever on bad input.
 */
export function rollForward(next: string, cycle: BillingCycle, today: string): string {
  if (next >= today) return next;
  const anchor = parts(next)[2];
  let current = next;
  for (let i = 1; i <= 1000 && current < today; i++) {
    current = addCycles(next, cycle, i, anchor);
  }
  return current;
}

const PER_YEAR: Record<BillingCycle, number> = { weekly: 52, monthly: 12, quarterly: 4, yearly: 1 };

/** Cost per year of a per-cycle amount (paise in, paise out). */
export function yearlyCost(amount: number, cycle: BillingCycle): number {
  return Math.round(amount * PER_YEAR[cycle]);
}

/** Average cost per month of a per-cycle amount (paise in, paise out). */
export function monthlyCost(amount: number, cycle: BillingCycle): number {
  return Math.round((amount * PER_YEAR[cycle]) / 12);
}

export const CYCLE_LABEL: Record<BillingCycle, string> = {
  weekly: 'week',
  monthly: 'month',
  quarterly: 'quarter',
  yearly: 'year',
};
