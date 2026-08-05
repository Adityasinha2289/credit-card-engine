import type { IRecommendationEngineAdapter } from '../RecommendationEngineAdapter';
import type { RecommendationResult, UnifiedRecommendationRequest, SavingsProjection } from '../types';
import { RecommendationIntelligenceEngine } from '../../recommendation/intelligence/recommendationIntelligenceEngine';
import type { RecommendationContextInput, RecommendationIntelligenceOutput } from '../../recommendation/intelligence/evaluationTypes';

export class IntelligenceEngineAdapter implements IRecommendationEngineAdapter {
  private engine = new RecommendationIntelligenceEngine();

  public recommend(request: UnifiedRecommendationRequest, limit: number): RecommendationResult[] {
    const context = this.buildContext(request);
    
    // The intelligence engine evaluates a single context (like a merchant checkout)
    // and returns the best card + alternatives.
    const output = this.engine.evaluateRecommendation(context);
    
    const results: RecommendationResult[] = [];
    
    // Push the primary winner
    results.push(this.mapToCanonical(output));
    
    // Push the alternatives up to the limit
    for (let i = 0; i < limit - 1 && i < output.alternatives.length; i++) {
      const alt = output.alternatives[i];
      // Normalize alternative to look like output for mapping
      const altOutput: RecommendationIntelligenceOutput = {
        ...output,
        bestCard: alt.card,
        compositeScore: alt.compositeScore,
        expectedSavings: alt.expectedSavings,
        expectedRewardPoints: 0, // Approx
        humanReasoning: alt.humanReasoning,
      };
      results.push(this.mapToCanonical(altOutput, output.compositeScore));
    }

    return results;
  }

  public calculateSavings(request: UnifiedRecommendationRequest): SavingsProjection {
    const context = this.buildContext(request);
    const output = this.engine.evaluateRecommendation(context);
    return {
      expectedSavings: output.expectedSavings,
      expectedRewardPoints: output.expectedRewardPoints,
      appliedOffer: output.appliedOffer,
    };
  }

  private buildContext(request: UnifiedRecommendationRequest): RecommendationContextInput {
    return {
      merchant: request.merchant || 'General',
      amount: request.amount || 10000,
      category: request.category || 'other',
      ownedCardIds: request.ownedCardIds || [],
      userSalary: request.userProfile?.annualIncome || 500000,
    };
  }

  private mapToCanonical(output: RecommendationIntelligenceOutput, maxScore?: number): RecommendationResult {
    const topScore = maxScore || output.compositeScore;
    const matchPercent = topScore > 0 ? Math.round((output.compositeScore / topScore) * 100) : 0;
    
    return {
      card: {
        id: output.bestCard.id,
        name: output.bestCard.cardName,
        issuer: output.bestCard.issuer,
        network: output.bestCard.network,
        annualFee: output.bestCard.annualFee,
        rewardRate: output.bestCard.rewardRate,
      },
      savings: {
        expectedSavings: output.expectedSavings,
        expectedRewardPoints: output.expectedRewardPoints,
        appliedOffer: output.appliedOffer,
      },
      confidence: output.confidence || 0.9,
      matchScore: output.compositeScore,
      matchPercent: matchPercent > 100 ? 100 : matchPercent,
      reasoning: output.humanReasoning,
      tradeoffs: {
        pros: output.structuredFactors?.filter(f => f.weightedContribution > 0).map(f => f.description) || [],
        cons: output.structuredFactors?.filter(f => f.weightedContribution < 0).map(f => f.description) || [],
      }
    };
  }
}
