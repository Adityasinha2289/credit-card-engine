/**
 * Card dataset — exports all 133 cards from the master dataset.
 * Ported from: datasets/final/credit_cards_master_dataset.json
 * Source: https://github.com/Adityasinha2289/credit-card-engine
 *
 * Types kept here so existing imports of SpendCategory / FinixCard / CardRewardRate
 * remain stable across the codebase.
 */

export type SpendCategory =
  | 'dining'
  | 'travel'
  | 'groceries'
  | 'entertainment'
  | 'utilities'
  | 'shopping'
  | 'health'
  | 'transport'
  | 'fuel'
  | 'subscriptions'
  | 'other';

export interface CardRewardRate {
  category: SpendCategory;
  /** Reward rate as percentage (e.g. 5 = 5%) */
  rate: number;
  /** Optional cap in INR per month */
  cap?: number;
}

export interface FinixCard {
  id: string;
  name: string;
  bank: string;
  network: 'Visa' | 'Mastercard' | 'Amex' | 'RuPay';
  /** First 4 digits of the card (BIN) */
  first4Digits?: string;
  /** Annual fee in INR */
  annualFee: number;
  /** Fee waiver spend threshold in INR */
  feeWaiverSpend?: number;
  /** Minimum annual income in INR to be eligible */
  minIncome: number;
  /** Minimum CIBIL score */
  minCibil: number;
  /** Welcome bonus description */
  welcomeBonus?: string;
  /** Lounge access: number of complimentary visits per year */
  loungeAccess?: number;
  /** Category-specific reward rates */
  rewards: CardRewardRate[];
  /** Base reward rate for all other spend */
  baseRewardRate: number;
  /** Key selling points */
  highlights: string[];
  /** Gradient for card face */
  gradientFrom: string;
  gradientTo: string;
  /** Overall match score — computed by recommendEngine */
  matchScore?: number;
}

// Re-export the master dataset (133 cards from the credit-card-engine repo)
export { MASTER_CARD_DATASET as CARD_DATASET } from './masterDataset';
