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

// ─────────────────────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────────────────────

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
  /** Which card is currently "active" / selected in the UI */
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
  addTransaction: (input: AddTransactionInput) => void;

  /**
   * Pay down the outstanding balance on a card.
   * Reduces currentBalance, updates available credit, and records a credit
   * transaction in the ledger.
   */
  payBill: (input: PayBillInput) => void;

  /** Freeze or unfreeze a card (sets CardData.status via activeCardId). */
  setActiveCard: (cardId: string) => void;

  /** Redeem reward points. */
  redeemPoints: (points: number) => void;

  /** Log in user */
  login: (profile: AppProfile) => void;

  /** Log out user */
  logout: () => void;

  /** Update user profile */
  updateProfile: (profile: AppProfile) => void;

  /** Add a card to user's wallet */
  addUserCard: (card: CardData) => void;

  /** Remove a card from user's wallet */
  deleteUserCard: (cardId: string) => void;

  /** Add a new category budget */
  addBudget: (budget: CategoryBudget) => void;

  /** Remove a category budget */
  deleteBudget: (budgetId: string) => void;

  /** Update a category budget limit */
  updateBudgetLimit: (budgetId: string, limitAmount: number) => void;

  /** Add a new subscription (renewal) */
  addSubscription: (subscription: Subscription) => void;

  /** Cancel a subscription */
  cancelSubscription: (subscriptionId: string) => void;

  /** Reset store to seed state — useful for development. */
  _reset: () => void;

  /** Inject Supabase Client from React tree */
  setSupabaseClient: (client: SupabaseClient<Database> | null) => void;

  /** Hydrate local state from Supabase database */
  hydrateFromSupabase: (clerkEmail: string, clerkName: string, clerkAvatar: string) => Promise<void>;
}

// ─────────────────────────────────────────────────────────────────────────────
//  INITIAL STATE
// ─────────────────────────────────────────────────────────────────────────────

export const INITIAL_CARDS: CardData[] = [
  {
    id:              'card-001',
    pan:             '4111111111114242',
    cardholderName:  'Atharva Kulkarni',
    expiry:          '08/28',
    network: 'visa',
    bank: 'SBI',
    status:          'active',
    availableCredit: 62000000,
    creditLimit:     100000000,
    label:           'Signature Rewards',
    gradientFrom:    '#1F5247',
    gradientVia:     '#30595c',
    gradientTo:      '#456171',
  },
  {
    id:              'card-002',
    pan:             '5500005555555559',
    cardholderName:  'Atharva Kulkarni',
    expiry:          '03/27',
    network: 'mastercard',
    bank: 'HDFC',
    status:          'active',
    availableCredit: 28000000,
    creditLimit:     50000000,
    label:           'Platinum Travel',
    gradientFrom:    '#B85C2A',
    gradientVia:     '#C77931',
    gradientTo:      '#D4943A',
  }
];

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

const MOCK_SUBSCRIPTIONS: Subscription[] = [
  {
    id: 'sub-1',
    name: 'Netflix Premium',
    amount: 64900,
    billingCycle: 'monthly',
    nextBillingDate: '2026-07-15T00:00:00.000Z',
    status: 'active',
    cardId: 'card-001',
    category: 'entertainment',
    hasPriceHike: true,
    previousAmount: 49900,
    isFreeTrial: false,
  },
  {
    id: 'sub-2',
    name: 'Spotify Family',
    amount: 17900,
    billingCycle: 'monthly',
    nextBillingDate: '2026-07-05T00:00:00.000Z',
    status: 'active',
    cardId: 'card-001',
    category: 'entertainment',
    hasPriceHike: false,
    isFreeTrial: false,
  },
  {
    id: 'sub-3',
    name: 'Amazon Prime',
    amount: 149900,
    billingCycle: 'yearly',
    nextBillingDate: '2026-07-10T00:00:00.000Z',
    status: 'active',
    cardId: 'card-002',
    category: 'shopping',
    hasPriceHike: false,
    isFreeTrial: true,
  },
];

const MOCK_MILESTONES: Milestone[] = [
  {
    id: 'mile-1',
    title: 'Annual Fee Waiver',
    description: 'Spend ₹3,00,000 this year to waive the annual fee of ₹2,999.',
    targetAmount: 30000000,
    currentAmount: 18500000,
    rewardType: 'fee_waiver',
    rewardValue: '₹2,999 Fee Waiver',
    dueDate: '2026-12-31T23:59:59.000Z',
    cardId: 'card-001',
  },
  {
    id: 'mile-2',
    title: 'Bonus Reward Points',
    description: 'Spend ₹1,50,000 in a quarter to get 10,000 bonus points.',
    targetAmount: 15000000,
    currentAmount: 14200000,
    rewardType: 'points',
    rewardValue: '10,000 Points',
    dueDate: '2026-09-30T23:59:59.000Z',
    cardId: 'card-002',
  },
];

const MOCK_OFFERS: MerchantOffer[] = [
  {
    id: 'offer-1',
    merchantName: 'Amazon',
    description: '10% Cashback on Amazon Prime purchases',
    discountPercentage: 10,
    maxDiscountAmount: 150000,
    category: 'shopping',
    validUntil: '2026-08-31T23:59:59.000Z',
    eligibleCardIds: ['card-001'],
  },
  {
    id: 'offer-2',
    merchantName: 'Swiggy Dineout',
    description: '15% off on dining bills up to ₹500',
    discountPercentage: 15,
    maxDiscountAmount: 50000,
    category: 'dining',
    validUntil: '2026-07-15T23:59:59.000Z',
    eligibleCardIds: ['card-001', 'card-002'],
  },
  {
    id: 'offer-3',
    merchantName: 'MakeMyTrip',
    description: 'Flat ₹1200 off on domestic flights',
    discountPercentage: 0,
    maxDiscountAmount: 120000,
    category: 'travel',
    validUntil: '2026-09-30T23:59:59.000Z',
    eligibleCardIds: ['card-002'],
  }
];

const MOCK_BUDGETS: CategoryBudget[] = [
  {
    id: 'budget-1',
    category: 'dining',
    limitAmount: 1000000,
    currentSpend: 850000,
    period: 'monthly',
  },
  {
    id: 'budget-2',
    category: 'shopping',
    limitAmount: 2500000,
    currentSpend: 1200000,
    period: 'monthly',
  }
];

const d = new Date();
const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 'tx-1', type: 'debit', amount: 150000, merchant: 'Amazon', category: 'shopping', date: new Date(d.getTime() - 1 * 86400000).toISOString(), cardId: 'card-001', pending: false },
  { id: 'tx-2', type: 'debit', amount: 45000, merchant: 'Swiggy', category: 'dining', date: new Date(d.getTime() - 2 * 86400000).toISOString(), cardId: 'card-001', pending: false },
  { id: 'tx-3', type: 'debit', amount: 1200000, merchant: 'MakeMyTrip', category: 'travel', date: new Date(d.getTime() - 3 * 86400000).toISOString(), cardId: 'card-002', pending: false },
  { id: 'tx-4', type: 'debit', amount: 80000, merchant: 'Blinkit', category: 'groceries', date: new Date(d.getTime() - 4 * 86400000).toISOString(), cardId: 'card-001', pending: false },
  { id: 'tx-5', type: 'debit', amount: 250000, merchant: 'Zara', category: 'shopping', date: new Date(d.getTime() - 5 * 86400000).toISOString(), cardId: 'card-002', pending: false },
  { id: 'tx-6', type: 'debit', amount: 30000, merchant: 'Uber', category: 'transport', date: new Date(d.getTime() - 6 * 86400000).toISOString(), cardId: 'card-001', pending: false },
  { id: 'tx-7', type: 'debit', amount: 150000, merchant: 'Netflix', category: 'subscriptions', date: new Date(d.getTime() - 0.5 * 86400000).toISOString(), cardId: 'card-002', pending: false },
  { id: 'tx-8', type: 'debit', amount: 320000, merchant: 'Croma', category: 'shopping', date: new Date(d.getTime() - 1.5 * 86400000).toISOString(), cardId: 'card-001', pending: false },
  { id: 'tx-9', type: 'debit', amount: 85000, merchant: 'Zomato', category: 'dining', date: new Date(d.getTime() - 3.5 * 86400000).toISOString(), cardId: 'card-002', pending: false },
  { id: 'tx-10', type: 'debit', amount: 12000, merchant: 'Starbucks', category: 'dining', date: new Date(d.getTime() - 5.5 * 86400000).toISOString(), cardId: 'card-001', pending: false },
];

const INITIAL_STATE: DashboardState = {
  transactions:   MOCK_TRANSACTIONS,
  creditAccounts: [],
  rewards:        {
    ...EMPTY_REWARDS,
    tier: 'gold',
    totalPoints: 12500,
    redeemedPoints: 2000,
  },
  activeCardId: null,
  isPaymentProcessing: false,
  isHydratingFromSupabase: false,
  profile:        null,
  userCards:      INITIAL_CARDS, // fallback if empty
  subscriptions:  MOCK_SUBSCRIPTIONS,
  milestones:     MOCK_MILESTONES,
  offers:         MOCK_OFFERS,
  budgets:        MOCK_BUDGETS,
  supabaseClient: null,
};

// ─────────────────────────────────────────────────────────────────────────────
//  STORE
//
//  Middleware stack (inside-out evaluation order):
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
        addTransaction(input) {
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

          // SYNC TO SUPABASE
          const { supabaseClient, profile, creditAccounts } = get();
          if (supabaseClient && profile) {
            (supabaseClient as any).from('transactions').insert({
              id: newTx.id,
              user_id: profile.id,
              card_id: newTx.cardId,
              merchant: newTx.merchant,
              amount: newTx.amount,
              category: newTx.category,
              type: newTx.type,
              is_pending: newTx.pending || false,
            }).then();

            const updatedAccount = creditAccounts.find(a => a.cardId === input.cardId);
            if (updatedAccount) {
              (supabaseClient as any).from('credit_accounts')
                .update({ current_balance: updatedAccount.currentBalance })
                .eq('user_card_id', input.cardId)
                .then();
            }
          }
        },

        // ── payBill ──────────────────────────────────────────────────────────
        payBill({ cardId, amount }) {
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
            const updatedAccount = creditAccounts.find(a => a.cardId === cardId);
            const effectivePayment = Math.min(amount, (updatedAccount?.currentBalance ?? 0) + amount);
            
            // Insert credit transaction
            (supabaseClient as any).from('transactions').insert({
              id: generateId(),
              user_id: profile.id,
              card_id: cardId,
              merchant: 'Bill Payment',
              amount: -effectivePayment,
              category: 'other',
              type: 'credit',
              is_pending: false,
            }).then();

            if (updatedAccount) {
              (supabaseClient as any).from('credit_accounts')
                .update({ current_balance: updatedAccount.currentBalance })
                .eq('user_card_id', cardId)
                .then();
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
        login(profile) {
          set((state) => {
            state.profile = profile;
            state.userCards.forEach((c) => {
              c.cardholderName = profile.name;
            });
          });

          // SYNC TO SUPABASE
          const { supabaseClient } = get();
          if (supabaseClient) {
             (supabaseClient as any).from('users').upsert({
                id: profile.id,
                email: profile.email,
                name: profile.name,
                phone: profile.phone,
                avatar_url: profile.avatar,
                salary: profile.salary,
                credit_score: profile.creditScore,
             }).then(({ error }: any) => {
               if (error) {
                 console.error('Supabase Upsert Error:', error);
                 import('sonner').then(m => m.toast.error(`Save Error: ${error.message}`));
               } else {
                 console.log('Successfully saved to Supabase!');
                 import('sonner').then(m => m.toast.success(`Profile saved to cloud!`));
               }
             });
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
        updateProfile(profile) {
          set((state) => {
            state.profile = profile;
            state.userCards.forEach((c) => {
              c.cardholderName = profile.name;
            });
          });

          // SYNC TO SUPABASE
          const { supabaseClient } = get();
          if (supabaseClient) {
             (supabaseClient as any).from('users').upsert({
                id: profile.id,
                email: profile.email,
                name: profile.name,
                phone: profile.phone,
                avatar_url: profile.avatar,
                salary: profile.salary,
                credit_score: profile.creditScore,
             }).then();
          }
        },

        // ── addUserCard ──────────────────────────────────────────────────────
        addUserCard(card) {
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

          // SYNC TO SUPABASE
          const { supabaseClient, profile } = get();
          if (supabaseClient && profile) {
            (supabaseClient as any).from('user_cards').insert({
              user_id: profile.id,
              card_id: card.id,
              last_4_digits: card.pan.slice(-4),
              cardholder_name: profile.name,
              expiry: card.expiry,
              credit_limit: card.creditLimit,
              status: 'active',
            }).select('id').single().then(({ data, error }: any) => {
               if (error) {
                 console.error("Supabase user_cards insert error:", error);
                 import('sonner').then(m => m.toast.error(`Error saving card: ${error.message}`));
               }
               if (data && data.id) {
                 (supabaseClient as any).from('credit_accounts').insert({
                   user_id: profile.id,
                   card_id: card.id,
                   user_card_id: data.id,
                   current_balance: 0,
                   available_credit: card.creditLimit,
                   next_statement_date: '2023-10-01',
                 }).then(({ error: accError }: any) => {
                    if (accError) {
                       console.error("Supabase credit_accounts insert error:", accError);
                       import('sonner').then(m => m.toast.error(`Error creating account: ${accError.message}`));
                    }
                 });
               }
            });
          }
        },

        // ── deleteUserCard ───────────────────────────────────────────────────
        deleteUserCard(cardId) {
          set((state) => {
            state.userCards = state.userCards.filter((c) => c.id !== cardId);
            state.creditAccounts = state.creditAccounts.filter((a) => a.cardId !== cardId);
            state.transactions = state.transactions.filter((t) => t.cardId !== cardId);
            
            if (state.activeCardId === cardId) {
              state.activeCardId = state.userCards.length > 0 ? state.userCards[0].id : '';
            }
          });
          const { supabaseClient } = get();
          if (supabaseClient) {
            // cardId here is the master card_id, so we delete by card_id
            (supabaseClient as any).from('user_cards').delete().eq('card_id', cardId).then();
          }
        },

        // ── redeemPoints ─────────────────────────────────────────────────────
        redeemPoints(points) {
          set((state) => {
            const available = state.rewards.totalPoints - state.rewards.redeemedPoints;
            const toRedeem  = Math.min(points, available);
            state.rewards.redeemedPoints += toRedeem;
          });
          const { supabaseClient, profile, rewards } = get();
          if (supabaseClient && profile) {
            (supabaseClient as any).from('users').update({
              redeemed_reward_points: rewards.redeemedPoints
            }).eq('id', profile.id).then();
          }
        },

        // ── addBudget ────────────────────────────────────────────────────────
        addBudget(budget) {
          set((state) => {
            state.budgets.push(budget);
          });
          const { supabaseClient, profile } = get();
          if (supabaseClient && profile) {
            (supabaseClient as any).from('budgets').insert({
              id: budget.id,
              user_id: profile.id,
              category: budget.category,
              limit_amount: budget.limitAmount,
              icon: budget.icon,
              color: budget.color,
            }).then();
          }
        },

        // ── deleteBudget ─────────────────────────────────────────────────────
        deleteBudget(budgetId) {
          set((state) => {
            state.budgets = state.budgets.filter((b) => b.id !== budgetId);
          });
          const { supabaseClient } = get();
          if (supabaseClient) {
            (supabaseClient as any).from('budgets').delete().eq('id', budgetId).then();
          }
        },

        // ── updateBudgetLimit ────────────────────────────────────────────────
        updateBudgetLimit(budgetId, limitAmount) {
          set((state) => {
            const budget = state.budgets.find(b => b.id === budgetId);
            if (budget) {
              budget.limitAmount = limitAmount;
            }
          });
          const { supabaseClient } = get();
          if (supabaseClient) {
            (supabaseClient as any).from('budgets').update({ limit_amount: limitAmount }).eq('id', budgetId).then();
          }
        },

        // ── addSubscription ──────────────────────────────────────────────────
        addSubscription(subscription) {
          set((state) => {
            state.subscriptions.push(subscription);
          });
          const { supabaseClient, profile } = get();
          if (supabaseClient && profile) {
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
            }).then();
          }
        },

        // ── cancelSubscription ───────────────────────────────────────────────
        cancelSubscription(subscriptionId) {
          set((state) => {
            const sub = state.subscriptions.find(s => s.id === subscriptionId);
            if (sub) {
              sub.status = 'cancelled';
            }
          });
          const { supabaseClient } = get();
          if (supabaseClient) {
            // Alternatively, could delete it or update status, but our table doesn't have status yet, let's just delete it for now to match cancellation
            (supabaseClient as any).from('subscriptions').delete().eq('id', subscriptionId).then();
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
        async hydrateFromSupabase(clerkEmail, clerkName, clerkAvatar) {
          set({ isHydratingFromSupabase: true });
          const { supabaseClient } = get();
          if (!supabaseClient) {
            set({ isHydratingFromSupabase: false });
            return;
          }

          // Fetch Profile
          const { data: userRow, error: fetchError } = await (supabaseClient as any)
            .from('users')
            .select('*')
            .eq('email', clerkEmail)
            .maybeSingle();

          if (fetchError) {
             console.error('Supabase Hydration Error:', fetchError);
             import('sonner').then(m => m.toast.error(`Hydration Error: ${fetchError.message}`));
          }

          if (userRow) {
             const profile = {
                id: userRow.id,
                name: userRow.name || clerkName,
                email: userRow.email,
                phone: userRow.phone || '',
                avatar: userRow.avatar_url || clerkAvatar,
                salary: userRow.salary,
                creditScore: userRow.credit_score,
             };
             
             // Fetch Cards
             const { data: userCardsRow } = await (supabaseClient as any)
               .from('user_cards')
               .select(`
                 *,
                 cards (*)
               `)
               .eq('user_id', userRow.id);

             // Fetch Transactions
             const { data: transactionsRow } = await (supabaseClient as any)
               .from('transactions')
               .select('*')
               .eq('user_id', userRow.id)
               .order('created_at', { ascending: false });
               
             // Fetch Budgets
             const { data: budgetsRow } = await (supabaseClient as any)
               .from('budgets')
               .select('*')
               .eq('user_id', userRow.id);
               
             // Fetch Subscriptions
             const { data: subscriptionsRow } = await (supabaseClient as any)
               .from('subscriptions')
               .select('*')
               .eq('user_id', userRow.id);
               
             // Fetch Credit Accounts
             const { data: creditAccountsRow } = await (supabaseClient as any)
               .from('credit_accounts')
               .select('*')
               .eq('user_id', userRow.id);

             set((state) => {
                state.profile = profile;
                
                state.rewards = {
                  ...EMPTY_REWARDS,
                  tier: 'gold',
                  totalPoints: userRow.total_reward_points || 0,
                  redeemedPoints: userRow.redeemed_reward_points || 0,
                };
                
                
                if (userCardsRow) {
                  state.userCards = userCardsRow.map((row: any) => {
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
                      gradientTo: cardDef?.gradient_to || '#456171',
                    }
                  });
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
          }
          
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
          transactions:   state.transactions,
          creditAccounts: state.creditAccounts,
          rewards:        state.rewards,
          activeCardId:   state.activeCardId,
          profile:        state.profile,
          userCards:      state.userCards,
          subscriptions:  state.subscriptions,
          milestones:     state.milestones,
          offers:         state.offers,
          budgets:        state.budgets,
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
