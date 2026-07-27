import type { Merchant } from '../merchant-intelligence/types';
import type { ValidationError, ValidationResult } from './types';

export class MerchantValidator {
  public static validateDataset(merchants: Merchant[]): ValidationResult {
    const errors: ValidationError[] = [];
    const seenIds = new Set<string>();
    const seenNames = new Set<string>();

    for (const merchant of merchants) {
      // 1. Unique ID check
      if (!merchant.id || merchant.id.trim() === '') {
        errors.push({
          cardId: merchant.id || 'UNKNOWN',
          field: 'id',
          message: 'Merchant ID is required',
        });
      } else if (seenIds.has(merchant.id)) {
        errors.push({
          cardId: merchant.id,
          cardName: merchant.name,
          field: 'id',
          message: `Duplicate merchant ID detected: '${merchant.id}'`,
        });
      } else {
        seenIds.add(merchant.id);
      }

      // 2. Merchant Name check
      if (!merchant.name || merchant.name.trim() === '') {
        errors.push({
          cardId: merchant.id,
          field: 'name',
          message: 'Merchant name is required',
        });
      } else if (seenNames.has(merchant.name.toLowerCase())) {
        errors.push({
          cardId: merchant.id,
          cardName: merchant.name,
          field: 'name',
          message: `Duplicate merchant name detected: '${merchant.name}'`,
        });
      } else {
        seenNames.add(merchant.name.toLowerCase());
      }

      // 3. Category check
      if (!merchant.category) {
        errors.push({
          cardId: merchant.id,
          cardName: merchant.name,
          field: 'category',
          message: 'Merchant category is required',
        });
      }

      // 4. Logo check
      if (!merchant.logo || merchant.logo.trim() === '') {
        errors.push({
          cardId: merchant.id,
          cardName: merchant.name,
          field: 'logo',
          message: 'Merchant logo URL is required',
        });
      }

      // 5. Website format check (if provided)
      if (merchant.website && !merchant.website.startsWith('http')) {
        errors.push({
          cardId: merchant.id,
          cardName: merchant.name,
          field: 'website',
          message: 'Website URL must begin with http:// or https://',
        });
      }

      // 6. Supported payment methods check
      if (!Array.isArray(merchant.supportedPaymentMethods) || merchant.supportedPaymentMethods.length === 0) {
        errors.push({
          cardId: merchant.id,
          cardName: merchant.name,
          field: 'supportedPaymentMethods',
          message: 'At least one supported payment method is required',
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
