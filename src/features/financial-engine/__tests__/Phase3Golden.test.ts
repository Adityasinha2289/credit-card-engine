import { describe, it, expect } from 'vitest';
import { IncrementalValueEngine } from '../IncrementalValueEngine';
import { BaselineWalletEngine } from '../BaselineWalletEngine';
import { RecommendationRanker } from '../RecommendationRanker';
import { CandidateGenerator } from '../CandidateGenerator';
import type { UserContext } from '../userContext';
import type { FinancialCard } from '../types';

describe('Phase 3 Golden Scenarios', () => {
  
  /**
   * GOLDEN SCENARIO 1 (Step 26 Specification):
   * User Dining Spend: ₹20,000/month
   * Existing Card: 5% Cashback on Dining
   * Candidate Card: 6% Cashback on Dining, Annual Fee ₹1,000
   * 
   * Calculation:
   * Candidate gross reward: 20,000 * 6% = ₹1,200/month
   * Existing wallet reward: 20,000 * 5% = ₹1,000/month
   * Incremental reward: ₹1,200 - ₹1,000 = ₹200/month
   * Annual gross incremental: ₹200 * 12 = ₹2,400/year
   * Annual fee: ₹1,000
   * Net incremental annual value: ₹2,400 - ₹1,000 = ₹1,400/year
   */
  it('GOLDEN SCENARIO 1: Pure Dining Upgrade (Step 26 Example)', () => {
    const userContext: UserContext = {
      userId: 'golden-user-1',
      financialProfile: { annualIncome: 800000, creditScore: 760 },
      spendingProfile: {
        'dining': { monthlySpend: 20000, transactionCount: 6 }
      },
      existingWalletCardIds: ['existing-card-1']
    };

    const existingCard: FinancialCard = {
      id: 'existing-card-1',
      name: 'Existing 5% Dining Card',
      annualFee: 0,
      joiningFee: 0,
      rewardRules: [
        { categoryId: 'dining', rewardType: 'CASHBACK', earningMethod: 'PERCENTAGE', baseRate: 5.0, isBaseRule: false, isExclusion: false }
      ],
      caps: [{ period: 'MONTHLY', unit: 'MONETARY', maxValue: 5000 }],
      redemptionRates: [],
      benefits: [],
      eligibility: []
    };

    const candidateCard: FinancialCard = {
      id: 'candidate-card-1',
      name: 'Candidate 6% Dining Card',
      annualFee: 1000,
      joiningFee: 0,
      rewardRules: [
        { categoryId: 'dining', rewardType: 'CASHBACK', earningMethod: 'PERCENTAGE', baseRate: 6.0, isBaseRule: false, isExclusion: false }
      ],
      caps: [{ period: 'MONTHLY', unit: 'MONETARY', maxValue: 5000 }],
      redemptionRates: [],
      benefits: [],
      eligibility: [{ minIncome: 400000, minCibil: 700 }]
    };

    // 1. Verify baseline calculation
    const baselines = BaselineWalletEngine.calculateBaselines(userContext, [existingCard]);
    expect(baselines['dining']).toBe(1000);

    // 2. Verify candidate generation and incremental value
    const candidateContext = {
      card: candidateCard,
      eligibility: { status: 'ELIGIBLE' as const, reasons: [], failedRules: [], unknownRules: [], cardId: candidateCard.id },
      spendingOverlap: { 'dining': userContext.spendingProfile['dining'] }
    };

    const incValue = IncrementalValueEngine.calculate(candidateContext, userContext, baselines);

    const diningBreakdown = incValue.categoryBreakdowns.find(c => c.categoryId === 'dining');
    expect(diningBreakdown).toBeDefined();
    expect(diningBreakdown?.candidateGrossReward).toBe(1200); // ₹1,200/month
    expect(diningBreakdown?.existingBaselineReward).toBe(1000); // ₹1,000/month
    expect(diningBreakdown?.incrementalReward).toBe(200); // ₹200/month
    expect(diningBreakdown?.annualIncrementalReward).toBe(2400); // ₹2,400/year

    expect(incValue.annualGrossIncrementalReward).toBe(2400); // ₹2,400/year
    expect(incValue.annualFee).toBe(1000);
    expect(incValue.netAnnualValue).toBe(1400); // ₹1,400/year
    expect(incValue.steadyStateAnnualValue).toBe(1400);
    expect(incValue.dataQuality).toBe('COMPLETE');
  });

  /**
   * GOLDEN SCENARIO 2: Multi-Category Portfolio Optimization
   * User Spend:
   * - Dining: ₹15,000/mo
   * - Travel: ₹25,000/mo
   * - Groceries: ₹10,000/mo
   * 
   * Existing Wallet:
   * - Card A: 5% Dining (750/mo), 1% Groceries (100/mo)
   * - Card B: 2% Travel (500/mo)
   * 
   * Candidate Card (Premium Travel + Dining Card):
   * - 4% Dining (600/mo -> 0 incremental because Card A gives 750)
   * - 8% Travel (2000/mo -> +1500 incremental over Card B's 500)
   * - 5% Groceries (500/mo -> +400 incremental over Card A's 100)
   * Annual Fee: ₹3,000, Joining Fee: ₹1,500
   * 
   * Expected:
   * Monthly incremental: 0 (dining) + 1500 (travel) + 400 (groceries) = ₹1,900/mo
   * Annual Gross Incremental: 1,900 * 12 = ₹22,800/yr
   * Steady-State Net Annual Value: 22,800 - 3,000 = ₹19,800/yr
   * First-Year Net Annual Value: 22,800 - (3000 + 1500) = ₹18,300/yr
   */
  it('GOLDEN SCENARIO 2: Multi-Category Portfolio Optimization with Cannibalization & Two-Tier Fees', () => {
    const userContext: UserContext = {
      userId: 'golden-user-2',
      financialProfile: { annualIncome: 2000000, creditScore: 800 },
      spendingProfile: {
        'dining': { monthlySpend: 15000, transactionCount: 4 },
        'travel': { monthlySpend: 25000, transactionCount: 2 },
        'groceries': { monthlySpend: 10000, transactionCount: 5 }
      },
      existingWalletCardIds: ['card-a', 'card-b']
    };

    const cardA: FinancialCard = {
      id: 'card-a',
      name: 'Existing Dining & Everyday Card',
      annualFee: 500,
      joiningFee: 0,
      rewardRules: [
        { categoryId: 'dining', rewardType: 'CASHBACK', earningMethod: 'PERCENTAGE', baseRate: 5.0, isBaseRule: false, isExclusion: false },
        { categoryId: 'groceries', rewardType: 'CASHBACK', earningMethod: 'PERCENTAGE', baseRate: 1.0, isBaseRule: false, isExclusion: false }
      ],
      caps: [{ period: 'MONTHLY', unit: 'MONETARY', maxValue: 5000 }],
      redemptionRates: [],
      benefits: [],
      eligibility: []
    };

    const cardB: FinancialCard = {
      id: 'card-b',
      name: 'Existing Basic Travel Card',
      annualFee: 0,
      joiningFee: 0,
      rewardRules: [
        { categoryId: 'travel', rewardType: 'CASHBACK', earningMethod: 'PERCENTAGE', baseRate: 2.0, isBaseRule: false, isExclusion: false }
      ],
      caps: [{ period: 'MONTHLY', unit: 'MONETARY', maxValue: 5000 }],
      redemptionRates: [],
      benefits: [],
      eligibility: []
    };

    const candidate: FinancialCard = {
      id: 'candidate-premium-travel',
      name: 'Premium Travel & Lifestyle Card',
      annualFee: 3000,
      joiningFee: 1500,
      rewardRules: [
        { categoryId: 'dining', rewardType: 'CASHBACK', earningMethod: 'PERCENTAGE', baseRate: 4.0, isBaseRule: false, isExclusion: false },
        { categoryId: 'travel', rewardType: 'CASHBACK', earningMethod: 'PERCENTAGE', baseRate: 8.0, isBaseRule: false, isExclusion: false },
        { categoryId: 'groceries', rewardType: 'CASHBACK', earningMethod: 'PERCENTAGE', baseRate: 5.0, isBaseRule: false, isExclusion: false }
      ],
      caps: [{ period: 'MONTHLY', unit: 'MONETARY', maxValue: 10000 }],
      redemptionRates: [],
      benefits: [
        { benefitType: 'lounge', details: { access: 'unlimited' }, rawSourceText: 'Unlimited international and domestic lounge access' }
      ],
      eligibility: [{ minIncome: 1000000, minCibil: 750 }]
    };

    const baselines = BaselineWalletEngine.calculateBaselines(userContext, [cardA, cardB]);
    expect(baselines['dining']).toBe(750);
    expect(baselines['travel']).toBe(500);
    expect(baselines['groceries']).toBe(100);

    const candidates = CandidateGenerator.generate([candidate], userContext);
    const ranked = RecommendationRanker.rank(candidates, userContext, [cardA, cardB]);

    expect(ranked).toHaveLength(1);
    const topRec = ranked[0];

    expect(topRec.economicValue.annualGrossIncrementalReward).toBe(22800);
    expect(topRec.economicValue.annualFee).toBe(3000);
    expect(topRec.economicValue.joiningFee).toBe(1500);
    expect(topRec.economicValue.firstYearNetValue).toBe(18300);
    expect(topRec.economicValue.steadyStateAnnualValue).toBe(19800);
    expect(topRec.economicValue.netAnnualValue).toBe(19800);
    expect(topRec.readiness).toBe('ACTIONABLE');

    // Verify non-monetized benefits preserved
    expect(topRec.economicValue.nonMonetizedBenefits).toHaveLength(1);
    expect(topRec.economicValue.nonMonetizedBenefits[0].benefitType).toBe('lounge');
  });

  /**
   * GOLDEN SCENARIO 3: Strict Gating for Missing Data (Step 23 Specification)
   * Candidate 1: Verified Cashback, Net Value = ₹5,000/year (ACTIONABLE)
   * Candidate 2: 10X Points Card with unknown redemption value (INSUFFICIENT_DATA)
   * 
   * Expected:
   * Candidate 1 is ranked #1 as ACTIONABLE.
   * Candidate 2 is classified as INSUFFICIENT_DATA and carries explanation,
   * NOT artificially placed ahead or given fabricated 0/1:1 economics.
   */
  it('GOLDEN SCENARIO 3: Missing Redemption Gating & Truthful Explanations', () => {
    const userContext: UserContext = {
      userId: 'golden-user-3',
      financialProfile: { annualIncome: 1500000, creditScore: 780 },
      spendingProfile: {
        'shopping': { monthlySpend: 20000, transactionCount: 4 }
      },
      existingWalletCardIds: []
    };

    const cashbackCard: FinancialCard = {
      id: 'verified-cashback',
      name: 'Simple Cashback Card',
      annualFee: 1000,
      joiningFee: 0,
      rewardRules: [
        { categoryId: 'shopping', rewardType: 'CASHBACK', earningMethod: 'PERCENTAGE', baseRate: 3.0, isBaseRule: false, isExclusion: false }
      ],
      caps: [{ period: 'MONTHLY', unit: 'MONETARY', maxValue: 2000 }],
      redemptionRates: [],
      benefits: [],
      eligibility: [{ minIncome: 300000, minCibil: 700 }]
    };

    const unknownPointsCard: FinancialCard = {
      id: 'unknown-points',
      name: 'Unverified Points Card',
      annualFee: 500,
      joiningFee: 0,
      rewardRules: [
        { categoryId: 'shopping', rewardType: 'POINTS', earningMethod: 'POINTS_PER_SPEND', pointsAwarded: 20, spendRequirement: 100, isBaseRule: false, isExclusion: false }
      ],
      caps: [{ period: 'MONTHLY', unit: 'POINTS', maxValue: 20000 }],
      redemptionRates: [], // MISSING REDEMPTION RATES
      benefits: [],
      eligibility: [{ minIncome: 300000, minCibil: 700 }]
    };

    const candidates = CandidateGenerator.generate([cashbackCard, unknownPointsCard], userContext);
    const ranked = RecommendationRanker.rank(candidates, userContext, []);

    expect(ranked[0].card.id).toBe('verified-cashback');
    expect(ranked[0].readiness).toBe('ACTIONABLE');
    expect(ranked[0].economicValue.netAnnualValue).toBe(6200); // 20k * 3% = 600/mo = 7200/yr - 1000 = 6200

    expect(ranked[1].card.id).toBe('unknown-points');
    expect(ranked[1].readiness).toBe('INSUFFICIENT_DATA');
    expect(ranked[1].reasons).toContain('This card requires additional financial data (e.g., redemption value) to calculate true economic value.');
  });
});
