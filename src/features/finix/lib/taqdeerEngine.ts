/**
 * taqdeerEngine.ts
 * Reni's answers. Well-understood questions (which card for a spend, a card
 * or bank, lounges, fees, credit score) are answered instantly on the device
 * from the card data and the user's wallet; everything else goes to the
 * grounded AI (/api/taqdeer).
 *
 * House style for every answer: the answer first, in one bold line; then at
 * most three short points. No emojis, no headings, no greetings or sign-offs,
 * and no figure that isn't in our data.
 */

import { CARD_DATASET, type FinixCard, type SpendCategory } from '../data/cardDataset';
import { detectCategory, POPULAR_MERCHANTS } from '../data/merchantMap';
import type { CardData } from '../../cards/types/card.types';
import type { TransactionEvaluationResult } from './evaluateTransaction';
import { useDashboardStore } from '../../dashboard/store/dashboardStore';
import { evaluatePayment } from '../../financial-engine/rewardsApi';
import { deriveMonthlySpend } from '../../financial-engine/RewardsFacade';
import { displayCardName } from '../../../public-platform/site/CardFace';
import { addedValue, spendProfile } from '../../../pages/app/picks/picks';

export interface TaqdeerMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
  cards?: FinixCard[];
  evaluation?: TransactionEvaluationResult;
}

/** Emoji and pictographs out of a string (AI text included): answers stay plain and professional. */
export function stripEmoji(text: string): string {
  return text
    .replace(/[\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}\u{FE0F}\u{200D}\u{20E3}]/gu, '')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/^[ \t]+(?=\S)/gm, (m) => (m.length >= 2 ? m : ''));
}

function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]/g, '');
}

const CATEGORY_LABELS: Record<SpendCategory, string> = {
  dining: 'dining',
  travel: 'travel',
  groceries: 'groceries',
  shopping: 'shopping',
  fuel: 'fuel',
  entertainment: 'movies and entertainment',
  utilities: 'bills',
  transport: 'transport',
  health: 'health',
  subscriptions: 'subscriptions',
  other: 'general spend',
};

const rupees = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;
const reward = (n: number) => `₹${n.toFixed(n < 10 ? 2 : 0)}`;
const feeText = (fee: number | null) => (fee === null ? 'fee not published' : fee === 0 ? 'lifetime free' : `${rupees(fee)} a year`);
/** How issuers write their own names inside card names ("AMEX" cards say "American Express"). */
const BANK_ALIASES: Record<string, string[]> = { amex: ['american express', 'amex'], sbi: ['sbi'], bob: ['bob', 'bank of baroda'] };
const cardName = (c: FinixCard) => {
  const name = c.name.toLowerCase();
  const bank = c.bank.toLowerCase().split(' ')[0];
  const named = (BANK_ALIASES[bank] ?? [bank]).some((a) => name.includes(a));
  return displayCardName(named ? c.name : `${c.bank} ${c.name}`);
};
/** The data marks unlimited lounge access as 999. */
const visits = (n: number | undefined) => ((n ?? 0) >= 99 ? 'unlimited' : `${n} a year`);

function rateFor(card: FinixCard, category: SpendCategory): number {
  return card.rewards?.find((r) => r.category === category)?.rate ?? card.baseRewardRate ?? 0;
}

/** Best card for a spend; on a tie, the card with a rate made for that spend. */
function bestFor(cards: FinixCard[], category: SpendCategory): FinixCard {
  const own = (c: FinixCard) => Number(c.rewards?.some((r) => r.category === category) ?? false);
  return [...cards].sort((a, b) => rateFor(b, category) - rateFor(a, category) || own(b) - own(a))[0];
}

function topRate(card: FinixCard): { category: SpendCategory; rate: number } | null {
  const best = [...(card.rewards ?? [])].sort((a, b) => b.rate - a.rate)[0];
  return best ? { category: best.category, rate: best.rate } : null;
}

function walletCards(userCards: CardData[]): FinixCard[] {
  return userCards.map((u) => CARD_DATASET.find((c) => c.id === u.id)).filter(Boolean) as FinixCard[];
}

// ─────────────────────────────────────────────────────────────────────────────
//  INTENT REGISTRY
// ─────────────────────────────────────────────────────────────────────────────

export interface IntentHandler {
  name: string;
  test: (lower: string, query: string, userCards: CardData[]) => boolean;
  handler: (query: string, userCards: CardData[], lower: string) => { content: string; cards?: FinixCard[] };
}

const BANK_PATTERNS: [RegExp, string][] = [
  [/\bhdfc\b/, 'hdfc'], [/\bsbi\b/, 'sbi'], [/\bicici\b/, 'icici'], [/\baxis\b/, 'axis'],
  [/\byes bank\b/, 'yes bank'], [/\bindusind\b/, 'indusind'], [/\bcanara\b/, 'canara'], [/\brbl\b/, 'rbl'],
  [/\bkotak\b/, 'kotak'], [/\bau (small finance )?bank\b/, 'au'], [/\b(bob|bank of baroda)\b/, 'bob'], [/\bpnb\b/, 'pnb'],
];

const NAME_NOISE = new Set(['bank', 'credit', 'card', 'the', 'of', 'edition', 'metal']);

/** A card named in the question: "axis atlas", "atlas axis", "Swiggy HDFC". The bank has to be named too. */
function matchCard(lower: string): FinixCard | undefined {
  const q = normalizeText(lower);
  const hits = CARD_DATASET.filter((c) => {
    if (q.includes(normalizeText(c.name))) return true;
    const bankWords = c.bank.toLowerCase().split(/\s+/).filter((w) => !NAME_NOISE.has(w));
    const rest = c.name.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter((w) => w && !NAME_NOISE.has(w) && !bankWords.includes(w));
    const remainder = rest.join('');
    // a real remainder ('' would match anything), and the bank named in the question
    return remainder.length >= 3 && q.includes(remainder) && bankWords.some((w) => w.length >= 2 && new RegExp(`\\b${w}\\b`).test(lower));
  });
  // the most specific name wins ("Infinia Metal" over "Infinia")
  return hits.sort((a, b) => b.name.length - a.name.length)[0];
}

const INTENT_REGISTRY: IntentHandler[] = [
  {
    name: 'greeting',
    // Only when the message IS a greeting / "what can you do" (not "best card for dinner this evening").
    test: (lower) => {
      const words = lower.replace(/[^a-z' ]/g, ' ').trim().split(/\s+/).filter(Boolean);
      if (/^(who are you|what can you do|what do you do|help|help me)\??$/.test(lower.trim())) return true;
      return words.length <= 4 &&
        /^(hi|hello|hey|hii+|greetings|wassup|what'?s up|whats up|sup|yo|howdy|hiya|how are you|good morning|good evening|good afternoon|namaste|namaskar|hey taqdeer|hi taqdeer|hello taqdeer|hey reni|hi reni|hello reni)\b/.test(words.join(' '));
    },
    handler: (_query, userCards) => {
      const n = userCards.length;
      return {
        content: `**I'm Reni. Ask me which card to use, or anything about your cards.**
- ${n > 0 ? `I can see the ${n} ${n === 1 ? 'card' : 'cards'} in your wallet.` : 'Add your cards in Wallet and I can answer for them.'}
- Try a purchase with an amount, like "₹1,200 on Swiggy", or a card's fees, lounges and rates.`,
      };
    },
  },
  {
    name: 'cibil_health',
    test: (lower) => /\b(cibil|credit score|improve score|credit rating|my score|utili[sz]ation|boost score)\b/i.test(lower),
    handler: (_query, userCards) => {
      // only cards whose limit the user has told us count; never report "0% used" on unknown limits
      const withLimits = userCards.filter((c) => c.creditLimit > 0);
      let util = '- Add each card\'s limit in Wallet and I can tell you how much of it you\'re using.';
      if (withLimits.length > 0) {
        const limit = withLimits.reduce((s, c) => s + c.creditLimit, 0) / 100;
        const used = Math.max(0, limit - withLimits.reduce((s, c) => s + c.availableCredit, 0) / 100);
        const pct = limit > 0 ? Math.round((used / limit) * 100) : 0;
        util = `- You're using ${pct}% of your limits (${rupees(used)} of ${rupees(limit)})${pct > 30 ? ', above the 30% bureaus like to see.' : ', within the healthy range.'}`;
      }
      return {
        content: `**Paying on time and keeping utilisation under 30% move your score the most.**
${util}
- Pay before the statement date, so a low balance is what gets reported.
- Keep your oldest card open, and space out new card applications.`,
      };
    },
  },
  {
    name: 'wallet_health',
    test: (lower) => /\b(wallet health|wallet score|wallet status|optimi[sz]e (my )?wallet|my wallet|wallet analysis|portfolio)\b/i.test(lower),
    handler: (_query, userCards) => {
      const wallet = walletCards(userCards);
      if (wallet.length === 0) return { content: '**Your wallet is empty.**\n- Add the cards you own in Wallet and I\'ll show where each one earns most.' };
      const cats: SpendCategory[] = ['dining', 'travel', 'shopping', 'groceries', 'fuel', 'utilities'];
      const rows = cats.map((cat) => {
        const mine = bestFor(wallet, cat);
        const market = bestFor(CARD_DATASET, cat);
        return { cat, mine, mineRate: rateFor(mine, cat), market, marketRate: rateFor(market, cat) };
      });
      const gap = [...rows].sort((a, b) => (b.marketRate - b.mineRate) - (a.marketRate - a.mineRate))[0];
      return {
        content: `**Your best rate for each kind of spend:**
${rows.map((r) => `- ${CATEGORY_LABELS[r.cat][0].toUpperCase()}${CATEGORY_LABELS[r.cat].slice(1)}: ${r.mineRate}% (${cardName(r.mine)})`).join('\n')}

${gap.marketRate > gap.mineRate ? `Biggest gap: ${CATEGORY_LABELS[gap.cat]}, where ${cardName(gap.market)} pays ${gap.marketRate}%. Picks for you shows what it would add a year.` : 'No card in our data beats your wallet by much on any of these.'}`,
        cards: gap.marketRate > gap.mineRate ? [gap.market] : undefined,
      };
    },
  },
  {
    name: 'forex_international',
    test: (lower) => /\b(forex|international|foreign|zero forex|0 forex|fx markup|cross border|abroad|dollar|overseas|currency markup)\b/i.test(lower),
    handler: () => ({
      content: `**Most cards add a forex markup of about 3.5% plus GST (around 4.1%) on foreign-currency spends.**
- We don't hold every card's forex markup yet, so I won't rank cards on it.
- Abroad, choose to pay in the local currency, not rupees, to avoid the terminal's conversion charge.`,
    }),
  },
  {
    name: 'lounge_access',
    test: (lower) => /\b(lounge|lounges|airport lounge|domestic lounge|international lounge|priority pass|dreamfolks)\b/i.test(lower),
    handler: (_query, userCards) => {
      const mine = walletCards(userCards).filter((c) => (c.loungeAccess ?? 0) > 0);
      const top = [...CARD_DATASET].filter((c) => (c.loungeAccess ?? 0) > 0).sort((a, b) => (b.loungeAccess ?? 0) - (a.loungeAccess ?? 0)).slice(0, 2);
      return {
        content: `${mine.length > 0
          ? `**${mine.length === 1 ? 'One' : mine.length} of your cards ${mine.length === 1 ? 'includes' : 'include'} free lounge visits: ${mine.map((c) => `${cardName(c)} (${visits(c.loungeAccess)})`).join(', ')}.**`
          : '**None of your cards includes free lounge visits.**'}
- Most issuers now ask for a minimum spend in the previous quarter to unlock them.
- Most visits in our data: ${top.map((c) => `${cardName(c)} (${visits(c.loungeAccess)}, ${feeText(c.annualFee)})`).join('; ')}.`,
        cards: top,
      };
    },
  },
  {
    name: 'about_platform',
    test: (lower) => /\b(renocred|about taqdeer|what is taqdeer|what is renocred|how do you work|how does taqdeer work)\b/i.test(lower),
    handler: () => ({
      content: `**I answer questions about your cards from each issuer's published terms.**
- Which of your cards to use for a purchase, and what it earns.
- A card's fees, rates and lounge visits, and how it compares with yours.
- Credit-score basics. I'm not a financial adviser.`,
    }),
  },
  {
    name: 'free_cards',
    test: (lower) => /\b(free cards?|annual fees?|joining fee|lifetime free|ltf|fee waiver|no (annual )?fee|zero fee)\b/i.test(lower),
    handler: () => {
      const free = CARD_DATASET.filter((c) => c.annualFee === 0)
        .sort((a, b) => (topRate(b)?.rate ?? b.baseRewardRate ?? 0) - (topRate(a)?.rate ?? a.baseRewardRate ?? 0))
        .slice(0, 3);
      return {
        content: `**Lifetime-free cards with the best rates in our data:**
${free.map((c) => { const t = topRate(c); return `- ${cardName(c)}: ${t ? `${t.rate}% on ${CATEGORY_LABELS[t.category]}` : `${c.baseRewardRate ?? 0}% on everything`}`; }).join('\n')}

A paid card can still win if your spend clears its fee waiver. Ask me about a specific card.`,
        cards: free,
      };
    },
  },
  {
    name: 'rupay_upi',
    test: (lower) => /\b(rupay|upi|gpay|phonepe|paytm upi|scan and pay|qr code|link upi)\b/i.test(lower),
    handler: () => {
      const rupay = CARD_DATASET.filter((c) => c.network === 'RuPay').slice(0, 3);
      return {
        content: `**RuPay credit cards can be linked to UPI and earn rewards on merchant QR payments.**
- Payments to people (not merchants) don't count.
- ${rupay.length ? `RuPay cards in our data: ${rupay.map(cardName).join(', ')}.` : 'Check whether your card is on the RuPay network.'}
- UPI reward rates vary by card; check the issuer's terms.`,
        cards: rupay,
      };
    },
  },
  {
    name: 'minimum_due',
    test: (lower) => /\b(minimum due|interest rate|apr|finance charge|late fee|revolving)\b/i.test(lower),
    handler: () => ({
      content: `**Pay the total due, not the minimum.**
- The unpaid balance is charged about 3 to 4% a month, over 40% a year.
- Once you carry a balance, new purchases lose their interest-free period.
- If cash is short, converting a large purchase to EMI usually costs less than revolving.`,
    }),
  },
  {
    name: 'specific_card',
    test: (lower) => !!matchCard(lower),
    handler: (_query, userCards, lower) => {
      const c = matchCard(lower)!;
      const held = userCards.some((u) => u.id === c.id);
      const t = topRate(c);
      const rates = [...c.rewards].sort((a, b) => b.rate - a.rate).map((r) => `${CATEGORY_LABELS[r.category]} ${r.rate}%`);
      if (c.baseRewardRate != null) rates.push(`everything else ${c.baseRewardRate}%`);
      // "is X worth it / should I get X": answer in rupees on the user's own spend
      if (!held && /\b(worth|should i (get|apply|take)|apply for)\b/.test(lower)) {
        const { profile, assumed } = spendProfile(useDashboardStore.getState().transactions, []);
        const v = addedValue(c, walletCards(userCards), profile);
        const top = v.wins.slice(0, 2).map((w) => `${w.label.toLowerCase()} (${w.rate}% vs your ${w.yourRate}%)`).join(' and ');
        const basis = assumed ? 'a typical' : 'your';
        const lines = [
          top ? `Gains come from ${top}.` : "It doesn't beat your cards on any kind of spend.",
          `Fee: ${feeText(c.annualFee)}${v.feeWaived ? ', waived at this spend' : c.feeWaiverSpend && c.annualFee ? `, waived after ${rupees(c.feeWaiverSpend)} a year` : ''}.`,
          ...(assumed ? ['Based on a typical ₹25,000 month; log your spending for your own numbers.'] : []),
        ];
        return {
          content: `${v.net > 0
            ? `**Yes: on ${basis} spend it would add about ${rupees(v.net)} a year over your cards, after its fee.**`
            : v.net === 0
              ? `**No: on ${basis} spend it wouldn't add anything over your cards.**`
              : `**Probably not: on ${basis} spend it would leave you ${rupees(Math.abs(v.net))} a year worse off than your cards, after its fee.**`}
${lines.map((l) => `- ${l}`).join('\n')}`,
          cards: [c],
        };
      }
      return {
        content: `**${cardName(c)}: ${feeText(c.annualFee)}${t ? `, best at ${CATEGORY_LABELS[t.category]} (${t.rate}%)` : ''}.** ${held ? 'It\'s in your wallet.' : 'You don\'t hold it.'}
- Rates: ${rates.join(', ') || 'not published'}.
- Lounge visits: ${c.loungeAccess ? visits(c.loungeAccess) : 'none'}.${c.feeWaiverSpend && c.annualFee ? `\n- Fee waived after ${rupees(c.feeWaiverSpend)} a year of spend.` : ''}`,
        cards: [c],
      };
    },
  },
  {
    name: 'specific_bank',
    // Whole words only: 'au' used to match "restaurant"/"because", 'yes' any "yes".
    test: (lower) => BANK_PATTERNS.some(([re]) => re.test(lower)),
    handler: (_query, _userCards, lower) => {
      const bankNorm = BANK_PATTERNS.find(([re]) => re.test(lower))![1];
      const cards = CARD_DATASET.filter((c) => c.bank.toLowerCase().includes(bankNorm))
        .sort((a, b) => (topRate(b)?.rate ?? 0) - (topRate(a)?.rate ?? 0))
        .slice(0, 3);
      if (cards.length === 0) return { content: '**I couldn\'t find cards from that bank in our data.**' };
      return {
        content: `**${cards[0].bank} cards in our data, by best rate:**
${cards.map((c) => { const t = topRate(c); return `- ${displayCardName(c.name)}: ${t ? `${t.rate}% on ${CATEGORY_LABELS[t.category]}` : `${c.baseRewardRate ?? 0}% base`}, ${feeText(c.annualFee)}`; }).join('\n')}`,
        cards,
      };
    },
  },
  {
    name: 'offers',
    test: (lower) => /\b(offer|offers|discount|discounts|deal|deals)\b/i.test(lower),
    handler: () => ({
      content: `**Partner offers are in Experiences, by category.**
- For a specific shop, ask me which of your cards earns most there.`,
    }),
  },
];

// ─────────────────────────────────────────────────────────────────────────────
//  ROUTING: instant local answers first, grounded LLM for everything else
// ─────────────────────────────────────────────────────────────────────────────

export type TaqdeerAnswer = { content: string; cards?: FinixCard[]; evaluation?: TransactionEvaluationResult; source?: 'local' | 'ai' };

export interface TaqdeerOptions {
  /** Previous turns (oldest first) for follow-up questions */
  history?: { role: 'user' | 'ai'; content: string }[];
  /** Receives streamed text as it arrives (LLM answers only) */
  onToken?: (textSoFar: string) => void;
  signal?: AbortSignal;
  /** Never call the LLM (signed-out / public demo) */
  localOnly?: boolean;
}

const AI_TIMEOUT_MS = 15_000;

/** "₹4,500", "rs 2k", "1.5 lakh", "for 999" → rupees. null when no amount is mentioned. */
export function parseAmount(query: string): number | null {
  const m = query.toLowerCase().replace(/,/g, '').match(/(?:₹|rs\.?|inr|rupees?)\s*(\d+(?:\.\d+)?)\s*(k|thousand|l|lakh|lac)?\b|(\d+(?:\.\d+)?)\s*(k|thousand|lakh|lac|rupees?|rs)\b/);
  if (!m) return null;
  const num = parseFloat(m[1] ?? m[3]);
  const unit = m[2] ?? m[4] ?? '';
  const mult = /^(k|thousand)$/.test(unit) ? 1_000 : /^(l|lakh|lac)$/.test(unit) ? 100_000 : 1;
  const v = num * mult;
  return v > 0 && v < 1e8 ? v : null;
}

const SPEND_QUESTION = /\b(best card|which card|what card|card (for|to use)|use for|pay (for|with|at)|swipe|spend|spending|cashback on|rewards? on|buy|buying|purchase|order|ordering|book|booking|on swiggy|on amazon|on zomato|on flipkart)\b/i;

/**
 * Deterministic, instant answers. Returns null when the question needs the
 * LLM (open-ended, comparative, "should I…", follow-ups, other languages).
 */
export function answerLocally(query: string, userCards: CardData[] = []): TaqdeerAnswer | null {
  const lower = query.toLowerCase().trim();
  if (!lower) return null;

  const matchedIntent = INTENT_REGISTRY.find((intent) => intent.test(lower, query, userCards));
  if (matchedIntent) return { ...matchedIntent.handler(query, userCards, lower), source: 'local' };

  // Merchant / category spend question → exact wallet evaluation
  const merchant = extractMerchant(lower);
  const category = merchant ? detectCategory(merchant) : detectCategory(lower);
  if ((merchant || category !== 'other') && (SPEND_QUESTION.test(lower) || (merchant && parseAmount(query)))) {
    return { ...spendAnswer(merchant, category, parseAmount(query), userCards), source: 'local' };
  }
  return null;
}

function spendAnswer(merchant: string | null, category: SpendCategory, amount: number | null, userCards: CardData[]): TaqdeerAnswer {
  const label = CATEGORY_LABELS[category] || 'general spend';
  const where = merchant || label;
  // No amount in the question: evaluate per ₹1,000 so the numbers are easy to scale.
  const evalAmount = amount ?? 1000;
  const amountLabel = rupees(evalAmount);

  const transactions = useDashboardStore.getState().transactions;
  const result = evaluatePayment(where, evalAmount, userCards.map((c) => c.id), { previousTransactions: transactions, category });
  const market = getBestCardForCategory(category);
  const marketRate = getCardRewardForCategory(market, category);

  if (!result || !result.best) {
    return {
      content: `**Add your cards in Wallet and I'll tell you which one to use at ${where}.**
- Best rate in our data for ${label}: ${cardName(market)} at ${marketRate}%.`,
      cards: [market],
    };
  }

  const best = result.best;
  const approx = best.confidence !== 'EXACT' ? '~' : '';
  const points = [
    result.secondBest && result.delta > 0 ? `${reward(result.delta)} more than ${displayCardName(result.secondBest.card.name)}.` : null,
    best.rewardRate >= marketRate ? `No card in our data pays more for ${label}.` : `${cardName(market)} pays ${marketRate}% here; you don't hold it.`,
    best.limitations[0] ?? null,
  ].filter(Boolean);

  return {
    content: `**Use ${displayCardName(best.card.name)}: ${approx}${reward(best.cappedRewardValue)} back on ${amountLabel}** (${best.rewardRate}% on ${label}${merchant ? ` at ${merchant}` : ''}).
${points.map((p) => `- ${p}`).join('\n')}`,
    cards: [market],
    evaluation: result,
  };
}

function genericHelp(): TaqdeerAnswer {
  return {
    source: 'local',
    content: `**I can help with your cards and spending.**
- Which of your cards to use, e.g. "₹1,200 on Swiggy".
- A card's fees, rates and lounge visits, or how two cards compare.
- Credit-score and bill-payment basics.`,
  };
}

/** Monthly ₹ spend per category from the last 90 days — sent so the AI can personalise. */
function spendSummary(): Partial<Record<SpendCategory, number>> | undefined {
  try {
    const { transactions } = useDashboardStore.getState();
    if (!transactions.length) return undefined;
    const { spend, assumed } = deriveMonthlySpend({ transactions });
    return assumed ? undefined : spend;
  } catch {
    return undefined;
  }
}

async function getSessionToken(): Promise<string | null> {
  try {
    const clerk = typeof window !== 'undefined' ? (window as any).Clerk : undefined;
    return clerk?.session ? await clerk.session.getToken() : null;
  } catch {
    return null;
  }
}

/** Streams a grounded answer from /api/taqdeer. Resolves to null on any failure. */
async function askAi(query: string, userCards: CardData[], opts: TaqdeerOptions): Promise<TaqdeerAnswer | null> {
  const token = await getSessionToken();
  if (!token) return null; // the LLM needs a session; signed-out users get local answers

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);
  opts.signal?.addEventListener('abort', () => controller.abort());
  try {
    const res = await fetch('/api/taqdeer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        query,
        history: opts.history?.slice(-6),
        walletCardIds: userCards.map((c) => c.id),
        spendSummary: spendSummary(),
      }),
      signal: controller.signal,
    });
    if (!res.ok || !res.body) return null;

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let text = '';
    let cardIds: string[] = [];
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let idx: number;
      while ((idx = buffer.indexOf('\n\n')) >= 0) {
        const raw = buffer.slice(0, idx).replace(/^data:\s*/, '');
        buffer = buffer.slice(idx + 2);
        if (!raw) continue;
        const ev = JSON.parse(raw);
        if (ev.error) return text ? { content: stripEmoji(text), source: 'ai' } : null;
        if (ev.t) {
          text += ev.t;
          opts.onToken?.(stripEmoji(text));
        }
        if (ev.done) cardIds = ev.cards ?? [];
      }
    }
    if (!text) return null;
    const cards = cardIds.map((id) => CARD_DATASET.find((c) => c.id === id)).filter(Boolean) as FinixCard[];
    return { content: stripEmoji(text), cards: cards.slice(0, 3), source: 'ai' };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * 1. Instant local answer for well-understood questions (wallet math, lounges,
 *    fees, CIBIL, a merchant/category spend) — no network, keeps cards/evaluation.
 * 2. Otherwise a grounded, streamed AI answer (signed-in users).
 * 3. If the AI is unavailable, the closest local answer or a short guide.
 */
export async function generateTaqdeerResponse(
  query: string,
  userCards: CardData[] = [],
  opts: TaqdeerOptions = {},
): Promise<TaqdeerAnswer> {
  const isFollowUp = (opts.history?.length ?? 0) > 0 && query.trim().split(/\s+/).length <= 6;
  const local = isFollowUp ? null : answerLocally(query, userCards);
  if (local) return local;

  if (!opts.localOnly) {
    const ai = await askAi(query, userCards, opts);
    if (ai) return ai;
    const fallback = answerLocally(query, userCards);
    if (fallback) return fallback;
    // the AI was needed and couldn't be reached: say so, rather than answer something else
    return {
      source: 'local',
      content: `**I can't answer that one right now.**
- I can still answer instantly: which of your cards to use for a purchase, a card's fees and rates, lounges, and your credit score.`,
    };
  }
  return answerLocally(query, userCards) ?? genericHelp();
}

// Helper to look up best card globally for a category
function getBestCardForCategory(category: SpendCategory): FinixCard {
  let best = CARD_DATASET[0];
  let bestRate = 0;

  for (const card of CARD_DATASET) {
    const catReward = card.rewards?.find((r) => r.category === category);
    const rate = catReward ? catReward.rate : (card.baseRewardRate || 0.5);
    if (rate > bestRate) {
      bestRate = rate;
      best = card;
    }
  }

  return best;
}

function getCardRewardForCategory(card: FinixCard, category: SpendCategory): number {
  const catReward = card.rewards?.find((r) => r.category === category);
  return catReward ? catReward.rate : (card.baseRewardRate || 0.5);
}

function extractMerchant(query: string): string | null {
  const lower = query.toLowerCase();
  for (const m of POPULAR_MERCHANTS) {
    if (lower.includes(m.name.toLowerCase())) return m.name;
  }
  return null;
}

