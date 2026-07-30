import { CardRepository } from '../../card-intelligence/cardRepository';
import { MerchantRepository } from '../../merchant-intelligence/merchantRepository';
import type { BenchmarkScenario, ValidationError, ValidationSummary } from './benchmarkTypes';

export class ScenarioValidator {
  public static validateDataset(
    scenarios: BenchmarkScenario[],
    knownCardIds?: string[],
    knownMerchantIds?: string[]
  ): ValidationSummary {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    const seenIds = new Set<string>();

    const cardRepo = CardRepository.getInstance();
    const merchantRepo = MerchantRepository.getInstance();

    const catalogCardIds = new Set(
      knownCardIds || cardRepo.getCards().map((c) => c.id)
    );
    const catalogMerchantIds = new Set(
      knownMerchantIds || merchantRepo.getMerchants().map((m) => m.id)
    );
    const catalogOffers = merchantRepo.getOffers();
    const catalogOfferIds = new Set(catalogOffers.map((o) => o.id));

    for (let index = 0; index < scenarios.length; index++) {
      const scenario = scenarios[index];
      const sId = scenario.id || `scenario-idx-${index}`;

      // 1. Check ID presence & uniqueness
      if (!scenario.id) {
        errors.push({
          scenarioId: sId,
          field: 'id',
          message: 'Scenario is missing an ID',
          severity: 'error',
        });
      } else if (seenIds.has(scenario.id)) {
        errors.push({
          scenarioId: scenario.id,
          field: 'id',
          message: `Duplicate scenario ID"${scenario.id}" found`,
          severity: 'error',
        });
      } else {
        seenIds.add(scenario.id);
      }

      // 2. Check input merchant
      if (!scenario.input?.merchant || typeof scenario.input.merchant !== 'string' || !scenario.input.merchant.trim()) {
        errors.push({
          scenarioId: sId,
          field: 'input.merchant',
          message: 'Scenario has invalid or missing merchant name',
          severity: 'error',
        });
      }

      // 3. Check input amount (negative or zero spend)
      if (scenario.input?.amount === undefined || typeof scenario.input.amount !== 'number' || scenario.input.amount <= 0) {
        errors.push({
          scenarioId: sId,
          field: 'input.amount',
          message: `Spend amount must be greater than zero, received: ${scenario.input?.amount}`,
          severity: 'error',
        });
      }

      // 4. Check expected results
      if (!scenario.expected) {
        errors.push({
          scenarioId: sId,
          field: 'expected',
          message: 'Missing expected results section',
          severity: 'error',
        });
      } else {
        if (!scenario.expected.winningCard || typeof scenario.expected.winningCard !== 'string') {
          errors.push({
            scenarioId: sId,
            field: 'expected.winningCard',
            message: 'Missing or empty expected winningCard',
            severity: 'error',
          });
        } else if (
          catalogCardIds.size > 0 &&
          !catalogCardIds.has(scenario.expected.winningCard) &&
          !this.matchesCardName(scenario.expected.winningCard, cardRepo.getCards())
        ) {
          warnings.push({
            scenarioId: sId,
            field: 'expected.winningCard',
            message: `Expected card"${scenario.expected.winningCard}" is not registered in Card Catalog`,
            severity: 'warning',
          });
        }

        if (scenario.expected.expectedSavings === undefined || scenario.expected.expectedSavings < 0) {
          warnings.push({
            scenarioId: sId,
            field: 'expected.expectedSavings',
            message: `Expected savings is negative or undefined: ${scenario.expected?.expectedSavings}`,
            severity: 'warning',
          });
        }

        if (scenario.expected.acceptableAlternatives) {
          for (const alt of scenario.expected.acceptableAlternatives) {
            if (
              catalogCardIds.size > 0 &&
              !catalogCardIds.has(alt) &&
              !this.matchesCardName(alt, cardRepo.getCards())
            ) {
              warnings.push({
                scenarioId: sId,
                field: 'expected.acceptableAlternatives',
                message: `Acceptable alternative card"${alt}" is not in Card Catalog`,
                severity: 'warning',
              });
            }
          }
        }
      }

      // 5. Check userContext ownedCards
      if (!scenario.userContext?.ownedCards || !Array.isArray(scenario.userContext.ownedCards)) {
        warnings.push({
          scenarioId: sId,
          field: 'userContext.ownedCards',
          message: 'Missing or non-array userContext.ownedCards',
          severity: 'warning',
        });
      } else {
        for (const cardId of scenario.userContext.ownedCards) {
          if (
            catalogCardIds.size > 0 &&
            !catalogCardIds.has(cardId) &&
            !this.matchesCardName(cardId, cardRepo.getCards())
          ) {
            warnings.push({
              scenarioId: sId,
              field: 'userContext.ownedCards',
              message: `Owned card"${cardId}" is unknown in Card Catalog`,
              severity: 'warning',
            });
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      totalScenarios: scenarios.length,
      errors,
      warnings,
    };
  }

  private static matchesCardName(cardIdOrName: string, cards: Array<{ id: string; cardName: string }>): boolean {
    const lower = cardIdOrName.toLowerCase();
    return cards.some((c) => c.id.toLowerCase() === lower || c.cardName.toLowerCase() === lower);
  }
}
