import type { CreditCardIntelligence } from '../../card-intelligence/types';
import type { MerchantOffer } from '../../merchant-intelligence/types';
import type { TransactionCategory, PrimaryGoal } from '../../dashboard/types/dashboard.types';

import type {
  ScoringConfig,
  RecommendationMode,
  StructuredFactor,
  CardEvaluationResult,
} from './evaluationTypes';
import { ScoringRules } from './scoringRules';
import { ExplainabilityEngine } from './explainabilityEngine';

export const DEFAULT_SCORING_CONFIG: ScoringConfig = {
  weights: {
    rewardScore: 0.40,
    merchantOfferScore: 0.30,
    userOwnershipScore: 0.10,
    categoryMatchScore: 0.05,
    annualFeePenaltyScore: 0.05,
    confidenceScore: 0.05,
    userPreferenceScore: 0.05,
    spendingBehaviourScore: 0.00,
  },
};

export class ScoringEngine {
  private config: ScoringConfig;

  constructor(config: ScoringConfig = DEFAULT_SCORING_CONFIG) {
    this.config = config;
  }

  public evaluateCard(
    card: CreditCardIntelligence,
    amount: number,
    category: TransactionCategory,
    applicableOffers: MerchantOffer[],
    isOwned: boolean,
    mode: RecommendationMode,
    userGoal: PrimaryGoal,
    confidenceScore: number,
    merchantName?: string
  ): CardEvaluationResult {
    const weights = this.config.weights;

    // 1. Evaluate Factors
    const rewardEval = ScoringRules.evalReward(card, amount, category, merchantName);
    const matchingOffer = applicableOffers.find(
      (o) => o.eligibleCards.includes('all') || o.eligibleCards.includes(card.id)
    );
    const offerEval = ScoringRules.evalOffer(matchingOffer, amount);
    const ownershipRaw = ScoringRules.evalOwnership(isOwned, mode);
    const categoryRaw = ScoringRules.evalCategoryMatch(card, category);
    const feeRaw = ScoringRules.evalAnnualFee(card.annualFee, amount);
    const prefRaw = ScoringRules.evalPreference(card, userGoal);
    const spendRaw = 80;

    const expectedSavings = rewardEval.baseSavings + offerEval.offerBonus;
    const expectedRewardPoints = Math.round(expectedSavings * 2);

    const factors: StructuredFactor[] = [
      {
        factorName: 'Reward Rate & Savings',
        rawScore: rewardEval.rawScore,
        weight: weights.rewardScore,
        weightedContribution: rewardEval.rawScore * weights.rewardScore,
        description: `Effective reward rate of ${rewardEval.rate}% returning ₹${rewardEval.baseSavings} base savings`,
      },
      {
        factorName: 'Active Merchant Offer',
        rawScore: offerEval.rawScore,
        weight: weights.merchantOfferScore,
        weightedContribution: offerEval.rawScore * weights.merchantOfferScore,
        description: matchingOffer ? `Active offer discount of ₹${offerEval.offerBonus}` : 'No active merchant offer',
      },
      {
        factorName: 'Wallet Ownership Status',
        rawScore: ownershipRaw,
        weight: weights.userOwnershipScore,
        weightedContribution: ownershipRaw * weights.userOwnershipScore,
        description: isOwned ? 'Card is in user wallet' : 'Card available in catalog',
      },
      {
        factorName: 'Category Alignment',
        rawScore: categoryRaw,
        weight: weights.categoryMatchScore,
        weightedContribution: categoryRaw * weights.categoryMatchScore,
        description: `Category match for ${category}`,
      },
      {
        factorName: 'Annual Fee Impact',
        rawScore: feeRaw,
        weight: weights.annualFeePenaltyScore,
        weightedContribution: feeRaw * weights.annualFeePenaltyScore,
        description: card.annualFee === 0 ? 'Zero annual fee card' : `Annual fee ₹${card.annualFee}`,
      },
      {
        factorName: 'Resolution Confidence',
        rawScore: confidenceScore,
        weight: weights.confidenceScore,
        weightedContribution: confidenceScore * weights.confidenceScore,
        description: `Resolution confidence score of ${confidenceScore}%`,
      },
      {
        factorName: 'User Goal Alignment',
        rawScore: prefRaw,
        weight: weights.userPreferenceScore,
        weightedContribution: prefRaw * weights.userPreferenceScore,
        description: `Aligned with primary goal "${userGoal}"`,
      },
      {
        factorName: 'Spending Headroom',
        rawScore: spendRaw,
        weight: weights.spendingBehaviourScore,
        weightedContribution: spendRaw * weights.spendingBehaviourScore,
        description: 'Sufficient spending headroom',
      },
    ];

    const compositeScore = Math.round(
      factors.reduce((sum, f) => sum + f.weightedContribution, 0)
    );

    const humanReasoning = ExplainabilityEngine.generateHumanReasoning(
      card,
      rewardEval.rate,
      expectedSavings,
      matchingOffer,
      isOwned
    );

    return {
      card,
      compositeScore,
      expectedSavings,
      expectedRewardPoints,
      isOwned,
      appliedOffer: matchingOffer,
      structuredFactors: factors,
      humanReasoning,
    };
  }
}
