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
    // 1. Base reward rate extraction
    const rawRate = parseFloat(card.rewardRate.replace(/[^0-9.]/g, '')) || 1.0;
    let effectiveRate = rawRate;
    const reasoning: string[] = [];

    // 2. Category match bonus
    const isCategoryMatch = card.categories.includes(category);
    if (isCategoryMatch) {
      effectiveRate += 2.0;
      reasoning.push(`Accelerated ${effectiveRate}% reward rate on ${category}`);
    } else {
      reasoning.push(`Base ${rawRate}% reward rate`);
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
        effectiveRate *= matchingOffer.discountValue;
        reasoning.push(`${matchingOffer.discountValue}× points multiplier active`);
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
    rankScore -= Math.round(card.annualFee * 0.001);

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
