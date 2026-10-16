/**
 * Legacy catalog (MASTER_CARD_DATASET / CARD_DATASET, "FinixCard") → FinancialCard.
 *
 * The legacy dataset is the only source with usable per-category rates today
 * (the canonical 518-card master has earning rules for ~13% of cards), so the
 * unified engine runs on it through this adapter.
 *
 * Semantics of the legacy data, made explicit here:
 *  • `rate` is the effective value in % of spend (cash-equivalent), so rules are
 *    modelled as CASHBACK/PERCENTAGE — no extra point valuation is applied.
 *  • `cap` is ₹ of reward per month for that category.
 *  • minIncome / minCibil of 0 mean "not published", not "no requirement".
 */
import type { FinixCard } from '../../finix/data/cardDataset';
import type { FinancialCard, RewardRule, RewardCap, CardEligibility, CardBenefit } from '../types';

export function legacyToFinancialCard(card: FinixCard): FinancialCard {
  const rewardRules: RewardRule[] = [];
  const caps: RewardCap[] = [];

  for (const r of card.rewards ?? []) {
    if (!(r.rate >= 0)) continue;
    const id = `${card.id}:${r.category}`;
    rewardRules.push({
      id,
      categoryId: r.category,
      rewardType: 'CASHBACK',
      earningMethod: 'PERCENTAGE',
      baseRate: r.rate,
      isExclusion: false,
      isBaseRule: false,
    });
    if (r.cap !== undefined && r.cap !== null && r.cap > 0) {
      caps.push({ id: `${id}:cap`, period: 'MONTHLY', unit: 'MONETARY', maxValue: r.cap, linkedRuleIds: [id] });
    }
  }

  if (card.baseRewardRate !== null && card.baseRewardRate !== undefined) {
    rewardRules.push({
      id: `${card.id}:base`,
      categoryId: 'all',
      rewardType: 'CASHBACK',
      earningMethod: 'PERCENTAGE',
      baseRate: card.baseRewardRate,
      isExclusion: false,
      isBaseRule: true,
      isUncapped: true,
    });
  }

  const eligibility: CardEligibility[] = [];
  if ((card.minIncome ?? 0) > 0 || (card.minCibil ?? 0) > 0) {
    eligibility.push({
      minIncome: card.minIncome > 0 ? card.minIncome : undefined,
      minCibil: card.minCibil > 0 ? card.minCibil : undefined,
    });
  }

  const benefits: CardBenefit[] = [];
  if (card.loungeAccess) benefits.push({ benefitType: 'LOUNGE', details: { visitsPerYear: card.loungeAccess } });
  if (card.welcomeBonus) benefits.push({ benefitType: 'WELCOME_BONUS', details: { description: card.welcomeBonus } });

  return {
    id: card.id,
    name: card.name,
    issuer: card.bank,
    network: card.network,
    annualFee: card.annualFee,
    // The legacy dataset doesn't separate joining from annual fee.
    joiningFee: 0,
    feeWaiverSpend: card.feeWaiverSpend,
    rewardRules,
    redemptionRates: [],
    caps,
    benefits,
    eligibility,
    dataProvenance: { source: 'legacy_master_dataset', rateSemantics: 'effective_value_percent' },
  };
}
