import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { OfferEligibilityEngine, OfferEligibilityContext } from '../services/OfferEligibilityEngine';
import type { CommerceOffer } from '../types';
import { OfferMapper } from '../../data-import/offerMapper';
import { CommerceMapper } from '../mappers';
import { MerchantReconciler } from '../../data-import/reconciliation/merchantReconciler';
import { CardReconciler } from '../../data-import/reconciliation/cardReconciler';

describe('Stage 15D - Issuer-level Eligibility and Mapping', () => {
  beforeAll(async () => {
    await MerchantReconciler.initialize();
    await CardReconciler.initialize();
  });

  describe('OfferEligibilityEngine - Core Issuer Logic', () => {
    let baseOffer: CommerceOffer;
    let baseContext: OfferEligibilityContext;

    beforeEach(() => {
      baseOffer = {
        id: 'test-issuer-offer',
        source: 'bank',
        offerType: 'percentage_discount',
        value: 10,
        title: '10% Off with SBI',
        description: 'SBI Card Offer',
        minSpend: null,
        maxDiscount: null,
        validFrom: '2020-01-01T00:00:00Z',
        validUntil: '2099-12-31T23:59:59Z',
        status: 'active',
        eligibilityRules: {
          eligible_cards: [],
          unresolved_source_cards: [],
          issuer: 'SBI',
          location: [],
          transaction_type: null,
          online_offline: null
        },
        internal_campaign_metadata: {
          card_reconciliation_status: 'fully_resolved',
          original_valid_until_missing: false
        }
      } as any;

      baseContext = {
        userId: 'u1',
        walletCardIds: [],
        walletCards: [],
        evaluationTime: new Date('2025-06-01T12:00:00Z')
      };
    });

    it('1. SBI Card issuer-only offer + SBI Card in wallet -> eligible', () => {
      baseContext.walletCardIds = ['pm-1'];
      baseContext.walletCards = [{ id: 'pm-1', provider: 'SBI' }];
      const result = OfferEligibilityEngine.evaluate(baseOffer, baseContext);
      expect(result.isEligible).toBe(true);
      expect(result.reasons).toContain('User owns a card from the required issuer (SBI).');
    });

    it('2. SBI Card issuer-only offer + HDFC card only -> ineligible', () => {
      baseContext.walletCardIds = ['pm-1'];
      baseContext.walletCards = [{ id: 'pm-1', provider: 'HDFC' }];
      const result = OfferEligibilityEngine.evaluate(baseOffer, baseContext);
      expect(result.isEligible).toBe(false);
      expect(result.failedConditions).toContain('ISSUER_NOT_OWNED');
    });

    it('3. SBI Card issuer-only offer + Axis card only -> ineligible', () => {
      baseContext.walletCardIds = ['pm-1'];
      baseContext.walletCards = [{ id: 'pm-1', provider: 'AXIS' }];
      const result = OfferEligibilityEngine.evaluate(baseOffer, baseContext);
      expect(result.isEligible).toBe(false);
      expect(result.failedConditions).toContain('ISSUER_NOT_OWNED');
    });

    it('4. SBI Card issuer-only offer + empty wallet -> ineligible', () => {
      baseContext.walletCardIds = [];
      baseContext.walletCards = [];
      const result = OfferEligibilityEngine.evaluate(baseOffer, baseContext);
      expect(result.isEligible).toBe(false);
      expect(result.unknownConditions).toContain('ISSUER_CONTEXT_MISSING');
    });

    it('5. SBI Card issuer-only offer + wallet card with unknown/missing issuer -> ineligible', () => {
      baseContext.walletCardIds = ['pm-1'];
      baseContext.walletCards = [{ id: 'pm-1', provider: '' }];
      const result = OfferEligibilityEngine.evaluate(baseOffer, baseContext);
      expect(result.isEligible).toBe(false);
      expect(result.unknownConditions).toContain('ISSUER_CONTEXT_MISSING');
    });

    it('6. Issuer-only offer + multiple wallet cards including SBI Card -> eligible', () => {
      baseContext.walletCardIds = ['pm-1', 'pm-2'];
      baseContext.walletCards = [
        { id: 'pm-1', provider: 'HDFC' },
        { id: 'pm-2', provider: 'SBI' }
      ];
      const result = OfferEligibilityEngine.evaluate(baseOffer, baseContext);
      expect(result.isEligible).toBe(true);
    });

    it('7. Existing unrestricted offer with eligible_cards=[] and no issuer restriction -> eligible', () => {
      baseOffer.eligibilityRules.issuer = null;
      baseContext.walletCardIds = ['pm-1'];
      baseContext.walletCards = [{ id: 'pm-1', provider: 'HDFC' }];
      const result = OfferEligibilityEngine.evaluate(baseOffer, baseContext);
      expect(result.isEligible).toBe(true);
      expect(result.reasons).toContain('Offer has no specific card restrictions.');
    });

    it('8. Existing card-specific offer -> preserve current behavior', () => {
      baseOffer.eligibilityRules.issuer = null;
      baseOffer.eligibilityRules.eligible_cards = ['hdfc_regalia'];
      
      baseContext.walletCardIds = ['pm-1'];
      baseContext.walletCards = [{ id: 'pm-1', provider: 'HDFC' }];
      
      let result = OfferEligibilityEngine.evaluate(baseOffer, baseContext);
      expect(result.isEligible).toBe(false); // Does not own hdfc_regalia

      baseContext.walletCardIds = ['hdfc_regalia'];
      result = OfferEligibilityEngine.evaluate(baseOffer, baseContext);
      expect(result.isEligible).toBe(true);
    });

    it('9. Offer with both issuer and eligible_cards restrictions -> both enforced', () => {
      baseOffer.eligibilityRules.issuer = 'SBI';
      baseOffer.eligibilityRules.eligible_cards = ['sbi_simplyclick'];
      
      // Has SBI but wrong card
      baseContext.walletCardIds = ['sbi_prime'];
      baseContext.walletCards = [{ id: 'sbi_prime', provider: 'SBI' }];
      let result = OfferEligibilityEngine.evaluate(baseOffer, baseContext);
      expect(result.isEligible).toBe(false);
      expect(result.failedConditions).toContain('CARD_NOT_OWNED');

      // Has correct card but wrong issuer (should be impossible in practice, but tests AND logic)
      baseContext.walletCardIds = ['sbi_simplyclick'];
      baseContext.walletCards = [{ id: 'sbi_simplyclick', provider: 'HDFC' }];
      result = OfferEligibilityEngine.evaluate(baseOffer, baseContext);
      expect(result.isEligible).toBe(false);
      expect(result.failedConditions).toContain('ISSUER_NOT_OWNED');

      // Has both correct
      baseContext.walletCardIds = ['sbi_simplyclick'];
      baseContext.walletCards = [{ id: 'sbi_simplyclick', provider: 'SBI' }];
      result = OfferEligibilityEngine.evaluate(baseOffer, baseContext);
      expect(result.isEligible).toBe(true);
    });
  });

  describe('10 & G. Representative Regression from 232-Offer Set', () => {
    it('proves end-to-end issuer mapping and eligibility using real data', () => {
      const rawData = fs.readFileSync(path.join(process.cwd(), 'renocred-data/datasets/renocred_offer_master.json'), 'utf8');
      const dataset = JSON.parse(rawData);
      
      // Find one of the 232 SBI offers (e.g. gyftr_sbicard__b7ea0f50d6)
      const realSbiOffer = dataset.data.find((o: any) => o.identity?.offer_id === 'gyftr_sbicard__b7ea0f50d6');
      expect(realSbiOffer).toBeDefined();
      expect(realSbiOffer.identity.issuer).toBe('SBI Card');
      expect(realSbiOffer.eligibility?.card_ids || []).toEqual([]);

      // 1. Map to Supabase Row (proves mapping extracts issuer)
      const supabaseRow = OfferMapper.toSupabaseRow(realSbiOffer);
      expect(supabaseRow.eligibility_rules.issuer).toBe('SBI');
      expect(supabaseRow.eligibility_rules.eligible_cards).toEqual([]);

      // 2. Map to CommerceOffer (proves CommerceMapper retains it)
      const commerceOffer = CommerceMapper.toOffer(supabaseRow as any);
      (commerceOffer as any).internal_campaign_metadata = supabaseRow.internal_campaign_metadata;
      
      // Override temporal and other constraints so we only test issuer logic
      commerceOffer.status = 'active';
      commerceOffer.validUntil = '2099-12-31T23:59:59Z';
      commerceOffer.minSpend = null;
      commerceOffer.eligibilityRules.online_offline = null;
      commerceOffer.eligibilityRules.transaction_type = null;
      commerceOffer.internal_campaign_metadata.merchant_reconciliation_status = 'resolved';

      expect(commerceOffer.eligibilityRules.issuer).toBe('SBI');
      expect(commerceOffer.eligibilityRules.eligible_cards).toEqual([]);

      // 3. Evaluate with SBI wallet (passes)
      const passContext: OfferEligibilityContext = {
        userId: 'u1',
        walletCardIds: ['pm-sbi'],
        walletCards: [{ id: 'pm-sbi', provider: 'SBI' }]
      };
      
      const passResult = OfferEligibilityEngine.evaluate(commerceOffer, passContext);
      if (!passResult.isEligible) {
        console.log('passResult:', passResult);
      }
      expect(passResult.isEligible).toBe(true);

      // 4. Evaluate with HDFC wallet (fails closed)
      const failContext: OfferEligibilityContext = {
        userId: 'u1',
        walletCardIds: ['pm-hdfc'],
        walletCards: [{ id: 'pm-hdfc', provider: 'HDFC' }]
      };
      
      const failResult = OfferEligibilityEngine.evaluate(commerceOffer, failContext);
      expect(failResult.isEligible).toBe(false);
      expect(failResult.failedConditions).toContain('ISSUER_NOT_OWNED');
    });
  });
});
