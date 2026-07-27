import type {
  ScenarioExecutionResult,
  EvaluationMetrics,
  CategoryMetrics,
  OverRecommendedCard,
  PoorQualityMerchant,
} from './benchmarkTypes';

export class MetricsCalculator {
  public static calculateMetrics(results: ScenarioExecutionResult[]): EvaluationMetrics {
    const totalScenarios = results.length;
    if (totalScenarios === 0) {
      return this.emptyMetrics();
    }

    let top1Matches = 0;
    let top3Matches = 0;
    let totalConfidence = 0;
    let totalSavings = 0;
    let totalTimeMs = 0;
    let merchantResolvedCount = 0;
    let offerResolvedCount = 0;
    let categoryMatchedCount = 0;
    let falseRecCount = 0;

    const categoryGroups: Record<string, ScenarioExecutionResult[]> = {};
    const actualCardDist: Record<string, number> = {};
    const expectedCardDist: Record<string, number> = {};
    const merchantGroups: Record<string, ScenarioExecutionResult[]> = {};
    const confusionMatrix: Record<string, Record<string, number>> = {};
    const confidenceBuckets: Record<string, number> = {
      '90-100%': 0,
      '80-89%': 0,
      '70-79%': 0,
      '60-69%': 0,
      '<60%': 0,
    };

    for (const res of results) {
      if (res.top1Match) top1Matches++;
      if (res.top3Match) top3Matches++;
      totalConfidence += res.confidence;
      totalSavings += res.actualSavings;
      totalTimeMs += res.executionTimeMs;

      if (res.merchantResolved) merchantResolvedCount++;
      if (res.offerResolved) offerResolvedCount++;
      if (res.categoryMatched) categoryMatchedCount++;
      if (!res.passed) falseRecCount++;

      // Confidence buckets
      if (res.confidence >= 90) confidenceBuckets['90-100%']++;
      else if (res.confidence >= 80) confidenceBuckets['80-89%']++;
      else if (res.confidence >= 70) confidenceBuckets['70-79%']++;
      else if (res.confidence >= 60) confidenceBuckets['60-69%']++;
      else confidenceBuckets['<60%']++;

      // Category grouping
      const cat = res.category || 'general';
      if (!categoryGroups[cat]) categoryGroups[cat] = [];
      categoryGroups[cat].push(res);

      // Card distribution
      const winner = res.actualWinnerName || res.actualWinnerId;
      actualCardDist[winner] = (actualCardDist[winner] || 0) + 1;

      const expected = res.expectedWinner;
      expectedCardDist[expected] = (expectedCardDist[expected] || 0) + 1;

      // Merchant grouping
      const mName = res.merchantInput || 'Unknown';
      if (!merchantGroups[mName]) merchantGroups[mName] = [];
      merchantGroups[mName].push(res);

      // Confusion matrix
      if (!confusionMatrix[expected]) confusionMatrix[expected] = {};
      confusionMatrix[expected][winner] = (confusionMatrix[expected][winner] || 0) + 1;
    }

    // Top-1 & Top-3 Accuracy
    const top1Accuracy = parseFloat(((top1Matches / totalScenarios) * 100).toFixed(1));
    const top3Accuracy = parseFloat(((top3Matches / totalScenarios) * 100).toFixed(1));

    // Averages
    const averageConfidence = parseFloat((totalConfidence / totalScenarios).toFixed(1));
    const averageSavings = Math.round(totalSavings / totalScenarios);
    const averageExecutionTimeMs = parseFloat((totalTimeMs / totalScenarios).toFixed(2));

    const merchantResolutionAccuracy = parseFloat(
      ((merchantResolvedCount / totalScenarios) * 100).toFixed(1)
    );
    const offerResolutionAccuracy = parseFloat(
      ((offerResolvedCount / totalScenarios) * 100).toFixed(1)
    );
    const categoryAccuracy = parseFloat(
      ((categoryMatchedCount / totalScenarios) * 100).toFixed(1)
    );

    // Confidence calibration score: MAE between confidence% and actual outcome (100 if top1Match, else 0)
    let calibrationErrorSum = 0;
    for (const res of results) {
      const outcomeScore = res.top1Match ? 100 : 0;
      calibrationErrorSum += Math.abs(res.confidence - outcomeScore);
    }
    const confidenceCalibration = parseFloat(
      (calibrationErrorSum / totalScenarios).toFixed(2)
    );

    // Per-Category Breakdown
    const categoryBreakdown: Record<string, CategoryMetrics> = {};
    for (const [cat, group] of Object.entries(categoryGroups)) {
      const catTotal = group.length;
      const catPassed = group.filter((g) => g.passed).length;
      const catTop1 = group.filter((g) => g.top1Match).length;
      const catTop3 = group.filter((g) => g.top3Match).length;
      const catConfSum = group.reduce((sum, g) => sum + g.confidence, 0);
      const catSavSum = group.reduce((sum, g) => sum + g.actualSavings, 0);
      const catTimeSum = group.reduce((sum, g) => sum + g.executionTimeMs, 0);

      categoryBreakdown[cat] = {
        totalScenarios: catTotal,
        passedScenarios: catPassed,
        top1Accuracy: parseFloat(((catTop1 / catTotal) * 100).toFixed(1)),
        top3Accuracy: parseFloat(((catTop3 / catTotal) * 100).toFixed(1)),
        averageConfidence: parseFloat((catConfSum / catTotal).toFixed(1)),
        averageSavings: Math.round(catSavSum / catTotal),
        averageExecutionTimeMs: parseFloat((catTimeSum / catTotal).toFixed(2)),
      };
    }

    // Over-Recommended Cards
    const overRecommendedCards: OverRecommendedCard[] = [];
    for (const [cardName, actualCount] of Object.entries(actualCardDist)) {
      const expCount = expectedCardDist[cardName] || 0;
      const recPct = parseFloat(((actualCount / totalScenarios) * 100).toFixed(1));
      const ratio = expCount > 0 ? parseFloat((actualCount / expCount).toFixed(2)) : actualCount;

      if (actualCount > expCount && ratio > 1.25) {
        overRecommendedCards.push({
          cardId: cardName,
          cardName,
          recommendedCount: actualCount,
          expectedCount: expCount,
          recommendationPercentage: recPct,
          overRecommendationRatio: ratio,
        });
      }
    }
    overRecommendedCards.sort((a, b) => b.overRecommendationRatio - a.overRecommendationRatio);

    // Poor Quality Merchants (<80% accuracy)
    const poorQualityMerchants: PoorQualityMerchant[] = [];
    for (const [mName, group] of Object.entries(merchantGroups)) {
      const mTotal = group.length;
      const mPassed = group.filter((g) => g.top1Match).length;
      const acc = parseFloat(((mPassed / mTotal) * 100).toFixed(1));
      if (acc < 80) {
        poorQualityMerchants.push({
          merchantName: mName,
          scenarioCount: mTotal,
          passedCount: mPassed,
          accuracy: acc,
        });
      }
    }
    poorQualityMerchants.sort((a, b) => a.accuracy - b.accuracy);

    return {
      totalScenarios,
      passedScenarios: totalScenarios - falseRecCount,
      failedScenarios: falseRecCount,
      top1Accuracy,
      top3Accuracy,
      averageConfidence,
      averageSavings,
      averageExecutionTimeMs,
      merchantResolutionAccuracy,
      offerResolutionAccuracy,
      categoryAccuracy,
      falseRecommendationCount: falseRecCount,
      confidenceCalibration,
      categoryBreakdown,
      cardRecommendationDistribution: actualCardDist,
      expectedCardDistribution: expectedCardDist,
      overRecommendedCards,
      poorQualityMerchants,
      confidenceDistribution: confidenceBuckets,
      confusionMatrix,
    };
  }

  private static emptyMetrics(): EvaluationMetrics {
    return {
      totalScenarios: 0,
      passedScenarios: 0,
      failedScenarios: 0,
      top1Accuracy: 0,
      top3Accuracy: 0,
      averageConfidence: 0,
      averageSavings: 0,
      averageExecutionTimeMs: 0,
      merchantResolutionAccuracy: 0,
      offerResolutionAccuracy: 0,
      categoryAccuracy: 0,
      falseRecommendationCount: 0,
      confidenceCalibration: 0,
      categoryBreakdown: {},
      cardRecommendationDistribution: {},
      expectedCardDistribution: {},
      overRecommendedCards: [],
      poorQualityMerchants: [],
      confidenceDistribution: {},
      confusionMatrix: {},
    };
  }
}
