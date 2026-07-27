export type RecommendationCategory =
  | 'credit_card'
  | 'cashback'
  | 'travel'
  | 'rewards'
  | 'savings'
  | 'credit_score';

export type PriorityLevel = 'high' | 'medium' | 'low';

export type RecommendationSource = 'rule_engine' | 'ai_reasoning' | 'partner_bank';

export interface FinancialRecommendation {
  id: string;
  title: string;
  description: string;
  reason: string;
  confidence: number;
  priority: PriorityLevel;
  category: RecommendationCategory;
  cta: string;
  dismissible: boolean;
  source: RecommendationSource;
}

export interface RecommendationProvider {
  name: string;
  evaluate(context: { persona: any; behaviour: any }): FinancialRecommendation[];
}
