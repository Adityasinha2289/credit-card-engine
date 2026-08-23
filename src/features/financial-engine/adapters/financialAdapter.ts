import type { CreditCard } from '../../../../renocred-data/types';
import type { FinancialCard, RewardRule, RewardType, EarningMethod, CardBenefit, CardEligibility } from '../types';

export function toFinancialCard(rawCard: CreditCard): FinancialCard | null {
  if (!rawCard.id || !rawCard.card_title || !rawCard.issuer) {
    return null;
  }

  const rewardRules: RewardRule[] = [];
  
  if (rawCard.rewards && Array.isArray(rawCard.rewards)) {
    for (const reward of rawCard.rewards) {
      const isExclusion = reward.points === 0;
      
      let rewardType: RewardType = 'UNKNOWN';
      const typeStr = reward.point_type?.toLowerCase() || '';
      if (typeStr.includes('cashback')) rewardType = 'CASHBACK';
      else if (typeStr.includes('mile')) rewardType = 'MILES';
      else if (typeStr.includes('point')) rewardType = 'POINTS';

      const rawCategory = reward.category?.toLowerCase() || 'all';
      const isBaseRule = rawCategory === 'all' || rawCategory === 'retail' || rawCategory === 'base rewards';

      const rule: RewardRule = {
        categoryId: reward.category,
        rewardType,
        earningMethod: 'FLAT', // Fallback
        isExclusion,
        isBaseRule,
        rawSourceText: reward.raw_text
      };

      if (!isExclusion) {
        if (rewardType === 'CASHBACK') {
          rule.earningMethod = 'PERCENTAGE';
          if (reward.spend > 0) {
            rule.baseRate = (reward.points / reward.spend) * 100;
          } else {
            rule.baseRate = reward.points;
          }
        } else {
          rule.earningMethod = 'POINTS_PER_SPEND';
          rule.pointsAwarded = reward.points;
          rule.spendRequirement = reward.spend > 0 ? reward.spend : 100;
        }
      }

      rewardRules.push(rule);
    }
  }

  const benefits: CardBenefit[] = [];
  if (rawCard.lounge && Array.isArray(rawCard.lounge)) {
    for (const l of rawCard.lounge) {
      benefits.push({
        benefitType: 'lounge',
        details: { limit: l.limit, frequency: l.frequency, eligibility: l.eligibility },
        rawSourceText: l.raw_text
      });
    }
  }
  
  if (rawCard.milestones && Array.isArray(rawCard.milestones)) {
    for (const m of rawCard.milestones) {
      benefits.push({
        benefitType: 'milestone',
        details: { details: m.details },
        rawSourceText: m.text || ''
      });
    }
  }
  
  if (rawCard.benefits && Array.isArray(rawCard.benefits)) {
    for (const b of rawCard.benefits) {
      benefits.push({
        benefitType: b.category,
        details: { description: b.description },
        rawSourceText: b.description
      });
    }
  }

  const eligibility: CardEligibility[] = [];
  if (rawCard.minimum_income || rawCard.minimum_cibil) {
    eligibility.push({
      minIncome: rawCard.minimum_income || undefined,
      minCibil: rawCard.minimum_cibil || undefined,
      employmentType: rawCard.minimum_income_type || undefined,
      rawSourceText: `Income: ${rawCard.minimum_income}, CIBIL: ${rawCard.minimum_cibil}`
    });
  }

  return {
    id: rawCard.id,
    name: rawCard.card_title,
    issuer: rawCard.issuer,
    network: rawCard.network || undefined,
    premiumTier: rawCard.card_tier || undefined,
    annualFee: rawCard.fees?.annual_fee ?? (rawCard.annual_fee !== undefined ? rawCard.annual_fee : null),
    joiningFee: rawCard.fees?.joining_fee ?? null,
    feeWaiverSpend: rawCard.fee_waiver_spend || undefined,
    rewardRules,
    redemptionRates: [], // Still missing from dataset
    caps: [], // Still missing from dataset
    benefits,
    eligibility,
    dataProvenance: rawCard.data_confidence || {}
  };
}
