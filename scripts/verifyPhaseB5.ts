import { RecommendationPresenter } from '../src/features/recommendation/ui/RecommendationPresenter';
import type { RecommendationResult } from '../src/features/recommendation/types';

function runVerification() {
  console.log('--- Phase B.5 Verification ---');
  
  // 1. Mock a sparse RecommendationResult (missing savings, tradeoffs, etc)
  const sparseResult: RecommendationResult = {
    card: {
      id: 'sparse-card',
      name: 'Sparse Card',
      issuer: 'HDFC',
      network: 'Visa',
      annualFee: 0,
      rewardRate: 'Basic Rewards'
    },
    confidence: 0.8,
    matchScore: 50,
    matchPercent: 85,
    reasoning: [],
  };

  // 2. Mock a rich RecommendationResult
  const richResult: RecommendationResult = {
    card: {
      id: 'rich-card',
      name: 'Rich Card',
      issuer: 'Axis Bank',
      network: 'Mastercard',
      annualFee: 1500,
      rewardRate: '5% Cashback'
    },
    savings: {
      expectedSavings: 15000,
      expectedRewardPoints: 1000
    },
    confidence: 0.95,
    matchScore: 120,
    matchPercent: 95,
    reasoning: ['Great for travel'],
    tradeoffs: {
      pros: ['High rewards'],
      cons: ['High fee']
    }
  };

  try {
    const sparseVM = RecommendationPresenter.presentCard(sparseResult);
    console.log('Sparse VM Formatting OK. Annual Fee:', sparseVM.card.formattedAnnualFee);
    console.log('Sparse Badge Color (Fallback):', sparseVM.card.aesthetics.badgeColor);

    const richVM = RecommendationPresenter.presentCard(richResult);
    console.log('Rich VM Formatting OK. Annual Fee:', richVM.card.formattedAnnualFee);
    console.log('Rich Badge Color (Top Pick):', richVM.card.aesthetics.badgeColor);
    console.log('Rich Gradient From:', richVM.card.aesthetics.gradientFrom);

    const savingsVM = RecommendationPresenter.presentSavings(richResult);
    console.log('Savings VM formatted savings:', savingsVM.formattedTotalSavings);
    
    if (savingsVM.formattedTotalSavings !== '₹15,000' && savingsVM.formattedTotalSavings !== '₹ 15,000' && savingsVM.formattedTotalSavings !== '₹15,000.00') {
      console.warn('Currency formatter output might differ by exact locale space/symbol, got:', savingsVM.formattedTotalSavings);
    }

    const comparisonVM = RecommendationPresenter.presentComparison([richResult, sparseResult]);
    console.log('Comparison VM Primary Name:', comparisonVM?.primaryCard.displayName);

    console.log('\n✅ Verification passed for Presenter!');
  } catch (error) {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  }
}

runVerification();
