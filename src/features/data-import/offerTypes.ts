import type { TransactionCategory } from '../dashboard/types/dashboard.types';
import type { DiscountType } from '../merchant-intelligence/types';
import type { CardNetwork } from '../card-intelligence/types';

export interface SupabaseOfferRow {
  id: string;
  source: string;
  offer_type: string;
  value: number;
  title: string;
  description: string;
  min_spend: number;
  max_discount: number | null;
  valid_from: string;
  valid_until: string;
  status: string;
  eligibility_rules: any;
  internal_campaign_metadata: any;
}

export interface RawOfferIdentity {
  offer_id: string;
  title: string;
  description: string;
  grantor_scope?: string;
}

export interface RawOfferMerchant {
  merchant_id: string;
  merchant_name: string;
  merchant_category: string;
}

export interface RawOfferBenefit {
  benefit_type: string;
  benefit_nature: string;
  discount_percentage?: number | null;
  flat_discount?: number | null;
  cashback?: number | null;
  reward_multiplier?: number | null;
  maximum_benefit?: number | null;
  benefit_text?: string;
}

export interface RawOfferEligibility {
  issuer: string | null;
  card_ids: string[] | null;
  minimum_spend: number | null;
  transaction_type: string | null;
  online_offline: string | null;
  location: string[] | null;
}

export interface RawOfferValidity {
  valid_from: string;
  valid_until: string;
  status: string;
}

export interface RawOfferDataset {
  identity: RawOfferIdentity;
  merchant?: RawOfferMerchant;
  benefit: RawOfferBenefit;
  eligibility: RawOfferEligibility;
  validity: RawOfferValidity;
  source_name?: string;
  quality?: any;
  data_quality?: string;
  lifecycle_status?: string;
  recommendation_confidence?: string;
}

