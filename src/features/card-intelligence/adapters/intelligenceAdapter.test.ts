import { describe, it, expect } from 'vitest';
import { toCreditCardIntelligence } from './intelligenceAdapter';
import type { CreditCard } from '../../../../renocred-data/types';
import { DatasetNormalizer } from '../../../../renocred-data/normalizers/DatasetNormalizer';
import masterCardMaster from '../../../../renocred-data/datasets/renocred_card_master.json';
import legacyMasterDataset from '../../../../renocred-data/datasets/master_dataset.json';

describe('intelligenceAdapter', () => {
  it('maps legacy CreditCard[] to CreditCardIntelligence[] cleanly', () => {
    const legacyCards: CreditCard[] = [
      {
        id: 'card-1',
        source_id: 'src-1',
        card_title: 'HDFC Regalia',
        issuer: 'HDFC Bank',
        network: 'Visa',
        annual_fee: 2500,
        rewards: [
          { points: 4, spend: 150, point_type: 'points', category: 'dining', raw_text: '4 pts per 150' },
        ],
        benefits: [
          { category: 'Lounge', description: '12 complimentary domestic lounge visits' },
        ],
      },
    ];

    const result = toCreditCardIntelligence(legacyCards);
    expect(result.length).toBe(1);
    expect(result[0].id).toBe('card-1');
    expect(result[0].cardName).toBe('HDFC Regalia');
    expect(result[0].issuer).toBe('HDFC Bank');
    expect(result[0].annualFee).toBe(2500);
    expect(result[0].rewardType).toBe('points');
  });

  it('maps 518 CanonicalCard[] to CreditCardIntelligence[] without silent dropping', () => {
    const canonicalResults = DatasetNormalizer.normalizeAll(masterCardMaster);
    expect(canonicalResults.length).toBe(518);

    const canonicalCards = canonicalResults.map(r => r.card);
    const intelCards = toCreditCardIntelligence(canonicalCards);

    expect(intelCards.length).toBe(518);
    const uniqueIds = new Set(intelCards.map(c => c.id));
    expect(uniqueIds.size).toBe(518);
  });

  it('preserves network truth (e.g. Diners Club) in intelligence projection', () => {
    const canonicalResults = DatasetNormalizer.normalizeAll(masterCardMaster);
    const dinersCard = canonicalResults.find(r => r.card.identity.id === 'hdfc_diners_club_black_metal_credit_card')?.card;
    expect(dinersCard).toBeDefined();

    const result = toCreditCardIntelligence([dinersCard!]);
    expect(result.length).toBe(1);
    expect(result[0].network).toBe('Diners Club');
    expect(result[0].annualFee).toBe(10000);
  });

  it('preserves null for unknown financial fields without fabricating numbers', () => {
    const canonicalResults = DatasetNormalizer.normalizeAll(masterCardMaster);
    const unconfirmedCard = canonicalResults.find(r => r.card.fees.annualFee === null && r.card.cashback.rates.length === 0)?.card;
    expect(unconfirmedCard).toBeDefined();

    const result = toCreditCardIntelligence([unconfirmedCard!]);
    expect(result.length).toBe(1);
    expect(result[0].annualFee).toBeNull();
    expect(result[0].forexMarkup).toBeNull();
    expect(result[0].rewardRate).toBe('Terms unconfirmed');
  });

  it('preserves confirmed zero fee as 0', () => {
    const zeroFeeCard: CreditCard = {
      id: 'zero-fee-card',
      source_id: 'src-0',
      card_title: 'Amazon Pay ICICI',
      issuer: 'ICICI Bank',
      annual_fee: 0,
      rewards: [{ points: 5, spend: 100, point_type: 'cashback', category: 'shopping', raw_text: '5% cashback' }],
    };

    const result = toCreditCardIntelligence([zeroFeeCard]);
    expect(result[0].annualFee).toBe(0);
    expect(result[0].joiningFee).toBe(0);
  });

  it('projects legacy 209-card dataset cleanly', () => {
    const result = toCreditCardIntelligence(legacyMasterDataset as any);
    expect(result.length).toBe(209);
  });
});
