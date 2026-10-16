import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { runReminderJob, type ReminderStore, type ClaimRow, type ClaimedRow, type PushSubRow } from '../_lib/reminderJob';

// ── In-memory store mirroring the reminder_deliveries UNIQUE constraint ─────
function fakeStore(seed: {
  subs: Record<string, any>[];
  users?: { id: string; email: string | null; name: string | null }[];
  prefs?: any[];
  push?: PushSubRow[];
}) {
  const deliveries: (ClaimedRow & { status: string })[] = [];
  const push = [...(seed.push ?? [])];
  const store: ReminderStore & { deliveries: typeof deliveries; push: PushSubRow[]; rolled: Record<string, string> } = {
    deliveries,
    push,
    rolled: {},
    async dueSubscriptions() { return seed.subs; },
    async setNextBillingOn(id, date) { this.rolled[id] = date; },
    async users(ids) { return (seed.users ?? []).filter((u) => ids.includes(u.id)); },
    async preferences(ids) { return (seed.prefs ?? []).filter((p) => ids.includes(p.user_id)); },
    async pushSubscriptions(ids) { return push.filter((p) => ids.includes(p.user_id)); },
    async claim(rows: ClaimRow[]) {
      const inserted: ClaimedRow[] = [];
      for (const r of rows) {
        const dup = deliveries.some((d) => d.subscription_id === r.subscription_id && d.kind === r.kind && d.due_on === r.due_on && d.lead_days === r.lead_days && d.channel === r.channel);
        if (dup) continue;
        const row = { ...r, id: deliveries.length + 1, status: 'claimed' };
        deliveries.push(row);
        inserted.push(row);
      }
      return inserted;
    },
    async markDeliveries(ids, status) { deliveries.filter((d) => ids.includes(d.id)).forEach((d) => { d.status = status; }); },
    async deletePushSubscription(endpoint) { const i = push.findIndex((p) => p.endpoint === endpoint); if (i >= 0) push.splice(i, 1); },
    async touchPushSubscription() {},
  };
  return store;
}

const NOW = new Date('2026-10-16T03:30:00Z'); // 09:00 IST
const row = (p: Record<string, any>) => ({
  id: 's1', user_id: 'u1', name: 'Netflix', amount: 64900, billing_cycle: 'monthly',
  next_billing_on: '2026-10-19', status: 'active', card_id: null, category: 'entertainment',
  has_price_hike: false, is_free_trial: false, reminder_days: [3, 1], ...p,
});
const users = [{ id: 'u1', email: 'u1@example.com', name: 'Asha' }];

describe('runReminderJob', () => {
  let sendEmail: ReturnType<typeof vi.fn>;
  let sendPush: ReturnType<typeof vi.fn>;
  beforeEach(() => {
    sendEmail = vi.fn().mockResolvedValue('email-id');
    sendPush = vi.fn().mockResolvedValue({ statusCode: 201 });
  });

  it('emails a digest for reminders due today', async () => {
    const store = fakeStore({ subs: [row({}), row({ id: 's2', name: 'Spotify', amount: 11900, next_billing_on: '2026-10-17', reminder_days: [1] })], users });
    const s = await runReminderJob({ store, sendEmail, sendPush, now: NOW });
    expect(s.remindersPlanned).toBe(2);
    expect(s.emailsSent).toBe(1);
    expect(sendEmail).toHaveBeenCalledTimes(1);
    const mail = sendEmail.mock.calls[0][0];
    expect(mail.to).toBe('u1@example.com');
    expect(mail.subject).toBe('2 subscriptions renewing soon');
    expect(mail.html).toContain('Spotify renews tomorrow');
    expect(store.deliveries.every((d) => d.status === 'sent')).toBe(true);
  });

  it('is idempotent: a second run the same day sends nothing', async () => {
    const store = fakeStore({ subs: [row({})], users });
    await runReminderJob({ store, sendEmail, sendPush, now: NOW });
    const second = await runReminderJob({ store, sendEmail, sendPush, now: NOW });
    expect(sendEmail).toHaveBeenCalledTimes(1);
    expect(second.emailsSent).toBe(0);
  });

  it('rolls stale next-billing dates forward and persists them', async () => {
    const store = fakeStore({ subs: [row({ next_billing_on: '2026-09-19' })], users });
    const s = await runReminderJob({ store, sendEmail, sendPush, now: NOW });
    expect(s.rolledForward).toBe(1);
    expect(store.rolled.s1).toBe('2026-10-19');
    expect(s.emailsSent).toBe(1); // 3 days before the rolled date
  });

  it('sends push when enabled, outside quiet hours, and removes dead endpoints', async () => {
    const push: PushSubRow[] = [
      { id: 'p1', user_id: 'u1', endpoint: 'https://push.example/dead', p256dh: 'k', auth: 'a' },
      { id: 'p2', user_id: 'u1', endpoint: 'https://push.example/live', p256dh: 'k', auth: 'a' },
    ];
    sendPush.mockImplementation(async (sub: PushSubRow) => {
      if (sub.endpoint.endsWith('dead')) throw Object.assign(new Error('Gone'), { statusCode: 410 });
      return { statusCode: 201 };
    });
    const store = fakeStore({
      subs: [row({})], users, push,
      prefs: [{ user_id: 'u1', email_enabled: false, push_enabled: true, default_reminder_days: [3, 1], quiet_start: '22:00', quiet_end: '08:00' }],
    });
    const s = await runReminderJob({ store, sendEmail, sendPush, now: NOW });
    expect(s.pushSent).toBe(1);
    expect(sendEmail).not.toHaveBeenCalled();
    expect(store.push.map((p) => p.endpoint)).toEqual(['https://push.example/live']);
    expect(sendPush.mock.calls[0][1].title).toBe('Netflix renews in 3 days');
  });

  it('holds push during quiet hours without claiming it', async () => {
    const store = fakeStore({
      subs: [row({})], users,
      push: [{ id: 'p', user_id: 'u1', endpoint: 'https://push.example/x', p256dh: 'k', auth: 'a' }],
      prefs: [{ user_id: 'u1', email_enabled: false, push_enabled: true, default_reminder_days: null, quiet_start: '08:00', quiet_end: '10:00' }],
    });
    const s = await runReminderJob({ store, sendEmail, sendPush, now: NOW });
    expect(s.skippedQuietHours).toBe(1);
    expect(sendPush).not.toHaveBeenCalled();
    expect(store.deliveries).toHaveLength(0);
  });

  it('records a failed send and does not throw', async () => {
    sendEmail.mockRejectedValue(new Error('Resend down'));
    const store = fakeStore({ subs: [row({})], users });
    const s = await runReminderJob({ store, sendEmail, sendPush, now: NOW });
    expect(s.failures).toEqual([{ userId: 'u1', channel: 'email', error: 'Resend down' }]);
    expect(store.deliveries[0].status).toBe('failed');
  });

  it('dry run plans without claiming or sending', async () => {
    const store = fakeStore({ subs: [row({ next_billing_on: '2026-09-19' })], users });
    const s = await runReminderJob({ store, sendEmail, sendPush, now: NOW, dryRun: true });
    expect(s.plan?.[0].reminders[0].kind).toBe('renewal');
    expect(store.deliveries).toHaveLength(0);
    expect(store.rolled).toEqual({});
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it('escapes user-controlled names in email HTML', async () => {
    const store = fakeStore({ subs: [row({ name: '<img src=x onerror=alert(1)>' })], users });
    await runReminderJob({ store, sendEmail, sendPush, now: NOW });
    expect(sendEmail.mock.calls[0][0].html).not.toContain('<img src=x');
  });
});

// ── HTTP handler auth ───────────────────────────────────────────────────────
vi.mock('../../src/features/recommendation/api/auth', () => ({
  ClerkAuth: class {
    verifyToken = vi.fn(async (h?: string) => (h === 'Bearer user-token' ? { authenticated: true, userId: 'u1' } : { authenticated: false }));
  },
}));

const mockRes = () => {
  const res = {} as VercelResponse;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.setHeader = vi.fn().mockReturnValue(res);
  return res;
};
const req = (p: Partial<VercelRequest>) => ({ method: 'GET', query: {}, headers: {}, body: {}, ...p } as VercelRequest);

describe('/api/reminders handler', () => {
  beforeEach(() => {
    process.env.CRON_SECRET = 'cron-secret';
    delete process.env.VAPID_PUBLIC_KEY;
    delete process.env.VAPID_PRIVATE_KEY;
  });

  it('rejects the cron run without the secret', async () => {
    const { default: handler } = await import('../reminders');
    const res = mockRes();
    await handler(req({ headers: { authorization: 'Bearer wrong' } }), res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('rejects user actions without a Clerk session', async () => {
    const { default: handler } = await import('../reminders');
    const res = mockRes();
    await handler(req({ method: 'POST', query: { action: 'push-subscribe' } }), res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('reports push as unavailable when VAPID keys are missing', async () => {
    const { default: handler } = await import('../reminders');
    const res = mockRes();
    await handler(req({ query: { action: 'config' } }), res);
    expect(res.json).toHaveBeenCalledWith({ vapidPublicKey: null });
  });
});
