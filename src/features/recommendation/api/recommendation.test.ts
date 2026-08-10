import { describe, it, expect } from 'vitest';
import { RecommendationApiController } from './controller';

describe('Recommendation API Integration Tests', () => {
  it('should pass recommendation API tests', async () => {
    const controller = new RecommendationApiController();

    // Test 1: Valid Swiggy recommendation request
    const validRes = await controller.handlePostRequest({
      merchant: 'Swiggy',
      amount: 2000,
    });

    expect(validRes.statusCode).toBe(200);
    expect(validRes.payload.success).toBe(true);

    // Test 2: Invalid payload validation failure
    const invalidRes = await controller.handlePostRequest({
      merchant: '',
      amount: -50,
    });

    expect(invalidRes.statusCode).toBe(400);
    expect(invalidRes.payload.success).toBe(false);
  });
});
