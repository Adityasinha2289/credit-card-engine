import type { CreditCardIntelligence } from '../../card-intelligence/types';
import type { MerchantOffer } from '../../merchant-intelligence/types';
import type { TransactionCategory, PrimaryGoal } from '../../dashboard/types/dashboard.types';
import type { RecommendationMode } from './evaluationTypes';

export class ScoringRules {
  public static evalReward(card: CreditCardIntelligence, amount: number, category: TransactionCategory): { rawScore: number; baseSavings: number; rate: number } {
    const rawRate = parseFloat(card.rewardRate.replace(/[^0-9.]/g, '')) || 1.0;
    let rate = rawRate;
    if (card.categories.includes(category)) {
      rate += 2.0;
    }
    const baseSavings = Math.round((amount * rate) / 100);
    const savingsRatio = amount > 0 ? (baseSavings / amount) * 100 : 0;
    const rawScore = Math.min(100, Math.round(savingsRatio * 10 + rate * 5));
    return { rawScore, baseSavings, rate };
  }

  public static evalOffer(matchingOffer?: MerchantOffer, amount = 0): { rawScore: number; offerBonus: number } {
    if (!matchingOffer) return { rawScore: 0, offerBonus: 0 };
    let offerBonus = 0;
    if (matchingOffer.discountType === 'percentage') {
      offerBonus = Math.round((amount * matchingOffer.discountValue) / 100);
    } else if (matchingOffer.discountType === 'flat') {
      offerBonus = matchingOffer.discountValue;
    } else {
      offerBonus = 100;
    }
    const rawScore = Math.min(100, 50 + Math.round((offerBonus / (amount || 1)) * 100));
    return { rawScore, offerBonus };
  }

  public static evalOwnership(isOwned: boolean, mode: RecommendationMode): number {
    if (mode === 'wallet_optimisation') {
      return isOwned ? 100 : 0;
    }
    return isOwned ? 30 : 80;
  }

  public static evalCategoryMatch(card: CreditCardIntelligence, category: TransactionCategory): number {
    return card.categories.includes(category) ? 100 : 40;
  }

  public static evalAnnualFee(annualFee: number, amount: number): number {
    if (annualFee === 0) return 100;
    const feeRatio = (annualFee / (amount * 12 || 100000)) * 100;
    return Math.max(0, Math.min(100, Math.round(100 - feeRatio * 10)));
  }

  public static evalPreference(card: CreditCardIntelligence, goal: PrimaryGoal): number {
    if (goal === 'Maximise Cashback' && card.rewardType === 'cashback') return 100;
    if (goal === 'Travel Rewards' && card.rewardType === 'miles') return 100;
    if (goal === 'Save More Money' && card.annualFee === 0) return 100;
    return 60;
  }
}
