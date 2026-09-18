import { describe, it, expect } from 'vitest';

describe('Wallet Compatibility Logic', () => {
  it('matches exactly when a user wallet contains an eligible card ID', () => {
    const offerEligibleCards = ['sbi_simplyclick', 'hdfc_regalia'];
    const userWallet = ['sbi_simplyclick'];
    
    const hasIntersection = offerEligibleCards.some(cardId => userWallet.includes(cardId));
    expect(hasIntersection).toBe(true);
  });

  it('fails safely when there is no matching card', () => {
    const offerEligibleCards = ['sbi_simplyclick'];
    const userWallet = ['hdfc_regalia'];
    
    const hasIntersection = offerEligibleCards.some(cardId => userWallet.includes(cardId));
    expect(hasIntersection).toBe(false);
  });

  it('resolves positively if wallet contains at least one of multiple eligible cards', () => {
    const offerEligibleCards = ['sbi_simplyclick', 'sbi_simplysave', 'sbi_prime'];
    const userWallet = ['sbi_prime', 'hdfc_regalia'];
    
    const hasIntersection = offerEligibleCards.some(cardId => userWallet.includes(cardId));
    expect(hasIntersection).toBe(true);
  });
});
