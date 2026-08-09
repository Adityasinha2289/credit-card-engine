import handler from '../affiliate/conversion';
import { supabase } from '../../src/lib/supabase';
import { CommissionCalculator } from '../../src/features/commerce/services/CommissionCalculator';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import crypto from 'crypto';

// Mock dependencies
vi.mock('../../src/lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis()
  }
}));

vi.mock('../../src/features/commerce/services/CommissionCalculator', () => ({
  CommissionCalculator: {
    calculateExpectedCommission: vi.fn().mockReturnValue(500)
  }
}));

process.env.AFFILIATE_WEBHOOK_SECRET = 'test-secret';

const generateSignature = (body: any) => {
  return crypto.createHmac('sha256', 'test-secret').update(JSON.stringify(body)).digest('hex');
};

const mockReq = (body: any, headers: Record<string, string> = {}) => {
  return {
    method: 'POST',
    body,
    headers: {
      'x-affiliate-signature': generateSignature(body),
      ...headers
    }
  } as unknown as VercelRequest;
};

const mockRes = () => {
  const res = {} as VercelResponse;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

describe('Conversion Webhook API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const validPayload = {
    click_id: 'click-123',
    transaction_id: 'tx-123',
    order_value: 10000,
    currency: 'INR',
    status: 'confirmed',
    occurred_at: '2026-08-09T12:00:00Z',
    partner_identity: 'partner-123'
  };

  it('rejects missing or invalid signature', async () => {
    const req = mockReq(validPayload, { 'x-affiliate-signature': 'invalid-sig' });
    const res = mockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('rejects malformed payloads', async () => {
    const req = mockReq({ click_id: '123' }); // Missing transaction_id and order_value
    const res = mockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('rejects negative order values', async () => {
    const req = mockReq({ ...validPayload, order_value: -100 });
    const res = mockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('rejects if tracking event not found', async () => {
    // Mock Supabase returning no tracking event
    const mockSupabaseSelect = supabase.from('tracking_events').select('*').eq('id', 'click-123');
    (mockSupabaseSelect.single as any).mockResolvedValue({ data: null, error: { message: 'Not found' } });
    
    const req = mockReq(validPayload);
    const res = mockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('rejects if partner attribution mismatches', async () => {
    const mockSupabaseSelect = supabase.from('tracking_events').select('*').eq('id', 'click-123');
    (mockSupabaseSelect.single as any).mockResolvedValueOnce({ 
      data: { id: 'click-123', partner_id: 'partner-999', partners: { slug: 'partner-999' } } 
    });
    
    const req = mockReq(validPayload);
    const res = mockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('handles idempotency (update existing conversion)', async () => {
    // 1. Return tracking event
    (supabase.from('tracking_events').select('*').eq('*').single as any)
      .mockResolvedValueOnce({ data: { id: 'click-123', partner_id: 'partner-123' } });
    
    // 2. Return existing conversion
    (supabase.from('conversions').select('*').eq('*').single as any)
      .mockResolvedValueOnce({ data: { id: 'conv-123', status: 'pending' } });
    
    // 3. Mock Update success
    (supabase.from('conversions').update as any).mockReturnValue({ eq: vi.fn().mockResolvedValue({}) });
    
    const req = mockReq(validPayload); // payload status is 'confirmed'
    const res = mockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(supabase.from).toHaveBeenCalledWith('conversions');
    expect(supabase.from('conversions').update).toHaveBeenCalledWith(expect.objectContaining({ status: 'confirmed' }));
  });

  it('processes refund (voids commission)', async () => {
    // 1. Return tracking event
    (supabase.from('tracking_events').select('*').eq('*').single as any)
      .mockResolvedValueOnce({ data: { id: 'click-123', partner_id: 'partner-123' } });
    
    // 2. Return existing conversion
    (supabase.from('conversions').select('*').eq('*').single as any)
      .mockResolvedValueOnce({ data: { id: 'conv-123', status: 'confirmed' } });
    
    // 3. Mock Updates
    (supabase.from('conversions').update as any).mockReturnValue({ eq: vi.fn().mockResolvedValue({}) });
    (supabase.from('commissions').update as any).mockReturnValue({ eq: vi.fn().mockResolvedValue({}) });

    const req = mockReq({ ...validPayload, status: 'rejected' });
    const res = mockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    // Should void the commission
    expect(supabase.from('commissions').update).toHaveBeenCalledWith(expect.objectContaining({ status: 'voided' }));
  });

  it('inserts new conversion and calculates commission', async () => {
    // 3. Mock insert conversion explicitly for this chain
    const mockSingle = vi.fn().mockResolvedValue({ data: { id: 'new-conv-123' } });
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });
    
    (supabase.from as any).mockImplementation((table: string) => {
      if (table === 'conversions') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValueOnce({ data: null }), // the lookup
          insert: mockInsert,
          update: vi.fn().mockReturnThis()
        };
      }
      if (table === 'tracking_events') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: { id: 'click-123', partner_id: 'partner-123' } })
        };
      }
      if (table === 'affiliate_relationships') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: { commission_model: 'cps', commission_terms: {} } })
        };
      }
      if (table === 'commissions') {
        return {
          insert: vi.fn().mockResolvedValue({})
        };
      }
      return {};
    });

    const req = mockReq(validPayload);
    const res = mockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(mockInsert).toHaveBeenCalled();
    expect(CommissionCalculator.calculateExpectedCommission).toHaveBeenCalledWith(10000, 'cps', {});
  });
});
