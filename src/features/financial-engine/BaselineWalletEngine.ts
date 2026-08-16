import { FinancialTruthEngine } from './FinancialTruthEngine';
import type { FinancialCard } from './types';
import type { UserContext } from './userContext';

export class BaselineWalletEngine {
  
  /**
   * Calculates the highest possible reward for each spending category
   * using the user's EXISTING wallet cards.
   */
  public static calculateBaselines(
    context: UserContext,
    walletCards: FinancialCard[]
  ): Record<string, number> {
    const baselines: Record<string, number> = {};

    for (const [categoryId, spendContext] of Object.entries(context.spendingProfile)) {
      if (spendContext.monthlySpend <= 0) {
        baselines[categoryId] = 0;
        continue;
      }

      let maxCategoryReward = 0;

      for (const card of walletCards) {
        // Evaluate what this specific card would yield for this category spend
        const result = FinancialTruthEngine.calculateTransaction(
          { amount: spendContext.monthlySpend, categoryId },
          card
        );

        if (result.monetaryRewardValue > maxCategoryReward) {
          maxCategoryReward = result.monetaryRewardValue;
        }
      }

      baselines[categoryId] = maxCategoryReward;
    }

    return baselines;
  }
}
