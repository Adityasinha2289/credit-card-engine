import type { Offer } from '../types';

export const MOCK_OFFERS: Offer[] = [
  // 1. Merchant Offer: Nike 10% off (up to ₹500), minimum spend ₹3000
  {
    id: 'off-nike-10',
    name: 'Nike 10% Discount',
    description: '10% off on all Nike orders above ₹3000.',
    type: 'percentage_discount',
    value: 10,
    source: 'merchant',
    eligibility: {
      partnerIds: ['part-nike'],
      minSpend: 3000,
      maxDiscount: 500,
      mutuallyExclusiveSource: true,
    },
  },
  
  // 2. Bank Offer: HDFC Diners Club 5x Rewards on Dining (Assuming 5x = 16.5% equivalent points, simplified to 16.5 value here)
  {
    id: 'off-hdfc-dining-5x',
    name: 'HDFC Diners 5X Rewards',
    description: 'Earn 5X Reward Points on Dining.',
    type: 'reward_multiplier',
    value: 16.5,
    source: 'bank',
    eligibility: {
      categories: ['dining'],
      paymentMethodIds: ['pm-hdfc-diners'],
    },
  },

  // 3. Bank Offer: SBI Cashback 5% online spend
  {
    id: 'off-sbi-online-5',
    name: 'SBI Cashback',
    description: '5% unlimited cashback on online spends.',
    type: 'cashback',
    value: 5,
    source: 'bank',
    eligibility: {
      categories: ['shopping', 'travel', 'entertainment'], // online proxy
      paymentMethodIds: ['pm-sbi-cashback'],
    },
  },

  // 4. Bank Offer: Axis Ace 2% flat cashback (fallback)
  {
    id: 'off-axis-ace-2',
    name: 'Axis Ace Flat Cashback',
    description: '2% cashback on all spends.',
    type: 'cashback',
    value: 2,
    source: 'bank',
    eligibility: {
      paymentMethodIds: ['pm-axis-ace'],
    },
  },

  // 5. Merchant Offer: Cult.fit Flat ₹1000 off on ₹10000 min spend
  {
    id: 'off-cult-flat-1000',
    name: 'Cult.fit ₹1000 Off',
    description: 'Flat ₹1000 discount on fitness memberships.',
    type: 'flat_discount',
    value: 1000,
    source: 'merchant',
    eligibility: {
      partnerIds: ['part-cultfit'],
      minSpend: 10000,
      mutuallyExclusiveSource: true,
    },
  },

  // 6. Network Offer: Visa Dining 15% off up to ₹300
  {
    id: 'off-visa-dining-15',
    name: 'Visa Dining Delights',
    description: '15% off on dining with Visa cards.',
    type: 'percentage_discount',
    value: 15,
    source: 'network',
    eligibility: {
      categories: ['dining'],
      paymentMethodTypes: ['credit_card', 'debit_card'],
      maxDiscount: 300,
    },
  },

  // 7. Merchant Offer (Mutually Exclusive test): Another Nike offer
  {
    id: 'off-nike-flat-200',
    name: 'Nike Flat ₹200',
    description: 'Flat ₹200 off.',
    type: 'flat_discount',
    value: 200,
    source: 'merchant',
    eligibility: {
      partnerIds: ['part-nike'],
      mutuallyExclusiveSource: true,
    },
  }
];
