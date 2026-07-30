import type { CreditCardIntelligence } from '../../card-intelligence/types';
import type { MerchantOffer } from '../../merchant-intelligence/types';

export class ExplainabilityEngine {
  public static generateHumanReasoning(
    card: CreditCardIntelligence,
    effectiveRate: number,
    expectedSavings: number,
    matchingOffer?: MerchantOffer,
    isOwned?: boolean
  ): string[] {
    const reasons: string[] = [];

    if (matchingOffer) {
      reasons.push(`Active offer:"${matchingOffer.title}" saving ₹${matchingOffer.discountValue}`);
    }

    reasons.push(`Effective ${effectiveRate}% reward multiplier on spend`);
    reasons.push(`Generates total net savings of ₹${expectedSavings}`);

    if (isOwned) {
      reasons.push(`Available in your existing wallet (${card.issuer})`);
    } else {
      reasons.push(`Top discovery card recommendation for ${card.issuer}`);
    }

    if (card.annualFee === 0) {
      reasons.push('Lifetime free card with zero annual maintenance fee');
    }

    return reasons;
  }
}
