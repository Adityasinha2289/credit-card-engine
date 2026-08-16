import type { FinancialCard, CardBenefit } from './types';
import type { EligibilityResult } from './userContext';

export type DataQualityState = 'COMPLETE' | 'PARTIAL' | 'INCOMPLETE' | 'UNKNOWN';
export type RecommendationReadiness = 'ACTIONABLE' | 'INFORMATIONAL_ONLY' | 'INSUFFICIENT_DATA';
export type OverlapLevel = 'HIGH_OVERLAP' | 'LOW_OVERLAP' | 'NO_OVERLAP';
export type FeeStatus = 'VERIFIED' | 'UNKNOWN';

export interface CategoryValueBreakdown {
  categoryId: string;
  monthlySpend: number;
  candidateGrossReward: number; // Candidate monthly gross reward
  existingBaselineReward: number; // Best existing wallet monthly reward
  incrementalReward: number; // Max(0, candidateGrossReward - existingBaselineReward)
  annualIncrementalReward: number; // incrementalReward * 12
}

export interface IncrementalWalletValue {
  grossCandidateAnnualReward: number; // Candidate annualized gross across user spending
  existingWalletBaselineAnnualReward: number; // Existing wallet annualized baseline across user spending
  annualGrossIncrementalReward: number; // Sum of category incremental rewards * 12
  
  annualFee: number;
  annualFeeStatus: FeeStatus;
  joiningFee: number;
  
  firstYearNetValue: number; // annualGrossIncrementalReward - (annualFee + joiningFee) (if verified)
  steadyStateAnnualValue: number; // annualGrossIncrementalReward - annualFee (if verified)
  netAnnualValue: number; // Primary economic metric (= steadyStateAnnualValue)
  
  categoryBreakdowns: CategoryValueBreakdown[];
  overlapLevel: OverlapLevel;
  overlapCategories: string[];
  
  dataQuality: DataQualityState;
  warnings: string[];
  nonMonetizedBenefits: CardBenefit[];
}

export interface RecommendationResult {
  card: FinancialCard;
  eligibility: EligibilityResult;
  economicValue: IncrementalWalletValue;
  readiness: RecommendationReadiness;
  reasons: string[];
}

