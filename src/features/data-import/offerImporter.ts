import { BaseImporter } from './baseImporter';
import { OfferValidator } from './offerValidator';
import { OfferMapper } from './offerMapper';
import type { RawOfferDataset, SupabaseOfferRow } from './offerTypes';
import type { ValidationResult, ImporterOptions, ImportSummary } from './types';

export class OfferImporter extends BaseImporter<RawOfferDataset, SupabaseOfferRow> {
  private static instance: OfferImporter;

  constructor() {
    super('Offer Import', []);
  }

  public static getInstance(): OfferImporter {
    if (!OfferImporter.instance) {
      OfferImporter.instance = new OfferImporter();
    }
    return OfferImporter.instance;
  }

  protected validate(items: RawOfferDataset[]): ValidationResult {
    return OfferValidator.validateDataset(items);
  }

  protected mapItem(item: RawOfferDataset): SupabaseOfferRow {
    return OfferMapper.toSupabaseRow(item);
  }

  protected getItemId(item: RawOfferDataset): string {
    return item.identity?.offer_id || 'unknown';
  }

  public static async importOffers(
    offersToImport: RawOfferDataset[],
    options: ImporterOptions = {}
  ): Promise<ImportSummary> {
    return OfferImporter.getInstance().importData(offersToImport, options);
  }

  public static async runAndPrintReport(
    offersToImport: RawOfferDataset[],
    options: ImporterOptions = {}
  ): Promise<ImportSummary> {
    return OfferImporter.getInstance().runAndPrintReport(offersToImport, options);
  }
}

