import type { FinixCard } from '../finix/data/cardDataset';
import type { ValidationError, ValidationResult } from './types';

export class CardValidator {
  public static validateDataset(cards: FinixCard[]): ValidationResult {
    const errors: ValidationError[] = [];
    const seenIds = new Set<string>();

    for (const card of cards) {
      // 1. Unique ID
      if (!card.id || card.id.trim() === '') {
        errors.push({
          cardId: card.id || 'UNKNOWN',
          field: 'id',
          message: 'Card ID must not be empty',
        });
      } else if (seenIds.has(card.id)) {
        errors.push({
          cardId: card.id,
          cardName: card.name,
          field: 'id',
          message: `Duplicate card ID detected: '${card.id}'`,
        });
      } else {
        seenIds.add(card.id);
      }

      // 2. Name validation
      if (!card.name || card.name.trim() === '') {
        errors.push({
          cardId: card.id,
          field: 'name',
          message: 'Card name is required',
        });
      }

      // 3. Bank/Issuer validation
      if (!card.bank || card.bank.trim() === '') {
        errors.push({
          cardId: card.id,
          cardName: card.name,
          field: 'bank',
          message: 'Issuer bank is required',
        });
      }

      // 4. Annual Fee validation
      if (typeof card.annualFee !== 'number' || card.annualFee < 0) {
        errors.push({
          cardId: card.id,
          cardName: card.name,
          field: 'annualFee',
          message: 'Annual fee must be a non-negative number',
        });
      }

      // 5. Min Income validation
      if (typeof card.minIncome !== 'number' || card.minIncome < 0) {
        errors.push({
          cardId: card.id,
          cardName: card.name,
          field: 'minIncome',
          message: 'Minimum income must be a non-negative number',
        });
      }

      // 6. CIBIL validation
      if (
        typeof card.minCibil !== 'number' ||
        card.minCibil < 300 ||
        card.minCibil > 900
      ) {
        errors.push({
          cardId: card.id,
          cardName: card.name,
          field: 'minCibil',
          message: 'CIBIL score must be between 300 and 900',
        });
      }

      // 7. Base reward rate validation
      if (typeof card.baseRewardRate !== 'number' || card.baseRewardRate < 0) {
        errors.push({
          cardId: card.id,
          cardName: card.name,
          field: 'baseRewardRate',
          message: 'Base reward rate must be a non-negative number',
        });
      }

      // 8. Category rewards validation
      if (!Array.isArray(card.rewards)) {
        errors.push({
          cardId: card.id,
          cardName: card.name,
          field: 'rewards',
          message: 'Category rewards must be an array',
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
