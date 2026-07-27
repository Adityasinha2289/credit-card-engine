import type { DecisionReasoningProvider, TaqdeerDecision } from './types';

export class TaqdeerDeterministicRules implements DecisionReasoningProvider {
  public name = 'deterministic_rule_engine';

  public evaluate(context: { persona: any; behaviour: any; recommendations: any[] }): TaqdeerDecision[] {
    const { persona, behaviour, recommendations } = context;
    const decisions: TaqdeerDecision[] = [];

    // Rule 1: Profile Completeness < 100% (High Priority action if incomplete)
    if (persona.profileCompleteness < 100) {
      decisions.push({
        id: 'dec-profile-complete',
        title: 'Complete Profile Setup to Unlock Card Approvals',
        summary: 'Fill in your occupation and city to increase credit card eligibility match rate by 40%.',
        explanation: 'Your financial profile is currently incomplete. Completing it gives RenoCred full visibility to match high-approval cards.',
        confidence: 98,
        priority: 'high',
        category: 'profile',
        estimatedImpact: {
          savings: 2500,
          timeFrame: 'today',
        },
        evidence: [
          `Profile completion is currently at ${persona.profileCompleteness}%`,
          'Occupation and city details missing for pre-approval match',
        ],
        sourceRecommendations: ['rec-profile-comp'],
      });
    }

    // Rule 2: High Dining Spends -> Cashback Card Switch
    const diningCategory = behaviour.topCategories?.find((c: any) => c.category === 'dining');
    if (diningCategory && diningCategory.percentageOfTotal >= 20) {
      decisions.push({
        id: 'dec-dining-cashback-switch',
        title: 'Switch Dining Spends to 10% Cashback Card',
        summary: 'Shift your Swiggy, Zomato, and restaurant payments to a targeted dining cashback card.',
        explanation: `You spend most of your monthly budget on dining. Switching to a cashback-focused card can save up to ₹1,200/month. This recommendation is prioritised because dining represents ${diningCategory.percentageOfTotal}% of your recent spending.`,
        confidence: 95,
        priority: 'critical',
        category: 'cashback',
        estimatedImpact: {
          savings: 14400,
          timeFrame: 'this_month',
        },
        evidence: [
          `Dining accounts for ${diningCategory.percentageOfTotal}% of total spend`,
          `Estimated annual savings: ₹${(diningCategory.totalAmount * 0.1).toFixed(0)}`,
        ],
        sourceRecommendations: ['rec-dining-cashback'],
      });
    }

    // Rule 3: Travel Goal Strategy
    if (persona.primaryGoal === 'Travel Rewards') {
      decisions.push({
        id: 'dec-travel-miles-boost',
        title: 'Activate Premium Travel Card & Lounge Access',
        summary: 'Consolidate flight and hotel bookings on a miles multiplier card to earn 4× points.',
        explanation: 'Because your primary goal is Travel Rewards, consolidating travel expenses onto a travel card maximizes miles accumulation for free flights.',
        confidence: 93,
        priority: 'high',
        category: 'travel',
        estimatedImpact: {
          rewards: 15000,
          timeFrame: 'this_month',
        },
        evidence: [
          'Primary goal selected: Travel Rewards',
          'Airport lounge access and 4× miles eligible',
        ],
        sourceRecommendations: ['rec-travel-cards'],
      });
    }

    // Rule 4: Credit Score Building Strategy
    if (persona.primaryGoal === 'Build Credit Score') {
      decisions.push({
        id: 'dec-credit-score-guard',
        title: 'Cap Statement Utilization Under 30%',
        summary: 'Maintain credit usage below ₹15,000 across active cards to boost CIBIL score.',
        explanation: 'Because your primary goal is to build credit, keeping utilization strictly under 30% demonstrates creditworthiness to CIBIL rating bureaus.',
        confidence: 96,
        priority: 'critical',
        category: 'credit',
        estimatedImpact: {
          savings: 0,
          rewards: 50,
          timeFrame: 'this_week',
        },
        evidence: [
          'Goal: Build Credit Score',
          'CIBIL scoring algorithm weights utilization at 30%',
        ],
        sourceRecommendations: ['rec-credit-builder'],
      });
    }

    // Fallback default decision if no specific rules trigger
    if (decisions.length === 0) {
      decisions.push({
        id: 'dec-default-opt',
        title: 'Optimize Monthly Utility Autopay Rewards',
        summary: 'Route electricity and bill payments through a rewards card to earn monthly cashback.',
        explanation: 'Automating bill payments through a rewards card earns steady cashback on unavoidable monthly expenses.',
        confidence: 90,
        priority: 'medium',
        category: 'savings',
        estimatedImpact: {
          savings: 6000,
          timeFrame: 'this_month',
        },
        evidence: [
          'Recurring utility bills detected',
          'Autopay cashback multiplier eligible',
        ],
        sourceRecommendations: recommendations.map((r) => r.id),
      });
    }

    return decisions;
  }
}
