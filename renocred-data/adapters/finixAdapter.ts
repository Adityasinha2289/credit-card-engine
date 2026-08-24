import type { CreditCard } from '../types';
import type { CanonicalCard } from '../types/canonical';
import type { FinixCard, SpendCategory, CardRewardRate } from '../../src/features/finix/data/cardDataset';
import { DatasetNormalizer } from '../normalizers/DatasetNormalizer';

/**
 * Type guard to distinguish CanonicalCard from legacy CreditCard.
 */
function isCanonicalCard(card: unknown): card is CanonicalCard {
  return typeof card === 'object' && card !== null && 'identity' in card && typeof (card as Record<string, unknown>).identity === 'object';
}

/**
 * Normalizes and preserves card network truth.
 * Standard network names are capitalized properly.
 * Networks like 'Diners Club' are preserved without mutation to Visa.
 */
function normalizeNetwork(network?: string | null): 'Visa' | 'Mastercard' | 'Amex' | 'RuPay' | string {
  if (!network) return 'Visa';
  
  const trimmed = network.trim();
  const lower = trimmed.toLowerCase();
  
  if (lower.includes('visa')) return 'Visa';
  if (lower.includes('master') || lower.includes('mastercard')) return 'Mastercard';
  if (lower.includes('amex') || lower.includes('american express')) return 'Amex';
  if (lower.includes('rupay')) return 'RuPay';
  
  // Preserve network truth (e.g. 'Diners Club') rather than falsely rewriting
  return trimmed;
}

/**
 * Safely parses lounge access visits.
 */
function parseLoungeAccess(canonical: CanonicalCard): number {
  if (canonical.lounge.domesticVisits !== null && canonical.lounge.domesticVisits >= 0) {
    return canonical.lounge.domesticVisits;
  }
  if (canonical.lounge.internationalVisits !== null && canonical.lounge.internationalVisits >= 0) {
    return canonical.lounge.internationalVisits;
  }
  // Check benefits array for lounge visits
  const loungeBenefit = canonical.benefits.find(b => b.category.toLowerCase().includes('lounge') && b.limit !== null && b.limit > 0);
  if (loungeBenefit && loungeBenefit.limit) {
    return loungeBenefit.limit;
  }
  return 0;
}

/**
 * Normalizes dataset category string to strict SpendCategory type.
 */
function normalizeCategory(category: string): SpendCategory {
  const validCategories: SpendCategory[] = [
    'dining', 'travel', 'groceries', 'entertainment', 'utilities',
    'shopping', 'health', 'transport', 'fuel', 'subscriptions', 'other'
  ];
  
  const lower = category.toLowerCase();
  for (const vc of validCategories) {
    if (lower.includes(vc) || vc.includes(lower)) {
      return vc;
    }
  }
  
  return 'other';
}

/**
 * Maps rewards and cashback from canonical card to legacy CardRewardRate[].
 * Preserves native rate numbers without arbitrary points-to-currency assumptions.
 */
function mapRewards(canonical: CanonicalCard): CardRewardRate[] {
  const rates: CardRewardRate[] = [];

  // 1. Cashback rates (percentages)
  if (canonical.cashback.rates && canonical.cashback.rates.length > 0) {
    for (const cb of canonical.cashback.rates) {
      if (cb.rate >= 0 && cb.rate <= 100) {
        rates.push({
          category: normalizeCategory(cb.category || 'other'),
          rate: cb.rate,
          cap: cb.cap ?? undefined,
        });
      }
    }
  }

  // 2. Points / Miles earning rules
  // Legacy FinixCard expects percentages. Earning rules might contain raw point values
  // (e.g., 50000 points for welcome bonus). We filter out anything > 100 to prevent
  // the UI from showing "50000% cashback".
  if (canonical.rewards.earningRules && canonical.rewards.earningRules.length > 0) {
    for (const rule of canonical.rewards.earningRules) {
      if (rule.rate >= 0 && rule.rate <= 100) {
        rates.push({
          category: normalizeCategory(rule.category || 'other'),
          rate: rule.rate,
          cap: undefined,
        });
      }
    }
  }

  return rates;
}

/**
 * Extracts base reward rate without fabricating a 1.0% or 0% reward for unknown rewards.
 */
function extractBaseRewardRate(rewards: CardRewardRate[], canonical: CanonicalCard): number | null {
  if (canonical.rewards.baseRate !== null && canonical.rewards.baseRate >= 0) {
    return canonical.rewards.baseRate;
  }

  if (rewards.length === 0) {
    // If rewards are completely unknown, return null (do not fabricate numbers)
    return null;
  }
  
  const genericReward = rewards.find(r => r.category === 'other');
  if (genericReward) return genericReward.rate;
  
  const rateValues = rewards.map(r => r.rate);
  return Math.min(...rateValues);
}

/**
 * Extracts highlights from benefits or features.
 */
function extractHighlights(canonical: CanonicalCard): string[] {
  if (canonical.benefits && canonical.benefits.length > 0) {
    return canonical.benefits.map(b => b.description).filter(Boolean).slice(0, 3);
  }
  if (canonical.features && canonical.features.length > 0) {
    return canonical.features.map(f => f.rawText).filter(Boolean).slice(0, 3);
  }
  return [];
}

/**
 * Converts a CanonicalCard (or legacy CreditCard) into a FinixCard.
 * Preserves financial truth without fabricating numbers for unknown values.
 * 
 * @param card CanonicalCard or legacy CreditCard
 * @returns FinixCard conforming to legacy runtime contract
 */
export function toFinixCard(card: CanonicalCard | CreditCard): FinixCard {
  const canonical: CanonicalCard = isCanonicalCard(card)
    ? card
    : DatasetNormalizer.normalizeCard(card).card;

  const mappedRewards = mapRewards(canonical);
  const network = normalizeNetwork(canonical.identity.network) as FinixCard['network'];
  const annualFee = canonical.fees.annualFee !== null ? canonical.fees.annualFee.amount : null;

  const minIncome = canonical.eligibility.minimumIncome
    ?? canonical.eligibility.annualIncome
    ?? (canonical.eligibility.monthlyIncome ? canonical.eligibility.monthlyIncome * 12 : 0);

  const welcomeBenefit = canonical.benefits.find(b => b.category.toLowerCase().includes('welcome'))?.description;

  const finixCard: FinixCard & {
    dataQuality?: string;
    recommendationConfidence?: string;
  } = {
    id: canonical.identity.id,
    name: canonical.identity.name,
    bank: canonical.identity.issuer,
    network,
    first4Digits: undefined,
    annualFee,
    feeWaiverSpend: canonical.fees.feeWaiverThreshold ?? undefined,
    minIncome,
    minCibil: 0,
    welcomeBonus: welcomeBenefit,
    loungeAccess: parseLoungeAccess(canonical),
    rewards: mappedRewards,
    baseRewardRate: extractBaseRewardRate(mappedRewards, canonical),
    highlights: extractHighlights(canonical),
    // Attach extra metadata preserving quality indicators
    dataQuality: canonical.dataQuality,
    recommendationConfidence: canonical.recommendationConfidence,
  };

  return finixCard;
}
