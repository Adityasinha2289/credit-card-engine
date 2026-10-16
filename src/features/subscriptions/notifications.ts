/**
 * Browser side of subscription reminders: notification preferences (Supabase,
 * RLS-scoped) and Web Push opt-in (service worker + /api/reminders).
 */
import type { SupabaseClient } from '@supabase/supabase-js';

export interface ReminderPrefs {
  emailEnabled: boolean;
  pushEnabled: boolean;
  inAppEnabled: boolean;
  defaultReminderDays: number[];
}

export const DEFAULT_PREFS: ReminderPrefs = {
  emailEnabled: true,
  pushEnabled: false,
  inAppEnabled: true,
  defaultReminderDays: [3, 1],
};

/** Returns defaults when the table isn't deployed yet or the user has no row. */
export async function loadPrefs(client: SupabaseClient<any> | null, userId: string): Promise<ReminderPrefs> {
  if (!client) return DEFAULT_PREFS;
  const { data, error } = await (client as any).from('notification_preferences').select('*').eq('user_id', userId).maybeSingle();
  if (error || !data) return DEFAULT_PREFS;
  return {
    emailEnabled: data.email_enabled ?? true,
    pushEnabled: data.push_enabled ?? false,
    inAppEnabled: data.in_app_enabled ?? true,
    defaultReminderDays: data.default_reminder_days?.length ? data.default_reminder_days : DEFAULT_PREFS.defaultReminderDays,
  };
}

export async function savePrefs(client: SupabaseClient<any> | null, userId: string, prefs: Partial<ReminderPrefs>): Promise<boolean> {
  if (!client) return false;
  const row: Record<string, unknown> = { user_id: userId };
  if (prefs.emailEnabled !== undefined) row.email_enabled = prefs.emailEnabled;
  if (prefs.pushEnabled !== undefined) row.push_enabled = prefs.pushEnabled;
  if (prefs.inAppEnabled !== undefined) row.in_app_enabled = prefs.inAppEnabled;
  if (prefs.defaultReminderDays !== undefined) row.default_reminder_days = prefs.defaultReminderDays;
  const { error } = await (client as any).from('notification_preferences').upsert(row, { onConflict: 'user_id' });
  return !error;
}

// ─────────────────────────────────────────────────────────────────────────────
//  Web Push
// ─────────────────────────────────────────────────────────────────────────────

export type PushSupport =
  | { supported: true }
  | { supported: false; reason: 'no-browser-support' | 'ios-needs-install' | 'not-configured' | 'denied' };

function isIos(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isStandalone(): boolean {
  return window.matchMedia?.('(display-mode: standalone)').matches || (navigator as any).standalone === true;
}

let vapidKeyPromise: Promise<string | null> | null = null;
export function getVapidPublicKey(): Promise<string | null> {
  const fromEnv = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined;
  if (fromEnv) return Promise.resolve(fromEnv);
  vapidKeyPromise ??= fetch('/api/reminders?action=config')
    .then((r) => (r.ok ? r.json() : null))
    .then((j) => j?.vapidPublicKey ?? null)
    .catch(() => null);
  return vapidKeyPromise;
}

export async function pushSupport(): Promise<PushSupport> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
    return { supported: false, reason: isIos() && !isStandalone() ? 'ios-needs-install' : 'no-browser-support' };
  }
  if (Notification.permission === 'denied') return { supported: false, reason: 'denied' };
  if (!(await getVapidPublicKey())) return { supported: false, reason: 'not-configured' };
  return { supported: true };
}

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

async function registration(): Promise<ServiceWorkerRegistration> {
  const existing = await navigator.serviceWorker.getRegistration('/');
  return existing ?? navigator.serviceWorker.register('/sw.js', { scope: '/' });
}

export async function currentPushSubscription(): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator)) return null;
  const reg = await navigator.serviceWorker.getRegistration('/');
  return reg ? reg.pushManager.getSubscription() : null;
}

/** Ask permission, subscribe this browser and register it with the server. */
export async function enablePush(getToken: () => Promise<string | null>): Promise<{ ok: true } | { ok: false; error: string }> {
  const support = await pushSupport();
  if (!support.supported) return { ok: false, error: support.reason };
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return { ok: false, error: 'denied' };

  const key = await getVapidPublicKey();
  const reg = await registration();
  await navigator.serviceWorker.ready;
  const sub = (await reg.pushManager.getSubscription())
    ?? (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(key!) as BufferSource }));

  const token = await getToken();
  const res = await fetch('/api/reminders?action=push-subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify({ subscription: sub.toJSON() }),
  });
  if (!res.ok) return { ok: false, error: (await res.json().catch(() => ({})))?.error || `HTTP ${res.status}` };
  return { ok: true };
}

export async function disablePush(getToken: () => Promise<string | null>): Promise<void> {
  const sub = await currentPushSubscription();
  if (!sub) return;
  const token = await getToken();
  await fetch('/api/reminders?action=push-unsubscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify({ endpoint: sub.endpoint }),
  }).catch(() => undefined);
  await sub.unsubscribe().catch(() => undefined);
}

export async function sendTestPush(getToken: () => Promise<string | null>): Promise<boolean> {
  const token = await getToken();
  const res = await fetch('/api/reminders?action=test-push', {
    method: 'POST',
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  return res.ok && (await res.json().catch(() => ({})))?.ok === true;
}
