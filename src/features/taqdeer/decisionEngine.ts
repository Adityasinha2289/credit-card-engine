import { PersonalizationEngine } from '../personalization/personalizationEngine';
import { BehaviourEngine } from '../behaviour/behaviourEngine';
import { RecommendationEngine } from '../recommendations/recommendationEngine';
import type { AppProfile } from '../dashboard/types/dashboard.types';
import type { TaqdeerDecision, DecisionReasoningProvider } from './types';
import { TaqdeerDeterministicRules } from './rules';

export class DecisionEngine {
  private static providers: DecisionReasoningProvider[] = [new TaqdeerDeterministicRules()];

  /**
   * Register additional reasoning providers (e.g. AI Engine, Bank Intelligence) for future extensibility
   */
  public static registerProvider(provider: DecisionReasoningProvider) {
    this.providers.push(provider);
  }

  /**
   * Priority score weights for deterministic ranking
   */
  private static calculateScore(decision: TaqdeerDecision): number {
    let base = decision.confidence;
    switch (decision.priority) {
      case 'critical':
        base += 40;
        break;
      case 'high':
        base += 25;
        break;
      case 'medium':
        base += 10;
        break;
      case 'low':
      default:
        base += 0;
        break;
    }
    if (decision.estimatedImpact.savings) {
      base += Math.min(20, decision.estimatedImpact.savings / 1000);
    }
    return base;
  }

  /**
   * Core Method: Generates and ranks decisions, returning the SINGLE best decision.
   */
  public static getTodaysDecision(profile?: AppProfile | null): TaqdeerDecision {
    const persona = PersonalizationEngine.getPersona(profile);
    const behaviour = {
      insights: BehaviourEngine.getInsights(),
      topCategories: BehaviourEngine.getTopCategories(),
      monthlySpend: BehaviourEngine.getMonthlySpend(),
      recurringMerchants: BehaviourEngine.getRecurringMerchants(),
    };
    const recommendations = RecommendationEngine.getRecommendations(profile);

    const allDecisions = this.providers.flatMap((p) =>
      p.evaluate({ persona, behaviour, recommendations })
    );

    if (allDecisions.length === 0) {
      throw new Error('No TAQDEER decisions available.');
    }

    // Rank by score descending and return the ONE top decision
    const sorted = [...allDecisions].sort(
      (a, b) => this.calculateScore(b) - this.calculateScore(a)
    );
    return sorted[0];
  }

  /**
   * Public Helper: Decision summary string
   */
  public static getDecisionSummary(profile?: AppProfile | null): string {
    return this.getTodaysDecision(profile).summary;
  }

  /**
   * Public Helper: Decision explanation/reasoning string
   */
  public static getDecisionReasoning(profile?: AppProfile | null): string {
    return this.getTodaysDecision(profile).explanation;
  }

  /**
   * Public Helper: Decision evidence points list
   */
  public static getDecisionEvidence(profile?: AppProfile | null): string[] {
    return this.getTodaysDecision(profile).evidence;
  }

  /**
   * Public Helper: Decision confidence score (0 to 100)
   */
  public static getDecisionConfidence(profile?: AppProfile | null): number {
    return this.getTodaysDecision(profile).confidence;
  }
}

/**
 * React hook wrapper for consuming TAQDEER Decision in components
 */
export function useTaqdeerDecision(profile?: AppProfile | null) {
  const decision = DecisionEngine.getTodaysDecision(profile);
  return {
    decision,
    summary: decision.summary,
    explanation: decision.explanation,
    evidence: decision.evidence,
    confidence: decision.confidence,
  };
}
