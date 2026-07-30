import { performance } from 'perf_hooks';
import { RecommendationIntelligenceEngine } from '../intelligence/recommendationIntelligenceEngine';
import { MerchantResolver } from '../merchantResolver';
import { CardRepository } from '../../card-intelligence/cardRepository';
import type { TransactionCategory } from '../../dashboard/types/dashboard.types';
import type {
  BenchmarkScenario,
  ScenarioExecutionResult,
} from './benchmarkTypes';

export class BenchmarkRunner {
  private intelligenceEngine: RecommendationIntelligenceEngine;
  private cardRepo = CardRepository.getInstance();

  constructor() {
    this.intelligenceEngine = new RecommendationIntelligenceEngine();
  }

  public runScenario(scenario: BenchmarkScenario): ScenarioExecutionResult {
    const startTime = performance.now();

    // Prepare inputs
    const merchantName = scenario.input.merchant;
    const amount = scenario.input.amount;
    const date = scenario.input.date ? new Date(scenario.input.date) : new Date();
    const mode = scenario.input.mode || 'wallet_optimisation';
    const ownedCardIds = scenario.userContext?.ownedCards || [];
    const goal = scenario.userContext?.userPrimaryGoal || 'maximize_cashback';
    const categoryInput = scenario.input.category;

    // Resolve merchant first for tracking
    const resolvedMerchantInfo = MerchantResolver.resolve(merchantName, categoryInput);

    // Run Intelligence Recommendation Engine
    const recOutput = this.intelligenceEngine.evaluateRecommendation({
      merchant: merchantName,
      amount,
      mode,
      ownedCardIds,
      userPrimaryGoal: goal,
      transactionDate: date,
      category: categoryInput,
    });

    const executionTimeMs = parseFloat((performance.now() - startTime).toFixed(2));

    const actualWinner = recOutput.bestCard;
    const actualWinnerId = actualWinner.id;
    const actualWinnerName = actualWinner.cardName;

    const actualTop3Ids = [
      actualWinnerId,
      ...(recOutput.alternatives?.map((a) => a.card.id) || []),
    ].slice(0, 3);

    const actualTop3Names = [
      actualWinnerName,
      ...(recOutput.alternatives?.map((a) => a.card.cardName) || []),
    ].slice(0, 3);

    const expectedWinner = scenario.expected.winningCard;
    const acceptableAlts = scenario.expected.acceptableAlternatives || [];

    // Match Top 1
    const top1Match = this.matchesCard(expectedWinner, actualWinnerId, actualWinnerName);

    // Match Top 3
    const top3Match =
      top1Match ||
      actualTop3Ids.some((id) => this.matchesCard(expectedWinner, id, '')) ||
      actualTop3Names.some((name) => this.matchesCard(expectedWinner, '', name)) ||
      acceptableAlts.some((alt) => this.matchesCard(alt, actualWinnerId, actualWinnerName));

    // Savings match & diff
    const actualSavings = recOutput.expectedSavings || 0;
    const expectedSavings = scenario.expected.expectedSavings || 0;
    const savingsDiff = actualSavings - expectedSavings;

    // Confidence match
    const actualConfidence = recOutput.confidence || 0;
    const minConfidence = scenario.expected.minimumConfidence !== undefined ? scenario.expected.minimumConfidence : 0;
    // Normalized to 0-100 or 0-1
    const normalizedConfidence = actualConfidence <= 1 ? Math.round(actualConfidence * 100) : actualConfidence;
    const normalizedMinConfidence = minConfidence <= 1 ? Math.round(minConfidence * 100) : minConfidence;
    const confidencePassed = normalizedConfidence >= normalizedMinConfidence;

    // Resolutions
    const merchantResolved = resolvedMerchantInfo.matchType !== 'fallback';
    const resolvedMerchantName = resolvedMerchantInfo.merchant?.name || 'Unresolved/Fallback';
    const offerResolved = Boolean(recOutput.appliedOffer);
    const categoryMatched = categoryInput
      ? resolvedMerchantInfo.inferredCategory === categoryInput
      : true;

    // Check pass/fail criteria
    const failureReasons: string[] = [];
    if (!top1Match) {
      failureReasons.push(
        `Card mismatch: Expected"${expectedWinner}", got"${actualWinnerName} (${actualWinnerId})"`
      );
    }
    if (!confidencePassed) {
      failureReasons.push(
        `Confidence too low: Expected min ${normalizedMinConfidence}%, got ${normalizedConfidence}%`
      );
    }

    const passed = failureReasons.length === 0;

    return {
      scenarioId: scenario.id,
      title: scenario.title,
      category: resolvedMerchantInfo.inferredCategory,
      merchantInput: merchantName,
      amount,
      passed,
      top1Match,
      top3Match,
      actualWinnerId,
      actualWinnerName,
      expectedWinner,
      acceptableAlternatives: acceptableAlts,
      actualTop3Ids,
      actualSavings,
      expectedSavings,
      savingsDiff,
      confidence: normalizedConfidence,
      minimumConfidence: normalizedMinConfidence,
      confidencePassed,
      reasoning: recOutput.humanReasoning || [],
      executionTimeMs,
      merchantResolved,
      resolvedMerchantName,
      offerResolved,
      appliedOfferTitle: recOutput.appliedOffer?.title,
      categoryMatched,
      inferredCategory: resolvedMerchantInfo.inferredCategory,
      trace: recOutput.trace,
      failureReasons,
    };
  }

  public runAllScenarios(scenarios: BenchmarkScenario[]): ScenarioExecutionResult[] {
    return scenarios.map((scenario) => this.runScenario(scenario));
  }

  private matchesCard(expectedIdOrName: string, actualId: string, actualName: string): boolean {
    if (!expectedIdOrName) return false;
    const target = expectedIdOrName.trim().toLowerCase();
    if (actualId && actualId.toLowerCase() === target) return true;
    if (actualName && actualName.toLowerCase() === target) return true;
    if (actualId && actualId.toLowerCase().includes(target)) return true;
    if (actualName && actualName.toLowerCase().includes(target)) return true;
    return false;
  }
}
