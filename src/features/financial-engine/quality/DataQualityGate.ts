import type { FinancialCard, RewardRule, RewardCap, RedemptionRate } from '../types';
import type { VerificationStatus } from '../provenanceTypes';

export interface QualityIssue {
  severity: 'BLOCKING' | 'WARNING' | 'INFORMATIONAL';
  code: string;
  field: string;
  message: string;
}

export interface QualityGateResult {
  isValid: boolean; // true only if zero BLOCKING issues exist
  blockingIssues: QualityIssue[];
  warnings: QualityIssue[];
  informational: QualityIssue[];
  summary: {
    blockingCount: number;
    warningCount: number;
    informationalCount: number;
  };
}

export class DataQualityGate {
  
  /**
   * Comprehensive validation of a FinancialCard against strict quality gates.
   */
  public static validate(card: FinancialCard): QualityGateResult {
    const issues: QualityIssue[] = [];

    // 1. Fee Checks
    if (card.annualFee < 0) {
      issues.push({
        severity: 'BLOCKING',
        code: 'NEGATIVE_ANNUAL_FEE',
        field: 'annualFee',
        message: `Annual fee cannot be negative: ₹${card.annualFee}`
      });
    }

    if (card.joiningFee < 0) {
      issues.push({
        severity: 'BLOCKING',
        code: 'NEGATIVE_JOINING_FEE',
        field: 'joiningFee',
        message: `Joining fee cannot be negative: ₹${card.joiningFee}`
      });
    }

    if (card.feeWaiverSpend !== undefined && card.feeWaiverSpend < 0) {
      issues.push({
        severity: 'BLOCKING',
        code: 'NEGATIVE_FEE_WAIVER_SPEND',
        field: 'feeWaiverSpend',
        message: `Fee waiver spend threshold cannot be negative: ₹${card.feeWaiverSpend}`
      });
    }

    // 2. Reward Rules Checks
    const activeRulesByScope = new Map<string, RewardRule[]>();

    for (let i = 0; i < card.rewardRules.length; i++) {
      const rule = card.rewardRules[i];
      const ruleId = rule.id || `rule[${i}]`;

      // Scope validation
      if (!rule.categoryId && !rule.merchantId && !rule.isBaseRule && !rule.isExclusion) {
        issues.push({
          severity: 'BLOCKING',
          code: 'AMBIGUOUS_RULE_TARGET',
          field: `rewardRules[${i}]`,
          message: `Rule ${ruleId} has no categoryId, merchantId, isBaseRule=true, or isExclusion=true.`
        });
      }

      // Earning mechanics validation
      if (!rule.isExclusion) {
        if (rule.earningMethod === 'PERCENTAGE') {
          if (rule.baseRate === undefined || isNaN(rule.baseRate)) {
            issues.push({
              severity: 'BLOCKING',
              code: 'MISSING_PERCENTAGE_RATE',
              field: `rewardRules[${i}].baseRate`,
              message: `PERCENTAGE rule ${ruleId} must specify a numeric baseRate.`
            });
          } else if (rule.baseRate < 0 || rule.baseRate > 100) {
            issues.push({
              severity: 'BLOCKING',
              code: 'INVALID_PERCENTAGE_BOUNDS',
              field: `rewardRules[${i}].baseRate`,
              message: `Percentage rate must be between 0 and 100: ${rule.baseRate}%`
            });
          }
        } else if (rule.earningMethod === 'POINTS_PER_SPEND') {
          if (rule.pointsAwarded === undefined || rule.pointsAwarded < 0) {
            issues.push({
              severity: 'BLOCKING',
              code: 'INVALID_POINTS_AWARDED',
              field: `rewardRules[${i}].pointsAwarded`,
              message: `Points awarded must be non-negative: ${rule.pointsAwarded}`
            });
          }
          if (rule.spendRequirement === undefined || rule.spendRequirement <= 0) {
            issues.push({
              severity: 'BLOCKING',
              code: 'INVALID_SPEND_REQUIREMENT',
              field: `rewardRules[${i}].spendRequirement`,
              message: `Spend requirement must be strictly greater than 0: ${rule.spendRequirement}`
            });
          }
        }
      }

      // Temporal bounds check
      if (rule.effectiveFrom && rule.effectiveUntil) {
        if (new Date(rule.effectiveFrom) > new Date(rule.effectiveUntil)) {
          issues.push({
            severity: 'BLOCKING',
            code: 'INVALID_TEMPORAL_RANGE',
            field: `rewardRules[${i}].effectiveRange`,
            message: `effectiveFrom (${rule.effectiveFrom}) cannot be later than effectiveUntil (${rule.effectiveUntil})`
          });
        }
      }

      // Verification & Provenance gating
      if (rule.isActive !== false && rule.verificationStatus === 'ACTIVE') {
        if (!rule.snapshotId && !rule.rawSourceText && !rule.rawSourceExcerpt) {
          issues.push({
            severity: 'BLOCKING',
            code: 'MISSING_PROVENANCE_FOR_ACTIVE_RULE',
            field: `rewardRules[${i}].provenance`,
            message: `Active rule ${ruleId} must contain source snapshot or raw source evidence.`
          });
        }
      }

      // Overlapping version check for active rules
      const scopeKey = `${rule.categoryId || '*'}|${rule.merchantId || '*'}|${rule.isBaseRule}|${rule.isExclusion}`;
      const existing = activeRulesByScope.get(scopeKey) || [];
      for (const other of existing) {
        if (this.datesOverlap(rule.effectiveFrom, rule.effectiveUntil, other.effectiveFrom, other.effectiveUntil)) {
          issues.push({
            severity: 'BLOCKING',
            code: 'OVERLAPPING_RULE_VERSIONS',
            field: `rewardRules[${i}]`,
            message: `Rule ${ruleId} overlaps with rule ${other.id || 'prior'} on identical scope ${scopeKey}.`
          });
        }
      }
      existing.push(rule);
      activeRulesByScope.set(scopeKey, existing);

      // Warnings on uncapped accelerated rules
      if (!rule.isBaseRule && !rule.isExclusion && !rule.isUncapped) {
        const hasLinkedCap = card.caps.some(c => c.linkedRuleIds?.includes(rule.id || ''));
        if (!hasLinkedCap && card.caps.length === 0) {
          issues.push({
            severity: 'WARNING',
            code: 'ACCELERATED_RULE_MISSING_CAP',
            field: `rewardRules[${i}]`,
            message: `Accelerated rule ${ruleId} (${rule.categoryId || rule.merchantId}) lacks an explicit cap and is not marked isUncapped=true.`
          });
        }
      }
    }

    // 3. Reward Caps Checks
    for (let i = 0; i < card.caps.length; i++) {
      const cap = card.caps[i];
      if (cap.maxValue <= 0) {
        issues.push({
          severity: 'BLOCKING',
          code: 'INVALID_CAP_MAX_VALUE',
          field: `caps[${i}].maxValue`,
          message: `Cap maximum value must be strictly positive: ${cap.maxValue}`
        });
      }
      if (cap.effectiveFrom && cap.effectiveUntil) {
        if (new Date(cap.effectiveFrom) > new Date(cap.effectiveUntil)) {
          issues.push({
            severity: 'BLOCKING',
            code: 'INVALID_CAP_TEMPORAL_RANGE',
            field: `caps[${i}].effectiveRange`,
            message: `Cap effectiveFrom (${cap.effectiveFrom}) cannot exceed effectiveUntil (${cap.effectiveUntil})`
          });
        }
      }
    }

    // 4. Redemption Rates Checks
    const hasPointsOrMilesRules = card.rewardRules.some(r => r.rewardType === 'POINTS' || r.rewardType === 'MILES');
    if (hasPointsOrMilesRules) {
      if (card.redemptionRates.length === 0) {
        issues.push({
          severity: 'WARNING',
          code: 'MISSING_REDEMPTION_RATES',
          field: 'redemptionRates',
          message: `Card earns Points/Miles but contains 0 verified redemption conversion records.`
        });
      } else {
        for (let i = 0; i < card.redemptionRates.length; i++) {
          const red = card.redemptionRates[i];
          if (red.monetaryValue !== null && red.monetaryValue < 0) {
            issues.push({
              severity: 'BLOCKING',
              code: 'NEGATIVE_REDEMPTION_MONETARY_VALUE',
              field: `redemptionRates[${i}].monetaryValue`,
              message: `Redemption monetary value cannot be negative: ₹${red.monetaryValue}`
            });
          }
          if (red.pointsRequired !== undefined && red.pointsRequired <= 0) {
            issues.push({
              severity: 'BLOCKING',
              code: 'INVALID_POINTS_REQUIRED',
              field: `redemptionRates[${i}].pointsRequired`,
              message: `Points required must be strictly positive: ${red.pointsRequired}`
            });
          }
        }
      }
    }

    const blockingIssues = issues.filter(i => i.severity === 'BLOCKING');
    const warnings = issues.filter(i => i.severity === 'WARNING');
    const informational = issues.filter(i => i.severity === 'INFORMATIONAL');

    return {
      isValid: blockingIssues.length === 0,
      blockingIssues,
      warnings,
      informational,
      summary: {
        blockingCount: blockingIssues.length,
        warningCount: warnings.length,
        informationalCount: informational.length
      }
    };
  }

  /**
   * Deterministically filters and selects active rules for a specific transaction timestamp.
   */
  public static selectActiveRules(rules: RewardRule[], targetDate?: string): RewardRule[] {
    const target = targetDate ? new Date(targetDate) : new Date();

    return rules.filter(rule => {
      // Verification Gating: Draft/Unverified/Rejected/Pending rules are strictly isolated from engine calculations
      if (rule.verificationStatus) {
        if (rule.verificationStatus !== 'ACTIVE' && rule.verificationStatus !== 'VERIFIED' && rule.verificationStatus !== 'SUPERSEDED') {
          return false;
        }
        // If superseded, it can only be selected if an explicit historical targetDate is provided within its validity window
        if (rule.verificationStatus === 'SUPERSEDED' && !targetDate) {
          return false;
        }
      }

      // If targetDate is not specified, only return rules where isActive !== false
      if (!targetDate && rule.isActive === false) {
        return false;
      }

      // Check effective date window
      if (rule.effectiveFrom) {
        const fromDate = new Date(rule.effectiveFrom);
        if (target < fromDate) return false;
      }

      if (rule.effectiveUntil) {
        const untilDate = new Date(rule.effectiveUntil);
        if (target > untilDate) return false;
      }

      return true;
    });
  }

  /**
   * Deterministically filters and selects active redemption rates for a given target date.
   */
  public static selectActiveRedemptions(rates: RedemptionRate[], targetDate?: string): RedemptionRate[] {
    const target = targetDate ? new Date(targetDate) : new Date();

    return rates.filter(rate => {
      if (rate.isActive === false || rate.verificationStatus === 'REJECTED') {
        return false;
      }

      if (rate.effectiveFrom) {
        const fromDate = new Date(rate.effectiveFrom);
        if (target < fromDate) return false;
      }

      if (rate.effectiveUntil) {
        const untilDate = new Date(rate.effectiveUntil);
        if (target >= untilDate) return false;
      }

      return true;
    });
  }

  /**
   * Helper to check if two temporal date ranges overlap.
   */
  private static datesOverlap(
    from1?: string,
    until1?: string | null,
    from2?: string,
    until2?: string | null
  ): boolean {
    const start1 = from1 ? new Date(from1).getTime() : 0;
    const end1 = until1 ? new Date(until1).getTime() : Infinity;
    const start2 = from2 ? new Date(from2).getTime() : 0;
    const end2 = until2 ? new Date(until2).getTime() : Infinity;

    return Math.max(start1, start2) < Math.min(end1, end2);
  }
}
