import type { RecommendationApiRequest, ApiErrorDetail } from './types';

export class ApiValidator {
  public static validateRequest(body: unknown): { valid: boolean; errors: ApiErrorDetail[]; data?: RecommendationApiRequest } {
    const errors: ApiErrorDetail[] = [];

    if (!body || typeof body !== 'object') {
      return {
        valid: false,
        errors: [{ message: 'Request body must be a valid JSON object' }],
      };
    }

    const payload = body as Record<string, unknown>;

    // 1. Merchant validation
    if (!payload.merchant || typeof payload.merchant !== 'string' || payload.merchant.trim() === '') {
      errors.push({ field: 'merchant', message: 'Field"merchant" is required and must be a non-empty string.' });
    }

    // 2. Amount validation
    if (typeof payload.amount !== 'number' || isNaN(payload.amount) || payload.amount <= 0) {
      errors.push({ field: 'amount', message: 'Field"amount" is required and must be a positive number greater than 0.' });
    }

    // 3. Transaction Date validation (optional)
    if (payload.transactionDate) {
      if (typeof payload.transactionDate !== 'string' || isNaN(Date.parse(payload.transactionDate))) {
        errors.push({ field: 'transactionDate', message: 'Field"transactionDate" must be a valid ISO date string if provided.' });
      }
    }

    if (errors.length > 0) {
      return { valid: false, errors };
    }

    return {
      valid: true,
      errors: [],
      data: {
        merchant: (payload.merchant as string).trim(),
        amount: payload.amount as number,
        userId: typeof payload.userId === 'string' ? payload.userId : undefined,
        transactionDate: typeof payload.transactionDate === 'string' ? payload.transactionDate : undefined,
      },
    };
  }
}
