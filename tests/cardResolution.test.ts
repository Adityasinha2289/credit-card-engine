import { describe, it, expect, beforeAll } from 'vitest';
import { CardReconciler } from '../src/features/data-import/reconciliation/cardReconciler';

describe('CardReconciler Token-Sort Normalization', () => {
  let reconciler: CardReconciler;

  beforeAll(async () => {
    reconciler = await CardReconciler.initialize();
  });

  it('normalizes identically regardless of word order', () => {
    const name1 = 'Simply CLICK SBI Credit Card';
    const norm1 = reconciler.normalizeTokens(name1);
    const norm2 = reconciler.normalizeTokens('SBI Simply CLICK Credit Card');
    
    expect(norm1).toBe(norm2);
    expect(norm1).toBe('click sbi simply');
  });

  it('strips non-alphanumeric but preserves +', () => {
    const norm1 = reconciler.normalizeTokens('AU Bank Zenith+ Credit Card');
    const norm2 = reconciler.normalizeTokens('AU Zenith+');
    
    expect(norm1).toBe('au zenith+');
    expect(norm2).toBe('au zenith+');
  });

  it('removes stop words like card, credit, bank', () => {
    const norm = reconciler.normalizeTokens('HDFC Bank Platinum Credit Card');
    expect(norm).toBe('hdfc platinum');
  });

  it('prevents collisions from unsafe matches', () => {
    const norm1 = reconciler.normalizeTokens('AU Zenith');
    const norm2 = reconciler.normalizeTokens('AU Zenith+');
    expect(norm1).not.toBe(norm2);
  });
});
