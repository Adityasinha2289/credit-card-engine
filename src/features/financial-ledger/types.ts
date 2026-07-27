import type { TransactionCategory } from '../dashboard/types/dashboard.types';

export type LedgerEntryType = 'recommendation' | 'taqdeer_decision' | 'merchant_offer' | 'manual_action';
export type LedgerEntryStatus = 'completed' | 'pending' | 'dismissed';
export type LedgerSource = 'rule_engine' | 'taqdeer' | 'user_action';

export interface LedgerEntry {
  id: string;
  timestamp: string;
  type: LedgerEntryType;
  status: LedgerEntryStatus;
  merchant?: string;
  card?: string;
  category: TransactionCategory;
  recommendationId?: string;
  taqdeerDecisionId?: string;
  estimatedSavings: number;
  estimatedRewards: number;
  explanation: string;
  source: LedgerSource;
  metadata?: Record<string, unknown>;
}

export interface LedgerSummary {
  totalSavings: number;
  totalRewards: number;
  totalTransactions: number;
  monthlySavings: number;
  monthlyRewards: number;
  bestDecision?: string;
  favouriteMerchant?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface LedgerDataSource {
  getEntries(): Promise<LedgerEntry[]> | LedgerEntry[];
  addEntry(entry: Omit<LedgerEntry, 'id' | 'timestamp'>): Promise<LedgerEntry> | LedgerEntry;
}
