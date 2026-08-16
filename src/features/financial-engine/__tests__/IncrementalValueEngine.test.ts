import { describe, it, expect } from 'vitest';
import { IncrementalValueEngine } from '../IncrementalValueEngine';
import { BaselineWalletEngine } from '../BaselineWalletEngine';
import { CandidateGenerator } from '../CandidateGenerator';
import type { UserContext } from '../userContext';
import type { CandidateContext } from '../CandidateGenerator';
import type { FinancialCard, RewardRule, RewardCap, RedemptionRate, CardBenefit } from '../types';

describe('IncrementalValueEngine — 25 Standard Test Suite Scenarios', () => {
  const createMockContext = (overrides?: Partial<UserContext>): UserContext => ({
    userId: 'user-1',
    financialProfile: { annualIncome: 1000000, creditScore: 750 },
    spendingProfile: {
      'dining': { monthlySpend: 20000, transactionCount: 5 },
      'travel': { monthlySpend: 10000, transactionCount: 2 },
      'shopping': { monthlySpend: 15000, transactionCount: 4 },
      'fuel': { monthlySpend: 5000, transactionCount: 2 },
      'zeroSpend': { monthlySpend: 0, transactionCount: 0 }
    },
    existingWalletCardIds: [],
    ...overrides
  });

  const createCandidate = (
    rules: RewardRule[],
    caps: RewardCap[] = [],
    redemptionRates: RedemptionRate[] = [],
    annualFee = 1000,
    joiningFee = 0,
    benefits: CardBenefit[] = [],
    id = 'candidate-1'
  ): CandidateContext => {
    const card: FinancialCard = {
      id,
      name: `Candidate Card ${id}`,
      annualFee,
      joiningFee,
      rewardRules: rules,
      caps,
      redemptionRates,
      benefits,
      eligibility: [{ minIncome: 300000, minCibil: 700 }]
    };

    return {
      card,
      eligibility: { status: 'ELIGIBLE', reasons: [], failedRules: [], unknownRules: [], cardId: id },
      spendingOverlap: { 'dining': { monthlySpend: 20000, transactionCount: 5 } }
    };
  };

  // Scenario 1: No existing wallet
  it('Scenario 1: No existing wallet (baseline = 0, full candidate reward is incremental)', () => {
    const context = createMockContext();
    const baselines: Record<string, number> = {}; // Empty wallet
    
    const candidate = createCandidate([
      { categoryId: 'dining', rewardType: 'CASHBACK', earningMethod: 'PERCENTAGE', baseRate: 5.0, isBaseRule: false, isExclusion: false }
    ], [{ period: 'MONTHLY', unit: 'MONETARY', maxValue: 5000 }], [], 0);

    const result = IncrementalValueEngine.calculate(candidate, context, baselines);
    
    // 20,000 * 5% = 1,000/mo = 12,000/yr
    expect(result.categoryBreakdowns.find(c => c.categoryId === 'dining')?.incrementalReward).toBe(1000);
    expect(result.annualGrossIncrementalReward).toBe(12000);
    expect(result.netAnnualValue).toBe(12000);
  });

  // Scenario 2: Existing wallet with superior card
  it('Scenario 2: Existing wallet with superior card (candidate yields 0 incremental reward)', () => {
    const context = createMockContext();
    const baselines = { 'dining': 1500 }; // Existing card gives 7.5% (1500)
    
    const candidate = createCandidate([
      { categoryId: 'dining', rewardType: 'CASHBACK', earningMethod: 'PERCENTAGE', baseRate: 5.0, isBaseRule: false, isExclusion: false } // Gives 1000
    ], [{ period: 'MONTHLY', unit: 'MONETARY', maxValue: 5000 }], [], 1000);

    const result = IncrementalValueEngine.calculate(candidate, context, baselines);
    
    expect(result.categoryBreakdowns.find(c => c.categoryId === 'dining')?.incrementalReward).toBe(0);
    expect(result.annualGrossIncrementalReward).toBe(0);
    expect(result.netAnnualValue).toBe(-1000); // 0 - 1000 fee
  });

  // Scenario 3: Candidate slightly better than existing card
  it('Scenario 3: Candidate slightly better than existing card (captures marginal delta)', () => {
    const context = createMockContext();
    const baselines = { 'dining': 1000 }; // Existing 5%
    
    const candidate = createCandidate([
      { categoryId: 'dining', rewardType: 'CASHBACK', earningMethod: 'PERCENTAGE', baseRate: 5.5, isBaseRule: false, isExclusion: false } // Gives 1100
    ], [{ period: 'MONTHLY', unit: 'MONETARY', maxValue: 5000 }], [], 500);

    const result = IncrementalValueEngine.calculate(candidate, context, baselines);
    
    expect(result.categoryBreakdowns.find(c => c.categoryId === 'dining')?.incrementalReward).toBe(100);
    expect(result.annualGrossIncrementalReward).toBe(1200); // 100 * 12
    expect(result.netAnnualValue).toBe(700); // 1200 - 500
  });

  // Scenario 4: Candidate much better than existing card
  it('Scenario 4: Candidate much better than existing card (large incremental reward)', () => {
    const context = createMockContext();
    const baselines = { 'dining': 200 }; // Existing 1%
    
    const candidate = createCandidate([
      { categoryId: 'dining', rewardType: 'CASHBACK', earningMethod: 'PERCENTAGE', baseRate: 10.0, isBaseRule: false, isExclusion: false } // Gives 2000
    ], [{ period: 'MONTHLY', unit: 'MONETARY', maxValue: 5000 }], [], 1000);

    const result = IncrementalValueEngine.calculate(candidate, context, baselines);
    
    expect(result.categoryBreakdowns.find(c => c.categoryId === 'dining')?.incrementalReward).toBe(1800);
    expect(result.annualGrossIncrementalReward).toBe(21600); // 1800 * 12
    expect(result.netAnnualValue).toBe(20600); // 21600 - 1000
  });

  // Scenario 5: Candidate worse than existing card
  it('Scenario 5: Candidate worse than existing card (clamped to 0, no negative reward)', () => {
    const context = createMockContext();
    const baselines = { 'travel': 1000 }; // Existing 10% on 10,000 travel
    
    const candidate = createCandidate([
      { categoryId: 'travel', rewardType: 'CASHBACK', earningMethod: 'PERCENTAGE', baseRate: 3.0, isBaseRule: false, isExclusion: false } // Gives 300
    ], [{ period: 'MONTHLY', unit: 'MONETARY', maxValue: 5000 }], [], 500);

    const result = IncrementalValueEngine.calculate(candidate, context, baselines);
    
    expect(result.categoryBreakdowns.find(c => c.categoryId === 'travel')?.incrementalReward).toBe(0);
    expect(result.annualGrossIncrementalReward).toBe(0);
  });

  // Scenario 6: Zero spending category
  it('Scenario 6: Zero spending category produces zero incremental reward', () => {
    const context = createMockContext();
    const baselines = { 'zeroSpend': 0 };
    
    const candidate = createCandidate([
      { categoryId: 'zeroSpend', rewardType: 'CASHBACK', earningMethod: 'PERCENTAGE', baseRate: 50.0, isBaseRule: false, isExclusion: false }
    ], [{ period: 'MONTHLY', unit: 'MONETARY', maxValue: 5000 }], [], 0);

    const result = IncrementalValueEngine.calculate(candidate, context, baselines);
    
    const zeroBreakdown = result.categoryBreakdowns.find(c => c.categoryId === 'zeroSpend');
    expect(zeroBreakdown).toBeUndefined(); // Zero spend skipped from positive calculations
    expect(result.annualGrossIncrementalReward).toBe(0);
  });

  // Scenario 7: Multiple spending categories
  it('Scenario 7: Multiple spending categories aggregated correctly', () => {
    const context = createMockContext();
    const baselines = { 'dining': 600, 'travel': 300, 'shopping': 300 };
    
    const candidate = createCandidate([
      { categoryId: 'dining', rewardType: 'CASHBACK', earningMethod: 'PERCENTAGE', baseRate: 5.0, isBaseRule: false, isExclusion: false }, // 20k * 5% = 1000 (+400)
      { categoryId: 'travel', rewardType: 'CASHBACK', earningMethod: 'PERCENTAGE', baseRate: 8.0, isBaseRule: false, isExclusion: false }, // 10k * 8% = 800 (+500)
      { categoryId: 'shopping', rewardType: 'CASHBACK', earningMethod: 'PERCENTAGE', baseRate: 4.0, isBaseRule: false, isExclusion: false } // 15k * 4% = 600 (+300)
    ], [{ period: 'MONTHLY', unit: 'MONETARY', maxValue: 5000 }], [], 2500);

    const result = IncrementalValueEngine.calculate(candidate, context, baselines);
    
    // Monthly incremental = 400 + 500 + 300 = 1200
    // Annual gross incremental = 1200 * 12 = 14400
    // Net annual value = 14400 - 2500 = 11900
    expect(result.annualGrossIncrementalReward).toBe(14400);
    expect(result.netAnnualValue).toBe(11900);
  });

  // Scenario 8: Annual fee deduction
  it('Scenario 8: Annual fee is verified and subtracted from annual gross incremental reward', () => {
    const context = createMockContext();
    const baselines = { 'dining': 0 };
    
    const candidate = createCandidate([
      { categoryId: 'dining', rewardType: 'CASHBACK', earningMethod: 'PERCENTAGE', baseRate: 5.0, isBaseRule: false, isExclusion: false }
    ], [{ period: 'MONTHLY', unit: 'MONETARY', maxValue: 5000 }], [], 2500);

    const result = IncrementalValueEngine.calculate(candidate, context, baselines);
    
    expect(result.annualGrossIncrementalReward).toBe(12000);
    expect(result.annualFee).toBe(2500);
    expect(result.annualFeeStatus).toBe('VERIFIED');
    expect(result.netAnnualValue).toBe(9500);
  });

  // Scenario 9: Unknown annual fee
  it('Scenario 9: Unknown annual fee sets annualFeeStatus to UNKNOWN and dataQuality to PARTIAL', () => {
    const context = createMockContext();
    const baselines = { 'dining': 0 };
    
    const candidate = createCandidate([
      { categoryId: 'dining', rewardType: 'CASHBACK', earningMethod: 'PERCENTAGE', baseRate: 5.0, isBaseRule: false, isExclusion: false }
    ], [{ period: 'MONTHLY', unit: 'MONETARY', maxValue: 5000 }], [], 0);
    delete (candidate.card as any).annualFee;

    const result = IncrementalValueEngine.calculate(candidate, context, baselines);
    
    expect(result.annualFeeStatus).toBe('UNKNOWN');
    expect(result.dataQuality).toBe('PARTIAL');
    expect(result.warnings).toContain('Annual fee is unknown, net value is potentially inaccurate.');
  });

  // Scenario 10: Known cap
  it('Scenario 10: Known cap constrains monthly candidate gross reward', () => {
    const context = createMockContext();
    const baselines = { 'dining': 0 };
    
    // Spend is 20,000. 10% = 2,000. Capped at 500/mo.
    const candidate = createCandidate(
      [{ id: 'r1', categoryId: 'dining', rewardType: 'CASHBACK', earningMethod: 'PERCENTAGE', baseRate: 10.0, isBaseRule: false, isExclusion: false }],
      [{ period: 'MONTHLY', unit: 'MONETARY', maxValue: 500, linkedRuleIds: ['r1'] }],
      [],
      0
    );

    const result = IncrementalValueEngine.calculate(candidate, context, baselines);
    
    expect(result.categoryBreakdowns.find(c => c.categoryId === 'dining')?.candidateGrossReward).toBe(500);
    expect(result.annualGrossIncrementalReward).toBe(6000); // 500 * 12
    expect(result.dataQuality).toBe('COMPLETE');
  });

  // Scenario 11: Missing cap
  it('Scenario 11: Missing cap flags dataQuality as PARTIAL and issues warning', () => {
    const context = createMockContext();
    const baselines = { 'dining': 0 };
    
    const candidate = createCandidate([
      { categoryId: 'dining', rewardType: 'CASHBACK', earningMethod: 'PERCENTAGE', baseRate: 5.0, isBaseRule: false, isExclusion: false }
    ], [], [], 0); // No caps array

    const result = IncrementalValueEngine.calculate(candidate, context, baselines);
    
    expect(result.dataQuality).toBe('PARTIAL');
    expect(result.warnings).toContain('Calculation may be artificially high due to missing cap constraints.');
  });

  // Scenario 12: Shared cap
  it('Scenario 12: Shared cap applies to rule correctly', () => {
    const context = createMockContext();
    const baselines = { 'dining': 0 };
    
    const candidate = createCandidate(
      [
        { id: 'rule_a', categoryId: 'dining', rewardType: 'CASHBACK', earningMethod: 'PERCENTAGE', baseRate: 10.0, isBaseRule: false, isExclusion: false }
      ],
      [
        { id: 'shared_cap', period: 'MONTHLY', unit: 'MONETARY', maxValue: 750, linkedRuleIds: ['rule_a', 'rule_b'] }
      ],
      [],
      0
    );

    const result = IncrementalValueEngine.calculate(candidate, context, baselines);
    
    expect(result.categoryBreakdowns.find(c => c.categoryId === 'dining')?.candidateGrossReward).toBe(750);
  });

  // Scenario 13: Cashback reward
  it('Scenario 13: Direct cashback monetary reward is computed at 1:1', () => {
    const context = createMockContext();
    const baselines = { 'shopping': 0 };
    
    const candidate = createCandidate([
      { categoryId: 'shopping', rewardType: 'CASHBACK', earningMethod: 'PERCENTAGE', baseRate: 5.0, isBaseRule: false, isExclusion: false }
    ], [{ period: 'MONTHLY', unit: 'MONETARY', maxValue: 5000 }], [], 0);

    const result = IncrementalValueEngine.calculate(candidate, context, baselines);
    
    // 15,000 * 5% = 750
    expect(result.categoryBreakdowns.find(c => c.categoryId === 'shopping')?.candidateGrossReward).toBe(750);
    expect(result.annualGrossIncrementalReward).toBe(9000);
  });

  // Scenario 14: Points reward with verified redemption rate
  it('Scenario 14: Points reward with verified redemption rate computes precise monetary value', () => {
    const context = createMockContext();
    const baselines = { 'travel': 0 };
    
    // 10,000 travel spend -> 10 pts per 100 spend = 1000 pts. Redemption 0.50 INR/pt = 500 INR.
    const candidate = createCandidate(
      [{ categoryId: 'travel', rewardType: 'POINTS', earningMethod: 'POINTS_PER_SPEND', pointsAwarded: 10, spendRequirement: 100, isBaseRule: false, isExclusion: false }],
      [{ period: 'MONTHLY', unit: 'POINTS', maxValue: 10000 }],
      [{ pointTypeName: 'TravelPoints', mechanism: 'TRAVEL', monetaryValue: 0.50 }],
      0
    );

    const result = IncrementalValueEngine.calculate(candidate, context, baselines);
    
    expect(result.categoryBreakdowns.find(c => c.categoryId === 'travel')?.candidateGrossReward).toBe(500);
    expect(result.annualGrossIncrementalReward).toBe(6000);
    expect(result.dataQuality).toBe('COMPLETE');
  });

  // Scenario 15: Miles reward with verified redemption rate
  it('Scenario 15: Miles reward with verified redemption rate computes precise monetary value', () => {
    const context = createMockContext();
    const baselines = { 'travel': 0 };
    
    // 10,000 spend -> 4 miles per 100 spend = 400 miles. Redemption 1.25 INR/mile = 500 INR.
    const candidate = createCandidate(
      [{ categoryId: 'travel', rewardType: 'MILES', earningMethod: 'POINTS_PER_SPEND', pointsAwarded: 4, spendRequirement: 100, isBaseRule: false, isExclusion: false }],
      [{ period: 'MONTHLY', unit: 'MILES', maxValue: 5000 }],
      [{ pointTypeName: 'AirMiles', mechanism: 'TRAVEL', monetaryValue: 1.25 }],
      0
    );

    const result = IncrementalValueEngine.calculate(candidate, context, baselines);
    
    expect(result.categoryBreakdowns.find(c => c.categoryId === 'travel')?.candidateGrossReward).toBe(500);
    expect(result.annualGrossIncrementalReward).toBe(6000);
    expect(result.dataQuality).toBe('COMPLETE');
  });

  // Scenario 16: Missing redemption rate
  it('Scenario 16: Missing redemption rate does NOT assume 1:1, flags INCOMPLETE data quality', () => {
    const context = createMockContext();
    const baselines = { 'travel': 0 };
    
    const candidate = createCandidate(
      [{ categoryId: 'travel', rewardType: 'POINTS', earningMethod: 'POINTS_PER_SPEND', pointsAwarded: 10, spendRequirement: 100, isBaseRule: false, isExclusion: false }],
      [{ period: 'MONTHLY', unit: 'POINTS', maxValue: 10000 }],
      [], // Missing redemption rates
      0
    );

    const result = IncrementalValueEngine.calculate(candidate, context, baselines);
    
    expect(result.dataQuality).toBe('INCOMPLETE');
    expect(result.annualGrossIncrementalReward).toBe(0);
    expect(result.warnings).toContain('Cannot calculate economic value: Missing redemption ratio.');
  });

  // Scenario 17: Existing card overlap
  it('Scenario 17: Overlap level is accurately classified', () => {
    const context = createMockContext();
    const baselines = { 'dining': 500, 'travel': 200, 'shopping': 0 };
    
    // Overlaps with dining and travel
    const candidate = createCandidate([
      { categoryId: 'dining', rewardType: 'CASHBACK', earningMethod: 'PERCENTAGE', baseRate: 6.0, isBaseRule: false, isExclusion: false },
      { categoryId: 'travel', rewardType: 'CASHBACK', earningMethod: 'PERCENTAGE', baseRate: 5.0, isBaseRule: false, isExclusion: false }
    ], [{ period: 'MONTHLY', unit: 'MONETARY', maxValue: 5000 }], [], 0);

    const result = IncrementalValueEngine.calculate(candidate, context, baselines);
    
    expect(result.overlapLevel).toBe('HIGH_OVERLAP');
    expect(result.overlapCategories).toEqual(['dining', 'travel']);
  });

  // Scenario 18: Already-owned card exclusion
  it('Scenario 18: Already owned cards are identified and separated by CandidateGenerator', () => {
    const context = createMockContext({ existingWalletCardIds: ['card-owned-1'] });
    const candidate = createCandidate([], [], [], 0, 0, [], 'card-owned-1');

    const genResult = CandidateGenerator.generate([candidate.card], context);
    
    expect(genResult.alreadyOwned).toHaveLength(1);
    expect(genResult.eligible).toHaveLength(0);
  });

  // Scenario 19: Multiple existing cards
  it('Scenario 19: Multiple existing cards form the combined highest baseline across categories', () => {
    const context = createMockContext();
    const cardA: FinancialCard = {
      id: 'wallet-a',
      name: 'Dining Card',
      annualFee: 0,
      joiningFee: 0,
      rewardRules: [{ categoryId: 'dining', rewardType: 'CASHBACK', earningMethod: 'PERCENTAGE', baseRate: 5.0, isBaseRule: false, isExclusion: false }],
      caps: [],
      redemptionRates: [],
      benefits: [],
      eligibility: []
    };
    const cardB: FinancialCard = {
      id: 'wallet-b',
      name: 'Travel Card',
      annualFee: 0,
      joiningFee: 0,
      rewardRules: [{ categoryId: 'travel', rewardType: 'CASHBACK', earningMethod: 'PERCENTAGE', baseRate: 6.0, isBaseRule: false, isExclusion: false }],
      caps: [],
      redemptionRates: [],
      benefits: [],
      eligibility: []
    };

    const baselines = BaselineWalletEngine.calculateBaselines(context, [cardA, cardB]);
    expect(baselines['dining']).toBe(1000); // 20k * 5%
    expect(baselines['travel']).toBe(600); // 10k * 6%

    // Candidate offers 6% dining and 4% travel
    const candidate = createCandidate([
      { categoryId: 'dining', rewardType: 'CASHBACK', earningMethod: 'PERCENTAGE', baseRate: 6.0, isBaseRule: false, isExclusion: false },
      { categoryId: 'travel', rewardType: 'CASHBACK', earningMethod: 'PERCENTAGE', baseRate: 4.0, isBaseRule: false, isExclusion: false }
    ], [{ period: 'MONTHLY', unit: 'MONETARY', maxValue: 5000 }], [], 0);

    const result = IncrementalValueEngine.calculate(candidate, context, baselines);
    
    // Dining incremental = 1200 - 1000 = 200
    // Travel incremental = 400 - 600 = 0 (clamped)
    expect(result.categoryBreakdowns.find(c => c.categoryId === 'dining')?.incrementalReward).toBe(200);
    expect(result.categoryBreakdowns.find(c => c.categoryId === 'travel')?.incrementalReward).toBe(0);
    expect(result.annualGrossIncrementalReward).toBe(2400);
  });

  // Scenario 20: Candidate with incomplete data
  it('Scenario 20: Candidate with incomplete data receives INCOMPLETE data quality', () => {
    const context = createMockContext();
    const candidate = createCandidate(
      [{ categoryId: 'dining', rewardType: 'POINTS', earningMethod: 'POINTS_PER_SPEND', pointsAwarded: 5, spendRequirement: 100, isBaseRule: false, isExclusion: false }],
      [],
      [] // Missing redemption rates
    );

    const result = IncrementalValueEngine.calculate(candidate, context, {});
    expect(result.dataQuality).toBe('INCOMPLETE');
  });

  // Scenario 21: Candidate with complete data
  it('Scenario 21: Candidate with complete data receives COMPLETE data quality', () => {
    const context = createMockContext();
    const candidate = createCandidate(
      [{ categoryId: 'dining', rewardType: 'CASHBACK', earningMethod: 'PERCENTAGE', baseRate: 5.0, isBaseRule: false, isExclusion: false }],
      [{ period: 'MONTHLY', unit: 'MONETARY', maxValue: 2000 }],
      [],
      1000
    );

    const result = IncrementalValueEngine.calculate(candidate, context, {});
    expect(result.dataQuality).toBe('COMPLETE');
    expect(result.warnings).toHaveLength(0);
  });

  // Scenario 22: Candidate with no relevant spending categories
  it('Scenario 22: Candidate rewarding only categories user does not spend on yields zero value', () => {
    const context = createMockContext({
      spendingProfile: {
        'dining': { monthlySpend: 10000, transactionCount: 2 }
      }
    });
    
    // Candidate only gives rewards on 'flights', which user doesn't spend on
    const candidate = createCandidate([
      { categoryId: 'flights', rewardType: 'CASHBACK', earningMethod: 'PERCENTAGE', baseRate: 15.0, isBaseRule: false, isExclusion: false }
    ], [{ period: 'MONTHLY', unit: 'MONETARY', maxValue: 5000 }], [], 0);

    const result = IncrementalValueEngine.calculate(candidate, context, { dining: 0 });
    
    expect(result.annualGrossIncrementalReward).toBe(0);
  });

  // Scenario 23: Negative incremental value clamping
  it('Scenario 23: Negative category incremental value clamped to zero', () => {
    const context = createMockContext();
    const baselines = { 'dining': 2000 };
    
    const candidate = createCandidate([
      { categoryId: 'dining', rewardType: 'CASHBACK', earningMethod: 'PERCENTAGE', baseRate: 2.0, isBaseRule: false, isExclusion: false } // yields 400
    ], [{ period: 'MONTHLY', unit: 'MONETARY', maxValue: 5000 }], [], 0);

    const result = IncrementalValueEngine.calculate(candidate, context, baselines);
    
    expect(result.categoryBreakdowns.find(c => c.categoryId === 'dining')?.incrementalReward).toBe(0);
    expect(result.annualGrossIncrementalReward).toBe(0);
  });

  // Scenario 24: First-year fee economics
  it('Scenario 24: First-year economics accounts for joining fee', () => {
    const context = createMockContext();
    const baselines = { 'dining': 0 };
    
    // Annual incremental gross = 12,000. Annual fee = 2,500. Joining fee = 1,000.
    const candidate = createCandidate(
      [{ categoryId: 'dining', rewardType: 'CASHBACK', earningMethod: 'PERCENTAGE', baseRate: 5.0, isBaseRule: false, isExclusion: false }],
      [{ period: 'MONTHLY', unit: 'MONETARY', maxValue: 5000 }],
      [],
      2500,
      1000
    );

    const result = IncrementalValueEngine.calculate(candidate, context, baselines);
    
    expect(result.annualGrossIncrementalReward).toBe(12000);
    expect(result.annualFee).toBe(2500);
    expect(result.joiningFee).toBe(1000);
    expect(result.firstYearNetValue).toBe(8500); // 12000 - (2500 + 1000)
    expect(result.steadyStateAnnualValue).toBe(9500); // 12000 - 2500
  });

  // Scenario 25: Steady-state annual economics
  it('Scenario 25: Steady-state economics reflects ongoing recurring annual net value', () => {
    const context = createMockContext();
    const baselines = { 'dining': 0 };
    
    const candidate = createCandidate(
      [{ categoryId: 'dining', rewardType: 'CASHBACK', earningMethod: 'PERCENTAGE', baseRate: 5.0, isBaseRule: false, isExclusion: false }],
      [{ period: 'MONTHLY', unit: 'MONETARY', maxValue: 5000 }],
      [],
      1500,
      3000
    );

    const result = IncrementalValueEngine.calculate(candidate, context, baselines);
    
    expect(result.steadyStateAnnualValue).toBe(10500); // 12000 - 1500
    expect(result.netAnnualValue).toBe(10500);
  });
});
