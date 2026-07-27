export const DECISION_PRIORITIES = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
} as const;

export type DecisionPriority = typeof DECISION_PRIORITIES[keyof typeof DECISION_PRIORITIES];

export const DECISION_CATEGORIES = {
  TRAVEL: 'travel',
  CASHBACK: 'cashback',
  CREDIT: 'credit',
  SAVINGS: 'savings',
  REWARDS: 'rewards',
  PROFILE: 'profile',
} as const;

export type DecisionCategory = typeof DECISION_CATEGORIES[keyof typeof DECISION_CATEGORIES];

export const TIME_FRAMES = {
  TODAY: 'today',
  THIS_WEEK: 'this_week',
  THIS_MONTH: 'this_month',
} as const;

export type TimeFrame = typeof TIME_FRAMES[keyof typeof TIME_FRAMES];

export interface EstimatedImpact {
  savings?: number;
  rewards?: number;
  timeFrame: TimeFrame;
}

export interface TaqdeerDecision {
  id: string;
  title: string;
  summary: string;
  explanation: string;
  confidence: number;
  priority: DecisionPriority;
  category: DecisionCategory;
  estimatedImpact: EstimatedImpact;
  evidence: string[];
  sourceRecommendations: string[];
}

export interface DecisionReasoningProvider {
  name: string;
  evaluate(context: { persona: any; behaviour: any; recommendations: any[] }): TaqdeerDecision[];
}
