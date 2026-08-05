import type { IRecommendationEngineAdapter } from './RecommendationEngineAdapter';
import type { RecommendationResult, UnifiedRecommendationRequest, SavingsProjection } from './types';
import { LegacyEngineAdapter } from './adapters/LegacyEngineAdapter';
import { IntelligenceEngineAdapter } from './adapters/IntelligenceEngineAdapter';
import type { UserProfile, RecommendedCard } from '../finix/lib/recommendEngine';
import type { FinixCard } from '../finix/data/cardDataset';
import type { RecommendationInput, RecommendationOutput } from './recommendationTypes';
import { RecommendationEngine } from './recommendationEngine';

// --- FEATURE FLAG ---
export const USE_INTELLIGENCE_ENGINE = true;

export class RecommendationService {
  private static instance: RecommendationService;
  private adapter: IRecommendationEngineAdapter;

  private constructor() {
    this.adapter = USE_INTELLIGENCE_ENGINE 
      ? new IntelligenceEngineAdapter() 
      : new LegacyEngineAdapter();
  }

  public static getInstance(): RecommendationService {
    if (!RecommendationService.instance) {
      RecommendationService.instance = new RecommendationService();
    }
    return RecommendationService.instance;
  }

  // --- CANONICAL API ---
  public recommend(request: UnifiedRecommendationRequest, limit: number = 5): RecommendationResult[] {
    return this.adapter.recommend(request, limit);
  }

  public calculateSavings(request: UnifiedRecommendationRequest): SavingsProjection {
    return this.adapter.calculateSavings(request);
  }
  
  public compareCards(): void {}
  public rankCards(): void {}
  public explainRecommendation(): void {}

  // --- COMPATIBILITY WRAPPERS FOR REACT UI ---
  // The UI currently expects RecommendedCard from recommendEngine
  public legacyRecommend(profile: UserProfile, limit: number = 5): RecommendedCard[] {
    const request: UnifiedRecommendationRequest = {
      userProfile: profile
    };
    
    const results = this.recommend(request, limit);
    
    // Map canonical back to the FinixCard/RecommendedCard format the UI expects
    return results.map(r => ({
      id: r.card.id,
      name: r.card.name,
      bank: r.card.issuer,
      network: r.card.network as FinixCard['network'],
      annualFee: r.card.annualFee,
      minIncome: 0,
      minCibil: 0,
      baseRewardRate: 1, // Fallbacks for fields the UI uses
      rewards: [],
      highlights: r.reasoning,
      matchScore: r.matchScore,
      matchPercent: r.matchPercent
    }));
  }

  // Preserve the V1 hook wrapper logic that existed previously to not break old UI
  public getRecommendation(input: RecommendationInput): RecommendationOutput {
    return RecommendationEngine.getBestCardRecommendation(input);
  }
}

export function useRecommendationService() {
  const service = RecommendationService.getInstance();
  return {
    getRecommendation: service.getRecommendation.bind(service),
  };
}
