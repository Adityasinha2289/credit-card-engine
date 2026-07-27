import type { FinancialHealthModel, ScoreBreakdown, FinancialHealthGrade } from './types';
import { ScoringRules } from './scoringRules';
import type { AppProfile } from '../dashboard/types/dashboard.types';

export class FinancialHealthEngine {
  /**
   * Calculate full Financial Health score and detailed breakdown
   */
  public static getFinancialHealth(profile?: AppProfile | null): FinancialHealthModel {
    const scoreBreakdown = ScoringRules.calculateBreakdown(profile);

    // Weighted average calculation: sum(score * (weight / 100))
    const totalWeightedScore = scoreBreakdown.reduce(
      (sum, item) => sum + item.score * (item.weight / 100),
      0
    );
    const finalScore = Math.round(totalWeightedScore);
    const grade = ScoringRules.calculateGrade(finalScore);

    const sortedBreakdown = [...scoreBreakdown].sort((a, b) => b.score - a.score);
    const strengths = sortedBreakdown.slice(0, 2).map((item) => `${item.category}: ${item.explanation}`);
    const improvements = sortedBreakdown.slice(-2).map((item) => `${item.category}: ${item.improvementSuggestion}`);

    const insights = [
      `Overall score of ${finalScore}/100 earns a Grade of ${grade}.`,
      `Top performing area: ${sortedBreakdown[0].category} (${sortedBreakdown[0].score}%).`,
      `Key area for improvement: ${sortedBreakdown[sortedBreakdown.length - 1].category}.`,
    ];

    const now = new Date().toISOString();

    return {
      score: finalScore,
      grade,
      strengths,
      improvements,
      insights,
      confidence: 94,
      lastCalculated: now,
      scoreTimestamp: now,
      scoreBreakdown,
    };
  }

  public static getScore(profile?: AppProfile | null): number {
    return this.getFinancialHealth(profile).score;
  }

  public static getGrade(profile?: AppProfile | null): FinancialHealthGrade {
    return this.getFinancialHealth(profile).grade;
  }

  public static getBreakdown(profile?: AppProfile | null): ScoreBreakdown[] {
    return this.getFinancialHealth(profile).scoreBreakdown;
  }

  public static getStrengths(profile?: AppProfile | null): string[] {
    return this.getFinancialHealth(profile).strengths;
  }

  public static getImprovements(profile?: AppProfile | null): string[] {
    return this.getFinancialHealth(profile).improvements;
  }

  public static getInsights(profile?: AppProfile | null): string[] {
    return this.getFinancialHealth(profile).insights;
  }
}

/**
 * React hook wrapper for consuming Financial Health Engine
 */
export function useFinancialHealth(profile?: AppProfile | null) {
  const health = FinancialHealthEngine.getFinancialHealth(profile);

  return {
    health,
    score: health.score,
    grade: health.grade,
    strengths: health.strengths,
    improvements: health.improvements,
    insights: health.insights,
    scoreBreakdown: health.scoreBreakdown,
  };
}
