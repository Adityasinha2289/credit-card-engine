import type { FinancialCard } from './types';
import type { UserContext, EligibilityResult, SpendingCategoryContext } from './userContext';
import { EligibilityService } from './EligibilityService';

export interface CandidateContext {
  card: FinancialCard;
  eligibility: EligibilityResult;
  spendingOverlap: Record<string, SpendingCategoryContext>; // Only categories where user spends AND card gives rewards
}

export interface CandidateGenerationResult {
  eligible: CandidateContext[];
  ineligible: CandidateContext[];
  unknown: CandidateContext[];
  alreadyOwned: CandidateContext[];
}

export class CandidateGenerator {
  
  public static generate(
    catalog: FinancialCard[], 
    context: UserContext
  ): CandidateGenerationResult {
    const result: CandidateGenerationResult = {
      eligible: [],
      ineligible: [],
      unknown: [],
      alreadyOwned: []
    };

    for (const card of catalog) {
      const eligibility = EligibilityService.evaluate(card, context);
      const spendingOverlap = this.calculateSpendingOverlap(card, context);
      
      const candidateContext: CandidateContext = {
        card,
        eligibility,
        spendingOverlap
      };

      switch (eligibility.status) {
        case 'ELIGIBLE':
          result.eligible.push(candidateContext);
          break;
        case 'INELIGIBLE':
          result.ineligible.push(candidateContext);
          break;
        case 'UNKNOWN':
          result.unknown.push(candidateContext);
          break;
        case 'ALREADY_OWNED':
          result.alreadyOwned.push(candidateContext);
          break;
      }
    }

    return result;
  }

  private static calculateSpendingOverlap(
    card: FinancialCard, 
    context: UserContext
  ): Record<string, SpendingCategoryContext> {
    const overlap: Record<string, SpendingCategoryContext> = {};
    
    // We only care about categories the user actually spends in.
    // If the card has a rule for a category, and the user spends in it, we capture the overlap.
    for (const [categoryId, spendContext] of Object.entries(context.spendingProfile)) {
      if (spendContext.monthlySpend <= 0) continue;

      // Check if the card has an explicit rule (not base rule) for this category
      // Base rules apply to everything, but for overlap analysis (Phase 3 inputs),
      // we highlight explicit category overlaps.
      const hasExplicitRule = card.rewardRules.some(r => 
        !r.isBaseRule && 
        !r.isExclusion && 
        r.categoryId?.toLowerCase() === categoryId.toLowerCase()
      );

      if (hasExplicitRule) {
        overlap[categoryId] = spendContext;
      }
    }

    return overlap;
  }
}
