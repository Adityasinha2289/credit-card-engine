import type { Transaction, CategoryBudget, Subscription, CreditAccount } from '../../dashboard/types/dashboard.types';
import type { SavingsGoal } from '../types';
import {
  summarizeMonth,
  daysLeftInMonth,
  daysUntil,
  isValidDate,
  monthKey,
} from '../lib/moneyMath';

export interface SafeToSpendResult {
  /** All values in PAISE */
  safeToSpend: number;
  perDay: number;
  netSpent: number;
  spent: number;
  refunds: number;
  totalIncome: number;
  savingsTarget: number;
  /** Budget headroom still earmarked for budgeted categories this month */
  reservedForBudgets: number;
  /** Active subscriptions still to bill before month end (not already covered by a budget) */
  upcomingSubscriptions: number;
  daysLeft: number;
  /** false when the user hasn't told us their income — UI should ask instead of guessing */
  hasIncome: boolean;
  source: 'DEMO' | 'LIVE';
}

/**
 * Safe-to-spend for the current IST month (accrual basis):
 *
 *   income − savings goals − net spent − remaining budget headroom − subscriptions still due this month
 *
 * Card bill payments are excluded from spend (they settle last month's purchases,
 * which were already counted when they happened). Everything is in paise.
 */
export class SafeToSpendEngine {
  static calculate(input: {
    monthlyIncome: number | null;
    transactions: Transaction[];
    budgets: CategoryBudget[];
    goals: SavingsGoal[];
    subscriptions: Subscription[];
    isDemo?: boolean;
    now?: Date;
  }): SafeToSpendResult {
    const now = input.now ?? new Date();
    const income = input.monthlyIncome && input.monthlyIncome > 0 ? input.monthlyIncome : 0;
    const month = summarizeMonth(input.transactions, now);

    const savingsTarget = input.goals.reduce((sum, g) => sum + Math.max(0, g.monthlyContribution || 0), 0);

    const budgetedCategories = new Set(input.budgets.map((b) => b.category));
    const reservedForBudgets = input.budgets.reduce((sum, b) => {
      const spentInCat = month.byCategory[b.category] ?? 0;
      return sum + Math.max(0, (b.limitAmount || 0) - spentInCat);
    }, 0);

    const thisMonth = monthKey(now);
    const upcomingSubscriptions = input.subscriptions
      .filter((s) => s.status !== 'cancelled' && s.status !== 'paused')
      .filter((s) => !budgetedCategories.has('subscriptions') || s.category !== 'subscriptions')
      .filter((s) => isValidDate(s.nextBillingDate))
      .filter((s) => monthKey(s.nextBillingDate) === thisMonth && daysUntil(s.nextBillingDate, now) >= 0)
      .reduce((sum, s) => sum + Math.max(0, s.amount || 0), 0);

    const safeToSpend = Math.max(
      0,
      income - savingsTarget - month.netSpent - reservedForBudgets - upcomingSubscriptions,
    );
    const daysLeft = daysLeftInMonth(now);

    return {
      safeToSpend,
      perDay: daysLeft > 0 ? Math.floor(safeToSpend / daysLeft) : 0,
      netSpent: month.netSpent,
      spent: month.spent,
      refunds: month.refunds,
      totalIncome: income,
      savingsTarget,
      reservedForBudgets,
      upcomingSubscriptions,
      daysLeft,
      hasIncome: income > 0,
      source: input.isDemo ? 'DEMO' : 'LIVE',
    };
  }
}

export type CardDueState = 'CLEAR' | 'DUE_SOON' | 'DUE_TODAY' | 'OVERDUE' | 'HIGH_OUTSTANDING' | 'NO_DUE_DATE';

export interface CardDueInfo {
  cardId: string;
  name: string;
  totalDue: number;
  minimumDue: number;
  dueDate: string | null;
  daysRemaining: number | null;
  state: CardDueState;
  outstanding: number;
}

export class CardDueEngine {
  static evaluate(accounts: CreditAccount[], cardNames: Record<string, string>, now: Date = new Date()): CardDueInfo[] {
    return accounts.map((account) => {
      const outstanding = Math.max(0, account.currentBalance || 0);
      let state: CardDueState = 'CLEAR';
      let daysRemaining: number | null = null;
      const dueDate = isValidDate(account.paymentDueDate) ? account.paymentDueDate : null;

      if (dueDate && outstanding > 0) {
        daysRemaining = daysUntil(dueDate, now);
        if (daysRemaining < 0) state = 'OVERDUE';
        else if (daysRemaining === 0) state = 'DUE_TODAY';
        else if (daysRemaining <= 7) state = 'DUE_SOON';
      } else if (!dueDate && outstanding > 0) {
        state = 'NO_DUE_DATE';
      }

      if ((state === 'CLEAR' || state === 'NO_DUE_DATE') && account.totalLimit > 0 && outstanding / account.totalLimit > 0.5) {
        state = 'HIGH_OUTSTANDING';
      }

      return {
        cardId: account.cardId,
        name: cardNames[account.cardId] || 'Credit card',
        totalDue: outstanding,
        minimumDue: account.minimumPaymentDue || 0,
        dueDate,
        daysRemaining,
        state,
        outstanding,
      };
    });
  }
}
