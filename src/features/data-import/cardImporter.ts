import { BaseImporter } from './baseImporter';
import { CardValidator } from './cardValidator';
import { CardMapper } from './cardMapper';
import { CardRepository } from '../card-intelligence/cardRepository';
import { MASTER_CARD_DATASET } from '../finix/data/masterDataset';
import type { FinixCard } from '../finix/data/cardDataset';
import type { SupabaseCardRow, ValidationResult, ImporterOptions, ImportSummary } from './types';

export class CardImporter extends BaseImporter<FinixCard, SupabaseCardRow> {
  private static instance: CardImporter;

  constructor() {
    super(
      'Card Import',
      CardRepository.getInstance().getCards().map((c) => c.id)
    );
  }

  public static getInstance(): CardImporter {
    if (!CardImporter.instance) {
      CardImporter.instance = new CardImporter();
    }
    return CardImporter.instance;
  }

  protected validate(items: FinixCard[]): ValidationResult {
    return CardValidator.validateDataset(items);
  }

  protected mapItem(item: FinixCard): SupabaseCardRow {
    return CardMapper.toSupabaseRow(item);
  }

  protected getItemId(item: FinixCard): string {
    return item.id;
  }

  public static async importCards(
    cardsToImport: FinixCard[] = MASTER_CARD_DATASET,
    options: ImporterOptions = {}
  ): Promise<ImportSummary> {
    return CardImporter.getInstance().importData(cardsToImport, options);
  }

  public static async runAndPrintReport(options: ImporterOptions = {}): Promise<ImportSummary> {
    return CardImporter.getInstance().runAndPrintReport(MASTER_CARD_DATASET, options);
  }
}
