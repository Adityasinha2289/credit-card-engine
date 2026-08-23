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

    // 2. Category match bonus (only if card has confirmed percentage reward or category match)
    const isCategoryMatch = card.categories.includes(category);
    if (isCategoryMatch) {
      if (isExplicitPercentage) {
        effectiveRate += 2.0;
        reasoning.push(`Accelerated ${effectiveRate}% reward rate on ${category}`);
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
    const expectedRewardPoints = Math.round(expectedSavings * 2);

    // 5. Rank score formula
    let rankScore = expectedSavings * 10 + effectiveRate * 5;
    if (card.premiumTier === 'super_premium' || card.premiumTier === 'premium') {
      rankScore += 50;
    }
    if (card.annualFee !== null && card.annualFee > 0) {
      rankScore -= Math.round(card.annualFee * 0.001);
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
