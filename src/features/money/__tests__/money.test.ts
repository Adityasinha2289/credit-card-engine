import { describe, it, expect } from 'vitest';
import { SafeToSpendEngine, CardDueEngine } from '../engines/SafeToSpendEngine';
import { PaymentDecisionEngine } from '../engines/PaymentDecisionEngine';
import { summarizeMonth, monthKey, daysUntil, formatRupees, isSpend } from '../lib/moneyMath';
import type { Transaction, Subscription, CategoryBudget, CreditAccount } from '../../dashboard/types/dashboard.types';
import type { CardData } from '../../cards/types/card.types';
import { CARD_DATASET } from '../../finix/data/cardDataset';

const NOW = new Date('2026-10-16T06:00:00Z'); // 11:30 IST, 16 Oct
const tx = (p: Partial<Transaction>): Transaction => ({
  id: Math.random().toString(36), merchant: 'Shop', amount: 10000, date: '2026-10-10T10:00:00Z',
  category: 'shopping', type: 'debit', cardId: 'c1', ...p,
});
const sub = (p: Partial<Subscription>): Subscription => ({
  id: Math.random().toString(36), name: 'Sub', amount: 10000, billingCycle: 'monthly',
  nextBillingDate: '2026-10-20', status: 'active', cardId: '', category: 'entertainment',
  hasPriceHike: false, isFreeTrial: false, ...p,
});

describe('moneyMath', () => {
  it('uses IST month boundaries', () => {
    // 2026-09-30T19:00Z is 1 Oct 00:30 IST → October, not September
    expect(monthKey('2026-09-30T19:00:00Z')).toBe('2026-10');
    expect(monthKey('2026-09-30T18:00:00Z')).toBe('2026-09');
  });

  it('excludes card bill payments from spend and refunds', () => {
    const s = summarizeMonth([
      tx({ amount: 50000 }),
      tx({ merchant: 'Bill Payment', type: 'credit', amount: -500000 }),
      tx({ type: 'refund', amount: -10000 }),
    ], NOW);
    expect(s.spent).toBe(50000);
    expect(s.refunds).toBe(10000);
    expect(s.netSpent).toBe(40000);
  });

  it('formats paise as rupees', () => {
    expect(formatRupees(12345600)).toBe('₹1,23,456');
    expect(formatRupees(-50000, { signed: true })).toBe('−₹500');
  });

  it('counts calendar days in IST', () => {
    expect(daysUntil('2026-10-16', NOW)).toBe(0);
    expect(daysUntil('2026-10-19', NOW)).toBe(3);
  });

  it('isSpend ignores credits', () => {
    expect(isSpend(tx({ type: 'credit', amount: -100 }))).toBe(false);
  });
});

describe('SafeToSpendEngine', () => {
  const base = { goals: [], budgets: [] as CategoryBudget[], subscriptions: [] as Subscription[], now: NOW };

  it('keeps every value in paise (regression: rupee income vs paise spend → 100× error)', () => {
    const r = SafeToSpendEngine.calculate({
      ...base,
      monthlyIncome: 75000 * 100,                   // ₹75,000
      transactions: [tx({ amount: 25000 * 100 })],  // ₹25,000
    });
    expect(r.safeToSpend).toBe(50000 * 100);
    expect(r.daysLeft).toBe(16); // 16..31 Oct inclusive
    expect(r.perDay).toBe(Math.floor((50000 * 100) / 16));
  });

  it('paying a card bill does not increase spend', () => {
    const r = SafeToSpendEngine.calculate({
      ...base,
      monthlyIncome: 100000,
      transactions: [tx({ amount: 20000 }), tx({ merchant: 'Bill Payment', type: 'credit', amount: -20000 })],
    });
    expect(r.netSpent).toBe(20000);
  });

  it('reserves remaining budget headroom and renewals still due this month', () => {
    const r = SafeToSpendEngine.calculate({
      ...base,
      monthlyIncome: 1_000_000,
      transactions: [tx({ category: 'dining', amount: 30000 })],
      budgets: [{ id: 'b', category: 'dining', limitAmount: 100000, currentSpend: 0, period: 'monthly' }],
      subscriptions: [
        sub({ amount: 64900, nextBillingDate: '2026-10-20' }),
        sub({ amount: 99900, nextBillingDate: '2026-10-02' }), // already billed
        sub({ amount: 99900, nextBillingDate: '2026-11-02' }), // next month
        sub({ amount: 99900, nextBillingDate: '2026-10-25', status: 'cancelled' }),
      ],
    });
    expect(r.reservedForBudgets).toBe(70000);
    expect(r.upcomingSubscriptions).toBe(64900);
    expect(r.safeToSpend).toBe(1_000_000 - 30000 - 70000 - 64900);
  });

  it('reports missing income instead of inventing one', () => {
    const r = SafeToSpendEngine.calculate({ ...base, monthlyIncome: null, transactions: [] });
    expect(r.hasIncome).toBe(false);
    expect(r.safeToSpend).toBe(0);
  });
});

describe('CardDueEngine', () => {
  const acc = (p: Partial<CreditAccount>): CreditAccount => ({
    cardId: 'c1', totalLimit: 100000, currentBalance: 20000, minimumPaymentDue: 0,
    paymentDueDate: '', lastPaymentAmount: 0, lastPaymentDate: null, apr: 0.2, ...p,
  });

  it('never treats a missing or junk due date as overdue (regression: expiry "08/30" parsed as 2001)', () => {
    expect(CardDueEngine.evaluate([acc({ paymentDueDate: '' })], {}, NOW)[0].state).toBe('NO_DUE_DATE');
    expect(CardDueEngine.evaluate([acc({ paymentDueDate: '08/30' })], {}, NOW)[0].state).toBe('NO_DUE_DATE');
  });

  it('flags due soon and overdue', () => {
    expect(CardDueEngine.evaluate([acc({ paymentDueDate: '2026-10-20' })], {}, NOW)[0].state).toBe('DUE_SOON');
    expect(CardDueEngine.evaluate([acc({ paymentDueDate: '2026-10-10' })], {}, NOW)[0].state).toBe('OVERDUE');
  });

  it('a paid-off card is clear even with a past due date', () => {
    expect(CardDueEngine.evaluate([acc({ currentBalance: 0, paymentDueDate: '2026-10-10' })], {}, NOW)[0].state).toBe('CLEAR');
  });
});

describe('PaymentDecisionEngine', () => {
  const ids = CARD_DATASET.slice(0, 3).map((c) => c.id);
  const cards = ids.map((id) => ({ id, status: 'active', label: id, pan: '1234' } as unknown as CardData));

  it('returns the real runner-up, never the winner twice', () => {
    const r = PaymentDecisionEngine.evaluate({ amount: 2000, merchant: 'Swiggy', merchantType: 'P2M' }, cards, []);
    expect(r.recommendedMethodId).toBeTruthy();
    expect(ids).toContain(r.recommendedMethodId);
    if (r.alternativeMethodId) expect(r.alternativeMethodId).not.toBe(r.recommendedMethodId);
  });

  it('routes P2P to bank UPI', () => {
    const r = PaymentDecisionEngine.evaluate({ amount: 500, merchant: '', merchantType: 'P2P' }, cards, []);
    expect(r.recommendedMethodId).toBe('bank_upi');
  });

  it('warns about cards with no reward data instead of hiding them', () => {
    const unknown = { id: 'not_in_catalog', status: 'active', label: 'Mystery card', pan: '1' } as unknown as CardData;
    const r = PaymentDecisionEngine.evaluate({ amount: 1000, merchant: 'Amazon', merchantType: 'P2M' }, [...cards, unknown], []);
    expect(r.warnings.join(' ')).toContain('Mystery card');
  });
});
