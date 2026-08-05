import { loadCards } from '../loaders';
import { CreditCard } from '../types';

/**
 * Performs a broad search across card titles, issuers, and networks.
 * 
 * @param {string} query The text to search for.
 * @returns {CreditCard[]} List of credit cards matching the search query.
 */
export function searchCards(query: string): CreditCard[] {
  const normalized = query.toLowerCase().trim();
  if (!normalized) return [];
  
  return loadCards().filter(card => 
    card.card_title.toLowerCase().includes(normalized) ||
    (card.issuer && card.issuer.toLowerCase().includes(normalized)) ||
    (card.network && card.network.toLowerCase().includes(normalized))
  );
}

/**
 * Finds a specific card by performing an exact case-insensitive match on the title.
 * 
 * @param {string} name The exact card title.
 * @returns {CreditCard | undefined} The matched card or undefined.
 */
export function findExactCard(name: string): CreditCard | undefined {
  const normalized = name.toLowerCase().trim();
  return loadCards().find(card => 
    card.card_title.toLowerCase().trim() === normalized
  );
}
