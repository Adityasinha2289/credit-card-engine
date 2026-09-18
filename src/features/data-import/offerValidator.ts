import type { RawOfferDataset } from './offerTypes';
import type { ValidationError, ValidationResult } from './types';

export class OfferValidator {
  public static validateDataset(offers: RawOfferDataset[]): ValidationResult {
    const errors: ValidationError[] = [];
    const seenIds = new Set<string>();

    for (const offer of offers) {
      const offerId = offer.identity?.offer_id;
      const title = offer.identity?.title;

      // 1. Unique ID check
      if (!offerId || offerId.trim() === '') {
        errors.push({
          cardId: offerId || 'UNKNOWN',
          field: 'identity.offer_id',
          message: 'Offer ID is required',
        });
        continue; // Critical failure for this record
      } else if (seenIds.has(offerId)) {
        errors.push({
          cardId: offerId,
          cardName: title,
          field: 'identity.offer_id',
          message: `Duplicate offer ID detected: '${offerId}'`,
        });
      } else {
        seenIds.add(offerId);
      }

      // 2. Title check
      if (!title || title.trim() === '') {
        errors.push({
          cardId: offerId,
          field: 'identity.title',
          message: 'Offer title is required',
        });
      }

      // 3. Benefit checks
      if (!offer.benefit?.benefit_type) {
        errors.push({
          cardId: offerId,
          cardName: title,
          field: 'benefit.benefit_type',
          message: 'Benefit type is required',
        });
      }

      if (offer.benefit?.maximum_benefit !== null && offer.benefit?.maximum_benefit !== undefined) {
        if (typeof offer.benefit.maximum_benefit !== 'number' || offer.benefit.maximum_benefit < 0) {
          errors.push({
            cardId: offerId,
            cardName: title,
            field: 'benefit.maximum_benefit',
            message: 'Maximum benefit must be a positive number',
          });
        }
      }

      // 4. Validity date check
      if (offer.validity?.valid_until) {
         if (isNaN(Date.parse(offer.validity.valid_until))) {
          errors.push({
            cardId: offerId,
            cardName: title,
            field: 'validity.valid_until',
            message: 'Validity must be a valid ISO date string',
          });
         }
      }
      // 5. Quality metadata check
      if (offer.data_quality === 'INVALID') {
        errors.push({
          cardId: offerId,
          cardName: title,
          field: 'data_quality',
          message: 'Record marked as INVALID by upstream extraction process',
        });
      }

      if (offer.lifecycle_status === 'EXPIRED') {
        errors.push({
          cardId: offerId,
          cardName: title,
          field: 'lifecycle_status',
          message: 'Record marked as EXPIRED by upstream extraction process',
        });
      }

      if (offer.quality?.human_review_required === true) {
        errors.push({
          cardId: offerId,
          cardName: title,
          field: 'quality.human_review_required',
          message: 'Record marked as requiring human review',
        });
      }

    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

