import type { ResolvedMerchant } from './recommendationTypes';
import type { MerchantOffer } from '../merchant-intelligence/types';

export class ConfidenceCalculator {
  public static calculateConfidence(
    resolvedMerchant: ResolvedMerchant,
    appliedOffer?: MerchantOffer,
    cardsAvailableCount = 0
  ): number {
    let confidence = 50;

    // Merchant match confidence
    if (resolvedMerchant.matchType === 'exact') {
      confidence += 30;
    } else if (resolvedMerchant.matchType === 'alias') {
      confidence += 25;
    } else if (resolvedMerchant.matchType === 'fuzzy') {
      confidence += 15;
    } else {
      confidence += 5;
    }

    // Offer presence confidence
    if (appliedOffer) {
      confidence += 15;
    }

    // Dataset availability confidence
    if (cardsAvailableCount > 0) {
      confidence += 5;
    }

    return Math.min(100, Math.max(0, confidence));
  }
}
