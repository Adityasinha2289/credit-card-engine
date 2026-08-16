import { describe, it, expect } from 'vitest';
import { IncrementalValueEngine } from '../IncrementalValueEngine';
import { BaselineWalletEngine } from '../BaselineWalletEngine';
import { CandidateGenerator } from '../CandidateGenerator';
import { FinancialTruthEngine } from '../FinancialTruthEngine';
import type { UserContext } from '../userContext';
import type { CandidateContext } from '../CandidateGenerator';
import type { FinancialCard, RewardRule, RewardCap, RedemptionRate } from '../types';

describe('Phase 3 Invariants & Property Tests (Step 27 Specification)', () => {
  const createMockCard = (
    id: string,
    rules: RewardRule[],
    caps: RewardCap[] = [{ period: 'MONTHLY', unit: 'MONETARY', maxValue: 50000 }],
    redemptionRates: RedemptionRate[] = [],
    annualFee = 0,
    joiningFee = 0
  ): FinancialCard => ({
    id,
    name: `Card ${id}`,
    annualFee,
    joiningFee,
    rewardRules: rules,
    caps,
    redemptionRates,
    benefits: [],
    eligibility: [{ minIncome: 300000, minCibil: 700 }]
  });

  const createCandidateCtx = (card: FinancialCard, spendCategory = 'dining', monthlySpend = 20000): CandidateContext => ({
    card,
    eligibility: { status: 'ELIGIBLE', reasons: [], failedRules: [], unknownRules: [], cardId: card.id },
    spendingOverlap: { [spendCategory]: { monthlySpend, transactionCount: 4 } }
  });

  // Invariant 1: Candidate value cannot increase when user spending decreases, assuming identical rules
  it('Invariant 1: Candidate value cannot increase when user spending decreases', () => {
    const card = createMockCard('c1', [
      { categoryId: 'dining', rewardType: 'CASHBACK', earningMethod: 'PERCENTAGE', baseRate: 5.0, isBaseRule: false, isExclusion: false }
    ]);

    const contextHigh: UserContext = {
      userId: 'u1',
      financialProfile: {},
      spendingProfile: { dining: { monthlySpend: 30000, transactionCount: 6 } },
      existingWalletCardIds: []
    };
    const contextLow: UserContext = {
      userId: 'u1',
      financialProfile: {},
      spendingProfile: { dining: { monthlySpend: 15000, transactionCount: 3 } },
      existingWalletCardIds: []
    };

    const baselinesHigh = { dining: 500 };
    const baselinesLow = { dining: 250 };

    const valHigh = IncrementalValueEngine.calculate(createCandidateCtx(card, 'dining', 30000), contextHigh, baselinesHigh);
    const valLow = IncrementalValueEngine.calculate(createCandidateCtx(card, 'dining', 15000), contextLow, baselinesLow);

    expect(valLow.annualGrossIncrementalReward).toBeLessThanOrEqual(valHigh.annualGrossIncrementalReward);
  });

  // Invariant 2: A candidate identical to the best existing card has zero incremental reward
  it('Invariant 2: Candidate identical to best existing card has zero incremental reward', () => {
    const context: UserContext = {
      userId: 'u1',
      financialProfile: {},
      spendingProfile: { dining: { monthlySpend: 20000, transactionCount: 5 } },
      existingWalletCardIds: []
    };

    const identicalCard = createMockCard('c-ident', [
      { categoryId: 'dining', rewardType: 'CASHBACK', earningMethod: 'PERCENTAGE', baseRate: 5.0, isBaseRule: false, isExclusion: false }
    ]);

    // Existing card gives identical 5% (1000/mo)
    const baselines = { dining: 1000 };

    const result = IncrementalValueEngine.calculate(createCandidateCtx(identicalCard), context, baselines);
    expect(result.annualGrossIncrementalReward).toBe(0);
  });

  // Invariant 3: A candidate with lower reward than the existing best card has zero incremental reward
  it('Invariant 3: Candidate with lower reward than existing best card has zero incremental reward', () => {
    const context: UserContext = {
      userId: 'u1',
      financialProfile: {},
      spendingProfile: { dining: { monthlySpend: 20000, transactionCount: 5 } },
      existingWalletCardIds: []
    };

    const worseCard = createMockCard('c-worse', [
      { categoryId: 'dining', rewardType: 'CASHBACK', earningMethod: 'PERCENTAGE', baseRate: 2.0, isBaseRule: false, isExclusion: false }
    ]);

    // Existing card gives 5% (1000/mo)
    const baselines = { dining: 1000 };

    const result = IncrementalValueEngine.calculate(createCandidateCtx(worseCard), context, baselines);
    expect(result.annualGrossIncrementalReward).toBe(0);
    expect(result.categoryBreakdowns[0].incrementalReward).toBe(0);
  });

  // Invariant 4: Increasing a candidate reward rate cannot decrease its incremental value
  it('Invariant 4: Increasing candidate reward rate cannot decrease its incremental value', () => {
    const context: UserContext = {
      userId: 'u1',
      financialProfile: {},
      spendingProfile: { dining: { monthlySpend: 20000, transactionCount: 5 } },
      existingWalletCardIds: []
    };
    const baselines = { dining: 800 };

    const cardLowerRate = createMockCard('c-low', [
      { categoryId: 'dining', rewardType: 'CASHBACK', earningMethod: 'PERCENTAGE', baseRate: 5.0, isBaseRule: false, isExclusion: false }
    ]);
    const cardHigherRate = createMockCard('c-high', [
      { categoryId: 'dining', rewardType: 'CASHBACK', earningMethod: 'PERCENTAGE', baseRate: 8.0, isBaseRule: false, isExclusion: false }
    ]);

    const resLow = IncrementalValueEngine.calculate(createCandidateCtx(cardLowerRate), context, baselines);
    const resHigh = IncrementalValueEngine.calculate(createCandidateCtx(cardHigherRate), context, baselines);

    expect(resHigh.annualGrossIncrementalReward).toBeGreaterThanOrEqual(resLow.annualGrossIncrementalReward);
  });

  // Invariant 5: Increasing annual fee cannot increase net value
  it('Invariant 5: Increasing annual fee cannot increase net value', () => {
    const context: UserContext = {
      userId: 'u1',
      financialProfile: {},
      spendingProfile: { dining: { monthlySpend: 20000, transactionCount: 5 } },
      existingWalletCardIds: []
    };
    const baselines = { dining: 0 };

    const cardLowFee = createMockCard('c-f1', [{ categoryId: 'dining', rewardType: 'CASHBACK', earningMethod: 'PERCENTAGE', baseRate: 5.0, isBaseRule: false, isExclusion: false }], [], [], 500);
    const cardHighFee = createMockCard('c-f2', [{ categoryId: 'dining', rewardType: 'CASHBACK', earningMethod: 'PERCENTAGE', baseRate: 5.0, isBaseRule: false, isExclusion: false }], [], [], 2500);

    const resLowFee = IncrementalValueEngine.calculate(createCandidateCtx(cardLowFee), context, baselines);
    const resHighFee = IncrementalValueEngine.calculate(createCandidateCtx(cardHighFee), context, baselines);

    expect(resHighFee.netAnnualValue).toBeLessThanOrEqual(resLowFee.netAnnualValue);
  });

  // Invariant 6: Applying a cap cannot increase reward
  it('Invariant 6: Applying a cap cannot increase reward', () => {
    const cardUncapped = createMockCard('c-uncap', [
      { categoryId: 'dining', rewardType: 'CASHBACK', earningMethod: 'PERCENTAGE', baseRate: 10.0, isBaseRule: false, isExclusion: false }
    ], []);

    const cardCapped = createMockCard('c-cap', [
      { id: 'r1', categoryId: 'dining', rewardType: 'CASHBACK', earningMethod: 'PERCENTAGE', baseRate: 10.0, isBaseRule: false, isExclusion: false }
    ], [
      { period: 'MONTHLY', unit: 'MONETARY', maxValue: 500, linkedRuleIds: ['r1'] }
    ]);

    const resUncapped = FinancialTruthEngine.calculateTransaction({ amount: 20000, categoryId: 'dining' }, cardUncapped);
    const resCapped = FinancialTruthEngine.calculateTransaction({ amount: 20000, categoryId: 'dining' }, cardCapped);

    expect(resCapped.monetaryRewardValue).toBeLessThanOrEqual(resUncapped.monetaryRewardValue);
  });

  // Invariant 7: Applying an exclusion cannot increase reward
  it('Invariant 7: Applying an exclusion cannot increase reward', () => {
    const cardStandard = createMockCard('c-std', [
      { categoryId: 'all', rewardType: 'CASHBACK', earningMethod: 'PERCENTAGE', baseRate: 5.0, isBaseRule: true, isExclusion: false }
    ]);

    const cardWithExclusion = createMockCard('c-excl', [
      { categoryId: 'fuel', rewardType: 'CASHBACK', earningMethod: 'PERCENTAGE', baseRate: 0, isBaseRule: false, isExclusion: true },
      { categoryId: 'all', rewardType: 'CASHBACK', earningMethod: 'PERCENTAGE', baseRate: 5.0, isBaseRule: true, isExclusion: false }
    ]);

    const resStandard = FinancialTruthEngine.calculateTransaction({ amount: 10000, categoryId: 'fuel' }, cardStandard);
    const resExcluded = FinancialTruthEngine.calculateTransaction({ amount: 10000, categoryId: 'fuel' }, cardWithExclusion);

    expect(resExcluded.monetaryRewardValue).toBe(0);
    expect(resExcluded.monetaryRewardValue).toBeLessThanOrEqual(resStandard.monetaryRewardValue);
  });

  // Invariant 8: Unknown redemption cannot become zero-value economics without INCOMPLETE flag
  it('Invariant 8: Unknown redemption preserves INCOMPLETE data quality status', () => {
    const context: UserContext = {
      userId: 'u1',
      financialProfile: {},
      spendingProfile: { dining: { monthlySpend: 20000, transactionCount: 5 } },
      existingWalletCardIds: []
    };

    const cardNoRedemption = createMockCard('c-nored', [
      { categoryId: 'dining', rewardType: 'POINTS', earningMethod: 'POINTS_PER_SPEND', pointsAwarded: 10, spendRequirement: 100, isBaseRule: false, isExclusion: false }
    ], [], []);

    const res = IncrementalValueEngine.calculate(createCandidateCtx(cardNoRedemption), context, {});

    expect(res.dataQuality).toBe('INCOMPLETE');
    expect(res.warnings).toContain('Cannot calculate economic value: Missing redemption ratio.');
  });

  // Invariant 9: Already-owned cards cannot become recommendations
  it('Invariant 9: Already-owned cards cannot become recommendations', () => {
    const context: UserContext = {
      userId: 'u1',
      financialProfile: { annualIncome: 1000000, creditScore: 750 },
      spendingProfile: { dining: { monthlySpend: 20000, transactionCount: 5 } },
      existingWalletCardIds: ['my-owned-card']
    };

    const ownedCard = createMockCard('my-owned-card', [
      { categoryId: 'dining', rewardType: 'CASHBACK', earningMethod: 'PERCENTAGE', baseRate: 10.0, isBaseRule: false, isExclusion: false }
    ]);

    const gen = CandidateGenerator.generate([ownedCard], context);
    expect(gen.alreadyOwned).toHaveLength(1);
    expect(gen.eligible).toHaveLength(0);
  });

  // Invariant 10: Negative incremental category values are clamped to zero
  it('Invariant 10: Negative incremental category values are clamped to zero', () => {
    const context: UserContext = {
      userId: 'u1',
      financialProfile: {},
      spendingProfile: { dining: { monthlySpend: 20000, transactionCount: 5 } },
      existingWalletCardIds: []
    };

    const candidate = createMockCard('c-low', [
      { categoryId: 'dining', rewardType: 'CASHBACK', earningMethod: 'PERCENTAGE', baseRate: 1.0, isBaseRule: false, isExclusion: false } // 200
    ]);

    // Baseline is 1000 (candidate gives 200 -> delta is -800)
    const baselines = { dining: 1000 };

    const res = IncrementalValueEngine.calculate(createCandidateCtx(candidate), context, baselines);
    expect(res.categoryBreakdowns[0].incrementalReward).toBe(0);
    expect(res.annualGrossIncrementalReward).toBe(0);
  });
});
