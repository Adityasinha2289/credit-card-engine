import type { Transaction, CategoryBudget, Subscription, CreditAccount } from '../../dashboard/types/dashboard.types';
import type { SavingsGoal } from '../types';

export class SafeToSpendEngine {
  static calculate(
    income: number,
    transactions: Transaction[],
    budgets: CategoryBudget[],
    goals: SavingsGoal[],
    subscriptions: Subscription[],
    isDemo: boolean = true
  ) {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlyTransactions = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const totalSpent = monthlyTransactions
      .filter(t => t.type === 'debit')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalRefunds = monthlyTransactions
      .filter(t => t.type === 'refund' || t.type === 'credit')
      .reduce((sum, t) => sum + t.amount, 0);

    const netSpent = totalSpent - totalRefunds;

    const committedBudgets = budgets.reduce((sum, b) => sum + b.limitAmount, 0);
    const savingsTarget = goals.reduce((sum, g) => sum + g.monthlyContribution, 0);
    
    // Simplistic safe to spend
    let safeToSpend = income - committedBudgets - savingsTarget;
    
    const remainingIncome = income - savingsTarget - netSpent;
    safeToSpend = Math.max(0, remainingIncome); 

    return {
      safeToSpend,
      netSpent,
      totalIncome: income,
      savingsTarget,
      committedBudgets,
      source: isDemo ? 'DEMO' : 'LIVE'
    };
  }
}

export class CardDueEngine {
  static evaluate(accounts: CreditAccount[], cardNames: Record<string, string>) {
    return accounts.map(account => {
      let state: 'CLEAR' | 'DUE_SOON' | 'DUE_TODAY' | 'OVERDUE_DEMO' | 'HIGH_OUTSTANDING' = 'CLEAR';
      let daysRemaining = 0;
      
      if (account.paymentDueDate) {
        const due = new Date(account.paymentDueDate);
        const now = new Date(); // Use real current date
        
        const diffTime = due.getTime() - now.getTime();
        daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (daysRemaining < 0) state = 'OVERDUE_DEMO';
        else if (daysRemaining === 0) state = 'DUE_TODAY';
        else if (daysRemaining <= 7) state = 'DUE_SOON';
      }

      if (state === 'CLEAR' && account.currentBalance && account.totalLimit) {
        if (account.currentBalance / account.totalLimit > 0.5) {
          state = 'HIGH_OUTSTANDING';
        }
      }

      return {
        cardId: account.cardId,
        name: cardNames[account.cardId] || 'Credit Card',
        totalDue: account.currentBalance || 0,
        minimumDue: account.minimumPaymentDue || 0,
        dueDate: account.paymentDueDate,
        daysRemaining,
        state,
        outstanding: account.currentBalance || 0
      };
    });
  }
}
