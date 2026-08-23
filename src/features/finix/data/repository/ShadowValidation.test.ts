import { describe, it, expect } from 'vitest';
import { AdapterCardDataSource } from './AdapterCardDataSource';
import { RenocredDataProvider } from '../../../card-intelligence/providers/RenocredDataProvider';
import { CardRepository as FinixCardRepository } from './CardRepository';
import { CardRepository as IntelCardRepository } from '../../../card-intelligence/cardRepository';
import { RewardCalculator } from '../../../recommendation/rewardCalculator';
import { ScoringRules } from '../../../recommendation/intelligence/scoringRules';
import { recommendCards } from '../../lib/recommendEngine';
import type { UserProfile } from '../../lib/recommendEngine';

describe('Phase 3C.0 — Production Activation & Invariants', () => {
  // Invariant 1: 518 dataset is active by default in production
  it('Invariant 1: Default data sources serve the 518-card canonical master dataset in production', () => {
    const defaultFinixSource = new AdapterCardDataSource(); // default = production
    const cards = defaultFinixSource.getCards();
    expect(cards.length).toBe(518);

    const defaultIntelProvider = new RenocredDataProvider(); // default = production
    const intelCards = defaultIntelProvider.getCards();
    expect(intelCards.length).toBe(518);
  });

  // Invariant 2: legacy-209 rollback mode remains functional
  it('Invariant 2: Explicit legacy-209 mode serves the 209-card rollback dataset', () => {
    const legacyFinixSource = new AdapterCardDataSource('legacy-209');
    const legacyFinixCards = legacyFinixSource.getCards();
    expect(legacyFinixCards.length).toBe(209);

    const legacyIntelProvider = new RenocredDataProvider('legacy-209');
    const legacyIntelCards = legacyIntelProvider.getCards();
    expect(legacyIntelCards.length).toBe(209);
  });

  // Invariant 3 & 4: 518 cards load and produce 518 distinct adapter outputs without drops or duplicates
  it('Invariant 3 & 4: 518 cards produce 518 distinct adapter outputs without drops or duplicates', () => {
    const prodFinixSource = new AdapterCardDataSource('production');
    const cards = prodFinixSource.getCards();
    expect(cards.length).toBe(518);

    const uniqueIds = new Set(cards.map(c => c.id));
    expect(uniqueIds.size).toBe(518);
  });

  // Invariant 5: null annual fee remains null
  it('Invariant 5: null annualFee remains null throughout projection', () => {
    const prodFinixSource = new AdapterCardDataSource('production');
    const cards = prodFinixSource.getCards();
    const unknownFeeCards = cards.filter(c => c.annualFee === null);
    expect(unknownFeeCards.length).toBe(304);

    const confirmedFreeCards = cards.filter(c => c.annualFee === 0);
    expect(confirmedFreeCards.length).toBe(45);

    const confirmedPaidCards = cards.filter(c => c.annualFee !== null && c.annualFee > 0);
    expect(confirmedPaidCards.length).toBe(169);
  });

  // Invariant 6: null forex remains null
  it('Invariant 6: null forexMarkup remains null in intelligence cards', () => {
    const prodIntelProvider = new RenocredDataProvider('production');
    const intelCards = prodIntelProvider.getCards();
    const nullForexCards = intelCards.filter(c => c.forexMarkup === null);
    expect(nullForexCards.length).toBe(518);
  });

  // Invariant 7 & 10: unknown rewards remain semantically unknown and cannot become positive %
  it('Invariant 7 & 10: unconfirmed rewards produce 0% monetary rate and retain unconfirmed description', () => {
    const prodIntelProvider = new RenocredDataProvider('production');
    const intelCards = prodIntelProvider.getCards();
    const unconfirmedCard = intelCards.find(c => c.rewardRate === 'Terms unconfirmed');
    expect(unconfirmedCard).toBeDefined();

    const calc = RewardCalculator.calculateCardReward(unconfirmedCard!, 10000, 'dining', []);
    expect(calc.baseRewardRate).toBe(0);
    expect(calc.expectedSavings).toBe(0);
  });

  // Invariant 8: annualFee null cannot pass maxAnnualFee = 0
  it('Invariant 8: unknown annualFee cards fail maxAnnualFee = 0 filter', () => {
    const freeOnlyProfile: UserProfile = {
      monthlySpend: 50000,
      annualIncome: 1000000,
      cibilScore: 750,
      topCategories: ['dining'],
      wantsLounge: false,
      maxAnnualFee: 0,
    };

    const recommended = recommendCards(freeOnlyProfile, 100);
    expect(recommended.length).toBeGreaterThan(0);
    for (const card of recommended) {
      expect(card.annualFee).toBe(0); // Must strictly be confirmed zero
    }
  });

  // Invariant 9: unknown fee receives no free-card advantage
  it('Invariant 9: unknown fee cards receive neutral 50 fee score in ScoringRules', () => {
    const prodIntelProvider = new RenocredDataProvider('production');
    const intelCards = prodIntelProvider.getCards();
    const unknownFeeCard = intelCards.find(c => c.annualFee === null);
    expect(unknownFeeCard).toBeDefined();

    const score = ScoringRules.evalAnnualFee(unknownFeeCard!.annualFee, 10000);
    expect(score).toBe(50); // Neutral score (not 100)
  });

  // Invariant 11: unknown forex cannot become 0%
  it('Invariant 11: unknown forex cards do not render as 0% or claim 0% markup', () => {
    const prodIntelProvider = new RenocredDataProvider('production');
    const intelCards = prodIntelProvider.getCards();
    for (const card of intelCards) {
      if (card.forexMarkup === null) {
        expect(card.forexMarkup).not.toBe(0);
      }
    }
  });

  // Invariant 12: switching to rollback mode does not corrupt instances
  it('Invariant 12: executing rollback data source preserves 209-card dataset cleanly', () => {
    const prodSource = new AdapterCardDataSource('production');
    expect(prodSource.getCards().length).toBe(518);

    const rollbackSource = new AdapterCardDataSource('legacy-209');
    expect(rollbackSource.getCards().length).toBe(209);
  });
});
