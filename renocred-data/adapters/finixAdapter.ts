import type { CreditCard } from '../types';
import type { FinixCard, SpendCategory, CardRewardRate } from '../../src/features/finix/data/cardDataset';

/**
 * Validates and normalizes the network string to match the FinixCard literal type.
 */
function normalizeNetwork(network?: string | null): 'Visa' | 'Mastercard' | 'Amex' | 'RuPay' {
  if (!network) return 'Visa';
  
  const lower = network.toLowerCase();
  if (lower.includes('visa')) return 'Visa';
  if (lower.includes('master') || lower.includes('mastercard')) return 'Mastercard';
  if (lower.includes('amex') || lower.includes('american express')) return 'Amex';
  if (lower.includes('rupay')) return 'RuPay';
  
  return 'Visa';
}

/**
 * Safely parses the first lounge limit to a number.
 */
function parseLoungeAccess(lounge: CreditCard['lounge']): number {
  if (!lounge || lounge.length === 0) return 0;
  return lounge[0].limit ?? 0;
}

/**
 * Normalizes the dataset category string to the strict SpendCategory type.
 */
function normalizeCategory(category: string): SpendCategory {
  const validCategories: SpendCategory[] = [
    'dining', 'travel', 'groceries', 'entertainment', 'utilities',
    'shopping', 'health', 'transport', 'fuel', 'subscriptions', 'other'
  ];
  
  const lower = category.toLowerCase();
  if (validCategories.includes(lower as SpendCategory)) {
    return lower as SpendCategory;
  }
  
  return 'other';
}

/**
 * Converts the new CreditCard points-based reward schema to the legacy FinixCard percentage-based schema.
 * Note: Assumes 1 point = 1 INR for compatibility purposes until the engine natively supports points.
 */
function mapRewards(rewards: CreditCard['rewards']): CardRewardRate[] {
  if (!rewards || rewards.length === 0) return [];
  
  return rewards.map(r => {
    // Legacy system uses percentages (e.g. 5 = 5%).
    // New system uses points/spend.
    // We do a naive mathematical conversion: (points / spend) * 100
    // Example: 5 points per 100 spend -> 5%
    let calculatedRate = 1; 
    if (r.spend && r.spend > 0) {
      calculatedRate = (r.points / r.spend) * 100;
    }
    
    return {
      category: normalizeCategory(r.category),
      rate: calculatedRate,
      // Caps are ignored by the legacy system, but we map it as optional if present in future
      cap: undefined 
    };
  });
}

/**
 * Extracts a fallback base reward rate. 
 */
function extractBaseRewardRate(rewards: CardRewardRate[]): number {
  if (!rewards || rewards.length === 0) return 1.0;
  
  // Try to find an 'other' or generic category
  const genericReward = rewards.find(r => r.category === 'other');
  if (genericReward) return genericReward.rate;
  
  // Fallback to the lowest rate available (safest assumption for base rate)
  const rates = rewards.map(r => r.rate);
  return Math.min(...rates);
}

/**
 * Extracts highlights from the benefits array.
 */
function extractHighlights(benefits: CreditCard['benefits']): string[] {
  if (!benefits) return [];
  return benefits.map(b => b.description).slice(0, 3);
}

/**
 * Converts a renocred-data CreditCard into a legacy FinixCard.
 * This adapter ensures the frontend application continues working without knowing the data source changed.
 * 
 * @param card The modern CreditCard object from renocred-data
 * @returns The legacy FinixCard object expected by the UI and existing engines
 */
export function toFinixCard(card: CreditCard): FinixCard {
  const mappedRewards = mapRewards(card.rewards);
  
  return {
    id: card.id,
    name: card.card_title || 'Unknown Card',
    bank: card.issuer || 'Unknown Bank',
    network: normalizeNetwork(card.network),
    first4Digits: undefined, // Deprecated in new dataset
    annualFee: card.annual_fee || 0,
    feeWaiverSpend: card.fee_waiver_spend || 0,
    minIncome: card.minimum_income || 0,
    minCibil: card.minimum_cibil || 0,
    welcomeBonus: card.welcome_bonus || undefined,
    loungeAccess: parseLoungeAccess(card.lounge),
    rewards: mappedRewards,
    baseRewardRate: extractBaseRewardRate(mappedRewards),
    highlights: extractHighlights(card.benefits),
    // gradientFrom and gradientTo are strictly omitted here as they belong in cardThemeRegistry
  };
}
