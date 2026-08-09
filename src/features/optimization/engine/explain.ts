import type { BenefitBreakdown, Offer, PaymentMethod, RecommendationReason } from '../types';

export class ExplanationEngine {
  /**
   * Generates a structured, human-readable reason for why this payment method was recommended.
   */
  public static generateReason(
    paymentMethod: PaymentMethod,
    offers: Offer[],
    breakdown: BenefitBreakdown,
    totalValue: number
  ): RecommendationReason {
    if (offers.length === 0 || totalValue === 0) {
      return {
        primary: `Standard payment via ${paymentMethod.provider} ${paymentMethod.name}.`,
        supportingFactors: ['No specific offers or rewards apply.'],
      };
    }

    const primary = `Highest combined value for your current wallet.`;
    const supportingFactors: string[] = [];

    // Explain upfront discounts
    if (breakdown.merchantDiscount > 0) {
      supportingFactors.push(`₹${breakdown.merchantDiscount.toLocaleString('en-IN')} merchant discount`);
    }
    if (breakdown.bankDiscount > 0) {
      supportingFactors.push(`₹${breakdown.bankDiscount.toLocaleString('en-IN')} bank discount`);
    }

    // Explain cashback
    if (breakdown.cashbackValue > 0) {
      supportingFactors.push(`₹${breakdown.cashbackValue.toLocaleString('en-IN')} cashback`);
    }

    // Explain rewards
    if (breakdown.rewardValue > 0) {
      supportingFactors.push(`₹${breakdown.rewardValue.toLocaleString('en-IN')} estimated reward value`);
    }

    // If multiple offers stacked
    if (offers.length > 1) {
      const stackedSources = Array.from(new Set(offers.map(o => o.source)));
      if (stackedSources.length > 1) {
        supportingFactors.push(`Stacks offers from ${stackedSources.join(' & ')}`);
      }
    }

    return {
      primary,
      supportingFactors,
    };
  }
}
