/**
 * recurringDetector.ts — spots subscriptions hiding in the transaction feed.
 *
 * A merchant is "recurring" when it charges a similar amount (±10% of the
 * median, allowing one price change) at a regular interval: weekly (6–8 d),
 * monthly (26–35 d), quarterly (85–95 d) or yearly (355–375 d), at least
 * twice. Only suggestions are produced — the user confirms before anything is
 * tracked.
 */
import type { Transaction, Subscription, BillingCycle } from '../dashboard/types/dashboard.types';
import { addCycles, toCalendarDate, daysBetween } from './billingCycle';
import { findPreset } from './presets';

export interface RecurringSuggestion {
  merchantKey: string;
  name: string;
  /** latest charge, paise */
  amount: number;
  billingCycle: BillingCycle;
  lastChargedOn: string;
  nextBillingDate: string;
  occurrences: number;
  /** 0..1 */
  confidence: number;
  hasPriceHike: boolean;
  previousAmount?: number;
  category: string;
  cardId: string;
  cancelUrl?: string;
}

const NOISE = /\b(pvt|private|ltd|limited|india|in|com|www|payments?|digital|services|subscription|autopay|si|mandate|recurring|bill)\b/g;
// Card descriptors often append the acquiring city.
const CITIES = /\b(mumbai|bombay|delhi|new delhi|gurgaon|gurugram|noida|bangalore|bengaluru|pune|hyderabad|chennai|kolkata|ahmedabad|singapore|dublin|amsterdam)\b/g;

/** "NETFLIX.COM MUMBAI" / "Netflix India Pvt Ltd" → "netflix" */
export function merchantKey(merchant: string): string {
  const preset = findPreset(merchant);
  if (preset) return preset.key;
  return merchant
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(NOISE, ' ')
    .replace(CITIES, ' ')
    .replace(/\b\d+\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const BUCKETS: { cycle: BillingCycle; min: number; max: number }[] = [
  { cycle: 'weekly', min: 6, max: 8 },
  { cycle: 'monthly', min: 26, max: 35 },
  { cycle: 'quarterly', min: 85, max: 95 },
  { cycle: 'yearly', min: 355, max: 375 },
];

function bucketOf(days: number): BillingCycle | null {
  return BUCKETS.find((b) => days >= b.min && days <= b.max)?.cycle ?? null;
}

function median(xs: number[]): number {
  const s = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : Math.round((s[mid - 1] + s[mid]) / 2);
}

export function detectRecurring(
  transactions: Transaction[],
  existing: Subscription[] = [],
  today: string = toCalendarDate(new Date().toISOString())!,
): RecurringSuggestion[] {
  const tracked = new Set(existing.filter((s) => s.status !== 'cancelled').map((s) => merchantKey(s.name)));

  const groups = new Map<string, { date: string; amount: number; t: Transaction }[]>();
  for (const t of transactions) {
    if (t.type !== 'debit' || t.amount <= 0 || t.merchant === 'Bill Payment') continue;
    const key = merchantKey(t.merchant);
    const date = toCalendarDate(t.date);
    if (!key || !date) continue;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push({ date, amount: t.amount, t });
  }

  const out: RecurringSuggestion[] = [];
  for (const [key, rows] of groups) {
    if (rows.length < 2) continue;
    if ([...tracked].some((k) => k === key || k.includes(key) || key.includes(k))) continue;

    // One charge per day max (duplicates from SMS + manual entry).
    const byDay = new Map<string, (typeof rows)[number]>();
    rows.forEach((r) => byDay.set(r.date, r));
    const series = [...byDay.values()].sort((a, b) => a.date.localeCompare(b.date));
    if (series.length < 2) continue;

    const intervals = series.slice(1).map((r, i) => daysBetween(series[i].date, r.date));
    const buckets = intervals.map(bucketOf);
    const cycle = buckets[0];
    if (!cycle || buckets.some((b) => b !== cycle)) continue;

    const amounts = series.map((r) => r.amount);
    const med = median(amounts);
    const last = amounts[amounts.length - 1];
    const prev = amounts[amounts.length - 2];
    const within = (a: number, ref: number) => Math.abs(a - ref) <= ref * 0.1;
    // All but the latest charge must be stable; the latest may be a price change.
    const stableHistory = amounts.slice(0, -1).every((a) => within(a, median(amounts.slice(0, -1))));
    if (!stableHistory) continue;
    const priceChanged = !within(last, prev);
    if (priceChanged && last < prev * 0.5) continue; // probably a different purchase

    const lastRow = series[series.length - 1];
    const nextBillingDate = addCycles(lastRow.date, cycle);
    if (daysBetween(nextBillingDate, today) > 45) continue; // went quiet — likely cancelled

    const preset = findPreset(lastRow.t.merchant);
    let confidence = series.length >= 4 ? 0.9 : series.length === 3 ? 0.8 : 0.6;
    if (preset) confidence = Math.min(0.97, confidence + 0.1);
    if (priceChanged) confidence -= 0.1;
    if (!within(med, last) && !priceChanged) confidence -= 0.1;

    out.push({
      merchantKey: key,
      name: preset?.name ?? lastRow.t.merchant.trim(),
      amount: last,
      billingCycle: cycle,
      lastChargedOn: lastRow.date,
      nextBillingDate,
      occurrences: series.length,
      confidence: Math.round(confidence * 100) / 100,
      hasPriceHike: priceChanged && last > prev,
      previousAmount: priceChanged && last > prev ? prev : undefined,
      category: preset?.category ?? lastRow.t.category ?? 'subscriptions',
      cardId: lastRow.t.cardId ?? '',
      cancelUrl: preset?.cancelUrl,
    });
  }

  return out.sort((a, b) => b.confidence - a.confidence || b.amount - a.amount);
}
