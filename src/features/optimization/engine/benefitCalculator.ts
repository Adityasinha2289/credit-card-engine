import { BenefitBreakdown, Offer, SpendingOpportunity } from '../types';

export class BenefitCalculator {
  /**
   * For Phase 5B, we assign a deterministic cash valuation to points.
   * e.g., 1 point = ₹0.25
   */
  private static POINT_VALUATION = 0.25;

  /**
   * Calculates the exact monetary benefit breakdown of a given stack of offers.
   * Ensures that discounts don't exceed the base amount, and applies caps correctly.
   */
  public static calculateBenefit(
    opportunity: SpendingOpportunity,
    appliedOffers: Offer[]
  ): BenefitBreakdown {
    const breakdown: BenefitBreakdown = {
      merchantDiscount: 0,
      bankDiscount: 0,
      cashbackValue: 0,
      rewardValue: 0,
      totalValue: 0,
    };

    let remainingBase = Math.max(0, opportunity.baseAmount);

    // Sort offers: discounts first, then cashback, then rewards
    // This ensures upfront discounts reduce the base amount before cashback is calculated.
    const sortedOffers = [...appliedOffers].sort((a, b) => {
      const order = { flat_discount: 1, percentage_discount: 1, cashback: 2, reward_multiplier: 3, points: 4, miles: 5 };
      return order[a.type] - order[b.type];
    });

    for (const offer of sortedOffers) {
      if (remainingBase <= 0) break; // Cannot discount below 0

      let calculatedValue = 0;

      // 1. Calculate raw value based on offer type
      switch (offer.type) {
        case 'flat_discount':
          calculatedValue = offer.value;
          break;
        case 'percentage_discount':
        case 'cashback':
          calculatedValue = remainingBase * (offer.value / 100);
          break;
        case 'reward_multiplier':
          // Assuming 1x = 1% base reward. A 5x multiplier means 5% of base.
          // This is a simplification. Usually rewards are points per 100 spent.
          // For generic calculation: value is interpreted as percentage points.
          calculatedValue = remainingBase * (offer.value / 100);
          break;
        case 'points':
          // Convert points to cash value
          calculatedValue = offer.value * this.POINT_VALUATION;
          break;
        case 'miles':
          // Convert miles to cash value (assume 1 mile = ₹0.40)
          calculatedValue = offer.value * 0.40;
          break;
        default:
          break;
      }

      // 2. Apply Maximum Cap
      if (offer.eligibility.maxDiscount && calculatedValue > offer.eligibility.maxDiscount) {
        calculatedValue = offer.eligibility.maxDiscount;
      }

      // 3. Allocate to proper bucket & reduce remaining base for upfront discounts
      if (offer.type === 'flat_discount' || offer.type === 'percentage_discount') {
        // Ensure discount doesn't exceed remaining base
        calculatedValue = Math.min(calculatedValue, remainingBase);
        remainingBase -= calculatedValue;

        if (offer.source === 'merchant') {
          breakdown.merchantDiscount += calculatedValue;
        } else {
          breakdown.bankDiscount += calculatedValue;
        }
      } else if (offer.type === 'cashback') {
        breakdown.cashbackValue += calculatedValue;
      } else {
        breakdown.rewardValue += calculatedValue;
      }
    }

    breakdown.totalValue =
      breakdown.merchantDiscount +
      breakdown.bankDiscount +
      breakdown.cashbackValue +
      breakdown.rewardValue;

    return breakdown;
  }
}
