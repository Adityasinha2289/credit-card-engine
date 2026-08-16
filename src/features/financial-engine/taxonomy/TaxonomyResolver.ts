/**
 * Category & Taxonomy Resolver Infrastructure
 * Provides structural taxonomy hierarchy and deterministic category resolution.
 */

export interface NormalizedCategory {
  id: string;
  name: string;
  parentId?: string;
  description?: string;
  standardMccCodes?: string[];
}

export interface MerchantEntity {
  id: string;
  name: string;
  defaultCategoryId: string;
  aliases: string[];
}

export class TaxonomyResolver {
  
  // Standard Top-Level Transaction Categories
  public static readonly STANDARD_CATEGORIES: NormalizedCategory[] = [
    { id: 'dining', name: 'Dining & Restaurants', standardMccCodes: ['5812', '5814', '5813'] },
    { id: 'travel', name: 'Travel & Lodging', standardMccCodes: ['3000-3350', '4511', '7011'] },
    { id: 'groceries', name: 'Groceries & Supermarkets', standardMccCodes: ['5411', '5422', '5499'] },
    { id: 'shopping', name: 'Online & Retail Shopping', standardMccCodes: ['5311', '5964', '5999'] },
    { id: 'utilities', name: 'Utilities & Telecom', standardMccCodes: ['4814', '4900'] },
    { id: 'fuel', name: 'Fuel & Gas Stations', standardMccCodes: ['5541', '5542'] },
    { id: 'entertainment', name: 'Entertainment & Movies', standardMccCodes: ['7832', '7922', '7999'] },
    { id: 'transport', name: 'Transport & Commute', standardMccCodes: ['4121', '4784'] },
    { id: 'health', name: 'Health & Medical', standardMccCodes: ['8011', '8099', '5912'] },
    { id: 'subscriptions', name: 'Digital Subscriptions', standardMccCodes: ['5818', '5735'] },
    { id: 'other', name: 'General & Other Retail', standardMccCodes: [] }
  ];

  // Structural subcategory hierarchy
  public static readonly SUBCATEGORIES: NormalizedCategory[] = [
    { id: 'flights', name: 'Flights & Airlines', parentId: 'travel', standardMccCodes: ['4511'] },
    { id: 'hotels', name: 'Hotels & Accommodation', parentId: 'travel', standardMccCodes: ['7011'] },
    { id: 'railways', name: 'Railways (IRCTC)', parentId: 'travel', standardMccCodes: ['4112'] },
    { id: 'food_delivery', name: 'Food Delivery Apps', parentId: 'dining', standardMccCodes: ['5812'] },
    { id: 'quick_commerce', name: 'Quick Commerce / 10-min delivery', parentId: 'groceries', standardMccCodes: ['5411'] },
    { id: 'ott_streaming', name: 'OTT & Streaming Services', parentId: 'subscriptions', standardMccCodes: ['5818'] }
  ];

  /**
   * Normalizes a raw category string to standard category taxonomy ID.
   */
  public static normalizeCategory(rawCategory: string): string {
    const clean = rawCategory.trim().toLowerCase();

    // Direct Category Match
    const direct = this.STANDARD_CATEGORIES.find(c => c.id === clean || c.name.toLowerCase() === clean);
    if (direct) return direct.id;

    // Subcategory Match
    const sub = this.SUBCATEGORIES.find(s => s.id === clean || s.name.toLowerCase() === clean);
    if (sub) return sub.id;

    // Common synonyms / cleanups
    if (clean.includes('dining') || clean.includes('restaurant') || clean.includes('food')) return 'dining';
    if (clean.includes('flight') || clean.includes('hotel') || clean.includes('travel') || clean.includes('airline')) return 'travel';
    if (clean.includes('grocer') || clean.includes('supermarket')) return 'groceries';
    if (clean.includes('shop') || clean.includes('retail') || clean.includes('apparel') || clean.includes('electronics')) return 'shopping';
    if (clean.includes('utilit') || clean.includes('telecom') || clean.includes('bill') || clean.includes('electricity')) return 'utilities';
    if (clean.includes('fuel') || clean.includes('petrol') || clean.includes('gas')) return 'fuel';
    if (clean.includes('movie') || clean.includes('cinema') || clean.includes('entertainment')) return 'entertainment';
    if (clean.includes('cab') || clean.includes('taxi') || clean.includes('transport') || clean.includes('commute')) return 'transport';
    if (clean.includes('pharmacy') || clean.includes('health') || clean.includes('medical')) return 'health';
    if (clean.includes('subscript') || clean.includes('ott') || clean.includes('streaming')) return 'subscriptions';

    return clean; // Retain exact string if unmapped
  }

  /**
   * Gets parent category ID for a subcategory.
   */
  public static getParentCategory(categoryId: string): string | null {
    const sub = this.SUBCATEGORIES.find(s => s.id === categoryId);
    return sub ? sub.parentId || null : null;
  }
}
