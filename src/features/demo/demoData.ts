import { AppProfile, Transaction, MerchantOffer, CreditAccount } from '../dashboard/types/dashboard.types';
import { CardData } from '../cards/types/card.types';
import { MASTER_CARD_DATASET } from '../finix/data/masterDataset';
import { useDashboardStore } from '../dashboard/store/dashboardStore';

// -----------------------------------------------------------------------------
// PROFILE
// -----------------------------------------------------------------------------
export const demoProfile: AppProfile = {
  id: 'demo-user-123',
  name: 'Aarav',
  email: 'aarav@demo.renocred.com',
  phone: '+91 9876543210',
  avatar: 'https://i.pravatar.cc/150?u=aarav',
  salary: 75000 * 12, // ₹75,000/month = 9L/year
  creditScore: 742,
  onboardingCompleted: true,
  userSegment: 'youth',
  primaryGoal: 'maximize_rewards',
  spendCategories: ['dining', 'travel', 'shopping', 'utilities'],
  occupation: 'Salaried',
  city: 'Mumbai',
};

// -----------------------------------------------------------------------------
// CARDS
// -----------------------------------------------------------------------------
const cardIds = [
  'hdfc_diners_club_black',
  'sbi_cashback',
  'icici_amazon_pay',
  'amex_platinum_reserve'
];

const mockGradients: Record<string, { from: string; via: string; to: string }> = {
  'hdfc_diners_club_black': { from: '#1a1a1a', via: '#2d2d2d', to: '#000000' },
  'sbi_cashback': { from: '#003366', via: '#004c99', to: '#002244' },
  'icici_amazon_pay': { from: '#ff9900', via: '#e68a00', to: '#cc7a00' },
  'amex_platinum_reserve': { from: '#c0c0c0', via: '#a8a8a8', to: '#808080' },
};

export const demoCards: CardData[] = cardIds.map((id, index) => {
  const finixCard = MASTER_CARD_DATASET.find(c => c.id === id);
  const fallbackGrad = { from: '#1F5247', via: '#30595c', to: '#1B3029' };
  const grad = mockGradients[id] || fallbackGrad;
  
  return {
    id,
    pan: `**** **** **** ${1000 + index * 1111}`,
    cardholderName: demoProfile.name,
    expiry: '12/28',
    network: finixCard?.network?.toLowerCase() || 'visa',
    bank: finixCard?.bank || 'Bank',
    status: 'active',
    availableCredit: 500000,
    creditLimit: 500000,
    label: finixCard?.name || 'Credit Card',
    gradientFrom: finixCard?.gradientFrom || grad.from,
    gradientVia: grad.via,
    gradientTo: finixCard?.gradientTo || grad.to,
  } as unknown as CardData;
});

export const demoCreditAccounts: CreditAccount[] = demoCards.map((card) => ({
  cardId: card.id,
  totalLimit: card.creditLimit,
  currentBalance: 1200000, // 12,000.00 in cents
  minimumPaymentDue: 150000, // 1,500.00 in cents
  paymentDueDate: '2026-10-01T00:00:00.000Z',
  lastPaymentAmount: 0,
  lastPaymentDate: null,
  apr: 0.1999,
}));

// -----------------------------------------------------------------------------
// TRANSACTIONS
// -----------------------------------------------------------------------------
const now = new Date();
const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

export const demoTransactions: Transaction[] = [
  {
    id: 'tx-1',
    merchant: 'Zomato',
    amount: 125000, // ₹1,250.00
    date: now.toISOString(),
    category: 'dining',
    type: 'debit',
    cardId: 'sbi_cashback', // Assuming we used SBI Cashback for dining
    pending: false,
    rewardPoints: 125,
  },
  {
    id: 'tx-2',
    merchant: 'GreeNox',
    amount: 32000, // ₹320.00
    date: yesterday.toISOString(),
    category: 'dining',
    type: 'debit',
    cardId: 'hdfc_diners_club_black', 
    pending: false,
    rewardPoints: 64, // Assume some multiplier
  },
  {
    id: 'tx-3',
    merchant: 'Snitch',
    amount: 299900, // ₹2,999.00
    date: twoDaysAgo.toISOString(),
    category: 'shopping',
    type: 'debit',
    cardId: 'icici_amazon_pay',
    pending: false,
    rewardPoints: 150,
  },
  {
    id: 'tx-4',
    merchant: 'Uber',
    amount: 42000, // ₹420.00
    date: threeDaysAgo.toISOString(),
    category: 'travel',
    type: 'debit',
    cardId: 'amex_platinum_reserve',
    pending: false,
    rewardPoints: 21,
  }
];

// -----------------------------------------------------------------------------
// OFFERS
// -----------------------------------------------------------------------------
export const demoOffers: MerchantOffer[] = [
  {
    id: 'offer-1',
    merchantName: 'GreeNox',
    description: 'Get 20% off on all healthy meals.',
    discountPercentage: 20,
    maxDiscountAmount: 500, // ₹500
    category: 'dining',
    validUntil: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(), // +30 days
    eligibleCardIds: ['hdfc_diners_club_black', 'sbi_cashback'],
  },
  {
    id: 'offer-2',
    merchantName: 'Snitch',
    description: 'Flat 20% OFF on minimum spend of ₹2000.',
    discountPercentage: 20,
    maxDiscountAmount: 1000,
    category: 'shopping',
    validUntil: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    eligibleCardIds: ['icici_amazon_pay', 'sbi_cashback'],
  },
  {
    id: 'offer-3',
    merchantName: 'Behrouz',
    description: '30% off your next Biryani order.',
    discountPercentage: 30,
    maxDiscountAmount: 300,
    category: 'dining',
    validUntil: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    eligibleCardIds: ['hdfc_diners_club_black'],
  }
];

// -----------------------------------------------------------------------------
// SUBSCRIPTIONS & BUDGETS
// -----------------------------------------------------------------------------
import { Subscription, CategoryBudget } from '../dashboard/types/dashboard.types';

export const demoSubscriptions: Subscription[] = [
  { id: 'sub_netflix', name: 'Netflix', amount: 649, billingCycle: 'monthly', nextBillingDate: '2026-10-02T00:00:00Z', category: 'Subscriptions', cardId: 'hdfc_diners_club_black', status: 'active', hasPriceHike: false, isFreeTrial: false },
  { id: 'sub_spotify', name: 'Spotify', amount: 119, billingCycle: 'monthly', nextBillingDate: '2026-09-28T00:00:00Z', category: 'Subscriptions', cardId: 'sbi_cashback', status: 'active', hasPriceHike: false, isFreeTrial: false },
  { id: 'sub_gym', name: 'Cult.fit', amount: 1200, billingCycle: 'monthly', nextBillingDate: '2026-10-05T00:00:00Z', category: 'Education', cardId: 'icici_amazon_pay', status: 'active', hasPriceHike: false, isFreeTrial: false },
  { id: 'sub_prime', name: 'Amazon Prime', amount: 1499, billingCycle: 'yearly', nextBillingDate: '2026-12-15T00:00:00Z', category: 'Subscriptions', cardId: 'icici_amazon_pay', status: 'active', hasPriceHike: false, isFreeTrial: false },
];

export const demoBudgets: CategoryBudget[] = [
  { id: 'b_food', category: 'dining', limitAmount: 8000, currentSpend: 6400, period: 'monthly' },
  { id: 'b_shopping', category: 'shopping', limitAmount: 7000, currentSpend: 5900, period: 'monthly' },
  { id: 'b_transport', category: 'transport', limitAmount: 4000, currentSpend: 3200, period: 'monthly' },
  { id: 'b_entertainment', category: 'entertainment', limitAmount: 3000, currentSpend: 2100, period: 'monthly' },
  { id: 'b_subs', category: 'subscriptions', limitAmount: 2000, currentSpend: 1500, period: 'monthly' }
];

// -----------------------------------------------------------------------------
// INJECTOR
// -----------------------------------------------------------------------------
export function seedDemoStore() {
  const store = useDashboardStore.getState();
  
  // Reset the store to initial state first
  store._reset();

  // Then inject our demo data directly into the zustand store state
  // We use setState to avoid triggering the actions that would sync to Supabase
  useDashboardStore.setState({
    profile: demoProfile,
    userCards: demoCards,
    transactions: demoTransactions,
    offers: demoOffers,
    creditAccounts: demoCreditAccounts,
    subscriptions: demoSubscriptions,
    budgets: demoBudgets,
    activeCardId: demoCards.length > 0 ? demoCards[0].id : null,
    
    // Set rewards ledger based on profile
    rewards: {
      totalPoints: 12500,
      redeemedPoints: 2000,
      cycleEarnings: 15400, // ₹154.00 cash back this cycle
      tier: 'gold',
      pointsToNextTier: 2500,
      categoryMultipliers: {
        dining: 3,
        travel: 3,
        groceries: 2,
        subscriptions: 1,
        shopping: 1,
        transport: 1,
        health: 1,
        entertainment: 1,
        utilities: 1,
        other: 1,
        fuel: 1,
      },
    }
  });
}
