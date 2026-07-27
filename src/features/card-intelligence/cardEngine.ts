import { CardRepository } from './cardRepository';
import type {
  CreditCardIntelligence,
  CardComparisonFeature,
  CardComparisonResult,
  PremiumTier,
} from './types';
import type { TransactionCategory } from '../dashboard/types/dashboard.types';

export class CardEngine {
  private static repo = CardRepository.getInstance();

  /**
   * Get all active cards
   */
  public static getAllCards(): CreditCardIntelligence[] {
    return this.repo.getCards();
  }

  /**
   * Get card by ID
   */
  public static getCardById(id: string): CreditCardIntelligence | undefined {
    return this.repo.getCardById(id);
  }

  /**
   * Filter cards by spending category match
   */
  public static getCardsByCategory(category: TransactionCategory): CreditCardIntelligence[] {
    return this.getAllCards().filter((card) => card.categories.includes(category));
  }

  /**
   * Filter cards by Bank/Issuer name
   */
  public static getCardsByIssuer(issuer: string): CreditCardIntelligence[] {
    return this.getAllCards().filter((card) => card.issuer.toLowerCase() === issuer.toLowerCase());
  }

  /**
   * Filter cards by Premium Tier
   */
  public static getPremiumCards(tier?: PremiumTier): CreditCardIntelligence[] {
    if (tier) {
      return this.getAllCards().filter((card) => card.premiumTier === tier);
    }
    return this.getAllCards().filter(
      (card) => card.premiumTier === 'super_premium' || card.premiumTier === 'premium'
    );
  }

  /**
   * Search cards by title, benefit, or category query
   */
  public static searchCards(query: string): CreditCardIntelligence[] {
    const q = query.toLowerCase().trim();
    if (!q) return this.getAllCards();

    return this.getAllCards().filter(
      (card) =>
        card.cardName.toLowerCase().includes(q) ||
        card.issuer.toLowerCase().includes(q) ||
        card.topBenefit.toLowerCase().includes(q) ||
        card.categories.some((cat) => cat.toLowerCase().includes(q))
    );
  }

  /**
   * Compare multiple cards and produce structured comparison output
   */
  public static compareCards(cardIds: string[]): CardComparisonResult {
    const allCards = this.getAllCards();
    const targetCards = allCards.filter((c) => cardIds.includes(c.id));
    const comparisonList = targetCards.length > 0 ? targetCards : allCards.slice(0, 2);

    const features: CardComparisonFeature[] = comparisonList.map((card) => {
      let premiumScore = 50;
      if (card.premiumTier === 'super_premium') premiumScore = 98;
      else if (card.premiumTier === 'premium') premiumScore = 85;
      else if (card.premiumTier === 'entry') premiumScore = 65;

      return {
        cardId: card.id,
        cardName: card.cardName,
        issuer: card.issuer,
        annualFee: card.annualFee,
        rewardRate: card.rewardRate,
        loungeAccess: card.loungeAccess,
        forexMarkup: card.forexMarkup,
        fuel: card.fuelBenefits,
        diningBenefit: card.categories.includes('dining') ? 'High Rewards/Cashback' : 'Standard',
        travelBenefit: card.categories.includes('travel') ? 'Miles / Lounge Access' : 'Standard',
        shoppingBenefit: card.categories.includes('shopping') ? '5% Instant Discount' : 'Standard',
        premiumScore,
      };
    });

    const winner = features.reduce(
      (best, cur) => (cur.premiumScore > best.premiumScore ? cur : best),
      features[0]
    );

    return {
      cards: features,
      winnerId: winner.cardId,
      summary: `${winner.cardName} ranks highest with a Premium Score of ${winner.premiumScore}/100.`,
    };
  }

  /**
   * Get single featured card for UI placement
   */
  public static getFeaturedCard(): CreditCardIntelligence {
    return this.getAllCards()[0];
  }
}

/**
 * React hook wrapper for consuming Card Intelligence Engine
 */
export function useCardIntelligence() {
  return {
    allCards: CardEngine.getAllCards(),
    featuredCard: CardEngine.getFeaturedCard(),
    searchCards: CardEngine.searchCards,
    compareCards: CardEngine.compareCards,
    getCardsByCategory: CardEngine.getCardsByCategory,
  };
}
