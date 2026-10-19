/**
 * How well a wallet covers each kind of spend, from the cards' published reward
 * rates: for every category, the best rate among the user's cards compared with
 * the best rate in the whole catalogue. Pure and synchronous; no network.
 */
import { SPEND_CATEGORIES, bestInCatalog, cardsByIds, rewardFor, type FinixCard, type SpendCategory } from '../../public-platform/site/swipeMath';

export interface CategoryCoverage {
  category: SpendCategory;
  label: string;
  /** best rate among the user's cards, % */
  yourRate: number;
  yourCard: FinixCard | null;
  /** best rate in the catalogue, % */
  marketRate: number;
  marketCard: FinixCard | null;
  /** yourRate as a share of marketRate, 0–100 */
  coverage: number;
}

export interface WalletCoverage {
  rows: CategoryCoverage[];
  /** average coverage across categories, 0–100 */
  overall: number;
  /** the category with the most to gain, if any */
  gap: CategoryCoverage | null;
}

// a fixed amount only to compare rates; caps are per-rule, so a small spend avoids them
const PROBE = 1000;

export function walletCoverage(cardIds: string[]): WalletCoverage | null {
  const cards = cardsByIds(cardIds);
  if (cards.length === 0) return null;

  const rows = SPEND_CATEGORIES.filter((c) => c.id !== 'other').map(({ id, label }) => {
    const mine = cards.map((c) => rewardFor(c, id, PROBE)).sort((a, b) => b.rate - a.rate)[0];
    const market = bestInCatalog(id, PROBE);
    const marketRate = Math.max(market?.rate ?? 0, mine.rate);
    return {
      category: id,
      label,
      yourRate: mine.rate,
      yourCard: mine.rate > 0 ? mine.card : null,
      marketRate,
      marketCard: market && market.rate > mine.rate ? market.card : null,
      coverage: marketRate > 0 ? Math.round((mine.rate / marketRate) * 100) : 0,
    };
  });

  const overall = Math.round(rows.reduce((s, r) => s + r.coverage, 0) / rows.length);
  const gap = [...rows]
    .filter((r) => r.marketCard && r.marketRate - r.yourRate >= 1)
    .sort((a, b) => (b.marketRate - b.yourRate) - (a.marketRate - a.yourRate))[0] ?? null;

  return { rows, overall, gap };
}
