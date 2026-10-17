import { describe, it, expect } from 'vitest';
import { rankCards, rewardFor, cardsByIds, bestInCatalog, SAMPLE_WALLET_IDS, HERO_MOMENTS, CATALOG_STATS, type FinixCard } from '../swipeMath';

const card = (over: Partial<FinixCard>): FinixCard => ({
  id: 'x', name: 'X', bank: 'HDFC', network: 'Visa', annualFee: 0, minIncome: 0, minCibil: 0,
  rewards: [], baseRewardRate: 1, highlights: [], ...over,
});

describe('swipeMath', () => {
  it('uses the category rate, falls back to base, and applies caps', () => {
    const c = card({ rewards: [{ category: 'dining', rate: 10, cap: 100 }], baseRewardRate: 1 });
    expect(rewardFor(c, 'dining', 500)).toMatchObject({ rate: 10, reward: 50, capped: false, categoryMatch: true });
    expect(rewardFor(c, 'dining', 5000)).toMatchObject({ reward: 100, capped: true });
    expect(rewardFor(c, 'fuel', 1000)).toMatchObject({ rate: 1, reward: 10, categoryMatch: false });
    expect(rewardFor(card({ baseRewardRate: null }), 'fuel', 1000).reward).toBe(0);
  });

  it('ranks by value, breaking ties on the lower annual fee', () => {
    const pricey = card({ id: 'pricey', annualFee: 999, rewards: [{ category: 'shopping', rate: 5 }] });
    const free = card({ id: 'free', annualFee: 0, rewards: [{ category: 'shopping', rate: 5 }] });
    const weak = card({ id: 'weak', baseRewardRate: 1 });
    expect(rankCards([pricey, weak, free], 'shopping', 1000).map((r) => r.card.id)).toEqual(['free', 'pricey', 'weak']);
  });

  it('sample wallet resolves from the real dataset and every hero moment has a different winner', () => {
    const wallet = cardsByIds(SAMPLE_WALLET_IDS);
    expect(wallet).toHaveLength(SAMPLE_WALLET_IDS.length);
    const winners = HERO_MOMENTS.map((m) => rankCards(wallet, m.category, m.amount)[0].card.id);
    expect(new Set(winners).size).toBe(HERO_MOMENTS.length);
  });

  it('catalogue search excludes wallet cards and cards with unknown fees', () => {
    const best = bestInCatalog('dining', 2000, ['hdfc_swiggy']);
    expect(best).not.toBeNull();
    expect(best!.card.id).not.toBe('hdfc_swiggy');
    expect(best!.card.annualFee).not.toBeNull();
    expect(CATALOG_STATS.cards).toBeGreaterThan(100);
  });
});
