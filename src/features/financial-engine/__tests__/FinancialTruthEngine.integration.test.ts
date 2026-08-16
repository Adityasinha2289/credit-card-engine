import { describe, it, expect } from 'vitest';
import { FinancialTruthEngine } from '../FinancialTruthEngine';
import { toFinancialCard } from '../adapters/financialAdapter';
import type { CreditCard } from '../../../../renocred-data/types';
import { CandidateGenerator } from '../CandidateGenerator';
import type { UserContext } from '../userContext';

describe('FinancialTruthEngine Integration', () => {
  const rawData: CreditCard = {
    id: "hdfc-millennia",
    card_title: "HDFC Millennia",
    issuer: "HDFC",
    source_id: "src123",
    minimum_income: 300000, // Phase 2: Added explicit eligibility
    minimum_cibil: 700,
    rewards: [
      {
        points: 5.0,
        spend: 100,
        point_type: "CashPoints", 
        category: "Amazon",
        raw_text: "5% CashPoints on Amazon"
      }
    ]
  };
  
  it('Should successfully map a real raw dataset payload into a FinancialCard and calculate', () => {
    const financialCard = toFinancialCard(rawData);
    expect(financialCard).not.toBeNull();
    
    if (financialCard) {
      const amazonResult = FinancialTruthEngine.calculateTransaction(
        { amount: 1000, categoryId: 'Amazon' },
        financialCard
      );
      expect(amazonResult.grossReward).toBe(50);
    }
  });

  it('Phase 2 Integration: Candidate Generation with real card data', () => {
    const financialCard = toFinancialCard(rawData);
    expect(financialCard).not.toBeNull();

    if (financialCard) {
      // 1. User passes eligibility
      const passingContext: UserContext = {
        userId: 'user-pass',
        financialProfile: { creditScore: 750, annualIncome: 500000 },
        spendingProfile: { 'Amazon': { monthlySpend: 10000, transactionCount: 5 } },
        existingWalletCardIds: []
      };

      const passingResult = CandidateGenerator.generate([financialCard], passingContext);
      expect(passingResult.eligible).toHaveLength(1);
      expect(passingResult.eligible[0].spendingOverlap).toHaveProperty('Amazon');

      // 2. User fails eligibility
      const failingContext: UserContext = {
        userId: 'user-fail',
        financialProfile: { creditScore: 600, annualIncome: 200000 },
        spendingProfile: {},
        existingWalletCardIds: []
      };
      const failingResult = CandidateGenerator.generate([financialCard], failingContext);
      expect(failingResult.ineligible).toHaveLength(1);

      // 3. Already Owned
      const ownedContext: UserContext = {
        userId: 'user-owned',
        financialProfile: { creditScore: 750, annualIncome: 500000 },
        spendingProfile: {},
        existingWalletCardIds: ['hdfc-millennia']
      };
      const ownedResult = CandidateGenerator.generate([financialCard], ownedContext);
      expect(ownedResult.alreadyOwned).toHaveLength(1);
    }
  });
});
