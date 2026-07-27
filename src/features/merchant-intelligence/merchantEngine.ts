import { MerchantRepository } from './merchantRepository';
import type { Merchant } from './types';
import type { TransactionCategory } from '../dashboard/types/dashboard.types';

export class MerchantEngine {
  private static repo = MerchantRepository.getInstance();

  public static getAllMerchants(): Merchant[] {
    return this.repo.getMerchants();
  }

  public static getMerchant(id: string): Merchant | undefined {
    return this.repo.getMerchantById(id);
  }

  public static searchMerchants(query: string): Merchant[] {
    const q = query.toLowerCase().trim();
    if (!q) return this.getAllMerchants();
    return this.getAllMerchants().filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.tags.some((t) => t.toLowerCase().includes(q)) ||
        m.category.toLowerCase().includes(q)
    );
  }

  public static getMerchantsByCategory(category: TransactionCategory): Merchant[] {
    return this.getAllMerchants().filter((m) => m.category === category);
  }

  public static getPartnerMerchants(): Merchant[] {
    return this.getAllMerchants().filter((m) => m.partnerBanks.length > 0);
  }
}
