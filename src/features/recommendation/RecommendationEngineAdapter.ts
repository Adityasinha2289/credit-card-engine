import type { RecommendationResult, UnifiedRecommendationRequest, SavingsProjection } from './types';

export interface IRecommendationEngineAdapter {
  recommend(request: UnifiedRecommendationRequest, limit: number): RecommendationResult[];
  calculateSavings(request: UnifiedRecommendationRequest): SavingsProjection;
}
