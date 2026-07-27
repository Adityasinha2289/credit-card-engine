import type { ImportSummary, ImporterOptions, ValidationResult } from './types';
import { ImportReportGenerator } from './importReport';

export abstract class BaseImporter<TInput, TOutput> {
  protected existingIds = new Set<string>();
  protected importerName: string;

  constructor(importerName: string, initialExistingIds: string[] = []) {
    this.importerName = importerName;
    initialExistingIds.forEach((id) => this.existingIds.add(id));
  }

  protected abstract validate(items: TInput[]): ValidationResult;
  protected abstract mapItem(item: TInput): TOutput;
  protected abstract getItemId(item: TInput): string;

  public async importData(
    items: TInput[],
    options: ImporterOptions = {}
  ): Promise<ImportSummary> {
    const startTime = Date.now();
    const batchSize = options.batchSize || 50;

    // 1. Validation Phase
    const validationResult = this.validate(items);
    if (!validationResult.valid && !options.dryRun) {
      console.warn(`[${this.importerName}] Validation completed with ${validationResult.errors.length} errors.`);
    }

    let inserted = 0;
    let updated = 0;
    let skipped = 0;

    // 2. Batch Processing & Mapping
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);

      for (const item of batch) {
        const id = this.getItemId(item);
        const itemErrors = validationResult.errors.filter((e) => e.cardId === id);

        if (itemErrors.length > 0) {
          skipped++;
          continue;
        }

        // Map item to database row
        this.mapItem(item);

        // Idempotency tracking
        if (this.existingIds.has(id)) {
          updated++;
        } else {
          inserted++;
          this.existingIds.add(id);
        }
      }
    }

    const executionTimeMs = Date.now() - startTime;

    return {
      cardsProcessed: items.length,
      inserted,
      updated,
      skipped,
      validationErrorsCount: validationResult.errors.length,
      errors: validationResult.errors,
      executionTimeMs,
    };
  }

  public async runAndPrintReport(
    items: TInput[],
    options: ImporterOptions = {}
  ): Promise<ImportSummary> {
    const summary = await this.importData(items, options);
    const reportText = ImportReportGenerator.generateReport(summary, this.importerName);
    console.log(reportText);
    return summary;
  }
}
