import { create } from 'zustand';
import { persist, devtools, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import type {
  Transaction,
  CreditAccount,
  RewardsAccount,
  AddTransactionInput,
  PayBillInput,
  TransactionCategory,
  AppProfile,
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

interface DashboardState {
  /** All transactions — newest first */
  transactions: Transaction[];
  /** One credit account per card */
  creditAccounts: CreditAccount[];
  /** Single rewards ledger across all cards */
  rewards: RewardsAccount;
  /** Which card is currently "active" / selected in the UI */
  activeCardId: string;
  /** Whether a bill payment is in flight (optimistic UI) */
  isPaymentProcessing: boolean;
  /** Logged in user profile info */
  profile: AppProfile | null;
  /** Cards added to the user's wallet */
  userCards: CardData[];
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

  /** Reset store to seed state — useful for development. */
  _reset: () => void;
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

const INITIAL_STATE: DashboardState = {
  transactions:   [],
  creditAccounts: [],
  rewards:        EMPTY_REWARDS,
  activeCardId:   '',
  isPaymentProcessing: false,
  profile:        null,
  userCards:      [],
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
        },

        // ── redeemPoints ─────────────────────────────────────────────────────
        redeemPoints(points) {
          set((state) => {
            const available = state.rewards.totalPoints - state.rewards.redeemedPoints;
            const toRedeem  = Math.min(points, available);
            state.rewards.redeemedPoints += toRedeem;
          });
        },

        // ── _reset ────────────────────────────────────────────────────────────
        _reset() {
          set(INITIAL_STATE);
        },
      })),

      {
        name: 'renocred-dashboard-v4',               // localStorage key
        storage: createJSONStorage(() => localStorage),
        version: 4,

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
