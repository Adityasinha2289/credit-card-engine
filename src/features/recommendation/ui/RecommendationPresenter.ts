import type { RecommendationResult } from '../types';
import type { 
  RecommendationCardViewModel, 
  CardComparisonViewModel, 
  SavingsSummaryViewModel, 
  WalletRecommendationViewModel 
} from './RecommendationViewModel';
import { 
  mapToRecommendationCardViewModel, 
  mapToCardComparisonViewModel, 
  mapToSavingsSummaryViewModel, 
  mapToWalletRecommendationViewModel 
} from './mappers/recommendationMapper';

export class RecommendationPresenter {
  /**
   * Transforms a single recommendation into the primary Card UI model.
   */
  public static presentCard(result: RecommendationResult): RecommendationCardViewModel {
    return mapToRecommendationCardViewModel(result);
  }

  /**
   * Transforms multiple results into a comparative UI model.
   */
  public static presentComparison(results: RecommendationResult[]): CardComparisonViewModel | null {
    return mapToCardComparisonViewModel(results);
  }

  /**
   * Transforms a single result into a focused Savings UI model.
   */
  public static presentSavings(result: RecommendationResult): SavingsSummaryViewModel {
    return mapToSavingsSummaryViewModel(result);
  }

  /**
   * Transforms multiple results into a synergized Wallet UI model.
   */
  public static presentWallet(results: RecommendationResult[]): WalletRecommendationViewModel {
    return mapToWalletRecommendationViewModel(results);
  }
}
