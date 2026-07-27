import { MerchantRepository } from '../merchant-intelligence/merchantRepository';
import type { ResolvedMerchant } from './recommendationTypes';
import type { TransactionCategory } from '../dashboard/types/dashboard.types';

export class MerchantResolver {
  private static repo = MerchantRepository.getInstance();

  private static ALIASES: Record<string, string> = {
    amazon: 'merch-amazon',
    'amazon india': 'merch-amazon',
    'amazon pay': 'merch-amazon',
    swiggy: 'merch-swiggy',
    'swiggy food': 'merch-swiggy',
    instamart: 'merch-swiggy',
    makemytrip: 'merch-makemytrip',
    mmt: 'merch-makemytrip',
  };

  public static resolve(rawMerchantName: string, defaultCategory?: TransactionCategory): ResolvedMerchant {
    const input = rawMerchantName.trim().toLowerCase();
    const allMerchants = this.repo.getMerchants();

    // 1. Exact match by ID or Name
    const exactMatch = allMerchants.find(
      (m) => m.id.toLowerCase() === input || m.name.toLowerCase() === input
    );
    if (exactMatch) {
      return {
        merchant: exactMatch,
        matchType: 'exact',
        confidenceScore: 100,
        inferredCategory: exactMatch.category,
      };
    }

    // 2. Alias match
    const aliasId = this.ALIASES[input];
    if (aliasId) {
      const aliasMatch = this.repo.getMerchantById(aliasId);
      if (aliasMatch) {
        return {
          merchant: aliasMatch,
          matchType: 'alias',
          confidenceScore: 90,
          inferredCategory: aliasMatch.category,
        };
      }
    }

    // 3. Substring / Fuzzy match
    const substringMatch = allMerchants.find(
      (m) =>
        m.name.toLowerCase().includes(input) ||
        input.includes(m.name.toLowerCase()) ||
        m.tags.some((t) => input.includes(t.toLowerCase()))
    );

    if (substringMatch) {
      return {
        merchant: substringMatch,
        matchType: 'fuzzy',
        confidenceScore: 75,
        inferredCategory: substringMatch.category,
      };
    }

    // 4. Fallback category inference
    let inferredCategory: TransactionCategory = defaultCategory || 'shopping';
    if (input.includes('food') || input.includes('restaurant') || input.includes('dine')) {
      inferredCategory = 'dining';
    } else if (input.includes('flight') || input.includes('hotel') || input.includes('trip')) {
      inferredCategory = 'travel';
    }

    return {
      merchant: undefined,
      matchType: 'fallback',
      confidenceScore: 40,
      inferredCategory,
    };
  }
}
