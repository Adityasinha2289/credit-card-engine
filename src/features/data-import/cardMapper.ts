import type { FinixCard } from '../finix/data/cardDataset';
import type { CardNetwork, PremiumTier } from '../card-intelligence/types';
import type { SupabaseCardRow } from './types';

export class CardMapper {
  public static toSupabaseRow(card: FinixCard): SupabaseCardRow {
    const network: CardNetwork = this.mapNetwork(card.network);
    const premium_tier: PremiumTier = this.mapPremiumTier(card.annualFee, card.minIncome);

    const perks = [
      ...card.highlights.map((h) => ({ title: h })),
      ...card.rewards.map((r) => ({ title: `${r.rate}% on ${r.category}`, category: r.category, rate: r.rate })),
    ];

    return {
      id: card.id,
      card_name: card.name,
      issuer: card.bank,
      network,
      premium_tier,
      annual_fee: card.annualFee,
      joining_fee: card.annualFee,
      fee_waiver_spend: card.feeWaiverSpend || 0,
      reward_rate: card.baseRewardRate || 1.0,
      top_benefit: card.highlights[0] || 'Accelerated Reward Multipliers',
      perks,
      lounge_access: { visitsPerYear: card.loungeAccess || 0 },
      forex_markup: card.annualFee >= 5000 ? 1.5 : 3.5,
      minimum_income: card.minIncome,
      active: true,
    };
  }

  private static mapNetwork(rawNetwork: string): CardNetwork {
    const n = rawNetwork.toLowerCase();
    if (n.includes('visa')) return 'Visa';
    if (n.includes('master')) return 'Mastercard';
    if (n.includes('rupay')) return 'RuPay';
    if (n.includes('amex') || n.includes('american')) return 'American Express';
    return 'Visa';
  }

  private static mapPremiumTier(annualFee: number, minIncome: number): PremiumTier {
    if (annualFee >= 10000 || minIncome >= 2500000) return 'super_premium';
    if (annualFee >= 2500 || minIncome >= 1000000) return 'premium';
    if (annualFee >= 500 || minIncome >= 400000) return 'entry';
    return 'no_fee';
  }
}
