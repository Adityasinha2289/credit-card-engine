import test from 'node:test';
import assert from 'node:assert';
import { toFinixCard } from './finixAdapter';
import type { CreditCard } from '../types';

test('finixAdapter - basic mapping', () => {
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

  assert.strictEqual(finixCard.id, 'test-card-1');
  assert.strictEqual(finixCard.name, 'Super Premium Card');
  assert.strictEqual(finixCard.bank, 'HDFC Bank');
  assert.strictEqual(finixCard.network, 'Visa');
  assert.strictEqual(finixCard.annualFee, 5000);
  assert.strictEqual(finixCard.feeWaiverSpend, 500000);
  assert.strictEqual(finixCard.minIncome, 1200000);
  assert.strictEqual(finixCard.minCibil, 750);
  assert.strictEqual(finixCard.welcomeBonus, '10000 points');
  assert.strictEqual(finixCard.loungeAccess, 4);
  
  assert.deepStrictEqual(finixCard.highlights, ['2 free games', 'BOGO tickets']);
  
  assert.strictEqual(finixCard.rewards.length, 2);
  assert.strictEqual(finixCard.rewards[0].category, 'dining');
  assert.strictEqual(finixCard.rewards[0].rate, 5);
  
  assert.strictEqual(finixCard.baseRewardRate, 1);
});

test('finixAdapter - edge cases and fallbacks', () => {
  // Card with missing optional fields
  const mockCreditCard: CreditCard = {
    id: 'test-card-2',
    source_id: 'src-2',
    card_title: '',
    rewards: []
  };

  const finixCard = toFinixCard(mockCreditCard);

  assert.strictEqual(finixCard.id, 'test-card-2');
  assert.strictEqual(finixCard.name, 'Unknown Card');
  assert.strictEqual(finixCard.bank, 'Unknown Bank');
  assert.strictEqual(finixCard.network, 'Visa'); // Default network fallback
  assert.strictEqual(finixCard.annualFee, 0);
  assert.strictEqual(finixCard.loungeAccess, 0);
  assert.strictEqual(finixCard.baseRewardRate, 1.0); // Fallback base reward rate
  assert.deepStrictEqual(finixCard.highlights, []);
  assert.deepStrictEqual(finixCard.rewards, []);
});

test('finixAdapter - invalid or edge networks', () => {
  const runTest = (network: string | null, expected: string) => {
    const card = toFinixCard({ id: '1', source_id: '1', card_title: 'Test', network } as any);
    assert.strictEqual(card.network, expected);
  };

  runTest('MasterCard World', 'Mastercard');
  runTest('American Express Platinum', 'Amex');
  runTest('RuPay Select', 'RuPay');
  runTest('Diners Club', 'Visa'); // Fallback for unsupported networks
  runTest(null, 'Visa');
});

test('finixAdapter - reward mapping logic edge cases', () => {
  const mockCreditCard = {
    id: '3', source_id: '3', card_title: 'Test',
    rewards: [
      { points: 10, spend: 0, point_type: 'pts', category: 'travel', raw_text: '' } // Divide by zero prevention
    ]
  } as any;

  const finixCard = toFinixCard(mockCreditCard);
  assert.strictEqual(finixCard.rewards[0].rate, 1); // Defaults to 1 if spend is 0 or missing
});
