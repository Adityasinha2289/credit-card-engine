import type { MockProduct } from '../types';

export const MOCK_PRODUCTS: MockProduct[] = [
  {
    id: 'prod-nike-am270',
    partnerId: 'partner-nike',
    name: 'Nike Air Max 270',
    originalPrice: 12000,
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800',
    recommendation: {
      bestCard: {
        bankName: 'HDFC',
        cardName: 'Card X',
      },
      merchantOffer: {
        id: 'off-nike-1',
        source: 'merchant',
        description: 'Nike Store Discount',
        value: 1000,
      },
      cardReward: {
        id: 'off-hdfc-1',
        source: 'card',
        description: 'HDFC 3% Cashback',
        value: 350,
      },
      totalSavings: 1350,
      effectiveCost: 10650,
      reason: 'Highest combined value for your current wallet.',
    },
  },
  {
    id: 'prod-cultfit-pro',
    partnerId: 'partner-cultfit',
    name: 'Cultpass Pro (12 Months)',
    originalPrice: 15000,
    imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800',
    recommendation: {
      bestCard: {
        bankName: 'SBI',
        cardName: 'Cashback Card',
      },
      cardReward: {
        id: 'off-sbi-1',
        source: 'card',
        description: '5% Online Spend',
        value: 750,
      },
      totalSavings: 750,
      effectiveCost: 14250,
      reason: 'SBI Cashback offers the highest un-capped reward for fitness memberships.',
    },
  }
];
