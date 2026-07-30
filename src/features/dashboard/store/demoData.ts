import type { 
  CardData, 
  Transaction, 
  Subscription, 
  Milestone, 
  MerchantOffer, 
  CategoryBudget 
} from '../types/dashboard.types';

export const DEMO_CARDS: CardData[] = [
  {
    id:              'card-001',
    pan:             '4111111111114242',
    cardholderName:  'Atharva Kulkarni',
    expiry:          '08/28',
    network:         'visa',
    bank:            'SBI',
    status:          'active',
    availableCredit: 62000000,
    creditLimit:     100000000,
    label:           'Signature Rewards',
    gradientFrom:    '#1F5247',
    gradientVia:     '#30595c',
    gradientTo:      '#456171',
  },
  {
    id:              'card-002',
    pan:             '5500005555555559',
    cardholderName:  'Atharva Kulkarni',
    expiry:          '03/27',
    network:         'mastercard',
    bank:            'HDFC',
    status:          'active',
    availableCredit: 28000000,
    creditLimit:     50000000,
    label:           'Platinum Travel',
    gradientFrom:    '#B85C2A',
    gradientVia:     '#C77931',
    gradientTo:      '#D4943A',
  }
];

export const DEMO_SUBSCRIPTIONS: Subscription[] = [
  {
    id: 'sub-1',
    name: 'Netflix Premium',
    amount: 64900,
    billingCycle: 'monthly',
    nextBillingDate: '2026-07-15T00:00:00.000Z',
    status: 'active',
    cardId: 'card-001',
    category: 'entertainment',
    hasPriceHike: true,
    previousAmount: 49900,
    isFreeTrial: false,
  },
  {
    id: 'sub-2',
    name: 'Spotify Family',
    amount: 17900,
    billingCycle: 'monthly',
    nextBillingDate: '2026-07-05T00:00:00.000Z',
    status: 'active',
    cardId: 'card-001',
    category: 'entertainment',
    hasPriceHike: false,
    isFreeTrial: false,
  },
  {
    id: 'sub-3',
    name: 'Amazon Prime',
    amount: 149900,
    billingCycle: 'yearly',
    nextBillingDate: '2026-07-10T00:00:00.000Z',
    status: 'active',
    cardId: 'card-002',
    category: 'shopping',
    hasPriceHike: false,
    isFreeTrial: true,
  },
];

export const DEMO_MILESTONES: Milestone[] = [
  {
    id: 'mile-1',
    title: 'Annual Fee Waiver',
    description: 'Spend ₹3,00,000 this year to waive the annual fee of ₹2,999.',
    targetAmount: 30000000,
    currentAmount: 18500000,
    rewardType: 'fee_waiver',
    rewardValue: '₹2,999 Fee Waiver',
    dueDate: '2026-12-31T23:59:59.000Z',
    cardId: 'card-001',
  },
  {
    id: 'mile-2',
    title: 'Bonus Reward Points',
    description: 'Spend ₹1,50,000 in a quarter to get 10,000 bonus points.',
    targetAmount: 15000000,
    currentAmount: 14200000,
    rewardType: 'points',
    rewardValue: '10,000 Points',
    dueDate: '2026-09-30T23:59:59.000Z',
    cardId: 'card-002',
  },
];

export const DEMO_OFFERS: MerchantOffer[] = [
  {
    id: 'offer-1',
    merchantName: 'Amazon',
    description: '10% Cashback on Amazon Prime purchases',
    discountPercentage: 10,
    maxDiscountAmount: 150000,
    category: 'shopping',
    validUntil: '2026-08-31T23:59:59.000Z',
    eligibleCardIds: ['card-001'],
  },
  {
    id: 'offer-2',
    merchantName: 'Swiggy Dineout',
    description: '15% off on dining bills up to ₹500',
    discountPercentage: 15,
    maxDiscountAmount: 50000,
    category: 'dining',
    validUntil: '2026-07-15T23:59:59.000Z',
    eligibleCardIds: ['card-001', 'card-002'],
  },
  {
    id: 'offer-3',
    merchantName: 'MakeMyTrip',
    description: 'Flat ₹1200 off on domestic flights',
    discountPercentage: 0,
    maxDiscountAmount: 120000,
    category: 'travel',
    validUntil: '2026-09-30T23:59:59.000Z',
    eligibleCardIds: ['card-002'],
  }
];

export const DEMO_BUDGETS: CategoryBudget[] = [
  {
    id: 'budget-1',
    category: 'dining',
    limitAmount: 1000000,
    currentSpend: 850000,
    period: 'monthly',
  },
  {
    id: 'budget-2',
    category: 'shopping',
    limitAmount: 2500000,
    currentSpend: 1200000,
    period: 'monthly',
  }
];

const d = new Date();
export const DEMO_TRANSACTIONS: Transaction[] = [
  { id: 'tx-1', type: 'debit', amount: 150000, merchant: 'Amazon', category: 'shopping', date: new Date(d.getTime() - 1 * 86400000).toISOString(), cardId: 'card-001', pending: false },
  { id: 'tx-2', type: 'debit', amount: 45000, merchant: 'Swiggy', category: 'dining', date: new Date(d.getTime() - 2 * 86400000).toISOString(), cardId: 'card-001', pending: false },
  { id: 'tx-3', type: 'debit', amount: 1200000, merchant: 'MakeMyTrip', category: 'travel', date: new Date(d.getTime() - 3 * 86400000).toISOString(), cardId: 'card-002', pending: false },
  { id: 'tx-4', type: 'debit', amount: 80000, merchant: 'Blinkit', category: 'groceries', date: new Date(d.getTime() - 4 * 86400000).toISOString(), cardId: 'card-001', pending: false },
  { id: 'tx-5', type: 'debit', amount: 250000, merchant: 'Zara', category: 'shopping', date: new Date(d.getTime() - 5 * 86400000).toISOString(), cardId: 'card-002', pending: false },
  { id: 'tx-6', type: 'debit', amount: 30000, merchant: 'Uber', category: 'transport', date: new Date(d.getTime() - 6 * 86400000).toISOString(), cardId: 'card-001', pending: false },
  { id: 'tx-7', type: 'debit', amount: 150000, merchant: 'Netflix', category: 'subscriptions', date: new Date(d.getTime() - 0.5 * 86400000).toISOString(), cardId: 'card-002', pending: false },
  { id: 'tx-8', type: 'debit', amount: 320000, merchant: 'Croma', category: 'shopping', date: new Date(d.getTime() - 1.5 * 86400000).toISOString(), cardId: 'card-001', pending: false },
  { id: 'tx-9', type: 'debit', amount: 85000, merchant: 'Zomato', category: 'dining', date: new Date(d.getTime() - 3.5 * 86400000).toISOString(), cardId: 'card-002', pending: false },
  { id: 'tx-10', type: 'debit', amount: 12000, merchant: 'Starbucks', category: 'dining', date: new Date(d.getTime() - 5.5 * 86400000).toISOString(), cardId: 'card-001', pending: false },
];
