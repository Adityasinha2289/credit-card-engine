import { MerchantRepository } from '../merchant-intelligence/merchantRepository';
import type { ResolvedMerchant } from './recommendationTypes';
import type { TransactionCategory } from '../dashboard/types/dashboard.types';

export class MerchantResolver {
  private static repo = MerchantRepository.getInstance();

  private static ALIASES: Record<string, string> = {
    amazon: 'merch-amazon',
    'amazon.in': 'merch-amazon',
    'amazon india': 'merch-amazon',
    'amazon pay': 'merch-amazon',
    swiggy: 'merch-swiggy',
    'swiggy food': 'merch-swiggy',
    'swiggy instamart': 'merch-swiggy',
    instamart: 'merch-swiggy',
    zomato: 'merch-zomato',
    'zomato food': 'merch-zomato',
    'zomato food delivery': 'merch-zomato',
    flipkart: 'merch-flipkart',
    myntra: 'merch-myntra',
    'myntra fashion': 'merch-myntra',
    makemytrip: 'merch-makemytrip',
    mmt: 'merch-makemytrip',
    irctc: 'merch-irctc',
    'irctc train': 'merch-irctc',
    'irctc train booking': 'merch-irctc',
    hpcl: 'merch-hpcl',
    'hpcl fuel': 'merch-hpcl',
    'hpcl fuel station': 'merch-hpcl',
    iocl: 'merch-iocl',
    indianoil: 'merch-iocl',
    'indianoil fuel station': 'merch-iocl',
    bpcl: 'merch-bpcl',
    'bpcl fuel': 'merch-bpcl',
    'bpcl fuel station': 'merch-bpcl',
    electricity: 'merch-electricity',
    bescom: 'merch-electricity',
    'electricity board (bescom / state)': 'merch-electricity',
    broadband: 'merch-broadband',
    airtel: 'merch-broadband',
    'airtel fiber': 'merch-broadband',
    'airtel fiber broadband': 'merch-broadband',
    insurance: 'merch-insurance',
    lic: 'merch-insurance',
    'lic / hdfc ergo insurance': 'merch-insurance',
    government: 'merch-gov-payment',
    gst: 'merch-gov-payment',
    'government gst & tax portal': 'merch-gov-payment',
    apollo: 'merch-apollo',
    'apollo pharmacy': 'merch-apollo',
    'apollo pharmacy & health': 'merch-apollo',
    bookmyshow: 'merch-bookmyshow',
    bms: 'merch-bookmyshow',
    croma: 'merch-croma',
    'croma electronics': 'merch-croma',
    'reliance digital': 'merch-reliance-digital',
    uber: 'merch-uber',
    'uber rides': 'merch-uber',
    dmart: 'merch-d-mart',
    'dmart ready & supermarket': 'merch-d-mart',
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
