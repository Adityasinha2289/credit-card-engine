import { describe, expect, it } from 'vitest';
import { OptimizationEngine } from '../engine/optimizationEngine';
import { BenefitCalculator } from '../engine/benefitCalculator';
import { EligibilityEngine } from '../engine/eligibility';
import { MOCK_PAYMENT_METHODS } from '../mock/paymentMethods';
import { MOCK_OFFERS } from '../mock/offers';
import { Offer, SpendingOpportunity } from '../types';

describe('Optimization Engine - Pure Domain', () => {

  describe('Eligibility Engine', () => {
    const opp: SpendingOpportunity = {
      id: 'test-opp',
      partnerId: 'part-nike',
      category: 'shopping',
      baseAmount: 5000,
      currency: 'INR',
    };
    const pm = MOCK_PAYMENT_METHODS.find(p => p.id === 'pm-hdfc-diners')!;

    it('should pass an eligible offer', () => {
      const offer = MOCK_OFFERS.find(o => o.id === 'off-nike-10')!;
      expect(EligibilityEngine.isOfferEligible(offer, opp, pm)).toBe(true);
    });

    it('should fail if minimum spend is not met', () => {
      const offer = MOCK_OFFERS.find(o => o.id === 'off-nike-10')!; // Min spend 3000
      const smallOpp = { ...opp, baseAmount: 2000 };
      expect(EligibilityEngine.isOfferEligible(offer, smallOpp, pm)).toBe(false);
    });

    it('should fail if category does not match', () => {
      const offer = MOCK_OFFERS.find(o => o.id === 'off-hdfc-dining-5x')!; // Dining only
      expect(EligibilityEngine.isOfferEligible(offer, opp, pm)).toBe(false); // Opp is shopping
    });

    it('should fail if payment method ID does not match', () => {
      const offer = MOCK_OFFERS.find(o => o.id === 'off-sbi-online-5')!;
      expect(EligibilityEngine.isOfferEligible(offer, opp, pm)).toBe(false); // PM is HDFC
    });
  });

  describe('Benefit Calculator', () => {
    const opp: SpendingOpportunity = {
      id: 'test-opp',
      partnerId: 'part-nike',
      category: 'shopping',
      baseAmount: 10000,
      currency: 'INR',
    };

    it('calculates flat discount correctly', () => {
      const flatOffer: Offer = {
        id: 'o1', name: 'Flat 500', description: '', type: 'flat_discount', value: 500, source: 'merchant', eligibility: {}
      };
      const benefit = BenefitCalculator.calculateBenefit(opp, [flatOffer]);
      expect(benefit.merchantDiscount).toBe(500);
      expect(benefit.totalValue).toBe(500);
    });

    it('calculates percentage discount with max cap correctly', () => {
      const pctOffer: Offer = {
        id: 'o2', name: '10% off up to 500', description: '', type: 'percentage_discount', value: 10, source: 'merchant', 
        eligibility: { maxDiscount: 500 }
      };
      // 10% of 10000 is 1000, but cap is 500
      const benefit = BenefitCalculator.calculateBenefit(opp, [pctOffer]);
      expect(benefit.merchantDiscount).toBe(500);
      expect(benefit.totalValue).toBe(500);
    });

    it('calculates points valuation correctly', () => {
      const ptsOffer: Offer = {
        id: 'o3', name: '1000 pts', description: '', type: 'points', value: 1000, source: 'bank', eligibility: {}
      };
      const benefit = BenefitCalculator.calculateBenefit(opp, [ptsOffer]);
      // Assuming point valuation is 0.25 (1000 * 0.25 = 250)
      expect(benefit.rewardValue).toBe(250);
      expect(benefit.totalValue).toBe(250);
    });
    
    it('safely handles 0 spend edge case', () => {
      const zeroOpp = { ...opp, baseAmount: 0 };
      const flatOffer: Offer = {
        id: 'o1', name: 'Flat 500', description: '', type: 'flat_discount', value: 500, source: 'merchant', eligibility: {}
      };
      const benefit = BenefitCalculator.calculateBenefit(zeroOpp, [flatOffer]);
      expect(benefit.merchantDiscount).toBe(0);
      expect(benefit.totalValue).toBe(0);
    });

    it('safely handles negative amount edge case', () => {
      const negOpp = { ...opp, baseAmount: -500 };
      const pctOffer: Offer = {
        id: 'o1', name: '10%', description: '', type: 'percentage_discount', value: 10, source: 'merchant', eligibility: {}
      };
      const benefit = BenefitCalculator.calculateBenefit(negOpp, [pctOffer]);
      expect(benefit.merchantDiscount).toBe(0);
      expect(benefit.totalValue).toBe(0);
    });
  });

  describe('Optimization Engine & Ranking', () => {
    it('optimizes shopping: Nike ₹12,000 scenario', () => {
      const opp: SpendingOpportunity = {
        id: 'opp-nike',
        partnerId: 'part-nike',
        category: 'shopping',
        baseAmount: 12000,
        currency: 'INR',
      };
      
      const result = OptimizationEngine.optimizeSpending(opp, MOCK_PAYMENT_METHODS, MOCK_OFFERS);
      
      // Expected: Nike has 2 mutually exclusive merchant offers (10% up to 500 vs flat 200). 500 > 200.
      // SBI gives 5% cashback on 12000 - 500 (discount) = 11500. 5% of 11500 = 575.
      // Axis gives 2% cashback. 
      // SBI should be recommended.
      expect(result.recommendedPaymentMethod.paymentMethodId).toBe('pm-sbi-cashback');
      expect(result.savings).toBe(500 + 575); // 1075
      expect(result.effectiveCost).toBe(11500); // 12000 - 500 upfront discount = 11500. (Cashback is deferred)
      
      // Ensure mutually exclusive merchant offers were handled (only 1 merchant offer applied)
      const merchantOffers = result.recommendedPaymentMethod.appliedOffers.filter(o => o.source === 'merchant');
      expect(merchantOffers.length).toBe(1);
    });

    it('handles tie-breakers correctly: cash vs points', () => {
      // If two cards give the exact same total value, the one with upfront discount / cashback wins over points.
      // E.g. flat ₹100 discount vs 400 points (value ₹100).
      const opp: SpendingOpportunity = {
        id: 'opp-tie',
        partnerId: 'test',
        category: 'other',
        baseAmount: 1000,
        currency: 'INR',
      };

      const pmA = { ...MOCK_PAYMENT_METHODS[0], id: 'pm-cash' }; // Cash
      const pmB = { ...MOCK_PAYMENT_METHODS[0], id: 'pm-points' }; // Points

      const cashOffer: Offer = {
        id: 'off-cash', name: 'Cash', description: '', type: 'flat_discount', value: 100, source: 'bank', 
        eligibility: { paymentMethodIds: ['pm-cash'] }
      };
      const pointsOffer: Offer = {
        id: 'off-pts', name: 'Points', description: '', type: 'points', value: 400, source: 'bank', 
        eligibility: { paymentMethodIds: ['pm-points'] }
      };

      const result = OptimizationEngine.optimizeSpending(opp, [pmA, pmB], [cashOffer, pointsOffer]);
      
      expect(result.recommendedPaymentMethod.paymentMethodId).toBe('pm-cash');
    });

    it('fails safely when no valid payment methods are provided', () => {
      const opp: SpendingOpportunity = {
        id: 'opp',
        partnerId: 'test',
        category: 'other',
        baseAmount: 1000,
        currency: 'INR',
      };
      expect(() => OptimizationEngine.optimizeSpending(opp, [], [])).toThrow();
    });

    it('returns standard payment when no offers are eligible', () => {
      const opp: SpendingOpportunity = {
        id: 'opp',
        partnerId: 'test',
        category: 'other',
        baseAmount: 1000,
        currency: 'INR',
      };
      const pms = [MOCK_PAYMENT_METHODS[3]]; // UPI (has no offers)
      const result = OptimizationEngine.optimizeSpending(opp, pms, MOCK_OFFERS);
      expect(result.totalValue).toBe(0);
      expect(result.recommendedPaymentMethod.paymentMethodId).toBe('pm-icici-upi');
      expect(result.reason.primary).toContain('Standard payment via ICICI UPI');
    });
  });

});
