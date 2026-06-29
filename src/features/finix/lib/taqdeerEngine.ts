/**
 * Taqdeer AI engine — intent detection + response generation.
 * Ported from Adityasinha2289/credit-card-engine backend/services/taqdeer_engine.py
 * and backend/finix_v1/services/taqdeer_service.py
 *
 * Runs fully client-side — no backend required.
 */

import { CARD_DATASET, type FinixCard, type SpendCategory } from '../data/cardDataset';
import { detectCategory, POPULAR_MERCHANTS } from '../data/merchantMap';

// ─────────────────────────────────────────────────────────────────────────────
//  INTENT PATTERNS
// ─────────────────────────────────────────────────────────────────────────────

const INTENT_PATTERNS: { intent: string; patterns: string[] }[] = [
  {
    intent: 'best_card_for_merchant',
    patterns: [
      'which card', 'best card for', 'what card', 'card for', 'use for', 'pay for',
      'card to use', 'use on', 'which to use',
    ],
  },
  {
    intent: 'wallet_health',
    patterns: [
      'wallet score', 'wallet health', 'wallet status', 'optimize wallet',
      'my wallet', 'wallet analysis',
    ],
  },
  {
    intent: 'cibil_score',
    patterns: [
      'cibil', 'credit score', 'improve score', 'credit rating', 'my score',
    ],
  },
  {
    intent: 'reward_query',
    patterns: [
      'reward', 'cashback', 'points', 'how many points', 'earn',
      'how much cashback', 'benefits',
    ],
  },
  {
    intent: 'recommendation',
    patterns: [
      'recommend', 'suggest', 'which card should', 'new card', 'best card for me',
      'apply for', 'should i get',
    ],
  },
  {
    intent: 'bill_payment',
    patterns: [
      'pay bill', 'bill payment', 'due', 'outstanding', 'payment due',
      'how much to pay', 'minimum payment',
    ],
  },
  {
    intent: 'travel',
    patterns: [
      'flight', 'travel', 'trip', 'lounge', 'airport', 'airline',
      'air india', 'indigo', 'makemytrip', 'irctc',
    ],
  },
  {
    intent: 'dining',
    patterns: [
      'zomato', 'swiggy', 'food', 'dining', 'restaurant', 'eat',
      'blinkit', 'zepto', 'bigbasket',
    ],
  },
  {
    intent: 'shopping',
    patterns: [
      'amazon', 'flipkart', 'myntra', 'shopping', 'buy', 'purchase',
      'online shopping', 'ajio', 'nykaa',
    ],
  },
  {
    intent: 'fuel',
    patterns: [
      'petrol', 'diesel', 'fuel', 'bpcl', 'hpcl', 'pump',
    ],
  },
  {
    intent: 'greet',
    patterns: [
      'hi', 'hello', 'hey', 'what can you do', 'help', 'what are you',
      'who are you', 'taqdeer',
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
//  INTENT DETECTION
// ─────────────────────────────────────────────────────────────────────────────

function detectIntent(query: string): string {
  const lower = query.toLowerCase();

  for (const { intent, patterns } of INTENT_PATTERNS) {
    if (patterns.some((p) => lower.includes(p))) {
      return intent;
    }
  }

  return 'general';
}

function extractMerchant(query: string): string | null {
  const lower = query.toLowerCase();
  for (const m of POPULAR_MERCHANTS) {
    if (lower.includes(m.name.toLowerCase())) return m.name;
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
//  CARD UTILITIES
// ─────────────────────────────────────────────────────────────────────────────

function getBestCardForCategory(category: SpendCategory): FinixCard {
  let best = CARD_DATASET[0];
  let bestRate = 0;

  for (const card of CARD_DATASET) {
    const catReward = card.rewards.find((r) => r.category === category);
    const rate = catReward ? catReward.rate : card.baseRewardRate;
    if (rate > bestRate) {
      bestRate = rate;
      best = card;
    }
  }

  return best;
}

function getCardRewardForCategory(card: FinixCard, category: SpendCategory): number {
  const catReward = card.rewards.find((r) => r.category === category);
  return catReward ? catReward.rate : card.baseRewardRate;
}

// ─────────────────────────────────────────────────────────────────────────────
//  RESPONSE GENERATION
// ─────────────────────────────────────────────────────────────────────────────

export interface TaqdeerMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
  cards?: FinixCard[];
}

const TAQDEER_GREETINGS = [
  'Hey! I\'m Taqdeer, your AI credit card advisor 🤖\n\nI can help you with:\n• Which card to use at any merchant\n• Your wallet health score\n• Card recommendations\n• Reward point calculations\n• CIBIL score tips\n\nWhat would you like to know?',
  'Hello! I\'m Taqdeer, your personal Finix advisor 💳\n\nAsk me anything about your cards — which one to use, how to maximize rewards, or which new card to get!',
];

export function generateTaqdeerResponse(
  query: string,
  _userCards: { name: string; bank: string }[] = [],
): { content: string; cards?: FinixCard[] } {
  const intent = detectIntent(query);
  const merchant = extractMerchant(query);
  const lowerQuery = query.toLowerCase();

  switch (intent) {
    case 'greet':
      return { content: TAQDEER_GREETINGS[Math.floor(Math.random() * TAQDEER_GREETINGS.length)] };

    case 'best_card_for_merchant':
    case 'dining':
    case 'shopping':
    case 'travel':
    case 'fuel': {
      const category = merchant
        ? detectCategory(merchant)
        : intent === 'dining' ? 'dining'
        : intent === 'shopping' ? 'shopping'
        : intent === 'travel' ? 'travel'
        : intent === 'fuel' ? 'fuel'
        : detectCategory(lowerQuery);

      const bestCard = getBestCardForCategory(category);
      const rate = getCardRewardForCategory(bestCard, category);
      const displayCategory = category.charAt(0).toUpperCase() + category.slice(1);
      const merchantStr = merchant || displayCategory;

      const runners = CARD_DATASET
        .filter((c) => c.id !== bestCard.id)
        .sort((a, b) => getCardRewardForCategory(b, category) - getCardRewardForCategory(a, category))
        .slice(0, 2);

      return {
        content: `🏆 **Best card for ${merchantStr}:**\n\n**${bestCard.bank} ${bestCard.name}** — ${rate}% rewards on ${displayCategory}\n\nOther good options:\n${runners.map((c) => `• ${c.bank} ${c.name}: ${getCardRewardForCategory(c, category)}%`).join('\n')}\n\n💡 *Always use the card with the highest reward rate for this category to maximize your points!*`,
        cards: [bestCard, ...runners],
      };
    }

    case 'reward_query': {
      const categoryHint = ['dining', 'shopping', 'travel', 'fuel', 'groceries'].find((c) =>
        lowerQuery.includes(c),
      ) as SpendCategory | undefined;

      if (categoryHint) {
        const top3 = CARD_DATASET
          .sort((a, b) => getCardRewardForCategory(b, categoryHint) - getCardRewardForCategory(a, categoryHint))
          .slice(0, 3);

        return {
          content: `💰 **Best reward rates for ${categoryHint}:**\n\n${top3.map((c, i) => `${i + 1}. **${c.bank} ${c.name}**: ${getCardRewardForCategory(c, categoryHint)}% rewards`).join('\n')}\n\n💡 Tip: Higher base rewards mean more cashback/points on every rupee spent.`,
          cards: top3,
        };
      }

      return {
        content: '💡 **Top reward cards overall:**\n\n1. **HDFC Diners Club Black** — 10% on dining & travel\n2. **Axis Magnus** — 35 EDGE Miles on travel\n3. **IDFC FIRST Classic** — 10% on dining & groceries\n\nTell me a specific category (dining, travel, fuel, etc.) and I\'ll find your best match!',
        cards: CARD_DATASET.filter((c) =>
          ['hdfc-diners-black', 'axis-magnus', 'idfc-first-classic'].includes(c.id),
        ),
      };
    }

    case 'wallet_health':
      return {
        content: '📊 **Your Wallet Health**\n\nBased on your transaction pattern:\n\n• 🟢 **Dining coverage**: Good — use your highest dining rewards card\n• 🟡 **Shopping coverage**: Medium — consider Amazon Pay ICICI for 5% back\n• 🔴 **Fuel coverage**: No dedicated fuel card — you\'re missing surcharge waivers!\n• 🟢 **Travel coverage**: Good — lounge access available\n\n**Wallet Score: 72/100**\n\n💡 *Add a no-annual-fee fuel card like SBI PRIME to improve your score!*',
      };

    case 'cibil_score':
      return {
        content: '📈 **CIBIL Score Tips**\n\nKey factors affecting your score:\n\n1. **Payment History (35%)** — Never miss a due date. Set auto-pay!\n2. **Credit Utilization (30%)** — Keep usage below 30% of your limit\n3. **Credit Mix (15%)** — A mix of credit card + loan is ideal\n4. **Credit Age (15%)** — Don\'t close old cards; they help your history\n5. **New Inquiries (5%)** — Don\'t apply for too many cards at once\n\n💡 *Target score: 750+ for premium card eligibility*',
      };

    case 'recommendation':
      return {
        content: '🎯 **Card Recommendation Engine**\n\nHead to the **Analyze** tab to get personalized card recommendations based on:\n• Your annual income\n• CIBIL score\n• Top spending categories\n• Annual fee preference\n\nI\'ll rank the best cards for your exact profile! 🚀',
      };

    case 'bill_payment':
      return {
        content: '💳 **Bill Payment Tips**\n\n• Always pay at least the minimum due to avoid late fees\n• Paying the full amount avoids 2-4% monthly interest\n• Set up auto-pay for at least the minimum\n• Pay before the due date — not just on it!\n\n💡 Your active card\'s payment details are visible in the dashboard. Use the "Pay Bill" button to record a payment.',
      };

    default:
      return {
        content: `I'm not sure I understood that completely 🤔\n\nYou can ask me things like:\n• "Which card should I use for Zomato?"\n• "What's the best card for travel?"\n• "How can I improve my CIBIL score?"\n• "Which card gives the most cashback on shopping?"\n\nWhat would you like to know?`,
      };
  }
}
