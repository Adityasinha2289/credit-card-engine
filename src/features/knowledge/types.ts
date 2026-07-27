import type { TransactionCategory } from '../dashboard/types/dashboard.types';

export type KnowledgeCategory =
  | TransactionCategory
  | 'credit_health'
  | 'fee_waiver'
  | 'general';

export type RuleSourceType =
  | 'rbi_policy'
  | 'bank_terms'
  | 'renocred_expert'
  | 'ai_reasoning';

export interface KnowledgeRule {
  id: string;
  title: string;
  category: KnowledgeCategory;
  condition: string;
  outcome: string;
  explanation: string;
  why: string;
  source: RuleSourceType;
  confidence: number;
  tags: string[];
  priority: 'high' | 'medium' | 'low';
  active: boolean;
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  summary: string;
  body: string;
  category: KnowledgeCategory;
  relatedCards: string[];
  relatedMerchants: string[];
  relatedCategories: TransactionCategory[];
}

export interface KnowledgeDataSource {
  getRules(): Promise<KnowledgeRule[]> | KnowledgeRule[];
  getArticles(): Promise<KnowledgeArticle[]> | KnowledgeArticle[];
}
