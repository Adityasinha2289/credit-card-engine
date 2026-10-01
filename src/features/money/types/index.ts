export type TransactionType = 'PURCHASE' | 'REFUND' | 'TRANSFER' | 'CARD_PAYMENT' | 'CASH_WITHDRAWAL' | 'FEE' | 'INTEREST' | 'INCOME' | 'SUBSCRIPTION';

export type PaymentMethodType = 'BANK_UPI' | 'DEBIT_CARD' | 'CREDIT_CARD' | 'RUPAY_CREDIT_ON_UPI' | 'CASH';

export interface PaymentInstrument {
  id: string;
  type: PaymentMethodType;
  name: string;
  network?: string;
  linkedAccountId?: string;
  provider?: string;
  cardId?: string; // links to existing card data if it's a credit card
  creditLimit?: number;
  outstanding?: number;
  totalDue?: number;
  minimumDue?: number;
  dueDate?: string; // ISO
  statementDate?: string; // ISO
  availableLimit?: number;
  status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
  upiEnabled?: boolean;
  merchantOnly?: boolean;
}

export interface FinancialAccount {
  id: string;
  name: string;
  type: 'SAVINGS' | 'CURRENT' | 'CASH';
  balance: number;
}

export interface Transaction {
  id: string;
  date: string; // ISO
  merchant: string;
  merchantCategory?: string;
  amount: number;
  currency: string;
  type: TransactionType;
  paymentInstrumentId?: string;
  accountId?: string;
  direction: 'INFLOW' | 'OUTFLOW';
  source: 'DEMO' | 'LIVE';
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  isRecurring: boolean;
  notes?: string;
  category: string;
  subcategory?: string;
  merchantType: 'P2P' | 'P2M';
}

export interface Budget {
  id: string;
  category: string;
  limitAmount: number;
  spentAmount: number; // usually calculated, but can be stored
}

export interface Subscription {
  id: string;
  merchant: string;
  amount: number;
  frequency: 'MONTHLY' | 'ANNUALLY';
  nextExpectedDate: string;
  category: string;
  paymentInstrumentId?: string;
  status: 'ACTIVE' | 'CANCELLED';
  source: 'DEMO' | 'LIVE';
}

export interface SavingsGoal {
  id: string;
  goal: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  monthlyContribution: number;
}

export interface MoneyInsight {
  id: string;
  type: 'WARNING' | 'SUCCESS' | 'INFO';
  title: string;
  description: string;
  actionLabel?: string;
  actionUrl?: string;
}

export interface PaymentRecommendation {
  recommendedMethodId: string;
  alternativeMethodId?: string;
  reason: string;
  estimatedRewardValue?: number;
  estimatedDiscountValue?: number;
  feeImpact?: number;
  budgetImpact?: number;
  cashFlowImpact?: string;
  creditImpact?: string;
  warnings?: string[];
  eligibility: boolean;
  confidence: number;
  source: 'DEMO' | 'LIVE';
}
