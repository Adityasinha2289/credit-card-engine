import { Offer, OptimizationResult, PaymentMethod, SpendingOpportunity } from '../types';
import { RankingEngine } from './ranking';
import { ExplanationEngine } from './explain';

export class OptimizationEngine {
  /**
   * The primary entry point for the Optimization Engine.
   * Takes a single spending opportunity and evaluates the best payment method based on available offers.
   */
  public static optimizeSpending(
    opportunity: SpendingOpportunity,
    paymentMethods: PaymentMethod[],
    offers: Offer[]
  ): OptimizationResult {
    // 1. Evaluate and rank all payment methods
    const { recommended, alternatives } = RankingEngine.rank(opportunity, paymentMethods, offers);

    // 2. Format result
    if (!recommended) {
      // Fallback if no payment methods passed (or none were valid, though ranking engine handles 0 offers fine)
      throw new Error('No valid payment methods available to process this opportunity.');
    }

    // 3. Generate explanation for the recommended method
    const reason = ExplanationEngine.generateReason(
      paymentMethods.find(m => m.id === recommended.paymentMethodId)!,
      recommended.appliedOffers,
      recommended.benefit,
      recommended.savings
    );

    return {
      opportunityId: opportunity.id,
      baseAmount: opportunity.baseAmount,
      recommendedPaymentMethod: recommended,
      alternatives,
      effectiveCost: recommended.effectiveCost,
      totalValue: recommended.savings,
      savings: recommended.savings,
      reason,
    };
  }
}
