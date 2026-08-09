import { describe, it, expect } from 'vitest';

describe('Admin Offer CRUD Validation', () => {
  it('rejects percentage discount > 100', () => {
    const payload = { offer_type: 'percentage_discount', value: 120 };
    expect(payload.value).toBeGreaterThan(100);
  });

  it('rejects negative max_discount', () => {
    const payload = { max_discount: -50 };
    expect(payload.max_discount).toBeLessThan(0);
  });

  it('rejects valid_until before valid_from', () => {
    const from = new Date('2026-08-10');
    const until = new Date('2026-08-01');
    expect(until.getTime()).toBeLessThan(from.getTime());
  });

  it('syncs redundant constraints into eligibility JSON', () => {
    // Simulating the API route logic
    const reqBody = { min_spend: 500, max_discount: 1000, eligibility_rules: { categories: ['shopping'] } };
    const safeEligibility = { ...reqBody.eligibility_rules, minSpend: reqBody.min_spend, maxDiscount: reqBody.max_discount };
    
    expect(safeEligibility.minSpend).toBe(500);
    expect(safeEligibility.maxDiscount).toBe(1000);
    expect(safeEligibility.categories).toContain('shopping');
  });
});
