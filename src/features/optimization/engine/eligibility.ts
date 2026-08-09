import { Offer, PaymentMethod, SpendingOpportunity } from '../types';

export class EligibilityEngine {
  /**
   * Evaluates if a given offer is applicable to the current spending opportunity and payment method.
   */
  public static isOfferEligible(
    offer: Offer,
    opportunity: SpendingOpportunity,
    paymentMethod: PaymentMethod
  ): boolean {
    const { eligibility } = offer;

    // 1. Min Spend Check
    if (eligibility.minSpend && opportunity.baseAmount < eligibility.minSpend) {
      return false;
    }

    // 2. Category Match
    if (eligibility.categories && eligibility.categories.length > 0) {
      if (!eligibility.categories.includes(opportunity.category)) {
        return false;
      }
    }

    // 3. Partner Match
    if (eligibility.partnerIds && eligibility.partnerIds.length > 0) {
      if (!eligibility.partnerIds.includes(opportunity.partnerId)) {
        return false;
      }
    }

    // 4. Payment Method Match (by ID)
    if (eligibility.paymentMethodIds && eligibility.paymentMethodIds.length > 0) {
      if (!eligibility.paymentMethodIds.includes(paymentMethod.id)) {
        return false;
      }
    }

    // 5. Payment Method Type Match
    if (eligibility.paymentMethodTypes && eligibility.paymentMethodTypes.length > 0) {
      if (!eligibility.paymentMethodTypes.includes(paymentMethod.type)) {
        return false;
      }
    }

    return true;
  }
}
