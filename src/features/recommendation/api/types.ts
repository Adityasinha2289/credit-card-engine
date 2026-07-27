import type { AlternativeRecommendation } from '../recommendationTypes';
import type { CreditCardIntelligence } from '../../card-intelligence/types';

export interface RecommendationApiRequest {
  merchant: string;
  amount: number;
  userId?: string;
  transactionDate?: string;
}

export interface ApiSuccessResponse {
  success: true;
  requestId: string;
  recommendation: {
    bestCard: CreditCardIntelligence;
    expectedReward: number;
    expectedSavings: number;
  };
  confidence: number;
  reasoning: string[];
  alternatives: AlternativeRecommendation[];
  executionTimeMs: number;
  timestamp: string;
}

export interface ApiErrorDetail {
  field?: string;
  message: string;
}

export interface ApiErrorResponse {
  success: false;
  requestId: string;
  error: {
    code: string;
    message: string;
    details?: ApiErrorDetail[];
  };
  executionTimeMs: number;
  timestamp: string;
}

export type ApiResponse = ApiSuccessResponse | ApiErrorResponse;
