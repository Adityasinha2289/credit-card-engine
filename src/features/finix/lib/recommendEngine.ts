/**
 * Card recommendation engine.
 *
 * Scoring aligned with backend/recommender.py from:
 * https://github.com/Adityasinha2289/credit-card-engine
 *
 * Core scoring approach:
 *   - CIBIL tier points  (up to 40)
 *   - Salary tier points (up to 30)
 *   - Category reward scoring (weighted by priority)
 *   - Fee, lounge, and bonus modifiers
 */

import { CARD_DATASET, type FinixCard, type SpendCategory } from '../data/cardDataset';

// ─────────────────────────────────────────────────────────────────────────────
//  TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface UserProfile {
  /** INR per year. 0 / undefined = unknown → approval criteria are not checked (and we say so). */
  annualIncome?: number;
  /** 300–900. 0 / undefined = unknown. */
  cibilScore?: number;
  topCategories: SpendCategory[]; // ordered by priority
  /** INR. undefined = no limit, 0 = lifetime-free only. */
  maxAnnualFee?: number;
  wantsLounge: boolean;
  /** Optional estimated monthly spend per category (INR) — used for spend tier scoring */
  monthlySpend?: Partial<Record<SpendCategory, number>>;
}

export interface RecommendedCard extends FinixCard {
  matchScore: number;
  matchPercent: number;
  /** Set when we could not confirm approval criteria or the fee. */
  eligibilityReason?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
//  BACKEND-ALIGNED SCORING  (ported from recommender.py)
// ─────────────────────────────────────────────────────────────────────────────

/** CIBIL tier score — mirrors recommender.py:calculate_finix_score */
function cibilTierScore(cibil: number): number {
  if (cibil >= 750) return 40;
  if (cibil >= 650) return 25;
  return 10;
}

/** Salary tier score — mirrors recommender.py:calculate_finix_score */
function salaryTierScore(annualSalary: number): number {
  if (annualSalary >= 1_000_000) return 30; // 10L+
  if (annualSalary >= 500_000)  return 20;  // 5L+
  return 10;
}

/** Monthly spend tier score — mirrors recommender.py:calculate_finix_score */
function spendTierScore(monthlySpend: Partial<Record<SpendCategory, number>>): number {
  const total = Object.values(monthlySpend).reduce((s, v) => s + (v ?? 0), 0);
  if (total >= 20_000) return 30;
  if (total >= 10_000) return 20;
  return 10;
}

// ─────────────────────────────────────────────────────────────────────────────
//  CARD SCORER
// ─────────────────────────────────────────────────────────────────────────────

/** Returns -1 when the card must be excluded, otherwise its score. */
function gate(card: FinixCard, profile: UserProfile): { excluded: boolean; caveats: string[] } {
  const caveats: string[] = [];
  const income = profile.annualIncome && profile.annualIncome > 0 ? profile.annualIncome : undefined;
  const cibil = profile.cibilScore && profile.cibilScore > 0 ? profile.cibilScore : undefined;

  // Approval criteria: only gate on what we actually know.
  if (card.minIncome > 0) {
    if (income === undefined) caveats.push('income not checked');
    else if (card.minIncome > income) return { excluded: true, caveats };
  }
  if (card.minCibil > 0) {
    if (cibil === undefined) caveats.push('credit score not checked');
    else if (card.minCibil > cibil) return { excluded: true, caveats };
  }

  // Fee limit: an unknown fee can't be shown as within the user's limit.
  if (profile.maxAnnualFee !== undefined) {
    if (card.annualFee === null) return { excluded: true, caveats };
    if (profile.maxAnnualFee === 0 && card.annualFee !== 0) return { excluded: true, caveats };
    if (profile.maxAnnualFee > 0 && card.annualFee > profile.maxAnnualFee) return { excluded: true, caveats };
  } else if (card.annualFee === null) {
    caveats.push('annual fee not confirmed');
  }
  return { excluded: false, caveats };
}

function scoreCard(card: FinixCard, profile: UserProfile): number {
  const income = profile.annualIncome && profile.annualIncome > 0 ? profile.annualIncome : undefined;
  const cibil = profile.cibilScore && profile.cibilScore > 0 ? profile.cibilScore : undefined;

  let score = 0;

  // ── Backend-aligned base score (profile-level, identical for every card) ──
  score += cibil !== undefined ? cibilTierScore(cibil) : 25;
  score += income !== undefined ? salaryTierScore(income) : 20;
  if (profile.monthlySpend) {
    score += spendTierScore(profile.monthlySpend);
  } else if (income !== undefined) {
    // Estimate spend tier from income (≈15% of annual income / 12)
    const estMonthlySpend = income * 0.15 / 12;
    score += estMonthlySpend >= 20_000 ? 30 : estMonthlySpend >= 10_000 ? 20 : 10;
  } else {
    score += 20;
  }

  // ── Fee scoring (lower is better, unknown fee gets neutral 0 bonus) ────────
  if (card.annualFee === 0)                                   score += 20;
  else if (card.annualFee !== null && card.annualFee <= 500)  score += 16;
  else if (card.annualFee !== null && card.annualFee <= 1000) score += 13;
  else if (card.annualFee !== null && card.annualFee <= 3000) score += 10;
  else if (card.annualFee !== null && card.annualFee <= 5000) score +=  7;
  else if (card.annualFee !== null)                           score +=  3;

  // Fee waiver bonus (only when we can judge reachability from income)
  if (card.feeWaiverSpend && income !== undefined && card.feeWaiverSpend <= income * 0.25) {
    score += 8;
  }

  // ── Lounge scoring ────────────────────────────────────────────────────────
  if (profile.wantsLounge && card.loungeAccess && card.loungeAccess > 0) {
    score += Math.min(card.loungeAccess, 20); // up to 20 pts
  }

  // ── Category reward scoring (priority-weighted) ───────────────────────────
  // Top category = 5× weight, second = 4×, ... minimum 1×
  profile.topCategories.forEach((category, idx) => {
    const weight = Math.max(5 - idx, 1);
    const catReward = card.rewards?.find((r) => r.category === category);
    const rate = catReward ? catReward.rate : (card.baseRewardRate ?? 0);
    score += rate * weight;
  });

  // ── Base reward rate (overall quality) ───────────────────────────────────
  if (card.baseRewardRate !== null && card.baseRewardRate > 0) {
    score += card.baseRewardRate * 2;
  }

  // ── Welcome bonus ────────────────────────────────────────────────────────
  if (card.welcomeBonus) score += 5;

  return score;
}

// ─────────────────────────────────────────────────────────────────────────────
//  PUBLIC API
// ─────────────────────────────────────────────────────────────────────────────

export function recommendCards(profile: UserProfile, limit = 5): RecommendedCard[] {
  const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 5;
  const scored = CARD_DATASET.flatMap((card) => {
    const g = gate(card, profile);
    if (g.excluded) return [];
    return [{
      ...card,
      matchScore: scoreCard(card, profile),
      matchPercent: 0,
      eligibilityReason: g.caveats.length
        ? `Not confirmed: ${g.caveats.join(', ')}. Check the issuer's criteria before applying.`
        : undefined,
    }];
  });

  const eligible = scored;
  eligible.sort((a, b) => b.matchScore - a.matchScore);

  const maxScore = eligible[0]?.matchScore ?? 1;

  return eligible.slice(0, safeLimit).map((c) => ({
    ...c,
    matchPercent: Math.round((c.matchScore / maxScore) * 100),
  }));
}


// ─────────────────────────────────────────────────────────────────────────────
//  CATEGORIES LIST  (used by RecommenderPanel step 3)
// ─────────────────────────────────────────────────────────────────────────────

export const CATEGORIES_LIST: { value: SpendCategory; label: string }[] = [
  { value: 'dining',        label: 'Dining & Food' },
  { value: 'shopping',      label: 'Online Shopping' },
  { value: 'travel',        label: 'Travel & Flights' },
  { value: 'groceries',     label: 'Groceries' },
  { value: 'fuel',          label: 'Fuel' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'utilities',     label: 'Utilities & Bills' },
  { value: 'health',        label: 'Health & Medical' },
  { value: 'transport',     label: 'Cab & Transport' },
  { value: 'subscriptions', label: 'Subscriptions' },
];
