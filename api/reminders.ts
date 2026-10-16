/**
 * /api/reminders — subscription reminders (one function to stay within the
 * Vercel plan's function limit).
 *
 *   GET  (Vercel cron, Authorization: Bearer $CRON_SECRET)  → run the daily job
 *        ?dryRun=1                                           → plan only, send nothing
 *   GET  ?action=config                                      → { vapidPublicKey } (public)
 *   POST ?action=push-subscribe    (Clerk bearer token)      → save a Web Push endpoint
 *   POST ?action=push-unsubscribe  (Clerk bearer token)      → remove it
 *   POST ?action=test-push         (Clerk bearer token)      → send yourself a test push
 *
 * Env: CRON_SECRET, SUPABASE_SERVICE_ROLE_KEY, VITE_SUPABASE_URL|SUPABASE_URL,
 *      RESEND_API_KEY, RESEND_FROM, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY,
 *      VAPID_SUBJECT (mailto: or https: contact), CLERK_SECRET_KEY.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';
import { timingSafeEqual } from 'node:crypto';
import { ClerkAuth } from '../src/features/recommendation/api/auth';
import { sendEmail } from './_lib/email';
import { runReminderJob, supabaseReminderStore, type PushMessage, type PushSubRow } from './_lib/reminderJob';

const auth = new ClerkAuth();
const testPushLimiter = new Map<string, number>();

function admin() {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Database configuration error');
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function pushConfigured(): boolean {
  return !!(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);
}

function sendPush(sub: PushSubRow, message: PushMessage) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:support@renocred.com',
    process.env.VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  );
  return webpush.sendNotification(
    { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
    JSON.stringify(message),
    { TTL: 12 * 3600, urgency: 'normal', topic: message.tag.slice(0, 32).replace(/[^A-Za-z0-9_-]/g, '-') },
  );
}

function isCron(req: VercelRequest): boolean {
  const secret = process.env.CRON_SECRET;
  const header = req.headers.authorization || '';
  if (!secret) return false;
  const expected = Buffer.from(`Bearer ${secret}`);
  const got = Buffer.from(header);
  return got.length === expected.length && timingSafeEqual(got, expected);
}

function validPushSubscription(body: any): body is { endpoint: string; keys: { p256dh: string; auth: string } } {
  try {
    const url = new URL(body?.endpoint);
    return url.protocol === 'https:' && typeof body?.keys?.p256dh === 'string' && typeof body?.keys?.auth === 'string'
      && body.keys.p256dh.length < 200 && body.keys.auth.length < 100 && body.endpoint.length < 1000;
  } catch {
    return false;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const action = String(req.query.action || '');

  try {
    // ── public config ───────────────────────────────────────────────────────
    if (req.method === 'GET' && action === 'config') {
      res.setHeader('Cache-Control', 'public, max-age=3600');
      return res.status(200).json({ vapidPublicKey: pushConfigured() ? process.env.VAPID_PUBLIC_KEY : null });
    }

    // ── daily job (Vercel cron) ─────────────────────────────────────────────
    if (req.method === 'GET') {
      if (!isCron(req)) return res.status(401).json({ error: 'Unauthorized' });
      const summary = await runReminderJob({
        store: supabaseReminderStore(admin()),
        sendEmail,
        sendPush: (sub, msg) => {
          if (!pushConfigured()) return Promise.reject(new Error('Push not configured (VAPID keys missing)'));
          return sendPush(sub, msg);
        },
        dryRun: req.query.dryRun === '1',
      });
      console.log('[reminders] run', JSON.stringify({ ...summary, plan: undefined }));
      return res.status(200).json(summary);
    }

    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    // ── user actions ────────────────────────────────────────────────────────
    const who = await auth.verifyToken(req.headers.authorization);
    if (!who.authenticated || !who.userId) return res.status(401).json({ error: 'Unauthorized' });
    const userId = who.userId;
    const db = admin();
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});

    if (action === 'push-subscribe') {
      if (!pushConfigured()) return res.status(503).json({ error: 'Push notifications are not configured' });
      const sub = body.subscription;
      if (!validPushSubscription(sub)) return res.status(400).json({ error: 'Invalid push subscription' });
      const { error } = await db.from('push_subscriptions').upsert({
        user_id: userId,
        endpoint: sub.endpoint,
        p256dh: sub.keys.p256dh,
        auth: sub.keys.auth,
        user_agent: String(req.headers['user-agent'] || '').slice(0, 300),
      }, { onConflict: 'endpoint' });
      if (error) throw new Error(error.message);
      await db.from('notification_preferences').upsert({ user_id: userId, push_enabled: true }, { onConflict: 'user_id' });
      return res.status(200).json({ ok: true });
    }

    if (action === 'push-unsubscribe') {
      const endpoint = String(body.endpoint || '');
      if (!endpoint) return res.status(400).json({ error: 'Missing endpoint' });
      await db.from('push_subscriptions').delete().eq('endpoint', endpoint).eq('user_id', userId);
      const { count } = await db.from('push_subscriptions').select('id', { count: 'exact', head: true }).eq('user_id', userId);
      if (!count) await db.from('notification_preferences').upsert({ user_id: userId, push_enabled: false }, { onConflict: 'user_id' });
      return res.status(200).json({ ok: true });
    }

    if (action === 'test-push') {
      if (!pushConfigured()) return res.status(503).json({ error: 'Push notifications are not configured' });
      const last = testPushLimiter.get(userId) ?? 0;
      if (Date.now() - last < 30_000) return res.status(429).json({ error: 'Try again in a few seconds' });
      testPushLimiter.set(userId, Date.now());
      const { data: subs } = await db.from('push_subscriptions').select('id, user_id, endpoint, p256dh, auth').eq('user_id', userId);
      let sent = 0;
      for (const s of (subs || []) as PushSubRow[]) {
        try {
          await sendPush(s, { title: 'Reminders are on ✓', body: "We'll nudge you before subscriptions renew.", url: '/app/money/subscriptions', tag: 'test' });
          sent += 1;
        } catch (err: any) {
          if (err?.statusCode === 404 || err?.statusCode === 410) await db.from('push_subscriptions').delete().eq('endpoint', s.endpoint);
        }
      }
      return res.status(200).json({ ok: sent > 0, sent });
    }

    return res.status(400).json({ error: 'Unknown action' });
  } catch (err: any) {
    console.error('[reminders] error', err?.message || err);
    return res.status(500).json({ error: 'Reminder service error' });
  }
}
