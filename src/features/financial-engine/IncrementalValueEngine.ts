import { FinancialTruthEngine } from './FinancialTruthEngine';
import type { CandidateContext } from './CandidateGenerator';
import type { UserContext } from './userContext';
import type { 
  IncrementalWalletValue, 
  CategoryValueBreakdown, 
  DataQualityState,
  OverlapLevel,
  FeeStatus
} from './recommendationTypes';

export class IncrementalValueEngine {
  
  public static calculate(
    candidate: CandidateContext,
    context: UserContext,
    baselines: Record<string, number>
  ): IncrementalWalletValue {
    
    let totalMonthlyGrossCandidate = 0;
    let totalMonthlyBaseline = 0;
    let totalMonthlyIncremental = 0;

    const categoryBreakdowns: CategoryValueBreakdown[] = [];
    const warnings = new Set<string>();
    const overlapCategories: string[] = [];
    
    let isMissingRedemption = false;
    let isMissingCaps = false;

    // Evaluate economic value across all user spending categories
    for (const [categoryId, spendContext] of Object.entries(context.spendingProfile)) {
      if (spendContext.monthlySpend <= 0) {
        continue;
      }

      const baseline = baselines[categoryId] || 0;

      const result = FinancialTruthEngine.calculateTransaction(
        { amount: spendContext.monthlySpend, categoryId },
        candidate.card
      );

      // Collect warnings
      for (const w of result.warnings) {
        if (w === 'MISSING_REDEMPTION_VALUE') isMissingRedemption = true;
        if (w === 'CAPS_MISSING_IN_DATA') isMissingCaps = true;
      }

      const candidateReward = result.monetaryRewardValue;
      
      // Step 5: Incremental Category Value = Max(0, candidateReward - baseline)
      // Clamping negative values ensures candidate is not penalized below zero incremental value
      const incrementalReward = Math.max(0, candidateReward - baseline);

      totalMonthlyGrossCandidate += candidateReward;
      totalMonthlyBaseline += baseline;
      totalMonthlyIncremental += incrementalReward;

      // Track overlap: user spends here, card yields rewards, and baseline > 0
      if (candidateReward > 0 && baseline > 0) {
        overlapCategories.push(categoryId);
      }

      categoryBreakdowns.push({
        categoryId,
        monthlySpend: spendContext.monthlySpend,
        candidateGrossReward: candidateReward,
        existingBaselineReward: baseline,
        incrementalReward,
        annualIncrementalReward: incrementalReward * 12
      });
    }

    const annualGrossIncrementalReward = totalMonthlyIncremental * 12;
    const grossCandidateAnnualReward = totalMonthlyGrossCandidate * 12;
    const existingWalletBaselineAnnualReward = totalMonthlyBaseline * 12;
    
    // Fee treatment (Steps 8 & 9)
    const annualFee = candidate.card.annualFee;
    const annualFeeStatus: FeeStatus = (annualFee !== undefined && annualFee !== null && !isNaN(annualFee)) 
      ? 'VERIFIED' 
      : 'UNKNOWN';
      
    const joiningFee = (candidate.card.joiningFee !== undefined && candidate.card.joiningFee !== null && !isNaN(candidate.card.joiningFee))
      ? candidate.card.joiningFee
      : 0;

    // First-year vs steady-state annual economics
    const steadyStateAnnualValue = annualFeeStatus === 'VERIFIED'
      ? annualGrossIncrementalReward - annualFee
      : annualGrossIncrementalReward;

    const firstYearNetValue = annualFeeStatus === 'VERIFIED'
      ? annualGrossIncrementalReward - (annualFee + joiningFee)
      : annualGrossIncrementalReward;

    // Primary ranking economic metric
    const netAnnualValue = steadyStateAnnualValue;

    // Overlap Level (Step 17)
    let overlapLevel: OverlapLevel = 'NO_OVERLAP';
    if (overlapCategories.length >= 2) {
      overlapLevel = 'HIGH_OVERLAP';
    } else if (overlapCategories.length === 1) {
      overlapLevel = 'LOW_OVERLAP';
    }

    // Data Quality & Gating evaluation (Steps 12, 13, 24)
    let dataQuality: DataQualityState = 'COMPLETE';
    if (isMissingRedemption) {
      dataQuality = 'INCOMPLETE';
      warnings.add('Cannot calculate economic value: Missing redemption ratio.');
    } else if (isMissingCaps || annualFeeStatus === 'UNKNOWN') {
      dataQuality = 'PARTIAL';
      if (isMissingCaps) warnings.add('Calculation may be artificially high due to missing cap constraints.');
      if (annualFeeStatus === 'UNKNOWN') warnings.add('Annual fee is unknown, net value is potentially inaccurate.');
    }

    return {
      grossCandidateAnnualReward,
      existingWalletBaselineAnnualReward,
      annualGrossIncrementalReward,
      annualFee: annualFeeStatus === 'VERIFIED' ? annualFee : 0,
      annualFeeStatus,
      joiningFee,
      firstYearNetValue,
      steadyStateAnnualValue,
      netAnnualValue,
      categoryBreakdowns,
      overlapLevel,
      overlapCategories,
      dataQuality,
      warnings: Array.from(warnings),
      nonMonetizedBenefits: candidate.card.benefits || []
    };
  }
}

