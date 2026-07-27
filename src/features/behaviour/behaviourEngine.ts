import type { Transaction } from '../dashboard/types/dashboard.types';
import { useDashboardStore } from '../dashboard/store/dashboardStore';
import type { BehaviourTransaction, FinancialInsight, CategorySpendSummary } from './types';
import { MOCK_BEHAVIOUR_TRANSACTIONS } from './mockData';

export class BehaviourEngine {
  /**
   * Adapter to normalize store transactions or fallback mock transactions
   */
  public static getNormalizedTransactions(inputTx?: Transaction[] | BehaviourTransaction[]): BehaviourTransaction[] {
    if (inputTx && inputTx.length > 0) {
      return inputTx.map((tx) => ({
        id: tx.id,
        amount: Math.abs(tx.amount),
        category: tx.category,
        merchant: tx.merchant,
        paymentMethod: ('paymentMethod' in tx ? (tx as any).paymentMethod : 'credit_card'),
        date: tx.date,
        cardId: tx.cardId,
      }));
    }

    const storeTx = useDashboardStore.getState().transactions;
    if (storeTx && storeTx.length > 0) {
      return storeTx.map((tx) => ({
        id: tx.id,
        amount: Math.abs(tx.amount),
        category: tx.category,
        merchant: tx.merchant,
        paymentMethod: 'credit_card',
        date: tx.date,
        cardId: tx.cardId,
      }));
    }

    return MOCK_BEHAVIOUR_TRANSACTIONS;
  }

  /**
   * Get total monthly spend amount
   */
  public static getMonthlySpend(inputTx?: Transaction[] | BehaviourTransaction[]): number {
    const txs = this.getNormalizedTransactions(inputTx);
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return txs
      .filter((tx) => {
        const d = new Date(tx.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((sum, tx) => sum + tx.amount, 0);
  }

  /**
   * Get category-wise spending summaries sorted by highest spend
   */
  public static getTopCategories(inputTx?: Transaction[] | BehaviourTransaction[]): CategorySpendSummary[] {
    const txs = this.getNormalizedTransactions(inputTx);
    const totalSpend = txs.reduce((sum, tx) => sum + tx.amount, 0) || 1;

    const map = new Map<string, { totalAmount: number; count: number }>();

    for (const tx of txs) {
      const current = map.get(tx.category) || { totalAmount: 0, count: 0 };
      map.set(tx.category, {
        totalAmount: current.totalAmount + tx.amount,
        count: current.count + 1,
      });
    }

    const summaries: CategorySpendSummary[] = Array.from(map.entries()).map(([cat, val]) => ({
      category: cat as any,
      totalAmount: val.totalAmount,
      transactionCount: val.count,
      percentageOfTotal: Math.round((val.totalAmount / totalSpend) * 100),
    }));

    return summaries.sort((a, b) => b.totalAmount - a.totalAmount);
  }

  /**
   * Get recurring merchants list
   */
  public static getRecurringMerchants(inputTx?: Transaction[] | BehaviourTransaction[]): string[] {
    const txs = this.getNormalizedTransactions(inputTx);
    const merchantCounts = new Map<string, number>();

    for (const tx of txs) {
      if (tx.isRecurring) {
        merchantCounts.set(tx.merchant, (merchantCounts.get(tx.merchant) || 0) + 2);
      } else {
        merchantCounts.set(tx.merchant, (merchantCounts.get(tx.merchant) || 0) + 1);
      }
    }

    return Array.from(merchantCounts.entries())
      .filter(([_, count]) => count >= 2)
      .map(([merchant]) => merchant);
  }

  /**
   * Get the single largest transaction item
   */
  public static getLargestExpense(inputTx?: Transaction[] | BehaviourTransaction[]): BehaviourTransaction | null {
    const txs = this.getNormalizedTransactions(inputTx);
    if (txs.length === 0) return null;
    return txs.reduce((max, tx) => (tx.amount > max.amount ? tx : max), txs[0]);
  }

  /**
   * Get N recent transactions
   */
  public static getRecentTransactions(limit = 5, inputTx?: Transaction[] | BehaviourTransaction[]): BehaviourTransaction[] {
    const txs = this.getNormalizedTransactions(inputTx);
    return [...txs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, limit);
  }

  /**
   * Rule-based deterministic insight generator
   */
  public static getInsights(inputTx?: Transaction[] | BehaviourTransaction[]): FinancialInsight[] {
    const txs = this.getNormalizedTransactions(inputTx);
    const topCategories = this.getTopCategories(txs);
    const recurringMerchants = this.getRecurringMerchants(txs);
    const insights: FinancialInsight[] = [];

    // Rule 1: Highest Spending Category
    if (topCategories.length > 0) {
      const top = topCategories[0];
      insights.push({
        id: 'ins-top-cat',
        type: 'top_category',
        title: `${top.category.charAt(0).toUpperCase() + top.category.slice(1)} is your highest category`,
        description: `Accounted for ${top.percentageOfTotal}% of total expenses.`,
        category: top.category,
        actionableText: 'Review category rewards',
        impactScore: 85,
      });
    }

    // Rule 2: Dining Spending Increase
    const diningCategory = topCategories.find((c) => c.category === 'dining');
    if (diningCategory && diningCategory.percentageOfTotal > 15) {
      insights.push({
        id: 'ins-dining-inc',
        type: 'increase',
        title: 'Dining spending increased this month',
        description: 'Frequent restaurant and food delivery expenses detected recently.',
        category: 'dining',
        actionableText: 'Check dining rewards multiplier',
        impactScore: 78,
      });
    }

    // Rule 3: Low Travel Spending
    const travelCategory = topCategories.find((c) => c.category === 'travel');
    if (!travelCategory || travelCategory.percentageOfTotal < 10) {
      insights.push({
        id: 'ins-travel-low',
        type: 'low',
        title: 'Travel spending is low',
        description: 'You haven\'t redeemed travel perks or booked flights recently.',
        category: 'travel',
        actionableText: 'Explore travel benefits',
        impactScore: 60,
      });
    }

    // Rule 4: Recurring Monthly Utilities
    if (recurringMerchants.length > 0) {
      insights.push({
        id: 'ins-recurring-util',
        type: 'recurring',
        title: 'Utilities are recurring monthly',
        description: `Automated payments detected for ${recurringMerchants.slice(0, 2).join(', ')}.`,
        category: 'utilities',
        actionableText: 'Autopay optimized',
        impactScore: 70,
      });
    }

    // Rule 5: Underutilized Travel Card
    const cards = useDashboardStore.getState().userCards;
    const travelCard = cards.find((c) => (c.label || '').toLowerCase().includes('travel'));
    if (travelCard) {
      insights.push({
        id: 'ins-card-underused',
        type: 'underutilized_card',
        title: 'You haven\'t used your travel card recently',
        description: `Zero active transactions on ${travelCard.label || 'your travel card'} this cycle.`,
        actionableText: 'Activate card perks',
        impactScore: 75,
      });
    }

    return insights;
  }
}

/**
 * React hook wrapper for consuming Behaviour Insights
 */
export function useBehaviourInsights() {
  const transactions = useDashboardStore((s) => s.transactions);
  return {
    insights: BehaviourEngine.getInsights(transactions),
    topCategories: BehaviourEngine.getTopCategories(transactions),
    monthlySpend: BehaviourEngine.getMonthlySpend(transactions),
    recurringMerchants: BehaviourEngine.getRecurringMerchants(transactions),
    largestExpense: BehaviourEngine.getLargestExpense(transactions),
    recentTransactions: BehaviourEngine.getRecentTransactions(5, transactions),
  };
}
