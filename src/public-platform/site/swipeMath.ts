/**
 * Reward maths for the public website's live demos (hero card picker and the
 * "which card should I swipe" simulator). Pure functions over the published
 * card dataset, so the marketing site shows the same numbers the product would,
 * not hand-picked ones.
 */
import { MASTER_CARD_DATASET } from '../../features/finix/data/masterDataset';
import type { FinixCard, SpendCategory } from '../../features/finix/data/cardDataset';

export type { FinixCard, SpendCategory };

export const CATALOG: FinixCard[] = MASTER_CARD_DATASET;

export interface SwipeResult {
  card: FinixCard;
  /** % of spend returned as value */
  rate: number;
  /** ₹ value earned on this spend, after any published monthly cap */
  reward: number;
  capped: boolean;
  /** true when the card has a specific rate for this category (not just its base rate) */
  categoryMatch: boolean;
}

export function rewardFor(card: FinixCard, category: SpendCategory, amount: number): SwipeResult {
  const rule = card.rewards?.find((r) => r.category === category);
  const rate = rule?.rate ?? card.baseRewardRate ?? 0;
  const raw = (amount * rate) / 100;
  const capped = rule?.cap != null && raw > rule.cap;
  return { card, rate, reward: capped ? rule!.cap! : raw, capped, categoryMatch: !!rule };
}

/** Best value first; ties go to the cheaper card, then the more specific rule. */
export function rankCards(cards: FinixCard[], category: SpendCategory, amount: number): SwipeResult[] {
  return cards
    .map((c) => rewardFor(c, category, amount))
    .sort((a, b) =>
      b.reward - a.reward
      || (a.card.annualFee ?? Infinity) - (b.card.annualFee ?? Infinity)
      || Number(b.categoryMatch) - Number(a.categoryMatch));
}

export function cardsByIds(ids: string[], source: FinixCard[] = CATALOG): FinixCard[] {
  const byId = new Map(source.map((c) => [c.id, c]));
  return ids.map((id) => byId.get(id)).filter((c): c is FinixCard => !!c);
}

/** Best card in the whole catalogue for a spend, excluding cards already in the wallet. */
export function bestInCatalog(category: SpendCategory, amount: number, excludeIds: string[] = [], source: FinixCard[] = CATALOG): SwipeResult | null {
  const pool = source.filter((c) => !excludeIds.includes(c.id) && c.annualFee !== null);
  return rankCards(pool, category, amount)[0] ?? null;
}

/** A realistic five-card wallet in which a different card wins each everyday spend. */
export const SAMPLE_WALLET_IDS = ['hdfc_swiggy', 'axis_atlas', 'icici_amazon_pay', 'hdfc_indianoil', 'axis_ace'];

export interface SpendMoment {
  /** Words shown in the hero headline */
  phrase: string;
  /** One-word chip label */
  short: string;
  /** What the receipt line says */
  label: string;
  category: SpendCategory;
  amount: number;
}

export const HERO_MOMENTS: SpendMoment[] = [
  { phrase: 'dinner out.', short: 'Dinner', label: 'Dinner for two', category: 'dining', amount: 2400 },
  { phrase: 'flight home.', short: 'Flight', label: 'Flight, Bengaluru to Delhi', category: 'travel', amount: 9800 },
  { phrase: 'fuel top-up.', short: 'Fuel', label: 'Fuel top-up', category: 'fuel', amount: 3000 },
  { phrase: 'amazon order.', short: 'Amazon', label: 'Amazon order', category: 'shopping', amount: 6000 },
  { phrase: 'electricity bill.', short: 'Power bill', label: 'Electricity bill', category: 'utilities', amount: 2800 },
];

export const SPEND_CATEGORIES: { id: SpendCategory; label: string }[] = [
  { id: 'dining', label: 'Dining' },
  { id: 'travel', label: 'Travel' },
  { id: 'shopping', label: 'Online shopping' },
  { id: 'groceries', label: 'Groceries' },
  { id: 'fuel', label: 'Fuel' },
  { id: 'utilities', label: 'Bills' },
  { id: 'entertainment', label: 'Movies' },
  { id: 'other', label: 'Everything else' },
];

export function slugifyCardName(name: string): string {
  return name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
}

export const CATALOG_STATS = {
  cards: CATALOG.length,
  banks: new Set(CATALOG.map((c) => c.bank)).size,
  lifetimeFree: CATALOG.filter((c) => c.annualFee === 0).length,
};

/** Monthly spend by category, in ₹. */
export type SpendProfile = Partial<Record<SpendCategory, number>>;

/** A year of rewards on a monthly spend profile, minus the annual fee (unknown fee counts as 0). */
export function annualNetValue(card: FinixCard, profile: SpendProfile): { gross: number; net: number } {
  let gross = 0;
  for (const [cat, monthly] of Object.entries(profile) as [SpendCategory, number][]) {
    gross += rewardFor(card, cat, monthly).reward * 12;
  }
  return { gross, net: gross - (card.annualFee ?? 0) };
}

export function topCardsForProfile(profile: SpendProfile, n = 3, source: FinixCard[] = CATALOG) {
  return source
    .filter((c) => c.annualFee !== null)
    .map((card) => ({ card, ...annualNetValue(card, profile) }))
    .sort((a, b) => b.net - a.net)
    .slice(0, n);
}
