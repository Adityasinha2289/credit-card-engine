import type { CreditCardIntelligence, CardDataSource } from './types';
import type { ICreditCardProvider } from './providers/ICreditCardProvider';
import { MockCreditCardProvider } from './providers/MockCreditCardProvider';
import { RenocredDataProvider } from './providers/RenocredDataProvider';

// --- FEATURE FLAG ---
export const USE_REAL_INTELLIGENCE_DATA = true;

export class CardRepository implements CardDataSource {
  private static instance: CardRepository;
  private provider: ICreditCardProvider;
  private cachedCards: CreditCardIntelligence[] | null = null;

  private constructor() {
    this.provider = USE_REAL_INTELLIGENCE_DATA
      ? new RenocredDataProvider()
      : new MockCreditCardProvider();
  }

  public static getInstance(): CardRepository {
    if (!CardRepository.instance) {
      CardRepository.instance = new CardRepository();
    }
    return CardRepository.instance;
  }

  public getCards(): CreditCardIntelligence[] {
    if (!this.cachedCards) {
      this.cachedCards = this.provider.getCards().filter((c) => !c.isDeprecated);
    }
    return this.cachedCards;
  }

  public getCardById(id: string): CreditCardIntelligence | undefined {
    return this.getCards().find((c) => c.id === id);
  }

  // Deprecated: Setting cards manually violates the provider pattern, but kept for legacy compat
  public setCards(newCards: CreditCardIntelligence[]) {
    this.cachedCards = newCards;
  }
}
