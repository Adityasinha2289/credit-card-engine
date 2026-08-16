import { describe, it, expect } from 'vitest';
import { BaselineWalletEngine } from '../BaselineWalletEngine';
import type { UserContext } from '../userContext';
import type { FinancialCard, RewardRule, RewardCap, RedemptionRate } from '../types';

describe('BaselineWalletEngine', () => {
  const createMockContext = (overrides?: Partial<UserContext>): UserContext => ({
    userId: 'user-1',
    financialProfile: {},
    spendingProfile: {
      'dining': { monthlySpend: 10000, transactionCount: 5 },
      'travel': { monthlySpend: 5000, transactionCount: 2 },
      'groceries': { monthlySpend: 8000, transactionCount: 4 },
      'zeroSpend': { monthlySpend: 0, transactionCount: 0 }
    },
    existingWalletCardIds: [],
    ...overrides
  });

  const createMockCard = (
    id: string, 
    rules: RewardRule[], 
    caps: RewardCap[] = [], 
    redemptionRates: RedemptionRate[] = []
  ): FinancialCard => ({
    id,
    name: `Card ${id}`,
    annualFee: 0,
    joiningFee: 0,
    rewardRules: rules,
    caps,
    redemptionRates,
    benefits: [],
    eligibility: []
  });

  it('1. Baseline is 0 for all categories when wallet is empty', () => {
    const context = createMockContext();
    const baselines = BaselineWalletEngine.calculateBaselines(context, []);
    
    expect(baselines['dining']).toBe(0);
    expect(baselines['travel']).toBe(0);
    expect(baselines['groceries']).toBe(0);
    expect(baselines['zeroSpend']).toBe(0);
  });

  it('2. Calculates max reward across multiple cards for a category', () => {
    const context = createMockContext();
    const wallet = [
      createMockCard('card-1', [{ categoryId: 'dining', rewardType: 'CASHBACK', earningMethod: 'PERCENTAGE', baseRate: 2.0, isBaseRule: false, isExclusion: false }]),
      createMockCard('card-2', [{ categoryId: 'dining', rewardType: 'CASHBACK', earningMethod: 'PERCENTAGE', baseRate: 5.0, isBaseRule: false, isExclusion: false }])
    ];

    const baselines = BaselineWalletEngine.calculateBaselines(context, wallet);
    
    // 10000 * 5% = 500 (from card-2)
    expect(baselines['dining']).toBe(500);
    // travel has no rules on card-1 or card-2, so 0
    expect(baselines['travel']).toBe(0);
  });

  it('3. Respects base rules when category-specific rule is absent', () => {
    const context = createMockContext();
    const wallet = [
      createMockCard('card-base', [
        { categoryId: 'all', rewardType: 'CASHBACK', earningMethod: 'PERCENTAGE', baseRate: 1.5, isBaseRule: true, isExclusion: false }
      ])
    ];

    const baselines = BaselineWalletEngine.calculateBaselines(context, wallet);
    
    // dining: 10000 * 1.5% = 150
    expect(baselines['dining']).toBe(150);
    // travel: 5000 * 1.5% = 75
    expect(baselines['travel']).toBe(75);
    // groceries: 8000 * 1.5% = 120
    expect(baselines['groceries']).toBe(120);
  });

  it('4. Category-specific rule takes precedence over base rule in wallet card', () => {
    const context = createMockContext();
    const wallet = [
      createMockCard('card-mix', [
        { categoryId: 'all', rewardType: 'CASHBACK', earningMethod: 'PERCENTAGE', baseRate: 1.0, isBaseRule: true, isExclusion: false },
        { categoryId: 'dining', rewardType: 'CASHBACK', earningMethod: 'PERCENTAGE', baseRate: 4.0, isBaseRule: false, isExclusion: false }
      ])
    ];

    const baselines = BaselineWalletEngine.calculateBaselines(context, wallet);
    
    // dining gets 4% (400)
    expect(baselines['dining']).toBe(400);
    // travel gets base 1% (50)
    expect(baselines['travel']).toBe(50);
  });

  it('5. Excluded category yields 0 baseline', () => {
    const context = createMockContext();
    const wallet = [
      createMockCard('card-excl', [
        { categoryId: 'dining', rewardType: 'CASHBACK', earningMethod: 'PERCENTAGE', baseRate: 0, isBaseRule: false, isExclusion: true },
        { categoryId: 'all', rewardType: 'CASHBACK', earningMethod: 'PERCENTAGE', baseRate: 2.0, isBaseRule: true, isExclusion: false }
      ])
    ];

    const baselines = BaselineWalletEngine.calculateBaselines(context, wallet);
    
    expect(baselines['dining']).toBe(0);
    expect(baselines['travel']).toBe(100);
  });

  it('6. Caps in wallet cards constrain baseline reward', () => {
    const context = createMockContext();
    const wallet = [
      createMockCard(
        'card-capped',
        [{ id: 'r1', categoryId: 'dining', rewardType: 'CASHBACK', earningMethod: 'PERCENTAGE', baseRate: 10.0, isBaseRule: false, isExclusion: false }],
        [{ period: 'MONTHLY', unit: 'MONETARY', maxValue: 300, linkedRuleIds: ['r1'] }]
      )
    ];

    const baselines = BaselineWalletEngine.calculateBaselines(context, wallet);
    
    // 10000 * 10% = 1000, capped at 300
    expect(baselines['dining']).toBe(300);
  });

  it('7. Returns 0 for zero spend categories regardless of reward rate', () => {
    const context = createMockContext();
    const wallet = [
      createMockCard('card-1', [{ categoryId: 'zeroSpend', rewardType: 'CASHBACK', earningMethod: 'PERCENTAGE', baseRate: 20.0, isBaseRule: false, isExclusion: false }])
    ];

    const baselines = BaselineWalletEngine.calculateBaselines(context, wallet);
    
    expect(baselines['zeroSpend']).toBe(0);
  });
});
