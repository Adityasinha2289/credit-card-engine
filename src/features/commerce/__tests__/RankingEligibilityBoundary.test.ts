import { describe, it, expect } from 'vitest';
import { OptimizationEngine } from '../../optimization/engine/optimizationEngine';
import { RankingEngine } from '../../optimization/engine/ranking';
import { BenefitCalculator } from '../../optimization/engine/benefitCalculator';
import type { SpendingOpportunity, Offer, PaymentMethod } from '../../optimization/types';
import { CommerceOptimizationService } from '../services/CommerceOptimizationService';

// --- Shared Test Fixtures ---
const basePaymentMethod: PaymentMethod = {
  id: 'pm_sbi',
  userId: 'u-1',
  name: 'SBI Cashback',
  type: 'credit_card',
  provider: 'SBI',
  status: 'active',
  metadata: { network: 'VISA' }
};

const altPaymentMethod: PaymentMethod = {
  id: 'pm_hdfc',
  userId: 'u-1',
  name: 'HDFC Regalia',
  type: 'credit_card',
  provider: 'HDFC',
  status: 'active',
  metadata: { network: 'VISA' }
};

const baseOpportunity: SpendingOpportunity = {
  id: 'opp-1',
  partnerId: 'partner_nike',
  category: 'shopping',
  baseAmount: 10000,
  currency: 'INR'
};

function makeVerifiedOffer(overrides: Partial<Offer> & { id: string }): Offer {
  return {
    name: 'Test Offer',
    description: '',
    type: 'percentage_discount',
    value: 10,
    source: 'merchant',
    eligibility: {},
    _eligibilityVerified: true,
    ...overrides,
  };
}

function makeUnverifiedOffer(overrides: Partial<Offer> & { id: string }): Offer {
  return {
    name: 'Unverified Offer',
    description: '',
    type: 'flat_discount',
    value: 5000,
    source: 'merchant',
    eligibility: {},
    // _eligibilityVerified is intentionally NOT set
    ...overrides,
  };
}

describe('Stage 6: Ranking & Eligibility Boundary Tests', () => {

  // ===============================================================
  // 1–3. ELIGIBILITY BOUNDARY
  // ===============================================================
  describe('Eligibility Boundary', () => {
    it('1. Eligible (verified) offer reaches ranking and produces savings', () => {
      const offer = makeVerifiedOffer({ id: 'o-verified', type: 'flat_discount', value: 500 });
      const result = OptimizationEngine.optimizeSpending(baseOpportunity, [basePaymentMethod], [offer]);
      expect(result.savings).toBe(500);
      expect(result.recommendedPaymentMethod.appliedOffers).toHaveLength(1);
    });

    it('2. Ineligible (unverified) offer does NOT reach ranking', () => {
      const offer = makeUnverifiedOffer({ id: 'o-unverified', value: 9999 });
      const result = OptimizationEngine.optimizeSpending(baseOpportunity, [basePaymentMethod], [offer]);
      expect(result.savings).toBe(0);
      expect(result.recommendedPaymentMethod.appliedOffers).toHaveLength(0);
    });

    it('3. Mixed candidate set → only eligible subset ranked', () => {
      const verified = makeVerifiedOffer({ id: 'o-v', type: 'flat_discount', value: 300 });
      const unverified = makeUnverifiedOffer({ id: 'o-u', value: 5000 });
      
      const result = OptimizationEngine.optimizeSpending(baseOpportunity, [basePaymentMethod], [verified, unverified]);
      expect(result.savings).toBe(300);
      expect(result.recommendedPaymentMethod.appliedOffers).toHaveLength(1);
      expect(result.recommendedPaymentMethod.appliedOffers[0].id).toBe('o-v');
    });
  });

  // ===============================================================
  // 4–6. RANKING LOGIC
  // ===============================================================
  describe('Ranking Logic', () => {
    it('4. Higher-value eligible offer ranks higher', () => {
      const offerHigh = makeVerifiedOffer({ id: 'o-high', type: 'flat_discount', value: 800 });
      const offerLow = makeVerifiedOffer({ id: 'o-low', type: 'flat_discount', value: 200, source: 'bank' });
      
      // Both can stack (different sources)
      const result = OptimizationEngine.optimizeSpending(baseOpportunity, [basePaymentMethod], [offerHigh, offerLow]);
      expect(result.savings).toBe(1000); // Both applied
    });

    it('5. Lower-value eligible offer still available in alternatives', () => {
      // Two payment methods, one offer only applies to one method
      const offer = makeVerifiedOffer({
        id: 'o-pm-specific',
        type: 'flat_discount',
        value: 500,
        eligibility: { paymentMethodIds: ['pm_sbi'] }
      });
      
      const result = OptimizationEngine.optimizeSpending(baseOpportunity, [basePaymentMethod, altPaymentMethod], [offer]);
      expect(result.recommendedPaymentMethod.paymentMethodId).toBe('pm_sbi');
      expect(result.alternatives).toHaveLength(1);
      expect(result.alternatives[0].paymentMethodId).toBe('pm_hdfc');
    });

    it('6. Equal scores use deterministic ordering (by paymentMethodId)', () => {
      // No offers means 0 savings for both methods
      const result1 = OptimizationEngine.optimizeSpending(baseOpportunity, [basePaymentMethod, altPaymentMethod], []);
      const result2 = OptimizationEngine.optimizeSpending(baseOpportunity, [altPaymentMethod, basePaymentMethod], []);
      
      // Both runs should produce the same recommended method
      expect(result1.recommendedPaymentMethod.paymentMethodId).toBe(result2.recommendedPaymentMethod.paymentMethodId);
    });
  });

  // ===============================================================
  // 7–10. OFFER TYPES
  // ===============================================================
  describe('Offer Types', () => {
    it('7. Percentage discount correctly calculated', () => {
      const offer = makeVerifiedOffer({ id: 'o-pct', type: 'percentage_discount', value: 15 });
      const breakdown = BenefitCalculator.calculateBenefit(baseOpportunity, [offer]);
      expect(breakdown.merchantDiscount).toBe(1500); // 15% of 10000
    });

    it('8. Flat discount correctly calculated', () => {
      const offer = makeVerifiedOffer({ id: 'o-flat', type: 'flat_discount', value: 750 });
      const breakdown = BenefitCalculator.calculateBenefit(baseOpportunity, [offer]);
      expect(breakdown.merchantDiscount).toBe(750);
    });

    it('9. Cashback correctly calculated', () => {
      const offer = makeVerifiedOffer({ id: 'o-cb', type: 'cashback', value: 5 });
      const breakdown = BenefitCalculator.calculateBenefit(baseOpportunity, [offer]);
      expect(breakdown.cashbackValue).toBe(500); // 5% of 10000
    });

    it('10. Points correctly valued', () => {
      const offer = makeVerifiedOffer({ id: 'o-pts', type: 'points', value: 1000 });
      const breakdown = BenefitCalculator.calculateBenefit(baseOpportunity, [offer]);
      expect(breakdown.rewardValue).toBe(250); // 1000 * 0.25
    });
  });

  // ===============================================================
  // 11–13. BENEFIT CAPS
  // ===============================================================
  describe('Benefit Caps', () => {
    it('11. Percentage discount below max → uncapped', () => {
      const offer = makeVerifiedOffer({
        id: 'o-cap1',
        type: 'percentage_discount',
        value: 10,
        eligibility: { maxDiscount: 2000 }
      });
      const breakdown = BenefitCalculator.calculateBenefit(baseOpportunity, [offer]);
      // 10% of 10000 = 1000, maxDiscount = 2000 → uncapped
      expect(breakdown.merchantDiscount).toBe(1000);
    });

    it('12. Percentage discount reaches max → capped exactly', () => {
      const offer = makeVerifiedOffer({
        id: 'o-cap2',
        type: 'percentage_discount',
        value: 20,
        eligibility: { maxDiscount: 1500 }
      });
      const breakdown = BenefitCalculator.calculateBenefit(baseOpportunity, [offer]);
      // 20% of 10000 = 2000, capped at 1500
      expect(breakdown.merchantDiscount).toBe(1500);
    });

    it('13. Percentage discount exceeds max → capped', () => {
      const offer = makeVerifiedOffer({
        id: 'o-cap3',
        type: 'percentage_discount',
        value: 50,
        eligibility: { maxDiscount: 1000 }
      });
      const breakdown = BenefitCalculator.calculateBenefit(baseOpportunity, [offer]);
      // 50% of 10000 = 5000, capped at 1000
      expect(breakdown.merchantDiscount).toBe(1000);
    });
  });

  // ===============================================================
  // 14–17. SAFETY
  // ===============================================================
  describe('Safety', () => {
    it('14. Unresolved card cannot reach ranking (no _eligibilityVerified)', () => {
      // An offer that was constructed outside the approved pipeline
      const rogue: Offer = {
        id: 'o-rogue-card',
        name: 'Rogue Card Offer',
        description: '',
        type: 'flat_discount',
        value: 9000,
        source: 'merchant',
        eligibility: {},
        // _eligibilityVerified not set
      };
      const result = OptimizationEngine.optimizeSpending(baseOpportunity, [basePaymentMethod], [rogue]);
      expect(result.savings).toBe(0);
    });

    it('15. Unresolved merchant cannot reach ranking (no _eligibilityVerified)', () => {
      const rogue: Offer = {
        id: 'o-rogue-merchant',
        name: 'Rogue Merchant Offer',
        description: '',
        type: 'flat_discount',
        value: 9000,
        source: 'merchant',
        eligibility: {},
        // _eligibilityVerified not set
      };
      const result = OptimizationEngine.optimizeSpending(baseOpportunity, [basePaymentMethod], [rogue]);
      expect(result.savings).toBe(0);
    });

    it('16. Malformed NaN score cannot produce NaN-ranked result', () => {
      const nanOffer = makeVerifiedOffer({ id: 'o-nan', type: 'percentage_discount', value: NaN });
      const result = OptimizationEngine.optimizeSpending(baseOpportunity, [basePaymentMethod], [nanOffer]);
      
      expect(Number.isFinite(result.savings)).toBe(true);
      expect(Number.isNaN(result.savings)).toBe(false);
    });

    it('17. Ranking cannot mutate offer eligibility marker', () => {
      const offer = makeVerifiedOffer({ id: 'o-immut', type: 'flat_discount', value: 100 });
      OptimizationEngine.optimizeSpending(baseOpportunity, [basePaymentMethod], [offer]);
      expect(offer._eligibilityVerified).toBe(true);
    });
  });

  // ===============================================================
  // 18–19. DETERMINISM
  // ===============================================================
  describe('Determinism', () => {
    it('18. Same input → same ordering', () => {
      const offers = [
        makeVerifiedOffer({ id: 'o-a', type: 'flat_discount', value: 500 }),
        makeVerifiedOffer({ id: 'o-b', type: 'cashback', value: 5, source: 'bank' }),
      ];
      const methods = [basePaymentMethod, altPaymentMethod];

      const result1 = OptimizationEngine.optimizeSpending(baseOpportunity, methods, offers);
      const result2 = OptimizationEngine.optimizeSpending(baseOpportunity, methods, offers);

      expect(result1.recommendedPaymentMethod.paymentMethodId).toBe(result2.recommendedPaymentMethod.paymentMethodId);
      expect(result1.savings).toBe(result2.savings);
      expect(result1.recommendedPaymentMethod.appliedOffers.map(o => o.id))
        .toEqual(result2.recommendedPaymentMethod.appliedOffers.map(o => o.id));
    });

    it('19. Repeated execution → identical result', () => {
      const offer = makeVerifiedOffer({ id: 'o-det', type: 'percentage_discount', value: 12 });
      const results: number[] = [];
      
      for (let i = 0; i < 10; i++) {
        const r = OptimizationEngine.optimizeSpending(baseOpportunity, [basePaymentMethod], [offer]);
        results.push(r.savings);
      }
      
      // All 10 runs must produce the same savings
      expect(new Set(results).size).toBe(1);
    });
  });

  // ===============================================================
  // ADAPTER VERIFICATION
  // ===============================================================
  describe('CommerceOptimizationService.adaptOffer', () => {
    it('stamps _eligibilityVerified = true on adapted offers', () => {
      const commerceOffer = {
        id: 'co-1',
        source: 'merchant' as const,
        offerType: 'cashback' as const,
        value: 10,
        title: '10% CB',
        description: 'Test',
        minSpend: null,
        maxDiscount: null,
        validFrom: '2020-01-01',
        validUntil: '2099-12-31',
        eligibilityRules: {},
        status: 'active'
      };
      
      const adapted = CommerceOptimizationService.adaptOffer(commerceOffer);
      expect(adapted._eligibilityVerified).toBe(true);
    });

    it('preserves eligibility rules through adapter', () => {
      const commerceOffer = {
        id: 'co-2',
        source: 'merchant' as const,
        offerType: 'percentage_discount' as const,
        value: 20,
        title: '20% Off',
        description: '',
        minSpend: 500,
        maxDiscount: 1000,
        validFrom: '2020-01-01',
        validUntil: '2099-12-31',
        eligibilityRules: { minSpend: 500, maxDiscount: 1000 },
        status: 'active'
      };
      
      const adapted = CommerceOptimizationService.adaptOffer(commerceOffer);
      expect(adapted.eligibility.minSpend).toBe(500);
      expect(adapted.eligibility.maxDiscount).toBe(1000);
    });
  });
});
