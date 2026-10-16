import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const ENTITY = '11111111-1111-4111-8111-111111111111';
const PARTNER = '22222222-2222-4222-8222-222222222222';

const state = vi.hoisted(() => ({
  entity: null as any,
  partner: null as any,
  affiliate: null as any,
  inserts: [] as any[],
}));

vi.mock('../admin/_utils/supabaseAdmin', () => {
  const query = (table: string) => {
    const chain: any = {
      select: () => chain,
      eq: () => chain,
      maybeSingle: async () => ({
        data: table === 'commerce_entities' ? state.entity : table === 'partners' ? state.partner : state.affiliate,
        error: null,
      }),
      insert: async (row: any) => { state.inserts.push({ table, row }); return { error: null }; },
    };
    return chain;
  };
  return { supabaseAdmin: { from: (t: string) => query(t) } };
});

vi.mock('../../src/features/recommendation/api/auth', () => ({
  ClerkAuth: class {
    verifyToken = vi.fn(async (h?: string) => (h === 'Bearer good' ? { authenticated: true, userId: 'user-1' } : { authenticated: false }));
  },
}));

import handler, { resolveDestination } from '../outbound';

const mockReq = (body: any, headers: any = {}, method = 'POST') => ({ method, body, headers } as unknown as VercelRequest);
const mockRes = () => {
  const res = {} as VercelResponse;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

describe('Outbound API', () => {
  beforeEach(() => {
    state.entity = { id: ENTITY, partner_id: PARTNER, destination_path: '/deals/1', base_price: 999, status: 'active' };
    state.partner = { id: PARTNER, slug: 'acme', website_url: 'https://acme.example', status: 'active' };
    state.affiliate = null;
    state.inserts = [];
  });

  it('rejects non-POST methods', async () => {
    const res = mockRes();
    await handler(mockReq({}, {}, 'GET'), res);
    expect(res.status).toHaveBeenCalledWith(405);
  });

  it('rejects a missing entity id', async () => {
    const res = mockRes();
    await handler(mockReq({ placement: 'shop' }), res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('404s for unknown or malformed entity ids', async () => {
    const res = mockRes();
    await handler(mockReq({ commerceEntityId: 'invalid' }), res);
    expect(res.status).toHaveBeenCalledWith(404);
    state.entity = null;
    const res2 = mockRes();
    await handler(mockReq({ commerceEntityId: ENTITY }), res2);
    expect(res2.status).toHaveBeenCalledWith(404);
  });

  it('redirects signed-out users to the partner without tracking (no placeholder domain)', async () => {
    const res = mockRes();
    await handler(mockReq({ commerceEntityId: ENTITY }), res);
    expect(res.json).toHaveBeenCalledWith({ success: true, url: 'https://acme.example/deals/1', clickId: null });
    expect(state.inserts).toHaveLength(0);
  });

  it('uses the affiliate template and records the click for signed-in users', async () => {
    state.affiliate = { tracking_template_url: 'https://aff.example/c?click={{CLICK_ID}}&e={{ENTITY_ID}}' };
    const res = mockRes();
    await handler(mockReq({ commerceEntityId: ENTITY, placement: 'shop_grid' }, { authorization: 'Bearer good' }), res);
    const body = (res.json as any).mock.calls[0][0];
    expect(body.success).toBe(true);
    expect(body.url).toBe(`https://aff.example/c?click=${body.clickId}&e=${ENTITY}`);
    expect(state.inserts).toEqual([expect.objectContaining({
      table: 'tracking_events',
      row: expect.objectContaining({ id: body.clickId, user_id: 'user-1', source_placement: 'shop_grid', partner_id: PARTNER }),
    })]);
  });

  it('refuses non-https destinations', async () => {
    state.partner.website_url = null;
    state.entity.destination_path = 'javascript:alert(1)';
    const res = mockRes();
    await handler(mockReq({ commerceEntityId: ENTITY }), res);
    expect(res.status).toHaveBeenCalledWith(422);
  });
});

describe('resolveDestination', () => {
  it('prefers a valid affiliate template, then absolute destination, then partner site', () => {
    expect(resolveDestination({ clickId: 'c', entityId: 'e', trackingTemplate: 'http://insecure/{{CLICK_ID}}', destinationPath: 'https://shop.example/x' }))
      .toBe('https://shop.example/x');
    expect(resolveDestination({ clickId: 'c', entityId: 'e', partnerWebsite: 'https://p.example', destinationPath: '/a' }))
      .toBe('https://p.example/a');
    expect(resolveDestination({ clickId: 'c', entityId: 'e' })).toBeNull();
  });
});
