import { describe, it, expect } from 'vitest';
import { RewardCalculator } from './rewardCalculator';
import type { CreditCardIntelligence } from '../card-intelligence/types';
import { recommendCards } from '../finix/lib/recommendEngine';
import type { FinixCard, UserProfile } from '../finix/lib/recommendEngine';

describe('Financial Safety - RewardCalculator & Recommendation', () => {
  const baseCard: CreditCardIntelligence = {
    id: 'test-card-1',
    issuer: 'HDFC Bank',
    network: 'Visa',
    cardName: 'Test Card',
    annualFee: 1000,
    joiningFee: 1000,
    rewardType: 'rewards',
    rewardRate: 'Terms unconfirmed',
    loungeAccess: 'None',
    forexMarkup: null,
    fuelBenefits: 'None',
    welcomeBenefits: [],
    milestoneBenefits: [],
    eligibility: {},
    categories: ['dining'],
    premiumTier: 'entry',
    topBenefit: 'Standard',
  };

  it('RewardCalculator - does not fabricate 1.0% when rewardRate is "Terms unconfirmed"', () => {
    const unconfirmedCard: CreditCardIntelligence = {
      ...baseCard,
      rewardRate: 'Terms unconfirmed',
    };

    const calc = RewardCalculator.calculateCardReward(unconfirmedCard, 10000, 'dining', []);
    // rawRate must be 0, NOT 1.0%
    expect(calc.baseRewardRate).toBe(0);
    // baseSavings must be 0, NOT ₹100 or ₹300
    expect(calc.expectedSavings).toBe(0);
  });

  it('RewardCalculator - does NOT parse "10 points" as 10% cashback', () => {
    const pointsCard: CreditCardIntelligence = {
      ...baseCard,
      rewardType: 'points',
      rewardRate: '10 points on dining',
    };

    const calc = RewardCalculator.calculateCardReward(pointsCard, 10000, 'dining', []);
    expect(calc.baseRewardRate).toBe(0); // Not converted to 10%
    expect(calc.expectedSavings).toBe(0);
  });

  it('RewardCalculator - does NOT parse "10 points per ₹100" as 10% cashback', () => {
    const pointsCard: CreditCardIntelligence = {
      ...baseCard,
      rewardType: 'points',
      rewardRate: '10 points per ₹100 spend',
    };

    const calc = RewardCalculator.calculateCardReward(pointsCard, 10000, 'dining', []);
    expect(calc.baseRewardRate).toBe(0);
    expect(calc.expectedSavings).toBe(0);
  });

  it('RewardCalculator - correctly calculates percentage when explicit % is present', () => {
    const cashbackCard: CreditCardIntelligence = {
      ...baseCard,
      rewardType: 'cashback',
      rewardRate: '5% cashback on all spends',
    };

    const calc = RewardCalculator.calculateCardReward(cashbackCard, 10000, 'travel', []);
    expect(calc.baseRewardRate).toBe(5);
    expect(calc.expectedSavings).toBe(500); // 5% of 10000 = 500
  });

  it('recommendEngine - unknown annualFee does NOT receive free-card bonus (+20 pts)', () => {
    const unknownFeeCard: FinixCard = {
      id: 'unknown-fee-1',
      name: 'Unconfirmed Fee Card',
      bank: 'Bank A',
      network: 'Visa',
      annualFee: null, // Unknown fee
      minIncome: 0,
      minCibil: 0,
      rewards: [],
      baseRewardRate: null,
      highlights: [],
    };

    const zeroFeeCard: FinixCard = {
      id: 'zero-fee-1',
      name: 'Confirmed Free Card',
      bank: 'Bank A',
      network: 'Visa',
      annualFee: 0, // Confirmed free
      minIncome: 0,
      minCibil: 0,
      rewards: [],
      baseRewardRate: null,
      highlights: [],
    };

    const profile: UserProfile = {
      monthlySpend: 50000,
      annualIncome: 1000000,
      cibilScore: 750,
      topCategories: ['dining'],
      wantsLounge: false,
      maxAnnualFee: 10000,
    };

    // Card with confirmed 0 fee must rank higher than card with unconfirmed fee
    // because confirmed 0 fee receives the 20 pts free-card bonus
    // whereas unconfirmed fee receives 0 fee bonus
  });

  it('recommendEngine - unknown annualFee does NOT pass maxAnnualFee = 0 filter', () => {
    const freeOnlyProfile: UserProfile = {
      monthlySpend: 50000,
      annualIncome: 1000000,
      cibilScore: 750,
      topCategories: ['dining'],
      wantsLounge: false,
      maxAnnualFee: 0, // Free only
    };

    const results = recommendCards(freeOnlyProfile, 100);
    // All recommended cards under maxAnnualFee: 0 MUST strictly have annualFee === 0
    for (const card of results) {
      expect(card.annualFee).toBe(0);
    }
  });
});
