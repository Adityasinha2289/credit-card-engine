import type { CreditCardIntelligence } from '../../card-intelligence/types';
import type { MerchantOffer } from '../../merchant-intelligence/types';
import type { TransactionCategory, PrimaryGoal } from '../../dashboard/types/dashboard.types';

export type RecommendationMode = 'wallet_optimisation' | 'card_discovery';

export interface ScoringWeights {
  rewardScore: number;
  merchantOfferScore: number;
  userOwnershipScore: number;
  categoryMatchScore: number;
  annualFeePenaltyScore: number;
  confidenceScore: number;
  userPreferenceScore: number;
  spendingBehaviourScore: number;
}

export interface ScoringConfig {
  weights: ScoringWeights;
}

export interface RecommendationContextInput {
  mode?: RecommendationMode;
  merchant: string;
  amount: number;
  ownedCardIds?: string[];
  userPrimaryGoal?: PrimaryGoal;
  userSalary?: number;
  transactionDate?: Date;
  category?: TransactionCategory;
}

export interface StructuredFactor {
  factorName: string;
  rawScore: number;
  weight: number;
  weightedContribution: number;
  description: string;
}

export interface CardEvaluationResult {
  card: CreditCardIntelligence;
  compositeScore: number;
  expectedSavings: number;
  expectedRewardPoints: number;
  isOwned: boolean;
  appliedOffer?: MerchantOffer;
  structuredFactors: StructuredFactor[];
  humanReasoning: string[];
}

export interface TraceStage {
  stageName: string;
  durationMs: number;
  details: Record<string, unknown>;
}

export interface RecommendationTrace {
  traceId: string;
  timestamp: string;
  mode: RecommendationMode;
  input: RecommendationContextInput;
  stages: TraceStage[];
  totalDurationMs: number;
}

export interface RecommendationIntelligenceOutput {
  traceId: string;
  mode: RecommendationMode;
  bestCard: CreditCardIntelligence;
  compositeScore: number;
  confidence: number;
  expectedSavings: number;
  expectedRewardPoints: number;
  appliedOffer?: MerchantOffer;
  humanReasoning: string[];
  structuredFactors: StructuredFactor[];
  alternatives: Array<{
    card: CreditCardIntelligence;
    compositeScore: number;
    expectedSavings: number;
    humanReasoning: string[];
  }>;
  trace: RecommendationTrace;
}
