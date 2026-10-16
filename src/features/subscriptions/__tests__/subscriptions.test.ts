import { describe, it, expect } from 'vitest';
import { addCycles, rollForward, istDate, toCalendarDate, yearlyCost, monthlyCost, daysBetween } from '../billingCycle';
import { planReminders, upcomingCharges, isQuietTime } from '../reminderPlanner';
import { detectRecurring, merchantKey } from '../recurringDetector';
import { findPreset } from '../presets';
import type { Subscription, Transaction } from '../../dashboard/types/dashboard.types';

const sub = (p: Partial<Subscription>): Subscription => ({
  id: p.id ?? Math.random().toString(36), name: 'Netflix', amount: 64900, billingCycle: 'monthly',
  nextBillingDate: '2026-10-19', status: 'active', cardId: '', category: 'entertainment',
  hasPriceHike: false, isFreeTrial: false, ...p,
});

describe('billingCycle', () => {
  it('clamps month-end anchors and recovers the anchor day', () => {
    expect(addCycles('2026-01-31', 'monthly')).toBe('2026-02-28');
    expect(addCycles('2026-01-31', 'monthly', 2)).toBe('2026-03-31');
    expect(addCycles('2024-02-29', 'yearly')).toBe('2025-02-28');
    expect(addCycles('2026-11-15', 'quarterly')).toBe('2027-02-15');
    expect(addCycles('2026-10-30', 'weekly')).toBe('2026-11-06');
  });

  it('rolls stale dates forward past missed cycles (regression: dates never advanced)', () => {
    expect(rollForward('2026-07-31', 'monthly', '2026-10-16')).toBe('2026-10-31');
    expect(rollForward('2026-10-20', 'monthly', '2026-10-16')).toBe('2026-10-20');
    expect(rollForward('2025-12-15', 'yearly', '2026-10-16')).toBe('2026-12-15');
  });

  it('uses IST calendar days', () => {
    expect(istDate('2026-10-15T19:00:00Z')).toBe('2026-10-16'); // 00:30 IST
    expect(toCalendarDate('2026-10-20T00:00:00Z')).toBe('2026-10-20');
    expect(toCalendarDate('garbage')).toBeNull();
    expect(daysBetween('2026-10-16', '2026-10-19')).toBe(3);
  });

  it('annualises costs correctly (yearly plans are not ×12)', () => {
    expect(yearlyCost(149900, 'yearly')).toBe(149900);
    expect(yearlyCost(64900, 'monthly')).toBe(778800);
    expect(monthlyCost(149900, 'yearly')).toBe(12492);
  });
});

describe('planReminders', () => {
  const today = '2026-10-16';

  it('fires exactly on each lead day, once', () => {
    const s = [sub({ nextBillingDate: '2026-10-19', reminderDays: [3, 1] })];
    expect(planReminders(s, '2026-10-16')).toHaveLength(1);
    expect(planReminders(s, '2026-10-17')).toHaveLength(0);
    expect(planReminders(s, '2026-10-18')[0].title).toBe('Netflix renews tomorrow');
  });

  it('uses longer default lead times for yearly plans', () => {
    const r = planReminders([sub({ name: 'Prime', billingCycle: 'yearly', amount: 149900, nextBillingDate: '2026-10-23' })], today);
    expect(r[0].kind).toBe('annual_renewal');
    expect(r[0].leadDays).toBe(7);
  });

  it('warns before a free trial converts and suppresses the plain renewal', () => {
    const r = planReminders([sub({ isFreeTrial: true, trialEndsOn: '2026-10-17', nextBillingDate: '2026-10-17' })], today);
    expect(r).toHaveLength(1);
    expect(r[0].kind).toBe('trial_ending');
    expect(r[0].body).toContain('₹649');
  });

  it('calls out price hikes', () => {
    const r = planReminders([sub({ hasPriceHike: true, previousAmount: 49900 })], today);
    expect(r[0].kind).toBe('price_hike');
    expect(r[0].body).toContain('up from ₹499');
  });

  it('ignores paused / cancelled and rolls stale dates', () => {
    expect(planReminders([sub({ status: 'paused' }), sub({ status: 'cancelled' })], today)).toHaveLength(0);
    // last charged 19 Sep → next 19 Oct → 3 days away
    expect(planReminders([sub({ nextBillingDate: '2026-09-19' })], today)).toHaveLength(1);
  });

  it('lists upcoming charges inside a window', () => {
    const list = upcomingCharges([sub({ nextBillingDate: '2026-10-20' }), sub({ nextBillingDate: '2026-11-30' })], today, 7);
    expect(list).toHaveLength(1);
    expect(list[0].daysLeft).toBe(4);
  });

  it('quiet hours wrap midnight', () => {
    expect(isQuietTime('23:10', '22:00', '08:00')).toBe(true);
    expect(isQuietTime('07:59', '22:00', '08:00')).toBe(true);
    expect(isQuietTime('09:00', '22:00', '08:00')).toBe(false);
    expect(isQuietTime('13:00', '12:00', '14:00')).toBe(true);
  });
});

describe('detectRecurring', () => {
  const tx = (merchant: string, date: string, amount: number, extra: Partial<Transaction> = {}): Transaction => ({
    id: `${merchant}-${date}`, merchant, date: `${date}T10:00:00+05:30`, amount, category: 'entertainment',
    type: 'debit', cardId: 'hdfc', ...extra,
  });

  it('finds a monthly subscription and predicts the next charge', () => {
    const r = detectRecurring([
      tx('NETFLIX.COM MUMBAI', '2026-07-05', 64900),
      tx('Netflix India Pvt Ltd', '2026-08-05', 64900),
      tx('NETFLIX.COM', '2026-09-05', 64900),
      tx('Zomato', '2026-09-07', 45000),
      tx('Zomato', '2026-09-20', 32000),
    ], [], '2026-09-20');
    expect(r).toHaveLength(1);
    expect(r[0].name).toBe('Netflix');
    expect(r[0].billingCycle).toBe('monthly');
    expect(r[0].nextBillingDate).toBe('2026-10-05');
    expect(r[0].confidence).toBeGreaterThanOrEqual(0.8);
  });

  it('detects a price hike on the latest charge', () => {
    const r = detectRecurring([
      tx('Spotify', '2026-07-12', 11900), tx('Spotify', '2026-08-12', 11900), tx('Spotify', '2026-09-12', 13900),
    ], [], '2026-09-20');
    expect(r[0].hasPriceHike).toBe(true);
    expect(r[0].previousAmount).toBe(11900);
  });

  it('skips irregular merchants, already-tracked services and stale series', () => {
    expect(detectRecurring([tx('Uber', '2026-09-01', 20000), tx('Uber', '2026-09-15', 21000)], [], '2026-09-20')).toHaveLength(0);
    expect(detectRecurring([tx('Netflix', '2026-08-05', 64900), tx('Netflix', '2026-09-05', 64900)], [sub({ name: 'Netflix' })], '2026-09-20')).toHaveLength(0);
    expect(detectRecurring([tx('Gym', '2025-01-05', 100000), tx('Gym', '2025-02-05', 100000)], [], '2026-09-20')).toHaveLength(0);
  });

  it('normalises merchant names', () => {
    expect(merchantKey('NETFLIX.COM MUMBAI')).toBe('netflix');
    expect(merchantKey('ACME CLOUD BANGALORE')).toBe('acme cloud');
    expect(merchantKey('Netflix India Pvt. Ltd.')).toBe('netflix');
    expect(findPreset('APPLE.COM/BILL ITUNES')?.key).toBe('apple');
  });
});
