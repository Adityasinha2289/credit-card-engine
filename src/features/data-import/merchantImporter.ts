import { BaseImporter } from './baseImporter';
import { MerchantValidator } from './merchantValidator';
import { MerchantMapper } from './merchantMapper';
import { MerchantRepository } from '../merchant-intelligence/merchantRepository';
import { MOCK_MERCHANTS } from '../merchant-intelligence/mockMerchants';
import type { Merchant } from '../merchant-intelligence/types';
import type { SupabaseMerchantRow } from './merchantTypes';
import type { ValidationResult, ImporterOptions, ImportSummary } from './types';

export class MerchantImporter extends BaseImporter<Merchant, SupabaseMerchantRow> {
  private static instance: MerchantImporter;

  constructor() {
    super(
      'Merchant Import',
      MerchantRepository.getInstance().getMerchants().map((m) => m.id)
    );
  }

  public static getInstance(): MerchantImporter {
    if (!MerchantImporter.instance) {
      MerchantImporter.instance = new MerchantImporter();
    }
    return MerchantImporter.instance;
  }

  protected validate(items: Merchant[]): ValidationResult {
    return MerchantValidator.validateDataset(items);
  }

  protected mapItem(item: Merchant): SupabaseMerchantRow {
    return MerchantMapper.toSupabaseRow(item);
  }

  protected getItemId(item: Merchant): string {
    return item.id;
  }

  public static async importMerchants(
    merchantsToImport: Merchant[] = MOCK_MERCHANTS,
    options: ImporterOptions = {}
  ): Promise<ImportSummary> {
    return MerchantImporter.getInstance().importData(merchantsToImport, options);
  }

  public static async runAndPrintReport(options: ImporterOptions = {}): Promise<ImportSummary> {
    return MerchantImporter.getInstance().runAndPrintReport(MOCK_MERCHANTS, options);
  }
}
