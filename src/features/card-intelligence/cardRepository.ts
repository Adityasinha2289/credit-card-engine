import type { CreditCardIntelligence, CardDataSource } from './types';
import { MOCK_CARDS_INTELLIGENCE } from './mockCards';

export class CardRepository implements CardDataSource {
  private static instance: CardRepository;
  private cards: CreditCardIntelligence[] = MOCK_CARDS_INTELLIGENCE;

  public static getInstance(): CardRepository {
    if (!CardRepository.instance) {
      CardRepository.instance = new CardRepository();
    }
    return CardRepository.instance;
  }

  public getCards(): CreditCardIntelligence[] {
    return this.cards.filter((c) => !c.isDeprecated);
  }

  public getCardById(id: string): CreditCardIntelligence | undefined {
    return this.cards.find((c) => c.id === id);
  }

  public setCards(newCards: CreditCardIntelligence[]) {
    this.cards = newCards;
  }
}
