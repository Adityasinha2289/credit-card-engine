/**
 * Reminder job core — storage, email and push are injected so the logic is
 * unit-testable without Supabase / Resend / push services.
 *
 * Guarantees:
 *  • Same planning logic as the in-app UI (src/features/subscriptions/reminderPlanner).
 *  • At-most-once per (subscription, kind, due date, lead days, channel): a
 *    delivery row is CLAIMED (unique insert) before anything is sent, so
 *    retries / overlapping cron runs cannot double-send.
 *  • One email digest and one push per user per run, not one per subscription.
 *  • Push respects quiet hours; dead push endpoints (404/410) are removed.
 */
import type { Subscription } from '../../src/features/dashboard/types/dashboard.types';
import { mapSubscriptionRow } from '../../src/features/dashboard/store/rowMappers';
import { planReminders, isQuietTime, DEFAULT_REMINDER_PREFERENCES, type Reminder } from '../../src/features/subscriptions/reminderPlanner';
import { addDays, istDate, rollForward, toCalendarDate } from '../../src/features/subscriptions/billingCycle';
import { renewalDigestEmail } from './email';

export type Channel = 'email' | 'push';

export interface UserRow { id: string; email: string | null; name: string | null }
export interface PrefsRow {
  user_id: string;
  email_enabled: boolean;
  push_enabled: boolean;
  default_reminder_days: number[] | null;
  quiet_start: string | null;
  quiet_end: string | null;
}
export interface PushSubRow { id: string; user_id: string; endpoint: string; p256dh: string; auth: string }
export interface ClaimRow { user_id: string; subscription_id: string; kind: string; due_on: string; lead_days: number; channel: Channel }
export interface ClaimedRow extends ClaimRow { id: number }

export interface ReminderStore {
  /** Active subscriptions whose next charge or trial end is on/before `horizon` (YYYY-MM-DD). */
  dueSubscriptions(horizon: string): Promise<Record<string, any>[]>;
  setNextBillingOn(id: string, date: string): Promise<void>;
  users(ids: string[]): Promise<UserRow[]>;
  preferences(ids: string[]): Promise<PrefsRow[]>;
  pushSubscriptions(ids: string[]): Promise<PushSubRow[]>;
  /** Insert rows, ignoring ones that already exist; return only the newly inserted rows. */
  claim(rows: ClaimRow[]): Promise<ClaimedRow[]>;
  markDeliveries(ids: number[], status: 'sent' | 'failed', error?: string): Promise<void>;
  deletePushSubscription(endpoint: string): Promise<void>;
  touchPushSubscription(endpoint: string): Promise<void>;
}

export interface PushMessage { title: string; body: string; url: string; tag: string }

export interface ReminderDeps {
  store: ReminderStore;
  sendEmail(input: { to: string; subject: string; html: string; text?: string; idempotencyKey?: string }): Promise<unknown>;
  /** Resolve on success; reject with an error carrying `statusCode` on failure. */
  sendPush(sub: PushSubRow, message: PushMessage): Promise<unknown>;
  now?: Date;
  dryRun?: boolean;
}

export interface ReminderRunSummary {
  today: string;
  subscriptionsChecked: number;
  rolledForward: number;
  remindersPlanned: number;
  emailsSent: number;
  pushSent: number;
  skippedQuietHours: number;
  failures: { userId: string; channel: Channel; error: string }[];
  plan?: { userId: string; reminders: Pick<Reminder, 'subscriptionId' | 'kind' | 'dueOn' | 'leadDays' | 'title'>[] }[];
}

const LOOKAHEAD_DAYS = 31; // max reminder lead time is 30

function istClock(now: Date): string {
  return new Date(now.getTime() + 5.5 * 3600_000).toISOString().slice(11, 16);
}

function chunk<T>(xs: T[], n: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < xs.length; i += n) out.push(xs.slice(i, i + n));
  return out;
}

export async function runReminderJob(deps: ReminderDeps): Promise<ReminderRunSummary> {
  const now = deps.now ?? new Date();
  const today = istDate(now);
  const clock = istClock(now);
  const { store } = deps;

  const summary: ReminderRunSummary = {
    today, subscriptionsChecked: 0, rolledForward: 0, remindersPlanned: 0,
    emailsSent: 0, pushSent: 0, skippedQuietHours: 0, failures: [],
    ...(deps.dryRun ? { plan: [] } : {}),
  };

  const rows = await store.dueSubscriptions(addDays(today, LOOKAHEAD_DAYS));
  summary.subscriptionsChecked = rows.length;

  // Keep stored dates current so the app and the next run see the real next charge.
  const byUser = new Map<string, Subscription[]>();
  for (const row of rows) {
    const sub = mapSubscriptionRow(row);
    const stored = toCalendarDate(sub.nextBillingDate);
    if (stored && stored < today && !sub.isFreeTrial) {
      const next = rollForward(stored, sub.billingCycle, today);
      sub.nextBillingDate = next;
      summary.rolledForward += 1;
      if (!deps.dryRun) await store.setNextBillingOn(sub.id, next);
    }
    const list = byUser.get(row.user_id) ?? [];
    list.push(sub);
    byUser.set(row.user_id, list);
  }

  const userIds = [...byUser.keys()];
  if (userIds.length === 0) return summary;

  const [users, prefs, pushSubs] = await Promise.all([
    Promise.all(chunk(userIds, 200).map((c) => store.users(c))).then((x) => x.flat()),
    Promise.all(chunk(userIds, 200).map((c) => store.preferences(c))).then((x) => x.flat()),
    Promise.all(chunk(userIds, 200).map((c) => store.pushSubscriptions(c))).then((x) => x.flat()),
  ]);
  const userById = new Map(users.map((u) => [u.id, u]));
  const prefsById = new Map(prefs.map((p) => [p.user_id, p]));

  for (const userId of userIds) {
    const pref = prefsById.get(userId);
    const defaultDays = pref?.default_reminder_days?.length ? pref.default_reminder_days : DEFAULT_REMINDER_PREFERENCES.defaultReminderDays;
    const reminders = planReminders(byUser.get(userId)!, today, {
      defaultReminderDays: defaultDays,
      yearlyReminderDays: Array.from(new Set([7, ...defaultDays])),
    });
    if (reminders.length === 0) continue;
    summary.remindersPlanned += reminders.length;

    if (deps.dryRun) {
      summary.plan!.push({ userId, reminders: reminders.map(({ subscriptionId, kind, dueOn, leadDays, title }) => ({ subscriptionId, kind, dueOn, leadDays, title })) });
      continue;
    }

    const user = userById.get(userId);
    const endpoints = pushSubs.filter((p) => p.user_id === userId);
    const channels: Channel[] = [];
    if ((pref?.email_enabled ?? true) && user?.email) channels.push('email');
    if (pref?.push_enabled && endpoints.length > 0) {
      if (isQuietTime(clock, pref.quiet_start ?? '22:00', pref.quiet_end ?? '08:00')) summary.skippedQuietHours += 1;
      else channels.push('push');
    }

    for (const channel of channels) {
      const claimed = await store.claim(reminders.map((r) => ({
        user_id: userId, subscription_id: r.subscriptionId, kind: r.kind, due_on: r.dueOn, lead_days: r.leadDays, channel,
      })));
      if (claimed.length === 0) continue; // already delivered by an earlier run
      const claimedKeys = new Set(claimed.map((c) => `${c.subscription_id}|${c.kind}|${c.due_on}|${c.lead_days}`));
      const toSend = reminders.filter((r) => claimedKeys.has(`${r.subscriptionId}|${r.kind}|${r.dueOn}|${r.leadDays}`));
      const ids = claimed.map((c) => c.id);

      try {
        if (channel === 'email') {
          const mail = renewalDigestEmail(user!.name, toSend);
          await deps.sendEmail({ to: user!.email!, ...mail, idempotencyKey: `renewals-${userId}-${today}` });
          summary.emailsSent += 1;
        } else {
          const message: PushMessage = toSend.length === 1
            ? { title: toSend[0].title, body: toSend[0].body, url: '/app/money/subscriptions', tag: `renewals-${today}` }
            : { title: `${toSend.length} subscriptions renew soon`, body: toSend.map((r) => r.title).join(' · '), url: '/app/money/subscriptions', tag: `renewals-${today}` };
          let delivered = 0;
          let lastError = '';
          for (const ep of endpoints) {
            try {
              await deps.sendPush(ep, message);
              delivered += 1;
              await store.touchPushSubscription(ep.endpoint);
            } catch (err: any) {
              lastError = err?.message || String(err);
              if (err?.statusCode === 404 || err?.statusCode === 410) await store.deletePushSubscription(ep.endpoint);
            }
          }
          if (delivered === 0) throw new Error(lastError || 'No push endpoint accepted the message');
          summary.pushSent += 1;
        }
        await store.markDeliveries(ids, 'sent');
      } catch (err: any) {
        const message = err?.message || String(err);
        summary.failures.push({ userId, channel, error: message });
        await store.markDeliveries(ids, 'failed', message.slice(0, 500));
      }
    }
  }

  return summary;
}

/** Supabase-backed store (service role). */
export function supabaseReminderStore(db: any): ReminderStore {
  const must = <T>(res: { data: T; error: any }, what: string): T => {
    if (res.error) throw new Error(`${what}: ${res.error.message}`);
    return res.data;
  };
  return {
    async dueSubscriptions(horizon) {
      const out: Record<string, any>[] = [];
      for (let from = 0; ; from += 1000) {
        const page = must(await db.from('subscriptions')
          .select('*')
          .eq('status', 'active')
          .or(`next_billing_on.lte.${horizon},trial_ends_on.lte.${horizon}`)
          .order('id')
          .range(from, from + 999), 'load subscriptions') as any[];
        out.push(...page);
        if (page.length < 1000) break;
      }
      return out;
    },
    async setNextBillingOn(id, date) {
      must(await db.from('subscriptions').update({ next_billing_on: date, next_billing_date: date }).eq('id', id), 'roll subscription');
    },
    async users(ids) {
      return must(await db.from('users').select('id, email, name').in('id', ids), 'load users') ?? [];
    },
    async preferences(ids) {
      const res = await db.from('notification_preferences').select('*').in('user_id', ids);
      return res.error ? [] : res.data ?? [];
    },
    async pushSubscriptions(ids) {
      const res = await db.from('push_subscriptions').select('id, user_id, endpoint, p256dh, auth').in('user_id', ids);
      return res.error ? [] : res.data ?? [];
    },
    async claim(rows) {
      if (rows.length === 0) return [];
      return must(await db.from('reminder_deliveries')
        .upsert(rows, { onConflict: 'subscription_id,kind,due_on,lead_days,channel', ignoreDuplicates: true })
        .select('id, user_id, subscription_id, kind, due_on, lead_days, channel'), 'claim reminders') ?? [];
    },
    async markDeliveries(ids, status, error) {
      if (ids.length === 0) return;
      must(await db.from('reminder_deliveries')
        .update({ status, error: error ?? null, sent_at: status === 'sent' ? new Date().toISOString() : null })
        .in('id', ids), 'mark deliveries');
    },
    async deletePushSubscription(endpoint) {
      await db.from('push_subscriptions').delete().eq('endpoint', endpoint);
    },
    async touchPushSubscription(endpoint) {
      await db.from('push_subscriptions').update({ last_success_at: new Date().toISOString() }).eq('endpoint', endpoint);
    },
  };
}
