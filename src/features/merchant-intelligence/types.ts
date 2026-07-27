import type { TransactionCategory } from '../dashboard/types/dashboard.types';
import type { PaymentMethod } from '../behaviour/types';
import type { CardNetwork } from '../card-intelligence/types';

export const ONLINE_OFFLINE_MODES = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  BOTH: 'both',
} as const;

export type OnlineOfflineMode = typeof ONLINE_OFFLINE_MODES[keyof typeof ONLINE_OFFLINE_MODES];

export const DISCOUNT_TYPES = {
  PERCENTAGE: 'percentage',
  FLAT: 'flat',
  POINTS_MULTIPLIER: 'points_multiplier',
} as const;

export type DiscountType = typeof DISCOUNT_TYPES[keyof typeof DISCOUNT_TYPES];

export interface Merchant {
  id: string;
  name: string;
  category: TransactionCategory;
  logo: string;
  website?: string;
  onlineOffline: OnlineOfflineMode;
  supportedPaymentMethods: PaymentMethod[];
  partnerBanks: string[];
  tags: string[];
}

export interface MerchantOffer {
  id: string;
  merchantId: string;
  title: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  eligibleCards: string[];
  eligibleNetworks: CardNetwork[];
  minimumSpend: number;
  validity: string;
  priority: 'high' | 'medium' | 'low';
  stackable: boolean;
  category: TransactionCategory;
}

export interface PersonalizedOfferResult {
  offer: MerchantOffer;
  merchant: Merchant;
  explanation: string;
  confidence: number;
  estimatedSavings: number;
}

export interface MerchantDataSource {
  getMerchants(): Promise<Merchant[]> | Merchant[];
  getOffers(): Promise<MerchantOffer[]> | MerchantOffer[];
}
