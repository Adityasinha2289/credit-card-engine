import { describe, expect, it } from 'vitest';
import { addedValue, picksFor, spendProfile, ASSUMED_MONTHLY } from './picks';
import type { FinixCard } from '../../../public-platform/site/swipeMath';
import type { Transaction } from '../../../features/dashboard/types/dashboard.types';

const card = (id: string, over: Partial<FinixCard>): FinixCard => ({
  id, name: id, bank: 'HDFC', network: 'Visa', annualFee: 0, minIncome: 0, minCibil: 0, rewards: [], baseRewardRate: 1, highlights: [], ...over,
});

const dining10 = card('dining10', { rewards: [{ category: 'dining', rate: 10 }], annualFee: 500 });
const flat1 = card('flat1', {});
const premium = card('premium', { baseRewardRate: 3, annualFee: 10000, minIncome: 2_000_000, minCibil: 750 });

describe('spendProfile', () => {
  it('assumes a typical month, tilted to the chosen spends, when nothing is logged', () => {
    const { profile, assumed } = spendProfile([], ['dining']);
    expect(assumed).toBe(true);
    const total = Object.values(profile).reduce((a, b) => a + (b ?? 0), 0);
    expect(Math.abs(total - ASSUMED_MONTHLY)).toBeLessThan(10);
    expect(profile.dining!).toBeGreaterThan(profile.fuel!);
  });

  it('uses the last 90 days of logged spend, as a monthly average in rupees', () => {
    const now = new Date('2026-10-19T12:00:00Z');
    const txns = [
      { id: '1', merchant: 'Swiggy', amount: 300_000, date: '2026-10-01T10:00:00Z', category: 'dining', type: 'debit', cardId: '' },
      { id: '2', merchant: 'Old', amount: 900_000, date: '2026-01-01T10:00:00Z', category: 'dining', type: 'debit', cardId: '' },
    ] as Transaction[];
    const { profile, assumed } = spendProfile(txns, [], now);
    expect(assumed).toBe(false);
    expect(profile.dining).toBe(1000);
  });
});

describe('addedValue', () => {
  it('counts only what beats your best card, a year, minus the fee', () => {
    const v = addedValue(dining10, [flat1], { dining: 1000, fuel: 1000 });
    // dining: (10% - 1%) of ₹1,000 = ₹90 a month, ₹1,080 a year; fuel: no gain
    expect(v.gross).toBe(1080);
    expect(v.net).toBe(1080 - 500);
    expect(v.wins.map((w) => w.category)).toEqual(['dining']);
  });

  it('waives the fee when yearly spend clears the threshold', () => {
    const v = addedValue({ ...dining10, feeWaiverSpend: 10_000 }, [flat1], { dining: 1000 });
    expect(v.feeWaived).toBe(true);
    expect(v.net).toBe(v.gross);
  });
});

describe('picksFor', () => {
  const source = [dining10, flat1, premium];
  it('never suggests a card you hold, and ranks by net value', () => {
    const picks = picksFor({ walletIds: ['flat1'], profile: { dining: 5000 }, source });
    expect(picks.map((p) => p.card.id)).not.toContain('flat1');
    expect(picks[0].card.id).toBe('dining10');
  });

  it('marks cards your income or score falls short of, and lists them after the rest', () => {
    const picks = picksFor({ walletIds: [], profile: { dining: 50000 }, income: 600_000, cibil: 700, source });
    const last = picks[picks.length - 1];
    expect(last.card.id).toBe('premium');
    expect(last.needs).toEqual({ income: 2_000_000, cibil: 750 });
    expect(picks.filter((p) => p.card.id !== 'premium').every((p) => p.needs === null && !p.unchecked)).toBe(true);
  });

  it('respects a fee cap', () => {
    const picks = picksFor({ walletIds: [], profile: { dining: 5000 }, maxFee: 0, source });
    expect(picks.every((p) => p.card.annualFee === 0)).toBe(true);
  });
});
