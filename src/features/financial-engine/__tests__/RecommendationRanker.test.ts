import { describe, it, expect } from 'vitest';
import { RecommendationRanker } from '../RecommendationRanker';
import { CandidateGenerator } from '../CandidateGenerator';
import type { UserContext } from '../userContext';
import type { FinancialCard } from '../types';

describe('RecommendationRanker', () => {
  const createMockContext = (overrides?: Partial<UserContext>): UserContext => ({
    userId: 'user-rank-1',
    financialProfile: { annualIncome: 1200000, creditScore: 780 },
    spendingProfile: {
      'dining': { monthlySpend: 20000, transactionCount: 5 },
      'travel': { monthlySpend: 15000, transactionCount: 3 }
    },
    existingWalletCardIds: [],
    ...overrides
  });

  const createCard = (
    id: string,
    name: string,
    rate: number,
    annualFee: number,
    joiningFee = 0,
    hasRedemption = true,
    hasCaps = true
  ): FinancialCard => ({
    id,
    name,
    annualFee,
    joiningFee,
    rewardRules: [
      { categoryId: 'dining', rewardType: hasRedemption ? 'CASHBACK' : 'POINTS', earningMethod: 'PERCENTAGE', baseRate: rate, isBaseRule: false, isExclusion: false }
    ],
    caps: hasCaps ? [{ period: 'MONTHLY', unit: 'MONETARY', maxValue: 5000 }] : [],
    redemptionRates: hasRedemption ? [{ pointTypeName: 'Points', mechanism: 'STATEMENT_CREDIT', monetaryValue: 1.0 }] : [],
    benefits: [
      { benefitType: 'lounge', details: { visitsPerQuarter: 2 }, rawSourceText: '2 Complimentary domestic lounge visits per quarter' }
    ],
    eligibility: [{ minIncome: 400000, minCibil: 700 }]
  });

  it('1. Ranks ACTIONABLE candidates primarily by netAnnualValue descending', () => {
    const context = createMockContext();
    const existingWallet: FinancialCard[] = []; // baseline = 0

    // Card A: 5% dining (20k * 5% = 1000/mo = 12000/yr), fee 2000 -> Net 10,000
    const cardA = createCard('card-a', 'Card A', 5.0, 2000);
    // Card B: 6% dining (20k * 6% = 1200/mo = 14400/yr), fee 1000 -> Net 13,400
    const cardB = createCard('card-b', 'Card B', 6.0, 1000);
    // Card C: 4% dining (20k * 4% = 800/mo = 9600/yr), fee 500 -> Net 9,100
    const cardC = createCard('card-c', 'Card C', 4.0, 500);

    const candidates = CandidateGenerator.generate([cardA, cardB, cardC], context);
    const ranked = RecommendationRanker.rank(candidates, context, existingWallet);

    expect(ranked).toHaveLength(3);
    expect(ranked[0].card.id).toBe('card-b'); // Net 13,400
    expect(ranked[1].card.id).toBe('card-a'); // Net 10,000
    expect(ranked[2].card.id).toBe('card-c'); // Net 9,100
    expect(ranked[0].readiness).toBe('ACTIONABLE');
  });

  it('2. Gates INSUFFICIENT_DATA below ACTIONABLE and INFORMATIONAL_ONLY', () => {
    const context = createMockContext();
    const existingWallet: FinancialCard[] = [];

    // Card A: Verified cashback, Net 5,000 (ACTIONABLE)
    const cardA = createCard('card-a', 'Verified Cashback', 5.0, 7000); // 12000 - 7000 = 5000
    // Card B: Points card with missing redemption value (INSUFFICIENT_DATA)
    const cardB = createCard('card-b', 'Missing Redemption Points', 10.0, 500, 0, false);
    // Card C: Cashback with missing cap (INFORMATIONAL_ONLY), Net 8,000
    const cardC = createCard('card-c', 'Uncapped Cashback', 5.0, 4000, 0, true, false);

    const candidates = CandidateGenerator.generate([cardA, cardB, cardC], context);
    const ranked = RecommendationRanker.rank(candidates, context, existingWallet);

    expect(ranked[0].card.id).toBe('card-a'); // ACTIONABLE
    expect(ranked[0].readiness).toBe('ACTIONABLE');
    expect(ranked[1].card.id).toBe('card-c'); // INFORMATIONAL_ONLY
    expect(ranked[1].readiness).toBe('INFORMATIONAL_ONLY');
    expect(ranked[2].card.id).toBe('card-b'); // INSUFFICIENT_DATA
    expect(ranked[2].readiness).toBe('INSUFFICIENT_DATA');
  });

  it('3. Never includes ALREADY_OWNED or INELIGIBLE cards in ranked recommendations', () => {
    const context = createMockContext({
      financialProfile: { annualIncome: 200000, creditScore: 600 }, // Ineligible for 400k/700
      existingWalletCardIds: ['card-owned']
    });

    const cardOwned = createCard('card-owned', 'Owned Card', 10.0, 0);
    const cardIneligible = createCard('card-ineligible', 'High Tier Card', 10.0, 0);

    const candidates = CandidateGenerator.generate([cardOwned, cardIneligible], context);
    const ranked = RecommendationRanker.rank(candidates, context, []);

    expect(ranked).toHaveLength(0);
  });

  it('4. Uses deterministic tie-breaking for equal net value (gross incremental then alphabetical cardId)', () => {
    const context = createMockContext();
    
    // Card X: Gross 12,000, fee 2,000 -> Net 10,000
    const cardX = createCard('card-x', 'Card X', 5.0, 2000);
    // Card Y: Gross 14,400, fee 4,400 -> Net 10,000 (Higher gross incremental reward)
    const cardY = createCard('card-y', 'Card Y', 6.0, 4400);

    const candidates = CandidateGenerator.generate([cardX, cardY], context);
    const ranked = RecommendationRanker.rank(candidates, context, []);

    expect(ranked[0].card.id).toBe('card-y'); // Card Y wins tie-breaker because gross incremental is 14,400 vs 12,000
    expect(ranked[1].card.id).toBe('card-x');
  });

  it('5. Generates structured deterministic explanations with category breakdowns and fee notes', () => {
    const context = createMockContext();
    const existingWalletCard: FinancialCard = createCard('wallet-card', 'Current Dining Card', 4.0, 0); // 20k * 4% = 800/mo = 9600/yr
    
    const candidate = createCard('cand-1', 'Candidate Card', 6.0, 1500, 500); // 20k * 6% = 1200/mo = 14400/yr. Inc: +4800/yr. Net: 3300

    const candidates = CandidateGenerator.generate([candidate], context);
    const ranked = RecommendationRanker.rank(candidates, context, [existingWalletCard]);

    expect(ranked).toHaveLength(1);
    const reasons = ranked[0].reasons;

    expect(reasons.some(r => r.includes('Your existing wallet earns approximately ₹9600/year on dining.'))).toBe(true);
    expect(reasons.some(r => r.includes('This card could generate approximately ₹14400/year on your dining spend.'))).toBe(true);
    expect(reasons.some(r => r.includes('Estimated incremental value for dining: +₹4800/year.'))).toBe(true);
    expect(reasons.some(r => r.includes('Annual fee: ₹1500/year.'))).toBe(true);
    expect(reasons.some(r => r.includes('Joining fee: ₹500 (First-year net value: ₹2800).'))).toBe(true);
    expect(reasons.some(r => r.includes('Estimated net incremental value: +₹3300/year.'))).toBe(true);
  });

  it('6. Generates explanatory reasons for cards requiring missing data', () => {
    const context = createMockContext();
    const candidate = createCard('points-card', 'Points Card', 5.0, 1000, 0, false);

    const candidates = CandidateGenerator.generate([candidate], context);
    const ranked = RecommendationRanker.rank(candidates, context, []);

    expect(ranked[0].reasons).toContain('This card requires additional financial data (e.g., redemption value) to calculate true economic value.');
  });

  it('7. Phase 3.75 Safety: Negative net value cards never outrank positive or zero-value cards', () => {
    const context = createMockContext();

    // Positive actionable card (Net +5000)
    const positiveCard = createCard('pos-card', 'Positive Card', 5.0, 7000); // 12k gross - 7k fee = 5000 net
    // Zero-value break-even card (Net 0)
    const zeroCard = createCard('zero-card', 'Zero Card', 0, 0); // 0 gross - 0 fee = 0 net
    // Negative-value card (Gross 0, fee 499 -> Net -499)
    const negativeCard = createCard('neg-card', 'Negative Card', 0, 499); // 0 gross - 499 fee = -499 net

    const candidates = CandidateGenerator.generate([negativeCard, positiveCard, zeroCard], context);
    const ranked = RecommendationRanker.rank(candidates, context, []);

    expect(ranked[0].card.id).toBe('pos-card');
    expect(ranked[0].economicValue.netAnnualValue).toBe(5000);
    expect(ranked[1].card.id).toBe('zero-card');
    expect(ranked[1].economicValue.netAnnualValue).toBe(0);
    expect(ranked[2].card.id).toBe('neg-card');
    expect(ranked[2].economicValue.netAnnualValue).toBe(-499);
  });

  it('8. Phase 3.75 Safety: Negative net value cards are demoted below INSUFFICIENT_DATA cards', () => {
    const context = createMockContext();

    // Informational card with negative economics (Gross 0, Fee 499 -> Net -499)
    const negInformationalCard = createCard('neg-info', 'Negative Info Card', 0, 499, 0, true, false); // missing caps, but 0 reward & 499 fee -> Net -499
    // Points card with unverified redemption (INSUFFICIENT_DATA, net 0)
    const insufficientPointsCard = createCard('pts-unverified', 'Unverified Points Card', 10.0, 1000, 0, false);

    const candidates = CandidateGenerator.generate([negInformationalCard, insufficientPointsCard], context);
    const ranked = RecommendationRanker.rank(candidates, context, []);

    // INSUFFICIENT_DATA (Tier 2) must rank above NEGATIVE_VALUE (Tier 1)
    expect(ranked[0].card.id).toBe('pts-unverified');
    expect(ranked[0].readiness).toBe('INSUFFICIENT_DATA');
    expect(ranked[1].card.id).toBe('neg-info');
    expect(ranked[1].economicValue.netAnnualValue).toBe(-499);
  });

  it('9. Phase 3.75 Safety: Positive actionable cards strictly outrank informational non-negative and insufficient data cards', () => {
    const context = createMockContext();

    const actionableCard = createCard('act-pos', 'Actionable Positive', 5.0, 2000); // Net 10,000
    const informationalCard = createCard('info-pos', 'Informational Positive', 5.0, 3000, 0, true, false); // Net 9,000, missing caps
    const insufficientCard = createCard('insuf-card', 'Insufficient Data', 10.0, 500, 0, false);
    const negativeCard = createCard('neg-card', 'Negative Value', 0, 1000); // Net -1000

    const candidates = CandidateGenerator.generate([negativeCard, informationalCard, insufficientCard, actionableCard], context);
    const ranked = RecommendationRanker.rank(candidates, context, []);

    expect(ranked[0].card.id).toBe('act-pos'); // Tier 5 (Actionable Positive)
    expect(ranked[1].card.id).toBe('info-pos'); // Tier 3 (Informational Non-negative)
    expect(ranked[2].card.id).toBe('insuf-card'); // Tier 2 (Insufficient Data)
    expect(ranked[3].card.id).toBe('neg-card'); // Tier 1 (Negative Value)
  });
});
