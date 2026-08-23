import type { ICardDataSource } from './ICardDataSource';
import type { FinixCard } from '../cardDataset';
import { toFinixCard } from '../../../../../renocred-data/adapters/finixAdapter';
import productionDataset from '../../../../../renocred-data/datasets/master_dataset.json';
import shadowDataset from '../../../../../renocred-data/datasets/renocred_card_master.json';
import { DatasetNormalizer } from '../../../../../renocred-data/normalizers/DatasetNormalizer';
import type { CreditCard } from '../../../../../renocred-data/types';

export type DatasetMode = 'production' | 'canonical-518' | 'legacy-209';

export class AdapterCardDataSource implements ICardDataSource {
  private mode: DatasetMode;

  constructor(mode: DatasetMode = 'production') {
    this.mode = mode;
  }

  getCards(): FinixCard[] {
    if (this.mode === 'legacy-209') {
      return (productionDataset as CreditCard[]).map(toFinixCard);
    }
    // 'production' (default) and 'canonical-518' serve the 518 canonical master dataset
    const canonicalResults = DatasetNormalizer.normalizeAll(shadowDataset);
    return canonicalResults.map(r => toFinixCard(r.card));
  }
}
