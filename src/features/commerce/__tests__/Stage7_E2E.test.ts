import { describe, it, expect } from 'vitest';
import { OfferEligibilityEngine, OfferEligibilityContext } from '../services/OfferEligibilityEngine';
import { CommerceOptimizationService } from '../services/CommerceOptimizationService';
import { OptimizationEngine } from '../../optimization/engine/optimizationEngine';
import type { CommerceOffer, CommerceEntity } from '../types';
import type { PaymentMethod } from '../../optimization/types';

describe('Stage 7: End-to-End Production Offer Validation & Release Hardening', () => {

  const baseContext: OfferEligibilityContext = {
    userId: 'u-1',
    walletCardIds: ['card-hdfc-1', 'card-sbi-1'], // Server-derived canonical wallet
    merchantId: 'merchant-nike',
    transactionAmount: 10000,
    location: 'online',
    transactionType: 'ecommerce',
    channel: 'web',
    evaluationTime: new Date('2026-09-01T10:00:00Z')
  };

  const baseOpportunity: CommerceEntity = {
    id: 'ent-1',
    partnerId: 'merchant-nike',
    categoryId: 'shopping',
    entityType: 'product',
    name: 'Nike Shoes',
    basePrice: 10000,
    currency: 'INR',
    destinationPath: '/',
    imageUrl: null,
    sku: null,
    status: 'active'
  };

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'card-hdfc-1',
      userId: 'u-1',
      name: 'HDFC Regalia',
      type: 'credit_card',
      provider: 'HDFC',
      status: 'active',
      metadata: {}
    },
    {
      id: 'card-sbi-1',
      userId: 'u-1',
      name: 'SBI Cashback',
      type: 'credit_card',
      provider: 'SBI',
      status: 'active',
      metadata: {}
    }
  ];

  function createCommerceOffer(overrides: Partial<CommerceOffer> & { id: string }): CommerceOffer {
    return {
      source: 'merchant',
      offerType: 'flat_discount',
      value: 100,
      title: 'Test Offer',
      description: 'Desc',
      minSpend: null,
      maxDiscount: null,
      validFrom: '2020-01-01',
      validUntil: '2099-12-31',
      eligibilityRules: {},
      status: 'active',
      ...overrides
    };
  }

  // Helper to simulate the production pipeline
  function runE2EPipeline(offers: CommerceOffer[], context: OfferEligibilityContext) {
    // 1. API: Server-side eligibility engine
    const eligibleCommerceOffers = offers.filter(o => 
      OfferEligibilityEngine.evaluate(o, context).isEligible
    );

    // 2. Client: CommerceOptimizationService receives valid offers and adapts them
    const adaptedOffers = eligibleCommerceOffers.map(CommerceOptimizationService.adaptOffer);

    // 3. Client: OptimizationEngine ranks the verified offers
    // Note: CommerceOptimizationService.optimizeEntity normally calls this, we test the core transition
    const opp = {
      id: baseOpportunity.id,
      partnerId: baseOpportunity.partnerId,
      category: baseOpportunity.categoryId || 'other',
      baseAmount: baseOpportunity.basePrice,
      currency: baseOpportunity.currency || 'INR'
    };

    return {
      eligibleCommerceOffers,
      adaptedOffers,
      result: OptimizationEngine.optimizeSpending(opp, paymentMethods, adaptedOffers)
    };
  }

  describe('5. END-TO-END ELIGIBILITY TESTS', () => {
    it('Scenario A — Eligible offer appears in result', () => {
      const offer = createCommerceOffer({
        id: 'offer-a',
        minSpend: 5000,
        eligibilityRules: {
          eligible_cards: ['card-hdfc-1']
        },
        internal_campaign_metadata: {
          canonical_merchant_id: 'merchant-nike'
        }
      });

      const { result } = runE2EPipeline([offer], baseContext);
      expect(result.recommendedPaymentMethod.appliedOffers).toHaveLength(1);
      expect(result.recommendedPaymentMethod.appliedOffers[0].id).toBe('offer-a');
    });

    it('Scenario B — Wrong card → offer does not appear', () => {
      const offer = createCommerceOffer({
        id: 'offer-b',
        eligibilityRules: {
          eligible_cards: ['card-icici-1'] // User doesn't own this
        }
      });

      const { result } = runE2EPipeline([offer], baseContext);
      expect(result.recommendedPaymentMethod.appliedOffers).toHaveLength(0);
    });

    it('Scenario C — Expired → offer does not appear', () => {
      const offer = createCommerceOffer({
        id: 'offer-c',
        validUntil: '2025-01-01', // Expired compared to context evaluationTime
        eligibilityRules: { eligible_cards: ['card-hdfc-1'] }
      });

      const { result } = runE2EPipeline([offer], baseContext);
      expect(result.recommendedPaymentMethod.appliedOffers).toHaveLength(0);
    });

    it('Scenario D — Future offer → offer does not appear', () => {
      const offer = createCommerceOffer({
        id: 'offer-d',
        validFrom: '2027-01-01', // Future compared to context evaluationTime
        eligibilityRules: { eligible_cards: ['card-hdfc-1'] }
      });

      const { result } = runE2EPipeline([offer], baseContext);
      expect(result.recommendedPaymentMethod.appliedOffers).toHaveLength(0);
    });

    it('Scenario E — Minimum spend failure → offer does not appear', () => {
      const offer = createCommerceOffer({
        id: 'offer-e',
        minSpend: 20000,
        eligibilityRules: { eligible_cards: ['card-hdfc-1'] }
      });

      const { result } = runE2EPipeline([offer], baseContext);
      expect(result.recommendedPaymentMethod.appliedOffers).toHaveLength(0);
    });

    it('Scenario F — Unresolved source card → never treated as match', () => {
      const offer = createCommerceOffer({
        id: 'offer-f',
        eligibilityRules: {
          eligible_cards: [] 
        },
        internal_campaign_metadata: {
          card_reconciliation_status: 'unresolved'
        }
      });

      const { result } = runE2EPipeline([offer], baseContext);
      expect(result.recommendedPaymentMethod.appliedOffers).toHaveLength(0);
    });

    it('Scenario G — Unresolved merchant → never treated as match', () => {
      const offer = createCommerceOffer({
        id: 'offer-g',
        eligibilityRules: {},
        internal_campaign_metadata: {
          merchant_reconciliation_status: 'unresolved',
          source_merchant_id: 'source-cafe'
        }
      });

      // Context requires merchant-nike
      const { result } = runE2EPipeline([offer], baseContext);
      expect(result.recommendedPaymentMethod.appliedOffers).toHaveLength(0);
    });
  });

  describe('6. ELIGIBILITY → RANKING BOUNDARY TEST', () => {
    it('Ineligible high value offer MUST NEVER appear in final result', () => {
      const offerA = createCommerceOffer({
        id: 'offer-a',
        value: 100, // Low value, eligible
        eligibilityRules: { eligible_cards: ['card-hdfc-1'] }
      });

      const offerB = createCommerceOffer({
        id: 'offer-b',
        value: 9999, // High value, ineligible (wrong card)
        eligibilityRules: { eligible_cards: ['card-icici-1'] }
      });

      const offerC = createCommerceOffer({
        id: 'offer-c',
        value: 500, // Med value, eligible
        eligibilityRules: { eligible_cards: ['card-sbi-1'] }
      });

      const pipeline = runE2EPipeline([offerA, offerB, offerC], baseContext);
      
      // Verification
      expect(pipeline.eligibleCommerceOffers.map(o => o.id)).toEqual(['offer-a', 'offer-c']);
      
      const appliedOfferIds = pipeline.result.recommendedPaymentMethod.appliedOffers.map(o => o.id);
      expect(appliedOfferIds).not.toContain('offer-b'); // B must never appear
      expect(appliedOfferIds).toContain('offer-c'); // C is best eligible
    });
  });

  describe('7. DEFENSIVE MARKER TEST', () => {
    it('Offer without _eligibilityVerified marker is rejected by ranking', () => {
      const rogueOffer = CommerceOptimizationService.adaptOffer(createCommerceOffer({ id: 'rogue-1' }));
      
      // Deliberately strip the marker
      delete rogueOffer._eligibilityVerified;

      const opp = { ...baseOpportunity, category: 'shopping' };
      const result = OptimizationEngine.optimizeSpending(opp, paymentMethods, [rogueOffer]);
      
      expect(result.savings).toBe(0);
      expect(result.recommendedPaymentMethod.appliedOffers).toHaveLength(0);
    });

    it('Offer with _eligibilityVerified: false is rejected', () => {
      const rogueOffer = CommerceOptimizationService.adaptOffer(createCommerceOffer({ id: 'rogue-2' }));
      rogueOffer._eligibilityVerified = false;

      const opp = { ...baseOpportunity, category: 'shopping' };
      const result = OptimizationEngine.optimizeSpending(opp, paymentMethods, [rogueOffer]);
      
      expect(result.savings).toBe(0);
    });
  });

  describe('8. FULL TRANSACTION SCENARIOS', () => {
    it('Recommendation changes dynamically based on transaction amount', () => {
      const offer = createCommerceOffer({
        id: 'offer-dynamic',
        minSpend: 500,
        eligibilityRules: {
          eligible_cards: ['card-hdfc-1']
        }
      });

      // 1. Amount too low
      const lowContext = { ...baseContext, transactionAmount: 300 };
      const lowResult = runE2EPipeline([offer], lowContext).result;
      expect(lowResult.savings).toBe(0);

      // 2. Amount sufficient
      const highContext = { ...baseContext, transactionAmount: 500 };
      const highResult = runE2EPipeline([offer], highContext).result;
      expect(highResult.savings).toBe(100);
    });
  });

  describe('9. OFFER TYPE END-TO-END VALIDATION', () => {
    it('Validates all production offer types end-to-end', () => {
      const types = [
        { type: 'percentage_discount', expectedSavings: 1000 }, // 10% of 10000
        { type: 'flat_discount', expectedSavings: 500 },
        { type: 'cashback', expectedSavings: 1000 }, // 10% cashback
        { type: 'points', expectedSavings: 250 }, // 1000 points * 0.25
        { type: 'miles', expectedSavings: 400 }, // 1000 miles * 0.40
        { type: 'reward_multiplier', expectedSavings: 1000 } // 10% of 10000
      ];

      for (const t of types) {
        const offer = createCommerceOffer({
          id: `offer-${t.type}`,
          offerType: t.type as any,
          value: t.type === 'flat_discount' || t.type === 'points' || t.type === 'miles' ? 
            (t.type === 'flat_discount' ? 500 : 1000) : 10,
          eligibilityRules: { eligible_cards: ['card-hdfc-1'] }
        });

        const { result } = runE2EPipeline([offer], baseContext);
        expect(result.savings).toBe(t.expectedSavings);
      }
    });
  });
});
