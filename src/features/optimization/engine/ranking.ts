import type { Offer, PaymentMethod, PaymentRecommendation, SpendingOpportunity } from '../types';
import { BenefitCalculator } from './benefitCalculator';
import { EligibilityEngine } from './eligibility';
import { ExplanationEngine } from './explain';

export class RankingEngine {
  /**
   * Evaluates all payment methods and offers, and ranks them to find the optimal recommendation.
   */
  public static rank(
    opportunity: SpendingOpportunity,
    paymentMethods: PaymentMethod[],
    allOffers: Offer[]
  ): { recommended: PaymentRecommendation | null; alternatives: PaymentRecommendation[] } {
    const evaluatedMethods: PaymentRecommendation[] = [];

    for (const method of paymentMethods) {
      // 1. Find all eligible offers for this payment method
      const eligibleOffers = allOffers.filter(offer =>
        EligibilityEngine.isOfferEligible(offer, opportunity, method)
      );

      // 2. Generate valid combinations of these offers
      const validCombinations = this.generateValidOfferStacks(eligibleOffers);

      // 3. Find the highest value combination for this payment method
      let bestCombination: Offer[] = [];
      let bestBenefit = BenefitCalculator.calculateBenefit(opportunity, []);

      for (const combination of validCombinations) {
        const benefit = BenefitCalculator.calculateBenefit(opportunity, combination);
        if (benefit.totalValue > bestBenefit.totalValue) {
          bestBenefit = benefit;
          bestCombination = combination;
        } else if (benefit.totalValue === bestBenefit.totalValue) {
          // Tie breaker: Prefer upfront discount over deferred rewards
          const currentCashValue = benefit.merchantDiscount + benefit.bankDiscount + benefit.cashbackValue;
          const bestCashValue = bestBenefit.merchantDiscount + bestBenefit.bankDiscount + bestBenefit.cashbackValue;
          if (currentCashValue > bestCashValue) {
            bestBenefit = benefit;
            bestCombination = combination;
          }
        }
      }

      // 4. Create recommendation for this method
      const totalDiscount = bestBenefit.merchantDiscount + bestBenefit.bankDiscount;
      const effectiveCost = Math.max(0, opportunity.baseAmount - totalDiscount);

      evaluatedMethods.push({
        paymentMethodId: method.id,
        paymentMethodName: `${method.provider} ${method.name}`.trim(),
        appliedOffers: bestCombination,
        benefit: bestBenefit,
        effectiveCost,
        savings: bestBenefit.totalValue,
      });
    }

    // 5. Rank all evaluated methods across the board
    evaluatedMethods.sort((a, b) => {
      // Primary: Highest savings (total value)
      if (b.savings !== a.savings) {
        return b.savings - a.savings;
      }
      
      // Secondary: Lower effective cost (in case of ties on value, upfront discount lowers effective cost)
      if (a.effectiveCost !== b.effectiveCost) {
        return a.effectiveCost - b.effectiveCost;
      }

      return 0; // Equal
    });

    if (evaluatedMethods.length === 0) {
      return { recommended: null, alternatives: [] };
    }

    const recommended = evaluatedMethods[0];
    const alternatives = evaluatedMethods.slice(1);

    return { recommended, alternatives };
  }

  /**
   * Generates all valid subsets of offers based on stacking rules.
   * Simple rule: If an offer has mutuallyExclusiveSource = true, it cannot be in a stack 
   * with another offer from the same source.
   */
  private static generateValidOfferStacks(offers: Offer[]): Offer[][] {
    const subsets = this.generateSubsets(offers);
    
    return subsets.filter(subset => {
      const sourceCounts = new Map<string, number>();
      const hasExclusiveSource = new Set<string>();

      for (const offer of subset) {
        const source = offer.source;
        sourceCounts.set(source, (sourceCounts.get(source) || 0) + 1);
        if (offer.eligibility.mutuallyExclusiveSource) {
          hasExclusiveSource.add(source);
        }
      }

      // Validate Mutually Exclusive rules
      for (const source of hasExclusiveSource) {
        // If there's an exclusive offer for this source, there can only be ONE offer from this source total
        if ((sourceCounts.get(source) || 0) > 1) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Helper to generate all subsets (Power Set)
   */
  private static generateSubsets<T>(array: T[]): T[][] {
    return array.reduce(
      (subsets, value) => subsets.concat(subsets.map(set => [value, ...set])),
      [[]] as T[][]
    );
  }
}
