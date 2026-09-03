import handler from '../taqdeer';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';

vi.mock('../../src/features/recommendation/api/auth', () => {
  return {
    ClerkAuth: class {
      verifyToken = vi.fn(async (token) => {
        if (token === 'Bearer valid-token') return { authenticated: true, userId: 'user-id' };
        return { authenticated: false, error: 'Invalid token' };
      });
    }
  };
});

const mockReq = (body: any, headers = {}) => {
  return {
    method: 'POST',
    body,
    headers
  } as unknown as VercelRequest;
};

const mockRes = () => {
  const res = {} as VercelResponse;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

describe('Taqdeer API Proxy Security', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GEMINI_API_KEY = 'test-gemini-key';
  });

  it('rejects invalid authentication', async () => {
    const req = mockReq({ query: 'hello' }, { authorization: 'Bearer invalid' });
    const res = mockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Invalid token' }));
  });

  it('fails safely if GEMINI_API_KEY is missing', async () => {
    delete process.env.GEMINI_API_KEY;
    const req = mockReq({ query: 'hello' });
    const res = mockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'AI Backend offline due to missing configuration' }));
  });
});
