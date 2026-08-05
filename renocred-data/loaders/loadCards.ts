import { CreditCard } from '../types';
import { safeReadJson } from './util';

/**
 * Loads the master credit card dataset.
 * 
 * @returns {ReadonlyArray<CreditCard>} Immutable array of credit cards.
 */
export function loadCards(): ReadonlyArray<CreditCard> {
  const cards = safeReadJson<CreditCard[]>('datasets/master_dataset.json', 'MasterDataset');
  // Freeze the top-level array to prevent accidental mutations
  return Object.freeze(cards);
}
