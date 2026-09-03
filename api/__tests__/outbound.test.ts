import handler from '../outbound';
import { CommerceRepository } from '../../src/features/commerce/repositories';
import { supabase } from '../../src/lib/supabase';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock dependencies
vi.mock('../../src/features/commerce/repositories');
vi.mock('../../src/features/commerce', () => ({
  CommerceOptimizationService: {
    optimizeEntity: vi.fn().mockResolvedValue({ savings: 1000 })
  }
}));
vi.mock('../../src/lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
    insert: vi.fn()
  },
  isBackendEnabled: true
}));
vi.mock('@clerk/backend', () => ({
  verifyToken: vi.fn(async (token) => {
    if (token === 'some-token') {
      return { sub: 'user-clerk-verified' };
    }
    throw new Error('jwt malformed');
  })
}));

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

describe('Outbound API Security & Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CLERK_SECRET_KEY = 'test-secret-key';
  });

  it('rejects non-POST methods', async () => {
    const req = mockReq({}, {});
    req.method = 'GET';
    const res = mockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  it('rejects missing commerceEntityId', async () => {
    const req = mockReq({ placement: 'shop' }, {});
    const res = mockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 404 for invalid entity', async () => {
    vi.spyOn(CommerceRepository, 'getCommerceEntities').mockResolvedValue([]);
    const req = mockReq({ commerceEntityId: 'invalid' }, {});
    const res = mockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('generates demo link without clickId for unauthenticated requests', async () => {
    vi.spyOn(CommerceRepository, 'getCommerceEntities').mockResolvedValue([
      { id: 'valid-id', partnerId: 'partner-id', basePrice: 100, status: 'active', name: 'Test Entity', currency: 'INR', entityType: 'product', destinationPath: '', categoryId: 'cat1' }
    ]);
    vi.spyOn(CommerceRepository, 'getPartnerById').mockResolvedValue({
      id: 'partner-id', name: 'Partner', slug: 'partner', status: 'active', primaryCategoryId: 'cat1'
    });

    const req = mockReq({ commerceEntityId: 'valid-id' }); // No auth header
    const res = mockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      clickId: null // Crucial: no click ID for demo user
    }));
    // Should NOT have called supabase insert
    expect(supabase.from).not.toHaveBeenCalledWith('tracking_events');
  });

  it('generates production tracking link for authenticated users', async () => {
    vi.spyOn(CommerceRepository, 'getCommerceEntities').mockResolvedValue([
      { id: 'valid-id', partnerId: 'partner-id', basePrice: 100, status: 'active', name: 'Test Entity', currency: 'INR', entityType: 'product', destinationPath: '', categoryId: 'cat1' }
    ]);
    vi.spyOn(CommerceRepository, 'getPartnerById').mockResolvedValue({
      id: 'partner-id', name: 'Partner', slug: 'partner', status: 'active', primaryCategoryId: 'cat1'
    });
    
    const mockSupabaseQuery = supabase.from('affiliate_relationships').select('*').eq('partner_id', 'partner-id').eq('status', 'active');
    (mockSupabaseQuery.single as any).mockResolvedValue({
      data: { tracking_template: 'https://affiliate.example.com?click_id={{CLICK_ID}}' }
    });

    const req = mockReq({ commerceEntityId: 'valid-id' }, { authorization: 'Bearer some-token' });
    const res = mockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      clickId: expect.any(String)
    }));

    // Should have generated clickId and saved to tracking events
    expect(supabase.from).toHaveBeenCalledWith('tracking_events');
  });
});
