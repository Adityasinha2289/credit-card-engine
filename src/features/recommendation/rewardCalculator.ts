import type { CreditCardIntelligence } from '../card-intelligence/types';
import type { MerchantOffer } from '../merchant-intelligence/types';
import type { TransactionCategory } from '../dashboard/types/dashboard.types';
import type { CardRewardCalculation } from './recommendationTypes';

export class RewardCalculator {
  public static calculateCardReward(
    card: CreditCardIntelligence,
    amount: number,
    category: TransactionCategory,
    applicableOffers: MerchantOffer[]
  ): CardRewardCalculation {
    // 1. Base reward rate extraction: Only extract percentage if explicit % is present
    let rawRate = 0;
    const isExplicitPercentage = card.rewardRate.includes('%');

    if (isExplicitPercentage) {
      const match = card.rewardRate.match(/(\d+(?:\.\d+)?)\s*%/);
      if (match) {
        rawRate = parseFloat(match[1]);
      }
    }

    let effectiveRate = rawRate;
    const reasoning: string[] = [];

    // 2. Category match. No invented uplift: the old code added +2% to any matching
    //    category without data saying the card pays more there.
    const isCategoryMatch = card.categories.includes(category);
    if (isCategoryMatch) {
      if (isExplicitPercentage) {
        reasoning.push(`${effectiveRate}% reward rate (card lists ${category} as a reward category)`);
      } else {
        reasoning.push(`Category match on ${category} (${card.rewardRate})`);
      }
    } else {
      if (isExplicitPercentage) {
        reasoning.push(`Base ${rawRate}% reward rate`);
      } else {
        reasoning.push(`Reward structure: ${card.rewardRate}`);
      }
    }

    // 3. Find card-eligible offer
    const matchingOffer = applicableOffers.find(
      (o) => o.eligibleCards.includes('all') || o.eligibleCards.includes(card.id)
    );

    let offerBonusValue = 0;
    if (matchingOffer) {
      if (matchingOffer.discountType === 'percentage') {
        offerBonusValue = Math.round((amount * matchingOffer.discountValue) / 100);
        reasoning.push(`${matchingOffer.discountValue}% instant discount via active offer`);
      } else if (matchingOffer.discountType === 'flat') {
        offerBonusValue = matchingOffer.discountValue;
        reasoning.push(`Flat ₹${matchingOffer.discountValue} offer discount applied`);
      } else if (matchingOffer.discountType === 'points_multiplier') {
        if (effectiveRate > 0) {
          effectiveRate *= matchingOffer.discountValue;
          reasoning.push(`${matchingOffer.discountValue}× points multiplier active`);
        }
      }
    }

    // 4. Calculate total expected savings in Rupees
    const baseSavings = Math.round((amount * effectiveRate) / 100);
    const expectedSavings = baseSavings + offerBonusValue;
    // Points can't be derived from rupee savings without a per-card conversion; don't invent it.
    const expectedRewardPoints = 0;

    // 5. Rank score: what this payment actually earns. (No +50 "premium" boost —
    //    it outweighed a ₹10,000 fee and biased every result toward premium cards.)
    let rankScore = expectedSavings * 10 + effectiveRate * 5;
    if (card.annualFee !== null && card.annualFee > 0) {
      rankScore -= Math.round(card.annualFee * 0.001); // tie-break only
    }

    return {
      card,
      baseRewardRate: rawRate,
      effectiveRewardRate: effectiveRate,
      expectedRewardPoints,
      expectedSavings,
      appliedOffer: matchingOffer,
      reasoning,
      rankScore,
    };
  }
}
