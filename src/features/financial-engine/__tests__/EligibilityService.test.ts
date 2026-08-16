import { describe, it, expect } from 'vitest';
import { EligibilityService } from '../EligibilityService';
import type { UserContext } from '../userContext';
import type { FinancialCard } from '../types';

describe('EligibilityService', () => {
  const createMockContext = (overrides?: Partial<UserContext>): UserContext => ({
    userId: 'user-1',
    financialProfile: {
      creditScore: 750,
      annualIncome: 600000,
      employmentType: 'Salaried'
    },
    spendingProfile: {},
    existingWalletCardIds: [],
    ...overrides
  });

  const createMockCard = (eligibility: any[] = []): FinancialCard => ({
    id: 'card-1',
    name: 'Test Card',
    annualFee: 0,
    joiningFee: 0,
    rewardRules: [],
    caps: [],
    redemptionRates: [],
    benefits: [],
    eligibility
  });

  it('1. User with valid CIBIL', () => {
    const card = createMockCard([{ minCibil: 750 }]);
    const context = createMockContext({ financialProfile: { creditScore: 760 } });
    const result = EligibilityService.evaluate(card, context);
    expect(result.status).toBe('ELIGIBLE');
    expect(result.reasons[0]).toContain('>= required 750');
  });

  it('2. User below CIBIL requirement', () => {
    const card = createMockCard([{ minCibil: 750 }]);
    const context = createMockContext({ financialProfile: { creditScore: 720 } });
    const result = EligibilityService.evaluate(card, context);
    expect(result.status).toBe('INELIGIBLE');
    expect(result.failedRules).toContain('CIBIL');
  });

  it('3. Unknown CIBIL (Missing in context)', () => {
    const card = createMockCard([{ minCibil: 750 }]);
    const context = createMockContext({ financialProfile: {} });
    const result = EligibilityService.evaluate(card, context);
    expect(result.status).toBe('UNKNOWN');
    expect(result.unknownRules).toContain('CIBIL');
  });

  it('4. User above income requirement', () => {
    const card = createMockCard([{ minIncome: 500000 }]);
    const context = createMockContext({ financialProfile: { annualIncome: 600000 } });
    const result = EligibilityService.evaluate(card, context);
    expect(result.status).toBe('ELIGIBLE');
  });

  it('5. User below income requirement', () => {
    const card = createMockCard([{ minIncome: 1000000 }]);
    const context = createMockContext({ financialProfile: { annualIncome: 600000 } });
    const result = EligibilityService.evaluate(card, context);
    expect(result.status).toBe('INELIGIBLE');
    expect(result.failedRules).toContain('INCOME');
  });

  it('6. Unknown income', () => {
    const card = createMockCard([{ minIncome: 1000000 }]);
    const context = createMockContext({ financialProfile: {} });
    const result = EligibilityService.evaluate(card, context);
    expect(result.status).toBe('UNKNOWN');
  });

  it('7. Multiple eligibility rules (All Pass)', () => {
    const card = createMockCard([{ minIncome: 500000, minCibil: 750, employmentType: 'Salaried' }]);
    const context = createMockContext();
    const result = EligibilityService.evaluate(card, context);
    expect(result.status).toBe('ELIGIBLE');
  });

  it('8. One failed rule among multiple', () => {
    const card = createMockCard([{ minIncome: 500000, minCibil: 800 }]); // user has 750
    const context = createMockContext();
    const result = EligibilityService.evaluate(card, context);
    expect(result.status).toBe('INELIGIBLE');
    expect(result.failedRules).toContain('CIBIL');
    // But income should be in reasons as passing
    expect(result.reasons.some(r => r.includes('Income:'))).toBe(true);
  });

  it('9. Unknown rule does not override INELIGIBLE', () => {
    const card = createMockCard([{ minIncome: 1000000, minCibil: 750 }]); // Income will fail
    // Cibil is missing, so it's unknown. But income is explicitly failed.
    const context = createMockContext({ financialProfile: { annualIncome: 500000 } }); 
    const result = EligibilityService.evaluate(card, context);
    expect(result.status).toBe('INELIGIBLE'); 
    expect(result.failedRules).toContain('INCOME');
    expect(result.unknownRules).toContain('CIBIL');
  });

  it('10. Already-owned card', () => {
    const card = createMockCard([{ minIncome: 500000 }]);
    const context = createMockContext({ existingWalletCardIds: ['card-1'] });
    const result = EligibilityService.evaluate(card, context);
    expect(result.status).toBe('ALREADY_OWNED');
  });
  
  it('12. Empty wallet evaluation', () => {
    const card = createMockCard([{ minIncome: 500000 }]);
    const context = createMockContext({ existingWalletCardIds: [] });
    const result = EligibilityService.evaluate(card, context);
    expect(result.status).toBe('ELIGIBLE'); // Since income passes
  });
  
  it('19. Unknown eligibility (Missing data in dataset)', () => {
    const card = createMockCard([]); // completely empty array
    const context = createMockContext();
    const result = EligibilityService.evaluate(card, context);
    expect(result.status).toBe('UNKNOWN');
    expect(result.unknownRules).toContain('MISSING_ELIGIBILITY_DATA');
  });

  // Property Invariant Tests
  it('PROPERTY: A card cannot be both ELIGIBLE and INELIGIBLE', () => {
    const card = createMockCard([{ minIncome: 1000000 }]);
    const context = createMockContext({ financialProfile: { annualIncome: 500000 } });
    const result = EligibilityService.evaluate(card, context);
    expect(result.status).toBe('INELIGIBLE');
    expect(result.status).not.toBe('ELIGIBLE');
  });

  it('PROPERTY: Missing income does not become 0', () => {
    const card = createMockCard([{ minIncome: 500000 }]);
    const context = createMockContext({ financialProfile: {} });
    const result = EligibilityService.evaluate(card, context);
    expect(result.status).toBe('UNKNOWN');
    expect(result.failedRules).not.toContain('INCOME'); // It shouldn't fail as 0, it should be unknown
  });
});
