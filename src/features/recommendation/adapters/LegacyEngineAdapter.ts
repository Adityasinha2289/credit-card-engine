import type { IRecommendationEngineAdapter } from '../RecommendationEngineAdapter';
import type { RecommendationResult, UnifiedRecommendationRequest, SavingsProjection } from '../types';
import { recommendCards, type UserProfile, type RecommendedCard } from '../../finix/lib/recommendEngine';

export class LegacyEngineAdapter implements IRecommendationEngineAdapter {
  
  public recommend(request: UnifiedRecommendationRequest, limit: number): RecommendationResult[] {
    const profile = this.buildProfile(request);
    const legacyResults = recommendCards(profile, limit);

    return legacyResults.map(card => this.mapToCanonical(card));
  }

  public calculateSavings(request: UnifiedRecommendationRequest): SavingsProjection {
    // Legacy engine does not compute savings projection
    return {
      expectedSavings: 0,
      expectedRewardPoints: 0,
    };
  }

  private buildProfile(request: UnifiedRecommendationRequest): UserProfile {
    // Default fallback if a pure context request is passed to legacy engine
    if (request.userProfile) {
      return request.userProfile;
    }

    return {
      annualIncome: 500000,
      cibilScore: 750,
      topCategories: request.category ? [request.category] : ['other'],
      maxAnnualFee: 0,
      wantsLounge: false,
    };
  }

  private mapToCanonical(card: RecommendedCard): RecommendationResult {
    return {
      card: {
        id: card.id,
        name: card.name,
        issuer: card.bank,
        network: card.network,
        annualFee: card.annualFee,
        rewardRate: `${card.baseRewardRate}%`,
      },
      savings: {
        expectedSavings: 0,
        expectedRewardPoints: 0,
      },
      confidence: 1.0, // Legacy is deterministic heuristics
      matchScore: card.matchScore,
      matchPercent: card.matchPercent,
      reasoning: card.highlights || ['A solid match based on your profile.'],
      tradeoffs: {
        pros: card.highlights || [],
        cons: card.annualFee > 0 ? ['Has an annual fee'] : [],
      }
    };
  }
}
