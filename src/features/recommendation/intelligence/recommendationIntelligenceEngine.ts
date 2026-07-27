import { CardRepository } from '../../card-intelligence/cardRepository';
import { RecommendationContextBuilder } from './recommendationContext';
import { ScoringEngine } from './scoringEngine';
import { RecommendationTraceLogger } from './recommendationTrace';
import type {
  RecommendationContextInput,
  RecommendationIntelligenceOutput,
  ScoringConfig,
} from './evaluationTypes';

export class RecommendationIntelligenceEngine {
  private scoringEngine: ScoringEngine;
  private cardRepo = CardRepository.getInstance();

  constructor(scoringConfig?: ScoringConfig) {
    this.scoringEngine = new ScoringEngine(scoringConfig);
  }

  public evaluateRecommendation(input: RecommendationContextInput): RecommendationIntelligenceOutput {
    const context = RecommendationContextBuilder.buildContext(input);
    const traceLogger = new RecommendationTraceLogger(input, context.mode);

    // Stage 1: Resolution Trace
    const stage1Start = Date.now();
    traceLogger.recordStage('Resolution & Context Building', Date.now() - stage1Start, {
      resolvedMerchant: context.resolvedMerchant.merchant?.name || 'Fallback',
      matchType: context.resolvedMerchant.matchType,
      applicableOffersCount: context.applicableOffers.length,
    });

    // Stage 2: Candidate Card Retrieval & Mode Filtering
    const stage2Start = Date.now();
    const allCards = this.cardRepo.getCards();
    let candidateCards = allCards;

    if (context.mode === 'wallet_optimisation' && context.ownedCardIds.size > 0) {
      candidateCards = allCards.filter((c) => context.ownedCardIds.has(c.id));
      if (candidateCards.length === 0) {
        candidateCards = allCards;
      }
    }

    traceLogger.recordStage('Candidate Retrieval', Date.now() - stage2Start, {
      totalCardsInCatalog: allCards.length,
      candidateCount: candidateCards.length,
      mode: context.mode,
    });

    // Stage 3: Multi-Factor Scoring
    const stage3Start = Date.now();
    const evaluatedCards = candidateCards.map((card) => {
      const isOwned = context.ownedCardIds.has(card.id);
      return this.scoringEngine.evaluateCard(
        card,
        context.amount,
        context.resolvedMerchant.inferredCategory,
        context.applicableOffers,
        isOwned,
        context.mode,
        context.userPrimaryGoal,
        context.resolvedMerchant.confidenceScore
      );
    });

    evaluatedCards.sort((a, b) => b.compositeScore - a.compositeScore);
    traceLogger.recordStage('Multi-Factor Scoring & Ranking', Date.now() - stage3Start, {
      topCardId: evaluatedCards[0]?.card.id,
      topCompositeScore: evaluatedCards[0]?.compositeScore,
    });

    const best = evaluatedCards[0];
    const alternatives = evaluatedCards.slice(1, 4).map((alt) => ({
      card: alt.card,
      compositeScore: alt.compositeScore,
      expectedSavings: alt.expectedSavings,
      humanReasoning: alt.humanReasoning,
    }));

    const trace = traceLogger.finalize();

    return {
      traceId: trace.traceId,
      mode: context.mode,
      bestCard: best.card,
      compositeScore: best.compositeScore,
      confidence: context.resolvedMerchant.confidenceScore,
      expectedSavings: best.expectedSavings,
      expectedRewardPoints: best.expectedRewardPoints,
      appliedOffer: best.appliedOffer,
      humanReasoning: best.humanReasoning,
      structuredFactors: best.structuredFactors,
      alternatives,
      trace,
    };
  }
}
