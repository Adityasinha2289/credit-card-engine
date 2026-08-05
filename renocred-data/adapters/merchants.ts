import { loadMetadata } from '../loaders';

/**
 * Retrieves a list of all known merchants integrated into reward or benefit structures.
 * 
 * @returns {ReadonlyArray<string>} List of merchant names.
 */
export function getKnownMerchants(): ReadonlyArray<string> {
  return loadMetadata().merchants;
}

/**
 * Verifies if a merchant exists in the dataset.
 * 
 * @param {string} merchant The merchant name to check.
 * @returns {boolean} True if the merchant is known, otherwise false.
 */
export function merchantExists(merchant: string): boolean {
  return getKnownMerchants().some(m => m.toLowerCase() === merchant.toLowerCase());
}
