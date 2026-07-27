import { MerchantResolver } from '../merchantResolver';
import { OfferResolver } from '../offerResolver';
import type { ResolvedMerchant } from '../recommendationTypes';
import type { MerchantOffer } from '../../merchant-intelligence/types';
import type { RecommendationContextInput, RecommendationMode } from './evaluationTypes';

export class RecommendationContextBuilder {
  public static buildContext(input: RecommendationContextInput) {
    const mode: RecommendationMode =
      input.mode || (input.ownedCardIds && input.ownedCardIds.length > 0 ? 'wallet_optimisation' : 'card_discovery');
    const transactionDate = input.transactionDate || new Date();
    const amount = input.amount || 1000;

    const resolvedMerchant: ResolvedMerchant = MerchantResolver.resolve(input.merchant, input.category);
    const applicableOffers: MerchantOffer[] = OfferResolver.getApplicableOffers(
      resolvedMerchant.merchant?.id,
      resolvedMerchant.inferredCategory,
      amount,
      transactionDate
    );

    return {
      mode,
      amount,
      transactionDate,
      resolvedMerchant,
      applicableOffers,
      ownedCardIds: new Set(input.ownedCardIds || []),
      userPrimaryGoal: input.userPrimaryGoal || 'Maximise Cashback',
      userSalary: input.userSalary || 500000,
    };
  }
}
