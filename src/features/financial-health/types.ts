export type FinancialHealthGrade = 'A+' | 'A' | 'B' | 'C' | 'D';

export interface ScoreBreakdown {
  category: string;
  weight: number;
  score: number;
  explanation: string;
  improvementSuggestion: string;
}

export interface FinancialHealthModel {
  score: number;
  grade: FinancialHealthGrade;
  strengths: string[];
  improvements: string[];
  insights: string[];
  confidence: number;
  lastCalculated: string;
  scoreTimestamp: string;
  scoreBreakdown: ScoreBreakdown[];
}

export interface HealthScoreHistoryItem {
  timestamp: string;
  score: number;
  grade: FinancialHealthGrade;
}
