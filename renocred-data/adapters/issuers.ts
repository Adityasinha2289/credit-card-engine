import { loadMetadata } from '../loaders';

/**
 * Retrieves a list of all known credit card issuers in the dataset.
 * 
 * @returns {ReadonlyArray<string>} List of issuer names.
 */
export function getAllIssuers(): ReadonlyArray<string> {
  return loadMetadata().issuers;
}

/**
 * Verifies if an issuer exists in the dataset (case-insensitive).
 * 
 * @param {string} issuer The issuer name to check.
 * @returns {boolean} True if the issuer exists, otherwise false.
 */
export function issuerExists(issuer: string): boolean {
  return getAllIssuers().some(iss => iss.toLowerCase() === issuer.toLowerCase());
}
