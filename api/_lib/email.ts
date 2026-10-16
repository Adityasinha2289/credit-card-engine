/**
 * Shared Resend helper for server functions.
 *
 * Files under api/_lib are not deployed as their own functions (leading
 * underscore), so this does not count against the Vercel function limit.
 */
import { Resend } from 'resend';

/** Sender must be on a domain verified in Resend; the sandbox sender only delivers to the account owner. */
export const EMAIL_FROM = process.env.RESEND_FROM || 'RenoCred <onboarding@resend.dev>';

export const APP_URL = (process.env.APP_URL || process.env.VITE_APP_URL || 'https://renocred.com').replace(/\/$/, '');

let client: Resend | null = null;
function resend(): Resend {
  if (!process.env.RESEND_API_KEY) throw new Error('Email service not configured (RESEND_API_KEY)');
  if (!client) client = new Resend(process.env.RESEND_API_KEY);
  return client;
}

export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function sendEmail(input: { to: string; subject: string; html: string; text?: string; idempotencyKey?: string }) {
  const payload = {
    from: EMAIL_FROM,
    to: [input.to],
    subject: input.subject,
    html: input.html,
    ...(input.text ? { text: input.text } : {}),
  };
  const result = input.idempotencyKey
    ? await resend().emails.send(payload, { idempotencyKey: input.idempotencyKey })
    : await resend().emails.send(payload);
  if ((result as any)?.error) {
    throw new Error((result as any).error.message || 'Resend error');
  }
  return (result as any)?.data?.id as string | undefined;
}

export const TEMPLATES: Record<string, (data: any) => { subject: string; html: string }> = {
  welcome: (data) => ({
    subject: `Welcome to RenoCred, ${data.name || 'there'}!`,
    html: `<h1>Welcome to RenoCred, ${escapeHtml(data.name || 'there')}!</h1><p>We are excited to help you maximize your credit card rewards.</p>`,
  }),
  alert: (data) => ({
    subject: `RenoCred Alert: ${data.title || 'Notification'}`,
    html: `<h2>RenoCred Alert</h2><p>${escapeHtml(data.message || 'You have a new notification.')}</p>`,
  }),
};

export interface DigestItem {
  title: string;
  body: string;
  cancelUrl?: string;
}

/** One email per user per day, listing every reminder due today. */
export function renewalDigestEmail(name: string | null | undefined, items: DigestItem[]) {
  const first = items[0];
  const subject = items.length === 1 ? first.title : `${items.length} subscriptions renewing soon`;
  const rows = items
    .map((i) => `
      <tr><td style="padding:14px 0;border-bottom:1px solid #eee">
        <div style="font-weight:600;color:#111">${escapeHtml(i.title)}</div>
        <div style="color:#555;margin-top:4px">${escapeHtml(i.body)}</div>
        ${i.cancelUrl ? `<a href="${escapeHtml(i.cancelUrl)}" style="display:inline-block;margin-top:6px;color:#0a7c4a">Manage or cancel →</a>` : ''}
      </td></tr>`)
    .join('');
  const html = `
  <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#111">
    <p style="margin:0 0 4px;color:#0a7c4a;font-weight:700;letter-spacing:.08em;font-size:12px">RENOCRED · SUBSCRIPTIONS</p>
    <h2 style="margin:0 0 16px">Hi ${escapeHtml(name || 'there')}, heads-up on upcoming charges</h2>
    <table style="width:100%;border-collapse:collapse">${rows}</table>
    <p style="margin-top:20px"><a href="${APP_URL}/app/money/subscriptions" style="background:#111;color:#fff;padding:10px 16px;border-radius:999px;text-decoration:none">Review subscriptions</a></p>
    <p style="color:#888;font-size:12px;margin-top:24px">You get these because reminders are on for your subscriptions. Change it any time in RenoCred → Money → Subscriptions.</p>
  </div>`;
  const text = items.map((i) => `${i.title}\n${i.body}${i.cancelUrl ? `\nManage: ${i.cancelUrl}` : ''}`).join('\n\n')
    + `\n\nReview: ${APP_URL}/app/money/subscriptions`;
  return { subject, html, text };
}
