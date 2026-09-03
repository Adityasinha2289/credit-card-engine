import handler from '../affiliate/conversion';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
const mockSingle = vi.fn();
const mockMaybeSingle = vi.fn();
const mockUpdateEq = vi.fn();
const mockUpdate = vi.fn(() => ({ eq: mockUpdateEq }));
const mockInsertSelect = vi.fn(() => ({ single: mockSingle }));
const mockInsert = vi.fn(() => ({ select: mockInsertSelect }));
const mockEq = vi.fn(() => ({ single: mockSingle, maybeSingle: mockMaybeSingle }));
const mockSelect = vi.fn(() => ({ eq: mockEq }));

vi.mock('../admin/_utils/supabaseAdmin', () => ({
  supabaseAdmin: {
    from: vi.fn(() => ({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
    }))
  }
}));

const mockReq = (bodyStr: string, headers: any = {}) => {
  const req = {
    method: 'POST',
    headers,
    on: vi.fn((event, callback) => {
      if (event === 'data') {
        callback(Buffer.from(bodyStr));
      }
      if (event === 'end') {
        callback();
      }
    })
  } as unknown as VercelRequest;
  return req;
};

const mockRes = () => {
  const res = {} as VercelResponse;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

describe('Affiliate Webhook Security', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.AFFILIATE_WEBHOOK_SECRET = 'test-secret-123';
    
    mockSingle.mockResolvedValue({ data: { id: 'track-1', partner_id: 'partner-1' }, error: null });
    mockMaybeSingle.mockResolvedValue({ data: null, error: null });
  });

  const generateSignature = (bodyStr: string, secret: string = 'test-secret-123') => {
    return crypto.createHmac('sha256', secret).update(bodyStr).digest('hex');
  };

  const validBody = JSON.stringify({
    click_id: 'track-1',
    transaction_id: 'tx-123',
    order_value: 100,
    currency: 'INR',
    status: 'confirmed',
    occurred_at: new Date().toISOString(),
    partner_identity: 'partner-1'
  });

  it('fails closed when missing secret', async () => {
    delete process.env.AFFILIATE_WEBHOOK_SECRET;
    const req = mockReq(validBody, { 'x-affiliate-signature': 'any' });
    const res = mockRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('rejects missing signature', async () => {
    const req = mockReq(validBody, {});
    const res = mockRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('rejects invalid signature', async () => {
    const req = mockReq(validBody, { 'x-affiliate-signature': 'invalid-sig' });
    const res = mockRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('rejects modified body (signature mismatch)', async () => {
    const originalSig = generateSignature(validBody);
    const modifiedBody = validBody.replace('100', '1000');
    const req = mockReq(modifiedBody, { 'x-affiliate-signature': originalSig });
    const res = mockRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('rejects malformed payload', async () => {
    const malformed = JSON.stringify({ click_id: 'track-1' });
    const sig = generateSignature(malformed);
    const req = mockReq(malformed, { 'x-affiliate-signature': sig });
    const res = mockRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('handles duplicate events idempotently without duplication', async () => {
    const sig = generateSignature(validBody);
    const req = mockReq(validBody, { 'x-affiliate-signature': sig });
    const res = mockRes();
    
    // Simulate finding existing conversion
    mockMaybeSingle.mockResolvedValueOnce({
      data: { id: 'conv-1', status: 'confirmed', partner_id: 'partner-1' }
    });

    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(mockInsert).not.toHaveBeenCalled();
    expect(mockUpdate).not.toHaveBeenCalled(); // Status didn't change
  });

  it('rejects cross-tenant manipulation', async () => {
    const sig = generateSignature(validBody);
    const req = mockReq(validBody, { 'x-affiliate-signature': sig });
    const res = mockRes();
    
    // Simulate finding existing conversion owned by someone else
    mockMaybeSingle.mockResolvedValueOnce({
      data: { id: 'conv-1', status: 'pending', partner_id: 'partner-2' }
    });

    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Transaction belongs to a different partner' }));
  });
});
