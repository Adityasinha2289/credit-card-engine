import { BaseImporter } from './baseImporter';
import { OfferValidator } from './offerValidator';
import { OfferMapper } from './offerMapper';
import { MerchantRepository } from '../merchant-intelligence/merchantRepository';
import { MOCK_OFFERS } from '../merchant-intelligence/mockMerchants';
import type { MerchantOffer } from '../merchant-intelligence/types';
import type { SupabaseOfferRow } from './offerTypes';
import type { ValidationResult, ImporterOptions, ImportSummary } from './types';

export class OfferImporter extends BaseImporter<MerchantOffer, SupabaseOfferRow> {
  private static instance: OfferImporter;

  constructor() {
    super(
      'Offer Import',
      MerchantRepository.getInstance().getOffers().map((o) => o.id)
    );
  }

  public static getInstance(): OfferImporter {
    if (!OfferImporter.instance) {
      OfferImporter.instance = new OfferImporter();
    }
    return OfferImporter.instance;
  }

  protected validate(items: MerchantOffer[]): ValidationResult {
    return OfferValidator.validateDataset(items);
  }

  protected mapItem(item: MerchantOffer): SupabaseOfferRow {
    return OfferMapper.toSupabaseRow(item);
  }

  protected getItemId(item: MerchantOffer): string {
    return item.id;
  }

  public static async importOffers(
    offersToImport: MerchantOffer[] = MOCK_OFFERS,
    options: ImporterOptions = {}
  ): Promise<ImportSummary> {
    return OfferImporter.getInstance().importData(offersToImport, options);
  }

  public static async runAndPrintReport(options: ImporterOptions = {}): Promise<ImportSummary> {
    return OfferImporter.getInstance().runAndPrintReport(MOCK_OFFERS, options);
  }
}
