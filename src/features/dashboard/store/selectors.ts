/**
 * SELECTORS
 *
 * Selectors are pure functions that take the store state and return
 * derived data. They are designed to be passed directly to useDashboardStore()
 * as subscription functions so components only re-render when the specific
 * slice they care about changes.
 *
 * Usage:
 *   const utilization = useDashboardStore(selectUtilizationByCard('card-001'));
 *   const totals      = useDashboardStore(selectAggregatedTotals);
 *
 * Why not use Zustand's `computed` or middleware?
 * Selectors are simpler, tree-shakeable, and require no extra dependency.
 * They compose naturally and are trivially testable in isolation.
 */

import type { CreditAccount, Transaction, TransactionCategory } from '../types/dashboard.types';
import type { useDashboardStore } from '../store/dashboardStore';

// ── Infer the full store shape from the hook's return type ────────────────────
type StoreState = ReturnType<typeof useDashboardStore.getState>;

// ─────────────────────────────────────────────────────────────────────────────
//  CREDIT UTILIZATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Per-card credit utilization percentage (0–100).
 *
 * Formula: (currentBalance / totalLimit) × 100
 *
 * Industry rule: below 30% is healthy, above 70% is high-risk.
 */
export function selectUtilizationByCard(cardId: string) {
  return (state: StoreState): number => {
    const account = state.creditAccounts.find((a) => a.cardId === cardId);
    if (!account || account.totalLimit === 0) return 0;
    return Math.round((account.currentBalance / account.totalLimit) * 100);
  };
}

/**
 * Aggregated credit utilization across ALL cards combined.
 */
export function selectTotalUtilization(state: StoreState): number {
  const { totalBalance, totalLimit } = state.creditAccounts.reduce(
    (acc, a) => ({
      totalBalance: acc.totalBalance + a.currentBalance,
      totalLimit:   acc.totalLimit   + a.totalLimit,
    }),
    { totalBalance: 0, totalLimit: 0 },
  );
  if (totalLimit === 0) return 0;
  return Math.round((totalBalance / totalLimit) * 100);
}

/**
 * Computed available credit for a specific card (in cents).
 */
export function selectAvailableCreditByCard(cardId: string) {
  return (state: StoreState): number => {
    const account = state.creditAccounts.find((a) => a.cardId === cardId);
    if (!account) return 0;
    return Math.max(0, account.totalLimit - account.currentBalance);
  };
}

// ─────────────────────────────────────────────────────────────────────────────
//  AGGREGATED TOTALS
// ─────────────────────────────────────────────────────────────────────────────

interface AggregatedTotals {
  totalLimit:       number;
  totalBalance:     number;
  totalAvailable:   number;
  utilizationPct:   number;
}

/**
 * Single-object snapshot of all combined credit metrics.
 * Subscribe to this in header/summary widgets.
 */
export function selectAggregatedTotals(state: StoreState): AggregatedTotals {
  const totals = state.creditAccounts.reduce(
    (acc, a) => ({
      totalLimit:   acc.totalLimit   + a.totalLimit,
      totalBalance: acc.totalBalance + a.currentBalance,
    }),
    { totalLimit: 0, totalBalance: 0 },
  );
  return {
    ...totals,
    totalAvailable: Math.max(0, totals.totalLimit - totals.totalBalance),
    utilizationPct: totals.totalLimit > 0
      ? Math.round((totals.totalBalance / totals.totalLimit) * 100)
      : 0,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
//  TRANSACTION SELECTORS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Recent transactions for a specific card, newest first, limited to N items.
 */
export function selectRecentTransactionsByCard(cardId: string, limit = 10) {
  return (state: StoreState): Transaction[] =>
    state.transactions
      .filter((t) => t.cardId === cardId)
      .slice(0, limit);
}

/**
 * All transactions across all cards, sorted newest-first, limited to N.
 */
export function selectRecentTransactions(limit = 20) {
  return (state: StoreState): Transaction[] =>
    state.transactions.slice(0, limit);
}

/**
 * Transactions grouped by category — for the spending breakdown chart.
 * Returns a map of category → total spent in cents (debits only, no refunds).
 */
export function selectSpendingByCategory(cardId?: string) {
  return (state: StoreState): Record<TransactionCategory, number> => {
    const transactions = cardId
      ? state.transactions.filter((t) => t.cardId === cardId)
      : state.transactions;

    return transactions.reduce(
      (acc, t) => {
        if (t.type !== 'debit') return acc;
        acc[t.category] = (acc[t.category] ?? 0) + t.amount;
        return acc;
      },
      {} as Record<TransactionCategory, number>,
    );
  };
}

/**
 * Total debit spend for the current calendar month.
 */
export function selectMonthlySpend(state: StoreState): number {
  const now   = new Date();
  const year  = now.getFullYear();
  const month = now.getMonth();

  return state.transactions
    .filter((t) => {
      if (t.type !== 'debit') return false;
      const d = new Date(t.date);
      return d.getFullYear() === year && d.getMonth() === month;
    })
    .reduce((sum, t) => sum + t.amount, 0);
}

// ─────────────────────────────────────────────────────────────────────────────
//  REWARDS SELECTORS
// ─────────────────────────────────────────────────────────────────────────────

/** Net redeemable points (total − redeemed). */
export function selectRedeemablePoints(state: StoreState): number {
  return Math.max(0, state.rewards.totalPoints - state.rewards.redeemedPoints);
}

/** Tier progress as a 0–1 fraction toward the next tier. */
export function selectTierProgress(state: StoreState): number {
  const TIER_THRESHOLDS: Record<string, number> = {
    standard: 1_000,
    silver:   5_000,
    gold:     10_000,
    platinum: 25_000,
    black:    Infinity,
  };
  const currentTierThreshold  = TIER_THRESHOLDS[state.rewards.tier] ?? 0;
  if (state.rewards.pointsToNextTier === 0) return 1;
  const pointsInTier = currentTierThreshold - state.rewards.pointsToNextTier;
  return Math.min(1, Math.max(0, pointsInTier / currentTierThreshold));
}

// ─────────────────────────────────────────────────────────────────────────────
//  ACCOUNT SELECTORS
// ─────────────────────────────────────────────────────────────────────────────

/** Get a credit account by card ID — undefined if not found. */
export function selectAccountByCard(cardId: string) {
  return (state: StoreState): CreditAccount | undefined =>
    state.creditAccounts.find((a) => a.cardId === cardId);
}

/** Days until payment due for a specific card. Returns null if no account. */
export function selectDaysUntilDue(cardId: string) {
  return (state: StoreState): number | null => {
    const account = state.creditAccounts.find((a) => a.cardId === cardId);
    if (!account) return null;
    const dueDate = new Date(account.paymentDueDate);
    const today   = new Date();
    const diffMs  = dueDate.getTime() - today.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  };
}
