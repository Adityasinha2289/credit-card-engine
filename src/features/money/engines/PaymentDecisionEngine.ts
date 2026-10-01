import type { CardData } from '../../cards/types/card.types';
import type { CreditAccount } from '../../dashboard/types/dashboard.types';

export interface PaymentContext {
  amount: number;
  merchant: string;
  merchantType: 'P2P' | 'P2M';
  category: string;
}

export interface PaymentRecommendation {
  recommendedMethodId: string;
  alternativeMethodId?: string;
  reason: string;
  estimatedRewardValue?: number;
  eligibility: boolean;
  confidence: number;
  warnings?: string[];
  source: 'DEMO' | 'LIVE';
}

export class PaymentDecisionEngine {
  static evaluate(
    context: PaymentContext, 
    cards: CardData[],
    accounts: CreditAccount[],
    isDemo: boolean = true
  ): PaymentRecommendation {
    const { amount, merchantType, category } = context;
    
    // Filter out inactive/expired instruments
    const available = cards.filter(c => c.status === 'active');
    
    if (available.length === 0) {
      return {
        recommendedMethodId: '',
        reason: 'No active payment methods found.',
        eligibility: false,
        confidence: 0,
        source: isDemo ? 'DEMO' : 'LIVE'
      };
    }

    // Hard Rules
    if (merchantType === 'P2P') {
      return {
        recommendedMethodId: 'bank_upi', // Fallback identifier since we don't have UPI options modeled in userCards natively
        alternativeMethodId: undefined,
        reason: 'Credit-card-on-UPI isn\'t eligible for this P2P payment.',
        eligibility: true,
        confidence: 100,
        source: isDemo ? 'DEMO' : 'LIVE',
        warnings: ['P2P transfers cannot be made via Credit Card on UPI.']
      };
    }

    // For P2M, score options
    let bestOption = available[0];
    let bestScore = -1;
    let alternative = undefined;
    let reason = '';
    let rewardValue = 0;

    for (const card of available) {
      let score = 0;
      let estimatedReward = 0;
      const account = accounts.find(a => a.cardId === card.id);
      
      // Simple demo scoring based on affinity
      if (card.id.includes('sbi_cb')) {
        score += 80;
        estimatedReward = amount * 0.05; // 5% demo cashback
        if (category === 'Food & Dining' || category === 'Shopping') {
          score += 20;
        }
      } else if (card.id.includes('hdfc_dcb')) {
        score += 70;
        estimatedReward = amount * 0.03; // 3% demo equivalent
        if (category === 'Travel' || category === 'Food & Dining') {
          score += 30;
        }
      } else {
        score += 50;
        estimatedReward = amount * ((card.baseRewardRate || 1.5) / 100);
      }

      // Penalty for high outstanding / near due
      if (account && account.currentBalance && account.totalLimit) {
        if (account.currentBalance / account.totalLimit > 0.5) {
          score -= 40; // Heavy penalty for high utilization
        }
      }

      if (score > bestScore) {
        alternative = bestOption;
        bestScore = score;
        bestOption = card;
        rewardValue = estimatedReward;
      }
    }

    reason = `Demo estimate: this payment is eligible for a higher modeled cashback/reward value.`;
    
    // Warning for high utilization
    const warnings = [];
    const bestAccount = accounts.find(a => a.cardId === bestOption.id);
    if (bestAccount && bestAccount.currentBalance && bestAccount.totalLimit && bestAccount.currentBalance / bestAccount.totalLimit > 0.3) {
      warnings.push(`Your ${bestOption.name} has a high outstanding balance. Using your bank account may be safer for your current cash flow.`);
    }

    return {
      recommendedMethodId: bestOption.id,
      alternativeMethodId: alternative?.id,
      reason,
      estimatedRewardValue: rewardValue,
      eligibility: true,
      confidence: 85,
      warnings,
      source: isDemo ? 'DEMO' : 'LIVE'
    };
  }
}
