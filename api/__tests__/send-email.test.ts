process.env.RESEND_API_KEY = 'test-resend';
process.env.INTERNAL_API_KEY = 'secret-internal-key';
process.env.VITE_SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';

import handler from '../send-email';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const { mockSend } = vi.hoisted(() => ({
  mockSend: vi.fn().mockResolvedValue({ id: 'test-id' })
}));

vi.mock('resend', () => ({
  Resend: class {
    emails = { send: mockSend };
  }
}));

vi.mock('../../src/features/recommendation/api/auth', () => ({
  ClerkAuth: class {
    verifyToken = vi.fn(async (token) => {
      if (token === 'Bearer valid-clerk-token') return { authenticated: true, userId: 'user-1' };
      return { authenticated: false, error: 'Invalid token' };
    });
  }
}));

vi.mock('@supabase/supabase-js', () => {
  return {
    createClient: vi.fn(() => ({
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(async () => {
              return { data: { email: 'user@example.com' }, error: null };
            })
          }))
        }))
      }))
    }))
  };
});

const mockReq = (body: any, headers: any = {}) => ({
  method: 'POST',
  body,
  headers
} as unknown as VercelRequest);

const mockRes = () => {
  const res = {} as VercelResponse;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

describe('Send Email API Security', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.RESEND_API_KEY = 'test-resend';
    process.env.INTERNAL_API_KEY = 'secret-internal-key';
    process.env.VITE_SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
  });

  it('rejects unauthenticated request', async () => {
    const req = mockReq({ template: 'welcome' });
    const res = mockRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('rejects invalid template', async () => {
    const req = mockReq({ template: 'hack' }, { authorization: 'Bearer secret-internal-key' });
    const res = mockRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('allows internal system request and uses provided to field', async () => {
    const req = mockReq({ template: 'welcome', to: 'target@example.com' }, { authorization: 'Bearer secret-internal-key' });
    const res = mockRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({
      to: ['target@example.com']
    }));
  });

  it('allows valid clerk user and forces their email', async () => {
    const req = mockReq({ template: 'welcome', to: 'attacker@example.com' }, { authorization: 'Bearer valid-clerk-token' });
    const res = mockRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({
      to: ['user@example.com']
    }));
  });
});
