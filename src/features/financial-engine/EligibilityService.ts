import type { FinancialCard } from './types';
import type { UserContext, EligibilityResult, EligibilityStatus } from './userContext';

export class EligibilityService {
  
  public static evaluate(card: FinancialCard, context: UserContext): EligibilityResult {
    const reasons: string[] = [];
    const failedRules: string[] = [];
    const unknownRules: string[] = [];
    let status: EligibilityStatus = 'ELIGIBLE'; // Assume eligible until disproven

    // 1. Duplicate Ownership Check (Highest Precedence)
    if (context.existingWalletCardIds.includes(card.id)) {
      return {
        cardId: card.id,
        status: 'ALREADY_OWNED',
        reasons: ['User already owns this card.'],
        failedRules: [],
        unknownRules: []
      };
    }

    // 2. No Eligibility Constraints on Card
    if (!card.eligibility || card.eligibility.length === 0) {
      // If the card strictly requires nothing, it is eligible.
      // However, most real-world data is missing eligibility data, not explicitly zero constraints.
      // As per Phase 2 rules: Missing data remains UNKNOWN, but if the array is entirely empty
      // and we have no fallback, we must treat it as UNKNOWN because we don't know the rules.
      // If there are explicit elements with undefined fields, we evaluate them.
      return {
        cardId: card.id,
        status: 'UNKNOWN',
        reasons: ['Card eligibility requirements are completely missing from the dataset.'],
        failedRules: [],
        unknownRules: ['MISSING_ELIGIBILITY_DATA']
      };
    }

    // 3. Evaluate Explicit Constraints
    for (const rule of card.eligibility) {
      
      // Evaluate CIBIL
      if (rule.minCibil !== undefined) {
        if (context.financialProfile.creditScore === undefined) {
          status = status === 'INELIGIBLE' ? 'INELIGIBLE' : 'UNKNOWN';
          unknownRules.push('CIBIL');
          reasons.push(`CIBIL: required ${rule.minCibil}, but user score is unknown.`);
        } else if (context.financialProfile.creditScore >= rule.minCibil) {
          reasons.push(`CIBIL: ${context.financialProfile.creditScore} >= required ${rule.minCibil}.`);
        } else {
          status = 'INELIGIBLE';
          failedRules.push('CIBIL');
          reasons.push(`CIBIL: ${context.financialProfile.creditScore} < required ${rule.minCibil}.`);
        }
      }

      // Evaluate Income
      if (rule.minIncome !== undefined) {
        if (context.financialProfile.annualIncome === undefined) {
          status = status === 'INELIGIBLE' ? 'INELIGIBLE' : 'UNKNOWN';
          unknownRules.push('INCOME');
          reasons.push(`Income: required ₹${rule.minIncome}/yr, but user income is unknown.`);
        } else if (context.financialProfile.annualIncome >= rule.minIncome) {
          reasons.push(`Income: ₹${context.financialProfile.annualIncome}/yr >= required ₹${rule.minIncome}/yr.`);
        } else {
          status = 'INELIGIBLE';
          failedRules.push('INCOME');
          reasons.push(`Income: ₹${context.financialProfile.annualIncome}/yr < required ₹${rule.minIncome}/yr.`);
        }
      }

      // Evaluate Employment Type (Basic Exact Match if required)
      if (rule.employmentType !== undefined && rule.employmentType.trim() !== '') {
        if (!context.financialProfile.employmentType) {
          status = status === 'INELIGIBLE' ? 'INELIGIBLE' : 'UNKNOWN';
          unknownRules.push('EMPLOYMENT');
          reasons.push(`Employment: required ${rule.employmentType}, but user employment is unknown.`);
        } else if (context.financialProfile.employmentType.toLowerCase() === rule.employmentType.toLowerCase()) {
          reasons.push(`Employment: user is ${context.financialProfile.employmentType}, matches requirement.`);
        } else {
          status = 'INELIGIBLE';
          failedRules.push('EMPLOYMENT');
          reasons.push(`Employment: user is ${context.financialProfile.employmentType}, does not match required ${rule.employmentType}.`);
        }
      }
    }

    return {
      cardId: card.id,
      status,
      reasons,
      failedRules,
      unknownRules
    };
  }
}
