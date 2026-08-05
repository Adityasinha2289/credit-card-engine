import test from 'node:test';
import assert from 'node:assert';
import { CardRepository } from './CardRepository';

test('CardRepository - singleton and validation', () => {
  const repo = CardRepository.getInstance();
  const cards = repo.getCards();
  
  // Basic validation that we get cards back
  assert.ok(cards.length > 0, 'Should return an array of validated cards');
  
  // Verify that all returned cards have a valid structure (because the validator filters them)
  const invalidCard = cards.find(c => !c.id || !c.name || !c.bank || c.annualFee < 0);
  assert.ok(!invalidCard, 'Repository should not return any structurally invalid cards');
  
  const invalidNetwork = cards.find(c => !['Visa', 'Mastercard', 'Amex', 'RuPay'].includes(c.network));
  assert.ok(!invalidNetwork, 'Repository should ensure network type is strictly valid');
});
