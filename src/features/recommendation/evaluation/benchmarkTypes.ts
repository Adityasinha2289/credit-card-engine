import type { TransactionCategory, PrimaryGoal } from '../../dashboard/types/dashboard.types';
import type { RecommendationMode } from '../intelligence/evaluationTypes';

export interface BenchmarkInput {
  merchant: string;
  amount: number;
  date?: string;
  mode?: RecommendationMode;
  category?: TransactionCategory;
}

export interface BenchmarkUserContext {
  ownedCards: string[];
  excludedCards?: string[];
  rewardPreference?: 'cashback' | 'miles' | 'points' | 'any';
  spendingProfile?: string;
  userPrimaryGoal?: PrimaryGoal;
}

export interface ExpectedResult {
  winningCard: string;
  expectedSavings: number;
  acceptableAlternatives?: string[];
  minimumConfidence?: number;
}

export interface BenchmarkScenario {
  id: string;
  title: string;
  description: string;
  input: BenchmarkInput;
  userContext: BenchmarkUserContext;
  expected: ExpectedResult;
}

export interface ValidationError {
  scenarioId: string;
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationSummary {
  valid: boolean;
  totalScenarios: number;
  errors: ValidationError[];
  warnings: ValidationError[];
}

export interface ScenarioExecutionResult {
  scenarioId: string;
  title: string;
  category: TransactionCategory;
  merchantInput: string;
  amount: number;
  passed: boolean;
  top1Match: boolean;
  top3Match: boolean;
  actualWinnerId: string;
  actualWinnerName: string;
  expectedWinner: string;
  acceptableAlternatives: string[];
  actualTop3Ids: string[];
  actualSavings: number;
  expectedSavings: number;
  savingsDiff: number;
  confidence: number;
  minimumConfidence: number;
  confidencePassed: boolean;
  reasoning: string[];
  executionTimeMs: number;
  merchantResolved: boolean;
  resolvedMerchantName: string;
  offerResolved: boolean;
  appliedOfferTitle?: string;
  categoryMatched: boolean;
  inferredCategory: TransactionCategory;
  trace?: unknown;
  failureReasons: string[];
}

export interface CategoryMetrics {
  totalScenarios: number;
  passedScenarios: number;
  top1Accuracy: number;
  top3Accuracy: number;
  averageConfidence: number;
  averageSavings: number;
  averageExecutionTimeMs: number;
}

export interface OverRecommendedCard {
  cardId: string;
  cardName: string;
  recommendedCount: number;
  expectedCount: number;
  recommendationPercentage: number;
  overRecommendationRatio: number;
}

export interface PoorQualityMerchant {
  merchantName: string;
  scenarioCount: number;
  passedCount: number;
  accuracy: number;
}

export interface EvaluationMetrics {
  totalScenarios: number;
  passedScenarios: number;
  failedScenarios: number;
  top1Accuracy: number; // percentage 0-100
  top3Accuracy: number; // percentage 0-100
  averageConfidence: number; // percentage 0-100
  averageSavings: number; // ₹
  averageExecutionTimeMs: number; // ms
  merchantResolutionAccuracy: number; // percentage 0-100
  offerResolutionAccuracy: number; // percentage 0-100
  categoryAccuracy: number; // percentage 0-100
  falseRecommendationCount: number;
  confidenceCalibration: number; // Brier-like score / error (lower is better)
  categoryBreakdown: Record<string, CategoryMetrics>;
  cardRecommendationDistribution: Record<string, number>;
  expectedCardDistribution: Record<string, number>;
  overRecommendedCards: OverRecommendedCard[];
  poorQualityMerchants: PoorQualityMerchant[];
  confidenceDistribution: Record<string, number>; // bucket -> count
  confusionMatrix: Record<string, Record<string, number>>; // expectedCard -> actualCard -> count
}

export interface MetricDeltas {
  top1AccuracyDelta: number;
  top3AccuracyDelta: number;
  averageConfidenceDelta: number;
  averageSavingsDelta: number;
  averageExecutionTimeDelta: number;
  failuresDelta: number;
}

export interface RegressionResult {
  hasRegression: boolean;
  improvedScenarios: string[];
  regressedScenarios: string[];
  unchangedScenarios: string[];
  metricDeltas: MetricDeltas;
}

export interface QualityGateConfig {
  minTop1Accuracy: number; // e.g. 90
  minAverageConfidence: number; // e.g. 80
  maxAllowedRegression: number; // max allowable percentage drop in top-1 accuracy (e.g. 5)
  maxAverageResponseTimeMs: number; // max allowable avg execution time e.g. 50ms
}

export interface EvaluationReport {
  timestamp: string;
  summary: string;
  scenariosCount: number;
  metrics: EvaluationMetrics;
  regression?: RegressionResult;
  failedScenarios: ScenarioExecutionResult[];
  slowestRequests: ScenarioExecutionResult[];
  recommendations: string[];
  qualityGatePassed: boolean;
  qualityGateFailures: string[];
}
