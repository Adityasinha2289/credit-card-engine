import type { Offer, PaymentMethod, PaymentRecommendation, SpendingOpportunity } from '../types';
import { BenefitCalculator } from './benefitCalculator';
import { EligibilityEngine } from './eligibility';
import { ExplanationEngine } from './explain';

export class RankingEngine {
  /**
   * Evaluates all payment methods and offers, and ranks them to find the optimal recommendation.
   *
   * Stage 6 Safety Boundary:
   * - Only offers with _eligibilityVerified === true are considered.
   * - Offers lacking the marker are silently excluded to prevent unverified offers from entering ranking.
   * - Deterministic tie-breaking uses offer.id and paymentMethodId for stable ordering.
   * - NaN/Infinity scores are treated as zero to prevent undefined sort behavior.
   */
  public static rank(
    opportunity: SpendingOpportunity,
    paymentMethods: PaymentMethod[],
    allOffers: Offer[]
  ): { recommended: PaymentRecommendation | null; alternatives: PaymentRecommendation[] } {
    // Stage 6: Defensive eligibility boundary — reject unverified offers
    const verifiedOffers = allOffers.filter(offer => offer._eligibilityVerified === true);
    
    const evaluatedMethods: PaymentRecommendation[] = [];

    for (const method of paymentMethods) {
      // 1. Find all eligible offers for this payment method (optimization-level filtering)
      const eligibleOffers = verifiedOffers.filter(offer =>
        EligibilityEngine.isOfferEligible(offer, opportunity, method)
      );

      // 2. Generate valid combinations of these offers
      const validCombinations = this.generateValidOfferStacks(eligibleOffers);

      // 3. Find the highest value combination for this payment method
      let bestCombination: Offer[] = [];
      let bestBenefit = BenefitCalculator.calculateBenefit(opportunity, []);

      for (const combination of validCombinations) {
        const benefit = BenefitCalculator.calculateBenefit(opportunity, combination);
        
        // Stage 6: NaN/Infinity safety — treat malformed scores as 0
        const safeTotal = Number.isFinite(benefit.totalValue) ? benefit.totalValue : 0;
        const safeBestTotal = Number.isFinite(bestBenefit.totalValue) ? bestBenefit.totalValue : 0;
        
        if (safeTotal > safeBestTotal) {
          bestBenefit = benefit;
          bestCombination = combination;
        } else if (safeTotal === safeBestTotal) {
          // Tie breaker: Prefer upfront discount over deferred rewards
          const currentCashValue = benefit.merchantDiscount + benefit.bankDiscount + benefit.cashbackValue;
          const bestCashValue = bestBenefit.merchantDiscount + bestBenefit.bankDiscount + bestBenefit.cashbackValue;
          if (currentCashValue > bestCashValue) {
            bestBenefit = benefit;
            bestCombination = combination;
          } else if (currentCashValue === bestCashValue) {
            // Stage 6: Deterministic tie-break — lower alphabetical offer ID wins
            const currentIds = combination.map(o => o.id).sort().join(',');
            const bestIds = bestCombination.map(o => o.id).sort().join(',');
            if (currentIds < bestIds) {
              bestBenefit = benefit;
              bestCombination = combination;
            }
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
      // Stage 6: NaN safety on final ranking
      const aSavings = Number.isFinite(a.savings) ? a.savings : 0;
      const bSavings = Number.isFinite(b.savings) ? b.savings : 0;
      
      // Primary: Highest savings (total value)
      if (bSavings !== aSavings) {
        return bSavings - aSavings;
      }
      
      // Secondary: Lower effective cost
      const aEffective = Number.isFinite(a.effectiveCost) ? a.effectiveCost : Infinity;
      const bEffective = Number.isFinite(b.effectiveCost) ? b.effectiveCost : Infinity;
      if (aEffective !== bEffective) {
        return aEffective - bEffective;
      }

      // Stage 6: Deterministic tie-break — stable sort by paymentMethodId
      return a.paymentMethodId.localeCompare(b.paymentMethodId);
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
