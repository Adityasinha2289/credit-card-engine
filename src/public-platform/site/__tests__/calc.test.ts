import { describe, it, expect } from 'vitest';
import { valueFromRates, blendedRate, breakEvenMonthly, DEFAULT_PROFILE } from '../calc';
import { getCardBySlug } from '../../lib/cardKnowledgeGraph';

const data = { rates: [{ category: 'dining', rate: 10, cap: 500 }, { category: 'shopping', rate: 5 }], baseRate: 1, feeWaiverSpend: 300000 };

describe('calculator maths', () => {
  it('uses category rates, base rate elsewhere, and monthly caps', () => {
    const v = valueFromRates(data, 999, { dining: 10000, shopping: 4000, other: 6000 });
    const dining = v.byCategory.find((c) => c.id === 'dining')!;
    expect(dining).toMatchObject({ rate: 10, capped: true, yearly: 500 * 12 });
    expect(v.byCategory.find((c) => c.id === 'shopping')!.yearly).toBe(200 * 12);
    expect(v.byCategory.find((c) => c.id === 'other')!.yearly).toBe(60 * 12);
    expect(v.gross).toBe((500 + 200 + 60) * 12);
  });

  it('waives the fee once yearly spend reaches the threshold', () => {
    expect(valueFromRates(data, 999, { other: 20000 }).feeWaived).toBe(false); // 2.4L a year
    const v = valueFromRates(data, 999, { other: 30000 }); // 3.6L a year
    expect(v.feeWaived).toBe(true);
    expect(v.net).toBe(v.gross);
  });

  it('reports unknown cards honestly instead of guessing', () => {
    expect(valueFromRates(null, 500, DEFAULT_PROFILE)).toMatchObject({ known: false, gross: 0, net: -500 });
  });

  it('blends rates by share and finds the break-even spend for a real card', () => {
    expect(blendedRate(data, { dining: 1, shopping: 1 })).toBeCloseTo(7.5);
    const infinia = getCardBySlug('hdfc-infinia-metal-edition')!;
    const monthly = breakEvenMonthly(infinia)!;
    expect(monthly).toBeGreaterThan(0);
    // at that spend a year of (uncapped) rewards covers the ₹12,500 fee
    expect(monthly * 12 * (blendedRate({ rates: [{ category: 'travel', rate: 16.5 }, { category: 'shopping', rate: 10 }, { category: 'dining', rate: 3.3 }, { category: 'utilities', rate: 3.3 }], baseRate: 3.3 }, DEFAULT_PROFILE) / 100)).toBeGreaterThanOrEqual(12500);
  });
});
