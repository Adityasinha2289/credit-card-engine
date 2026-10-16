import { create } from 'zustand';
import { persist, devtools, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { useState, useEffect } from 'react';

import type {
  Transaction,
  CreditAccount,
  RewardsAccount,
  AddTransactionInput,
  PayBillInput,
  TransactionCategory,
  AppProfile,
  Subscription,
  Milestone,
  MerchantOffer,
  CategoryBudget,
} from '../types/dashboard.types';

import type { CardData } from '../../cards/types/card.types';
import type { SavingsGoal } from '../../money/types';
import { ProfileService } from '../../../services/profile/ProfileService';
import { WalletService } from '../../../services/wallet/WalletService';
import { CARD_PAYMENT_MERCHANT, istParts } from '../../money/lib/moneyMath';
import {
  mapTransactionRow,
  mapBudgetRow,
  mapSubscriptionRow,
  mapCreditAccountRow,
  mapUserCardRow,
  mapGoalRow,
} from './rowMappers';

// ─────────────────────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────────────────────

import { toast } from 'sonner';

/** Max transactions loaded on hydration. Older history is fetched on demand. */
export const HYDRATION_TXN_LIMIT = 200;

/** Helper to execute and handle Supabase database operations */
async function safeDbWrite<T>(
  operation: Promise<{ error: any; data: T | null }>,
  contextMessage: string
): Promise<T | null> {
  try {
    const { data, error } = await operation;
    if (error) {
      console.error(`[DB Error] ${contextMessage}:`, error);
      // Suppress schema cache column mismatch errors from user-facing toasts
      if (!isMissingSchemaError(error)) {
        // Suppress catalog out-of-sync errors for new dataset
        if (!error.message?.includes('user_cards_card_id_fkey')) {
          toast.error(`Couldn't save: ${error.message || contextMessage}`);
        } else {
          console.warn(`[DB Warning] Ignored user_cards_card_id_fkey error - backend cards table out of sync with frontend catalog.`);
        }
      }
      return null;
    }
    return data;
  } catch (err: any) {
    console.error(`[DB Exception] ${contextMessage}:`, err);
    toast.error(`Network error: ${err.message || contextMessage}`);
    return null;
  }
}

/** A column / table / function the client knows about isn't deployed yet. */
function isMissingSchemaError(error: any): boolean {
  if (!error) return false;
  const code = error.code;
  const msg = String(error.message || '');
  return (
    code === 'PGRST204' || // column not in schema cache
    code === 'PGRST205' || // table not in schema cache
    code === '42P01' ||    // undefined_table
    code === '42703' ||    // undefined_column
    msg.includes('schema cache')
  );
}

function isMissingFunctionError(error: any): boolean {
  if (!error) return false;
  return (
    error.code === 'PGRST202' ||
    error.code === '42883' ||
    /could not find the function/i.test(String(error.message || ''))
  );
}

type RpcOutcome<T = any> =
  | { status: 'ok'; data: T }
  | { status: 'missing' }
  | { status: 'error'; error: any };

/**
 * Call an RPC, distinguishing "not deployed" (silently fall back) from a real
 * failure (surface it, do NOT silently write through a fallback path).
 */
async function callRpc<T = any>(client: any, fn: string, args: Record<string, unknown>): Promise<RpcOutcome<T>> {
  try {
    const { data, error } = await client.rpc(fn, args);
    if (!error) return { status: 'ok', data };
    if (isMissingFunctionError(error)) return { status: 'missing' };
    return { status: 'error', error };
  } catch (error) {
    return { status: 'error', error };
  }
}

/**
 * Insert a row, retrying without `optionalKeys` when those columns are not
 * deployed yet. Lets the client ship ahead of a migration without breaking.
 */
async function insertTolerant(
  client: any,
  table: string,
  payload: Record<string, unknown>,
  optionalKeys: string[],
): Promise<{ data: any; error: any }> {
  const first = await client.from(table).insert(payload).select().maybeSingle();
  if (!first.error || !isMissingSchemaError(first.error)) return first;
  const core = { ...payload };
  for (const k of optionalKeys) delete core[k];
  return client.from(table).insert(core).select().maybeSingle();
}

async function updateTolerant(
  client: any,
  table: string,
  patch: Record<string, unknown>,
  optionalKeys: string[],
  match: Record<string, string>,
): Promise<{ data: any; error: any }> {
  const run = (p: Record<string, unknown>) => {
    let q = client.from(table).update(p);
    for (const [k, v] of Object.entries(match)) q = q.eq(k, v);
    return q;
  };
  const first = await run(patch);
  if (!first.error || !isMissingSchemaError(first.error)) return first;
  const core = { ...patch };
  for (const k of optionalKeys) delete core[k];
  if (Object.keys(core).length === 0) return { data: null, error: null };
  return run(core);
}

/** Calendar date (YYYY-MM-DD) of an instant, in IST. */
export function toIstDateString(d: Date | string = new Date()): string {
  const { year, month, day } = istParts(d);
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/** Robust user profile upsert with automatic fallback for unmigrated database columns */
async function upsertUserProfile(supabaseClient: any, profile: any, contextMessage: string): Promise<boolean> {
  if (!supabaseClient || !profile?.id) return false;

  const fullPayload = {
    id: profile.id,
    email: profile.email,
    name: profile.name,
    phone: profile.phone,
    avatar_url: profile.avatar,
    salary: profile.salary,
    credit_score: profile.creditScore,
    onboarding_completed: profile.onboardingCompleted,
    user_segment: profile.userSegment,
    primary_goal: profile.primaryGoal,
    spend_categories: profile.spendCategories,
    city: profile.city,
    occupation: profile.occupation,
    age_band: profile.ageBand,
    cibil_band: profile.cibilBand,
  };

  const corePayload = {
    id: profile.id,
    email: profile.email,
    name: profile.name,
    phone: profile.phone,
    avatar_url: profile.avatar,
    salary: profile.salary,
    credit_score: profile.creditScore,
  };

  try {
    const { error } = await supabaseClient.from('users').upsert(fullPayload);
    if (error) {
      if (isMissingSchemaError(error) || error.message?.includes('column')) {
        console.warn(`[DB Schema Notice] Extended profile columns not yet present in Supabase table. Falling back to core columns.`);
        const { error: coreErr } = await supabaseClient.from('users').upsert(corePayload);
        if (coreErr) {
          console.error(`[DB Error] ${contextMessage} (core fallback):`, coreErr);
          return false;
        }
        return true;
      }
      console.error(`[DB Error] ${contextMessage}:`, error);
      toast.error(`Couldn't save your profile: ${error.message || contextMessage}`);
      return false;
    }
    return true;
  } catch (err: any) {
    console.error(`[DB Exception] ${contextMessage}:`, err);
    return false;
  }
}

/** Generate a simple UUID-v4-like string without a dependency. */
function generateId(prefix = 'txn'): string {
  return `${prefix}-` + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}

/**
 * Calculate reward points for a transaction.
 * Uses the multipliers from the rewards account, defaults to 1× if missing.
 * Rule: 1 point per ₹100 spent (i.e. per 10,000 paise), times the category multiplier.
 */
function calcRewardPoints(
  amount: number,
  category: TransactionCategory,
  multipliers: Partial<Record<TransactionCategory, number>>,
): number {
  if (amount <= 0) return 0;           // no points on refunds or credits
  const multiplier = multipliers[category] ?? 1;
  return Math.floor((amount / 10000) * multiplier);
}

/** Debounce timers for budget-limit writes (slider drags fire many changes). */
const budgetWriteTimers = new Map<string, ReturnType<typeof setTimeout>>();
const BUDGET_WRITE_DEBOUNCE_MS = 600;

// Optional columns added by 20261016* migrations. Writes retry without them.
const SUBSCRIPTION_OPTIONAL_COLUMNS = [
  'status', 'next_billing_on', 'is_free_trial', 'trial_ends_on', 'has_price_hike',
  'previous_amount', 'reminder_days', 'source', 'cancel_url',
];

function subscriptionToRow(s: Subscription, userId: string, userCardRowId: string | null) {
  const nextOn = s.nextBillingDate ? toIstDateString(s.nextBillingDate) : null;
  return {
    id: s.id,
    user_id: userId,
    card_id: userCardRowId,
    name: s.name,
    amount: s.amount,
    billing_cycle: s.billingCycle,
    next_billing_date: nextOn ?? '',
    icon: s.icon ?? null,
    category: s.category,
    status: s.status,
    next_billing_on: nextOn,
    is_free_trial: s.isFreeTrial,
    trial_ends_on: s.trialEndsOn ? toIstDateString(s.trialEndsOn) : null,
    has_price_hike: s.hasPriceHike,
    previous_amount: s.previousAmount ?? null,
    reminder_days: s.reminderDays ?? null,
    source: s.source ?? 'manual',
    cancel_url: s.cancelUrl ?? null,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
//  STATE SHAPE
// ─────────────────────────────────────────────────────────────────────────────

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../../lib/database.types';

interface DashboardState {
  /** All transactions — newest first */
  transactions: Transaction[];
  /** One credit account per card */
  creditAccounts: CreditAccount[];
  /** Single rewards ledger across all cards */
  rewards: RewardsAccount;
  /** Which card is currently"active" / selected in the UI */
  activeCardId: string | null;
  /** Whether a bill payment is in flight (optimistic UI) */
  isPaymentProcessing: boolean;
  /** Whether we are currently hydrating from Supabase */
  isHydratingFromSupabase: boolean;
  /** Logged in user profile info */
  profile: AppProfile | null;
  /** Cards added to the user's wallet */
  userCards: CardData[];
  /** catalog card id → user_cards row id (what FKs like subscriptions.card_id point at) */
  userCardRowIds: Record<string, string>;
  /** Subscriptions tied to cards */
  subscriptions: Subscription[];
  /** Milestones for cards */
  milestones: Milestone[];
  /** Merchant offers available */
  offers: MerchantOffer[];
  /** Category budgets */
  budgets: CategoryBudget[];
  /** Savings goals (amounts in paise) */
  goals: SavingsGoal[];

  /** Supabase client injected from React tree */
  supabaseClient: SupabaseClient<Database> | null;
  /** Identifies the active user session to prevent async race conditions */
  currentSessionId: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
//  ACTIONS SHAPE
// ─────────────────────────────────────────────────────────────────────────────

interface DashboardActions {
  /**
   * Add a new transaction and automatically update the linked credit account
   * (balance, available credit) and rewards ledger. Refunds/credits are stored
   * with a negative amount.
   */
  addTransaction: (input: AddTransactionInput) => Promise<void>;

  /**
   * Pay down the outstanding balance on a card.
   * Reduces currentBalance, updates available credit, and records a credit
   * transaction in the ledger.
   */
  payBill: (input: PayBillInput) => Promise<void>;

  /** Freeze or unfreeze a card (sets CardData.status via activeCardId). */
  setActiveCard: (cardId: string) => void;

  /** Set (or clear with null) the payment due date for a card. ISO date. */
  setCardDueDate: (cardId: string, dueDate: string | null) => Promise<void>;

  /** Redeem reward points. */
  redeemPoints: (points: number) => Promise<void>;

  /** Log in user */
  login: (profile: AppProfile) => Promise<void>;

  /** Log out user */
  logout: () => void;

  /** Update user profile */
  updateProfile: (profile: AppProfile) => Promise<void>;

  /** Add a card to user's wallet */
  addUserCard: (card: CardData) => Promise<void>;

  /** Remove a card from user's wallet */
  deleteUserCard: (cardId: string) => Promise<void>;

  /** Add a new category budget. Returns false if a budget for that category already exists. */
  addBudget: (budget: CategoryBudget) => Promise<boolean>;

  /** Remove a category budget */
  deleteBudget: (budgetId: string) => Promise<void>;

  /** Update a category budget limit (local immediately, DB write debounced) */
  updateBudgetLimit: (budgetId: string, limitAmount: number) => Promise<void>;

  /** Add a new subscription (renewal) */
  addSubscription: (subscription: Subscription) => Promise<void>;

  /** Patch a subscription (amount, next date, status, reminder days…) */
  updateSubscription: (subscriptionId: string, patch: Partial<Subscription>) => Promise<void>;

  /** Cancel a subscription (kept for history with status = cancelled) */
  cancelSubscription: (subscriptionId: string) => Promise<void>;

  /** Add / remove a savings goal */
  addGoal: (goal: SavingsGoal) => Promise<void>;
  deleteGoal: (goalId: string) => Promise<void>;

  /** Reset store to seed state — useful for development. */
  _reset: () => void;

  /** Inject Supabase Client from React tree */
  setSupabaseClient: (client: SupabaseClient<Database> | null) => void;

  /** Hydrate local state from Supabase database */
  hydrateFromSupabase: (clerkId: string, clerkEmail: string, clerkName: string, clerkAvatar: string, clerkMetadata?: any) => Promise<void>;
}

// ─────────────────────────────────────────────────────────────────────────────
//  INITIAL STATE
// ─────────────────────────────────────────────────────────────────────────────

const EMPTY_REWARDS: RewardsAccount = {
  totalPoints: 0,
  redeemedPoints: 0,
  cycleEarnings: 0,
  tier: 'silver',
  pointsToNextTier: 5000,
  categoryMultipliers: {
    dining:        3,
    travel:        3,
    groceries:     2,
    subscriptions: 1,
    shopping:      1,
    transport:     1,
    health:        1,
    entertainment: 1,
    utilities:     1,
    other:         1,
    fuel:          1,
  },
};

const INITIAL_STATE: DashboardState = {
  transactions:   [],
  creditAccounts: [],
  rewards:        {
    ...EMPTY_REWARDS,
    tier: 'gold',
    totalPoints: 0,
    redeemedPoints: 0,
  },
  activeCardId: null,
  isPaymentProcessing: false,
  isHydratingFromSupabase: false,
  profile:        null,
  userCards:      [],
  userCardRowIds: {},
  subscriptions:  [],
  milestones:     [],
  offers:         [],
  budgets:        [],
  goals:          [],
  supabaseClient: null,
  currentSessionId: null,
};

//    immer  → plain immutable updates with draft mutations
//    devtools → Redux DevTools support
//    persist  → localStorage serialization with versioning
// ─────────────────────────────────────────────────────────────────────────────

export const useDashboardStore = create<DashboardState & DashboardActions>()(
  devtools(
    persist(
      immer((set, get) => ({
        ...INITIAL_STATE,

        // ── addTransaction ───────────────────────────────────────────────────
        async addTransaction(input) {
          const { rewards } = get();
          const isInflow = input.type === 'refund' || input.type === 'credit';
          const amount = isInflow ? -Math.abs(input.amount) : Math.abs(input.amount);
          const points = isInflow ? 0 : calcRewardPoints(amount, input.category, rewards.categoryMultipliers);
          const newTx: Transaction = {
            ...input,
            amount,
            date: input.date || new Date().toISOString(),
            id: generateId(),
            rewardPoints: points,
          };
          const prevBalance = get().creditAccounts.find((a) => a.cardId === input.cardId)?.currentBalance;

          set((state) => {
            // 1. Prepend transaction (newest first)
            state.transactions.unshift(newTx);

            // 2. Update the matching credit account
            const account = state.creditAccounts.find((a) => a.cardId === input.cardId);
            if (account) {
              account.currentBalance = Math.max(0, account.currentBalance + amount);
            }

            // 3. Update rewards ledger
            if (points > 0) {
              state.rewards.totalPoints   += points;
              state.rewards.cycleEarnings += Math.floor(amount * 0.01); // 1% cash back base (accrues in paise)
            }
          });

          const rollback = () => set((state) => {
            state.transactions = state.transactions.filter((t) => t.id !== newTx.id);
            const account = state.creditAccounts.find((a) => a.cardId === input.cardId);
            if (account && prevBalance !== undefined) account.currentBalance = prevBalance;
            if (points > 0) {
              state.rewards.totalPoints   -= points;
              state.rewards.cycleEarnings -= Math.floor(amount * 0.01);
            }
          });

          const { supabaseClient, profile } = get();
          if (!supabaseClient || !profile) return;
          const client = supabaseClient as any;
          const txnDate = toIstDateString(newTx.date);

          // 1) v2 RPC: supports dates and refunds, returns server-computed points.
          const v2 = await callRpc<{ points?: number }>(client, 'add_transaction_v2', {
            p_id: newTx.id,
            p_card_id: newTx.cardId || null,
            p_merchant: newTx.merchant,
            p_amount: newTx.amount,
            p_category: newTx.category,
            p_type: newTx.type,
            p_is_pending: newTx.pending || false,
            p_date: txnDate,
          });
          if (v2.status === 'ok') {
            const serverPoints = Number((v2.data as any)?.points);
            if (Number.isFinite(serverPoints)) {
              set((state) => {
                const tx = state.transactions.find((t) => t.id === newTx.id);
                if (tx) tx.rewardPoints = serverPoints;
              });
            }
            return;
          }
          if (v2.status === 'error') {
            console.error('[DB Error] add_transaction_v2', v2.error);
            toast.error(`Couldn't save transaction: ${v2.error?.message || 'server error'}`);
            rollback();
            return;
          }

          // 2) v1 RPC (purchases only; it rejects amounts <= 0).
          if (!isInflow) {
            const v1 = await callRpc(client, 'add_transaction_v1', {
              p_id: newTx.id,
              p_user_id: profile.id,
              p_card_id: newTx.cardId,
              p_merchant: newTx.merchant,
              p_amount: newTx.amount,
              p_category: newTx.category,
              p_type: newTx.type,
              p_is_pending: newTx.pending || false,
            });
            if (v1.status === 'ok') return;
            if (v1.status === 'error') {
              console.error('[DB Error] add_transaction_v1', v1.error);
              toast.error(`Couldn't save transaction: ${v1.error?.message || 'server error'}`);
              rollback();
              return;
            }
          }

          // 3) No RPC deployed: direct writes (RLS still scopes them to this user).
          const inserted = await insertTolerant(client, 'transactions', {
            id: newTx.id,
            user_id: profile.id,
            card_id: newTx.cardId || null,
            merchant: newTx.merchant,
            amount: newTx.amount,
            category: newTx.category,
            type: newTx.type,
            is_pending: newTx.pending || false,
            txn_date: txnDate,
          }, ['txn_date']);
          if (inserted.error) {
            console.error('[DB Error] insert transaction', inserted.error);
            toast.error(`Couldn't save transaction: ${inserted.error.message || 'server error'}`);
            rollback();
            return;
          }

          const updatedAccount = get().creditAccounts.find((a) => a.cardId === input.cardId);
          if (updatedAccount) {
            await safeDbWrite(
              client.from('credit_accounts')
                .update({ current_balance: updatedAccount.currentBalance })
                .eq('user_id', profile.id)
                .eq('card_id', input.cardId),
              'update credit account balance',
            );
          }
        },

        // ── payBill ──────────────────────────────────────────────────────────
        async payBill({ cardId, amount }) {
          if (amount <= 0) return;
          const account = get().creditAccounts.find((a) => a.cardId === cardId);
          if (!account) return;
          if (account.currentBalance <= 0) {
            toast.info('Nothing to pay — this card has no outstanding balance.');
            return;
          }

          // Clamp payment to outstanding balance — can't overpay
          const effectivePayment = Math.min(amount, account.currentBalance);
          const prev = { balance: account.currentBalance, lastAmt: account.lastPaymentAmount, lastDate: account.lastPaymentDate };
          const paymentTx: Transaction = {
            id:           generateId(),
            merchant:     CARD_PAYMENT_MERCHANT,
            amount:       -effectivePayment,  // negative = money coming in
            date:         new Date().toISOString(),
            category:     'other',
            type:         'credit',
            cardId,
            pending:      false,
            rewardPoints: 0,
          };

          set((state) => {
            state.isPaymentProcessing = true;
            const acc = state.creditAccounts.find((a) => a.cardId === cardId);
            if (acc) {
              acc.currentBalance   -= effectivePayment;
              acc.lastPaymentAmount = effectivePayment;
              acc.lastPaymentDate   = paymentTx.date;
            }
            state.transactions.unshift(paymentTx);
            state.isPaymentProcessing = false;
          });

          const rollback = () => set((state) => {
            const acc = state.creditAccounts.find((a) => a.cardId === cardId);
            if (acc) {
              acc.currentBalance = prev.balance;
              acc.lastPaymentAmount = prev.lastAmt;
              acc.lastPaymentDate = prev.lastDate;
            }
            state.transactions = state.transactions.filter((t) => t.id !== paymentTx.id);
          });

          const { supabaseClient, profile } = get();
          if (!supabaseClient || !profile) return;
          const client = supabaseClient as any;

          const rpc = await callRpc(client, 'pay_bill_v1', {
            p_user_id: profile.id,
            p_card_id: cardId,
            p_amount: effectivePayment,
          });
          if (rpc.status === 'ok') return;
          if (rpc.status === 'error') {
            console.error('[DB Error] pay_bill_v1', rpc.error);
            toast.error(`Couldn't record payment: ${rpc.error?.message || 'server error'}`);
            rollback();
            return;
          }

          const inserted = await insertTolerant(client, 'transactions', {
            id: paymentTx.id,
            user_id: profile.id,
            card_id: cardId,
            merchant: CARD_PAYMENT_MERCHANT,
            amount: -effectivePayment,
            category: 'other',
            type: 'credit',
            is_pending: false,
            txn_date: toIstDateString(paymentTx.date),
          }, ['txn_date']);
          if (inserted.error) {
            console.error('[DB Error] insert bill payment', inserted.error);
            toast.error(`Couldn't record payment: ${inserted.error.message || 'server error'}`);
            rollback();
            return;
          }
          const updated = get().creditAccounts.find((a) => a.cardId === cardId);
          if (updated) {
            await safeDbWrite(
              client.from('credit_accounts')
                .update({ current_balance: updated.currentBalance })
                .eq('user_id', profile.id)
                .eq('card_id', cardId),
              'update credit account balance',
            );
          }
        },

        // ── setActiveCard ────────────────────────────────────────────────────
        setActiveCard(cardId) {
          set((state) => {
            state.activeCardId = cardId;
          });
        },

        // ── setCardDueDate ───────────────────────────────────────────────────
        async setCardDueDate(cardId, dueDate) {
          const value = dueDate ? toIstDateString(dueDate) : '';
          set((state) => {
            const acc = state.creditAccounts.find((a) => a.cardId === cardId);
            if (acc) acc.paymentDueDate = value;
          });
          const { supabaseClient, profile } = get();
          if (supabaseClient && profile) {
            await safeDbWrite(
              (supabaseClient as any).from('credit_accounts')
                .update({ due_date: value || null })
                .eq('user_id', profile.id)
                .eq('card_id', cardId),
              'set card due date',
            );
          }
        },

        // ── login ────────────────────────────────────────────────────────────
        async login(profile) {
          set((state) => {
            state.profile = profile;
            state.userCards.forEach((c) => {
              c.cardholderName = profile.name;
            });
          });

          // SYNC TO SUPABASE
          const { supabaseClient } = get();
          if (supabaseClient && profile) {
             await upsertUserProfile(supabaseClient, profile, 'sync user profile');
          }
        },

        // ── logout ───────────────────────────────────────────────────────────
        logout() {
          // Wipe every user-scoped slice (budgets, subscriptions, goals… included);
          // keep only the injected client, which is session-agnostic.
          const client = get().supabaseClient;
          budgetWriteTimers.forEach((t) => clearTimeout(t));
          budgetWriteTimers.clear();
          set({ ...INITIAL_STATE, supabaseClient: client });
        },

        // ── updateProfile ────────────────────────────────────────────────────
        async updateProfile(profile) {
          set((state) => {
            state.profile = profile;
            state.userCards.forEach((c) => {
              c.cardholderName = profile.name;
            });
          });

          // SYNC TO SUPABASE
          const { supabaseClient } = get();
          if (supabaseClient && profile) {
             await upsertUserProfile(supabaseClient, profile, 'update user profile');
          }
        },

        async addUserCard(card) {
          // Check for existing card to avoid duplicates
          const exists = get().userCards.some(c => c.id === card.id);
          if (exists) return;

          set((state) => {
            const cardholderName = state.profile ? state.profile.name : 'Premium Member';
            const newCard: CardData = {
              ...card,
              cardholderName,
              status: 'active',
              availableCredit: card.creditLimit,
            };
            state.userCards.push(newCard);

            // Add credit account. No due date until the user tells us one.
            state.creditAccounts.push({
              cardId: newCard.id,
              totalLimit: newCard.creditLimit,
              currentBalance: 0,
              minimumPaymentDue: 0,
              paymentDueDate: '',
              lastPaymentAmount: 0,
              lastPaymentDate: null,
              apr: 0.1999,
            });

            // Automatically set as active card if none is currently active
            if (!state.activeCardId) {
              state.activeCardId = newCard.id;
            }
          });

          // SYNC TO SUPABASE via ATOMIC RPC
          const { supabaseClient, profile } = get();
          if (supabaseClient && profile) {
            const client = supabaseClient as any;
            const rpc = await callRpc<any>(client, 'add_user_card_v1', {
              p_user_id: profile.id,
              p_card_id: card.id,
              p_last_4_digits: card.pan.slice(-4),
              p_cardholder_name: profile.name,
              p_expiry: card.expiry,
              p_credit_limit: card.creditLimit,
            });

            let rowId: string | null = null;
            if (rpc.status === 'ok') {
              rowId = typeof rpc.data === 'string' ? rpc.data : (rpc.data?.id ?? rpc.data?.user_card_id ?? null);
            } else if (rpc.status === 'error' && !String(rpc.error?.message || '').includes('user_cards_card_id_fkey')) {
              console.error('[DB Error] add_user_card_v1', rpc.error);
            }

            if (rpc.status !== 'ok') {
              const data = await safeDbWrite(
                client.from('user_cards').insert({
                  user_id: profile.id,
                  card_id: card.id,
                  last_4_digits: card.pan.slice(-4),
                  cardholder_name: profile.name,
                  expiry: card.expiry,
                  credit_limit: card.creditLimit,
                  status: 'active',
                }).select('id').single(),
                'add user card'
              );

              if (data && (data as any).id) {
                rowId = (data as any).id;
                await safeDbWrite(
                  client.from('credit_accounts').insert({
                    user_id: profile.id,
                    card_id: card.id,
                    user_card_id: rowId,
                    current_balance: 0,
                    available_credit: card.creditLimit,
                    next_statement_date: null,
                  }),
                  'create credit account'
                );
              }
            }

            if (rowId) {
              set((state) => { state.userCardRowIds[card.id] = rowId as string; });
            }
          }
        },

        // ── deleteUserCard ───────────────────────────────────────────────────
        async deleteUserCard(cardId) {
          set((state) => {
            state.userCards = state.userCards.filter((c) => c.id !== cardId);
            state.creditAccounts = state.creditAccounts.filter((a) => a.cardId !== cardId);
            state.transactions = state.transactions.filter((t) => t.cardId !== cardId);
            delete state.userCardRowIds[cardId];

            if (state.activeCardId === cardId) {
              state.activeCardId = state.userCards.length > 0 ? state.userCards[0].id : '';
            }
          });
          const { supabaseClient, profile } = get();
          if (supabaseClient && profile) {
            // Scope deletion strictly by card_id and authenticated user_id
            await safeDbWrite(
              (supabaseClient as any).from('user_cards').delete().eq('card_id', cardId).eq('user_id', profile.id),
              'delete user card'
            );
          }
        },

        // ── redeemPoints ─────────────────────────────────────────────────────
        async redeemPoints(points) {
          const { supabaseClient, profile } = get();

          if (supabaseClient && profile) {
            // Use atomic RPC for security (server-side point validation)
            const result = await safeDbWrite(
              (supabaseClient as any).rpc('redeem_points_v1', {
                p_points: points
              }),
              'redeem points RPC'
            );

            if (result !== null) {
              // Only update local state if server allowed it
              set((state) => {
                state.rewards.redeemedPoints += points;
              });
            }
          }
        },

        // ── addBudget ────────────────────────────────────────────────────────
        async addBudget(budget) {
          if (get().budgets.some((b) => b.category === budget.category)) {
            toast.info(`You already have a ${budget.category} budget — adjust its limit instead.`);
            return false;
          }
          set((state) => {
            state.budgets.push({ ...budget, currentSpend: 0, period: budget.period ?? 'monthly' });
          });
          const { supabaseClient, profile } = get();
          if (supabaseClient && profile) {
            const saved = await safeDbWrite(
              (supabaseClient as any).from('budgets').insert({
                id: budget.id,
                user_id: profile.id,
                category: budget.category,
                limit_amount: budget.limitAmount,
                icon: budget.icon,
                color: budget.color,
              }).select('id').maybeSingle(),
              'add budget'
            );
            if (saved === null) {
              set((state) => { state.budgets = state.budgets.filter((b) => b.id !== budget.id); });
              return false;
            }
          }
          return true;
        },

        // ── deleteBudget ─────────────────────────────────────────────────────
        async deleteBudget(budgetId) {
          const pending = budgetWriteTimers.get(budgetId);
          if (pending) { clearTimeout(pending); budgetWriteTimers.delete(budgetId); }
          set((state) => {
            state.budgets = state.budgets.filter((b) => b.id !== budgetId);
          });
          const { supabaseClient, profile } = get();
          if (supabaseClient && profile) {
            await safeDbWrite(
              (supabaseClient as any).from('budgets').delete().eq('id', budgetId).eq('user_id', profile.id),
              'delete budget'
            );
          }
        },

        // ── updateBudgetLimit ────────────────────────────────────────────────
        async updateBudgetLimit(budgetId, limitAmount) {
          set((state) => {
            const budget = state.budgets.find(b => b.id === budgetId);
            if (budget) {
              budget.limitAmount = limitAmount;
            }
          });
          const { supabaseClient, profile } = get();
          if (!supabaseClient || !profile) return;
          // Debounce: a slider drag fires dozens of changes; persist only the last one.
          const existing = budgetWriteTimers.get(budgetId);
          if (existing) clearTimeout(existing);
          budgetWriteTimers.set(budgetId, setTimeout(() => {
            budgetWriteTimers.delete(budgetId);
            const latest = get().budgets.find((b) => b.id === budgetId)?.limitAmount ?? limitAmount;
            void safeDbWrite(
              (supabaseClient as any).from('budgets').update({ limit_amount: latest }).eq('id', budgetId).eq('user_id', profile.id),
              'update budget limit'
            );
          }, BUDGET_WRITE_DEBOUNCE_MS));
        },

        // ── addSubscription ──────────────────────────────────────────────────
        async addSubscription(subscription) {
          const sub: Subscription = {
            ...subscription,
            status: subscription.status ?? 'active',
            hasPriceHike: subscription.hasPriceHike ?? false,
            isFreeTrial: subscription.isFreeTrial ?? false,
          };
          set((state) => {
            state.subscriptions.push(sub);
          });
          const { supabaseClient, profile, userCardRowIds } = get();
          if (!supabaseClient || !profile) return;
          const client = supabaseClient as any;

          // subscriptions.card_id references user_cards(id), NOT the catalog id.
          let rowId: string | null = sub.cardId ? userCardRowIds[sub.cardId] ?? null : null;
          if (!rowId && sub.cardId) {
            const { data } = await client.from('user_cards').select('id')
              .eq('user_id', profile.id).eq('card_id', sub.cardId).maybeSingle();
            rowId = data?.id ?? null;
            if (rowId) set((state) => { state.userCardRowIds[sub.cardId] = rowId as string; });
          }

          const { error } = await insertTolerant(
            client, 'subscriptions', subscriptionToRow(sub, profile.id, rowId), SUBSCRIPTION_OPTIONAL_COLUMNS,
          );
          if (error) {
            console.error('[DB Error] add subscription', error);
            const msg = error.code === '23502'
              ? 'Pick the card this subscription is billed to so we can save it.'
              : `Couldn't save subscription: ${error.message || 'server error'}`;
            toast.error(msg);
            set((state) => { state.subscriptions = state.subscriptions.filter((s) => s.id !== sub.id); });
            return;
          }
          set((state) => {
            const s = state.subscriptions.find((x) => x.id === sub.id);
            if (s && rowId) s.userCardRowId = rowId;
          });
        },

        // ── updateSubscription ───────────────────────────────────────────────
        async updateSubscription(subscriptionId, patch) {
          const before = get().subscriptions.find((s) => s.id === subscriptionId);
          if (!before) return;
          set((state) => {
            const s = state.subscriptions.find((x) => x.id === subscriptionId);
            if (s) Object.assign(s, patch);
          });
          const { supabaseClient, profile, userCardRowIds } = get();
          if (!supabaseClient || !profile) return;
          const merged = { ...before, ...patch } as Subscription;
          const row = subscriptionToRow(merged, profile.id, merged.cardId ? userCardRowIds[merged.cardId] ?? merged.userCardRowId ?? null : null);
          const { id: _id, user_id: _uid, ...dbPatch } = row;
          const { error } = await updateTolerant(
            supabaseClient, 'subscriptions', dbPatch, SUBSCRIPTION_OPTIONAL_COLUMNS,
            { id: subscriptionId, user_id: profile.id },
          );
          if (error) {
            console.error('[DB Error] update subscription', error);
            toast.error(`Couldn't update subscription: ${error.message || 'server error'}`);
            set((state) => {
              const i = state.subscriptions.findIndex((x) => x.id === subscriptionId);
              if (i >= 0) state.subscriptions[i] = before;
            });
          }
        },

        // ── cancelSubscription ───────────────────────────────────────────────
        async cancelSubscription(subscriptionId) {
          set((state) => {
            const sub = state.subscriptions.find(s => s.id === subscriptionId);
            if (sub) {
              sub.status = 'cancelled';
            }
          });
          const { supabaseClient, profile } = get();
          if (!supabaseClient || !profile) return;
          const client = supabaseClient as any;
          // Keep the row for history when the status column exists; legacy schema has no status, so delete.
          const { error } = await client.from('subscriptions').update({ status: 'cancelled' })
            .eq('id', subscriptionId).eq('user_id', profile.id);
          if (error && isMissingSchemaError(error)) {
            await safeDbWrite(
              client.from('subscriptions').delete().eq('id', subscriptionId).eq('user_id', profile.id),
              'cancel subscription'
            );
          } else if (error) {
            console.error('[DB Error] cancel subscription', error);
            toast.error(`Couldn't cancel subscription: ${error.message || 'server error'}`);
          }
        },

        // ── goals ────────────────────────────────────────────────────────────
        async addGoal(goal) {
          set((state) => { state.goals.push(goal); });
          const { supabaseClient, profile } = get();
          if (!supabaseClient || !profile) return;
          const { error } = await (supabaseClient as any).from('savings_goals').insert({
            id: goal.id,
            user_id: profile.id,
            name: goal.goal,
            target_amount: goal.targetAmount,
            current_amount: goal.currentAmount,
            monthly_contribution: goal.monthlyContribution,
            deadline: goal.deadline ? toIstDateString(goal.deadline) : null,
          });
          if (error && !isMissingSchemaError(error)) {
            console.error('[DB Error] add goal', error);
            toast.error(`Couldn't save goal: ${error.message || 'server error'}`);
            set((state) => { state.goals = state.goals.filter((g) => g.id !== goal.id); });
          }
        },

        async deleteGoal(goalId) {
          set((state) => { state.goals = state.goals.filter((g) => g.id !== goalId); });
          const { supabaseClient, profile } = get();
          if (!supabaseClient || !profile) return;
          const { error } = await (supabaseClient as any).from('savings_goals').delete()
            .eq('id', goalId).eq('user_id', profile.id);
          if (error && !isMissingSchemaError(error)) console.error('[DB Error] delete goal', error);
        },

        // ── _reset ────────────────────────────────────────────────────────────
        _reset() {
          set(INITIAL_STATE);
        },
        // ── setSupabaseClient ────────────────────────────────────────────────
        setSupabaseClient(client) {
          set((state) => {
            state.supabaseClient = client as any; // Ignore immer draft error for classes
          });
        },

        // ── hydrateFromSupabase ──────────────────────────────────────────────
        async hydrateFromSupabase(clerkId, clerkEmail, clerkName, clerkAvatar, clerkMetadata?: any) {
          set({ isHydratingFromSupabase: true, currentSessionId: clerkId });
          const { supabaseClient } = get();
          if (!supabaseClient) {
            set({ isHydratingFromSupabase: false });
            return;
          }
          const client = supabaseClient as any;

          try {
            // All six reads are independent — run them in parallel instead of
            // six sequential round trips before the dashboard can render.
            const [profileRes, walletRes, txnRes, budgetRes, subRes, accRes, goalRes] = await Promise.all([
              new ProfileService(client).getProfile(clerkId),
              new WalletService(client).getWallet(clerkId),
              client.from('transactions').select('*').eq('user_id', clerkId)
                .order('created_at', { ascending: false }).limit(HYDRATION_TXN_LIMIT),
              client.from('budgets').select('*').eq('user_id', clerkId),
              client.from('subscriptions').select('*').eq('user_id', clerkId),
              client.from('credit_accounts').select('*').eq('user_id', clerkId),
              client.from('savings_goals').select('*').eq('user_id', clerkId),
            ].map((p: any) => Promise.resolve(p).catch((error: any) => ({ data: null, error }))));

            const { data: userRow, error: fetchError } = profileRes as any;
            if (fetchError) {
              console.error('Supabase Hydration Error:', fetchError);
              toast.error(`Couldn't load your profile: ${fetchError.message}`);
            }

            const baseData = userRow || {};
            const metaProfile = clerkMetadata?.profileData || {};
            // A users row alone does NOT mean onboarding happened — the Clerk webhook
            // creates it on sign-up. Use the explicit flag; for legacy rows without the
            // column, a saved salary is the signal that onboarding was completed.
            const rowSaysOnboarded = userRow
              ? (userRow.onboarding_completed === true ||
                 (userRow.onboarding_completed == null && Number(userRow.salary) > 0))
              : false;
            const hasOnboarded = rowSaysOnboarded || clerkMetadata?.onboardingCompleted === true;

            const profile: AppProfile = {
               id: baseData.id || metaProfile.id || clerkId,
               name: baseData.name || metaProfile.name || clerkName,
               email: baseData.email || metaProfile.email || clerkEmail,
               phone: baseData.phone || metaProfile.phone || '',
               avatar: baseData.avatar_url || metaProfile.avatar || clerkAvatar,
               // 0 = unknown. Never invent an income or score for a real user.
               salary: Number(baseData.salary) || Number(metaProfile.salary) || 0,
               creditScore: Number(baseData.credit_score) || Number(metaProfile.creditScore) || 0,
               onboardingCompleted: hasOnboarded,
               userSegment: baseData.user_segment || metaProfile.userSegment || get().profile?.userSegment || 'adult',
               primaryGoal: baseData.primary_goal || metaProfile.primaryGoal || get().profile?.primaryGoal || 'Maximise Cashback',
               spendCategories: baseData.spend_categories || metaProfile.spendCategories || get().profile?.spendCategories || [],
               city: baseData.city || metaProfile.city || get().profile?.city || 'Mumbai',
               occupation: baseData.occupation || metaProfile.occupation || get().profile?.occupation || 'Salaried',
               ageBand: baseData.age_band || metaProfile.ageBand || undefined,
               cibilBand: baseData.cibil_band || metaProfile.cibilBand || undefined,
            };

            const userCardsRow: any[] | null = (walletRes as any)?.data ?? null;
            const rowIds: Record<string, string> = {};
            const cardIdByRowId: Record<string, string> = {};
            (userCardsRow || []).forEach((row: any) => {
              if (row?.id && row?.card_id) {
                rowIds[row.card_id] = row.id;
                cardIdByRowId[row.id] = row.card_id;
              }
            });

            set((state) => {
               if (state.currentSessionId !== clerkId) {
                 console.warn(`[Hydration] Stale async request detected for user ${clerkId}. Aborting.`);
                 return;
               }

               state.profile = profile;
               state.rewards = {
                 ...EMPTY_REWARDS,
                 tier: 'gold',
                 totalPoints: userRow?.total_reward_points || 0,
                 redeemedPoints: userRow?.redeemed_reward_points || 0,
               };
               state.userCardRowIds = rowIds;

               if (userCardsRow) {
                 const dbCards = userCardsRow.map((row: any) => mapUserCardRow(row, profile.name));
                 const localCards = state.userCards;
                 const missingLocalCards = localCards.filter(
                   local => !dbCards.some((db: any) => db.id === local.id)
                 );
                 state.userCards = [...dbCards, ...missingLocalCards] as any;
               }

               const txnRows = (txnRes as any)?.data;
               if (Array.isArray(txnRows)) state.transactions = txnRows.map(mapTransactionRow);

               const budgetRows = (budgetRes as any)?.data;
               if (Array.isArray(budgetRows)) state.budgets = budgetRows.map(mapBudgetRow);

               const subRows = (subRes as any)?.data;
               if (Array.isArray(subRows)) state.subscriptions = subRows.map((r: any) => mapSubscriptionRow(r, cardIdByRowId));

               const accRows = (accRes as any)?.data;
               if (Array.isArray(accRows)) state.creditAccounts = accRows.map((r: any) => mapCreditAccountRow(r, state.userCards as CardData[]));

               const goalRows = (goalRes as any)?.data;
               if (Array.isArray(goalRows)) state.goals = goalRows.map(mapGoalRow);
            });
          } finally {
            // Never leave the app stuck on a skeleton if any read throws.
            if (get().currentSessionId === clerkId) set({ isHydratingFromSupabase: false });
          }
        },
      })),

      {
        name: 'renocred-dashboard-v5',               // localStorage key
        storage: createJSONStorage(() => localStorage),
        version: 5,

        /**
         * Security Fix: Do not persist user-specific financial or profile data to localStorage.
         * This prevents cross-user state leakage upon hydration.
         */
        partialize: () => ({}),

        /**
         * Migration strategy — increment version when state shape changes
         * to avoid deserializing incompatible persisted data.
         */
        migrate: (persistedState, fromVersion) => {
          if (fromVersion === 0) {
            // v0 → v1: no structural change, return as-is
            return persistedState as DashboardState & DashboardActions;
          }
          return persistedState as DashboardState & DashboardActions;
        },
      },
    ),
    {
      name: 'WealthOS/DashboardStore',
      enabled: (function() {
        try {
          return import.meta.env.DEV;
        } catch {
          return typeof process !== 'undefined' && process.env ? process.env.NODE_ENV !== 'production' : false;
        }
      })(),
    },
  ),
);

export const useHydration = () => {
  const [hydrated, setHydrated] = useState(() => useDashboardStore.persist.hasHydrated());
  useEffect(() => {
    const unsubFinishHydration = useDashboardStore.persist.onFinishHydration(() => setHydrated(true));
    setHydrated(useDashboardStore.persist.hasHydrated());
    return () => {
      unsubFinishHydration();
    };
  }, []);
  return hydrated;
};
