import { describe, it, expect } from 'vitest';
import scenarios from '../../../../benchmarks/rewards-facade-scenarios.json';
import { bestCardForTransaction, recommendNewCards, deriveMonthlySpend } from '../RewardsFacade';
import { FinancialTruthEngine } from '../FinancialTruthEngine';
import { IncrementalValueEngine } from '../IncrementalValueEngine';
import type { FinancialCard } from '../types';
import type { FinixCard } from '../../finix/data/cardDataset';
import type { Transaction } from '../../dashboard/types/dashboard.types';

const catalog = scenarios.catalog as unknown as FinixCard[];
const NOW = new Date('2026-10-16T06:00:00Z');

// ─────────────────────────────────────────────────────────────────────────────
//  Hand-verified scenario benchmark (gate: every scenario must pass)
// ─────────────────────────────────────────────────────────────────────────────

describe('RewardsFacade benchmark — best card for a payment', () => {
  for (const sc of scenarios.bestCard as any[]) {
    it(`${sc.id}: ${sc.why}`, () => {
      const history: Transaction[] | undefined = sc.historyDiningOnDiningPro
        ? [{ id: 'h1', merchant: 'Zomato', amount: sc.historyDiningOnDiningPro * 100, date: '2026-10-05T12:00:00Z', category: 'dining', type: 'debit', cardId: 'dining_pro' }]
        : undefined;
      const r = bestCardForTransaction({ amount: sc.amount, merchant: sc.merchant, walletCardIds: sc.wallet, history, now: NOW }, catalog);
      expect(r?.best?.card.id).toBe(sc.expectBest);
      expect(r?.best?.cappedRewardValue).toBeCloseTo(sc.expectReward, 2);
      if (sc.expectSecond) expect(r?.secondBest?.card.id).toBe(sc.expectSecond);
    });
  }
});

describe('RewardsFacade benchmark — new card recommendations', () => {
  for (const sc of scenarios.recommend as any[]) {
    it(`${sc.id}: ${sc.why}`, () => {
      const recs = recommendNewCards({
        spendByCategory: sc.spend,
        walletCardIds: sc.wallet,
        annualIncome: sc.income,
        cibilScore: sc.cibil,
        maxAnnualFee: sc.maxAnnualFee,
        limit: 10,
      }, catalog);
      const ids = recs.map((r) => r.id);
      if (sc.expectTop) expect(ids[0]).toBe(sc.expectTop);
      if (sc.expectNetExact !== undefined) expect(recs[0].netAnnualValue).toBe(sc.expectNetExact);
      for (const id of sc.expectNotIn ?? []) expect(ids).not.toContain(id);
      if (sc.expectCaveatFor) {
        const rec = recs.find((r) => r.id === sc.expectCaveatFor);
        expect(rec).toBeDefined();
        expect(rec!.eligibilityReason).toMatch(/Not confirmed/);
      }
    });
  }
});

describe('RewardsFacade behaviour', () => {
  it('reports when spend is assumed instead of measured', () => {
    const { assumed, spend } = deriveMonthlySpend({ topCategories: ['dining', 'travel'] });
    expect(assumed).toBe(true);
    expect(Math.round(Object.values(spend).reduce((a, b) => a + (b ?? 0), 0))).toBe(25000);
    const recs = recommendNewCards({ topCategories: ['dining'] }, catalog);
    expect(recs[0].reasons[0]).toMatch(/assumed/);
  });

  it('derives monthly spend from the last 90 days of transactions', () => {
    const tx = (d: string, amt: number, category: any): Transaction => ({ id: d + amt, merchant: 'x', amount: amt * 100, date: d, category, type: 'debit', cardId: '' });
    const { spend, assumed } = deriveMonthlySpend({
      transactions: [tx('2026-10-01T00:00:00Z', 9000, 'dining'), tx('2026-09-01T00:00:00Z', 3000, 'dining'), tx('2026-01-01T00:00:00Z', 99999, 'travel')],
      now: NOW,
    });
    expect(assumed).toBe(false);
    expect(spend.dining).toBe(4000);
    expect(spend.travel).toBeUndefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
//  Engine fixes
// ─────────────────────────────────────────────────────────────────────────────

const base: FinancialCard = {
  id: 'c', name: 'C', annualFee: 0, joiningFee: 0,
  rewardRules: [], redemptionRates: [], caps: [], benefits: [], eligibility: [],
};

describe('FinancialTruthEngine fixes', () => {
  it('values points with pointsRequired (4 points = ₹1 → ₹0.25/point)', () => {
    const card: FinancialCard = {
      ...base,
      rewardRules: [{ id: 'r', categoryId: 'all', rewardType: 'POINTS', earningMethod: 'POINTS_PER_SPEND', pointsAwarded: 4, spendRequirement: 150, isExclusion: false, isBaseRule: true }],
      redemptionRates: [{ pointTypeName: 'RP', mechanism: 'STATEMENT_CREDIT', monetaryValue: 1, pointsRequired: 4 }],
    };
    const r = FinancialTruthEngine.calculateTransaction({ amount: 1500, categoryId: 'shopping' }, card);
    expect(r.grossReward).toBe(40);
    expect(r.monetaryRewardValue).toBeCloseTo(10, 5); // previously 40 (pointsRequired ignored)
  });

  it('uses the best redemption option, not the first', () => {
    const card: FinancialCard = {
      ...base,
      rewardRules: [{ id: 'r', categoryId: 'all', rewardType: 'POINTS', earningMethod: 'PERCENTAGE', baseRate: 1, isExclusion: false, isBaseRule: true }],
      redemptionRates: [
        { pointTypeName: 'RP', mechanism: 'VOUCHER', monetaryValue: 0.2 },
        { pointTypeName: 'RP', mechanism: 'TRAVEL', monetaryValue: 1 },
      ],
    };
    expect(FinancialTruthEngine.calculateTransaction({ amount: 1000, categoryId: 'x' }, card).monetaryRewardValue).toBeCloseTo(10, 5);
  });

  it('converts a rupee cap for a points rule (cap units are compared)', () => {
    const card: FinancialCard = {
      ...base,
      rewardRules: [{ id: 'r', categoryId: 'all', rewardType: 'POINTS', earningMethod: 'PERCENTAGE', baseRate: 10, isExclusion: false, isBaseRule: true }],
      redemptionRates: [{ pointTypeName: 'RP', mechanism: 'STATEMENT_CREDIT', monetaryValue: 0.5 }],
      caps: [{ period: 'TRANSACTION', unit: 'MONETARY', maxValue: 100 }],
    };
    // 10% of 10000 = 1000 points = ₹500; ₹100 cap = 200 points
    const r = FinancialTruthEngine.calculateTransaction({ amount: 10000, categoryId: 'x' }, card);
    expect(r.capApplied).toBe(true);
    expect(r.monetaryRewardValue).toBeCloseTo(100, 5);
  });

  it('picks the most valuable of several matching category rules', () => {
    const card: FinancialCard = {
      ...base,
      rewardRules: [
        { id: 'a', categoryId: 'dining', rewardType: 'CASHBACK', earningMethod: 'PERCENTAGE', baseRate: 2, isExclusion: false, isBaseRule: false },
        { id: 'b', categoryId: 'dining', rewardType: 'CASHBACK', earningMethod: 'PERCENTAGE', baseRate: 5, isExclusion: false, isBaseRule: false },
      ],
    };
    expect(FinancialTruthEngine.calculateTransaction({ amount: 1000, categoryId: 'dining' }, card).monetaryRewardValue).toBe(50);
  });

  it('ignores expired and inactive rules', () => {
    const card: FinancialCard = {
      ...base,
      rewardRules: [
        { id: 'old', categoryId: 'dining', rewardType: 'CASHBACK', earningMethod: 'PERCENTAGE', baseRate: 10, isExclusion: false, isBaseRule: false, effectiveUntil: '2025-12-31' },
        { id: 'off', categoryId: 'dining', rewardType: 'CASHBACK', earningMethod: 'PERCENTAGE', baseRate: 8, isExclusion: false, isBaseRule: false, isActive: false },
        { id: 'base', categoryId: 'all', rewardType: 'CASHBACK', earningMethod: 'PERCENTAGE', baseRate: 1, isExclusion: false, isBaseRule: true, isUncapped: true },
      ],
    };
    const r = FinancialTruthEngine.calculateTransaction({ amount: 1000, categoryId: 'dining' }, card, { asOf: '2026-10-16' });
    expect(r.monetaryRewardValue).toBe(10);
    expect(r.warnings).not.toContain('CAPS_MISSING_IN_DATA'); // uncapped base rule
  });

  it('an exclusion beats a reward rule at the same level', () => {
    const card: FinancialCard = {
      ...base,
      rewardRules: [
        { id: 'x', categoryId: 'fuel', rewardType: 'CASHBACK', earningMethod: 'PERCENTAGE', baseRate: 1, isExclusion: false, isBaseRule: false },
        { id: 'ex', categoryId: 'fuel', rewardType: 'CASHBACK', earningMethod: 'PERCENTAGE', isExclusion: true, isBaseRule: false },
      ],
    };
    expect(FinancialTruthEngine.calculateTransaction({ amount: 1000, categoryId: 'fuel' }, card).monetaryRewardValue).toBe(0);
  });
});

describe('IncrementalValueEngine fee waiver', () => {
  it('does not charge the annual fee when spend clears the waiver', () => {
    const card: FinancialCard = {
      ...base, annualFee: 1000, feeWaiverSpend: 100000,
      rewardRules: [{ id: 'b', categoryId: 'all', rewardType: 'CASHBACK', earningMethod: 'PERCENTAGE', baseRate: 1, isExclusion: false, isBaseRule: true, isUncapped: true }],
    };
    const ctx = (monthly: number) => ({ userId: 'u', financialProfile: {}, existingWalletCardIds: [], spendingProfile: { other: { monthlySpend: monthly, transactionCount: 1 } } });
    const high = IncrementalValueEngine.calculate({ card, eligibility: {} as any, spendingOverlap: {} }, ctx(10000), {});
    expect(high.annualFeeWaived).toBe(true);
    expect(high.netAnnualValue).toBe(1200);
    const low = IncrementalValueEngine.calculate({ card, eligibility: {} as any, spendingOverlap: {} }, ctx(5000), {});
    expect(low.annualFeeWaived).toBe(false);
    expect(low.netAnnualValue).toBe(600 - 1000);
  });
});
