import type { CardNetwork, PremiumTier } from '../card-intelligence/types';

export interface SupabaseCardRow {
  id: string;
  card_name: string;
  issuer: string;
  network: CardNetwork;
  premium_tier: PremiumTier;
  annual_fee: number;
  joining_fee: number;
  fee_waiver_spend: number;
  reward_rate: number;
  top_benefit: string;
  perks: Array<{ title: string; category?: string; rate?: number }>;
  lounge_access: { visitsPerYear: number };
  forex_markup: number;
  minimum_income: number;
  active: boolean;
}

export interface ValidationError {
  cardId: string;
  cardName?: string;
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export interface ImportSummary {
  cardsProcessed: number;
  inserted: number;
  updated: number;
  skipped: number;
  validationErrorsCount: number;
  errors: ValidationError[];
  executionTimeMs: number;
}

export interface ImporterOptions {
  batchSize?: number;
  dryRun?: boolean;
  maxRetries?: number;
}
