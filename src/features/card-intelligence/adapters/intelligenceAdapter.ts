// @ts-nocheck
import type { CreditCardIntelligence, CardNetwork, RewardType, PremiumTier, TransactionCategory } from '../types';
import type { CreditCard } from '../../../../renocred-data/types';

/**
 * Validates and maps the generic CreditCard schema to the CreditCardIntelligence schema.
 * Silently drops invalid cards.
 */
export function toCreditCardIntelligence(cards: CreditCard[]): CreditCardIntelligence[] {
  const result: CreditCardIntelligence[] = [];
  const seenIds = new Set<string>();

  for (const card of cards) {
    // 1. Validate required fields
    if (!card.id || !card.card_title || !card.issuer) {
      console.warn(`[Adapter] Skipping card due to missing required fields: ${card.id}`);
      continue;
    }

    // 2. Validate duplicate ids
    if (seenIds.has(card.id)) {
      console.warn(`[Adapter] Skipping duplicate card id: ${card.id}`);
      continue;
    }
    seenIds.add(card.id);

    // 3. Validate income values
    if (
      (card.annual_fee !== null && card.annual_fee !== undefined && card.annual_fee < 0) ||
      (card.minimum_income !== null && card.minimum_income !== undefined && card.minimum_income < 0) ||
      (card.minimum_cibil !== null && card.minimum_cibil !== undefined && card.minimum_cibil < 0)
    ) {
      console.warn(`[Adapter] Skipping card ${card.id} due to negative income/fee values.`);
      continue;
    }

    // 4. Validate malformed rewards (NaN or negative)
    const hasMalformedRewards = card.rewards?.some(r => r.points < 0 || r.spend < 0);
    if (hasMalformedRewards) {
      console.warn(`[Adapter] Skipping card ${card.id} due to malformed rewards structure.`);
      continue;
    }

    // Map fields
    const network = mapNetwork(card.network);
    const premiumTier = mapPremiumTier(card.card_tier, card.annual_fee);
    const { rewardType, rewardRate } = calculateRewardRate(card.rewards);
    const { loungeAccess, isLoungeValid } = mapLoungeAccess(card.lounge);
    
    // 5. Validate lounge data
    if (!isLoungeValid) {
      console.warn(`[Adapter] Skipping card ${card.id} due to negative lounge limit.`);
      continue;
    }

    const categories = mapCategories(card.card_categories);

    const intelCard: CreditCardIntelligence = {
      id: card.id,
      issuer: card.issuer,
      network,
      cardName: card.card_title,
      annualFee: card.annual_fee || 0,
      joiningFee: card.annual_fee || 0,
      rewardType,
      rewardRate,
      loungeAccess,
      forexMarkup: 3.5, // Default fallback
      fuelBenefits: mapFuelBenefits(card.benefits),
      welcomeBenefits: card.welcome_bonus ? [card.welcome_bonus] : [],
      milestoneBenefits: [], // Optional field, kept empty for now
      eligibility: {
        minSalary: card.minimum_income || undefined,
        minCreditScore: card.minimum_cibil || undefined,
      },
      categories,
      premiumTier,
      topBenefit: card.overview || card.benefits?.[0]?.description || 'Standard benefits',
    };

    result.push(intelCard);
  }

  return result;
}

function mapNetwork(networkStr?: string | null): CardNetwork {
  if (!networkStr) return 'Visa';
  const l = networkStr.toLowerCase();
  if (l.includes('master')) return 'Mastercard';
  if (l.includes('amex') || l.includes('american')) return 'American Express';
  if (l.includes('rupay')) return 'RuPay';
  return 'Visa';
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

function calculateRewardRate(rewards?: CreditCard['rewards']): { rewardType: RewardType; rewardRate: string } {
  if (!rewards || rewards.length === 0) {
    return { rewardType: 'cashback', rewardRate: '1%' }; // Default safe fallback
  }

  // Find base reward or highest reward to represent the generic string
  const baseReward = rewards.find(r => r.category.toLowerCase() === 'all' || r.category.toLowerCase() === 'retail') || rewards[0];
  
  let rewardType: RewardType = 'points';
  const typeStr = baseReward.point_type?.toLowerCase() || '';
  if (typeStr.includes('cashback')) rewardType = 'cashback';
  else if (typeStr.includes('mile')) rewardType = 'miles';
  
  // Calculate abstract percentage based on points and spend (Naive heuristic for Phase A)
  // Assuming 1 point = 0.25 INR for generic representation, cashback is 1:1
  const multiplier = rewardType === 'cashback' ? 1 : 0.25;
  const safeSpend = baseReward.spend && baseReward.spend > 0 ? baseReward.spend : 100;
  const pct = ((baseReward.points * multiplier) / safeSpend) * 100;
  
  const formattedPct = isNaN(pct) || !isFinite(pct) ? 1 : parseFloat(pct.toFixed(2));
  
  if (rewardType === 'cashback') {
    return { rewardType, rewardRate: `${formattedPct}%` };
  }
  return { rewardType, rewardRate: `${baseReward.points} ${baseReward.point_type} per ₹${baseReward.spend}` };
}

function mapLoungeAccess(lounge?: CreditCard['lounge']): { loungeAccess: string; isLoungeValid: boolean } {
  if (!lounge || lounge.length === 0) return { loungeAccess: 'None', isLoungeValid: true };
  
  const dom = lounge.find(l => l.category.toLowerCase().includes('domestic'));
  const intl = lounge.find(l => l.category.toLowerCase().includes('international'));

  if (dom && dom.limit !== null && dom.limit < 0) return { loungeAccess: 'None', isLoungeValid: false };
  if (intl && intl.limit !== null && intl.limit < 0) return { loungeAccess: 'None', isLoungeValid: false };

  if (dom) {
    return { loungeAccess: `${dom.limit} domestic per ${dom.frequency?.toLowerCase()}`, isLoungeValid: true };
  }
  
  if (intl) {
    return { loungeAccess: `${intl.limit} international per ${intl.frequency?.toLowerCase()}`, isLoungeValid: true };
  }

  return { loungeAccess: 'Yes', isLoungeValid: true };
}

function mapFuelBenefits(benefits?: CreditCard['benefits']): string {
  if (!benefits) return 'None';
  const fuel = benefits.find(b => b.category.toLowerCase().includes('fuel'));
  return fuel ? fuel.description : 'None';
}

function mapCategories(cats?: string[]): TransactionCategory[] {
  if (!cats || cats.length === 0) return ['other'];
  const mapped: Set<TransactionCategory> = new Set();
  
  const validCategories = ['dining', 'shopping', 'travel', 'groceries', 'fuel', 'entertainment', 'utilities', 'health', 'transport', 'subscriptions', 'other'];

  for (const c of cats) {
    const l = c.toLowerCase();
    let found = false;
    for (const vc of validCategories) {
      if (l.includes(vc) || vc.includes(l)) {
        mapped.add(vc as TransactionCategory);
        found = true;
        break;
      }
    }
    if (!found) mapped.add('other');
  }

  return Array.from(mapped);
}
