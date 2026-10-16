/**
 * Money Manager domain types.
 *
 * Transactions, budgets and subscriptions live in the dashboard store
 * (see features/dashboard/types/dashboard.types.ts). Only types unique to
 * Money Manager are defined here. All amounts are in PAISE.
 */

export interface SavingsGoal {
  id: string;
  goal: string;
  /** paise */
  targetAmount: number;
  /** paise */
  currentAmount: number;
  /** ISO date, optional */
  deadline?: string | null;
  /** paise set aside every month */
  monthlyContribution: number;
}
