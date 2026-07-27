import type { TransactionCategory } from '../dashboard/types/dashboard.types';
import type { DiscountType } from '../merchant-intelligence/types';
import type { CardNetwork } from '../card-intelligence/types';

export interface SupabaseOfferRow {
  id: string;
  merchant_id: string;
  title: string;
  description: string;
  discount_type: DiscountType;
  discount_value: number;
  eligible_cards: string[];
  eligible_networks: CardNetwork[];
  minimum_spend: number;
  validity: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  stackable: boolean;
  category: TransactionCategory;
}
