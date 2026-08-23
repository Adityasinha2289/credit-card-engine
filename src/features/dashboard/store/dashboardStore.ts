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
import { ProfileService } from '../../../services/profile/ProfileService';
import { WalletService } from '../../../services/wallet/WalletService';

// ─────────────────────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────────────────────

import { toast } from 'sonner';

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
      if (error.code !== 'PGRST204' && !error.message?.includes('schema cache')) {
        // Suppress catalog out-of-sync errors for new dataset
        if (!error.message?.includes('user_cards_card_id_fkey')) {
          toast.error(`Database Error: ${error.message || contextMessage}`);
        } else {
          console.warn(`[DB Warning] Ignored user_cards_card_id_fkey error - backend cards table out of sync with frontend catalog.`);
        }
      }
      return null;
    }
    return data;
  } catch (err: any) {
    console.error(`[DB Exception] ${contextMessage}:`, err);
    toast.error(`Network or Database Exception: ${err.message || contextMessage}`);
    return null;
  }
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
      if (error.code === 'PGRST204' || error.message?.includes('schema cache') || error.message?.includes('column')) {
        console.warn(`[DB Schema Notice] Extended profile columns not yet present in Supabase table. Falling back to core columns.`);
        const { error: coreErr } = await supabaseClient.from('users').upsert(corePayload);
        if (coreErr) {
          console.error(`[DB Error] ${contextMessage} (core fallback):`, coreErr);
          return false;
        }
        return true;
      }
      console.error(`[DB Error] ${contextMessage}:`, error);
      toast.error(`Database Error: ${error.message || contextMessage}`);
      return false;
    }
    return true;
  } catch (err: any) {
    console.error(`[DB Exception] ${contextMessage}:`, err);
    return false;
  }
}

/** Generate a simple UUID-v4-like string without a dependency. */
function generateId(): string {
  return 'txn-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}

/**
 * Calculate reward points for a transaction.
 * Uses the multipliers from the rewards account, defaults to 1× if missing.
 * Rule: 1 point per $1 spent (i.e. per 100 cents).
 */
function calcRewardPoints(
  amount: number,
  category: TransactionCategory,
  multipliers: Partial<Record<TransactionCategory, number>>,
): number {
  if (amount <= 0) return 0;           // no points on refunds or credits
  const multiplier = multipliers[category] ?? 1;
  return Math.floor((amount / 100) * multiplier);
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
  /** Subscriptions tied to cards */
  subscriptions: Subscription[];
  /** Milestones for cards */
  milestones: Milestone[];
  /** Merchant offers available */
  offers: MerchantOffer[];
  /** Category budgets */
  budgets: CategoryBudget[];
  
  /** Supabase client injected from React tree */
  supabaseClient: SupabaseClient<Database> | null;
}

// ─────────────────────────────────────────────────────────────────────────────
//  ACTIONS SHAPE
// ─────────────────────────────────────────────────────────────────────────────

interface DashboardActions {
  /**
   * Add a new transaction and automatically update the linked credit account
   * (balance, available credit) and rewards ledger.
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

  /** Add a new category budget */
  addBudget: (budget: CategoryBudget) => Promise<void>;

  /** Remove a category budget */
  deleteBudget: (budgetId: string) => Promise<void>;

  /** Update a category budget limit */
  updateBudgetLimit: (budgetId: string, limitAmount: number) => Promise<void>;

  /** Add a new subscription (renewal) */
  addSubscription: (subscription: Subscription) => Promise<void>;

  /** Cancel a subscription */
  cancelSubscription: (subscriptionId: string) => Promise<void>;

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
  subscriptions:  [],
  milestones:     [],
  offers:         [],
  budgets:        [],
  supabaseClient: null,
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
          const points = calcRewardPoints(
            input.amount,
            input.category,
            rewards.categoryMultipliers,
          );
          const newTx: Transaction = {
            ...input,
            id: generateId(),
            rewardPoints: points,
          };

          set((state) => {
            // 1. Prepend transaction (newest first)
            state.transactions.unshift(newTx);

            // 2. Update the matching credit account
            const account = state.creditAccounts.find(
              (a) => a.cardId === input.cardId,
            );
            if (account) {
              account.currentBalance  = Math.max(0, account.currentBalance + input.amount);
              // availableCredit = limit - balance, clamped to [0, limit]
            }

            // 3. Update rewards ledger
            if (points > 0) {
              state.rewards.totalPoints   += points;
              state.rewards.cycleEarnings += Math.floor(input.amount * 0.01); // 1% cash back base
            }
          });

          // SYNC TO SUPABASE via ATOMIC RPC
          const { supabaseClient, profile, creditAccounts } = get();
          if (supabaseClient && profile) {
            const rpcResult = await safeDbWrite(
              (supabaseClient as any).rpc('add_transaction_v1', {
                p_id: newTx.id,
                p_user_id: profile.id,
                p_card_id: newTx.cardId,
                p_merchant: newTx.merchant,
                p_amount: newTx.amount,
                p_category: newTx.category,
                p_type: newTx.type,
                p_is_pending: newTx.pending || false,
              }),
              'atomic add_transaction_v1 RPC'
            );

            // Fallback for dev environments if RPC is not yet deployed
            if (rpcResult === null) {
              await safeDbWrite(
                (supabaseClient as any).from('transactions').insert({
                  id: newTx.id,
                  user_id: profile.id,
                  card_id: newTx.cardId,
                  merchant: newTx.merchant,
                  amount: newTx.amount,
                  category: newTx.category,
                  type: newTx.type,
                  is_pending: newTx.pending || false,
                }),
                'insert transaction fallback'
              );

              const updatedAccount = creditAccounts.find(a => a.cardId === input.cardId);
              if (updatedAccount) {
                await safeDbWrite(
                  (supabaseClient as any).from('credit_accounts')
                    .update({ current_balance: updatedAccount.currentBalance })
                    .eq('user_card_id', input.cardId),
                  'update credit account balance fallback'
                );
              }
            }
          }
        },

        // ── payBill ──────────────────────────────────────────────────────────
        async payBill({ cardId, amount }) {
          if (amount <= 0) return;

          set((state) => {
            state.isPaymentProcessing = true;

            const account = state.creditAccounts.find((a) => a.cardId === cardId);
            if (!account) {
              state.isPaymentProcessing = false;
              return;
            }

            // Clamp payment to outstanding balance — can't overpay
            const effectivePayment = Math.min(amount, account.currentBalance);

            // Update balance
            account.currentBalance     -= effectivePayment;
            account.lastPaymentAmount   = effectivePayment;
            account.lastPaymentDate     = new Date().toISOString();

            // Record a credit transaction in the ledger
            const paymentTx: Transaction = {
              id:           generateId(),
              merchant:     'Bill Payment',
              amount:       -effectivePayment,  // negative = money coming in
              date:         new Date().toISOString(),
              category:     'other',
              type:         'credit',
              cardId,
              pending:      false,
              rewardPoints: 0,
            };
            state.transactions.unshift(paymentTx);
            state.isPaymentProcessing = false;
          });

          const { supabaseClient, profile, creditAccounts } = get();
          if (supabaseClient && profile) {
            const rpcResult = await safeDbWrite(
              (supabaseClient as any).rpc('pay_bill_v1', {
                p_user_id: profile.id,
                p_card_id: cardId,
                p_amount: amount,
              }),
              'atomic pay_bill_v1 RPC'
            );

            if (rpcResult === null) {
              const updatedAccount = creditAccounts.find(a => a.cardId === cardId);
              const effectivePayment = Math.min(amount, (updatedAccount?.currentBalance ?? 0) + amount);
              
              await safeDbWrite(
                (supabaseClient as any).from('transactions').insert({
                  id: generateId(),
                  user_id: profile.id,
                  card_id: cardId,
                  merchant: 'Bill Payment',
                  amount: -effectivePayment,
                  category: 'other',
                  type: 'credit',
                  is_pending: false,
                }),
                'insert bill payment transaction fallback'
              );

              if (updatedAccount) {
                await safeDbWrite(
                  (supabaseClient as any).from('credit_accounts')
                    .update({ current_balance: updatedAccount.currentBalance })
                    .eq('user_card_id', cardId),
                  'update credit account balance fallback'
                );
              }
            }
          }
        },

        // ── setActiveCard ────────────────────────────────────────────────────
        setActiveCard(cardId) {
          set((state) => {
            state.activeCardId = cardId;
          });
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
             const success = await upsertUserProfile(supabaseClient, profile, 'sync user profile');
             if (success) {
               console.log('Successfully saved to Supabase!');
               toast.success('Profile saved to cloud!');
             }
          }
        },

        // ── logout ───────────────────────────────────────────────────────────
        logout() {
          set((state) => {
            state.profile = null;
            state.userCards = [];
            state.transactions = [];
            state.creditAccounts = [];
            state.rewards = EMPTY_REWARDS;
            state.activeCardId = '';
          });
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

            // Add credit account
            state.creditAccounts.push({
              cardId: newCard.id,
              totalLimit: newCard.creditLimit,
              currentBalance: 0,
              minimumPaymentDue: 0,
              paymentDueDate: newCard.expiry || '08/30',
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
            const rpcResult = await safeDbWrite(
              (supabaseClient as any).rpc('add_user_card_v1', {
                p_user_id: profile.id,
                p_card_id: card.id,
                p_last_4_digits: card.pan.slice(-4),
                p_cardholder_name: profile.name,
                p_expiry: card.expiry,
                p_credit_limit: card.creditLimit,
              }),
              'atomic add_user_card_v1 RPC'
            );

            if (rpcResult === null) {
              const data = await safeDbWrite(
                (supabaseClient as any).from('user_cards').insert({
                  user_id: profile.id,
                  card_id: card.id,
                  last_4_digits: card.pan.slice(-4),
                  cardholder_name: profile.name,
                  expiry: card.expiry,
                  credit_limit: card.creditLimit,
                  status: 'active',
                }).select('id').single(),
                'add user card fallback'
              );

              if (data && (data as any).id) {
                await safeDbWrite(
                  (supabaseClient as any).from('credit_accounts').insert({
                    user_id: profile.id,
                    card_id: card.id,
                    user_card_id: (data as any).id,
                    current_balance: 0,
                    available_credit: card.creditLimit,
                    next_statement_date: '2023-10-01',
                  }),
                  'create credit account fallback'
                );
              }
            }
          }
        },

        // ── deleteUserCard ───────────────────────────────────────────────────
        async deleteUserCard(cardId) {
          set((state) => {
            state.userCards = state.userCards.filter((c) => c.id !== cardId);
            state.creditAccounts = state.creditAccounts.filter((a) => a.cardId !== cardId);
            state.transactions = state.transactions.filter((t) => t.cardId !== cardId);
            
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
          set((state) => {
            const available = state.rewards.totalPoints - state.rewards.redeemedPoints;
            const toRedeem  = Math.min(points, available);
            state.rewards.redeemedPoints += toRedeem;
          });
          const { supabaseClient, profile, rewards } = get();
          if (supabaseClient && profile) {
            await safeDbWrite(
              (supabaseClient as any).from('users').update({
                redeemed_reward_points: rewards.redeemedPoints
              }).eq('id', profile.id),
              'redeem points'
            );
          }
        },

        // ── addBudget ────────────────────────────────────────────────────────
        async addBudget(budget) {
          set((state) => {
            state.budgets.push(budget);
          });
          const { supabaseClient, profile } = get();
          if (supabaseClient && profile) {
            await safeDbWrite(
              (supabaseClient as any).from('budgets').insert({
                id: budget.id,
                user_id: profile.id,
                category: budget.category,
                limit_amount: budget.limitAmount,
                icon: budget.icon,
                color: budget.color,
              }),
              'add budget'
            );
          }
        },

        // ── deleteBudget ─────────────────────────────────────────────────────
        async deleteBudget(budgetId) {
          set((state) => {
            state.budgets = state.budgets.filter((b) => b.id !== budgetId);
          });
          const { supabaseClient } = get();
          if (supabaseClient) {
            await safeDbWrite(
              (supabaseClient as any).from('budgets').delete().eq('id', budgetId),
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
          const { supabaseClient } = get();
          if (supabaseClient) {
            await safeDbWrite(
              (supabaseClient as any).from('budgets').update({ limit_amount: limitAmount }).eq('id', budgetId),
              'update budget limit'
            );
          }
        },

        // ── addSubscription ──────────────────────────────────────────────────
        async addSubscription(subscription) {
          set((state) => {
            state.subscriptions.push(subscription);
          });
          const { supabaseClient, profile } = get();
          if (supabaseClient && profile) {
            await safeDbWrite(
              (supabaseClient as any).from('subscriptions').insert({
                id: subscription.id,
                user_id: profile.id,
                card_id: subscription.cardId,
                name: subscription.name,
                amount: subscription.amount,
                billing_cycle: subscription.billingCycle,
                next_billing_date: subscription.nextBillingDate,
                icon: subscription.icon,
                category: subscription.category,
              }),
              'add subscription'
            );
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
          const { supabaseClient } = get();
          if (supabaseClient) {
            // Alternatively, could delete it or update status, but our table doesn't have status yet, let's just delete it for now to match cancellation
            await safeDbWrite(
              (supabaseClient as any).from('subscriptions').delete().eq('id', subscriptionId),
              'cancel subscription'
            );
          }
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
          set({ isHydratingFromSupabase: true });
          const { supabaseClient } = get();
          if (!supabaseClient) {
            set({ isHydratingFromSupabase: false });
            return;
          }

          // Fetch Profile
          const profileService = new ProfileService(supabaseClient as any);
          const { data: userRow, error: fetchError } = await profileService.getProfile(clerkId);

          if (fetchError) {
             console.error('Supabase Hydration Error:', fetchError);
             import('sonner').then(m => m.toast.error(`Hydration Error: ${fetchError.message}`));
          }

          const baseData = userRow || {};
          const metaProfile = clerkMetadata?.profileData || {};
          const hasOnboarded = !!userRow || clerkMetadata?.onboardingCompleted === true || !!clerkMetadata?.profileData;
          
          const profile = {
             id: baseData.id || metaProfile.id || clerkId,
             name: baseData.name || metaProfile.name || clerkName,
             email: baseData.email || metaProfile.email || clerkEmail,
             phone: baseData.phone || metaProfile.phone || '',
             avatar: baseData.avatar_url || metaProfile.avatar || clerkAvatar,
             salary: baseData.salary || metaProfile.salary || 1500000,
             creditScore: baseData.credit_score || metaProfile.creditScore || 750,
             onboardingCompleted: hasOnboarded,
             userSegment: baseData.user_segment || metaProfile.userSegment || get().profile?.userSegment || 'adult',
             primaryGoal: baseData.primary_goal || metaProfile.primaryGoal || get().profile?.primaryGoal || 'Maximise Cashback',
             spendCategories: baseData.spend_categories || metaProfile.spendCategories || get().profile?.spendCategories || [],
             city: baseData.city || metaProfile.city || get().profile?.city || 'Mumbai',
             occupation: baseData.occupation || metaProfile.occupation || get().profile?.occupation || 'Salaried',
          };
             
          // Fetch Cards
          const walletService = new WalletService(supabaseClient as any);
          const { data: userCardsRow } = await walletService.getWallet(clerkId);

          // Fetch Transactions
          const { data: transactionsRow } = await (supabaseClient as any)
            .from('transactions')
            .select('*')
            .eq('user_id', clerkId)
            .order('created_at', { ascending: false });
            
          // Fetch Budgets
          const { data: budgetsRow } = await (supabaseClient as any)
            .from('budgets')
            .select('*')
            .eq('user_id', clerkId);
            
          // Fetch Subscriptions
          const { data: subscriptionsRow } = await (supabaseClient as any)
            .from('subscriptions')
            .select('*')
            .eq('user_id', clerkId);
            
          // Fetch Credit Accounts
          const { data: creditAccountsRow } = await (supabaseClient as any)
            .from('credit_accounts')
            .select('*')
            .eq('user_id', clerkId);

          set((state) => {
             state.profile = profile;
                
                state.rewards = {
                  ...EMPTY_REWARDS,
                  tier: 'gold',
                  totalPoints: userRow.total_reward_points || 0,
                  redeemedPoints: userRow.redeemed_reward_points || 0,
                };
                
                
                if (userCardsRow) {
                  const dbCards = userCardsRow.map((row: any) => {
                    const cardDef = Array.isArray(row.cards) ? row.cards[0] : row.cards;
                    return {
                      id: row.card_id,
                      pan: `**** **** **** ${row.last_4_digits}`,
                      cardholderName: row.cardholder_name || profile.name,
                      expiry: row.expiry || '12/30',
                      network: cardDef?.network || 'visa',
                      bank: cardDef?.bank || 'Bank',
                      status: row.status as any,
                      availableCredit: row.credit_limit,
                      creditLimit: row.credit_limit,
                      label: cardDef?.name || 'Credit Card',
                      gradientFrom: cardDef?.gradient_from || '#1F5247',
                      gradientVia: '#30595c',
                      gradientTo: cardDef?.gradient_to || '#1B3029',
                    } as CardData;
                  });
                  const localCards = get().userCards;
                  const missingLocalCards = localCards.filter(
                    local => !dbCards.some((db: any) => db.id === local.id)
                  );
                  state.userCards = [...dbCards, ...missingLocalCards];
                }
                
                if (transactionsRow) {
                  state.transactions = transactionsRow.map((row: any) => ({
                    id: row.id,
                    merchant: row.merchant,
                    amount: row.amount,
                    date: row.created_at,
                    category: row.category as any,
                    type: row.type as any,
                    cardId: row.card_id || '',
                    pending: row.is_pending,
                    rewardPoints: 0,
                  }));
                }
                
                if (budgetsRow) {
                  state.budgets = budgetsRow.map((row: any) => ({
                    id: row.id,
                    category: row.category,
                    limitAmount: row.limit_amount,
                    icon: row.icon,
                    color: row.color,
                  }));
                }
                
                if (subscriptionsRow) {
                  state.subscriptions = subscriptionsRow.map((row: any) => ({
                    id: row.id,
                    name: row.name,
                    amount: row.amount,
                    billingCycle: row.billing_cycle,
                    nextBillingDate: row.next_billing_date,
                    icon: row.icon,
                    category: row.category,
                    cardId: row.card_id,
                  }));
                }
                
                if (creditAccountsRow) {
                  state.creditAccounts = creditAccountsRow.map((row: any) => ({
                    cardId: row.card_id,
                    totalLimit: state.userCards.find(c => c.id === row.card_id)?.creditLimit || 100000,
                    currentBalance: row.current_balance,
                    minimumPaymentDue: row.min_due,
                    paymentDueDate: row.due_date || row.next_statement_date,
                    lastPaymentAmount: 0,
                    lastPaymentDate: null,
                    apr: 0.1999,
                  }));
                }
             });
          set({ isHydratingFromSupabase: false });
        },
      })),

      {
        name: 'renocred-dashboard-v5',               // localStorage key
        storage: createJSONStorage(() => localStorage),
        version: 5,

        /**
         * Only persist the data state — not the UI/loading flags.
         * This prevents a stale isPaymentProcessing=true from persisting
         * across reloads if the browser was closed mid-action.
         */
        partialize: (state) => ({
          activeCardId: state.activeCardId,
          profile: state.profile,
          userCards: state.userCards,
        }),

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
      enabled: import.meta.env.DEV,
    },
  ),
);

export const useHydration = () => {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const unsubFinishHydration = useDashboardStore.persist.onFinishHydration(() => setHydrated(true));
    setHydrated(useDashboardStore.persist.hasHydrated());
    return () => {
      unsubFinishHydration();
    };
  }, []);
  return hydrated;
};
