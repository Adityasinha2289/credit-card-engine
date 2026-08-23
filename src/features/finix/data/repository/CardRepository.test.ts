import { describe, it, expect } from 'vitest';
import { CardRepository } from './CardRepository';

describe('CardRepository', () => {
  it('CardRepository - singleton and validation', () => {
    const repo = CardRepository.getInstance();
    const cards = repo.getCards();
    
    // Basic validation that we get cards back
    expect(cards.length > 0).toBeTruthy();
    
    // Verify that all returned cards have a valid structure (because the validator filters them)
    const invalidCard = cards.find(c => !c.id || !c.name || !c.bank || (c.annualFee !== null && c.annualFee < 0));
    expect(!invalidCard).toBeTruthy();
    
    const invalidNetwork = cards.find(c => !['Visa', 'Mastercard', 'Amex', 'RuPay', 'Diners Club'].includes(c.network));
    expect(!invalidNetwork).toBeTruthy();
    expect(cards.length).toBe(518);
  });
});
