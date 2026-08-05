import type { FinixCard } from '../cardDataset';

export interface ICardDataSource {
  getCards(): FinixCard[];
}
