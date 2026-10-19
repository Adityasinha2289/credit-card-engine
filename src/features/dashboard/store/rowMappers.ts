/**
 * rowMappers.ts
 *
 * Supabase row → client domain mapping, shared by the Zustand store hydration
 * and the React Query hooks so the two can never drift apart again.
 *
 * Tolerates both the legacy 001/002 columns and the columns added by the
 * 20261016* migrations (txn_date, status, next_billing_on, …) so the client
 * works before and after those migrations are applied.
 */
import type {
  Transaction,
  CategoryBudget,
  Subscription,
  CreditAccount,
  BillingCycle,
} from '../types/dashboard.types';
import type { CardData } from '../../cards/types/card.types';
import type { SavingsGoal } from '../../money/types';
import { isValidDate } from '../../money/lib/moneyMath.js';

type Row = Record<string, any>;

export function mapTransactionRow(row: Row): Transaction {
  return {
    id: row.id,
    merchant: row.merchant || 'Unknown merchant',
    amount: Number(row.amount) || 0,
    // txn_date (when it happened) beats created_at (when it was saved)
    date: row.txn_date || row.created_at,
    category: (row.category || 'other') as Transaction['category'],
    type: (row.type || 'debit') as Transaction['type'],
    cardId: row.card_id || '',
    pending: !!row.is_pending,
    rewardPoints: Number(row.reward_points) || 0,
  };
}

export function mapBudgetRow(row: Row): CategoryBudget {
  return {
    id: row.id,
    category: row.category,
    limitAmount: Number(row.limit_amount) || 0,
    // Spend is always derived from this month's transactions; never stored.
    currentSpend: 0,
    period: row.period === 'weekly' ? 'weekly' : 'monthly',
    icon: row.icon ?? undefined,
    color: row.color ?? undefined,
  };
}

const CYCLES: BillingCycle[] = ['weekly', 'monthly', 'quarterly', 'yearly'];

export function normalizeCycle(value: unknown): BillingCycle {
  const v = String(value || '').toLowerCase();
  if (v === 'annually' || v === 'annual') return 'yearly';
  return (CYCLES as string[]).includes(v) ? (v as BillingCycle) : 'monthly';
}

/**
 * @param userCardIdToCardId subscriptions.card_id references user_cards(id)
 *        (the wallet row UUID). The client works with catalog card ids, so we
 *        translate back here.
 */
export function mapSubscriptionRow(row: Row, userCardIdToCardId: Record<string, string> = {}): Subscription {
  const rawCard = row.card_id || '';
  return {
    id: row.id,
    name: row.name,
    amount: Number(row.amount) || 0,
    billingCycle: normalizeCycle(row.billing_cycle),
    nextBillingDate: row.next_billing_on || '',
    status: row.status === 'cancelled' || row.status === 'paused' ? row.status : 'active',
    cardId: userCardIdToCardId[rawCard] || rawCard,
    userCardRowId: rawCard || undefined,
    category: row.category || 'subscriptions',
    hasPriceHike: !!row.has_price_hike,
    previousAmount: row.previous_amount ?? undefined,
    isFreeTrial: !!row.is_free_trial,
    trialEndsOn: row.trial_ends_on ?? undefined,
    reminderDays: Array.isArray(row.reminder_days) ? row.reminder_days : undefined,
    source: row.source === 'detected' ? 'detected' : 'manual',
    cancelUrl: row.cancel_url ?? undefined,
    icon: row.icon ?? undefined,
  };
}

export function mapCreditAccountRow(row: Row, userCards: CardData[]): CreditAccount {
  const due = row.due_date;
  return {
    cardId: row.card_id,
    totalLimit: userCards.find((c) => c.id === row.card_id)?.creditLimit || Number(row.available_credit) || 0,
    currentBalance: Number(row.current_balance) || 0,
    minimumPaymentDue: Number(row.min_due) || 0,
    // Only a real, user-provided due date. Never derive one from card expiry or a placeholder.
    paymentDueDate: isValidDate(due) ? due : '',
    lastPaymentAmount: 0,
    lastPaymentDate: null,
    apr: 0.1999,
  };
}

export function mapUserCardRow(row: Row, fallbackName: string): CardData {
  const cardDef = Array.isArray(row.cards) ? row.cards[0] : row.cards;
  return {
    id: row.card_id,
    // no stored digits means the user never gave them: leave it empty, don't show 0000
    pan: row.last_4_digits ? `**** **** **** ${row.last_4_digits}` : '',
    cardholderName: row.cardholder_name || fallbackName,
    expiry: row.expiry || '',
    network: cardDef?.network || 'visa',
    bank: cardDef?.bank || 'Bank',
    status: row.status || 'active',
    availableCredit: Number(row.credit_limit) || 0,
    creditLimit: Number(row.credit_limit) || 0,
    label: cardDef?.name || 'Credit Card',
    gradientFrom: cardDef?.gradient_from || '#1F5247',
    gradientVia: '#30595c',
    gradientTo: cardDef?.gradient_to || '#1B3029',
  } as CardData;
}

export function mapGoalRow(row: Row): SavingsGoal {
  return {
    id: row.id,
    goal: row.name || row.goal || 'Goal',
    targetAmount: Number(row.target_amount) || 0,
    currentAmount: Number(row.current_amount) || 0,
    deadline: row.deadline ?? null,
    monthlyContribution: Number(row.monthly_contribution) || 0,
  };
}
