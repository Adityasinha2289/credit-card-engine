import type {
  FinancialCard,
  TransactionInput,
  CalculationResult,
  RewardRule,
  RewardType,
  RewardCap,
  RedemptionRate
} from './types';

export interface CalculationContext {
  consumedCaps?: Record<string, number>; // Maps cap period to amount consumed so far
  /** Evaluate rules/caps/redemptions as of this date (YYYY-MM-DD). Defaults to today. */
  asOf?: string;
}

type Dated = { isActive?: boolean; effectiveFrom?: string; effectiveUntil?: string | null };

/** A versioned record applies when it isn't switched off and `asOf` is inside its window. */
function isEffective(r: Dated, asOf: string): boolean {
  if (r.isActive === false) return false;
  if (r.effectiveFrom && r.effectiveFrom > asOf) return false;
  if (r.effectiveUntil && r.effectiveUntil < asOf) return false;
  return true;
}

export class FinancialTruthEngine {
  private static readonly VERSION = '1.75.0-phase1.75';

  public static calculateTransaction(
    input: TransactionInput,
    card: FinancialCard,
    context?: CalculationContext
  ): CalculationResult {
    const warnings: string[] = [];

    // 1. Data Validation
    if (input.amount < 0) {
      throw new Error('Transaction amount cannot be negative');
    }

    if (input.amount === 0) {
      return this.createEmptyResult(input.amount, 'UNKNOWN', [], 'Zero spend');
    }

    if (!card.rewardRules || card.rewardRules.length === 0) {
      warnings.push('MISSING_REWARD_DATA');
      return this.createEmptyResult(input.amount, 'UNKNOWN', warnings, 'No reward rules found');
    }

    const asOf = context?.asOf ?? new Date().toISOString().slice(0, 10);
    const valuePerPoint = this.valuePerPoint(card.redemptionRates, asOf);

    // 2. Rule Resolution (only rules in force on `asOf`; best rule wins within a precedence level)
    const rule = this.resolveRule(input, card.rewardRules.filter(r => isEffective(r, asOf)), valuePerPoint);

    if (!rule) {
      warnings.push('NO_APPLICABLE_RULE');
      return this.createEmptyResult(input.amount, 'UNKNOWN', warnings, 'No applicable rule');
    }

    // Cap data quality. A rule explicitly marked uncapped (e.g. a flat base rate)
    // has no cap to be missing, so it must not be downgraded for lacking one.
    if (card.caps.length === 0) {
      if (!rule.isUncapped) warnings.push('CAPS_MISSING_IN_DATA');
    } else if (!context || !context.consumedCaps) {
      warnings.push('CAPS_UNVERIFIED');
    }

    // 3. Exclusions
    if (rule.isExclusion) {
      return this.createEmptyResult(input.amount, rule.rewardType, warnings, 'Category excluded', true);
    }

    // 4. Gross Reward Calculation
    let grossReward = 0;
    if (rule.earningMethod === 'PERCENTAGE' && rule.baseRate !== undefined) {
      // Phase 1.5 adversarial feedback: use floor or round to 2 decimals.
      // For financial truth, we will compute exactly, but a system might floor it.
      // We will leave the exact decimal here as the truth layer, and UI can round.
      grossReward = (input.amount * rule.baseRate) / 100;
    } else if (rule.earningMethod === 'POINTS_PER_SPEND' && rule.spendRequirement && rule.pointsAwarded !== undefined) {
      if (rule.spendRequirement > 0) {
        // Points are usually awarded on whole multiples of the spend requirement
        const multiples = Math.floor(input.amount / rule.spendRequirement);
        grossReward = multiples * rule.pointsAwarded;
      } else {
        warnings.push('INVALID_POINTS_RULE');
        return this.createEmptyResult(input.amount, rule.rewardType, warnings, 'Invalid points rule');
      }
    } else if (rule.earningMethod === 'FLAT' && rule.pointsAwarded !== undefined) {
       grossReward = rule.pointsAwarded;
    } else {
      warnings.push('UNSUPPORTED_EARNING_METHOD');
      return this.createEmptyResult(input.amount, rule.rewardType, warnings, 'Unsupported method');
    }

    // 5. Cap Handling
    let finalReward = grossReward;
    let capApplied = false;
    let capRemaining: number | null = null;

    // Prefer a cap explicitly linked to this rule over a card-wide cap.
    const effectiveCaps = card.caps.filter(c => isEffective(c, asOf));
    const linkedCap = effectiveCaps.find(c => rule.id && c.linkedRuleIds?.includes(rule.id));
    const globalCap = effectiveCaps.find(c => !c.linkedRuleIds || c.linkedRuleIds.length === 0);
    const rawCap = linkedCap ?? globalCap;
    // Express the cap in the same unit as the reward (rupees for cashback, points/miles otherwise).
    const applicableCap = rawCap ? this.capInRewardUnits(rawCap, rule.rewardType, valuePerPoint, warnings) : undefined;

    if (applicableCap) {
      if (applicableCap.period === 'TRANSACTION') {
        if (finalReward > applicableCap.maxValue) {
          finalReward = applicableCap.maxValue;
          capApplied = true;
          capRemaining = 0;
        } else {
          capRemaining = applicableCap.maxValue - finalReward;
        }
      } else if (context && context.consumedCaps && context.consumedCaps[applicableCap.period] !== undefined) {
        const consumed = context.consumedCaps[applicableCap.period];
        const available = Math.max(0, applicableCap.maxValue - consumed);

        if (finalReward > available) {
          finalReward = available;
          capApplied = true;
          capRemaining = 0;
        } else {
          capRemaining = available - finalReward;
        }
      } else {
        // Cap exists but no usage context.
        if (finalReward > applicableCap.maxValue) {
          finalReward = applicableCap.maxValue;
          capApplied = true;
        }
      }
    }

    // 6. Monetization
    let monetaryRewardValue = 0;
    let redemptionValue: number | null = null;

    if (rule.rewardType === 'CASHBACK') {
      monetaryRewardValue = finalReward;
      redemptionValue = 1.0;
    } else {
      // It's POINTS or MILES: value per point = monetaryValue / pointsRequired,
      // using the best redemption in force (users redeem at the best option).
      if (valuePerPoint !== null) {
        redemptionValue = valuePerPoint;
        monetaryRewardValue = finalReward * valuePerPoint;
      } else {
        warnings.push('MISSING_REDEMPTION_VALUE');
        monetaryRewardValue = 0; // Explicitly do NOT invent a value
      }
    }

    return {
      grossReward,
      rewardType: rule.rewardType,
      eligibleSpend: input.amount,
      excludedSpend: 0,
      capApplied,
      capRemaining,
      redemptionValue,
      monetaryRewardValue,
      warnings,
      calculationVersion: this.VERSION
    };
  }

  /** Rupees per point/mile from the best redemption option in force; null when unknown. */
  public static valuePerPoint(rates: RedemptionRate[], asOf: string): number | null {
    let best: number | null = null;
    for (const r of rates) {
      if (!isEffective(r, asOf) || r.monetaryValue === null || r.monetaryValue === undefined) continue;
      const perPoint = r.monetaryValue / (r.pointsRequired && r.pointsRequired > 0 ? r.pointsRequired : 1);
      if (best === null || perPoint > best) best = perPoint;
    }
    return best;
  }

  private static capInRewardUnits(
    cap: RewardCap,
    rewardType: RewardType,
    valuePerPoint: number | null,
    warnings: string[],
  ): RewardCap | undefined {
    const rewardIsMoney = rewardType === 'CASHBACK';
    const capIsMoney = cap.unit === 'MONETARY';
    if (rewardIsMoney === capIsMoney) return cap;
    if (valuePerPoint === null || valuePerPoint <= 0) {
      warnings.push('CAP_UNIT_UNCONVERTIBLE');
      return undefined;
    }
    // Rupee cap on a points reward -> points; points cap on a cashback reward -> rupees.
    const maxValue = capIsMoney ? cap.maxValue / valuePerPoint : cap.maxValue * valuePerPoint;
    return { ...cap, maxValue };
  }

  /** Rough rupee value of a rule per Rs 100 spent; only used to choose between rules at the same precedence. */
  private static ruleStrength(rule: RewardRule, valuePerPoint: number | null): number {
    if (rule.isExclusion) return -1;
    const toMoney = rule.rewardType === 'CASHBACK' ? 1 : (valuePerPoint ?? 0);
    if (rule.earningMethod === 'PERCENTAGE' && rule.baseRate !== undefined) return rule.baseRate * toMoney;
    if (rule.earningMethod === 'POINTS_PER_SPEND' && rule.pointsAwarded !== undefined && rule.spendRequirement) {
      return (rule.pointsAwarded / rule.spendRequirement) * 100 * toMoney;
    }
    return 0;
  }

  private static pickBest(rules: RewardRule[], valuePerPoint: number | null): RewardRule | undefined {
    if (rules.length <= 1) return rules[0];
    // An exclusion at this precedence level always wins (e.g. "no rewards on fuel").
    const exclusion = rules.find(r => r.isExclusion);
    if (exclusion) return exclusion;
    return [...rules].sort((a, b) => this.ruleStrength(b, valuePerPoint) - this.ruleStrength(a, valuePerPoint))[0];
  }

  private static resolveRule(input: TransactionInput, rules: RewardRule[], valuePerPoint: number | null = null): RewardRule | undefined {
    // 1. Exact merchant match (highest precedence)
    if (input.merchantId) {
      const merchantMatches = rules.filter(r => r.merchantId?.toLowerCase() === input.merchantId?.toLowerCase());
      if (merchantMatches.length) return this.pickBest(merchantMatches, valuePerPoint);
    }

    // 2. Exact category match (merchant-specific rules don't apply to other merchants)
    if (input.categoryId) {
      const catMatches = rules.filter(r => !r.merchantId && r.categoryId?.toLowerCase() === input.categoryId.toLowerCase());
      if (catMatches.length) return this.pickBest(catMatches, valuePerPoint);
    }

    // 3. Fallback to explicit base rule (or universal rule where category is 'all')
    const baseRules = rules.filter(r => !r.merchantId && (r.isBaseRule || r.categoryId?.toLowerCase() === 'all'));
    if (baseRules.length) return this.pickBest(baseRules, valuePerPoint);

    // 4. No applicable rule found
    return undefined;
  }

  private static createEmptyResult(
    amount: number,
    rewardType: RewardType,
    warnings: string[],
    reason: string,
    isExclusion = false
  ): CalculationResult {
    if (reason) warnings.push(`REASON: ${reason}`);
    return {
      grossReward: 0,
      rewardType,
      eligibleSpend: isExclusion ? 0 : amount,
      excludedSpend: isExclusion ? amount : 0,
      capApplied: false,
      capRemaining: null,
      redemptionValue: null,
      monetaryRewardValue: 0,
      warnings,
      calculationVersion: this.VERSION
    };
  }
}
