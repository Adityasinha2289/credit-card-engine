import type { RecommendationResult } from '../../types';
import type { CardViewModel } from '../CardViewModel';
import type { 
  RecommendationCardViewModel, 
  CardComparisonViewModel, 
  SavingsSummaryViewModel, 
  WalletRecommendationViewModel 
} from '../RecommendationViewModel';
import { formatCurrency, formatPercentage, getNetworkIcon, getCardGradient } from './formatters';

export function mapToCardViewModel(result: RecommendationResult): CardViewModel {
  const card = result.card;
  const gradient = getCardGradient(card.issuer, card.network);
  
  return {
    id: card.id,
    displayName: card.name || 'Unknown Card',
    issuer: card.issuer || 'Unknown Bank',
    networkIcon: getNetworkIcon(card.network),
    formattedAnnualFee: card.annualFee === 0 ? 'Lifetime Free' : `${formatCurrency(card.annualFee)} / year`,
    formattedRewardRate: card.rewardRate || 'Standard Rewards',
    aesthetics: {
      gradientFrom: gradient.from,
      gradientTo: gradient.to,
      badgeLabel: result.matchPercent > 90 ? 'Top Pick' : undefined,
      badgeColor: result.matchPercent > 90 ? 'bg-green-500' : 'bg-gray-500'
    }
  };
}

export function mapToRecommendationCardViewModel(result: RecommendationResult): RecommendationCardViewModel {
  const confidenceLevel = result.confidence >= 0.9 ? 'High Match' : result.confidence >= 0.7 ? 'Good Match' : 'Potential Match';
  
  return {
    card: mapToCardViewModel(result),
    matchPercentage: formatPercentage(result.matchPercent),
    confidenceBadge: confidenceLevel,
    topReasons: result.reasoning && result.reasoning.length > 0 ? result.reasoning : ['Based on your profile'],
  };
}

export function mapToCardComparisonViewModel(results: RecommendationResult[]): CardComparisonViewModel | null {
  if (!results || results.length === 0) return null;
  
  const primary = results[0];
  const alternatives = results.slice(1);
  
  return {
    primaryCard: mapToCardViewModel(primary),
    alternativeCards: alternatives.map(mapToCardViewModel),
    tradeoffs: {
      pros: primary.tradeoffs?.pros || [],
      cons: primary.tradeoffs?.cons || []
    }
  };
}

export function mapToSavingsSummaryViewModel(result: RecommendationResult): SavingsSummaryViewModel {
  const savings = result.savings?.expectedSavings || 0;
  const points = result.savings?.expectedRewardPoints || 0;
  
  return {
    formattedTotalSavings: formatCurrency(savings),
    formattedRewardPoints: new Intl.NumberFormat('en-IN').format(points) + ' pts',
    savingsSubtitle: savings > 0 ? 'Estimated annual net savings' : 'Standard card benefits'
  };
}

export function mapToWalletRecommendationViewModel(results: RecommendationResult[]): WalletRecommendationViewModel {
  const validResults = results || [];
  const totalSavings = validResults.reduce((acc, r) => acc + (r.savings?.expectedSavings || 0), 0);
  
  return {
    cards: validResults.map(mapToCardViewModel),
    totalFormattedSavings: formatCurrency(totalSavings),
    walletSynergyDescription: validResults.length > 1 
      ? `These ${validResults.length} cards combine to maximize your rewards across multiple categories.`
      : 'This card serves as an excellent primary daily driver.'
  };
}
