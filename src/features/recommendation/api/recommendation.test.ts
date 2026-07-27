import { RecommendationApiController } from './controller';

export async function runRecommendationApiTests() {
  console.log('🧪 Running Recommendation API Integration Tests...');
  const controller = new RecommendationApiController();

  // Test 1: Valid Swiggy recommendation request
  const validRes = await controller.handlePostRequest({
    merchant: 'Swiggy',
    amount: 2000,
  });

  if (validRes.statusCode !== 200 || !validRes.payload.success) {
    throw new Error('Test 1 Failed: Expected status 200 and success true');
  }
  console.log('  ✓ Test 1 Passed: Valid Swiggy recommendation request returned status 200');

  // Test 2: Invalid payload validation failure
  const invalidRes = await controller.handlePostRequest({
    merchant: '',
    amount: -50,
  });

  if (invalidRes.statusCode !== 400 || invalidRes.payload.success !== false) {
    throw new Error('Test 2 Failed: Expected status 400 and validation errors');
  }
  console.log('  ✓ Test 2 Passed: Invalid payload correctly returned 400 validation error');

  console.log('✅ All Recommendation API Integration Tests Passed Successfully!');
}
