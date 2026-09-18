import { describe, it, expect } from 'vitest';
import { evaluateTransaction, type TransactionContext } from '../evaluateTransaction';
import type { Transaction } from '../../../dashboard/types/dashboard.types';

// We create a mock FinixCard for deterministic tests so we don't rely on the unstable dataset
import { CARD_DATASET, type FinixCard } from '../../data/cardDataset';

describe('evaluateTransaction', () => {
  // Deterministic mock setup
  const MOCK_CARD_ID = 'mock-card-1';
  
  // Inject our mock card into the dataset
  const mockCard: FinixCard = {
    id: MOCK_CARD_ID,
    name: 'Test Cap Card',
    bank: 'TestBank',
    network: 'Visa',
    annualFee: 0,
    baseRewardRate: 1, // 1%
    rewards: [
      {
        category: 'dining',
        rate: 10, // 10%
        cap: 1000 // ₹1000 cap per cycle
      }
    ],
    features: [],
    loungeAccess: { domestic: 0, international: 0 },
    cardType: 'cashback',
    bestFor: [],
    tags: []
  };

  // Push to dataset so the evaluator finds it
  CARD_DATASET.push(mockCard);

  const getContext = (previousEarnedRewardInr: number): TransactionContext => {
    // If rate is 10%, ₹1 reward = ₹10 spend. So we back-calculate the amount in cents.
    // previousEarnedRewardInr = (amountInInr * 10) / 100
    // amountInInr = (previousEarnedRewardInr * 100) / 10
    // amount in cents = amountInInr * 100 = (previousEarnedRewardInr * 1000)
    const amountInCents = previousEarnedRewardInr * 1000;
    
    return {
      previousTransactions: [
        {
          id: 'prev-1',
          merchant: 'zomato',
          amount: amountInCents,
          date: new Date().toISOString(),
          category: 'dining',
          type: 'debit',
          cardId: MOCK_CARD_ID
        }
      ]
    };
  };

  it('CASE 1: No previous spend. Cap = 1000. Potential = 600. Expected: 600', () => {
    // ₹6,000 spend at 10% = ₹600 reward
    const context: TransactionContext = { previousTransactions: [] };
    const result = evaluateTransaction('zomato', 6000, [MOCK_CARD_ID], context);
    
    expect(result).toBeDefined();
    expect(result!.best).toBeDefined();
    expect(result!.best!.cappedRewardValue).toBe(600);
    expect(result!.best!.isCapped).toBe(false);
    expect(result!.best!.capRemaining).toBe(1000);
  });

  it('CASE 2: Previous eligible reward = 600. New potential = 600. Expected: 400', () => {
    // Previous spend yields ₹600
    const context = getContext(600);
    // New spend yields ₹600 theoretically
    const result = evaluateTransaction('zomato', 6000, [MOCK_CARD_ID], context);
    
    expect(result!.best!.cappedRewardValue).toBe(400); // 1000 - 600
    expect(result!.best!.isCapped).toBe(true);
    expect(result!.best!.capRemaining).toBe(400);
  });

  it('CASE 3: Previous eligible reward = 1000. New potential = 600. Expected: 0', () => {
    // Previous spend hit the 1000 cap
    const context = getContext(1000);
    const result = evaluateTransaction('zomato', 6000, [MOCK_CARD_ID], context);
    
    expect(result!.best!.cappedRewardValue).toBe(0);
    expect(result!.best!.isCapped).toBe(true);
    expect(result!.best!.capRemaining).toBe(0);
  });

  it('CASE 4: No history supplied. Expected: estimated/limited result', () => {
    const result = evaluateTransaction('zomato', 6000, [MOCK_CARD_ID], undefined);
    
    expect(result!.best!.cappedRewardValue).toBe(600);
    expect(result!.best!.confidence).toBe('ESTIMATED');
    expect(result!.confidence).toBe('ESTIMATED');
  });

  it('CASE 5: Unknown category. Expected: safe fallback with clear limitation', () => {
    // 'some-unknown-merchant' will map to 'other'
    // 'other' has no specific cap or rate, falls back to baseRewardRate (1%)
    const context: TransactionContext = { previousTransactions: [] };
    const result = evaluateTransaction('some-unknown-merchant', 6000, [MOCK_CARD_ID], context);
    
    expect(result!.category).toBe('other');
    expect(result!.best!.baseRewardValue).toBe(60); // 1% of 6000
    expect(result!.best!.confidence).toBe('EXACT'); // No caps to estimate
    expect(result!.best!.reason).toContain('base reward rate');
  });
  
  it('Edge case: null baseRewardRate correctly falls back to UNSUPPORTED', () => {
    const NO_RATE_CARD_ID = 'mock-card-no-rate';
    CARD_DATASET.push({
      ...mockCard,
      id: NO_RATE_CARD_ID,
      baseRewardRate: null
    });
    
    const context: TransactionContext = { previousTransactions: [] };
    const result = evaluateTransaction('some-unknown-merchant', 6000, [NO_RATE_CARD_ID], context);
    
    expect(result!.confidence).toBe('UNSUPPORTED');
    expect(result!.best).toBeNull();
  });
});
