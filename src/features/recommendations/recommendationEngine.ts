import { PersonalizationEngine } from '../personalization/personalizationEngine';
import { BehaviourEngine } from '../behaviour/behaviourEngine';
import type { AppProfile } from '../dashboard/types/dashboard.types';
import type { FinancialRecommendation, RecommendationCategory, RecommendationProvider } from './types';
import { MOCK_FALLBACK_RECOMMENDATIONS } from './mockRecommendations';

/**
 * Rule-based Provider evaluating user Persona and Behaviour
 */
export class DeterministicRuleProvider implements RecommendationProvider {
  public name = 'rule_engine';

  public evaluate(context: { persona: ReturnType<typeof PersonalizationEngine.getPersona>; behaviour: ReturnType<typeof BehaviourEngine.getInsights> }): FinancialRecommendation[] {
    const { persona } = context;
    const recommendations: FinancialRecommendation[] = [];
    const topCategories = BehaviourEngine.getTopCategories();
    const monthlySpend = BehaviourEngine.getMonthlySpend();
    const recurringMerchants = BehaviourEngine.getRecurringMerchants();

    const topCategory = topCategories[0]?.category;

    // Rule 1: Profile Completeness < 100%
    if (persona.profileCompleteness < 100) {
      recommendations.push({
        id: 'rec-profile-comp',
        title: 'Complete Your Personal Profile',
        description: 'Add your occupation and city to receive hyper-personalized card & offer matches.',
        reason: `Your profile completeness is currently at ${persona.profileCompleteness}%. Completing it unlocks tailored bank approvals.`,
        confidence: 98,
        priority: 'high',
        category: 'savings',
        cta: 'Complete Profile',
        dismissible: true,
        source: 'rule_engine',
      });
    }

    // Rule 2: Travel Goal & Travel Spend
    if (persona.primaryGoal === 'Travel Rewards' || persona.preferences.travel) {
      recommendations.push({
        id: 'rec-travel-cards',
        title: 'Upgrade to a Premium Travel Credit Card',
        description: 'Earn 4× miles on international spends and unlock complimentary airport lounge visits.',
        reason: 'Because your primary goal is Travel Rewards, matching cards with lounge access & air miles will save travel costs.',
        confidence: 95,
        priority: 'high',
        category: 'travel',
        cta: 'View Travel Cards',
        dismissible: true,
        source: 'rule_engine',
      });
    }

    // Rule 3: Dining is Top Spend Category
    if (topCategory === 'dining') {
      recommendations.push({
        id: 'rec-dining-cashback',
        title: 'Maximize Cashback on Dining & Food Delivery',
        description: 'Use a card offering 10% instant cashback on Swiggy, Zomato, and dining partners.',
        reason: 'Because dining accounts for your largest monthly spending category, cashback cards for restaurants can increase your monthly savings.',
        confidence: 92,
        priority: 'high',
        category: 'cashback',
        cta: 'Explore Dining Cards',
        dismissible: true,
        source: 'rule_engine',
      });
    }

    // Rule 4: Recurring Utilities Detected
    if (recurringMerchants.length > 0) {
      recommendations.push({
        id: 'rec-utility-opt',
        title: 'Optimize Utility & Subscription Payments',
        description: 'Earn 5% flat cashback on monthly electricity, broadband, and subscription bills.',
        reason: `Recurring payments detected for ${recurringMerchants.slice(0, 2).join(', ')}. Switching bill payment method maximizes monthly rewards.`,
        confidence: 89,
        priority: 'medium',
        category: 'rewards',
        cta: 'Optimize Bills',
        dismissible: true,
        source: 'rule_engine',
      });
    }

    // Rule 5: Large Monthly Spend (> ₹50,000 / 5,000,000 cents)
    if (monthlySpend > 5000000) {
      recommendations.push({
        id: 'rec-high-spend-rewards',
        title: 'Unlock Milestone Reward Fee Waivers',
        description: 'Your high monthly spend easily qualifies you for annual card fee waivers and bonus points.',
        reason: 'High transaction volume qualifies for tier upgrades and milestone spending bonuses.',
        confidence: 96,
        priority: 'high',
        category: 'rewards',
        cta: 'Check Milestones',
        dismissible: true,
        source: 'rule_engine',
      });
    }

    // Rule 6: Build Credit Score Goal
    if (persona.primaryGoal === 'Build Credit Score' || persona.preferences.creditBuilding) {
      recommendations.push({
        id: 'rec-credit-builder',
        title: 'Credit Score Booster Strategy',
        description: 'Maintain statement balances under 30% and set up automated full payments.',
        reason: 'Because your goal is to build your credit score, maintaining low credit utilization directly improves your CIBIL rating.',
        confidence: 94,
        priority: 'high',
        category: 'credit_score',
        cta: 'Run Simulator',
        dismissible: true,
        source: 'rule_engine',
      });
    }

    return recommendations.length > 0 ? recommendations : MOCK_FALLBACK_RECOMMENDATIONS;
  }
}

/**
 * Recommendation Engine Service - Single source of truth for generating recommendations
 */
export class RecommendationEngine {
  private static providers: RecommendationProvider[] = [new DeterministicRuleProvider()];

  /**
   * Register additional providers (e.g. AI Engine, Bank Partner API) for future extensibility
   */
  public static registerProvider(provider: RecommendationProvider) {
    this.providers.push(provider);
  }

  /**
   * Get all relevant recommendations generated for a profile
   */
  public static getRecommendations(profile?: AppProfile | null): FinancialRecommendation[] {
    const persona = PersonalizationEngine.getPersona(profile);
    const behaviour = BehaviourEngine.getInsights();

    const allRecommendations = this.providers.flatMap((p) => p.evaluate({ persona, behaviour }));

    // Deduplicate by ID
    const uniqueMap = new Map<string, FinancialRecommendation>();
    allRecommendations.forEach((rec) => uniqueMap.set(rec.id, rec));

    return Array.from(uniqueMap.values());
  }

  /**
   * Get top single recommendation
   */
  public static getTopRecommendation(profile?: AppProfile | null): FinancialRecommendation | null {
    const recs = this.getRecommendations(profile);
    if (recs.length === 0) return null;
    return recs.reduce((top, current) => (current.confidence > top.confidence ? current : top), recs[0]);
  }

  /**
   * Filter recommendations by category
   */
  public static getRecommendationsByCategory(category: RecommendationCategory, profile?: AppProfile | null): FinancialRecommendation[] {
    return this.getRecommendations(profile).filter((r) => r.category === category);
  }

  /**
   * Get high priority recommendations only
   */
  public static getHighPriorityRecommendations(profile?: AppProfile | null): FinancialRecommendation[] {
    return this.getRecommendations(profile).filter((r) => r.priority === 'high');
  }
}

/**
 * React hook wrapper for consuming recommendations
 */
export function useRecommendations(profile?: AppProfile | null) {
  const recommendations = RecommendationEngine.getRecommendations(profile);
  const topRecommendation = RecommendationEngine.getTopRecommendation(profile);
  const highPriorityRecommendations = RecommendationEngine.getHighPriorityRecommendations(profile);

  return {
    recommendations,
    topRecommendation,
    highPriorityRecommendations,
  };
}
