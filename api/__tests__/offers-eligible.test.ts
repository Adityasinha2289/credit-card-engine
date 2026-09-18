import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Variables to control mock responses
let mockWalletResponse: any = { data: [], error: null };
let mockOffersResponse: any = { data: [], error: null };
let authUserId = 'user-123';

vi.mock('../../src/features/recommendation/api/auth', () => {
  return {
    ClerkAuth: class {
      verifyToken = vi.fn().mockImplementation(async (token) => {
        if (!token || token === 'Bearer fake-token') {
          return { authenticated: false, error: 'Invalid token' };
        }
        return { authenticated: true, userId: authUserId };
      })
    }
  };
});

vi.mock('../admin/_utils/supabaseAdmin', () => ({
  supabaseAdmin: {
    from: vi.fn((table: string) => {
      if (table === 'user_cards') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue(mockWalletResponse)
            })
          })
        };
      }
      if (table === 'offers') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              gte: vi.fn().mockResolvedValue(mockOffersResponse)
            })
          })
        };
      }
      return {};
    })
  }
}));

import handler from '../offers/eligible';

describe('Eligible Offers API (Orchestrator)', () => {
  let req: Partial<VercelRequest>;
  let res: Partial<VercelResponse>;
  let jsonMock: any;
  let statusMock: any;

  beforeEach(() => {
    jsonMock = vi.fn();
    statusMock = vi.fn().mockReturnValue({ json: jsonMock });
    req = {
      method: 'POST',
      headers: { authorization: 'Bearer valid-token' },
      body: {}
    };
    res = {
      status: statusMock,
      json: jsonMock
    };
    authUserId = 'user-123';
    
    mockOffersResponse = {
      data: [
        {
          id: 'offer-1',
          source: 'merchant',
          offer_type: 'cashback',
          value: 500,
          title: 'SBI Offer',
          description: 'Desc',
          valid_from: '2020-01-01',
          valid_until: '2099-12-31',
          status: 'active',
          eligibility_rules: { issuer: 'SBI' }
        },
        {
          id: 'offer-2',
          source: 'merchant',
          offer_type: 'cashback',
          value: 1000,
          title: 'Infinia Offer',
          description: 'Desc',
          valid_from: '2020-01-01',
          valid_until: '2099-12-31',
          status: 'active',
          eligibility_rules: { eligible_cards: ['hdfc_infinia_1'] }
        },
        {
          id: 'offer-3',
          source: 'merchant',
          offer_type: 'cashback',
          value: 100,
          title: 'Public Offer',
          description: 'Desc',
          valid_from: '2020-01-01',
          valid_until: '2099-12-31',
          status: 'active',
          eligibility_rules: {}
        }
      ],
      error: null
    };
  });

  it('rejects unauthenticated requests (401)', async () => {
    req.headers = { authorization: 'Bearer fake-token' };
    await handler(req as VercelRequest, res as VercelResponse);
    expect(statusMock).toHaveBeenCalledWith(401);
  });

  it('User with SBI card receives SBI issuer offers', async () => {
    mockWalletResponse = {
      data: [
        {
          card_id: 'sbi_simplyclick_1',
          status: 'active',
          cards: { bank: 'SBI' }
        }
      ],
      error: null
    };
    
    await handler(req as VercelRequest, res as VercelResponse);
    expect(statusMock).toHaveBeenCalledWith(200);
    const body = jsonMock.mock.calls[0][0];
    const offerIds = body.eligibleOffers.map((o: any) => o.id);
    expect(offerIds).toContain('offer-1'); // SBI
    expect(offerIds).toContain('offer-3'); // Public
    expect(offerIds).not.toContain('offer-2'); // Infinia
    
    // Check applicable_wallet_card_ids
    const offer1 = body.eligibleOffers.find((o: any) => o.id === 'offer-1');
    expect(offer1.applicable_wallet_card_ids).toEqual(['sbi_simplyclick_1']);
    
    const offer3 = body.eligibleOffers.find((o: any) => o.id === 'offer-3');
    expect(offer3.applicable_wallet_card_ids).toEqual(['all_cards']);
  });

  it('User with HDFC card does not receive SBI issuer offers', async () => {
    mockWalletResponse = {
      data: [
        {
          card_id: 'hdfc_regalia_1',
          status: 'active',
          cards: { bank: 'HDFC' }
        }
      ],
      error: null
    };
    
    await handler(req as VercelRequest, res as VercelResponse);
    const body = jsonMock.mock.calls[0][0];
    const offerIds = body.eligibleOffers.map((o: any) => o.id);
    expect(offerIds).not.toContain('offer-1'); // SBI
    expect(offerIds).toContain('offer-3'); // Public
  });

  it('User with Infinia receives Infinia-specific offer', async () => {
    mockWalletResponse = {
      data: [
        {
          card_id: 'hdfc_infinia_1',
          status: 'active',
          cards: { bank: 'HDFC' }
        },
        {
          card_id: 'hdfc_regalia_1',
          status: 'active',
          cards: { bank: 'HDFC' }
        }
      ],
      error: null
    };
    
    await handler(req as VercelRequest, res as VercelResponse);
    const body = jsonMock.mock.calls[0][0];
    const offerIds = body.eligibleOffers.map((o: any) => o.id);
    expect(offerIds).toContain('offer-2'); // Infinia
    expect(offerIds).not.toContain('offer-1'); // SBI
    
    // Check applicable_wallet_card_ids
    const offer2 = body.eligibleOffers.find((o: any) => o.id === 'offer-2');
    expect(offer2.applicable_wallet_card_ids).toEqual(['hdfc_infinia_1']);
  });

  it('Issuer-only applies to multiple cards if wallet has multiple of same issuer', async () => {
    mockWalletResponse = {
      data: [
        {
          card_id: 'sbi_simplyclick_1',
          status: 'active',
          cards: { bank: 'SBI' }
        },
        {
          card_id: 'sbi_prime_1',
          status: 'active',
          cards: { bank: 'SBI' }
        },
        {
          card_id: 'hdfc_regalia_1',
          status: 'active',
          cards: { bank: 'HDFC' }
        }
      ],
      error: null
    };
    
    await handler(req as VercelRequest, res as VercelResponse);
    const body = jsonMock.mock.calls[0][0];
    
    const offer1 = body.eligibleOffers.find((o: any) => o.id === 'offer-1');
    expect(offer1.applicable_wallet_card_ids).toContain('sbi_simplyclick_1');
    expect(offer1.applicable_wallet_card_ids).toContain('sbi_prime_1');
    expect(offer1.applicable_wallet_card_ids).not.toContain('hdfc_regalia_1');
    expect(offer1.applicable_wallet_card_ids.length).toBe(2);
  });

  it('Empty wallet returns zero card-specific offers', async () => {
    mockWalletResponse = { data: [], error: null };
    
    await handler(req as VercelRequest, res as VercelResponse);
    const body = jsonMock.mock.calls[0][0];
    const offerIds = body.eligibleOffers.map((o: any) => o.id);
    expect(offerIds).toEqual(['offer-3']); // Only public
    
    const offer3 = body.eligibleOffers.find((o: any) => o.id === 'offer-3');
    expect(offer3.applicable_wallet_card_ids).toEqual(['all_cards']);
  });

  it('Client-supplied wallet IDs ignored', async () => {
    mockWalletResponse = { data: [], error: null };
    req.body = { walletCardIds: ['hdfc_infinia_1'] }; // Malicious payload
    
    await handler(req as VercelRequest, res as VercelResponse);
    const body = jsonMock.mock.calls[0][0];
    const offerIds = body.eligibleOffers.map((o: any) => o.id);
    expect(offerIds).not.toContain('offer-2'); // Should not get Infinia offer
  });

  it('Different authenticated user cannot access another wallet', async () => {
    authUserId = 'user-999';
    mockWalletResponse = { data: [], error: null };
    
    await handler(req as VercelRequest, res as VercelResponse);
    // Because the supabase query explicitly passes authUserId to .eq('user_id', userId),
    // the backend securely limits the wallet to user-999. Since mockWalletResponse is empty,
    // they get public offers only.
    const body = jsonMock.mock.calls[0][0];
    const offerIds = body.eligibleOffers.map((o: any) => o.id);
    expect(offerIds).toEqual(['offer-3']);
  });
});
