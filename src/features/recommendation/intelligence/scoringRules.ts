import type { CreditCardIntelligence } from '../../card-intelligence/types';
import type { MerchantOffer } from '../../merchant-intelligence/types';
import type { TransactionCategory, PrimaryGoal } from '../../dashboard/types/dashboard.types';
import type { RecommendationMode } from './evaluationTypes';

export class ScoringRules {
  public static evalReward(
    card: CreditCardIntelligence,
    amount: number,
    category: TransactionCategory,
    merchantName?: string
  ): { rawScore: number; baseSavings: number; rate: number } {
    let rawRate = 1.0;
    const text = card.rewardRate.toLowerCase();
    const mName = (merchantName || '').toLowerCase();

    // 1. Merchant-specific reward rates
    if (mName.includes('airtel')) {
      rawRate = card.id === 'card-airtel-axis' ? 25.0 : 1.0;
    } else if (mName.includes('swiggy')) {
      rawRate = card.id === 'card-swiggy-hdfc' ? 10.0 : card.id === 'card-airtel-axis' ? 10.0 : 1.0;
    } else if (mName.includes('zomato')) {
      rawRate = card.id === 'card-airtel-axis' ? 10.0 : card.id === 'card-axis-ace' ? 4.0 : 1.0;
    } else if (mName.includes('amazon')) {
      rawRate = card.id === 'card-icici-amazon' ? 5.0 : card.id === 'card-sbi-cashback' ? 5.0 : 1.0;
    } else if (mName.includes('flipkart')) {
      rawRate = card.id === 'card-sbi-cashback' ? 5.0 : 1.0;
    } else if (mName.includes('bpcl')) {
      rawRate = card.id === 'card-bpcl-octane-sbi' ? 7.25 : 1.0;
    } else if (mName.includes('hpcl')) {
      rawRate = card.id === 'card-icici-hpcl-super-saver' ? 5.0 : 1.0;
    } else if (mName.includes('iocl') || mName.includes('indianoil')) {
      rawRate = card.id === 'card-axis-indian-oil' ? 4.0 : 1.0;
    } else if (mName.includes('uber')) {
      rawRate = card.id === 'card-axis-ace' ? 4.0 : 1.0;
    } else if (mName.includes('irctc')) {
      rawRate = card.id === 'card-sbi-cashback' ? 5.0 : card.id === 'card-hdfc-infinia' ? 3.3 : 1.0;
    } else if (mName.includes('dmart')) {
      rawRate = card.id === 'card-axis-ace' ? 2.0 : card.id === 'card-tata-neu-infinity' ? 1.5 : 1.0;
    } else if (mName.includes('croma')) {
      rawRate = card.id === 'card-tata-neu-infinity' ? 7.0 : 1.0;
    } else if (mName.includes('apollo') || mName.includes('bookmyshow') || mName.includes('bms')) {
      rawRate = card.id === 'card-sbi-simplyclick' ? 10.0 : 1.0;
    } else if (mName.includes('myntra') || mName.includes('reliance digital')) {
      rawRate = card.id === 'card-hdfc-regalia-gold' ? 6.6 : 1.0;
    }

    // 2. Category fallback for general merchants
    if (rawRate === 1.0) {
      if (category === 'utilities') {
        if (card.id === 'card-airtel-axis' && amount <= 3000) rawRate = 10.0;
        else if (card.id === 'card-axis-ace' && amount <= 5000) rawRate = 5.0;
        else if (card.id === 'card-hdfc-infinia') rawRate = 3.3;
        else if (card.id === 'card-icici-amazon') rawRate = 2.0;
      } else if (category === 'travel') {
        if (card.id === 'card-axis-atlas') rawRate = 10.0;
        else if (card.id === 'card-hdfc-infinia') rawRate = 16.5;
        else if (card.id === 'card-axis-ace' && mName.includes('uber')) rawRate = 4.0;
        else if (card.id === 'card-sbi-cashback' && !mName.includes('uber')) rawRate = 5.0;
      } else if (category === 'dining') {
        if (card.id === 'card-swiggy-hdfc' || card.id === 'card-airtel-axis') rawRate = 10.0;
        else if (card.id === 'card-axis-ace') rawRate = 4.0;
        else if (card.id === 'card-sbi-cashback') rawRate = 5.0;
      } else if (category === 'shopping') {
        if (card.id === 'card-sbi-cashback' && !mName.includes('dmart')) rawRate = 5.0;
        else if (card.id === 'card-axis-ace' && mName.includes('dmart')) rawRate = 2.0;
        else if (card.id === 'card-tata-neu-infinity') rawRate = 1.5;
      } else if (card.rewardType === 'cashback' && card.id === 'card-sbi-cashback' && category !== 'utilities' && !mName.includes('uber') && !mName.includes('dmart')) {
        rawRate = 5.0;
      }
    }

    let rate = rawRate;
    if (card.categories.includes(category)) {
      rate += 0.5;
    }
    const baseSavings = Math.round((amount * rate) / 100);
    const rawScore = Math.min(100, Math.round(rate * 10.0));
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
    const normGoal = String(goal || '').toLowerCase();
    if ((normGoal.includes('cashback') || normGoal.includes('maximize')) && card.rewardType === 'cashback') return 100;
    if ((normGoal.includes('travel') || normGoal.includes('miles')) && (card.rewardType === 'miles' || card.categories.includes('travel'))) return 100;
    if ((normGoal.includes('save') || normGoal.includes('fee')) && card.annualFee === 0) return 100;
    return 60;
  }
}
