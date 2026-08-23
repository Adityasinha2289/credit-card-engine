import type { ICardDataSource } from './ICardDataSource';
import { LegacyCardDataSource } from './LegacyCardDataSource';
import { AdapterCardDataSource } from './AdapterCardDataSource';
import type { FinixCard } from '../cardDataset';

// Feature Flag: Toggle between legacy dataset and new renocred-data package
export const USE_NEW_DATASET = true;

export class CardRepository {
  private static instance: CardRepository;
  private dataSource: ICardDataSource;

  private constructor() {
    this.dataSource = USE_NEW_DATASET 
      ? new AdapterCardDataSource() 
      : new LegacyCardDataSource();
  }

  public static getInstance(): CardRepository {
    if (!CardRepository.instance) {
      CardRepository.instance = new CardRepository();
    }
    return CardRepository.instance;
  }

  /**
   * Validates the raw cards from the data source, filtering out any invalid cards 
   * to guarantee system stability ("fail safely").
   */
  private validateCards(cards: FinixCard[]): FinixCard[] {
    const validCards: FinixCard[] = [];
    const seenIds = new Set<string>();

    for (const card of cards) {
      // 1. Missing IDs
      if (!card.id || card.id.trim() === '') {
        console.warn(`[CardRepository] Skipping card with missing ID:`, card.name);
        continue;
      }

      // 2. Duplicate IDs
      if (seenIds.has(card.id)) {
        console.warn(`[CardRepository] Skipping duplicate card ID:`, card.id);
        continue;
      }

      // 3. Missing required fields
      if (!card.name || !card.bank) {
        console.warn(`[CardRepository] Skipping card ${card.id} due to missing required fields (name/bank).`);
        continue;
      }

      // 4. Invalid Network
      const validNetworks = ['Visa', 'Mastercard', 'Amex', 'RuPay', 'Diners Club'];
      if (!validNetworks.includes(card.network)) {
        console.warn(`[CardRepository] Skipping card ${card.id} due to invalid network:`, card.network);
        continue;
      }

      // 5. Invalid Annual Fee
      if (card.annualFee !== null && (card.annualFee < 0 || isNaN(card.annualFee))) {
        console.warn(`[CardRepository] Skipping card ${card.id} due to invalid annual fee:`, card.annualFee);
        continue;
      }

      // 6. Invalid Rewards
      let rewardsValid = true;
      if (!Array.isArray(card.rewards)) {
        rewardsValid = false;
      } else {
        for (const reward of card.rewards) {
          if (reward.rate < 0 || isNaN(reward.rate)) {
            rewardsValid = false;
            break;
          }
        }
      }
      
      if (!rewardsValid) {
        console.warn(`[CardRepository] Skipping card ${card.id} due to invalid rewards structure or negative rate.`);
        continue;
      }

      seenIds.add(card.id);
      validCards.push(card);
    }

    return validCards;
  }

  public getCards(): FinixCard[] {
    const rawCards = this.dataSource.getCards();
    return this.validateCards(rawCards);
  }
}
