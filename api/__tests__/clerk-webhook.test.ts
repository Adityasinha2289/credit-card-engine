import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Readable } from 'node:stream';
import { Webhook } from 'svix';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const { SECRET } = vi.hoisted(() => {
  const SECRET = 'whsec_' + Buffer.from('test-secret-test-secret-123456').toString('base64');
  process.env.CLERK_WEBHOOK_SECRET = SECRET;
  process.env.VITE_SUPABASE_URL = 'https://test.supabase.co';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'service';
  return { SECRET };
});

const calls: { table: string; op: string; payload?: any }[] = [];
let failUserWrite = false;

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: (table: string) => {
      const result = (op: string, payload?: any) => {
        calls.push({ table, op, payload });
        const error = failUserWrite && table === 'users' ? { message: 'db down' } : null;
        const chain: any = Promise.resolve({ data: null, error });
        chain.eq = () => chain;
        chain.select = () => chain;
        chain.maybeSingle = () => Promise.resolve({ data: null, error: null });
        return chain;
      };
      return {
        select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null, error: null }) }) }),
        upsert: (p: any) => result('upsert', p),
        update: (p: any) => result('update', p),
        insert: (p: any) => result('insert', p),
      };
    },
  }),
}));

import handler from '../clerk-webhook';

function signedRequest(body: string): VercelRequest {
  const wh = new Webhook(SECRET);
  const id = 'msg_1';
  const ts = new Date();
  const signature = wh.sign(id, ts, body);
  const stream = Readable.from([Buffer.from(body)]) as any;
  stream.method = 'POST';
  stream.headers = { 'svix-id': id, 'svix-timestamp': String(Math.floor(ts.getTime() / 1000)), 'svix-signature': signature };
  return stream as VercelRequest;
}

const mockRes = () => {
  const res = {} as VercelResponse;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

// Key order and spacing that JSON.stringify(JSON.parse(x)) would NOT reproduce.
const BODY = '{"type":"user.created",  "data":{"id":"user_1","first_name":"Asha","email_addresses":[{"id":"e1","email_address":"a@x.com"}],"primary_email_address_id":"e1"}}';

describe('clerk webhook', () => {
  beforeEach(() => { calls.length = 0; failUserWrite = false; });

  it('verifies the raw body bytes (re-serialised JSON would fail)', async () => {
    const res = mockRes();
    await handler(signedRequest(BODY), res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(calls.find((c) => c.table === 'users')?.payload).toMatchObject({ id: 'user_1', email: 'a@x.com' });
  });

  it('rejects a tampered body', async () => {
    const req = signedRequest(BODY);
    const tampered = Readable.from([Buffer.from(BODY.replace('Asha', 'Eve'))]) as any;
    Object.assign(tampered, { method: 'POST', headers: (req as any).headers });
    const res = mockRes();
    await handler(tampered, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('does not mark the event processed when the user write fails (so Svix retries)', async () => {
    failUserWrite = true;
    const res = mockRes();
    await handler(signedRequest(BODY), res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(calls.some((c) => c.table === 'processed_webhook_events')).toBe(false);
  });
});
