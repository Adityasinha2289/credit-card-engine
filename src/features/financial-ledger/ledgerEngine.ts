import { LedgerRepository } from './ledgerRepository';
import type { LedgerEntry, LedgerSummary, Achievement } from './types';

export class LedgerEngine {
  private static repo = LedgerRepository.getInstance();

  public static getHistory(): LedgerEntry[] {
    return this.repo.getEntries();
  }

  public static getRecentHistory(limit = 5): LedgerEntry[] {
    return this.getHistory().slice(0, limit);
  }

  public static getSavings(): number {
    return this.getHistory().reduce((sum, entry) => sum + entry.estimatedSavings, 0);
  }

  public static getRewards(): number {
    return this.getHistory().reduce((sum, entry) => sum + entry.estimatedRewards, 0);
  }

  public static getMonthlySummary(): { monthlySavings: number; monthlyRewards: number } {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlyEntries = this.getHistory().filter((entry) => {
      const d = new Date(entry.timestamp);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const monthlySavings = monthlyEntries.reduce((sum, e) => sum + e.estimatedSavings, 0);
    const monthlyRewards = monthlyEntries.reduce((sum, e) => sum + e.estimatedRewards, 0);

    return { monthlySavings, monthlyRewards };
  }

  public static getBestDecision(): LedgerEntry | undefined {
    const entries = this.getHistory();
    if (entries.length === 0) return undefined;
    return entries.reduce(
      (best, cur) => (cur.estimatedSavings > best.estimatedSavings ? cur : best),
      entries[0]
    );
  }

  public static getSummary(): LedgerSummary {
    const history = this.getHistory();
    const totalSavings = this.getSavings();
    const totalRewards = this.getRewards();
    const { monthlySavings, monthlyRewards } = this.getMonthlySummary();
    const best = this.getBestDecision();

    // Find favourite merchant
    const merchantCounts = new Map<string, number>();
    history.forEach((e) => {
      if (e.merchant) {
        merchantCounts.set(e.merchant, (merchantCounts.get(e.merchant) || 0) + 1);
      }
    });

    let favouriteMerchant = 'Swiggy';
    let maxCount = 0;
    merchantCounts.forEach((count, merchant) => {
      if (count > maxCount) {
        maxCount = count;
        favouriteMerchant = merchant;
      }
    });

    return {
      totalSavings,
      totalRewards,
      totalTransactions: history.length,
      monthlySavings,
      monthlyRewards,
      bestDecision: best ? best.explanation : undefined,
      favouriteMerchant,
    };
  }

  public static getAchievements(): Achievement[] {
    return this.repo.getAchievements();
  }

  public static recordAction(entryData: Omit<LedgerEntry, 'id' | 'timestamp'>): LedgerEntry {
    return this.repo.addEntry(entryData);
  }
}

/**
 * React hook wrapper for Financial Ledger
 */
export function useFinancialLedger() {
  const history = LedgerEngine.getHistory();
  const summary = LedgerEngine.getSummary();
  const recentHistory = LedgerEngine.getRecentHistory(3);
  const achievements = LedgerEngine.getAchievements();

  return {
    history,
    summary,
    recentHistory,
    achievements,
    totalSavings: summary.totalSavings,
    totalRewards: summary.totalRewards,
    recordAction: LedgerEngine.recordAction,
  };
}
