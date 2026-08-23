import type { VerificationStatus, SourceSnapshot } from './provenanceTypes';

export type RewardType = 'CASHBACK' | 'POINTS' | 'MILES' | 'UNKNOWN';
export type EarningMethod = 'PERCENTAGE' | 'POINTS_PER_SPEND' | 'FLAT' | 'MULTIPLIER';
export type CapPeriod = 'TRANSACTION' | 'MONTHLY' | 'QUARTERLY' | 'ANNUAL' | 'LIFETIME';
export type CapUnit = 'MONETARY' | 'POINTS' | 'MILES';
export type RedemptionMechanism = 'STATEMENT_CREDIT' | 'TRAVEL' | 'VOUCHER' | 'TRANSFER';

export interface RewardRule {
  id?: string;
  categoryId?: string; 
  merchantId?: string;
  
  rewardType: RewardType;
  earningMethod: EarningMethod;
  
  baseRate?: number; // For PERCENTAGE or MULTIPLIER
  pointsAwarded?: number; // For POINTS_PER_SPEND
  spendRequirement?: number; // For POINTS_PER_SPEND
  
  isExclusion: boolean;
  isBaseRule: boolean;
  isUncapped?: boolean;
  
  // Temporal Versioning
  effectiveFrom?: string; // YYYY-MM-DD
  effectiveUntil?: string | null; // YYYY-MM-DD
  version?: number;
  isActive?: boolean;

  // Provenance & Verification
  verificationStatus?: VerificationStatus;
  snapshotId?: string;
  sourceSnapshot?: SourceSnapshot;
  rawSourceExcerpt?: string;
  rawSourceText?: string;
  verifiedAt?: string;
  verifiedBy?: string;
}

export interface RewardCap {
  id?: string;
  period: CapPeriod;
  unit: CapUnit;
  maxValue: number;
  linkedRuleIds?: string[]; // Array of rule IDs that share this cap

  // Temporal Versioning & Provenance
  effectiveFrom?: string;
  effectiveUntil?: string | null;
  isActive?: boolean;
  verificationStatus?: VerificationStatus;
  snapshotId?: string;
  sourceSnapshot?: SourceSnapshot;
  rawSourceExcerpt?: string;
  rawSourceText?: string;
  verifiedAt?: string;
  verifiedBy?: string;
}

export interface RedemptionRate {
  id?: string;
  pointTypeName: string;
  mechanism: RedemptionMechanism;
  monetaryValue: number | null; 
  pointsRequired?: number; // e.g. 1 point = monetaryValue, or 4 points = ₹1
  minRedemptionUnits?: number;
  redemptionFee?: number;
  transferPartner?: string;

  // Temporal Versioning & Provenance
  effectiveFrom?: string;
  effectiveUntil?: string | null;
  isActive?: boolean;
  verificationStatus?: VerificationStatus;
  snapshotId?: string;
  sourceSnapshot?: SourceSnapshot;
  rawSourceExcerpt?: string;
  rawSourceText?: string;
  verifiedAt?: string;
  verifiedBy?: string;
}

export interface CardBenefit {
  benefitType: string;
  details: Record<string, any>;
  effectiveFrom?: string;
  effectiveUntil?: string | null;
  isActive?: boolean;
  verificationStatus?: VerificationStatus;
  snapshotId?: string;
  rawSourceText?: string;
}

export interface CardEligibility {
  minIncome?: number;
  minCibil?: number;
  employmentType?: string;
  minAge?: number;
  maxAge?: number;
  effectiveFrom?: string;
  effectiveUntil?: string | null;
  isActive?: boolean;
  verificationStatus?: VerificationStatus;
  snapshotId?: string;
  rawSourceText?: string;
}

export interface FinancialCard {
  id: string;
  name: string;
  issuer?: string;
  network?: string;
  premiumTier?: string;
  annualFee: number | null;
  joiningFee: number | null;
  feeWaiverSpend?: number;
  
  rewardRules: RewardRule[];
  redemptionRates: RedemptionRate[];
  caps: RewardCap[];
  
  benefits: CardBenefit[];
  eligibility: CardEligibility[];
  
  // Verification & Provenance
  verificationStatus?: VerificationStatus;
  dataProvenance?: Record<string, any>; // Used to track data sources
}

export interface TransactionInput {
  amount: number;
  categoryId: string;
  merchantId?: string;
}

export interface CalculationResult {
  grossReward: number;
  rewardType: RewardType;
  eligibleSpend: number;
  excludedSpend: number;
  capApplied: boolean;
  capRemaining: number | null;
  redemptionValue: number | null;
  monetaryRewardValue: number;
  warnings: string[];
  calculationVersion: string;
}
