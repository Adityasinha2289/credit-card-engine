/**
 * reminderPlanner.ts — decides which subscription reminders are due.
 *
 * Pure and deterministic: (subscriptions, preferences, today) → reminders.
 * The browser uses it for in-app reminders; api/reminders.ts uses the same
 * function for email / push, so both always agree.
 */
import type { Subscription } from '../dashboard/types/dashboard.types';
import { daysBetween, rollForward, toCalendarDate, yearlyCost } from './billingCycle';

export type ReminderKind = 'renewal' | 'annual_renewal' | 'trial_ending' | 'price_hike';

export interface Reminder {
  subscriptionId: string;
  name: string;
  kind: ReminderKind;
  /** Charge / conversion date this reminder is about (YYYY-MM-DD, IST) */
  dueOn: string;
  /** Days between today and dueOn */
  daysLeft: number;
  /** The lead time this reminder fires for (one of the subscription's reminder days) */
  leadDays: number;
  /** paise */
  amount: number;
  /** paise, when a price hike is known */
  previousAmount?: number;
  title: string;
  body: string;
  cancelUrl?: string;
  priority: 'high' | 'medium' | 'low';
}

export interface ReminderPreferences {
  /** Default lead times when a subscription has none, e.g. [3, 1] */
  defaultReminderDays: number[];
  /** Lead times for yearly plans (bigger charges deserve more notice) */
  yearlyReminderDays: number[];
}

export const DEFAULT_REMINDER_PREFERENCES: ReminderPreferences = {
  defaultReminderDays: [3, 1],
  yearlyReminderDays: [7, 1],
};

function rupees(paise: number): string {
  return `₹${Math.round(paise / 100).toLocaleString('en-IN')}`;
}

function when(days: number): string {
  if (days <= 0) return 'today';
  if (days === 1) return 'tomorrow';
  return `in ${days} days`;
}

/** Effective next charge date, rolled past any missed cycles. null when unknown. */
export function effectiveNextCharge(sub: Subscription, today: string): string | null {
  const next = toCalendarDate(sub.nextBillingDate);
  if (!next) return null;
  return rollForward(next, sub.billingCycle, today);
}

function leadTimes(sub: Subscription, prefs: ReminderPreferences): number[] {
  if (sub.reminderDays && sub.reminderDays.length > 0) return sub.reminderDays;
  return sub.billingCycle === 'yearly' ? prefs.yearlyReminderDays : prefs.defaultReminderDays;
}

/**
 * Reminders that should fire *today*: one per (subscription, kind) whose
 * days-left equals one of its lead times. Exact matching (not ≤) is what makes
 * "3 days before" and "1 day before" two distinct, once-only notifications.
 */
export function planReminders(
  subscriptions: Subscription[],
  today: string,
  prefs: ReminderPreferences = DEFAULT_REMINDER_PREFERENCES,
): Reminder[] {
  const out: Reminder[] = [];

  for (const sub of subscriptions) {
    if (sub.status !== 'active') continue;
    const leads = leadTimes(sub, prefs);

    // Free trial converting to paid — the reminder people value most.
    const trialEnd = sub.isFreeTrial ? toCalendarDate(sub.trialEndsOn ?? sub.nextBillingDate) : null;
    if (trialEnd && trialEnd >= today) {
      const daysLeft = daysBetween(today, trialEnd);
      if (leads.includes(daysLeft)) {
        out.push({
          subscriptionId: sub.id,
          name: sub.name,
          kind: 'trial_ending',
          dueOn: trialEnd,
          daysLeft,
          leadDays: daysLeft,
          amount: sub.amount,
          title: `${sub.name} free trial ends ${when(daysLeft)}`,
          body: `You'll be charged ${rupees(sub.amount)} per ${sub.billingCycle === 'yearly' ? 'year' : 'month'} unless you cancel before ${trialEnd}.`,
          cancelUrl: sub.cancelUrl,
          priority: 'high',
        });
      }
      continue; // the trial reminder replaces the renewal reminder for the same date
    }

    const next = effectiveNextCharge(sub, today);
    if (!next) continue;
    const daysLeft = daysBetween(today, next);
    if (!leads.includes(daysLeft)) continue;

    const yearly = sub.billingCycle === 'yearly';
    const hike = sub.hasPriceHike && sub.previousAmount && sub.previousAmount < sub.amount;
    const kind: ReminderKind = hike ? 'price_hike' : yearly ? 'annual_renewal' : 'renewal';
    const hikeText = hike ? ` That's up from ${rupees(sub.previousAmount!)}.` : '';
    const yearlyText = yearly ? ` (${rupees(yearlyCost(sub.amount, 'yearly'))} for the year)` : '';

    out.push({
      subscriptionId: sub.id,
      name: sub.name,
      kind,
      dueOn: next,
      daysLeft,
      leadDays: daysLeft,
      amount: sub.amount,
      previousAmount: hike ? sub.previousAmount : undefined,
      title: `${sub.name} renews ${when(daysLeft)}`,
      body: `${rupees(sub.amount)} will be charged on ${next}${yearlyText}.${hikeText}`,
      cancelUrl: sub.cancelUrl,
      priority: hike || yearly || daysLeft <= 1 ? 'high' : 'medium',
    });
  }

  return out.sort((a, b) => a.daysLeft - b.daysLeft || b.amount - a.amount);
}

export interface UpcomingCharge {
  subscription: Subscription;
  dueOn: string;
  daysLeft: number;
  kind: 'renewal' | 'trial_ending';
}

/** Everything charging within `windowDays` — for in-app lists (not lead-time gated). */
export function upcomingCharges(subscriptions: Subscription[], today: string, windowDays = 7): UpcomingCharge[] {
  const out: UpcomingCharge[] = [];
  for (const sub of subscriptions) {
    if (sub.status !== 'active') continue;
    const trialEnd = sub.isFreeTrial ? toCalendarDate(sub.trialEndsOn ?? sub.nextBillingDate) : null;
    const due = trialEnd && trialEnd >= today ? trialEnd : effectiveNextCharge(sub, today);
    if (!due) continue;
    const daysLeft = daysBetween(today, due);
    if (daysLeft >= 0 && daysLeft <= windowDays) {
      out.push({ subscription: sub, dueOn: due, daysLeft, kind: trialEnd && due === trialEnd ? 'trial_ending' : 'renewal' });
    }
  }
  return out.sort((a, b) => a.daysLeft - b.daysLeft);
}

/** "HH:MM" in [start, end) with wrap-around (22:00–08:00). */
export function isQuietTime(nowHHMM: string, start: string, end: string): boolean {
  const s = start.slice(0, 5);
  const e = end.slice(0, 5);
  const n = nowHHMM.slice(0, 5);
  if (s === e) return false;
  return s < e ? n >= s && n < e : n >= s || n < e;
}
