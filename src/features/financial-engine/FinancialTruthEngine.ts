import type { 
  FinancialCard, 
  TransactionInput, 
  CalculationResult, 
  RewardRule,
  RewardType
} from './types';

export interface CalculationContext {
  consumedCaps?: Record<string, number>; // Maps cap period to amount consumed so far
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

    if (card.caps.length === 0) {
      warnings.push('CAPS_MISSING_IN_DATA');
    } else if (!context || !context.consumedCaps) {
      warnings.push('CAPS_UNVERIFIED'); 
    }

    // 2. Rule Resolution
    const rule = this.resolveRule(input, card.rewardRules);
    
    if (!rule) {
      warnings.push('NO_APPLICABLE_RULE');
      return this.createEmptyResult(input.amount, 'UNKNOWN', warnings, 'No applicable rule');
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
    
    const applicableCap = card.caps.find(c => 
      !c.linkedRuleIds || c.linkedRuleIds.length === 0 || (rule.id && c.linkedRuleIds.includes(rule.id))
    );

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
      // It's POINTS or MILES
      const rate = card.redemptionRates[0];
      if (rate && rate.monetaryValue !== null) {
        redemptionValue = rate.monetaryValue;
        monetaryRewardValue = finalReward * rate.monetaryValue;
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

  private static resolveRule(input: TransactionInput, rules: RewardRule[]): RewardRule | undefined {
    // 1. Exact merchant match (highest precedence)
    if (input.merchantId) {
      const merchantMatch = rules.find(r => r.merchantId?.toLowerCase() === input.merchantId?.toLowerCase());
      if (merchantMatch) return merchantMatch;
    }

    // 2. Exact category match
    if (input.categoryId) {
      const catMatch = rules.find(r => r.categoryId?.toLowerCase() === input.categoryId.toLowerCase());
      if (catMatch) return catMatch;
    }

    // 3. Fallback to explicit base rule (or universal rule where category is 'all')
    const baseRule = rules.find(r => r.isBaseRule || r.categoryId?.toLowerCase() === 'all');
    if (baseRule) return baseRule;

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
