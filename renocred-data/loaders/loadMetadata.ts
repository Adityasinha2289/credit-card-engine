import { Metadata } from '../types';
import { safeReadJson } from './util';

/**
 * Loads all metadata sets.
 * 
 * @returns {Readonly<Metadata>} Immutable metadata aggregations.
 */
export function loadMetadata(): Readonly<Metadata> {
  return Object.freeze({
    issuers: safeReadJson<string[]>('metadata/issuers.json', 'IssuersMetadata'),
    networks: safeReadJson<string[]>('metadata/networks.json', 'NetworksMetadata'),
    categories: safeReadJson<string[]>('metadata/categories.json', 'CategoriesMetadata'),
    merchants: safeReadJson<string[]>('metadata/merchants.json', 'MerchantsMetadata'),
    reward_types: safeReadJson<string[]>('metadata/reward_types.json', 'RewardTypesMetadata'),
    benefit_types: safeReadJson<string[]>('metadata/benefit_types.json', 'BenefitTypesMetadata'),
    fee_types: safeReadJson<string[]>('metadata/fee_types.json', 'FeeTypesMetadata'),
  });
}
