import { describe, it, expect } from 'vitest';
import { CandidateGenerator } from '../CandidateGenerator';
import type { UserContext } from '../userContext';
import type { FinancialCard } from '../types';

describe('CandidateGenerator', () => {
  const createMockContext = (): UserContext => ({
    userId: 'user-1',
    financialProfile: {
      creditScore: 750,
      annualIncome: 600000
    },
    spendingProfile: {
      'dining': { monthlySpend: 5000, transactionCount: 5 },
      'online': { monthlySpend: 10000, transactionCount: 10 },
      'fuel': { monthlySpend: 0, transactionCount: 0 } // No spend
    },
    existingWalletCardIds: ['card-owned']
  });

  const createMockCard = (id: string, rules: any[] = [], eligibility: any[] = []): FinancialCard => ({
    id,
    name: 'Test Card',
    annualFee: 0,
    joiningFee: 0,
    rewardRules: rules,
    caps: [],
    redemptionRates: [],
    benefits: [],
    eligibility
  });

  it('14 & 15 & 16. Spending profile aggregation and unknown categories', () => {
    const context = createMockContext();
    
    // Card has explicit rules for dining, fuel, and travel
    const card = createMockCard('card-eligible', [
      { categoryId: 'dining', isBaseRule: false, isExclusion: false },
      { categoryId: 'fuel', isBaseRule: false, isExclusion: false },
      { categoryId: 'travel', isBaseRule: false, isExclusion: false }
    ], [{ minIncome: 500000 }]); // Eligible

    const result = CandidateGenerator.generate([card], context);
    
    expect(result.eligible).toHaveLength(1);
    const candidate = result.eligible[0];
    
    // Overlap should only contain 'dining'
    // 'online' is in spending, but card doesn't have an explicit rule for it
    // 'fuel' is in card, but user has 0 spend
    // 'travel' is in card, but user has no spend profile for it
    expect(candidate.spendingOverlap).toHaveProperty('dining');
    expect(candidate.spendingOverlap).not.toHaveProperty('online');
    expect(candidate.spendingOverlap).not.toHaveProperty('fuel');
    expect(candidate.spendingOverlap).not.toHaveProperty('travel');
  });

  it('17 & 18. Eligible and Ineligible candidate generation', () => {
    const context = createMockContext();
    const catalog = [
      createMockCard('card-1', [], [{ minIncome: 500000 }]), // Eligible
      createMockCard('card-2', [], [{ minIncome: 1000000 }]), // Ineligible
      createMockCard('card-owned', [], [{ minIncome: 500000 }]), // Already owned
      createMockCard('card-4', [], []) // Unknown
    ];

    const result = CandidateGenerator.generate(catalog, context);
    
    expect(result.eligible).toHaveLength(1);
    expect(result.eligible[0].card.id).toBe('card-1');
    
    expect(result.ineligible).toHaveLength(1);
    expect(result.ineligible[0].card.id).toBe('card-2');
    
    expect(result.alreadyOwned).toHaveLength(1);
    expect(result.alreadyOwned[0].card.id).toBe('card-owned');
    
    expect(result.unknown).toHaveLength(1);
    expect(result.unknown[0].card.id).toBe('card-4');
  });
});
