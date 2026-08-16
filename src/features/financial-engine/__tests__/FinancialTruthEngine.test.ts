import { describe, it, expect } from 'vitest';
import { FinancialTruthEngine } from '../FinancialTruthEngine';
import type { FinancialCard, RewardRule, RedemptionRate, RewardCap } from '../types';

describe('FinancialTruthEngine', () => {
  const createTestCard = (
    rules: RewardRule[],
    caps: RewardCap[] = [],
    redemptionRates: RedemptionRate[] = []
  ): FinancialCard => ({
    id: 'test-card',
    name: 'Test Card',
    annualFee: 1000,
    joiningFee: 0,
    rewardRules: rules,
    caps,
    redemptionRates,
    benefits: [],
    eligibility: []
  });

  it('1. Basic cashback calculation', () => {
    const card = createTestCard([{ categoryId: 'all', rewardType: 'CASHBACK', earningMethod: 'PERCENTAGE', baseRate: 5.0, isExclusion: false, isBaseRule: true }]);
    const result = FinancialTruthEngine.calculateTransaction({ amount: 10000, categoryId: 'all' }, card);
    
    expect(result.grossReward).toBe(500);
    expect(result.monetaryRewardValue).toBe(500);
    expect(result.rewardType).toBe('CASHBACK');
  });

  it('2 & 7. Excluded category (Zero cashback)', () => {
    const card = createTestCard([
      { categoryId: 'fuel', rewardType: 'CASHBACK', earningMethod: 'PERCENTAGE', baseRate: 0, isExclusion: true, isBaseRule: false },
      { categoryId: 'all', rewardType: 'CASHBACK', earningMethod: 'PERCENTAGE', baseRate: 5.0, isExclusion: false, isBaseRule: true }
    ]);
    const result = FinancialTruthEngine.calculateTransaction({ amount: 10000, categoryId: 'fuel' }, card);
    
    expect(result.grossReward).toBe(0);
    expect(result.monetaryRewardValue).toBe(0);
    expect(result.eligibleSpend).toBe(0);
    expect(result.excludedSpend).toBe(10000);
    expect(result.warnings).toContain('REASON: Category excluded');
  });

  it('3. Zero spend', () => {
    const card = createTestCard([{ categoryId: 'all', rewardType: 'CASHBACK', earningMethod: 'PERCENTAGE', baseRate: 5.0, isExclusion: false, isBaseRule: true }]);
    const result = FinancialTruthEngine.calculateTransaction({ amount: 0, categoryId: 'all' }, card);
    
    expect(result.grossReward).toBe(0);
    expect(result.warnings).toContain('REASON: Zero spend');
  });

  it('4. Fractional reward rates', () => {
    const card = createTestCard([{ categoryId: 'all', rewardType: 'CASHBACK', earningMethod: 'PERCENTAGE', baseRate: 1.5, isExclusion: false, isBaseRule: true }]);
    const result = FinancialTruthEngine.calculateTransaction({ amount: 100, categoryId: 'all' }, card);
    
    expect(result.grossReward).toBe(1.5);
  });

  it('5. Monthly cap enforcement (transaction exceeds cap)', () => {
    const card = createTestCard(
      [{ id: 'rule1', categoryId: 'all', rewardType: 'CASHBACK', earningMethod: 'PERCENTAGE', baseRate: 5.0, isExclusion: false, isBaseRule: true }],
      [{ period: 'MONTHLY', unit: 'MONETARY', maxValue: 500 }]
    );
    // 20000 * 5% = 1000, but cap is 500
    const result = FinancialTruthEngine.calculateTransaction(
      { amount: 20000, categoryId: 'all' }, 
      card,
      { consumedCaps: { MONTHLY: 0 } }
    );
    
    expect(result.grossReward).toBe(1000);
    expect(result.monetaryRewardValue).toBe(500);
    expect(result.capApplied).toBe(true);
  });

  it('6. Cap already partially consumed', () => {
    const card = createTestCard(
      [{ id: 'rule1', categoryId: 'all', rewardType: 'CASHBACK', earningMethod: 'PERCENTAGE', baseRate: 5.0, isExclusion: false, isBaseRule: true }],
      [{ period: 'MONTHLY', unit: 'MONETARY', maxValue: 500 }]
    );
    // Already consumed 400. 10000 * 5% = 500. Only 100 available.
    const result = FinancialTruthEngine.calculateTransaction(
      { amount: 10000, categoryId: 'all' }, 
      card,
      { consumedCaps: { MONTHLY: 400 } }
    );
    
    expect(result.grossReward).toBe(500);
    expect(result.monetaryRewardValue).toBe(100);
    expect(result.capApplied).toBe(true);
  });

  it('8. Category-specific reward', () => {
    const card = createTestCard([
      { categoryId: 'online', rewardType: 'CASHBACK', earningMethod: 'PERCENTAGE', baseRate: 5.0, isExclusion: false, isBaseRule: false },
      { categoryId: 'dining', rewardType: 'CASHBACK', earningMethod: 'PERCENTAGE', baseRate: 2.0, isExclusion: false, isBaseRule: false }
    ]);
    const onlineResult = FinancialTruthEngine.calculateTransaction({ amount: 1000, categoryId: 'online' }, card);
    const diningResult = FinancialTruthEngine.calculateTransaction({ amount: 1000, categoryId: 'dining' }, card);
    
    expect(onlineResult.grossReward).toBe(50);
    expect(diningResult.grossReward).toBe(20);
  });

  it('10 & 11. Points + redemption value', () => {
    const card = createTestCard(
      [{ categoryId: 'travel', rewardType: 'POINTS', earningMethod: 'POINTS_PER_SPEND', pointsAwarded: 10, spendRequirement: 100, isExclusion: false, isBaseRule: false }],
      [],
      [{ pointTypeName: 'Reward Points', mechanism: 'STATEMENT_CREDIT', monetaryValue: 0.25 }]
    );
    
    const result = FinancialTruthEngine.calculateTransaction({ amount: 10000, categoryId: 'travel' }, card);
    
    expect(result.grossReward).toBe(1000); // 10000 / 100 * 10
    expect(result.redemptionValue).toBe(0.25);
    expect(result.monetaryRewardValue).toBe(250); // 1000 * 0.25
  });

  it('12. Missing redemption value', () => {
    const card = createTestCard(
      [{ categoryId: 'all', rewardType: 'POINTS', earningMethod: 'POINTS_PER_SPEND', pointsAwarded: 10, spendRequirement: 100, isExclusion: false, isBaseRule: true }],
      [],
      [] // No redemption rates
    );
    
    const result = FinancialTruthEngine.calculateTransaction({ amount: 1000, categoryId: 'all' }, card);
    
    expect(result.grossReward).toBe(100);
    expect(result.monetaryRewardValue).toBe(0); // Explicitly zero
    expect(result.warnings).toContain('MISSING_REDEMPTION_VALUE');
  });

  it('14. Missing reward data', () => {
    const card = createTestCard([]);
    const result = FinancialTruthEngine.calculateTransaction({ amount: 1000, categoryId: 'all' }, card);
    
    expect(result.warnings).toContain('MISSING_REWARD_DATA');
    expect(result.grossReward).toBe(0);
  });

  it('15. Missing cap', () => {
    const card = createTestCard([{ categoryId: 'all', rewardType: 'CASHBACK', earningMethod: 'PERCENTAGE', baseRate: 5.0, isExclusion: false, isBaseRule: true }], []);
    const result = FinancialTruthEngine.calculateTransaction({ amount: 1000, categoryId: 'all' }, card);
    
    expect(result.warnings).toContain('CAPS_MISSING_IN_DATA');
  });

  it('17. Negative transaction amount', () => {
    const card = createTestCard([{ categoryId: 'all', rewardType: 'CASHBACK', earningMethod: 'PERCENTAGE', baseRate: 5.0, isExclusion: false, isBaseRule: true }]);
    expect(() => {
      FinancialTruthEngine.calculateTransaction({ amount: -100, categoryId: 'all' }, card);
    }).toThrow('Transaction amount cannot be negative');
  });

  it('18. Very large transaction', () => {
    const card = createTestCard([{ categoryId: 'all', rewardType: 'CASHBACK', earningMethod: 'PERCENTAGE', baseRate: 5.0, isExclusion: false, isBaseRule: true }]);
    const result = FinancialTruthEngine.calculateTransaction({ amount: 1_000_000, categoryId: 'all' }, card);
    
    expect(result.grossReward).toBe(50_000); 
  });

  it('20. Rule precedence (exact match over base rule)', () => {
    const card = createTestCard([
      { categoryId: 'all', rewardType: 'CASHBACK', earningMethod: 'PERCENTAGE', baseRate: 1.0, isExclusion: false, isBaseRule: true },
      { categoryId: 'dining', rewardType: 'CASHBACK', earningMethod: 'PERCENTAGE', baseRate: 10.0, isExclusion: false, isBaseRule: false }
    ]);
    const result = FinancialTruthEngine.calculateTransaction({ amount: 100, categoryId: 'dining' }, card);
    
    expect(result.grossReward).toBe(10); // Uses dining rule
  });
  
  it('20b. Merchant specific rule precedence', () => {
    const card = createTestCard([
      { categoryId: 'all', rewardType: 'CASHBACK', earningMethod: 'PERCENTAGE', baseRate: 1.0, isExclusion: false, isBaseRule: true },
      { merchantId: 'amazon', rewardType: 'CASHBACK', earningMethod: 'PERCENTAGE', baseRate: 15.0, isExclusion: false, isBaseRule: false }
    ]);
    const result = FinancialTruthEngine.calculateTransaction({ amount: 100, categoryId: 'shopping', merchantId: 'amazon' }, card);
    
    expect(result.grossReward).toBe(15); 
  });

  // GOLDEN TEST CASES
  describe('Golden Test Cases', () => {
    it('CASE RC-001: ₹10,000 online, 5% cashback, No cap', () => {
      const card = createTestCard([{ categoryId: 'online', rewardType: 'CASHBACK', earningMethod: 'PERCENTAGE', baseRate: 5.0, isExclusion: false, isBaseRule: false }]);
      const res = FinancialTruthEngine.calculateTransaction({ amount: 10000, categoryId: 'online' }, card);
      expect(res.monetaryRewardValue).toBe(500);
    });

    it('CASE RC-002: ₹20,000 online, 5%, ₹500 monthly cap', () => {
      const card = createTestCard(
        [{ id: 'rule_online', categoryId: 'online', rewardType: 'CASHBACK', earningMethod: 'PERCENTAGE', baseRate: 5.0, isExclusion: false, isBaseRule: false }],
        [{ period: 'MONTHLY', unit: 'MONETARY', maxValue: 500, linkedRuleIds: ['rule_online'] }]
      );
      const res = FinancialTruthEngine.calculateTransaction(
        { amount: 20000, categoryId: 'online' }, 
        card, 
        { consumedCaps: { MONTHLY: 0 } }
      );
      expect(res.monetaryRewardValue).toBe(500);
    });

    it('CASE RC-003: ₹10,000 fuel, 5% online cashback, Fuel excluded', () => {
      const card = createTestCard([
        { categoryId: 'online', rewardType: 'CASHBACK', earningMethod: 'PERCENTAGE', baseRate: 5.0, isExclusion: false, isBaseRule: false },
        { categoryId: 'fuel', rewardType: 'UNKNOWN', earningMethod: 'FLAT', baseRate: 0, isExclusion: true, isBaseRule: false }
      ]);
      const res = FinancialTruthEngine.calculateTransaction({ amount: 10000, categoryId: 'fuel' }, card);
      expect(res.monetaryRewardValue).toBe(0);
    });

    it('CASE RC-004: ₹10,000 travel, 10X points, Verified redemption ratio', () => {
      const card = createTestCard(
        [{ categoryId: 'travel', rewardType: 'POINTS', earningMethod: 'POINTS_PER_SPEND', pointsAwarded: 10, spendRequirement: 100, isExclusion: false, isBaseRule: false }],
        [],
        [{ pointTypeName: 'Points', mechanism: 'STATEMENT_CREDIT', monetaryValue: 0.25 }]
      );
      const res = FinancialTruthEngine.calculateTransaction({ amount: 10000, categoryId: 'travel' }, card);
      expect(res.grossReward).toBe(1000);
      expect(res.monetaryRewardValue).toBe(250);
    });
  });
});
