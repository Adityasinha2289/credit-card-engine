import { describe, it, expect } from 'vitest';
import { toFinixCard } from './finixAdapter';
import type { CreditCard } from '../types';
import { DatasetNormalizer } from '../normalizers/DatasetNormalizer';
import masterCardMaster from '../datasets/renocred_card_master.json';
import legacyMasterDataset from '../datasets/master_dataset.json';

describe('finixAdapter', () => {
  it('finixAdapter - basic mapping from legacy CreditCard', () => {
    const mockCreditCard: CreditCard = {
      id: 'test-card-1',
      source_id: 'src-1',
      card_title: 'Super Premium Card',
      issuer: 'HDFC Bank',
      network: 'Visa Signature',
      annual_fee: 5000,
      fee_waiver_spend: 500000,
      minimum_income: 1200000,
      minimum_cibil: 750,
      welcome_bonus: '10000 points',
      lounge: [{ limit: 4, frequency: 'year', eligibility: null, category: 'domestic', raw_text: '' }],
      benefits: [
        { category: 'golf', description: '2 free games' },
        { category: 'movie', description: 'BOGO tickets' }
      ],
      rewards: [
        { points: 5, spend: 100, point_type: 'points', category: 'dining', raw_text: '5 pts / 100' },
        { points: 1, spend: 100, point_type: 'points', category: 'other', raw_text: '1 pt / 100' }
      ]
    };

    const finixCard = toFinixCard(mockCreditCard);

    expect(finixCard.id).toBe('test-card-1');
    expect(finixCard.name).toBe('Super Premium Card');
    expect(finixCard.bank).toBe('HDFC Bank');
    expect(finixCard.network).toBe('Visa');
    expect(finixCard.annualFee).toBe(5000);
    expect(finixCard.feeWaiverSpend).toBe(500000);
    expect(finixCard.minIncome).toBe(1200000);
    expect(finixCard.loungeAccess).toBe(4);
    
    expect(finixCard.highlights).toEqual(['2 free games', 'BOGO tickets']);
    expect(finixCard.rewards.length).toBe(2);
    expect(finixCard.rewards[0].category).toBe('dining');
    expect(finixCard.rewards[0].rate).toBe(5);
  });

  it('finixAdapter - mapping from modern CanonicalCard with known fee', () => {
    const canonicalResults = DatasetNormalizer.normalizeAll(masterCardMaster);
    const dinersCard = canonicalResults.find(r => r.card.identity.id === 'hdfc_diners_club_black_metal_credit_card')?.card;
    expect(dinersCard).toBeDefined();

    const finixCard = toFinixCard(dinersCard!);

    expect(finixCard.id).toBe('hdfc_diners_club_black_metal_credit_card');
    expect(finixCard.name).toBe('Diners Club Black METAL Credit Card');
    expect(finixCard.bank).toBe('HDFC Bank');
    // Preserves network truth
    expect(finixCard.network).toBe('Diners Club');
    expect(finixCard.annualFee).toBe(10000);
    expect(finixCard.feeWaiverSpend).toBeUndefined(); // Structured condition text is preserved in canonical
    expect(finixCard.highlights.length).toBeGreaterThan(0);
  });

  it('finixAdapter - preserves network truth without rewriting to Visa', () => {
    const runTest = (network: string | null, expected: string) => {
      const card = toFinixCard({ id: '1', source_id: '1', card_title: 'Test', network } as any);
      expect(card.network).toBe(expected);
    };

    runTest('MasterCard World', 'Mastercard');
    runTest('American Express Platinum', 'Amex');
    runTest('RuPay Select', 'RuPay');
    runTest('Diners Club', 'Diners Club'); // Network truth preserved
    runTest(null, 'Visa');
  });

  it('finixAdapter - handles unknown financial fees and rewards as null (UNKNOWN != 0)', () => {
    const canonicalResults = DatasetNormalizer.normalizeAll(masterCardMaster);
    const unconfirmedCard = canonicalResults.find(r => r.card.fees.annualFee === null && r.card.cashback.rates.length === 0)?.card;
    expect(unconfirmedCard).toBeDefined();

    const finixCard = toFinixCard(unconfirmedCard!);
    // UNKNOWN must remain null, never fabricated as 0
    expect(finixCard.annualFee).toBeNull();
    expect(finixCard.baseRewardRate).toBeNull();
  });

  it('finixAdapter - confirmed zero fee remains 0', () => {
    const zeroFeeCard = toFinixCard({
      id: 'zero-fee-1',
      source_id: 'src-1',
      card_title: 'Zero Fee Card',
      issuer: 'Bank A',
      annual_fee: 0,
    } as any);

    expect(zeroFeeCard.annualFee).toBe(0);
  });

  it('finixAdapter - 518 canonical cards project cleanly without dropping records', () => {
    const canonicalResults = DatasetNormalizer.normalizeAll(masterCardMaster);
    expect(canonicalResults.length).toBe(518);

    const projected = canonicalResults.map(r => toFinixCard(r.card));
    expect(projected.length).toBe(518);

    const uniqueIds = new Set(projected.map(c => c.id));
    expect(uniqueIds.size).toBe(518);
  });

  it('finixAdapter - legacy 209-card dataset still projects cleanly', () => {
    const legacyCards = (legacyMasterDataset as any[]).map(toFinixCard);
    expect(legacyCards.length).toBe(209);
    expect(legacyCards[0].id).toBe('sbm-one-card');
  });
});
