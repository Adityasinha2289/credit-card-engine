import type { UserProfile } from '../finix/lib/recommendEngine';
import type { TransactionCategory } from '../dashboard/types/dashboard.types';

export interface CardSummary {
  id: string;
  name: string;
  issuer: string;
  network: string;
  annualFee: number;
  rewardRate: string;
  image?: string;
}

export interface SavingsProjection {
  expectedSavings: number;
  expectedRewardPoints: number;
  appliedOffer?: any;
}

export interface RecommendationTradeoffs {
  pros: string[];
  cons: string[];
}

export interface RecommendationResult {
  card: CardSummary;
  savings?: SavingsProjection;
  confidence: number;
  reasoning: string[];
  tradeoffs?: RecommendationTradeoffs;
  matchScore: number;
  matchPercent: number;
}

export interface UnifiedRecommendationRequest {
  merchant?: string;
  amount?: number;
  category?: TransactionCategory;
  userProfile?: UserProfile;
  ownedCardIds?: string[];
}
