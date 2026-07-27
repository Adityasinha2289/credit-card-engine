import * as fs from 'fs';
import * as path from 'path';
import type { EvaluationReport } from './benchmarkTypes';

export class EvaluationReporter {
  public static saveReports(report: EvaluationReport, outputDir?: string): { jsonPath: string; mdPath: string } {
    const dir = outputDir || path.resolve(process.cwd(), 'reports');

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const jsonPath = path.join(dir, 'recommendation-evaluation.json');
    const mdPath = path.join(dir, 'recommendation-evaluation.md');

    // 1. Save JSON Report
    fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2), 'utf-8');

    // 2. Save Markdown Report
    const mdContent = this.generateMarkdownReport(report);
    fs.writeFileSync(mdPath, mdContent, 'utf-8');

    // Also update previous report for future regression comparisons
    const previousPath = path.join(dir, 'recommendation-evaluation-previous.json');
    if (!fs.existsSync(previousPath)) {
      fs.writeFileSync(previousPath, JSON.stringify(report, null, 2), 'utf-8');
    }

    return { jsonPath, mdPath };
  }

  public static generateMarkdownReport(report: EvaluationReport): string {
    const m = report.metrics;
    const reg = report.regression;
    const gateStatus = report.qualityGatePassed
      ? '> [!NOTE]\n> **QUALITY GATE PASSED**: All recommendation quality and performance thresholds met successfully.'
      : `> [!CAUTION]\n> **QUALITY GATE FAILED**: ${report.qualityGateFailures.join('; ')}`;

    let md = `# RenoCred Recommendation Evaluation Report\n\n`;
    md += `**Timestamp**: ${report.timestamp}  \n`;
    md += `**Total Scenarios Evaluated**: ${report.scenariosCount}  \n`;
    md += `**Quality Gate**: ${report.qualityGatePassed ? '🟢 PASSED' : '🔴 FAILED'}  \n\n`;

    md += `${gateStatus}\n\n`;

    md += `## Executive Summary\n\n`;
    md += `${report.summary}\n\n`;

    md += `## Core Quality Metrics\n\n`;
    md += `| Metric | Value | Target / Benchmark |\n`;
    md += `| :--- | :---: | :---: |\n`;
    md += `| **Top-1 Accuracy** | **${m.top1Accuracy}%** | ≥ 90.0% |\n`;
    md += `| **Top-3 Accuracy** | **${m.top3Accuracy}%** | ≥ 95.0% |\n`;
    md += `| **Average Confidence** | **${m.averageConfidence}%** | ≥ 80.0% |\n`;
    md += `| **Average Savings** | **₹${m.averageSavings}** | N/A |\n`;
    md += `| **Average Response Time** | **${m.averageExecutionTimeMs} ms** | < 50 ms |\n`;
    md += `| **Merchant Resolution Accuracy** | **${m.merchantResolutionAccuracy}%** | 100.0% |\n`;
    md += `| **Offer Resolution Accuracy** | **${m.offerResolutionAccuracy}%** | ≥ 90.0% |\n`;
    md += `| **Category Accuracy** | **${m.categoryAccuracy}%** | 100.0% |\n`;
    md += `| **False Recommendation Count** | **${m.falseRecommendationCount}** | 0 |\n`;
    md += `| **Confidence Calibration Error** | **${m.confidenceCalibration}** | Lower is better |\n\n`;

    if (reg) {
      md += `## Regression Analysis\n\n`;
      md += `| Status | Scenario Count | Details |\n`;
      md += `| :--- | :---: | :--- |\n`;
      md += `| **Improved** | ${reg.improvedScenarios.length} | Scenarios passing that previously failed |\n`;
      md += `| **Regressed** | ${reg.regressedScenarios.length} | Scenarios failing that previously passed |\n`;
      md += `| **Unchanged** | ${reg.unchangedScenarios.length} | Scenarios with identical pass/fail status |\n\n`;

      md += `### Metric Deltas vs Previous Run\n`;
      md += `- **Top-1 Accuracy Delta**: \`${reg.metricDeltas.top1AccuracyDelta >= 0 ? '+' : ''}${reg.metricDeltas.top1AccuracyDelta}%\`\n`;
      md += `- **Top-3 Accuracy Delta**: \`${reg.metricDeltas.top3AccuracyDelta >= 0 ? '+' : ''}${reg.metricDeltas.top3AccuracyDelta}%\`\n`;
      md += `- **Average Confidence Delta**: \`${reg.metricDeltas.averageConfidenceDelta >= 0 ? '+' : ''}${reg.metricDeltas.averageConfidenceDelta}%\`\n`;
      md += `- **Average Savings Delta**: \`${reg.metricDeltas.averageSavingsDelta >= 0 ? '+' : ''}₹${reg.metricDeltas.averageSavingsDelta}\`\n`;
      md += `- **Average Response Time Delta**: \`${reg.metricDeltas.averageExecutionTimeDelta >= 0 ? '+' : ''}${reg.metricDeltas.averageExecutionTimeDelta} ms\`\n\n`;
    }

    md += `## Category Performance & Leaderboard\n\n`;
    md += `| Category | Scenarios | Passed | Top-1 Acc | Top-3 Acc | Avg Conf | Avg Savings | Avg Time |\n`;
    md += `| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |\n`;
    for (const [cat, catM] of Object.entries(m.categoryBreakdown)) {
      md += `| \`${cat}\` | ${catM.totalScenarios} | ${catM.passedScenarios} | ${catM.top1Accuracy}% | ${catM.top3Accuracy}% | ${catM.averageConfidence}% | ₹${catM.averageSavings} | ${catM.averageExecutionTimeMs} ms |\n`;
    }
    md += `\n`;

    md += `## Confidence Distribution\n\n`;
    md += `| Confidence Range | Scenario Count | Percentage |\n`;
    md += `| :--- | :---: | :---: |\n`;
    for (const [range, count] of Object.entries(m.confidenceDistribution)) {
      const pct = parseFloat(((count / m.totalScenarios) * 100).toFixed(1));
      md += `| ${range} | ${count} | ${pct}% |\n`;
    }
    md += `\n`;

    if (m.overRecommendedCards.length > 0) {
      md += `## Over-Recommended Cards\n\n`;
      md += `| Card Name | Actual Recs | Expected Recs | Share % | Over-Recommendation Ratio |\n`;
      md += `| :--- | :---: | :---: | :---: | :---: |\n`;
      for (const card of m.overRecommendedCards) {
        md += `| **${card.cardName}** | ${card.recommendedCount} | ${card.expectedCount} | ${card.recommendationPercentage}% | ${card.overRecommendationRatio}× |\n`;
      }
      md += `\n`;
    }

    if (m.poorQualityMerchants.length > 0) {
      md += `## Merchants with Poor Recommendation Quality (<80% Accuracy)\n\n`;
      md += `| Merchant | Scenario Count | Passed | Accuracy |\n`;
      md += `| :--- | :---: | :---: | :---: |\n`;
      for (const merch of m.poorQualityMerchants) {
        md += `| **${merch.merchantName}** | ${merch.scenarioCount} | ${merch.passedCount} | ${merch.accuracy}% |\n`;
      }
      md += `\n`;
    }

    md += `## Slowest Requests (Top 5)\n\n`;
    md += `| Scenario ID | Merchant | Amount | Execution Time |\n`;
    md += `| :--- | :--- | :---: | :---: |\n`;
    for (const slow of report.slowestRequests) {
      md += `| \`${slow.scenarioId}\` | ${slow.merchantInput} | ₹${slow.amount} | **${slow.executionTimeMs} ms** |\n`;
    }
    md += `\n`;

    if (report.failedScenarios.length > 0) {
      md += `## Failed Scenarios Breakdown\n\n`;
      for (const fail of report.failedScenarios) {
        md += `### Scenario \`${fail.scenarioId}\`: ${fail.title}\n`;
        md += `- **Merchant**: ${fail.merchantInput} | **Amount**: ₹${fail.amount} | **Category**: \`${fail.category}\`\n`;
        md += `- **Expected Winner**: **${fail.expectedWinner}** | **Actual Winner**: **${fail.actualWinnerName} (${fail.actualWinnerId})**\n`;
        md += `- **Expected Savings**: ₹${fail.expectedSavings} | **Actual Savings**: ₹${fail.actualSavings}\n`;
        md += `- **Confidence**: ${fail.confidence}% (Min Required: ${fail.minimumConfidence}%)\n`;
        md += `- **Failure Reasons**:\n`;
        for (const r of fail.failureReasons) {
          md += `  - ❌ ${r}\n`;
        }
        md += `\n`;
      }
    } else {
      md += `## Failed Scenarios Breakdown\n\n`;
      md += `🎉 **Zero Failed Scenarios! All benchmark tests passed.**\n\n`;
    }

    md += `## Recommendations for Quality Improvement\n\n`;
    for (const rec of report.recommendations) {
      md += `- 💡 ${rec}\n`;
    }
    md += `\n`;

    return md;
  }
}
