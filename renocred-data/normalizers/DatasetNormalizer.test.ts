import { describe, it, expect } from 'vitest';
import { DatasetNormalizer } from './DatasetNormalizer';
import masterCardMaster from '../datasets/renocred_card_master.json';
import legacyMasterDataset from '../datasets/master_dataset.json';

describe('DatasetNormalizer', () => {
  describe('Envelope Handling', () => {
    it('unwraps modern object root with { metadata, data }', () => {
      const payload = {
        metadata: { dataset_name: 'test_dataset', card_count: 2 },
        data: [
          { identity: { card_id: 'card-1', card_name: 'Card One', issuer: 'Bank A' } },
          { identity: { card_id: 'card-2', card_name: 'Card Two', issuer: 'Bank B' } },
        ],
      };

      const unwrapped = DatasetNormalizer.unwrapEnvelope(payload);
      expect(unwrapped.metadata?.dataset_name).toBe('test_dataset');
      expect(unwrapped.data.length).toBe(2);
    });

    it('unwraps legacy top-level array root [...]', () => {
      const legacyArray = [
        { id: 'legacy-1', card_title: 'Legacy Card 1', issuer: 'Bank X' },
        { id: 'legacy-2', card_title: 'Legacy Card 2', issuer: 'Bank Y' },
      ];

      const unwrapped = DatasetNormalizer.unwrapEnvelope(legacyArray);
      expect(unwrapped.metadata).toBeUndefined();
      expect(unwrapped.data.length).toBe(2);
    });

    it('handles null, undefined, or empty payload safely', () => {
      expect(DatasetNormalizer.unwrapEnvelope(null).data).toEqual([]);
      expect(DatasetNormalizer.unwrapEnvelope(undefined).data).toEqual([]);
      expect(DatasetNormalizer.unwrapEnvelope({}).data).toEqual([]);
      expect(DatasetNormalizer.unwrapEnvelope('not an object').data).toEqual([]);
    });
  });

  describe('Target 518-Card Master Dataset Ingestion', () => {
    it('loads and normalizes all 518 cards without silent dropping', () => {
      const results = DatasetNormalizer.normalizeAll(masterCardMaster);
      expect(results.length).toBe(518);

      const report = DatasetNormalizer.validateDatasetIntegrity(
        results,
        masterCardMaster.metadata as any
      );

      expect(report.totalCards).toBe(518);
      // All 518 card IDs are unique
      expect(report.duplicateIdCount).toBe(0);
      expect(report.duplicateCardIds).toEqual([]);
      // Dataset has no total blockers
      expect(report.blockers.length).toBe(0);
      // VALID + NEEDS_REVIEW covers all cards (no silently lost records)
      expect(report.validCards + report.needsReviewCards + report.invalidCards).toBe(518);
    });

    it('preserves all unique card IDs from the source dataset', () => {
      const results = DatasetNormalizer.normalizeAll(masterCardMaster);
      const ids = results.map((r) => r.card.identity.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(518);
      expect(uniqueIds.has('hdfc_diners_club_black_metal_credit_card')).toBe(true);
      expect(uniqueIds.has('hdfc_bharat_credit_card')).toBe(true);
    });

    it('preserves network truth without mutating Diners Club into Visa', () => {
      const results = DatasetNormalizer.normalizeAll(masterCardMaster);
      const dinersCard = results.find(
        (r) => r.card.identity.id === 'hdfc_diners_club_black_metal_credit_card'
      );

      expect(dinersCard).toBeDefined();
      // CRITICAL: Canonical domain model must preserve "Diners Club" exactly
      expect(dinersCard?.card.identity.network).toBe('Diners Club');
    });

    it('preserves null fee without converting unknown fee to 0', () => {
      const results = DatasetNormalizer.normalizeAll(masterCardMaster);
      // Find a card where annual_fee is null in source
      const nullFeeCard = results.find((r) => r.card.identity.id === 'hdfc_bharat_credit_card');

      expect(nullFeeCard).toBeDefined();
      // CRITICAL: Fees remain null when unknown
      expect(nullFeeCard?.card.fees.annualFee).toBeNull();
      expect(nullFeeCard?.card.fees.joiningFee).toBeNull();
    });

    it('preserves structured fee amount and currency when present', () => {
      const results = DatasetNormalizer.normalizeAll(masterCardMaster);
      const metalCard = results.find(
        (r) => r.card.identity.id === 'hdfc_diners_club_black_metal_credit_card'
      );

      expect(metalCard).toBeDefined();
      expect(metalCard?.card.fees.annualFee).toEqual({
        amount: 10000,
        currency: 'INR',
        conditions: 'annual fee/renewal of ₹10000',
      });
      expect(metalCard?.card.fees.feeWaiverAvailable).toBe(true);
      expect(metalCard?.card.fees.feeWaiverCondition).toContain('Spend ₹ 8 Lakhs in 12 Months');
    });

    it('preserves cashback and distinct points earning rules without point-to-percentage conversion', () => {
      const results = DatasetNormalizer.normalizeAll(masterCardMaster);
      const bharatCard = results.find((r) => r.card.identity.id === 'hdfc_bharat_credit_card');

      expect(bharatCard).toBeDefined();
      expect(bharatCard?.card.cashback.available).toBe('AVAILABLE');
      expect(bharatCard?.card.cashback.rates.length).toBeGreaterThan(0);
      expect(bharatCard?.card.cashback.rates[0].rate).toBe(5.0);
      expect(bharatCard?.card.cashback.rates[0].rateType).toBe('EXACT');

      // Check card with points earning rules
      const primeCard = results.find((r) => r.card.identity.id.includes('central_bank_of_india_prime_card') || r.card.identity.name.includes('Prime Card'));
      if (primeCard && primeCard.card.rewards.earningRules) {
        expect(primeCard.card.rewards.earningRules.length).toBeGreaterThan(0);
        // Rate is preserved as raw points rate, NOT multiplied by 0.25 or converted
        const firstRule = primeCard.card.rewards.earningRules[0];
        expect(typeof firstRule.rate).toBe('number');
        expect(typeof firstRule.condition).toBe('string');
      }
    });

    it('preserves evidence data, product family IDs, and recommendation confidence', () => {
      const results = DatasetNormalizer.normalizeAll(masterCardMaster);
      const metalCard = results.find(
        (r) => r.card.identity.id === 'hdfc_diners_club_black_metal_credit_card'
      );

      expect(metalCard).toBeDefined();
      expect(metalCard?.card.identity.productFamilyId).toBe('hdfc_bank_diners_club_black_metal');
      expect(metalCard?.card.lifecycleStatus).toBe('ACTIVE');
      expect(metalCard?.card.recommendationConfidence).toBe('HIGH');
      expect(metalCard?.card.evidenceData.length).toBeGreaterThan(0);
      expect(metalCard?.card.evidenceData[0].field).toBeDefined();
      expect(metalCard?.card.evidenceData[0].evidence).toBeDefined();
    });
  });

  describe('Legacy Dataset Compatibility', () => {
    it('normalizes legacy 209-card flat dataset seamlessly', () => {
      const results = DatasetNormalizer.normalizeAll(legacyMasterDataset);
      expect(results.length).toBe(209);

      const firstCard = results[0];
      expect(firstCard.card.identity.id).toBe('sbm-one-card');
      expect(firstCard.card.identity.name).toBe('SBM One Card credit card');
      expect(firstCard.card.identity.issuer).toBe('SBM Bank');
      expect(firstCard.card.rewards.earningRules?.length).toBeGreaterThan(0);
    });
  });

  describe('Quality Gates and Validation Semantics', () => {
    it('flags card as INVALID with reason if card_id is missing', () => {
      const invalidCard = {
        identity: {
          card_name: 'Nameless Phantom Card',
          issuer: 'Unknown Bank',
        },
      };

      const res = DatasetNormalizer.normalizeCard(invalidCard);
      expect(res.status).toBe('INVALID');
      expect(res.reasons).toContain('Card is missing a unique ID');
    });

    it('flags card as NEEDS_REVIEW with reason if issuer is missing', () => {
      const needsReviewCard = {
        identity: {
          card_id: 'orphaned-card-1',
          card_name: 'Orphan Card',
        },
      };

      const res = DatasetNormalizer.normalizeCard(needsReviewCard);
      expect(res.status).toBe('NEEDS_REVIEW');
      expect(res.reasons).toContain('Card is missing an issuing bank');
    });

    it('detects duplicate card IDs in dataset integrity report', () => {
      const duplicateBatch = [
        { identity: { card_id: 'dup-1', card_name: 'Card 1', issuer: 'Bank A' } },
        { identity: { card_id: 'dup-1', card_name: 'Card 1 Variant', issuer: 'Bank A' } },
        { identity: { card_id: 'unique-2', card_name: 'Card 2', issuer: 'Bank B' } },
      ];

      const results = DatasetNormalizer.normalizeAll(duplicateBatch);
      const report = DatasetNormalizer.validateDatasetIntegrity(results);

      expect(report.duplicateIdCount).toBe(1);
      expect(report.duplicateCardIds).toEqual(['dup-1']);
      expect(report.blockers.some((b) => b.includes('Duplicate card IDs'))).toBe(true);
    });

    it('records warnings for negative financial numbers without crashing', () => {
      const negativeFeeCard = {
        identity: { card_id: 'neg-1', card_name: 'Neg Card', issuer: 'Bank A' },
        fees: { annual_fee: { amount: -500, currency: 'INR' } },
      };

      const res = DatasetNormalizer.normalizeCard(negativeFeeCard);
      expect(res.warnings.some((w) => w.includes('Negative fee value'))).toBe(true);
    });

    it('does not reject a valid card because optional fields like lounge or forex are null', () => {
      const minimalCard = {
        identity: { card_id: 'min-1', card_name: 'Minimal Card', issuer: 'Bank A' },
      };

      const res = DatasetNormalizer.normalizeCard(minimalCard);
      expect(res.status).toBe('VALID');
      expect(res.card.lounge.domesticVisits).toBeNull();
      expect(res.card.fees.forexMarkup).toBeNull();
      expect(res.card.benefits).toEqual([]);
      expect(res.card.milestones).toEqual([]);
    });
  });
});
