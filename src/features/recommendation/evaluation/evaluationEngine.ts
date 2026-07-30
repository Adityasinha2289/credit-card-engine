import * as fs from 'fs';
import * as path from 'path';
import { BenchmarkLoader } from './benchmarkLoader';
import { ScenarioValidator } from './scenarioValidator';
import { BenchmarkRunner } from './benchmarkRunner';
import { MetricsCalculator } from './metricsCalculator';
import type {
  BenchmarkScenario,
  ScenarioExecutionResult,
  EvaluationMetrics,
  RegressionResult,
  QualityGateConfig,
  EvaluationReport,
} from './benchmarkTypes';

export interface EvaluationEngineOptions {
  benchmarkPath?: string;
  previousReportPath?: string;
  qualityGateConfig?: Partial<QualityGateConfig>;
}

export const DEFAULT_QUALITY_GATE_CONFIG: QualityGateConfig = {
  minTop1Accuracy: 90, // 90%
  minAverageConfidence: 80, // 80%
  maxAllowedRegression: 5, // 5% max drop
  maxAverageResponseTimeMs: 50, // 50ms max avg execution time
};

export class EvaluationEngine {
  private runner: BenchmarkRunner;

  constructor() {
    this.runner = new BenchmarkRunner();
  }

  public async runEvaluation(options: EvaluationEngineOptions = {}): Promise<EvaluationReport> {
    const benchmarkPath = options.benchmarkPath;
    const scenarios: BenchmarkScenario[] = BenchmarkLoader.loadBenchmarks(benchmarkPath);

    // 1. Validate Scenarios
    const validationSummary = ScenarioValidator.validateDataset(scenarios);
    if (!validationSummary.valid) {
      console.warn(
        `[EvaluationEngine] Scenario dataset validation warning: Found ${validationSummary.errors.length} errors and ${validationSummary.warnings.length} warnings.`
      );
    }

    // 2. Run Benchmark Scenarios
    const results: ScenarioExecutionResult[] = this.runner.runAllScenarios(scenarios);

    // 3. Compute Metrics
    const metrics: EvaluationMetrics = MetricsCalculator.calculateMetrics(results);

    // 4. Load Previous Report & Run Regression Analysis
    const previousReportPath =
      options.previousReportPath ||
      path.resolve(process.cwd(), 'reports', 'recommendation-evaluation-previous.json');
    
    let previousReport: EvaluationReport | undefined;
    if (fs.existsSync(previousReportPath)) {
      try {
        previousReport = JSON.parse(fs.readFileSync(previousReportPath, 'utf-8'));
      } catch {
        previousReport = undefined;
      }
    } else {
      // Check current report if previous doesn't exist
      const currentReportPath = path.resolve(process.cwd(), 'reports', 'recommendation-evaluation.json');
      if (fs.existsSync(currentReportPath)) {
        try {
          previousReport = JSON.parse(fs.readFileSync(currentReportPath, 'utf-8'));
        } catch {
          previousReport = undefined;
        }
      }
    }

    const regression = this.detectRegression(results, metrics, previousReport);

    // 5. Check Quality Gate Thresholds
    const gateConfig = { ...DEFAULT_QUALITY_GATE_CONFIG, ...options.qualityGateConfig };
    const gateFailures: string[] = [];

    if (metrics.top1Accuracy < gateConfig.minTop1Accuracy) {
      gateFailures.push(
        `Top-1 Accuracy (${metrics.top1Accuracy}%) is below configured threshold (${gateConfig.minTop1Accuracy}%)`
      );
    }

    if (metrics.averageConfidence < gateConfig.minAverageConfidence) {
      gateFailures.push(
        `Average Confidence (${metrics.averageConfidence}%) is below configured threshold (${gateConfig.minAverageConfidence}%)`
      );
    }

    if (regression.hasRegression && regression.metricDeltas.top1AccuracyDelta < -gateConfig.maxAllowedRegression) {
      gateFailures.push(
        `Regression exceeds threshold: Top-1 Accuracy dropped by ${Math.abs(regression.metricDeltas.top1AccuracyDelta)}% (max allowed: ${gateConfig.maxAllowedRegression}%)`
      );
    }

    if (metrics.averageExecutionTimeMs > gateConfig.maxAverageResponseTimeMs) {
      gateFailures.push(
        `Average Response Time (${metrics.averageExecutionTimeMs}ms) exceeds threshold (${gateConfig.maxAverageResponseTimeMs}ms)`
      );
    }

    const qualityGatePassed = gateFailures.length === 0;

    // 6. Collect Failed & Slowest Requests
    const failedScenarios = results.filter((r) => !r.passed);
    const sortedByTime = [...results].sort((a, b) => b.executionTimeMs - a.executionTimeMs);
    const slowestRequests = sortedByTime.slice(0, 5);

    // 7. Generate Recommendations for Quality Improvement
    const recommendations = this.generateSystemRecommendations(metrics, failedScenarios);

    const report: EvaluationReport = {
      timestamp: new Date().toISOString(),
      summary: `Recommendation Evaluation Platform evaluated ${scenarios.length} benchmark scenarios with Top-1 Accuracy ${metrics.top1Accuracy}% and Average Confidence ${metrics.averageConfidence}%.`,
      scenariosCount: scenarios.length,
      metrics,
      regression,
      failedScenarios,
      slowestRequests,
      recommendations,
      qualityGatePassed,
      qualityGateFailures: gateFailures,
    };

    return report;
  }

  private detectRegression(
    currentResults: ScenarioExecutionResult[],
    currentMetrics: EvaluationMetrics,
    previousReport?: EvaluationReport
  ): RegressionResult {
    if (!previousReport || !previousReport.metrics) {
      return {
        hasRegression: false,
        improvedScenarios: [],
        regressedScenarios: [],
        unchangedScenarios: currentResults.map((r) => r.scenarioId),
        metricDeltas: {
          top1AccuracyDelta: 0,
          top3AccuracyDelta: 0,
          averageConfidenceDelta: 0,
          averageSavingsDelta: 0,
          averageExecutionTimeDelta: 0,
          failuresDelta: 0,
        },
      };
    }

    const prevMetrics = previousReport.metrics;
    const prevFailedMap = new Set(
      previousReport.failedScenarios?.map((s) => s.scenarioId) || []
    );

    const improvedScenarios: string[] = [];
    const regressedScenarios: string[] = [];
    const unchangedScenarios: string[] = [];

    for (const res of currentResults) {
      const sId = res.scenarioId;
      const prevFailed = prevFailedMap.has(sId);
      const currFailed = !res.passed;

      if (prevFailed && !currFailed) {
        improvedScenarios.push(sId);
      } else if (!prevFailed && currFailed) {
        regressedScenarios.push(sId);
      } else {
        unchangedScenarios.push(sId);
      }
    }

    const metricDeltas = {
      top1AccuracyDelta: parseFloat(
        (currentMetrics.top1Accuracy - prevMetrics.top1Accuracy).toFixed(1)
      ),
      top3AccuracyDelta: parseFloat(
        (currentMetrics.top3Accuracy - prevMetrics.top3Accuracy).toFixed(1)
      ),
      averageConfidenceDelta: parseFloat(
        (currentMetrics.averageConfidence - prevMetrics.averageConfidence).toFixed(1)
      ),
      averageSavingsDelta: currentMetrics.averageSavings - prevMetrics.averageSavings,
      averageExecutionTimeDelta: parseFloat(
        (currentMetrics.averageExecutionTimeMs - prevMetrics.averageExecutionTimeMs).toFixed(2)
      ),
      failuresDelta: currentMetrics.failedScenarios - prevMetrics.failedScenarios,
    };

    const hasRegression = regressedScenarios.length > 0 || metricDeltas.top1AccuracyDelta < 0;

    return {
      hasRegression,
      improvedScenarios,
      regressedScenarios,
      unchangedScenarios,
      metricDeltas,
    };
  }

  private generateSystemRecommendations(
    metrics: EvaluationMetrics,
    failedScenarios: ScenarioExecutionResult[]
  ): string[] {
    const recs: string[] = [];

    if (metrics.top1Accuracy < 95) {
      recs.push(
        `Top-1 Accuracy is currently ${metrics.top1Accuracy}%. Tune card category reward weights to boost accuracy to >95%.`
      );
    }

    if (metrics.merchantResolutionAccuracy < 100) {
      recs.push(
        `Merchant resolution accuracy is ${metrics.merchantResolutionAccuracy}%. Add missing aliases in MerchantResolver for fallback merchants.`
      );
    }

    if (metrics.overRecommendedCards.length > 0) {
      const topOver = metrics.overRecommendedCards[0];
      recs.push(
        `Card"${topOver.cardName}" is over-recommended (${topOver.recommendedCount} times vs ${topOver.expectedCount} expected). Review annual fee and composite score weighting.`
      );
    }

    if (metrics.poorQualityMerchants.length > 0) {
      const topPoor = metrics.poorQualityMerchants[0];
      recs.push(
        `Merchant"${topPoor.merchantName}" has poor recommendation quality (${topPoor.accuracy}% accuracy). Verify merchant category tags and active offers.`
      );
    }

    if (failedScenarios.length > 0) {
      recs.push(
        `Investigate ${failedScenarios.length} failed benchmark scenario(s) in reports/recommendation-evaluation.json.`
      );
    } else {
      recs.push('Recommendation quality is high across all benchmark categories. System ready for production quality gates.');
    }

    return recs;
  }
}
