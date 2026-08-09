export type SpendingCategory =
  | 'dining'
  | 'travel'
  | 'shopping'
  | 'fitness'
  | 'learning'
  | 'wellness'
  | 'entertainment'
  | 'transport'
  | 'accommodation'
  | 'other';

export interface SpendingOpportunity {
  id: string;
  partnerId: string;
  category: SpendingCategory;
  baseAmount: number;
  currency: 'INR';
  metadata?: Record<string, unknown>;
}

export type PaymentMethodType =
  | 'credit_card'
  | 'debit_card'
  | 'upi'
  | 'wallet'
  | 'reward_points'
  | 'miles';

export interface PaymentMethod {
  id: string;
  type: PaymentMethodType;
  name: string;
  provider: string; // e.g. "HDFC", "Google Pay"
  metadata: Record<string, unknown>;
}

export type OfferType =
  | 'flat_discount'
  | 'percentage_discount'
  | 'cashback'
  | 'reward_multiplier'
  | 'points'
  | 'miles';

export type OfferSource = 'merchant' | 'bank' | 'network' | 'renocred';

export interface OfferEligibility {
  partnerIds?: string[];
  categories?: SpendingCategory[];
  paymentMethodIds?: string[];
  paymentMethodTypes?: PaymentMethodType[];
  minSpend?: number;
  maxDiscount?: number;
  // If true, this offer cannot be stacked with any other offer from the same source, or possibly other offers entirely.
  // For V1, we define mutallyExclusiveSource to mean it cannot stack with another offer of the SAME source.
  mutuallyExclusiveSource?: boolean;
}

export interface Offer {
  id: string;
  name: string;
  description: string;
  type: OfferType;
  value: number; // For percentage, 10 = 10%. For flat, 500 = ₹500.
  source: OfferSource;
  eligibility: OfferEligibility;
}

export interface BenefitBreakdown {
  merchantDiscount: number;
  bankDiscount: number;
  cashbackValue: number;
  rewardValue: number;
  totalValue: number;
}

export interface RecommendationReason {
  primary: string;
  supportingFactors: string[];
}

export interface PaymentRecommendation {
  paymentMethodId: string;
  paymentMethodName: string;
  appliedOffers: Offer[];
  benefit: BenefitBreakdown;
  effectiveCost: number;
  savings: number;
}

export interface OptimizationResult {
  opportunityId: string;
  baseAmount: number;
  recommendedPaymentMethod: PaymentRecommendation;
  alternatives: PaymentRecommendation[];
  effectiveCost: number;
  totalValue: number;
  savings: number;
  reason: RecommendationReason;
}
