import type { ICreditCardProvider } from './ICreditCardProvider';
import type { CreditCardIntelligence } from '../types';
import { toCreditCardIntelligence } from '../adapters/intelligenceAdapter';

// Important: Directly importing JSON ensures Vite can bundle it for browser environments 
// without relying on Node.js `fs` modules inside `renocred-data/loaders`.
import cardsRaw from '../../../../renocred-data/datasets/master_dataset.json';
import shadowMasterRaw from '../../../../renocred-data/datasets/renocred_card_master.json';
import { DatasetNormalizer } from '../../../../renocred-data/normalizers/DatasetNormalizer';
import type { CreditCard } from '../../../../renocred-data/types';

export type DatasetMode = 'production' | 'canonical-518' | 'legacy-209';

export class RenocredDataProvider implements ICreditCardProvider {
  private mode: DatasetMode;
  private cachedCards: CreditCardIntelligence[] | null = null;

  constructor(mode: DatasetMode = 'production') {
    this.mode = mode;
  }

  public getCards(): CreditCardIntelligence[] {
    if (this.cachedCards) {
      return this.cachedCards;
    }

    if (this.mode === 'legacy-209') {
      const rawData = (cardsRaw as any).cards || cardsRaw;
      const cards = Array.isArray(rawData) ? rawData as CreditCard[] : [];
      this.cachedCards = toCreditCardIntelligence(cards);
      return this.cachedCards;
    }

    // Default 'production' and 'canonical-518' load the 518-card canonical master dataset
    const canonicalResults = DatasetNormalizer.normalizeAll(shadowMasterRaw);
    this.cachedCards = toCreditCardIntelligence(canonicalResults.map(r => r.card));
    return this.cachedCards;
  }
}
