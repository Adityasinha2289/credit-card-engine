import { MerchantRepository } from './merchantRepository';
import { PersonalizationEngine } from '../personalization/personalizationEngine';
import { BehaviourEngine } from '../behaviour/behaviourEngine';
import type { AppProfile } from '../dashboard/types/dashboard.types';
import type { MerchantOffer, PersonalizedOfferResult } from './types';

export class OfferEngine {
  private static repo = MerchantRepository.getInstance();

  public static getOffers(): MerchantOffer[] {
    return this.repo.getOffers();
  }

  public static getOffersForMerchant(merchantId: string): MerchantOffer[] {
    return this.repo.getOffersByMerchantId(merchantId);
  }

  public static getOffersForCard(cardId: string): MerchantOffer[] {
    return this.getOffers().filter(
      (o) => o.eligibleCards.includes('all') || o.eligibleCards.includes(cardId)
    );
  }

  /**
   * Deterministic Offer Matching for User Persona & Behaviour
   */
  public static getOffersForUser(profile?: AppProfile | null): PersonalizedOfferResult[] {
    const persona = PersonalizationEngine.getPersona(profile);
    const topCategories = BehaviourEngine.getTopCategories();
    const topCategory = topCategories[0]?.category;
    const offers = this.getOffers();
    const results: PersonalizedOfferResult[] = [];

    for (const offer of offers) {
      const merchant = this.repo.getMerchantById(offer.merchantId);
      if (!merchant) continue;

      let confidence = 80;
      let explanation = `Eligible offer at ${merchant.name}.`;
      let estimatedSavings = Math.round((offer.minimumSpend * offer.discountValue) / 100);

      // Rule 1: Goal = Cashback & Merchant = Amazon
      if (
        (persona.primaryGoal === 'Maximise Cashback' || persona.preferences.cashback) &&
        merchant.name.includes('Amazon')
      ) {
        confidence = 96;
        explanation = `Matches your goal to Maximise Cashback. Flat ${offer.discountValue}% cashback on Amazon shopping.`;
        estimatedSavings = 1250;
      }
      // Rule 2: Travel Goal & Travel Offer
      else if (
        (persona.primaryGoal === 'Travel Rewards' || persona.preferences.travel) &&
        offer.category === 'travel'
      ) {
        confidence = 94;
        explanation = `Matches your Travel Rewards goal. Save ${offer.discountValue}% on flights and hotels with 4× miles acceleration.`;
        estimatedSavings = 2500;
      }
      // Rule 3: Dining is Top Spend
      else if (topCategory === 'dining' && offer.category === 'dining') {
        confidence = 92;
        explanation = `Dining accounts for your highest spending category. Get ${offer.discountValue}% instant discount on Swiggy orders.`;
        estimatedSavings = 650;
      }

      results.push({
        offer,
        merchant,
        explanation,
        confidence,
        estimatedSavings,
      });
    }

    return results.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Get single best offer for user
   */
  public static getBestOffer(profile?: AppProfile | null): PersonalizedOfferResult {
    const userOffers = this.getOffersForUser(profile);
    return userOffers[0];
  }
}

/**
 * React hook wrapper for consuming Merchant Offers
 */
export function useMerchantOffers(profile?: AppProfile | null) {
  const userOffers = OfferEngine.getOffersForUser(profile);
  const bestOffer = OfferEngine.getBestOffer(profile);

  return {
    userOffers,
    bestOffer,
    getOffersForMerchant: OfferEngine.getOffersForMerchant,
    getOffersForCard: OfferEngine.getOffersForCard,
  };
}
