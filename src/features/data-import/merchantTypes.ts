import type { TransactionCategory } from '../dashboard/types/dashboard.types';
import type { OnlineOfflineMode } from '../merchant-intelligence/types';
import type { PaymentMethod } from '../behaviour/types';

export interface SupabaseMerchantRow {
  id: string;
  name: string;
  category: TransactionCategory;
  logo: string;
  website?: string;
  online_offline: OnlineOfflineMode;
  supported_payment_methods: PaymentMethod[];
  partner_banks: string[];
  tags: string[];
}
