import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RecommendationApiController } from './controller';

vi.mock('@clerk/backend', () => ({
  verifyToken: vi.fn(async (token) => {
    if (token === 'valid-token') {
      return { sub: 'user-clerk-verified' };
    }
    throw new Error('jwt malformed');
  })
}));

describe('Recommendation API Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CLERK_SECRET_KEY = 'test-secret-key';
  });

  it('should pass recommendation API tests', async () => {
    const controller = new RecommendationApiController();

    // Test 1: Valid Swiggy recommendation request
    const validRes = await controller.handlePostRequest({
      merchant: 'Swiggy',
      amount: 2000,
    }, 'Bearer valid-token');

    expect(validRes.statusCode).toBe(200);
    expect(validRes.payload.success).toBe(true);

    // Test 2: Invalid payload validation failure
    const invalidRes = await controller.handlePostRequest({
      merchant: '',
      amount: -50,
    }, 'Bearer valid-token');

    expect(invalidRes.statusCode).toBe(400);
    expect(invalidRes.payload.success).toBe(false);
    
    // Test 3: Unauthorized request
    const unauthRes = await controller.handlePostRequest({
      merchant: 'Swiggy',
      amount: 2000,
    });
    
    expect(unauthRes.statusCode).toBe(401);
    expect(unauthRes.payload.success).toBe(false);
  });
});
