/**
 * Merchant → Category mapping.
 * Ported from Adityasinha2289/credit-card-engine backend/data/merchant_dataset.json
 * + backend/services/category_engine.py
 */

import type { SpendCategory } from './cardDataset';

/** Map merchant name keywords (lowercase) to spend category */
export const MERCHANT_CATEGORY_MAP: Record<string, SpendCategory> = {
  // Dining & Food
  zomato: 'dining',
  swiggy: 'dining',
  licious: 'dining',
  freshtohome: 'dining',
  eatsure: 'dining',
  faasos: 'dining',
  behrouz: 'dining',
  'baskin robbins': 'dining',
  naturals: 'dining',
  // Quick commerce is grocery spend, not dining (issuers code it as groceries/MCC 5411).
  blinkit: 'groceries',
  instamart: 'groceries',
  'swiggy instamart': 'groceries',
  'zepto cafe': 'dining',
  bigbasket: 'groceries',
  zepto: 'groceries',
  dunzo: 'groceries',
  restaurant: 'dining',
  cafe: 'dining',
  pizza: 'dining',
  dominos: 'dining',
  mcdonalds: 'dining',
  kfc: 'dining',
  starbucks: 'dining',
  subway: 'dining',
  'burger king': 'dining',
  haldirams: 'dining',
  bakery: 'dining',

  // Groceries & Supermarkets
  dmart: 'groceries',
  reliance: 'groceries',
  'more retail': 'groceries',
  grofers: 'groceries',
  spencers: 'groceries',
  supermarket: 'groceries',
  grocery: 'groceries',

  // Shopping & Retail
  croma: 'shopping',
  'reliance digital': 'shopping',
  'vijay sales': 'shopping',
  'tata cliq': 'shopping',
  lenskart: 'shopping',
  firstcry: 'shopping',
  max: 'shopping',
  pantaloons: 'shopping',
  westside: 'shopping',
"d'decor": 'shopping',
  amazon: 'shopping',
  flipkart: 'shopping',
  myntra: 'shopping',
  ajio: 'shopping',
  meesho: 'shopping',
  nykaa: 'shopping',
  snapdeal: 'shopping',
  zara: 'shopping',
  'h&m': 'shopping',
  lifestyle: 'shopping',
  shoppers: 'shopping',
  decathlon: 'shopping',
  ikea: 'shopping',
  apple: 'shopping',

  // Travel
  redbus: 'travel',
  agoda: 'travel',
  expedia: 'travel',
  skyscanner: 'travel',
  'paytm flights': 'travel',
  indigo: 'travel',
  'air india': 'travel',
  vistara: 'travel',
  spicejet: 'travel',
  goair: 'travel',
  makemytrip: 'travel',
  goibibo: 'travel',
  cleartrip: 'travel',
  easemytrip: 'travel',
  irctc: 'travel',
  yatra: 'travel',
  ixigo: 'travel',
  flight: 'travel',
  airline: 'travel',
  airport: 'travel',

  // Hotels
  marriott: 'travel',
  hilton: 'travel',
  hyatt: 'travel',
  taj: 'travel',
  oberoi: 'travel',
  oyo: 'travel',
  hotel: 'travel',
  resort: 'travel',
  airbnb: 'travel',
  booking: 'travel',

  // Transport / Cabs
  'namma yatri': 'transport',
  blusmart: 'transport',
  ola: 'transport',
  uber: 'transport',
  rapido: 'transport',
  meru: 'transport',
  cab: 'transport',
  metro: 'transport',
  bus: 'transport',
  fastag: 'fuel',

  // Fuel
  shell: 'fuel',
  nayara: 'fuel',
  petrol: 'fuel',
  diesel: 'fuel',
  bpcl: 'fuel',
  hpcl: 'fuel',
  iocl: 'fuel',
  'indian oil': 'fuel',
  // 'bharat' alone matched BharatPe / Bharat Matrimony etc.
  'bharat petroleum': 'fuel',
  fuel: 'fuel',
  pump: 'fuel',

  // Entertainment
  jiocinema: 'entertainment',
  'epic games': 'entertainment',
  nintendo: 'entertainment',
  xbox: 'entertainment',
  netflix: 'entertainment',
  amazon_prime: 'entertainment',
  'prime video': 'entertainment',
  hotstar: 'entertainment',
  disney: 'entertainment',
  zee5: 'entertainment',
  sonyliv: 'entertainment',
  bookmyshow: 'entertainment',
  pvr: 'entertainment',
  inox: 'entertainment',
  cinema: 'entertainment',
  movie: 'entertainment',
  gaming: 'entertainment',
  steam: 'entertainment',
  playstation: 'entertainment',

  // Subscriptions
  spotify: 'subscriptions',
  apple_music: 'subscriptions',
  youtube: 'subscriptions',
  gym: 'health',
  fitness: 'health',
  cult: 'health',

  // Health
  apollo: 'health',
  healthcare: 'health',
  medplus: 'health',
  netmeds: 'health',
  pharmeasy: 'health',
  hospital: 'health',
  clinic: 'health',
  doctor: 'health',
  pharmacy: 'health',
  insurance: 'health',
  '1mg': 'health',

  // Utilities & Bills
  paytm: 'utilities',
  phonepe: 'utilities',
  gpay: 'utilities',
  cred: 'utilities',
  'amazon pay': 'utilities',
  electricity: 'utilities',
  water: 'utilities',
  gas: 'utilities',
  broadband: 'utilities',
  recharge: 'utilities',
  dtv: 'utilities',
  'jio fiber': 'utilities',
  airtel: 'utilities',
  vodafone: 'utilities',
  bsnl: 'utilities',
  postpaid: 'utilities',
  prepaid: 'utilities',
  tataplay: 'utilities',
};

/** Keywords sorted longest-first so 'reliance digital' beats 'reliance', 'swiggy instamart' beats 'swiggy'. */
const KEYWORDS_BY_LENGTH = Object.keys(MERCHANT_CATEGORY_MAP).sort((a, b) => b.length - a.length);
const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const KEYWORD_PATTERNS = KEYWORDS_BY_LENGTH.map((k) => [k, new RegExp(`(^|[^a-z0-9])${escapeRe(k)}($|[^a-z0-9])`)] as const);

/**
 * Detect the spend category for a given merchant name.
 * Matches whole words / phrases only (longest first). The old two-way
 * substring match sent "Max Healthcare" to shopping, "Reliance Digital" to
 * groceries and made short inputs like "a" match almost anything.
 * Falls back to 'other' if no match is found.
 */
export function detectCategory(merchantName: string): SpendCategory {
  const lower = (merchantName || '').toLowerCase().trim();
  if (!lower) return 'other';

  // Exact match
  if (MERCHANT_CATEGORY_MAP[lower]) return MERCHANT_CATEGORY_MAP[lower];

  for (const [keyword, re] of KEYWORD_PATTERNS) {
    if (re.test(lower)) return MERCHANT_CATEGORY_MAP[keyword];
  }

  return 'other';
}

/** List of popular merchants for quick-select in UPI Simulator */
export const POPULAR_MERCHANTS: { name: string; category: SpendCategory; emoji: string }[] = [
  { name: 'Zomato',      category: 'dining',         emoji: '🍜' },
  { name: 'Swiggy',      category: 'dining',         emoji: '🍔' },
  { name: 'Amazon',      category: 'shopping',       emoji: '📦' },
  { name: 'Flipkart',    category: 'shopping',       emoji: '🛒' },
  { name: 'Uber',        category: 'transport',      emoji: '🚗' },
  { name: 'Ola',         category: 'transport',      emoji: '🚕' },
  { name: 'Netflix',     category: 'entertainment',  emoji: '🎬' },
  { name: 'Spotify',     category: 'subscriptions',  emoji: '🎵' },
  { name: 'BigBasket',   category: 'groceries',      emoji: '🛍️' },
  { name: 'MakeMyTrip',  category: 'travel',         emoji: '✈️' },
  { name: 'IRCTC',       category: 'travel',         emoji: '🚆' },
  { name: 'Petrol Pump', category: 'fuel',           emoji: '⛽' },
  { name: 'Electricity', category: 'utilities',      emoji: '⚡' },
  { name: 'Apollo',      category: 'health',         emoji: '💊' },
  { name: 'BookMyShow',  category: 'entertainment',  emoji: '🎭' },
];
