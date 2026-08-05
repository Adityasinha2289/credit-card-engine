/**
 * Core interface for a RenoCred Credit Card
 */
export interface CreditCard {
  id: string;
  source_id: string;
  card_title: string;
  overview?: string | null;
  best_suited_for?: string[];
  card_categories?: string[];
  card_tier?: string | null;
  issuer?: string | null;
  network?: string | null;
  annual_fee?: number | null;
  fee_waiver_spend?: number | null;
  minimum_income?: number | null;
  minimum_income_type?: string | null;
  minimum_cibil?: number | null;
  welcome_bonus?: string | null;
  fees?: Record<string, any>;
  rewards?: Array<{
    points: number;
    spend: number;
    point_type: string;
    category: string;
    raw_text: string;
  }>;
  benefits?: Array<{
    category: string;
    description: string;
  }>;
  lounge?: Array<{
    limit: number | null;
    frequency: string | null;
    eligibility: string | null;
    category: string;
    raw_text: string;
  }>;
  data_confidence?: Record<string, string>;
  [key: string]: any;
}

export interface DatasetStatistics {
  total_cards: number;
  total_issuers: number;
  total_networks: number;
  total_categories: number;
  total_reward_types: number;
  total_benefit_types: number;
  average_annual_fee: number;
  fee_distribution: Record<string, number>;
  issuer_distribution: Record<string, number>;
  network_distribution: Record<string, number>;
  category_distribution: Record<string, number>;
  last_generated_timestamp: string;
}

export interface DatasetVersion {
  version: string;
  generated_at: string;
  dataset_name: string;
  record_count: number;
  schema_version: string;
  source: string;
  checksum: string;
}

export interface Merchant {
  name: string;
  category?: string;
}

export interface Issuer {
  name: string;
}

export interface Configuration {
  [key: string]: any;
}

export interface Metadata {
  issuers: string[];
  networks: string[];
  categories: string[];
  merchants: string[];
  reward_types: string[];
  benefit_types: string[];
  fee_types: string[];
}
