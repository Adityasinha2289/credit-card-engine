import type { CreditCardIntelligence } from '../card-intelligence/types';
import type { MerchantOffer } from '../merchant-intelligence/types';
import type { TransactionCategory } from '../dashboard/types/dashboard.types';
import type { CardRewardCalculation } from './recommendationTypes';
import { RewardCalculator } from './rewardCalculator';

export class CardRanker {
  public static rankCards(
    availableCards: CreditCardIntelligence[],
    amount: number,
    category: TransactionCategory,
    applicableOffers: MerchantOffer[]
  ): CardRewardCalculation[] {
    const calculations = availableCards.map((card) =>
      RewardCalculator.calculateCardReward(card, amount, category, applicableOffers)
    );

    return calculations.sort((a, b) => b.rankScore - a.rankScore);
  }
}
