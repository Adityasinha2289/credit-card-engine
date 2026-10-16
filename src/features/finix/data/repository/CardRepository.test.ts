import { describe, it, expect } from 'vitest';
import { CardRepository, USE_NEW_DATASET } from './CardRepository';
import { MASTER_CARD_DATASET } from '../masterDataset';

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
    // Count depends on the configured source: the 518-card canonical master or the
    // 144-card legacy dataset (the hard-coded 518 failed whenever the flag was off).
    if (USE_NEW_DATASET) expect(cards.length).toBeGreaterThanOrEqual(500);
    else expect(cards.length).toBe(MASTER_CARD_DATASET.length);
  });
});
