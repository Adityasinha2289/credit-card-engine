export interface CommissionTerms {
  percentage?: number; // e.g. 5 for 5%
  fixedAmount?: number; // e.g. 500 for Rs. 500
  tiers?: Array<{
    threshold: number; // Spend up to this amount
    percentage?: number;
    fixedAmount?: number;
  }>;
}

export class CommissionCalculator {
  /**
   * Pure function to calculate expected commission from an order value.
   * Ensures floating point precision issues are minimized by rounding.
   * 
   * @param orderValue The total value of the conversion
   * @param model The commission model (cps, cpa, fixed, tiered)
   * @param terms The JSONB configuration terms
   * @returns expected commission amount
   */
  static calculateExpectedCommission(
    orderValue: number,
    model: string,
    terms: CommissionTerms
  ): number {
    if (orderValue < 0) {
      return 0; // Negative order values don't yield negative commission in our standard model
    }

    let commission = 0;

    switch (model.toLowerCase()) {
      case 'cpa':
      case 'fixed':
        commission = terms.fixedAmount || 0;
        break;

      case 'cps':
        if (terms.percentage) {
          commission = orderValue * (terms.percentage / 100);
        }
        break;

      case 'tiered':
        if (terms.tiers && terms.tiers.length > 0) {
          // Sort tiers ascending by threshold just in case
          const sortedTiers = [...terms.tiers].sort((a, b) => a.threshold - b.threshold);
          
          let remainingValue = orderValue;
          let previousThreshold = 0;

          for (const tier of sortedTiers) {
            if (remainingValue <= 0) break;

            // How much of the order value falls into this tier?
            const tierCapacity = tier.threshold - previousThreshold;
            const valueInTier = Math.min(remainingValue, tierCapacity);

            if (tier.percentage) {
              commission += valueInTier * (tier.percentage / 100);
            } else if (tier.fixedAmount && valueInTier > 0) {
              commission += tier.fixedAmount; // Flat fee for hitting this tier
            }

            remainingValue -= valueInTier;
            previousThreshold = tier.threshold;
          }

          // If there's still order value above the highest tier, it yields no extra commission
          // unless a catch-all tier (Infinity) is defined.
        }
        break;

      default:
        commission = 0;
    }

    // Money precision: Round to 2 decimal places to simulate NUMERIC(12,2)
    return Math.round(commission * 100) / 100;
  }
}
