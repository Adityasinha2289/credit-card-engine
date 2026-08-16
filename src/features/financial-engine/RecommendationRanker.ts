import type { CandidateGenerationResult, CandidateContext } from './CandidateGenerator';
import type { UserContext } from './userContext';
import type { FinancialCard } from './types';
import { BaselineWalletEngine } from './BaselineWalletEngine';
import { IncrementalValueEngine } from './IncrementalValueEngine';
import type { RecommendationResult, RecommendationReadiness, IncrementalWalletValue } from './recommendationTypes';

export class RecommendationRanker {
  
  public static rank(
    candidates: CandidateGenerationResult,
    context: UserContext,
    walletCards: FinancialCard[]
  ): RecommendationResult[] {
    
    // 1. Establish the Wallet Baseline across user spending categories
    const baselines = BaselineWalletEngine.calculateBaselines(context, walletCards);
    
    // 2. Evaluate Incremental Value for all ELIGIBLE candidates (Exclude ALREADY_OWNED and INELIGIBLE)
    const results: RecommendationResult[] = [];
    
    for (const candidate of candidates.eligible) {
      const economicValue = IncrementalValueEngine.calculate(candidate, context, baselines);
      
      const readiness: RecommendationReadiness = this.determineReadiness(economicValue);
      const reasons = this.generateReasons(economicValue, candidate);

      results.push({
        card: candidate.card,
        eligibility: candidate.eligibility,
        economicValue,
        readiness,
        reasons
      });
    }

    // 3. Deterministic Multi-Level Tier Sorting (Phase 3.75 Safety Hardening)
    // Tier 5: ACTIONABLE with positive net value (netAnnualValue > 0)
    // Tier 4: ACTIONABLE break-even (netAnnualValue === 0)
    // Tier 3: INFORMATIONAL_ONLY with non-negative calculable value (netAnnualValue >= 0)
    // Tier 2: INSUFFICIENT_DATA (missing redemption/caps preventing economic valuation)
    // Tier 1: NEGATIVE_VALUE (netAnnualValue < 0, where annual fees exceed incremental gross reward)
    //
    // Within each tier:
    // Secondary: netAnnualValue (descending)
    // Tertiary: annualGrossIncrementalReward (descending)
    // Quaternary: card.id (alphabetical ascending for absolute determinism)

    results.sort((a, b) => {
      const tierA = this.getRecommendationTier(a);
      const tierB = this.getRecommendationTier(b);

      const tierDiff = tierB - tierA;
      if (tierDiff !== 0) return tierDiff;
      
      const netValDiff = b.economicValue.netAnnualValue - a.economicValue.netAnnualValue;
      if (netValDiff !== 0) return netValDiff;

      const grossIncDiff = b.economicValue.annualGrossIncrementalReward - a.economicValue.annualGrossIncrementalReward;
      if (grossIncDiff !== 0) return grossIncDiff;

      return a.card.id.localeCompare(b.card.id);
    });

    return results;
  }

  public static getRecommendationTier(result: { readiness: RecommendationReadiness; economicValue: IncrementalWalletValue }): number {
    const { readiness, economicValue } = result;
    const net = economicValue.netAnnualValue;

    // 1. Cards with missing redemption/critical data have unknown gross economics (Tier 2)
    if (readiness === 'INSUFFICIENT_DATA') {
      return 2;
    }

    // 2. Cards with calculable rewards where annual fee exceeds gross incremental return (Tier 1)
    if (net < 0) {
      return 1;
    }

    // 3. Informational cards with calculable non-negative net value (Tier 3)
    if (readiness === 'INFORMATIONAL_ONLY') {
      return 3;
    }

    // 4. Actionable cards with verified data (Tier 4 for break-even, Tier 5 for positive)
    if (readiness === 'ACTIONABLE') {
      if (net > 0) {
        return 5;
      }
      return 4;
    }

    return 1;
  }

  public static determineReadiness(value: IncrementalWalletValue): RecommendationReadiness {
    if (value.dataQuality === 'INCOMPLETE') {
      return 'INSUFFICIENT_DATA';
    } else if (value.dataQuality === 'PARTIAL') {
      return 'INFORMATIONAL_ONLY';
    }
    return 'ACTIONABLE';
  }

  public static generateReasons(value: IncrementalWalletValue, candidate: CandidateContext): string[] {
    const reasons: string[] = [];
    
    if (value.dataQuality === 'INCOMPLETE') {
      reasons.push('This card requires additional financial data (e.g., redemption value) to calculate true economic value.');
      if (value.warnings.length > 0) {
        for (const w of value.warnings) {
          reasons.push(`Data Warning: ${w}`);
        }
      }
      return reasons;
    }

    // Identify categories with positive incremental value
    const positiveCategories = value.categoryBreakdowns.filter(c => c.incrementalReward > 0);
    positiveCategories.sort((a, b) => b.incrementalReward - a.incrementalReward);

    if (positiveCategories.length > 0) {
      for (const cat of positiveCategories) {
        const annualExisting = cat.existingBaselineReward * 12;
        const annualCandidate = cat.candidateGrossReward * 12;
        const annualInc = cat.annualIncrementalReward;
        
        reasons.push(`Your existing wallet earns approximately ₹${annualExisting.toFixed(0)}/year on ${cat.categoryId}.`);
        reasons.push(`This card could generate approximately ₹${annualCandidate.toFixed(0)}/year on your ${cat.categoryId} spend.`);
        reasons.push(`Estimated incremental value for ${cat.categoryId}: +₹${annualInc.toFixed(0)}/year.`);
      }
    } else {
      reasons.push('This card does not create incremental rewards above your current wallet baseline on your spending profile.');
    }

    // Fee breakdown
    if (value.annualFeeStatus === 'VERIFIED') {
      reasons.push(`Annual fee: ₹${value.annualFee.toFixed(0)}/year.`);
      if (value.joiningFee > 0) {
        reasons.push(`Joining fee: ₹${value.joiningFee.toFixed(0)} (First-year net value: ₹${value.firstYearNetValue.toFixed(0)}).`);
      }
    } else {
      reasons.push('Annual fee: Unknown in verified database.');
    }
    
    // Net incremental value
    if (value.netAnnualValue > 0) {
      reasons.push(`Estimated net incremental value: +₹${value.netAnnualValue.toFixed(0)}/year.`);
    } else {
      reasons.push(`Estimated net incremental value: ₹${value.netAnnualValue.toFixed(0)}/year (does not offset fees or existing wallet).`);
    }

    // Data quality warnings
    for (const warning of value.warnings) {
      reasons.push(`Notice: ${warning}`);
    }

    return reasons;
  }
}

