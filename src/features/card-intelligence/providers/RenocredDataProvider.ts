import type { ICreditCardProvider } from './ICreditCardProvider';
import type { CreditCardIntelligence } from '../types';
import { toCreditCardIntelligence } from '../adapters/intelligenceAdapter';

// Important: Directly importing JSON ensures Vite can bundle it for browser environments 
// without relying on Node.js `fs` modules inside `renocred-data/loaders`.
import cardsRaw from '../../../../renocred-data/datasets/master_dataset.json';
import type { CreditCard } from '../../../../renocred-data/types';

export class RenocredDataProvider implements ICreditCardProvider {
  private cachedCards: CreditCardIntelligence[] | null = null;

  public getCards(): CreditCardIntelligence[] {
    if (this.cachedCards) {
      return this.cachedCards;
    }

    const rawData = (cardsRaw as any).cards || cardsRaw;
    const cards = Array.isArray(rawData) ? rawData as CreditCard[] : [];
    
    // Convert and validate the raw dataset
    this.cachedCards = toCreditCardIntelligence(cards);
    
    return this.cachedCards;
  }
}
