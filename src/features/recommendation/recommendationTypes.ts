import type { CreditCardIntelligence } from '../card-intelligence/types';
import type { Merchant, MerchantOffer } from '../merchant-intelligence/types';
import type { TransactionCategory } from '../dashboard/types/dashboard.types';

export interface RecommendationInput {
  merchant: string;
  amount: number;
  paymentMethod?: 'credit_card';
  transactionDate?: Date;
  category?: TransactionCategory;
}

export type MerchantMatchType = 'exact' | 'alias' | 'fuzzy' | 'fallback';

export interface ResolvedMerchant {
  merchant?: Merchant;
  matchType: MerchantMatchType;
  confidenceScore: number;
  inferredCategory: TransactionCategory;
}

export interface CardRewardCalculation {
  card: CreditCardIntelligence;
  baseRewardRate: number;
  effectiveRewardRate: number;
  expectedRewardPoints: number;
  expectedSavings: number;
  appliedOffer?: MerchantOffer;
  reasoning: string[];
  rankScore: number;
}

export interface AlternativeRecommendation {
  card: CreditCardIntelligence;
  expectedSavings: number;
  expectedRewardPoints: number;
  reasoning: string[];
}

export interface RecommendationOutput {
  bestCard: CreditCardIntelligence;
  confidence: number;
  expectedReward: number;
  expectedSavings: number;
  reasoning: string[];
  alternatives: AlternativeRecommendation[];
  resolvedMerchant?: Merchant;
  appliedOffer?: MerchantOffer;
}
