/**
 * Engine switch used by UI surfaces. One flag moves every migrated surface
 * between the legacy finix engine and the unified RewardsFacade:
 *
 *   VITE_UNIFIED_RECO_ENGINE=true   → RewardsFacade (net-of-fee, wallet-incremental, caps/waivers)
 *   (unset / anything else)         → legacy recommendEngine / evaluateTransaction
 *
 * Migrated surfaces: HomePage, UpiSimulator, CreditPage, RecommenderPanel.
 */
import { recommendCards as legacyRecommend, type UserProfile, type RecommendedCard } from '../finix/lib/recommendEngine';
import { evaluateTransaction as legacyEvaluate, type TransactionContext, type TransactionEvaluationResult } from '../finix/lib/evaluateTransaction';
import type { Transaction } from '../dashboard/types/dashboard.types';
import { bestCardForTransaction, recommendNewCards } from './RewardsFacade';

export function unifiedEngineEnabled(): boolean {
  try {
    return import.meta.env.VITE_UNIFIED_RECO_ENGINE === 'true';
  } catch {
    return false;
  }
}

export function recommendCardsFor(
  profile: UserProfile,
  limit = 5,
  extra: { transactions?: Transaction[]; walletCardIds?: string[] } = {},
): RecommendedCard[] {
  if (!unifiedEngineEnabled()) return legacyRecommend(profile, limit);
  return recommendNewCards({
    annualIncome: profile.annualIncome,
    cibilScore: profile.cibilScore,
    topCategories: profile.topCategories,
    spendByCategory: profile.monthlySpend,
    maxAnnualFee: profile.maxAnnualFee,
    wantsLounge: profile.wantsLounge,
    transactions: extra.transactions,
    walletCardIds: extra.walletCardIds,
    limit,
  });
}

export function evaluatePayment(
  merchant: string,
  amountInInr: number,
  walletCardIds: string[],
  context?: TransactionContext,
): TransactionEvaluationResult | null {
  if (!unifiedEngineEnabled()) return legacyEvaluate(merchant, amountInInr, walletCardIds, context);
  return bestCardForTransaction({
    amount: amountInInr,
    merchant,
    category: context?.category,
    walletCardIds,
    history: context?.previousTransactions,
  });
}
