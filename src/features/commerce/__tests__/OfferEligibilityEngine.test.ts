import { describe, it, expect, beforeEach } from 'vitest';
import { OfferEligibilityEngine, OfferEligibilityContext } from '../services/OfferEligibilityEngine';
import type { CommerceOffer } from '../types';

describe('OfferEligibilityEngine - Deterministic Evaluation', () => {
  let baseOffer: CommerceOffer;
  let baseContext: OfferEligibilityContext;

  beforeEach(() => {
    // A standard active, valid offer with no restrictions
    baseOffer = {
      id: 'test-offer-1',
      source: 'merchant',
      offerType: 'percentage_discount',
      value: 10,
      title: '10% Off',
      description: 'Standard 10% Off',
      minSpend: null,
      maxDiscount: null,
      validFrom: '2020-01-01T00:00:00Z',
      validUntil: '2099-12-31T23:59:59Z',
      status: 'active',
      eligibilityRules: {
        eligible_cards: [],
        unresolved_source_cards: [],
        location: [],
        transaction_type: null,
        online_offline: null
      },
      internal_campaign_metadata: {
        original_valid_until_missing: false,
        canonical_merchant_id: null,
        merchant_reconciliation_status: 'resolved'
      }
    } as any;

    baseContext = {
      userId: 'u1',
      walletCardIds: [],
      evaluationTime: new Date('2025-06-01T12:00:00Z') // A fixed point in time between 2020 and 2099
    };
  });

  describe('Temporal Validity Rules', () => {
    it('11. Currently active offer -> eligible condition', () => {
      const result = OfferEligibilityEngine.evaluate(baseOffer, baseContext);
      expect(result.isEligible).toBe(true);
      expect(result.reasons).toContain('Offer is currently active.');
    });

    it('12. Future offer -> fail', () => {
      baseOffer.validFrom = '2026-01-01T00:00:00Z';
      const result = OfferEligibilityEngine.evaluate(baseOffer, baseContext);
      expect(result.isEligible).toBe(false);
      expect(result.failedConditions).toContain('TIME_FUTURE');
    });

    it('13. Expired offer -> fail', () => {
      baseOffer.validUntil = '2024-01-01T00:00:00Z';
      const result = OfferEligibilityEngine.evaluate(baseOffer, baseContext);
      expect(result.isEligible).toBe(false);
      expect(result.failedConditions).toContain('TIME_EXPIRED');
    });

    it('14. Explicit inactive status -> fail', () => {
      baseOffer.status = 'expired';
      const result = OfferEligibilityEngine.evaluate(baseOffer, baseContext);
      expect(result.isEligible).toBe(false);
      expect(result.failedConditions).toContain('STATUS');
    });

    it('15. Missing original expiry metadata -> handled correctly', () => {
      baseOffer.validUntil = '2099-12-31T23:59:59Z';
      baseOffer.internal_campaign_metadata.original_valid_until_missing = true;
      const result = OfferEligibilityEngine.evaluate(baseOffer, baseContext);
      expect(result.isEligible).toBe(true);
      expect(result.reasons).toContain('Offer is active (no original expiry provided).');
    });
  });

  describe('Card Eligibility Rules', () => {
    it('1. User owns eligible card -> eligible', () => {
      baseOffer.eligibilityRules.eligible_cards = ['hdfc_regalia', 'sbi_simplyclick'];
      baseContext.walletCardIds = ['sbi_simplyclick'];
      const result = OfferEligibilityEngine.evaluate(baseOffer, baseContext);
      expect(result.isEligible).toBe(true);
    });

    it('2. User does not own eligible card -> ineligible', () => {
      baseOffer.eligibilityRules.eligible_cards = ['hdfc_regalia'];
      baseContext.walletCardIds = ['sbi_simplyclick'];
      const result = OfferEligibilityEngine.evaluate(baseOffer, baseContext);
      expect(result.isEligible).toBe(false);
      expect(result.failedConditions).toContain('CARD_NOT_OWNED');
    });

    it('3. Offer has no card restriction -> passes card condition', () => {
      baseOffer.eligibilityRules.eligible_cards = [];
      const result = OfferEligibilityEngine.evaluate(baseOffer, baseContext);
      expect(result.isEligible).toBe(true);
    });

    it('4. Unresolved source card -> never matches (wallet array match ignored)', () => {
      baseOffer.eligibilityRules.eligible_cards = [];
      baseOffer.eligibilityRules.unresolved_source_cards = ['unresolved_hdfc_super'];
      baseContext.walletCardIds = ['unresolved_hdfc_super']; // Even if maliciously injected
      const result = OfferEligibilityEngine.evaluate(baseOffer, baseContext);
      expect(result.isEligible).toBe(true);
      // It passes because eligible_cards is empty; it doesn't artificially match the unresolved array.
    });

    it('5. Multiple eligible cards, user owns one -> eligible', () => {
      baseOffer.eligibilityRules.eligible_cards = ['c1', 'c2', 'c3'];
      baseContext.walletCardIds = ['c3', 'c4'];
      const result = OfferEligibilityEngine.evaluate(baseOffer, baseContext);
      expect(result.isEligible).toBe(true);
    });

    it('6. Empty wallet + restricted offer -> ineligible', () => {
      baseOffer.eligibilityRules.eligible_cards = ['c1'];
      baseContext.walletCardIds = [];
      const result = OfferEligibilityEngine.evaluate(baseOffer, baseContext);
      expect(result.isEligible).toBe(false);
      expect(result.failedConditions).toContain('CARD_NOT_OWNED');
    });
  });

  describe('Merchant Eligibility Rules', () => {
    it('16. Canonical merchant match -> pass', () => {
      baseOffer.internal_campaign_metadata.canonical_merchant_id = 'part-uber';
      baseContext.merchantId = 'part-uber';
      const result = OfferEligibilityEngine.evaluate(baseOffer, baseContext);
      expect(result.isEligible).toBe(true);
    });

    it('17. Different merchant -> fail', () => {
      baseOffer.internal_campaign_metadata.canonical_merchant_id = 'part-uber';
      baseContext.merchantId = 'part-nike';
      const result = OfferEligibilityEngine.evaluate(baseOffer, baseContext);
      expect(result.isEligible).toBe(false);
      expect(result.failedConditions).toContain('MERCHANT_MISMATCH');
    });

    it('18. Unresolved merchant -> never fabricate a match (fails safely)', () => {
      baseOffer.internal_campaign_metadata.source_merchant_id = 'unresolved_merch';
      baseOffer.internal_campaign_metadata.merchant_reconciliation_status = 'unresolved';
      baseContext.merchantId = 'unresolved_merch'; // Malicious/fake injection
      const result = OfferEligibilityEngine.evaluate(baseOffer, baseContext);
      expect(result.isEligible).toBe(false);
      expect(result.unknownConditions).toContain('MERCHANT_UNRESOLVED');
    });
  });

  describe('Minimum Spend Rules', () => {
    it('7. Spend above minimum -> eligible condition', () => {
      baseOffer.minSpend = 500;
      baseContext.transactionAmount = 700;
      const result = OfferEligibilityEngine.evaluate(baseOffer, baseContext);
      expect(result.isEligible).toBe(true);
    });

    it('8. Spend exactly minimum -> eligible condition', () => {
      baseOffer.minSpend = 500;
      baseContext.transactionAmount = 500;
      const result = OfferEligibilityEngine.evaluate(baseOffer, baseContext);
      expect(result.isEligible).toBe(true);
    });

    it('9. Spend below minimum -> fail', () => {
      baseOffer.minSpend = 500;
      baseContext.transactionAmount = 300;
      const result = OfferEligibilityEngine.evaluate(baseOffer, baseContext);
      expect(result.isEligible).toBe(false);
      expect(result.failedConditions).toContain('MIN_SPEND');
    });

    it('10. No minimum spend -> pass', () => {
      baseOffer.minSpend = null;
      baseContext.transactionAmount = 300; // Irrelevant
      const result = OfferEligibilityEngine.evaluate(baseOffer, baseContext);
      expect(result.isEligible).toBe(true);
    });
  });

  describe('Context and Missing Information Rules', () => {
    it('Fails safely if transaction amount is required but missing', () => {
      baseOffer.minSpend = 500;
      baseContext.transactionAmount = undefined;
      const result = OfferEligibilityEngine.evaluate(baseOffer, baseContext);
      expect(result.isEligible).toBe(false);
      expect(result.unknownConditions).toContain('MIN_SPEND_CONTEXT_MISSING');
    });

    it('Fails safely if merchant context is required but missing', () => {
      baseOffer.internal_campaign_metadata.canonical_merchant_id = 'part-uber';
      baseContext.merchantId = undefined;
      const result = OfferEligibilityEngine.evaluate(baseOffer, baseContext);
      expect(result.isEligible).toBe(false);
      expect(result.unknownConditions).toContain('MERCHANT_CONTEXT_MISSING');
    });
  });

  describe('Composition Tests', () => {
    it('19. All conditions pass -> eligible', () => {
      baseOffer.eligibilityRules.eligible_cards = ['c1'];
      baseOffer.minSpend = 500;
      baseOffer.internal_campaign_metadata.canonical_merchant_id = 'm1';
      baseContext.walletCardIds = ['c1'];
      baseContext.transactionAmount = 600;
      baseContext.merchantId = 'm1';
      
      const result = OfferEligibilityEngine.evaluate(baseOffer, baseContext);
      expect(result.isEligible).toBe(true);
    });

    it('20. One mandatory condition fails -> ineligible', () => {
      baseOffer.eligibilityRules.eligible_cards = ['c1']; // PASS
      baseOffer.minSpend = 500; // PASS
      baseOffer.internal_campaign_metadata.canonical_merchant_id = 'm1'; // FAIL
      
      baseContext.walletCardIds = ['c1'];
      baseContext.transactionAmount = 600;
      baseContext.merchantId = 'm2'; // Mismatch
      
      const result = OfferEligibilityEngine.evaluate(baseOffer, baseContext);
      expect(result.isEligible).toBe(false);
      expect(result.failedConditions).toContain('MERCHANT_MISMATCH');
    });

    it('21. Multiple conditions fail -> all relevant reasons returned', () => {
      baseOffer.eligibilityRules.eligible_cards = ['c1']; // FAIL
      baseOffer.minSpend = 500; // FAIL
      baseOffer.status = 'expired'; // FAIL
      
      baseContext.walletCardIds = ['c2'];
      baseContext.transactionAmount = 400;
      
      const result = OfferEligibilityEngine.evaluate(baseOffer, baseContext);
      expect(result.isEligible).toBe(false);
      expect(result.failedConditions).toContain('CARD_NOT_OWNED');
      expect(result.failedConditions).toContain('MIN_SPEND');
      expect(result.failedConditions).toContain('STATUS');
    });
  });

  describe('Location & Channel Tests', () => {
    it('Location matching -> pass', () => {
      baseOffer.eligibilityRules.location = ['Mumbai', 'Delhi'];
      baseContext.location = 'Mumbai';
      const result = OfferEligibilityEngine.evaluate(baseOffer, baseContext);
      expect(result.isEligible).toBe(true);
    });

    it('Location mismatch -> fail', () => {
      baseOffer.eligibilityRules.location = ['Mumbai', 'Delhi'];
      baseContext.location = 'Pune';
      const result = OfferEligibilityEngine.evaluate(baseOffer, baseContext);
      expect(result.isEligible).toBe(false);
      expect(result.failedConditions).toContain('LOCATION_MISMATCH');
    });

    it('Channel matching -> pass', () => {
      baseOffer.eligibilityRules.online_offline = 'ONLINE';
      baseContext.channel = 'ONLINE';
      const result = OfferEligibilityEngine.evaluate(baseOffer, baseContext);
      expect(result.isEligible).toBe(true);
    });

    it('Channel mismatch -> fail', () => {
      baseOffer.eligibilityRules.online_offline = 'ONLINE';
      baseContext.channel = 'OFFLINE';
      const result = OfferEligibilityEngine.evaluate(baseOffer, baseContext);
      expect(result.isEligible).toBe(false);
      expect(result.failedConditions).toContain('CHANNEL_MISMATCH');
    });
  });
});
