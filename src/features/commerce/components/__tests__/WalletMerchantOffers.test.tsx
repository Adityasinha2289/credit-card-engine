/**
 * @vitest-environment happy-dom
 */
import React from 'react';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { WalletMerchantOffers } from '../WalletMerchantOffers';
import { CommerceRepository } from '../../repositories';
import { useDashboardStore } from '../../../dashboard/store/dashboardStore';
import type { CommerceOffer } from '../../types';

vi.mock('../../repositories', () => ({
  CommerceRepository: {
    getEligibleOffers: vi.fn(),
  },
}));

vi.mock('../../../dashboard/store/dashboardStore', () => ({
  useDashboardStore: Object.assign(vi.fn(), {
    getState: vi.fn(() => ({ profile: { id: 'test-user-id' } }))
  }),
}));

describe('WalletMerchantOffers Component', () => {
  const mockUserCards = [
    { id: 'card-1', name: 'HDFC Diners Club Black', bank: 'HDFC', network: 'Visa', status: 'active', pan: '1234' },
    { id: 'card-2', name: 'HDFC IRCTC', bank: 'HDFC', network: 'Visa', status: 'active', pan: '5678' },
  ];

  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders loading state initially', () => {
    (useDashboardStore as any).mockReturnValue(mockUserCards);
    (CommerceRepository.getEligibleOffers as any).mockReturnValue(new Promise(() => {}));

    render(<WalletMerchantOffers />);
    expect(screen.getByText('Discovering your card offers...')).toBeInTheDocument();
  });

  it('renders empty wallet state if no cards', async () => {
    (useDashboardStore as any).mockReturnValue([]);
    (CommerceRepository.getEligibleOffers as any).mockResolvedValue([]);

    render(<WalletMerchantOffers />);
    await waitFor(() => {
      expect(screen.getByText('Your wallet is empty')).toBeInTheDocument();
    });
  });

  it('renders API error state', async () => {
    (useDashboardStore as any).mockReturnValue(mockUserCards);
    (CommerceRepository.getEligibleOffers as any).mockRejectedValue(new Error('API Error'));

    render(<WalletMerchantOffers />);
    await waitFor(() => {
      expect(screen.getByText('Unable to load merchant offers.')).toBeInTheDocument();
    });
  });

  it('renders empty offer state', async () => {
    (useDashboardStore as any).mockReturnValue(mockUserCards);
    (CommerceRepository.getEligibleOffers as any).mockResolvedValue([]);

    render(<WalletMerchantOffers />);
    await waitFor(() => {
      expect(screen.getByText('No offers available right now')).toBeInTheDocument();
    });
  });

  it('groups offers under correct wallet cards and shared section', async () => {
    (useDashboardStore as any).mockReturnValue(mockUserCards);
    
    const mockOffers: CommerceOffer[] = [
      {
        id: 'offer-a',
        source: 'merchant',
        offerType: 'cashback',
        value: 100,
        title: 'Merchant Offer A',
        description: 'Only for card 1',
        validFrom: '2023-01-01',
        validUntil: '2099-12-31',
        status: 'active',
        eligibilityRules: { eligible_cards: ['card-1'] },
        applicable_wallet_card_ids: ['card-1'],
      },
      {
        id: 'offer-b',
        source: 'merchant',
        offerType: 'cashback',
        value: 200,
        title: 'Merchant Offer B',
        description: 'Only for card 2',
        validFrom: '2023-01-01',
        validUntil: '2099-12-31',
        status: 'active',
        eligibilityRules: { eligible_cards: ['card-2'] },
        applicable_wallet_card_ids: ['card-2'],
      },
      {
        id: 'offer-c',
        source: 'merchant',
        offerType: 'percentage_discount',
        value: 10,
        title: 'Merchant Offer C',
        description: 'Shared offer',
        validFrom: '2023-01-01',
        validUntil: '2099-12-31',
        status: 'active',
        eligibilityRules: {},
        applicable_wallet_card_ids: ['card-1', 'card-2'],
      }
    ];

    (CommerceRepository.getEligibleOffers as any).mockResolvedValue(mockOffers);

    render(<WalletMerchantOffers />);
    
    await waitFor(() => {
      // Check headers
      expect(screen.getByText('FOR YOU')).toBeInTheDocument();
      expect(screen.getByText('MORE OFFERS')).toBeInTheDocument();

      // Check offers
      expect(screen.getByText('Merchant Offer A')).toBeInTheDocument();
      expect(screen.getByText('Merchant Offer B')).toBeInTheDocument();
      expect(screen.getByText('Merchant Offer C')).toBeInTheDocument();
    });
  });

  it('unrelated card offers are not displayed if wallet card does not exist', async () => {
    (useDashboardStore as any).mockReturnValue([{ id: 'card-1', name: 'My Card' }]);
    
    const mockOffers: CommerceOffer[] = [
      {
        id: 'offer-a',
        source: 'merchant',
        offerType: 'cashback',
        value: 100,
        title: 'Merchant Offer A',
        description: '',
        validFrom: '2023-01-01',
        validUntil: '2099-12-31',
        status: 'active',
        eligibilityRules: {},
        applicable_wallet_card_ids: ['card-1'],
      },
      {
        id: 'offer-unrelated',
        source: 'merchant',
        offerType: 'cashback',
        value: 200,
        title: 'Unrelated Offer',
        description: '',
        validFrom: '2023-01-01',
        validUntil: '2099-12-31',
        status: 'active',
        eligibilityRules: { eligible_cards: ['random-card-id'] },
        applicable_wallet_card_ids: ['random-card-id'],
      }
    ];

    (CommerceRepository.getEligibleOffers as any).mockResolvedValue(mockOffers);

    render(<WalletMerchantOffers />);
    
    await waitFor(() => {
      expect(screen.getByText('Merchant Offer A')).toBeInTheDocument();
      expect(screen.queryByText('Unrelated Offer')).not.toBeInTheDocument();
    });
  });
});
