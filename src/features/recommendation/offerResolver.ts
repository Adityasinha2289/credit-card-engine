import { MerchantRepository } from '../merchant-intelligence/merchantRepository';
import type { MerchantOffer } from '../merchant-intelligence/types';
import type { TransactionCategory } from '../dashboard/types/dashboard.types';

export class OfferResolver {
  private static repo = MerchantRepository.getInstance();

  public static getApplicableOffers(
    merchantId?: string,
    category?: TransactionCategory,
    amount = 0,
    transactionDate: Date = new Date()
  ): MerchantOffer[] {
    const allOffers = this.repo.getOffers();

    return allOffers.filter((offer) => {
      // 1. Merchant match check
      if (merchantId && offer.merchantId !== merchantId && offer.category !== category) {
        return false;
      }

      // 2. Minimum spend check
      if (amount < offer.minimumSpend) {
        return false;
      }

      // 3. Validity date check
      const expiry = new Date(offer.validity);
      if (transactionDate > expiry) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      const priorityWeight = { high: 3, medium: 2, low: 1 };
      return priorityWeight[b.priority] - priorityWeight[a.priority];
    });
  }
}
