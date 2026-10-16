/**
 * RewardsFacade — the one entry point for "which card should I use?" and
 * "which new card should I get?".
 *
 * Built on the audited engines:
 *   FinancialTruthEngine   — rule precedence, exclusions, caps (unit-aware), point valuation
 *   CandidateGenerator     — eligibility (UNKNOWN is kept, with a caveat)
 *   IncrementalValueEngine — value *over the user's existing wallet*, net of fees (with fee waivers)
 *   RecommendationRanker   — deterministic tiered ranking
 *
 * Results are returned in the shapes the UI already renders
 * (TransactionEvaluationResult / RecommendedCard) so surfaces can switch
 * engines behind a flag without UI changes. See rewardsApi.ts.
 */
import { CARD_DATASET, type FinixCard, type SpendCategory } from '../finix/data/cardDataset';
import { detectCategory } from '../finix/data/merchantMap';
import type { CardEvaluation, ConfidenceLevel, TransactionEvaluationResult } from '../finix/lib/evaluateTransaction';
import type { RecommendedCard } from '../finix/lib/recommendEngine';
import type { Transaction } from '../dashboard/types/dashboard.types';
import { FinancialTruthEngine } from './FinancialTruthEngine';
import { CandidateGenerator } from './CandidateGenerator';
import { RecommendationRanker } from './RecommendationRanker';
import { legacyToFinancialCard } from './adapters/legacyCardAdapter';
import type { FinancialCard } from './types';
import type { UserContext } from './userContext';

// ─────────────────────────────────────────────────────────────────────────────
//  Catalog
// ─────────────────────────────────────────────────────────────────────────────

let catalogCache: { legacy: FinixCard[]; financial: FinancialCard[]; byId: Map<string, FinixCard> } | null = null;

function catalog(source: FinixCard[] = CARD_DATASET) {
  if (!catalogCache || catalogCache.legacy !== source) {
    catalogCache = {
      legacy: source,
      financial: source.map(legacyToFinancialCard),
      byId: new Map(source.map((c) => [c.id, c])),
    };
  }
  return catalogCache;
}

const IST_OFFSET_MS = 5.5 * 3600_000;
const monthKey = (d: string | Date) => new Date(new Date(d).getTime() + IST_OFFSET_MS).toISOString().slice(0, 7);

// ─────────────────────────────────────────────────────────────────────────────
//  Best card for a payment
// ─────────────────────────────────────────────────────────────────────────────

export interface BestCardInput {
  /** Rupees */
  amount: number;
  merchant?: string;
  category?: SpendCategory;
  walletCardIds: string[];
  /** Earlier transactions (paise) — used to know how much of each monthly cap is already used */
  history?: Transaction[];
  now?: Date;
}

export function bestCardForTransaction(input: BestCardInput, source?: FinixCard[]): TransactionEvaluationResult | null {
  const { amount, walletCardIds } = input;
  if (!(amount > 0) || walletCardIds.length === 0) return null;
  const merchant = input.merchant?.trim() ?? '';
  if (!merchant && !input.category) return null;

  const cat = catalog(source);
  const category = input.category ?? detectCategory(merchant);
  const thisMonth = monthKey(input.now ?? new Date());
  let globalConfidence: ConfidenceLevel = 'EXACT';

  const evaluations: CardEvaluation[] = [];
  for (const id of walletCardIds) {
    const legacy = cat.byId.get(id);
    if (!legacy) continue;
    const card = cat.financial.find((c) => c.id === id)!;

    // Cap usage this month in this category, reconstructed at today's rate.
    let consumed: number | undefined;
    if (input.history) {
      consumed = 0;
      for (const t of input.history) {
        if (t.cardId !== id || t.category !== category || t.type !== 'debit' || monthKey(t.date) !== thisMonth) continue;
        consumed += FinancialTruthEngine.calculateTransaction({ amount: Math.abs(t.amount) / 100, categoryId: category }, card).monetaryRewardValue;
      }
    }

    const result = FinancialTruthEngine.calculateTransaction(
      { amount, categoryId: category },
      card,
      consumed !== undefined ? { consumedCaps: { MONTHLY: consumed } } : undefined,
    );
    const uncapped = FinancialTruthEngine.calculateTransaction({ amount, categoryId: category }, { ...card, caps: [] });

    const limitations: string[] = [];
    let confidence: ConfidenceLevel = 'EXACT';
    if (result.warnings.includes('CAPS_MISSING_IN_DATA')) {
      confidence = 'ESTIMATED';
      limitations.push("This card's reward caps aren't in our data yet; the real reward may be lower on large spends.");
    }
    if (result.warnings.includes('NO_APPLICABLE_RULE') || result.warnings.includes('MISSING_REWARD_DATA')) {
      confidence = 'UNSUPPORTED';
      limitations.push('No reward rate is known for this card in this category.');
    }
    if (result.capApplied) limitations.push(`Reward limited by the card's monthly cap (₹${result.monetaryRewardValue.toFixed(0)} counted).`);

    const categoryRate = legacy.rewards.find((r) => r.category === category);
    const rewardRate = categoryRate?.rate ?? legacy.baseRewardRate ?? 0;
    const reason = result.capApplied
      ? `Earns ₹${result.monetaryRewardValue.toFixed(0)} after its monthly cap on ${category}.`
      : categoryRate
        ? `Earns ${rewardRate}% on ${category}.`
        : `Earns its base ${rewardRate}% (no ${category} bonus).`;

    if (confidence === 'UNSUPPORTED') globalConfidence = 'UNSUPPORTED';
    else if (confidence === 'ESTIMATED' && globalConfidence === 'EXACT') globalConfidence = 'ESTIMATED';

    evaluations.push({
      card: legacy,
      baseRewardValue: uncapped.monetaryRewardValue,
      cappedRewardValue: result.monetaryRewardValue,
      isCapped: result.capApplied,
      offerRewardValue: 0,
      capRemaining: result.capRemaining,
      confidence,
      rewardRate,
      reason,
      limitations,
    });
  }

  if (evaluations.length === 0) {
    return { merchant, category, best: null, secondBest: null, delta: 0, confidence: 'UNSUPPORTED' };
  }

  evaluations.sort((a, b) =>
    b.cappedRewardValue - a.cappedRewardValue
    || (a.card.annualFee ?? 0) - (b.card.annualFee ?? 0)
    || a.card.name.localeCompare(b.card.name));

  const [best, second] = evaluations;
  return {
    merchant,
    category,
    best,
    secondBest: second ?? null,
    delta: second ? best.cappedRewardValue - second.cappedRewardValue : 0,
    confidence: globalConfidence,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
//  New-card recommendations (incremental to the wallet, net of fees)
// ─────────────────────────────────────────────────────────────────────────────

export interface RecommendInput {
  annualIncome?: number;
  cibilScore?: number;
  employmentType?: string;
  /** Monthly spend in rupees per category. Derived from transactions or priorities when absent. */
  spendByCategory?: Partial<Record<SpendCategory, number>>;
  /** Used only when there's no spend data: priority order of categories */
  topCategories?: SpendCategory[];
  transactions?: Transaction[];
  walletCardIds?: string[];
  /** Rupees. undefined = no limit, 0 = lifetime free only */
  maxAnnualFee?: number;
  wantsLounge?: boolean;
  limit?: number;
  now?: Date;
}

export interface UnifiedRecommendation extends RecommendedCard {
  /** Rupees/year this card adds over the user's current wallet, after fees */
  netAnnualValue: number;
  grossAnnualReward: number;
  feeWaived: boolean;
  reasons: string[];
  spendAssumed: boolean;
}

/** Typical monthly card spend used only when we know nothing about the user's spending. */
export const ASSUMED_MONTHLY_SPEND = 25_000;

export function deriveMonthlySpend(input: RecommendInput): { spend: Partial<Record<SpendCategory, number>>; assumed: boolean } {
  if (input.spendByCategory && Object.values(input.spendByCategory).some((v) => (v ?? 0) > 0)) {
    return { spend: input.spendByCategory, assumed: false };
  }

  // Average of the last 3 complete-or-current months of card/UPI purchases.
  if (input.transactions && input.transactions.length > 0) {
    const now = input.now ?? new Date();
    const cutoff = new Date(now.getTime() - 90 * 86_400_000);
    const totals: Partial<Record<SpendCategory, number>> = {};
    let any = false;
    for (const t of input.transactions) {
      if (t.type !== 'debit' || t.merchant === 'Bill Payment' || new Date(t.date) < cutoff) continue;
      const c = (t.category || 'other') as SpendCategory;
      totals[c] = (totals[c] ?? 0) + Math.abs(t.amount) / 100 / 3;
      any = true;
    }
    if (any) return { spend: totals, assumed: false };
  }

  // Nothing known: split an assumed budget by stated priorities (5:4:3:2:1), rest to 'other'.
  const cats = (input.topCategories ?? []).slice(0, 5);
  const weights = cats.map((_, i) => 5 - i);
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  const spend: Partial<Record<SpendCategory, number>> = {};
  const prioritised = cats.length ? ASSUMED_MONTHLY_SPEND * 0.7 : 0;
  cats.forEach((c, i) => { spend[c] = (prioritised * weights[i]) / totalWeight; });
  spend.other = (spend.other ?? 0) + (ASSUMED_MONTHLY_SPEND - prioritised);
  return { spend, assumed: true };
}

export function recommendNewCards(input: RecommendInput, source?: FinixCard[]): UnifiedRecommendation[] {
  const cat = catalog(source);
  const { spend, assumed } = deriveMonthlySpend(input);
  const walletIds = (input.walletCardIds ?? []).filter((id) => cat.byId.has(id));

  const context: UserContext = {
    userId: 'self',
    financialProfile: {
      annualIncome: input.annualIncome && input.annualIncome > 0 ? input.annualIncome : undefined,
      creditScore: input.cibilScore && input.cibilScore > 0 ? input.cibilScore : undefined,
      employmentType: input.employmentType,
    },
    spendingProfile: Object.fromEntries(
      Object.entries(spend).filter(([, v]) => (v ?? 0) > 0).map(([k, v]) => [k, { monthlySpend: v as number, transactionCount: 0 }]),
    ),
    existingWalletCardIds: walletIds,
  };

  let pool = cat.financial;
  if (input.maxAnnualFee !== undefined) {
    pool = pool.filter((c) => c.annualFee !== null && (input.maxAnnualFee === 0 ? c.annualFee === 0 : c.annualFee <= input.maxAnnualFee!));
  }
  if (input.wantsLounge) {
    const lounge = pool.filter((c) => (cat.byId.get(c.id)?.loungeAccess ?? 0) > 0);
    if (lounge.length > 0) pool = lounge;
  }

  const candidates = CandidateGenerator.generate(pool, context);
  const walletCards = cat.financial.filter((c) => walletIds.includes(c.id));
  const ranked = RecommendationRanker.rank(candidates, context, walletCards);

  const limit = input.limit && input.limit > 0 ? input.limit : 5;
  const top = ranked.slice(0, limit);
  const topValue = Math.max(1, ...top.map((r) => r.economicValue.netAnnualValue));

  return top.map((r) => {
    const legacy = cat.byId.get(r.card.id)!;
    const v = r.economicValue;
    const caveats: string[] = [];
    if (r.eligibility.status === 'UNKNOWN') {
      caveats.push(r.eligibility.unknownRules.includes('MISSING_ELIGIBILITY_DATA')
        ? "issuer's approval criteria aren't in our data"
        : `${r.eligibility.unknownRules.map((x) => x.toLowerCase()).join(' & ')} not checked — add it in your profile`);
    }
    if (v.annualFeeStatus === 'UNKNOWN') caveats.push('annual fee not confirmed');
    const reasons = [
      ...(assumed ? [`Based on an assumed ₹${ASSUMED_MONTHLY_SPEND.toLocaleString('en-IN')}/month spend — add transactions for a personal estimate.`] : []),
      ...r.reasons,
    ];
    return {
      ...legacy,
      matchScore: Math.round(v.netAnnualValue),
      matchPercent: Math.max(1, Math.min(100, Math.round((Math.max(0, v.netAnnualValue) / topValue) * 100))),
      eligibilityReason: caveats.length ? `Not confirmed: ${caveats.join('; ')}.` : undefined,
      netAnnualValue: Math.round(v.netAnnualValue),
      grossAnnualReward: Math.round(v.grossCandidateAnnualReward),
      feeWaived: !!v.annualFeeWaived,
      reasons,
      spendAssumed: assumed,
    };
  });
}

export const RewardsFacade = { bestCardForTransaction, recommendNewCards, deriveMonthlySpend };
