import { describe, it, expect } from 'vitest';
import { toFinixCard } from './finixAdapter';
import type { CreditCard } from '../types';

describe('finixAdapter', () => {
  it('finixAdapter - basic mapping', () => {
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
    expect(finixCard.minCibil).toBe(750);
    expect(finixCard.welcomeBonus).toBe('10000 points');
    expect(finixCard.loungeAccess).toBe(4);
    
    expect(finixCard.highlights).toEqual(['2 free games', 'BOGO tickets']);
    
    expect(finixCard.rewards.length).toBe(2);
    expect(finixCard.rewards[0].category).toBe('dining');
    expect(finixCard.rewards[0].rate).toBe(5);
    
    expect(finixCard.baseRewardRate).toBe(1);
  });

  it('finixAdapter - edge cases and fallbacks', () => {
    // Card with missing optional fields
    const mockCreditCard: CreditCard = {
      id: 'test-card-2',
      source_id: 'src-2',
      card_title: '',
      rewards: []
    };

    const finixCard = toFinixCard(mockCreditCard);

    expect(finixCard.id).toBe('test-card-2');
    expect(finixCard.name).toBe('Unknown Card');
    expect(finixCard.bank).toBe('Unknown Bank');
    expect(finixCard.network).toBe('Visa'); // Default network fallback
    expect(finixCard.annualFee).toBe(0);
    expect(finixCard.loungeAccess).toBe(0);
    expect(finixCard.baseRewardRate).toBe(1.0); // Fallback base reward rate
    expect(finixCard.highlights).toEqual([]);
    expect(finixCard.rewards).toEqual([]);
  });

  it('finixAdapter - invalid or edge networks', () => {
    const runTest = (network: string | null, expected: string) => {
      const card = toFinixCard({ id: '1', source_id: '1', card_title: 'Test', network } as any);
      expect(card.network).toBe(expected);
    };

    runTest('MasterCard World', 'Mastercard');
    runTest('American Express Platinum', 'Amex');
    runTest('RuPay Select', 'RuPay');
    runTest('Diners Club', 'Visa'); // Fallback for unsupported networks
    runTest(null, 'Visa');
  });

  it('finixAdapter - reward mapping logic edge cases', () => {
    const mockCreditCard = {
      id: '3', source_id: '3', card_title: 'Test',
      rewards: [
        { points: 10, spend: 0, point_type: 'pts', category: 'travel', raw_text: '' } // Divide by zero prevention
      ]
    } as any;

    const finixCard = toFinixCard(mockCreditCard);
    expect(finixCard.rewards[0].rate).toBe(1); // Defaults to 1 if spend is 0 or missing
  });
});
