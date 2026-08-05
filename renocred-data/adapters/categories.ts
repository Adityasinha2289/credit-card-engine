import { loadMetadata, loadCards } from '../loaders';
import { CreditCard } from '../types';

/**
 * Retrieves a list of all known credit card categories.
 * 
 * @returns {ReadonlyArray<string>} List of category names.
 */
export function getCategories(): ReadonlyArray<string> {
  return loadMetadata().categories;
}

/**
 * Retrieves all credit cards that belong to a specific category.
 * 
 * @param {string} category The category name (e.g., "Cashback").
 * @returns {CreditCard[]} List of credit cards matching the category.
 */
export function getCardsByCategory(category: string): CreditCard[] {
  return loadCards().filter(card => 
    card.card_categories?.some(cat => cat.toLowerCase() === category.toLowerCase())
  );
}
