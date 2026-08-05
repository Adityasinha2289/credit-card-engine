import type { CardViewModel } from './CardViewModel';

export interface SavingsSummaryViewModel {
  formattedTotalSavings: string;
  formattedRewardPoints: string;
  savingsSubtitle: string;
}

export interface RecommendationCardViewModel {
  card: CardViewModel;
  matchPercentage: string;
  confidenceBadge: string;
  topReasons: string[];
}

export interface CardComparisonViewModel {
  primaryCard: CardViewModel;
  alternativeCards: CardViewModel[];
  tradeoffs: {
    pros: string[];
    cons: string[];
  };
}

export interface WalletRecommendationViewModel {
  cards: CardViewModel[];
  totalFormattedSavings: string;
  walletSynergyDescription: string;
}
