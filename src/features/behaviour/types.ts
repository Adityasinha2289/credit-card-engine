import type { TransactionCategory } from '../dashboard/types/dashboard.types';

export type PaymentMethod = 'credit_card' | 'upi' | 'debit_card' | 'net_banking' | 'wallet';

export interface BehaviourTransaction {
  id: string;
  amount: number;
  category: TransactionCategory;
  merchant: string;
  paymentMethod: PaymentMethod;
  date: string;
  cardId?: string;
  isRecurring?: boolean;
}

export type InsightType = 'increase' | 'low' | 'recurring' | 'top_category' | 'underutilized_card';

export interface FinancialInsight {
  id: string;
  type: InsightType;
  title: string;
  description: string;
  category?: TransactionCategory;
  actionableText?: string;
  impactScore?: number;
}

export interface CategorySpendSummary {
  category: TransactionCategory;
  totalAmount: number;
  transactionCount: number;
  percentageOfTotal: number;
}
