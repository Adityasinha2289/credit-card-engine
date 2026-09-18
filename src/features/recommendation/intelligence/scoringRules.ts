// @ts-nocheck
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
      rawRate = card.id === 'axis_airtel_axis_bank_credit_card' ? 25.0 : 1.0;
    } else if (mName.includes('swiggy')) {
      rawRate = card.id === 'hdfc_swiggy_hdfc_bank_credit_card' ? 10.0 : card.id === 'axis_airtel_axis_bank_credit_card' ? 10.0 : 1.0;
    } else if (mName.includes('zomato')) {
      rawRate = card.id === 'axis_airtel_axis_bank_credit_card' ? 10.0 : card.id === 'axis_axis_bank_ace_credit_card' ? 4.0 : 1.0;
    } else if (mName.includes('amazon')) {
      rawRate = card.id === 'icici_amazon_pay_icici_bank_credit_card_apply_online' ? 5.0 : card.id === 'sbi_cashback_sbi_card' ? 5.0 : 1.0;
    } else if (mName.includes('flipkart')) {
      rawRate = card.id === 'sbi_cashback_sbi_card' ? 5.0 : 1.0;
    } else if (mName.includes('bpcl')) {
      rawRate = card.id === 'sbi_bpcl_sbi_credit_card_octane' ? 7.25 : 1.0;
    } else if (mName.includes('hpcl')) {
      rawRate = card.id === 'icici_icici_bank_hpcl_super_saver_credit_card_5_fuel_cashback' ? 5.0 : 1.0;
    } else if (mName.includes('iocl') || mName.includes('indianoil')) {
      rawRate = card.id === 'axis_indianoil_axis_bank_credit_card' ? 4.0 : 1.0;
    } else if (mName.includes('uber')) {
      rawRate = card.id === 'axis_axis_bank_ace_credit_card' ? 4.0 : 1.0;
    } else if (mName.includes('irctc')) {
      rawRate = card.id === 'sbi_cashback_sbi_card' ? 5.0 : card.id === 'hdfc_infinia_metal_credit_card' ? 3.3 : 1.0;
    } else if (mName.includes('dmart')) {
      rawRate = card.id === 'axis_axis_bank_ace_credit_card' ? 2.0 : card.id === 'hdfc_tata_neu_infinity_credit_card' ? 1.5 : 1.0;
    } else if (mName.includes('croma')) {
      rawRate = card.id === 'hdfc_tata_neu_infinity_credit_card' ? 7.0 : 1.0;
    } else if (mName.includes('apollo') || mName.includes('bookmyshow') || mName.includes('bms')) {
      rawRate = card.id === 'sbi_simply_click_sbi_credit_card' ? 10.0 : 1.0;
    } else if (mName.includes('myntra') || mName.includes('reliance digital')) {
      rawRate = card.id === 'hdfc_regalia_gold_credit_card' ? 6.6 : 1.0;
    }

    // 2. Category fallback for general merchants
    if (rawRate === 1.0) {
      if (category === 'utilities') {
        if (card.id === 'axis_airtel_axis_bank_credit_card' && amount <= 3000) rawRate = 10.0;
        else if (card.id === 'axis_axis_bank_ace_credit_card' && amount <= 5000) rawRate = 5.0;
        else if (card.id === 'hdfc_infinia_metal_credit_card') rawRate = 3.3;
        else if (card.id === 'icici_amazon_pay_icici_bank_credit_card_apply_online') rawRate = 2.0;
      } else if (category === 'travel') {
        if (card.id === 'axis_axis_bank_atlas_credit_card') rawRate = 10.0;
        else if (card.id === 'hdfc_infinia_metal_credit_card') rawRate = 16.5;
        else if (card.id === 'axis_axis_bank_ace_credit_card' && mName.includes('uber')) rawRate = 4.0;
        else if (card.id === 'sbi_cashback_sbi_card' && !mName.includes('uber')) rawRate = 5.0;
      } else if (category === 'dining') {
        if (card.id === 'hdfc_swiggy_hdfc_bank_credit_card' || card.id === 'axis_airtel_axis_bank_credit_card') rawRate = 10.0;
        else if (card.id === 'axis_axis_bank_ace_credit_card') rawRate = 4.0;
        else if (card.id === 'sbi_cashback_sbi_card') rawRate = 5.0;
      } else if (category === 'shopping') {
        if (card.id === 'sbi_cashback_sbi_card' && !mName.includes('dmart')) rawRate = 5.0;
        else if (card.id === 'axis_axis_bank_ace_credit_card' && mName.includes('dmart')) rawRate = 2.0;
        else if (card.id === 'hdfc_tata_neu_infinity_credit_card') rawRate = 1.5;
      } else if (card.rewardType === 'cashback' && card.id === 'sbi_cashback_sbi_card' && category !== 'utilities' && !mName.includes('uber') && !mName.includes('dmart')) {
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

  public static evalAnnualFee(annualFee: number | null, amount: number): number {
    if (annualFee === 0) return 100;
    if (annualFee === null) return 50; // Neutral score for unconfirmed fee
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
