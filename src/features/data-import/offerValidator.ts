import type { MerchantOffer } from '../merchant-intelligence/types';
import type { ValidationError, ValidationResult } from './types';
import { MerchantRepository } from '../merchant-intelligence/merchantRepository';

export class OfferValidator {
  public static validateDataset(offers: MerchantOffer[]): ValidationResult {
    const errors: ValidationError[] = [];
    const seenIds = new Set<string>();
    const validMerchantIds = new Set<string>(
      MerchantRepository.getInstance().getMerchants().map((m) => m.id)
    );

    for (const offer of offers) {
      // 1. Unique ID check
      if (!offer.id || offer.id.trim() === '') {
        errors.push({
          cardId: offer.id || 'UNKNOWN',
          field: 'id',
          message: 'Offer ID is required',
        });
      } else if (seenIds.has(offer.id)) {
        errors.push({
          cardId: offer.id,
          cardName: offer.title,
          field: 'id',
          message: `Duplicate offer ID detected: '${offer.id}'`,
        });
      } else {
        seenIds.add(offer.id);
      }

      // 2. Referential integrity: Merchant exists check
      if (!offer.merchantId || offer.merchantId.trim() === '') {
        errors.push({
          cardId: offer.id,
          cardName: offer.title,
          field: 'merchantId',
          message: 'Merchant ID is required for offer',
        });
      } else if (!validMerchantIds.has(offer.merchantId)) {
        errors.push({
          cardId: offer.id,
          cardName: offer.title,
          field: 'merchantId',
          message: `Referenced merchant ID '${offer.merchantId}' does not exist in Merchant repository`,
        });
      }

      // 3. Title & Description checks
      if (!offer.title || offer.title.trim() === '') {
        errors.push({
          cardId: offer.id,
          field: 'title',
          message: 'Offer title is required',
        });
      }

      if (!offer.description || offer.description.trim() === '') {
        errors.push({
          cardId: offer.id,
          cardName: offer.title,
          field: 'description',
          message: 'Offer description is required',
        });
      }

      // 4. Discount type & value checks
      if (!offer.discountType) {
        errors.push({
          cardId: offer.id,
          cardName: offer.title,
          field: 'discountType',
          message: 'Discount type is required',
        });
      }

      if (typeof offer.discountValue !== 'number' || offer.discountValue <= 0) {
        errors.push({
          cardId: offer.id,
          cardName: offer.title,
          field: 'discountValue',
          message: 'Discount value must be a positive number',
        });
      } else if (offer.discountType === 'percentage' && offer.discountValue > 100) {
        errors.push({
          cardId: offer.id,
          cardName: offer.title,
          field: 'discountValue',
          message: 'Percentage discount cannot exceed 100%',
        });
      }

      // 5. Eligible cards check
      if (!Array.isArray(offer.eligibleCards) || offer.eligibleCards.length === 0) {
        errors.push({
          cardId: offer.id,
          cardName: offer.title,
          field: 'eligibleCards',
          message: 'At least one eligible card or"all" must be specified',
        });
      }

      // 6. Minimum spend check
      if (typeof offer.minimumSpend !== 'number' || offer.minimumSpend < 0) {
        errors.push({
          cardId: offer.id,
          cardName: offer.title,
          field: 'minimumSpend',
          message: 'Minimum spend must be non-negative',
        });
      }

      // 7. Validity date check
      if (!offer.validity || isNaN(Date.parse(offer.validity))) {
        errors.push({
          cardId: offer.id,
          cardName: offer.title,
          field: 'validity',
          message: 'Validity must be a valid ISO date string',
        });
      }

      // 8. Category check
      if (!offer.category) {
        errors.push({
          cardId: offer.id,
          cardName: offer.title,
          field: 'category',
          message: 'Offer category is required',
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
