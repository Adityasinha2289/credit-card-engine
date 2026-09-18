import type { TaqdeerDecision } from '../../../../features/taqdeer/types';
import type { CardIntelligenceResult } from '../../../../features/card-intelligence';
import { DecisionCard } from '../../../../components/shared/DecisionCard';

interface SmartRecommendationV3Props {
  decision: TaqdeerDecision;
  featuredCard: CardIntelligenceResult;
}

export function SmartRecommendationV3({ decision }: SmartRecommendationV3Props) {
  const estimatedValue = decision.estimatedImpact.savings
    ? `₹${decision.estimatedImpact.savings.toLocaleString('en-IN')}`
    : decision.estimatedImpact.rewards
    ? `${decision.estimatedImpact.rewards.toLocaleString()} pts`
    : 'High Protection';

  return (
    <DecisionCard 
      title="Today's Best Move"
      bestFit={decision.title}
      why={decision.explanation}
      expectedValue={estimatedValue}
      tradeoff={decision.tradeoff || "Using other cards will yield lower returns for this specific category."}
      confidence={decision.confidence}
      actionText="View Details"
    />
  );
}
