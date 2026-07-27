import type { EvaluationReport } from './benchmarkTypes';

export class EvaluationDashboard {
  public static printConsoleReport(report: EvaluationReport): void {
    const m = report.metrics;

    console.log('');
    console.log('======================================');
    console.log('Recommendation Evaluation Report');
    console.log(`Scenarios              ${m.totalScenarios}`);
    console.log(`Top-1 Accuracy         ${m.top1Accuracy}%`);
    console.log(`Top-3 Accuracy         ${m.top3Accuracy}%`);
    console.log(`Average Confidence     ${m.averageConfidence}%`);
    console.log(`Average Savings        ₹${m.averageSavings}`);
    console.log(`Average Response       ${Math.round(m.averageExecutionTimeMs)}ms`);
    console.log(`Failures               ${m.failedScenarios}`);
    console.log('======================================');
    console.log('');

    if (report.qualityGatePassed) {
      console.log('🟢 QUALITY GATE PASSED: System quality meets all benchmarks.');
    } else {
      console.log('🔴 QUALITY GATE FAILED:');
      for (const failure of report.qualityGateFailures) {
        console.log(`   - ❌ ${failure}`);
      }
    }
    console.log('');
  }

  public static printDetailedBreakdown(report: EvaluationReport): void {
    const m = report.metrics;

    console.log('--- Category Breakdown ---');
    for (const [cat, catM] of Object.entries(m.categoryBreakdown)) {
      console.log(
        `  - [${cat.padEnd(12)}] Acc: ${String(catM.top1Accuracy + '%').padEnd(6)} | Avg Savings: ₹${String(catM.averageSavings).padEnd(5)} | Avg Time: ${catM.averageExecutionTimeMs}ms`
      );
    }
    console.log('');

    if (m.overRecommendedCards.length > 0) {
      console.log('--- Over-Recommended Cards ---');
      for (const card of m.overRecommendedCards.slice(0, 3)) {
        console.log(
          `  - ${card.cardName}: Recommended ${card.recommendedCount}x vs ${card.expectedCount}x expected (${card.overRecommendationRatio}x)`
        );
      }
      console.log('');
    }

    if (report.failedScenarios.length > 0) {
      console.log(`--- Failed Scenarios (${report.failedScenarios.length}) ---`);
      for (const fail of report.failedScenarios.slice(0, 5)) {
        console.log(`  - Scenario [${fail.scenarioId}]: ${fail.title}`);
        console.log(`    Expected: ${fail.expectedWinner} | Actual: ${fail.actualWinnerName}`);
        for (const r of fail.failureReasons) {
          console.log(`    Reason: ${r}`);
        }
      }
      console.log('');
    }
  }
}
