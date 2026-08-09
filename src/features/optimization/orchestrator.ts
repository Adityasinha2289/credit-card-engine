import type { Offer, OptimizationResult, PaymentMethod, SpendingOpportunity } from './types';
import { OptimizationEngine } from './engine/optimizationEngine';

export interface ItineraryOptimizationResult {
  totalBaseAmount: number;
  totalEffectiveCost: number;
  totalSavings: number;
  items: OptimizationResult[];
}

export class OptimizationOrchestrator {
  /**
   * Optimizes an entire itinerary of multiple spending opportunities.
   */
  public static optimizeItinerary(
    opportunities: SpendingOpportunity[],
    paymentMethods: PaymentMethod[],
    offers: Offer[]
  ): ItineraryOptimizationResult {
    let totalBaseAmount = 0;
    let totalEffectiveCost = 0;
    let totalSavings = 0;
    const items: OptimizationResult[] = [];

    for (const opp of opportunities) {
      totalBaseAmount += opp.baseAmount;
      try {
        const result = OptimizationEngine.optimizeSpending(opp, paymentMethods, offers);
        items.push(result);
        totalEffectiveCost += result.effectiveCost;
        totalSavings += result.savings;
      } catch (err) {
        // Fallback for this item if no payment methods are valid
        console.warn(`Could not optimize opportunity ${opp.id}`, err);
        totalEffectiveCost += opp.baseAmount;
        items.push({
          opportunityId: opp.id,
          baseAmount: opp.baseAmount,
          recommendedPaymentMethod: {
            paymentMethodId: 'fallback',
            paymentMethodName: 'Standard Payment',
            appliedOffers: [],
            benefit: { merchantDiscount: 0, bankDiscount: 0, cashbackValue: 0, rewardValue: 0, totalValue: 0 },
            effectiveCost: opp.baseAmount,
            savings: 0,
          },
          alternatives: [],
          effectiveCost: opp.baseAmount,
          totalValue: 0,
          savings: 0,
          reason: { primary: 'Standard payment with no offers.', supportingFactors: [] },
        });
      }
    }

    return {
      totalBaseAmount,
      totalEffectiveCost,
      totalSavings,
      items,
    };
  }
}
