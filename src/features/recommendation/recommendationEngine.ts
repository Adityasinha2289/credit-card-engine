import { CardRepository } from '../card-intelligence/cardRepository';
import { MerchantResolver } from './merchantResolver';
import { OfferResolver } from './offerResolver';
import { CardRanker } from './cardRanker';
import { ConfidenceCalculator } from './confidenceCalculator';
import type {
  RecommendationInput,
  RecommendationOutput,
  AlternativeRecommendation,
} from './recommendationTypes';

export class RecommendationEngine {
  private static cardRepo = CardRepository.getInstance();

  public static getBestCardRecommendation(input: RecommendationInput): RecommendationOutput {
    const transactionDate = input.transactionDate || new Date();
    const amount = input.amount || 1000;

    // Step 1: Resolve Merchant
    const resolvedMerchant = MerchantResolver.resolve(input.merchant, input.category);

    // Step 2: Resolve Active Offers
    const applicableOffers = OfferResolver.getApplicableOffers(
      resolvedMerchant.merchant?.id,
      resolvedMerchant.inferredCategory,
      amount,
      transactionDate
    );

    // Step 3 & 4: Fetch & Rank Cards
    const availableCards = this.cardRepo.getCards();
    const rankedCalculations = CardRanker.rankCards(
      availableCards,
      amount,
      resolvedMerchant.inferredCategory,
      applicableOffers
    );

    const bestCalc = rankedCalculations[0];
    const alternativeCalcs = rankedCalculations.slice(1, 4);

    // Step 5: Confidence Calculation
    const confidence = ConfidenceCalculator.calculateConfidence(
      resolvedMerchant,
      bestCalc?.appliedOffer,
      availableCards.length
    );

    const alternatives: AlternativeRecommendation[] = alternativeCalcs.map((calc) => ({
      card: calc.card,
      expectedSavings: calc.expectedSavings,
      expectedRewardPoints: calc.expectedRewardPoints,
      reasoning: calc.reasoning,
    }));

    return {
      bestCard: bestCalc.card,
      confidence,
      expectedReward: bestCalc.expectedRewardPoints,
      expectedSavings: bestCalc.expectedSavings,
      reasoning: bestCalc.reasoning,
      alternatives,
      resolvedMerchant: resolvedMerchant.merchant,
      appliedOffer: bestCalc.appliedOffer,
    };
  }
}
