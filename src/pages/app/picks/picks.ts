/**
 * Picks for you, computed in the open: for every card you don't hold, how much
 * more a year it would earn than your best current card on each kind of spend,
 * minus its annual fee (waived if your spend clears the issuer's threshold).
 * Same published rates the landing page and the card pages use.
 */
import { CATALOG, rewardFor, SPEND_CATEGORIES, type FinixCard, type SpendCategory } from '../../../public-platform/site/swipeMath';
import { isSpend } from '../../../features/money/lib/moneyMath';
import type { Transaction, TransactionCategory } from '../../../features/dashboard/types/dashboard.types';

/** Monthly spend by category, in rupees. */
export type SpendProfile = Partial<Record<SpendCategory, number>>;

/** A typical ₹25,000 month of card spend, used only when we know nothing about yours. */
const TYPICAL: Record<SpendCategory, number> = {
  dining: 4000, shopping: 5000, groceries: 6000, fuel: 3000, utilities: 4000, travel: 2000, entertainment: 1000, other: 0,
} as Record<SpendCategory, number>;
export const ASSUMED_MONTHLY = Object.values(TYPICAL).reduce((a, b) => a + b, 0);

const FROM_TXN: Partial<Record<TransactionCategory, SpendCategory>> = {
  dining: 'dining', shopping: 'shopping', groceries: 'groceries', fuel: 'fuel', utilities: 'utilities',
  travel: 'travel', transport: 'travel', entertainment: 'entertainment', subscriptions: 'utilities',
};

/**
 * Your monthly spend: the last 90 days of logged spending when there is any,
 * otherwise a typical month tilted toward the spends you said matter.
 */
export function spendProfile(transactions: Transaction[], focus: SpendCategory[], now = new Date()): { profile: SpendProfile; assumed: boolean } {
  const cutoff = now.getTime() - 90 * 86_400_000;
  const totals: SpendProfile = {};
  let any = false;
  for (const t of transactions) {
    if (!isSpend(t) || Date.parse(t.date) < cutoff) continue;
    const cat = FROM_TXN[t.category] ?? 'other';
    totals[cat] = (totals[cat] ?? 0) + Math.abs(t.amount) / 100 / 3;
    any = true;
  }
  if (any) return { profile: totals, assumed: false };

  const weighted = Object.fromEntries(
    (Object.keys(TYPICAL) as SpendCategory[]).map((c) => [c, TYPICAL[c] * (focus.includes(c) ? 3 : 1)]),
  ) as Record<SpendCategory, number>;
  const sum = Object.values(weighted).reduce((a, b) => a + b, 0) || 1;
  const profile = Object.fromEntries(Object.entries(weighted).map(([c, v]) => [c, Math.round((v / sum) * ASSUMED_MONTHLY)])) as SpendProfile;
  return { profile, assumed: true };
}

export interface Pick {
  card: FinixCard;
  /** ₹ a year this card adds over your wallet, after its fee */
  net: number;
  /** ₹ a year it adds before the fee */
  gross: number;
  fee: number;
  feeWaived: boolean;
  /** where the gain comes from, biggest first */
  wins: { category: SpendCategory; label: string; perYear: number; rate: number; yourRate: number }[];
  /** approval criteria we couldn't check (no income or score on file) */
  unchecked: boolean;
  /** what the issuer asks for that you're short of, when we know your numbers */
  needs: { income?: number; cibil?: number } | null;
}

export interface PickOptions {
  walletIds: string[];
  profile: SpendProfile;
  /** annual income in rupees; 0 = unknown */
  income?: number;
  cibil?: number;
  /** ₹ cap on the annual fee; undefined = any, 0 = lifetime free only */
  maxFee?: number;
  lounge?: boolean;
  limit?: number;
  source?: FinixCard[];
}

/** What one card adds to a wallet, a year. */
export function addedValue(card: FinixCard, wallet: FinixCard[], profile: SpendProfile): Omit<Pick, 'unchecked' | 'needs'> {
  const wins: Pick['wins'] = [];
  let gross = 0;
  let yearlySpend = 0;
  for (const [cat, monthly] of Object.entries(profile) as [SpendCategory, number][]) {
    if (!(monthly > 0)) continue;
    yearlySpend += monthly * 12;
    const mine = wallet.map((w) => rewardFor(w, cat, monthly)).sort((a, b) => b.reward - a.reward)[0];
    const theirs = rewardFor(card, cat, monthly);
    const extra = (theirs.reward - (mine?.reward ?? 0)) * 12;
    if (extra > 0) {
      gross += extra;
      wins.push({ category: cat, label: SPEND_CATEGORIES.find((s) => s.id === cat)?.label ?? cat, perYear: Math.round(extra), rate: theirs.rate, yourRate: mine?.rate ?? 0 });
    }
  }
  const listed = card.annualFee ?? 0;
  const feeWaived = listed > 0 && !!card.feeWaiverSpend && yearlySpend >= card.feeWaiverSpend;
  const fee = feeWaived ? 0 : listed;
  return { card, gross: Math.round(gross), net: Math.round(gross - fee), fee, feeWaived, wins: wins.sort((a, b) => b.perYear - a.perYear) };
}

export function picksFor(o: PickOptions): Pick[] {
  const source = o.source ?? CATALOG;
  const held = new Set(o.walletIds);
  const wallet = source.filter((c) => held.has(c.id));
  return source
    .filter((c) => !held.has(c.id) && c.annualFee !== null)
    .filter((c) => o.maxFee === undefined || (o.maxFee === 0 ? c.annualFee === 0 : (c.annualFee ?? 0) <= o.maxFee))
    .filter((c) => !o.lounge || (c.loungeAccess ?? 0) > 0)
    .map((c) => {
      // cards you're short of the issuer's minimums for stay in, marked, after the ones you can get
      const income = o.income && c.minIncome && c.minIncome > o.income ? c.minIncome : undefined;
      const cibil = o.cibil && c.minCibil && c.minCibil > o.cibil ? c.minCibil : undefined;
      return { ...addedValue(c, wallet, o.profile), unchecked: !o.income || !o.cibil, needs: income || cibil ? { income, cibil } : null };
    })
    .filter((p) => p.gross > 0)
    .sort((a, b) => Number(!!a.needs) - Number(!!b.needs) || b.net - a.net || (a.fee - b.fee))
    .slice(0, o.limit ?? 5);
}
