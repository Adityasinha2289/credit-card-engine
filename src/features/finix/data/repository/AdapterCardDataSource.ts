import type { ICardDataSource } from './ICardDataSource';
import type { FinixCard } from '../cardDataset';
import { toFinixCard } from '../../../../../renocred-data/adapters/finixAdapter';
import newDataset from '../../../../../renocred-data/datasets/master_dataset.json';
import type { CreditCard } from '../../../../../renocred-data/types';

export class AdapterCardDataSource implements ICardDataSource {
  getCards(): FinixCard[] {
    return (newDataset as CreditCard[]).map(toFinixCard);
  }
}
