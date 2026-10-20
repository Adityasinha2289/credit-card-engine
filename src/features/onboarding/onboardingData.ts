/**
 * What onboarding asks about, and the real answers it shows back while you
 * answer: the card in the catalogue that pays most for each spend, and how the
 * cards you already have compare. Same maths as the website (swipeMath).
 */
import { Fuel, HeartPulse, Plane, ShoppingBag, ShoppingCart, Tv, Utensils, Zap, type LucideIcon } from 'lucide-react';
import { CATALOG, bestInCatalog, cardsByIds, rankCards, type FinixCard, type SpendCategory, type SwipeResult } from '../../public-platform/site/swipeMath';

export const SPEND: { id: SpendCategory; title: string; icon: LucideIcon }[] = [
  { id: 'dining', title: 'Food & dining', icon: Utensils },
  { id: 'groceries', title: 'Groceries', icon: ShoppingCart },
  { id: 'shopping', title: 'Online shopping', icon: ShoppingBag },
  { id: 'travel', title: 'Travel', icon: Plane },
  { id: 'fuel', title: 'Fuel', icon: Fuel },
  { id: 'utilities', title: 'Bills & recharges', icon: Zap },
  { id: 'entertainment', title: 'OTT & movies', icon: Tv },
  { id: 'health', title: 'Health & fitness', icon: HeartPulse },
];

/** A short echo of the goal, said back at the top of the next question. */
export const GOAL_ECHO: Record<string, string> = {
  maximize_rewards: 'Rewards first.',
  save_money: 'Saving first.',
  travel: 'Travel first.',
  build_credit: 'Credit first.',
  cashback: 'Cashback first.',
};

/** Cards most people in India already hold: the list before you search. */
export const POPULAR = [
  'hdfc_millennia', 'sbi_cashback', 'icici_amazon_pay', 'axis_ace', 'hdfc_swiggy', 'axis_flipkart',
  'hdfc_regalia_gold', 'sbi_simplyclick', 'icici_coral', 'axis_atlas', 'amex_mrcc', 'hdfc_indianoil',
];

/** Rates are a share of spend, so any amount gives the same ranking; caps start well above this. */
const PROBE = 1000;

const best = new Map<SpendCategory, SwipeResult | null>();
export function bestFor(category: SpendCategory): SwipeResult | null {
  if (!best.has(category)) best.set(category, bestInCatalog(category, PROBE));
  return best.get(category)!;
}

export function yoursFor(ids: string[], category: SpendCategory): SwipeResult | null {
  const own = cardsByIds(ids);
  return own.length ? rankCards(own, category, PROBE)[0] : null;
}

export const spendTitle = (id: string) => SPEND.find((s) => s.id === id)?.title ?? id;

/** Every word typed has to appear in the card's name or bank. */
export function searchCards(query: string, limit = 8): FinixCard[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return cardsByIds(POPULAR);
  return CATALOG.filter((c) => {
    const hay = `${c.name} ${c.bank}`.toLowerCase();
    return words.every((w) => hay.includes(w));
  }).slice(0, limit);
}
