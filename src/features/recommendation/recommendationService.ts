import { RecommendationEngine } from './recommendationEngine';
import type { RecommendationInput, RecommendationOutput } from './recommendationTypes';

export class RecommendationService {
  private static instance: RecommendationService;

  public static getInstance(): RecommendationService {
    if (!RecommendationService.instance) {
      RecommendationService.instance = new RecommendationService();
    }
    return RecommendationService.instance;
  }

  public getRecommendation(input: RecommendationInput): RecommendationOutput {
    return RecommendationEngine.getBestCardRecommendation(input);
  }
}

/**
 * React hook wrapper for Recommendation Engine V1
 */
export function useRecommendationService() {
  const service = RecommendationService.getInstance();
  return {
    getRecommendation: service.getRecommendation.bind(service),
  };
}
