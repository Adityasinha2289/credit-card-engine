import type { ScoreBreakdown, FinancialHealthGrade } from './types';
import { PersonalizationEngine } from '../personalization/personalizationEngine';
import { BehaviourEngine } from '../behaviour/behaviourEngine';
import { RecommendationEngine } from '../recommendations/recommendationEngine';
import type { AppProfile } from '../dashboard/types/dashboard.types';

export class ScoringRules {
  public static calculateBreakdown(profile?: AppProfile | null): ScoreBreakdown[] {
    const persona = PersonalizationEngine.getPersona(profile);
    const behaviourInsights = BehaviourEngine.getInsights();
    const recommendations = RecommendationEngine.getRecommendations(profile);

    // 1. Profile Completeness (15%)
    const profileCompletenessScore = persona.profileCompleteness;
    const profileBreakdown: ScoreBreakdown = {
      category: 'Profile Completeness',
      weight: 15,
      score: profileCompletenessScore,
      explanation: `Your profile completeness is at ${profileCompletenessScore}%.`,
      improvementSuggestion: profileCompletenessScore < 100 ? 'Complete occupation and city details to reach 100%.' : 'Profile is fully complete.',
    };

    // 2. Reward Optimisation (20%)
    const rewardScore = persona.primaryGoal ? 90 : 65;
    const rewardBreakdown: ScoreBreakdown = {
      category: 'Reward Optimisation',
      weight: 20,
      score: rewardScore,
      explanation: 'Evaluates your alignment with card reward multipliers and miles.',
      improvementSuggestion: 'Consolidate travel and dining spends on high-multiplier cards.',
    };

    // 3. Cashback Efficiency (15%)
    const cashbackScore = 85;
    const cashbackBreakdown: ScoreBreakdown = {
      category: 'Cashback Efficiency',
      weight: 15,
      score: cashbackScore,
      explanation: 'Measures your capture rate on instant merchant cashback offers.',
      improvementSuggestion: 'Use partner cards for online e-commerce transactions.',
    };

    // 4. Behaviour Consistency (15%)
    const behaviourScore = behaviourInsights.length > 0 ? 88 : 70;
    const behaviourBreakdown: ScoreBreakdown = {
      category: 'Behaviour Consistency',
      weight: 15,
      score: behaviourScore,
      explanation: 'Tracks spending predictability and timely utility management.',
      improvementSuggestion: 'Maintain recurring bill autopay to keep score high.',
    };

    // 5. Recommendation Adoption (10%)
    const recScore = recommendations.length > 0 ? 82 : 75;
    const recBreakdown: ScoreBreakdown = {
      category: 'Recommendation Adoption',
      weight: 10,
      score: recScore,
      explanation: 'Reflects adoption of RenoCred rule engine suggestions.',
      improvementSuggestion: 'Review and act on recommended credit card upgrades.',
    };

    // 6. Offer Utilisation (10%)
    const offerScore = 80;
    const offerBreakdown: ScoreBreakdown = {
      category: 'Offer Utilisation',
      weight: 10,
      score: offerScore,
      explanation: 'Measures utilization of active merchant partner campaigns.',
      improvementSuggestion: 'Check Today\'s Best Offer before placing online orders.',
    };

    // 7. Financial Knowledge (10%)
    const knowledgeScore = 95;
    const knowledgeBreakdown: ScoreBreakdown = {
      category: 'Financial Knowledge',
      weight: 10,
      score: knowledgeScore,
      explanation: 'Understanding of credit utilization rules and forex charges.',
      improvementSuggestion: 'Read Financial Tip of the Day to stay updated on RBI norms.',
    };

    // 8. Healthy Spending Pattern (5%)
    const spendScore = 85;
    const spendBreakdown: ScoreBreakdown = {
      category: 'Healthy Spending Pattern',
      weight: 5,
      score: spendScore,
      explanation: 'Evaluates balance across spending categories.',
      improvementSuggestion: 'Keep category spending balanced without sudden spikes.',
    };

    return [
      profileBreakdown,
      rewardBreakdown,
      cashbackBreakdown,
      behaviourBreakdown,
      recBreakdown,
      offerBreakdown,
      knowledgeBreakdown,
      spendBreakdown,
    ];
  }

  public static calculateGrade(score: number): FinancialHealthGrade {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    return 'D';
  }
}
