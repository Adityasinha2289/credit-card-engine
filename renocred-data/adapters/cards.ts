import { loadCards } from '../loaders';
import { CreditCard } from '../types';

/**
 * Retrieves all credit cards from the dataset.
 * 
 * @returns {ReadonlyArray<CreditCard>} List of all credit cards.
 */
export function getAllCards(): ReadonlyArray<CreditCard> {
  return loadCards();
}

/**
 * Retrieves a credit card by its unique source_id or id.
 * 
 * @param {string} id The unique identifier.
 * @returns {CreditCard | undefined} The matched credit card or undefined.
 */
export function getCardById(id: string): CreditCard | undefined {
  return getAllCards().find(card => card.source_id === id || card.id === id);
}

/**
 * Retrieves a credit card by its exact title (case-insensitive).
 * 
 * @param {string} name The card title.
 * @returns {CreditCard | undefined} The matched credit card or undefined.
 */
export function getCardByName(name: string): CreditCard | undefined {
  return getAllCards().find(card => card.card_title.toLowerCase() === name.toLowerCase());
}

/**
 * Retrieves all credit cards associated with a specific issuer.
 * 
 * @param {string} issuer The issuer name (e.g., "HDFC Bank").
 * @returns {CreditCard[]} List of credit cards from the issuer.
 */
export function getCardsByIssuer(issuer: string): CreditCard[] {
  return getAllCards().filter(card => card.issuer?.toLowerCase() === issuer.toLowerCase());
}

/**
 * Retrieves all credit cards associated with a specific payment network.
 * 
 * @param {string} network The network name (e.g., "Visa", "Mastercard").
 * @returns {CreditCard[]} List of credit cards on the network.
 */
export function getCardsByNetwork(network: string): CreditCard[] {
  return getAllCards().filter(card => card.network?.toLowerCase() === network.toLowerCase());
}
