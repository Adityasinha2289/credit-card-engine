import type { LedgerEntry, Achievement, LedgerDataSource } from './types';
import { MOCK_LEDGER_ENTRIES, MOCK_ACHIEVEMENTS } from './mockLedger';

export class LedgerRepository implements LedgerDataSource {
  private static instance: LedgerRepository;
  private entries: LedgerEntry[] = MOCK_LEDGER_ENTRIES;
  private achievements: Achievement[] = MOCK_ACHIEVEMENTS;

  public static getInstance(): LedgerRepository {
    if (!LedgerRepository.instance) {
      LedgerRepository.instance = new LedgerRepository();
    }
    return LedgerRepository.instance;
  }

  public getEntries(): LedgerEntry[] {
    return this.entries;
  }

  public getAchievements(): Achievement[] {
    return this.achievements;
  }

  public addEntry(entryData: Omit<LedgerEntry, 'id' | 'timestamp'>): LedgerEntry {
    const newEntry: LedgerEntry = {
      ...entryData,
      id: `led-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    this.entries.unshift(newEntry);
    return newEntry;
  }
}
