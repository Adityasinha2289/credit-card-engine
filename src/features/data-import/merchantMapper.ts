import type { Merchant } from '../merchant-intelligence/types';
import type { SupabaseMerchantRow } from './merchantTypes';

export class MerchantMapper {
  public static toSupabaseRow(merchant: Merchant): SupabaseMerchantRow {
    return {
      id: merchant.id,
      name: merchant.name,
      category: merchant.category,
      logo: merchant.logo,
      website: merchant.website || '',
      online_offline: merchant.onlineOffline || 'online',
      supported_payment_methods: merchant.supportedPaymentMethods || ['credit_card'],
      partner_banks: merchant.partnerBanks || [],
      tags: merchant.tags || [],
    };
  }
}
