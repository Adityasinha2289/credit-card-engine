/**
 * Calculator maths for the public tools, from each card's published per-category
 * rates (not a blanket guess by fee tier). Monthly caps are applied per category;
 * a fee waiver applies when yearly spend reaches the issuer's threshold.
 */
import { getRatesFor, type PublicCardEntity } from '../lib/cardKnowledgeGraph';

export type Profile = Record<string, number>;

export const SPEND_ROWS: { id: string; label: string }[] = [
  { id: 'dining', label: 'Dining & delivery' },
  { id: 'travel', label: 'Travel' },
  { id: 'shopping', label: 'Online shopping' },
  { id: 'groceries', label: 'Groceries' },
  { id: 'fuel', label: 'Fuel' },
  { id: 'utilities', label: 'Bills & utilities' },
  { id: 'other', label: 'Everything else' },
];

/** A typical ₹50,000 month, used to pre-fill the calculators. */
export const DEFAULT_PROFILE: Profile = {
  dining: 8000, travel: 6000, shopping: 12000, groceries: 8000, fuel: 4000, utilities: 5000, other: 7000,
};

export interface CategoryValue { id: string; monthly: number; rate: number; capped: boolean; yearly: number }

export interface CardValue {
  /** false when we have no per-category rates for this card */
  known: boolean;
  byCategory: CategoryValue[];
  gross: number;
  fee: number;
  feeWaived: boolean;
  feeWaiverSpend?: number;
  net: number;
  /** blended % back across the profile, before fee */
  blendedRate: number;
}

type RateData = NonNullable<ReturnType<typeof getRatesFor>>;

export function valueFromRates(data: RateData | null, annualFee: number | null, profile: Profile): CardValue {
  const fee = annualFee ?? 0;
  const monthlyTotal = Object.values(profile).reduce((s, v) => s + (v || 0), 0);
  if (!data) {
    return { known: false, byCategory: [], gross: 0, fee, feeWaived: false, net: -fee, blendedRate: 0 };
  }
  const byCategory = SPEND_ROWS.map(({ id }) => {
    const monthly = Math.max(0, profile[id] || 0);
    const rule = data.rates.find((r) => r.category === id);
    const rate = rule?.rate ?? data.baseRate ?? 0;
    const raw = (monthly * rate) / 100;
    const capped = rule?.cap != null && raw > rule.cap;
    return { id, monthly, rate, capped, yearly: (capped ? rule!.cap! : raw) * 12 };
  });
  const gross = byCategory.reduce((s, c) => s + c.yearly, 0);
  const feeWaived = !!data.feeWaiverSpend && monthlyTotal * 12 >= data.feeWaiverSpend;
  return {
    known: true,
    byCategory,
    gross,
    fee,
    feeWaived,
    feeWaiverSpend: data.feeWaiverSpend,
    net: gross - (feeWaived ? 0 : fee),
    blendedRate: monthlyTotal > 0 ? (gross / 12 / monthlyTotal) * 100 : 0,
  };
}

export function cardValue(card: PublicCardEntity, profile: Profile): CardValue {
  return valueFromRates(getRatesFor(card), card.annualFee, profile);
}

/** Uncapped % back across a spend mix, weighting each category by its share. */
export function blendedRate(data: RateData, shares: Profile): number {
  const total = Object.values(shares).reduce((s, v) => s + (v || 0), 0);
  if (total <= 0) return 0;
  return SPEND_ROWS.reduce((s, { id }) => {
    const rate = data.rates.find((r) => r.category === id)?.rate ?? data.baseRate ?? 0;
    return s + ((shares[id] || 0) / total) * rate;
  }, 0);
}

/**
 * Monthly spend (in the given proportions) at which a year of rewards equals the
 * annual fee. Caps are ignored, so treat it as the lowest spend that could work.
 */
export function breakEvenMonthly(card: PublicCardEntity, shares: Profile = DEFAULT_PROFILE): number | null {
  if (!card.annualFee) return 0;
  const data = getRatesFor(card);
  if (!data) return null;
  const rate = blendedRate(data, shares);
  return rate > 0 ? Math.ceil(card.annualFee / 12 / (rate / 100)) : null;
}
