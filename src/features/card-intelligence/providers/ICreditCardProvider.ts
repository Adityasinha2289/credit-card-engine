import type { CreditCardIntelligence } from '../types';

export interface ICreditCardProvider {
  /**
   * Retrieves all available credit cards.
   */
  getCards(): CreditCardIntelligence[];
}
