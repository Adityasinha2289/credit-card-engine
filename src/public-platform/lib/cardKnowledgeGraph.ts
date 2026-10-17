import { MOCK_CARDS_INTELLIGENCE } from '../../features/card-intelligence/mockCards';
import { MASTER_CARD_DATASET } from '../../features/finix/data/masterDataset';
import type { CreditCardIntelligence } from '../../features/card-intelligence/types';
import type { FinixCard } from '../../features/finix/data/cardDataset';
import { bankLabel } from '../site/banks';

export interface PublicCardEntity {
  id: string;
  slug: string;
  url: string;
  cardName: string;
  issuer: string;
  network: string;
  annualFee: number | null;
  joiningFee: number | null;
  formattedAnnualFee: string;
  formattedJoiningFee: string;
  rewardType: string;
  rewardRate: string;
  loungeAccess: string;
  forexMarkup: number | null;
  fuelBenefits: string;
  welcomeBenefits: string[];
  milestoneBenefits: string[];
  eligibility: {
    minSalary?: number;
    minCreditScore?: number;
  };
  categories: string[];
  premiumTier: string;
  topBenefit: string;
  isFlagship: boolean;
  /** Per-category reward rates (catalogue cards only; curated cards describe rates in `rewardRate`) */
  rates?: { category: string; rate: number; cap?: number }[];
  baseRate?: number | null;
}

/**
 * Minimum income in the source data is a mix of monthly and annual figures.
 * Nobody qualifies for a card on under ₹2L a year, so anything below that is monthly.
 */
export function monthlyIncome(minSalary?: number): number | undefined {
  if (!minSalary) return undefined;
  return minSalary >= 200000 ? Math.round(minSalary / 12) : minSalary;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function deriveCategories(card: FinixCard): string[] {
  const cats: string[] = [];
  if (card.rewards && card.rewards.length > 0) {
    card.rewards.forEach((r) => {
      if (r.category && !cats.includes(r.category)) {
        cats.push(r.category);
      }
    });
  }
  if (cats.length === 0) cats.push('general');
  return cats;
}

// Transform mock intelligence cards for rich SSR/Public presentation
export const ALL_PUBLIC_CARDS: PublicCardEntity[] = MOCK_CARDS_INTELLIGENCE.map((card: CreditCardIntelligence) => {
  const slug = slugify(card.cardName);
  return {
    id: card.id,
    slug,
    url: `https://renocred.com/cards/${slug}`,
    cardName: card.cardName,
    issuer: card.issuer,
    network: card.network,
    annualFee: card.annualFee,
    joiningFee: card.joiningFee,
    formattedAnnualFee: card.annualFee === null ? 'Not Disclosed' : card.annualFee === 0 ? 'Free Lifetime' : `₹${card.annualFee.toLocaleString('en-IN')}`,
    formattedJoiningFee: card.joiningFee === null ? 'Not Disclosed' : card.joiningFee === 0 ? 'Free' : `₹${card.joiningFee.toLocaleString('en-IN')}`,
    rewardType: card.rewardType,
    rewardRate: card.rewardRate,
    loungeAccess: card.loungeAccess,
    forexMarkup: card.forexMarkup,
    fuelBenefits: card.fuelBenefits,
    welcomeBenefits: card.welcomeBenefits,
    milestoneBenefits: card.milestoneBenefits,
    eligibility: card.eligibility,
    categories: card.categories,
    premiumTier: card.premiumTier,
    topBenefit: card.topBenefit,
    isFlagship: card.premiumTier === 'super_premium' || card.annualFee !== null && card.annualFee >= 5000,
  };
});

// Next normalize Master Dataset cards that pass Data Quality Gate
const seenSlugs = new Set(ALL_PUBLIC_CARDS.map((c) => c.slug));

MASTER_CARD_DATASET.forEach((card) => {
  const slug = slugify(card.name);
  if (!seenSlugs.has(slug) && card.name && card.bank) {
    seenSlugs.add(slug);
    const categories = deriveCategories(card);
    ALL_PUBLIC_CARDS.push({
      id: card.id,
      slug,
      url: `https://renocred.com/cards/${slug}`,
      cardName: card.name,
      issuer: card.bank,
      network: card.network || 'Visa',
      annualFee: card.annualFee,
      // the catalogue does not record joining fees, forex markup or fuel waivers;
      // leave them unknown rather than guess
      joiningFee: null,
      formattedAnnualFee: card.annualFee === null ? 'Not Disclosed' : card.annualFee === 0 ? 'Free Lifetime' : `₹${card.annualFee.toLocaleString('en-IN')}`,
      formattedJoiningFee: 'Not Disclosed',
      rewardType: (card.baseRewardRate ?? 0) >= 1.0 ? 'cashback' : 'points',
      rewardRate: card.baseRewardRate !== null ? `${card.baseRewardRate}% base reward rate on eligible transactions` : 'Reward terms unconfirmed',
      loungeAccess: card.loungeAccess && card.loungeAccess > 0 ? `${card.loungeAccess} Complimentary Lounge visits/year` : 'No complimentary lounge access',
      forexMarkup: null,
      fuelBenefits: (() => {
        const fuel = card.rewards?.find((r) => r.category === 'fuel');
        return fuel ? `${fuel.rate}% value back on fuel` : 'Not disclosed';
      })(),
      welcomeBenefits: card.welcomeBonus ? [card.welcomeBonus] : [],
      milestoneBenefits: card.feeWaiverSpend ? [`Annual fee waived on ₹${(card.feeWaiverSpend / 100000).toFixed(1)} lakh yearly spend`] : [],
      eligibility: {
        minSalary: card.minIncome || undefined,
        minCreditScore: card.minCibil || undefined,
      },
      categories,
      premiumTier: card.annualFee && card.annualFee >= 10000 ? 'super_premium' : card.annualFee && card.annualFee >= 2500 ? 'premium' : card.annualFee === 0 ? 'no_fee' : 'entry',
      topBenefit: card.highlights?.[0] ? card.highlights[0] : `${card.name} by ${card.bank}`,
      isFlagship: false,
      rates: card.rewards?.map((r) => ({ category: r.category, rate: r.rate, cap: r.cap })),
      baseRate: card.baseRewardRate,
    });
  }
});

// Helper Query Functions
export function getAllPublicCards(): PublicCardEntity[] {
  return ALL_PUBLIC_CARDS;
}

export function getFlagshipPublicCards(): PublicCardEntity[] {
  return ALL_PUBLIC_CARDS.filter((c) => c.isFlagship);
}

export function getCardBySlug(slug: string): PublicCardEntity | undefined {
  const normalized = slug.toLowerCase().trim();
  return ALL_PUBLIC_CARDS.find((c) => c.slug === normalized || c.id === normalized);
}

export function getCardsByIssuer(issuer: string): PublicCardEntity[] {
  const normalized = issuer.toLowerCase().trim();
  return ALL_PUBLIC_CARDS.filter((c) => c.issuer.toLowerCase().includes(normalized));
}

export function getCardsByCategory(category: string): PublicCardEntity[] {
  const normalized = category.toLowerCase().trim();
  return ALL_PUBLIC_CARDS.filter((c) => 
    c.categories.some((cat) => cat.toLowerCase() === normalized)
  );
}

// Category Taxonomy
export interface CategoryTaxonomyItem {
  slug: string;
  name: string;
  description: string;
  evaluationMethodology: string;
  limitations: string;
}

export const CATEGORY_TAXONOMY: CategoryTaxonomyItem[] = [
  {
    slug: 'travel',
    name: 'Travel & Flights',
    description: 'Top Indian credit cards offering maximum airmiles, international lounge access, low forex markup, and hotel stay transfer bonuses.',
    evaluationMethodology: 'Evaluated based on EDGE Miles / reward point transfer ratios to airline partners, lounge visit caps (domestic & international), forex markup fees, and flight booking multipliers on portals like SmartBuy and MakeMyTrip.',
    limitations: 'Lounge access on many mid-tier cards now requires meeting minimum quarterly spend thresholds (e.g. ₹35,000/quarter). Forex markup fees apply on international transactions.',
  },
  {
    slug: 'cashback',
    name: 'Cashback & Online Shopping',
    description: 'Best cashback credit cards providing flat, direct statement credits on Amazon, Flipkart, Swiggy, Zomato, and online bill payments.',
    evaluationMethodology: 'Scored by direct percentage cashback return, monthly statement cashback caps, automatic credit mechanics, and exclusions on utility or wallet reloads.',
    limitations: 'Cashback is typically capped at ₹1,500 to ₹5,000 per monthly statement cycle. Certain categories like fuel, jewelry, and wallet loads are excluded.',
  },
  {
    slug: 'dining',
    name: 'Dining & Food Delivery',
    description: 'Credit cards with accelerated reward rates on Swiggy, Zomato, EazyDiner Prime, and fine dining partner restaurants across India.',
    evaluationMethodology: 'Weighted by dining partner discounts (e.g. 10%-25% off), food delivery multipliers, and EazyDiner Prime membership inclusions.',
    limitations: 'Discounts are usually subject to maximum per-bill caps (e.g. ₹500 discount per order).',
  },
  {
    slug: 'fuel',
    name: 'Fuel & Petrol Surcharge Waivers',
    description: 'Co-branded fuel credit cards for IndianOil (IOCL), Bharat Petroleum (BPCL), and HPCL offering surcharge waivers and petrol cashback.',
    evaluationMethodology: 'Evaluated on net percentage value-back at fuel outlets, 1% surcharge waiver mechanics, monthly reward caps, and RuPay UPI compatibility at petrol pumps.',
    limitations: 'Surcharge waivers apply only on transactions between ₹400 and ₹5,000. Surcharge GST is non-refundable.',
  },
  {
    slug: 'shopping',
    name: 'Shopping & E-Commerce',
    description: 'Best credit cards for festive online sales, merchant voucher multipliers (Myntra, Nykaa, Reliance Digital), and instant brand discounts.',
    evaluationMethodology: 'Assessed on partner merchant multipliers (5X-10X rewards), voucher redemption flexibility, and annual fee waiver spend thresholds.',
    limitations: 'Accelerated reward points often require routing purchases through specific bank portals (e.g. HDFC SmartBuy, Axis GrabDeals).',
  },
  {
    slug: 'utilities',
    name: 'Utility Bills & Bill Payments',
    description: 'Cards offering accelerated rewards on electricity, water, broadband, mobile reloads, and Google Pay bill payments.',
    evaluationMethodology: 'Scored on utility cashback percentages, Google Pay / Airtel Thanks integration, and monthly category capping limits.',
    limitations: 'Most banks cap utility cashback at ₹250-₹500 per month to prevent commercial abuse.',
  },
  {
    slug: 'lifetime-free',
    name: 'Lifetime Free Credit Cards',
    description: 'Zero annual fee and zero joining fee credit cards offering solid base rewards without any recurring maintenance costs.',
    evaluationMethodology: 'Filtered strictly by ₹0 annual fee and ₹0 joining fee, assessing unconditional free status vs spending threshold fee waivers.',
    limitations: 'Lifetime free cards may offer lower base reward rates (0.5%-1%) compared to premium paid cards.',
  },
  {
    slug: 'premium',
    name: 'Premium & Luxury Cards',
    description: 'Super-premium credit cards offering concierge services, unlimited lounge access, golf privileges, and high-value reward redemption.',
    evaluationMethodology: 'Scored on net reward yield for high spenders (₹10L+ per year), golf round privileges, priority pass lounge access, and milestone flight vouchers.',
    limitations: 'High annual fees (₹2,500 to ₹12,500+) require high annual spending to achieve fee break-even.',
  },
];

export function getCategoryTaxonomy(slug: string): CategoryTaxonomyItem | undefined {
  const normalized = slug.toLowerCase().trim();
  return CATEGORY_TAXONOMY.find((c) => c.slug === normalized);
}

// 3. Comparison Pair Pair Normalizer & Quality Gate
export interface ComparisonPair {
  cardA: PublicCardEntity;
  cardB: PublicCardEntity;
  pairSlug: string;
  canonicalUrl: string;
  verdict: string;
}

// Generate normalized pair slug (alphabetical ordering guarantees A-vs-B and B-vs-A produce identical URL)
export function getComparisonPairSlug(cardA: PublicCardEntity, cardB: PublicCardEntity): string {
  const sorted = [cardA.slug, cardB.slug].sort();
  return `${sorted[0]}-vs-${sorted[1]}`;
}

// High-Value Comparison Pair List (Quality Gate: Flagship cards with strong search intent overlap)
export const APPROVED_COMPARISON_PAIRS: { cardAId: string; cardBId: string; verdict: string }[] = [
  {
    cardAId: 'card-sbi-cashback',
    cardBId: 'card-hdfc-regalia-gold',
    verdict: 'SBI Cashback is superior for simple 5% online shopping cashback, while HDFC Regalia Gold is superior for flight vouchers, SmartBuy travel rewards, and lounge access.',
  },
  {
    cardAId: 'card-hdfc-infinia',
    cardBId: 'card-axis-atlas',
    verdict: 'HDFC Infinia is India’s benchmark super-premium card for 16.5% SmartBuy travel rewards, while Axis Atlas is the ultimate transfer-partner card for 1:2 airline & hotel point transfers.',
  },
  {
    cardAId: 'card-icici-amazon',
    cardBId: 'card-sbi-cashback',
    verdict: 'Amazon Pay ICICI is lifetime free with uncapped 5% cashback on Amazon, whereas SBI Cashback offers 5% cashback across ALL online merchants (capped at ₹5,000/month).',
  },
  {
    cardAId: 'card-airtel-axis',
    cardBId: 'card-axis-ace',
    verdict: 'Airtel Axis offers massive 25% cashback on Airtel bills and 10% on Swiggy/Zomato, while Axis ACE provides 5% cashback on Google Pay utility bills and 2% offline.',
  },
  {
    cardAId: 'card-swiggy-hdfc',
    cardBId: 'card-sbi-cashback',
    verdict: 'Swiggy HDFC gives an unbeatable 10% cashback on Swiggy food & Instamart, while SBI Cashback gives flat 5% across all general e-commerce platforms.',
  },
  {
    cardAId: 'card-tata-neu-infinity',
    cardBId: 'card-hdfc-regalia-gold',
    verdict: 'Tata Neu Infinity is the ultimate RuPay card for 1.5% UPI rewards and Tata brand perks, while Regalia Gold is a comprehensive travel and milestone rewards card.',
  },
  {
    cardAId: 'card-bpcl-octane-sbi',
    cardBId: 'card-icici-hpcl-super-saver',
    verdict: 'BPCL SBI Octane leads fuel savings with 7.25% value-back at BPCL stations, while ICICI HPCL Super Saver provides 5% fuel savings at HPCL pumps with LPG bill perks.',
  },
];

export function getComparisonPairBySlug(pairSlug: string): ComparisonPair | undefined {
  const parts = pairSlug.toLowerCase().split('-vs-');
  if (parts.length !== 2) return undefined;

  const card1 = getCardBySlug(parts[0]);
  const card2 = getCardBySlug(parts[1]);

  if (!card1 || !card2 || card1.id === card2.id) return undefined;

  // Find pre-approved verdict or build dynamic verdict
  const matched = APPROVED_COMPARISON_PAIRS.find(
    (p) =>
      (p.cardAId === card1.id && p.cardBId === card2.id) ||
      (p.cardAId === card2.id && p.cardBId === card1.id)
  );

  const canonicalSlug = getComparisonPairSlug(card1, card2);

  return {
    cardA: card1,
    cardB: card2,
    pairSlug: canonicalSlug,
    canonicalUrl: `https://renocred.com/compare/${canonicalSlug}`,
    verdict: matched?.verdict || `${card1.cardName} and ${card2.cardName} serve distinct financial profiles based on fee structure, reward multipliers, and travel perks.`,
  };
}

/** Approved comparisons that resolve to real cards, as menu-ready links. */
export function getPopularComparisons(): { slug: string; label: string }[] {
  const byId = new Map(ALL_PUBLIC_CARDS.map((c) => [c.id, c]));
  const short = (name: string) => name.replace(/\s*Credit Card$/i, '').replace(/\s*Bank\b/i, '').trim();
  return APPROVED_COMPARISON_PAIRS.flatMap((p) => {
    const a = byId.get(p.cardAId);
    const b = byId.get(p.cardBId);
    return a && b ? [{ slug: getComparisonPairSlug(a, b), label: `${short(a.cardName)} vs ${short(b.cardName)}` }] : [];
  });
}

const DEDUPE_STOPWORDS = new Set(['credit', 'card', 'bank', 'edition', 'the', 'of', 'hdfc', 'sbi', 'icici', 'axis', 'kotak', 'idfc', 'first', 'yes', 'rbl', 'au', 'hsbc', 'amex', 'american', 'express', 'indusind']);

function nameKey(name: string): Set<string> {
  return new Set(name.toLowerCase().replace(/[^a-z0-9+\s]/g, ' ').split(/\s+/).filter((w) => w && !DEDUPE_STOPWORDS.has(w)));
}

function sameCard(a: Set<string>, b: Set<string>): boolean {
  return [...a].every((w) => b.has(w)) && [...b].every((w) => a.has(w) || w === 'metal');
}

/** The curated entry describing the same card as a catalogue entry, if there is one. */
function curatedEquivalent(c: PublicCardEntity): PublicCardEntity {
  if (c.id.startsWith('card-')) return c;
  const key = nameKey(c.cardName);
  if (key.size === 0) return c;
  const issuer = bankLabel(c.issuer);
  return ALL_PUBLIC_CARDS.find((k) => k.id.startsWith('card-') && bankLabel(k.issuer) === issuer && sameCard(key, nameKey(k.cardName))) ?? c;
}

/**
 * Cards for listings. Curated entries ("HDFC Infinia Metal Edition") and catalogue
 * entries ("HDFC Infinia Metal") can describe the same card; list it once, keeping
 * the curated entry. Detail pages for both slugs keep working.
 */
export function getDirectoryCards(): PublicCardEntity[] {
  return ALL_PUBLIC_CARDS.filter((c) => curatedEquivalent(c) === c);
}

export interface HubEntry {
  card: PublicCardEntity;
  /** The figure the hub is ranked by, as % value back */
  rate: number;
  /** What the rate applies to: "on dining", "top rate" */
  context: string;
}

const HUB_CATEGORY: Record<string, string> = { travel: 'travel', dining: 'dining', fuel: 'fuel', shopping: 'shopping', utilities: 'utilities', cashback: 'shopping' };

/**
 * Cards for a category hub, ranked by the published rate that matters for it
 * (from the catalogue, which has per-category rates), resolved to their public pages.
 */
export function getCardsForHub(slug: string, limit = 12): HubEntry[] {
  const rate = (m: FinixCard, cat: string) => m.rewards?.find((r) => r.category === cat)?.rate ?? 0;
  const best = (m: FinixCard) => Math.max(m.baseRewardRate ?? 0, ...(m.rewards ?? []).map((r) => r.rate));
  const fee = (m: FinixCard) => m.annualFee ?? Infinity;
  const cat = HUB_CATEGORY[slug];

  let ranked: { m: FinixCard; value: number; label: string }[];
  if (slug === 'cashback') {
    ranked = MASTER_CARD_DATASET
      .filter((m) => (m.baseRewardRate ?? 0) >= 1 && rate(m, 'shopping') >= 2)
      .map((m) => ({ m, value: rate(m, 'shopping'), label: 'online' }));
  } else if (cat) {
    ranked = MASTER_CARD_DATASET
      .filter((m) => rate(m, cat) >= 2)
      .map((m) => ({ m, value: rate(m, cat), label: cat === 'utilities' ? 'bills' : cat }));
  } else if (slug === 'lifetime-free') {
    ranked = MASTER_CARD_DATASET.filter((m) => m.annualFee === 0).map((m) => ({ m, value: best(m), label: 'best category' }));
  } else if (slug === 'premium') {
    ranked = MASTER_CARD_DATASET.filter((m) => (m.annualFee ?? 0) >= 5000).map((m) => ({ m, value: best(m), label: 'best category' }));
  } else {
    return [];
  }
  ranked.sort((a, b) => b.value - a.value || fee(a.m) - fee(b.m));

  const seen = new Set<string>();
  const out: HubEntry[] = [];
  for (const r of ranked) {
    const entity = getCardBySlug(slugify(r.m.name));
    if (!entity) continue;
    const card = curatedEquivalent(entity);
    if (seen.has(card.id)) continue;
    seen.add(card.id);
    out.push({ card, rate: r.value, context: r.label === 'best category' ? 'top rate' : `on ${r.label}` });
    if (out.length >= limit) break;
  }
  return out;
}

/**
 * Per-category rates for any public card. Curated entries carry prose only, so
 * fall back to the catalogue card that describes the same product.
 */
export function getRatesFor(card: PublicCardEntity): { rates: { category: string; rate: number; cap?: number }[]; baseRate: number | null; feeWaiverSpend?: number } | null {
  const own = MASTER_CARD_DATASET.find((m) => m.id === card.id);
  if (card.rates) return { rates: card.rates, baseRate: card.baseRate ?? null, feeWaiverSpend: own?.feeWaiverSpend };
  const bySlug = MASTER_CARD_DATASET.find((m) => slugify(m.name) === card.slug);
  const twin = bySlug ?? MASTER_CARD_DATASET.find((m) => {
    const entity = getCardBySlug(slugify(m.name));
    return entity && !entity.id.startsWith('card-') && curatedEquivalent(entity).id === card.id;
  });
  if (!twin) return null;
  return {
    rates: (twin.rewards ?? []).map((r) => ({ category: r.category, rate: r.rate, cap: r.cap })),
    baseRate: twin.baseRewardRate,
    feeWaiverSpend: twin.feeWaiverSpend,
  };
}
