import type { CreditCardIntelligence, CardNetwork, RewardType, PremiumTier, TransactionCategory } from '../types';
import type { CreditCard } from '../../../../renocred-data/types';
import type { CanonicalCard } from '../../../../renocred-data/types/canonical';
import { DatasetNormalizer } from '../../../../renocred-data/normalizers/DatasetNormalizer';

/**
 * Type guard to distinguish CanonicalCard from legacy CreditCard.
 */
function isCanonicalCard(card: unknown): card is CanonicalCard {
  return typeof card === 'object' && card !== null && 'identity' in card && typeof (card as Record<string, unknown>).identity === 'object';
}

/**
 * Validates and maps CanonicalCard or CreditCard objects to CreditCardIntelligence schema.
 */
export function toCreditCardIntelligence(cards: (CanonicalCard | CreditCard)[]): CreditCardIntelligence[] {
  const result: CreditCardIntelligence[] = [];
  const seenIds = new Set<string>();

  for (const raw of cards) {
    const canonical: CanonicalCard = isCanonicalCard(raw)
      ? raw
      : DatasetNormalizer.normalizeCard(raw).card;

    const id = canonical.identity.id;
    const cardName = canonical.identity.name;
    const issuer = canonical.identity.issuer;

    // 1. Validate required fields
    if (!id || id.trim() === '') {
      console.warn(`[IntelligenceAdapter] Skipping card with missing ID: ${cardName}`);
      continue;
    }

    // 2. Prevent duplicates in runtime array
    if (seenIds.has(id)) {
      console.warn(`[IntelligenceAdapter] Skipping duplicate card ID: ${id}`);
      continue;
    }
    seenIds.add(id);

    // 3. Network mapping (Preserve truth)
    const network = mapNetwork(canonical.identity.network);

    // 4. Annual fee & joining fee
    const annualFee = canonical.fees.annualFee !== null ? canonical.fees.annualFee.amount : null;
    const joiningFee = canonical.fees.joiningFee !== null ? canonical.fees.joiningFee.amount : annualFee;

    // 5. Tier & Rewards
    const premiumTier = mapPremiumTier(canonical.identity.networkTier, annualFee);
    const { rewardType, rewardRate } = calculateRewardRate(canonical);
    const loungeAccess = mapLoungeAccess(canonical);
    const forexMarkup = canonical.fees.forexMarkup ?? (canonical.travelInternational.forexMarkup ?? null);
    const fuelBenefits = mapFuelBenefits(canonical);
    const welcomeBenefits = mapWelcomeBenefits(canonical);
    const milestoneBenefits = canonical.milestones.map(m => typeof m.description === 'string' ? m.description : '').filter(Boolean);

    const categories = mapCategories(canonical);

    const topBenefit = canonical.benefits[0]?.description
      || canonical.features[0]?.rawText
      || 'Standard card benefits';

    const intelCard: CreditCardIntelligence & {
      dataQuality?: string;
      recommendationConfidence?: string;
    } = {
      id,
      issuer,
      network,
      cardName,
      annualFee,
      joiningFee,
      rewardType,
      rewardRate,
      loungeAccess,
      forexMarkup,
      fuelBenefits,
      welcomeBenefits,
      milestoneBenefits,
      eligibility: {
        minSalary: canonical.eligibility.minimumIncome ?? canonical.eligibility.annualIncome ?? undefined,
        minCreditScore: undefined,
      },
      categories,
      premiumTier,
      topBenefit,
      isDeprecated: canonical.lifecycleStatus === 'DISCONTINUED',
      dataQuality: canonical.dataQuality,
      recommendationConfidence: canonical.recommendationConfidence,
    };

    result.push(intelCard);
  }

  return result;
}

function mapNetwork(networkStr?: string | null): CardNetwork {
  if (!networkStr) return 'Visa';
  const l = networkStr.toLowerCase();
  if (l.includes('visa')) return 'Visa';
  if (l.includes('master')) return 'Mastercard';
  if (l.includes('amex') || l.includes('american')) return 'American Express';
  if (l.includes('rupay')) return 'RuPay';
  
  // Return preserved network string as CardNetwork compatibility
  return networkStr as CardNetwork;
}

function mapPremiumTier(tier?: string | null, fee?: number | null): PremiumTier {
  if (fee === 0) return 'no_fee';
  if (tier) {
    const l = tier.toLowerCase();
    if (l.includes('super')) return 'super_premium';
    if (l.includes('premium')) return 'premium';
  }
  if (fee && fee >= 10000) return 'super_premium';
  if (fee && fee >= 3000) return 'premium';
  return 'entry';
}

function calculateRewardRate(canonical: CanonicalCard): { rewardType: RewardType; rewardRate: string } {
  // 1. Check cashback rates
  if (canonical.cashback.rates && canonical.cashback.rates.length > 0) {
    const firstRate = canonical.cashback.rates[0];
    const rateTypeStr = firstRate.rateType === 'UP_TO' ? 'Up to ' : '';
    return {
      rewardType: 'cashback',
      rewardRate: `${rateTypeStr}${firstRate.rate}% cashback`,
    };
  }

  // 2. Check points earning rules
  if (canonical.rewards.earningRules && canonical.rewards.earningRules.length > 0) {
    const firstRule = canonical.rewards.earningRules[0];
    const isMiles = firstRule.condition.toLowerCase().includes('mile') || (canonical.rewards.rewardType?.toLowerCase().includes('mile') ?? false);
    const unit = isMiles ? 'miles' : 'points';
    
    return {
      rewardType: isMiles ? 'miles' : 'points',
      rewardRate: `${firstRule.rate} ${unit} on ${firstRule.category || 'spends'}`,
    };
  }

  // 3. Check base rate
  if (canonical.rewards.baseRate !== null && canonical.rewards.baseRate > 0) {
    return {
      rewardType: 'rewards',
      rewardRate: `${canonical.rewards.baseRate}% base rewards`,
    };
  }

  // 4. If rewards are unknown, do not fabricate 1%
  return {
    rewardType: 'rewards',
    rewardRate: 'Terms unconfirmed',
  };
}

function mapLoungeAccess(canonical: CanonicalCard): string {
  if (canonical.lounge.domesticVisits !== null && canonical.lounge.domesticVisits > 0) {
    const freq = canonical.lounge.frequency ? ` per ${canonical.lounge.frequency.toLowerCase()}` : '/year';
    return `${canonical.lounge.domesticVisits} domestic visits${freq}`;
  }

  if (canonical.lounge.internationalVisits !== null && canonical.lounge.internationalVisits > 0) {
    const freq = canonical.lounge.frequency ? ` per ${canonical.lounge.frequency.toLowerCase()}` : '/year';
    return `${canonical.lounge.internationalVisits} international visits${freq}`;
  }

  if (canonical.lounge.available === 'AVAILABLE') {
    return 'Complimentary Lounge Access';
  }

  const loungeBenefit = canonical.benefits.find(b => b.category.toLowerCase().includes('lounge'));
  if (loungeBenefit) {
    return loungeBenefit.description;
  }

  return 'None';
}

function mapFuelBenefits(canonical: CanonicalCard): string {
  const fuel = canonical.benefits.find(b => b.category.toLowerCase().includes('fuel'));
  if (fuel) return fuel.description;
  const fuelFeature = canonical.features.find(f => f.rawText.toLowerCase().includes('fuel surcharge'));
  if (fuelFeature) return fuelFeature.rawText;
  return 'None';
}

function mapWelcomeBenefits(canonical: CanonicalCard): string[] {
  return canonical.benefits
    .filter(b => b.category.toLowerCase().includes('welcome'))
    .map(b => b.description);
}

function mapCategories(canonical: CanonicalCard): TransactionCategory[] {
  const categoriesSet = new Set<TransactionCategory>();
  const validCategories: TransactionCategory[] = [
    'dining', 'shopping', 'travel', 'groceries', 'fuel',
    'entertainment', 'utilities', 'health', 'transport', 'subscriptions', 'other'
  ];

  // Collect from cashback categories
  for (const c of canonical.cashback.categories) {
    const l = c.toLowerCase();
    for (const vc of validCategories) {
      if (l.includes(vc) || vc.includes(l)) categoriesSet.add(vc);
    }
  }

  // Collect from earning rules
  if (canonical.rewards.earningRules) {
    for (const r of canonical.rewards.earningRules) {
      const l = r.category.toLowerCase();
      for (const vc of validCategories) {
        if (l.includes(vc) || vc.includes(l)) categoriesSet.add(vc);
      }
    }
  }

  // Collect from benefits
  for (const b of canonical.benefits) {
    const l = b.category.toLowerCase();
    for (const vc of validCategories) {
      if (l.includes(vc) || vc.includes(l)) categoriesSet.add(vc);
    }
  }

  if (categoriesSet.size === 0) {
    categoriesSet.add('other');
  }

  return Array.from(categoriesSet);
}
