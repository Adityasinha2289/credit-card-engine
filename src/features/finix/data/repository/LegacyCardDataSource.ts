import type { ICardDataSource } from './ICardDataSource';
import type { FinixCard } from '../cardDataset';
import { MASTER_CARD_DATASET } from '../masterDataset';

export class LegacyCardDataSource implements ICardDataSource {
  getCards(): FinixCard[] {
    return MASTER_CARD_DATASET;
  }
}
