import { RecommendationService, USE_INTELLIGENCE_ENGINE } from '../src/features/recommendation/RecommendationService';
import type { UnifiedRecommendationRequest } from '../src/features/recommendation/types';

function runVerification() {
  console.log('--- Phase B Verification ---');
  console.log(`Current Flag (USE_INTELLIGENCE_ENGINE): ${USE_INTELLIGENCE_ENGINE}`);
  
  const service = RecommendationService.getInstance();
  
  const req: UnifiedRecommendationRequest = {
    merchant: 'Amazon',
    amount: 15000,
    category: 'shopping',
    userProfile: {
      annualIncome: 800000,
      cibilScore: 780,
      topCategories: ['shopping', 'travel'],
      maxAnnualFee: 2000,
      wantsLounge: true,
    }
  };

  try {
    const results = service.recommend(req, 2);
    console.log('Successfully produced RecommendationResult[]');
    console.log(JSON.stringify(results, null, 2));
    console.log('\n✅ Verification passed for active engine!');
  } catch (error) {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  }
}

runVerification();
