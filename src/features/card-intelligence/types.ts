import type { TransactionCategory } from '../dashboard/types/dashboard.types';

export const CARD_NETWORKS = {
  VISA: 'Visa',
  MASTERCARD: 'Mastercard',
  AMEX: 'American Express',
  RUPAY: 'RuPay',
} as const;

export type CardNetwork = typeof CARD_NETWORKS[keyof typeof CARD_NETWORKS];

export const REWARD_TYPES = {
  CASHBACK: 'cashback',
  POINTS: 'points',
  MILES: 'miles',
  REWARDS: 'rewards',
} as const;

export type RewardType = typeof REWARD_TYPES[keyof typeof REWARD_TYPES];

export const PREMIUM_TIERS = {
  SUPER_PREMIUM: 'super_premium',
  PREMIUM: 'premium',
  ENTRY: 'entry',
  NO_FEE: 'no_fee',
} as const;

export type PremiumTier = typeof PREMIUM_TIERS[keyof typeof PREMIUM_TIERS];

export interface CardEligibility {
  minSalary?: number;
  minCreditScore?: number;
}

export interface CreditCardIntelligence {
  id: string;
  issuer: string;
  network: CardNetwork;
  cardName: string;
  annualFee: number | null;
  joiningFee: number | null;
  rewardType: RewardType;
  rewardRate: string;
  loungeAccess: string;
  forexMarkup: number | null;
  fuelBenefits: string;
  welcomeBenefits: string[];
  milestoneBenefits: string[];
  eligibility: CardEligibility;
  categories: TransactionCategory[];
  premiumTier: PremiumTier;
  topBenefit: string;
  isDeprecated?: boolean;
}

export interface CardComparisonFeature {
  cardId: string;
  cardName: string;
  issuer: string;
  annualFee: number | null;
  rewardRate: string;
  loungeAccess: string;
  forexMarkup: number | null;
  fuel: string;
  diningBenefit: string;
  travelBenefit: string;
  shoppingBenefit: string;
  premiumScore: number;
}

export interface CardComparisonResult {
  cards: CardComparisonFeature[];
  winnerId: string;
  summary: string;
}

export interface CardDataSource {
  getCards(): Promise<CreditCardIntelligence[]> | CreditCardIntelligence[];
}
