import type { ImportSummary } from './types';

export class ImportReportGenerator {
  public static generateReport(summary: ImportSummary, title = 'Import'): string {
    const lines = [
      '--------------------------------',
      `${title} Summary`,
      `Items Processed: ${summary.cardsProcessed}`,
      `Inserted: ${summary.inserted}`,
      `Updated: ${summary.updated}`,
      `Skipped: ${summary.skipped}`,
      `Validation Errors: ${summary.validationErrorsCount}`,
      `Execution Time: ${summary.executionTimeMs}ms`,
      '--------------------------------',
    ];

    if (summary.errors.length > 0) {
      lines.push('Validation Errors Detail:');
      summary.errors.forEach((err, idx) => {
        lines.push(`  ${idx + 1}. [${err.cardId}] Field '${err.field}': ${err.message}`);
      });
      lines.push('--------------------------------');
    }

    return lines.join('\n');
  }
}
