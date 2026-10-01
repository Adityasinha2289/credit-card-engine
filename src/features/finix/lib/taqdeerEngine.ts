/**
 * taqdeerEngine.ts
 * Smart client-side credit card reasoning engine.
 * Parses user questions regarding merchants, banks, lounge access, fees,
 * and credit score health, and cross-references with the user's actual wallet.
 */

import { CARD_DATASET, type FinixCard, type SpendCategory } from '../data/cardDataset';
import { detectCategory, POPULAR_MERCHANTS } from '../data/merchantMap';
import type { CardData } from '../../cards/types/card.types';
import { evaluateTransaction, type TransactionEvaluationResult } from './evaluateTransaction';
import { useDashboardStore } from '../../dashboard/store/dashboardStore';

export interface TaqdeerMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
  cards?: FinixCard[];
  evaluation?: TransactionEvaluationResult;
}

// Helper to normalize card names for matching
function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]/g, '');
}

// Map spend category to user-friendly label
const CATEGORY_LABELS: Record<SpendCategory, string> = {
  dining: 'Dining',
  travel: 'Travel',
  groceries: 'Groceries',
  shopping: 'Shopping',
  fuel: 'Fuel',
  entertainment: 'Entertainment',
  utilities: 'Utilities',
  transport: 'Transport',
  health: 'Health',
  subscriptions: 'Subscriptions',
  other: 'General Spend',
};

// Map spend category to emojis
const CATEGORY_EMOJIS: Record<SpendCategory, string> = {
  dining: '🍳',
  travel: '✈️',
  groceries: '🛍️',
  shopping: '🛒',
  fuel: '⛽',
  entertainment: '🎬',
  utilities: '⚡',
  transport: '🚕',
  health: '💊',
  subscriptions: '🎵',
  other: '📌',
};

// ─────────────────────────────────────────────────────────────────────────────
//  INTENT REGISTRY PATTERN
// ─────────────────────────────────────────────────────────────────────────────

export interface IntentHandler {
  name: string;
  test: (lower: string, query: string, userCards: CardData[]) => boolean;
  handler: (
    query: string,
    userCards: CardData[],
    lower: string
  ) => { content: string; cards?: FinixCard[] };
}

const INTENT_REGISTRY: IntentHandler[] = [
  // 1. GREETING & CASUAL CONVERSATION
  {
    name: 'greeting',
    test: (lower) =>
      /\b(hi|hello|hey|greetings|help|who are you|what can you do|taqdeer|wassup|what'?s up|whats up|sup|yo|howdy|hiya|how are you|good morning|good evening|good afternoon|namaste|morning|evening|bot|assistant|dwag|bro|dude|sup bro)\b/i.test(
        lower
      ),
    handler: (_query, userCards, lower) => {
      const isCasual = /\b(wassup|what'?s up|whats up|sup|yo|dwag|bro|dude)\b/i.test(lower);
      const greetingHeader = isCasual
        ? `👋 **Yo! All good here — ready to maximize your rewards!** 🚀`
        : `👋 **Hey! I'm Taqdeer, your Credit Intelligence Assistant!** 🤖`;

      const walletCount = userCards.length;
      const walletStatus =
        walletCount > 0
          ? `I'm connected to your **${walletCount} wallet card${walletCount > 1 ? 's' : ''}**.`
          : `You currently have 0 cards linked in your wallet.`;

      return {
        content: `${greetingHeader}

${walletStatus} I continuously analyze 130+ credit cards across India to help you get the highest cashback, miles, and lounge perks.

**Try asking me:**
• 🍳 *"Which card is best for Swiggy & Zomato?"*
• ✈️ *"Which cards offer free airport lounge access?"*
• 🌐 *"What are the best Zero Forex markup cards for abroad?"*
• 💳 *"What is my wallet health score?"*
• 📱 *"Which RuPay cards give the best cashback on UPI?"*
• 📈 *"How can I improve my CIBIL score quickly?"*

What purchase or strategy can I optimize for you?`,
      };
    },
  },
  // 2. DETECT CIBIL SCORE / CREDIT HEALTH
  {
    name: 'cibil_health',
    test: (lower) => /\b(cibil|credit score|improve score|credit rating|my score|utilization|usage|boost score)\b/i.test(lower),
    handler: (_query, userCards) => {
      let utilizationMsg = "";
      if (userCards.length > 0) {
        const totalLimit = userCards.reduce((sum, c) => sum + c.creditLimit, 0) / 100;
        const totalAvail = userCards.reduce((sum, c) => sum + c.availableCredit, 0) / 100;
        const totalBalance = Math.max(0, totalLimit - totalAvail);
        const utilPct = totalLimit > 0 ? Math.round((totalBalance / totalLimit) * 100) : 0;

        utilizationMsg = `\n\n📊 **Your Real-time Utilization Stats:**
• Total Wallet Limit: **₹${totalLimit.toLocaleString('en-IN')}**
• Total Outstanding: **₹${totalBalance.toLocaleString('en-IN')}**
• Current Utilization: **${utilPct}%** ${utilPct > 30 ? '⚠️ *(High! Keep below 30% to avoid CIBIL drops)*' : '🟢 *(Healthy! Below 30% target)*'}`;
      }

      return {
        content: `📈 **CIBIL Credit Score Optimization Guide**

Your CIBIL score is evaluated based on these key factors:
1. **Payment History (35%)** — Pay card bills on time. Even one late payment can drop your score by 50+ points.
2. **Credit Utilization Ratio (30%)** — The percentage of your credit limit you actually use. Always keep this **under 30%**.
3. **Credit History Age (15%)** — Older credit lines raise your score. Do not close your oldest active card.
4. **Credit Mix (15%)** — A healthy mix of secured (loans) and unsecured (cards) debt.
5. **New Inquiries (5%)** — Multiple credit searches within a short period trigger hard inquiries.${utilizationMsg}

💡 **Pro Tip:** Pay outstanding balances 3-5 days before the statement generation date so that a near-zero balance is reported to Experian/CIBIL!`,
      };
    },
  },
  // 3. WALLET HEALTH ANALYZER
  {
    name: 'wallet_health',
    test: (lower) => /\b(wallet health|wallet score|wallet status|optimize wallet|my wallet|wallet analysis|portfolio)\b/i.test(lower),
    handler: (_query, userCards) => {
      if (userCards.length === 0) {
        return {
          content: `📊 **Your Wallet Health Score: 0/100**

⚠️ **Your wallet is currently empty!**
Please add one or more credit cards on the **Dashboard** home screen to evaluate your spending coverage and reward multipliers.`,
        };
      }

      const categoriesToTest: SpendCategory[] = ['dining', 'travel', 'shopping', 'groceries', 'fuel', 'utilities'];
      const coverageDetails: string[] = [];
      let coveredCount = 0;

      categoriesToTest.forEach((cat) => {
        let maxRate = 0;
        userCards.forEach((uc) => {
          const datasetCard = CARD_DATASET.find((dc) => dc.id === uc.id);
          if (datasetCard) {
            const rate = datasetCard.rewards?.find((r) => r.category === cat)?.rate ?? datasetCard.baseRewardRate;
            if (rate > maxRate) maxRate = rate;
          } else {
            if (1 > maxRate) maxRate = 1;
          }
        });

        const emoji = CATEGORY_EMOJIS[cat];
        const label = CATEGORY_LABELS[cat];
        if (maxRate >= 3) {
          coveredCount += 2;
          coverageDetails.push(`• 🟢 **${label} ${emoji}**: Excellent coverage (Max multiplier: **${maxRate}%**).`);
        } else if (maxRate >= 1.5) {
          coveredCount += 1.2;
          coverageDetails.push(`• 🟡 **${label} ${emoji}**: Average coverage (Max multiplier: **${maxRate}%**). Consider upgrading.`);
        } else {
          coverageDetails.push(`• 🔴 **${label} ${emoji}**: Poor coverage (Max multiplier: **${maxRate}%**). You are missing out on cashback!`);
        }
      });

      const finalScore = Math.min(100, Math.round((coveredCount / 12) * 100));

      const suggestions: string[] = [];
      if (!userCards.some(c => c.id.includes('fuel'))) {
        suggestions.push('• **ICICI HPCL Super Saver** (4% back on Fuel + surcharge waivers)');
      }
      if (!userCards.some(c => c.id.includes('amazon') || c.id.includes('shopping'))) {
        suggestions.push('• **Amazon Pay ICICI** (5% back on shopping for Prime members)');
      }
      if (!userCards.some(c => c.id.includes('black') || c.id.includes('diners') || c.id.includes('infinia'))) {
        suggestions.push('• **HDFC Diners Club Black / Infinia** (Premium dining/travel multiplier up to 10-33%)');
      }

      return {
        content: `📊 **Your Wallet Health Score: ${finalScore}/100**

Here is the breakdown of your reward category coverage:
${coverageDetails.join('\n')}

${suggestions.length > 0 ? `🚀 **How to improve your score:**\nAdd one of these cards to fill the gaps in your rewards coverage:\n${suggestions.join('\n')}` : '🎉 **Outstanding!** Your wallet has excellent reward coverage across all key spending categories!'}`,
      };
    },
  },
  // 4. FOREX & INTERNATIONAL SPEND
  {
    name: 'forex_international',
    test: (lower) => /\b(forex|international|foreign|zero forex|0 forex|fx markup|cross border|abroad|dollar|overseas|currency markup)\b/i.test(lower),
    handler: () => {
      const forexCards = CARD_DATASET.filter((c) => 
        c.highlights.some(h => /forex|international|travel/i.test(h)) || 
        c.name.toLowerCase().includes('atlas') || 
        c.name.toLowerCase().includes('safari')
      ).slice(0, 3);

      return {
        content: `🌐 **Zero Forex & International Travel Cards Guide**

Standard credit cards charge **3.5% + 18% GST** (total ~4.13%) as forex markup fee on foreign currency transactions!

🏆 **Top 0% to Low Forex Cards in India:**
• **Scapia Federal Card**: **0% Forex markup** + unlimited domestic lounge access (on ₹5k monthly spend).
• **Niyo Global / Equitas**: **0% Forex markup** on international POS & online transactions.
• **RBL World Safari**: **0% Forex markup** on all foreign currency spends + travel insurance.
• **Axis Atlas**: 2% reward rate on international flights/hotels, effective forex yield positive.
• **IDFC FIRST WOW**: **0% Forex markup** (FD backed, lifetime free).

💡 **Pro Tip:** Always choose to be billed in the **local currency** (EUR, USD, AED) at POS machines abroad to avoid dynamic currency conversion (DCC) extra charges!`,
        cards: forexCards,
      };
    },
  },
  // 5. AIRPORT LOUNGE ACCESS
  {
    name: 'lounge_access',
    test: (lower) => /\b(lounge|lounges|airport lounge|domestic lounge|international lounge|priority pass|dreamfolks)\b/i.test(lower),
    handler: (_query, userCards) => {
      const userLoungeCards = userCards
        .map((uc) => {
          const dc = CARD_DATASET.find((c) => c.id === uc.id);
          return { label: uc.label || dc?.name, visits: dc?.loungeAccess ?? 0 };
        })
        .filter((c) => c.visits > 0);

      const topLoungeCards = CARD_DATASET.filter((c) => (c.loungeAccess ?? 0) >= 8)
        .sort((a, b) => (b.loungeAccess ?? 0) - (a.loungeAccess ?? 0))
        .slice(0, 3);

      let userCardsMsg = "";
      if (userLoungeCards.length > 0) {
        userCardsMsg = `💳 **Lounge access in your wallet:**\n${userLoungeCards.map((c) => `• **${c.label}**: ${c.visits} complimentary visits/year`).join('\n')}\n\n`;
      } else {
        userCardsMsg = `💳 **Lounge access in your wallet:**\n• ❌ None of your active cards offer complimentary airport lounge access.\n\n`;
      }

      return {
        content: `✈️ **Airport Lounge Access Analysis**

${userCardsMsg}🏆 **Top cards in the market for lounge access:**
${topLoungeCards.map((c) => `• **${c.bank} ${c.name}**: ${c.loungeAccess} visits/year (Annual Fee: ₹${c.annualFee})`).join('\n')}

💡 *Note: Most Indian banks now require a minimum spend of ₹10,000 to ₹35,000 in the previous calendar quarter to unlock complimentary lounge access visits.*`,
        cards: topLoungeCards,
      };
    },
  },
  // 6. POP CULTURE & CELEBRITIES (e.g. Shah Rukh Khan, actors, movies)
  {
    name: 'celebrity_popculture',
    test: (lower) => /\b(shahrukh|shah rukh|srk|salman|aamir|actor|bollywood|celebrity|virat|kohli|dhoni)\b/i.test(lower),
    handler: (_query, _userCards, lower) => {
      const isSRK = /\b(shahrukh|shah rukh|srk)\b/i.test(lower);
      const title = isSRK ? `👑 **Shah Rukh Khan (SRK) — King Khan of Bollywood!** 🎬` : `⭐ **Bollywood & Pop Culture Spotlight** 🎬`;
      
      return {
        content: `${title}

${isSRK ? `Shah Rukh Khan is one of the world's biggest movie icons and the King of Romance!` : `A legendary icon in Indian entertainment!`}

🎟️ **Planning to watch their next blockbuster on the big screen?**
Here are the top credit cards to get **Buy 1 Get 1 Free (B1G1)** tickets on BookMyShow & PVR:
• **Axis Neo / My Zone**: **Buy 1 Get 1 Free** on BookMyShow & Paytm Movies.
• **RBL BookMyShow Play**: ₹500 off on movie bookings every month.
• **ICICI Sapphiro / Rubyx**: **Buy 1 Get 1 Free** (up to 2 free tickets per month).
• **Kotak PVR INOX**: Free PVR movie tickets on reaching spend milestones.

💡 *Ask me: "Which cards offer Buy 1 Get 1 free on movie tickets?"*`,
      };
    },
  },
  // 7. MOVIE & ENTERTAINMENT
  {
    name: 'movie_entertainment',
    test: (lower) => /\b(movie|movies|cinema|theatre|theater|pvr|inox|bookmyshow|bms|cinepolis)\b/i.test(lower),
    handler: () => ({
      content: `🎬 **Best Credit Cards for Movie Tickets (BookMyShow, PVR & INOX)**

Never pay full price for movie tickets! Here are the best cards for cinema savings:

🏆 **Top Movie & Entertainment Cards:**
• **RBL Play Credit Card**: Free ₹500 discount every month on BookMyShow (on spending ₹5,000/month).
• **Axis My Zone Credit Card**: **Buy 1 Get 1 Free** on Paytm Movies (up to ₹200 discount, 100% discount on 2nd ticket).
• **ICICI Sapphiro Credit Card**: **Buy 1 Get 1 Free** on BookMyShow (up to ₹500 off on the second ticket, twice a month).
• **Kotak PVR INOX Card**: Earn 1-2 free PVR tickets every month on monthly spend milestones.
• **IndusInd Legend**: **Buy 1 Get 1 Free** on BookMyShow (up to 3 free tickets per month).

💡 **Pro Tip:** Daily quotas for bank movie discounts reset at midnight or 10 AM. Book your weekend tickets early to claim the quota!`,
    }),
  },
  // 8. JOKES & HUMOR
  {
    name: 'jokes_fun',
    test: (lower) => /\b(joke|jokes|make me laugh|funny|humor|tell me a joke)\b/i.test(lower),
    handler: () => ({
      content: `😄 **Here's a financial joke for you:**

*Why did the credit card go to therapy?*
Because it had too much emotional baggage and couldn't stop *revolving* its balance at 42% APR! 💳😂

*Pro Tip:* Don't let your credit balance revolve! Always pay the **Total Amount Due** to keep your interest rate at 0% and your CIBIL score high.

What credit perk or purchase can I calculate for you today?`,
    }),
  },
  // 9. ABOUT RENOCRED & TAQDEER
  {
    name: 'about_platform',
    test: (lower) => /\b(renocred|about taqdeer|what is taqdeer|what is renocred|how do you work|how does taqdeer work)\b/i.test(lower),
    handler: () => ({
      content: `⚡ **About RenoCred & Taqdeer AI**

**RenoCred** is India's premier credit card intelligence platform.
**Taqdeer** is our smart AI decision engine designed to:
• 🧠 **Maximize Cashback:** Instantly calculates exact reward points and merchant MCC rates across 130+ cards.
• 💳 **Wallet Personalization:** Compares your connected cards against live bank rules.
• ✈️ **Perks & Privileges:** Tracks airport lounge access, milestone bonuses, and fee waivers.

Try asking:
• *"Which card should I use for Amazon or Swiggy?"*
• *"What are the best lifetime free cards?"*
• *"Analyze my wallet health"*`,
    }),
  },
  // 10. LIFETIME FREE CARDS / ANNUAL FEES
  {
    name: 'free_cards',
    test: (lower) => /\b(free|annual fee|charges|lifetime free|ltf|waiver|no fee|zero fee)\b/i.test(lower),
    handler: () => {
      const freeCards = CARD_DATASET.filter((c) => c.annualFee === 0).slice(0, 4);

      return {
        content: `💰 **Lifetime Free (LTF) & Fee Waiver Recommendations**

Avoid annual maintenance charges! Here are the top **Lifetime Free** credit cards (No annual fees ever):
${freeCards.map((c) => `• **${c.bank} ${c.name}**: Base reward rate ${c.baseRewardRate}% (Highlights: ${c.highlights.slice(0, 2).join(', ')})`).join('\n')}

💡 **How Fee Waivers Work:**
Most premium credit cards waive the annual fee if you cross a specific spend milestone. For example:
• **Axis Atlas**: Annual fee ₹5,000 waived on spending ₹3 Lakhs/year.
• **Indian Bank Select**: Annual fee ₹500 waived on spending ₹50,000/year.`,
        cards: freeCards,
      };
    },
  },
  // 6. FOREX & INTERNATIONAL SPEND
  {
    name: 'forex_international',
    test: (lower) => /\b(forex|international|foreign|zero forex|fx markup|cross border|abroad|dollar|overseas)\b/i.test(lower),
    handler: () => {
      const forexCards = CARD_DATASET.filter((c) => 
        c.highlights.some(h => /forex|international|travel/i.test(h)) || 
        c.name.toLowerCase().includes('atlas') || 
        c.name.toLowerCase().includes('safari')
      ).slice(0, 3);

      return {
        content: `🌐 **Zero Forex & International Travel Cards Guide**

Standard credit cards charge **3.5% + 18% GST** (total ~4.13%) as forex markup fee on international transactions!

🏆 **Top 0% to Low Forex Cards in India:**
• **Scapia Federal Card**: **0% Forex markup** + unlimited domestic lounge access (on ₹5k monthly spend).
• **Niyo Global / Equitas**: **0% Forex markup** on international POS & online transactions.
• **RBL World Safari**: **0% Forex markup** on all foreign currency spends + travel insurance.
• **Axis Atlas**: 2% reward rate on international flights/hotels, effective forex yield positive.
• **IDFC FIRST WOW**: **0% Forex markup** (FD backed, lifetime free).

💡 **Pro Tip:** Always choose to be billed in the **local currency** (EUR, USD, AED) at POS machines abroad to avoid dynamic currency conversion (DCC) extra charges!`,
        cards: forexCards,
      };
    },
  },
  // 7. RUPAY CREDIT CARDS ON UPI
  {
    name: 'rupay_upi',
    test: (lower) => /\b(rupay|upi|gpay|phonepe|paytm upi|scan and pay|qr code|link upi)\b/i.test(lower),
    handler: () => {
      const rupayCards = CARD_DATASET.filter((c) => 
        c.name.toLowerCase().includes('rupay') || 
        c.name.toLowerCase().includes('neu') || 
        c.highlights.some(h => /upi|rupay/i.test(h))
      ).slice(0, 3);

      return {
        content: `📱 **RuPay Credit Cards on UPI Guide**

You can link RuPay Credit Cards to Google Pay, PhonePe, Paytm, and BHIM to earn reward points directly on QR code merchant payments!

🏆 **Top RuPay Cards for UPI Spending:**
• **Tata Neu Infinity HDFC RuPay**: **1.5% NeuCoins on UPI payments** (up to 5% on Tata Neu ecosystem).
• **Tata Neu Plus HDFC RuPay**: **1.0% NeuCoins on UPI payments**.
• **Jupiter CSB Edge RuPay**: **2% cashback on UPI** across select categories.
• **ICICI Coral RuPay**: Base rewards on UPI transactions + complimentary lounge access.

💡 **Pro Tip:** UPI credit card payments are only valid on **Merchant QR codes (P2M)**, not peer-to-peer (P2P) transfers to personal phone numbers!`,
        cards: rupayCards,
      };
    },
  },
  // 8. MINIMUM DUE & APR INTEREST WARNING
  {
    name: 'minimum_due',
    test: (lower) => /\b(minimum due|interest rate|apr|finance charge|debt|late fee|revolving credit)\b/i.test(lower),
    handler: () => ({
      content: `⚠️ **The Minimum Due Trap & APR Explanation**

Paying only the **"Minimum Amount Due"** is one of the costliest financial mistakes:

1. **42% to 48% APR Interest:** Banks charge 3.5% to 4.0% interest **per month** (compounded daily) on the entire unpaid balance.
2. **Loss of 50-Day Interest-Free Period:** Once you revolve a balance, ALL new purchases start accumulating interest from day one!
3. **CIBIL Score Drop:** High outstanding utilization signals credit distress to CIBIL and Experian.

💡 **Smart Solution:** Always set up **Auto-Debit for Total Amount Due (TAD)**. If facing temporary cash flow crunch, convert big purchases into a fixed low-interest EMI instead of revolving!`,
    }),
  },
  // 9. CHECK FOR SPECIFIC CARD/BANK IN QUERY
  {
    name: 'specific_card',
    test: (lower) => {
      const queryNormalized = normalizeText(lower);
      return CARD_DATASET.some((c) => {
        const cardNormalized = normalizeText(c.name);
        const bankNormalized = normalizeText(c.bank);
        return queryNormalized.includes(cardNormalized) || 
          (queryNormalized.includes(bankNormalized) && queryNormalized.includes(normalizeText(c.name.replace(c.bank, ''))));
      });
    },
    handler: (_query, userCards, lower) => {
      const queryNormalized = normalizeText(lower);
      const foundCard = CARD_DATASET.find((c) => {
        const cardNormalized = normalizeText(c.name);
        const bankNormalized = normalizeText(c.bank);
        return queryNormalized.includes(cardNormalized) || 
          (queryNormalized.includes(bankNormalized) && queryNormalized.includes(normalizeText(c.name.replace(c.bank, ''))));
      })!;

      const userHasIt = userCards.some((uc) => uc.id === foundCard.id);
      return {
        content: `🃏 **Card Analysis: ${foundCard.bank} ${foundCard.name}**
${userHasIt ? '🟢 *You have this card linked in your wallet!*' : '⚪ *This card is not in your wallet.*'}

• **Annual Fee**: ${foundCard.annualFee === 0 ? 'Lifetime Free' : `₹${foundCard.annualFee}`}
• **Lounge Access**: ${foundCard.loungeAccess ? `${foundCard.loungeAccess} visits/year` : 'Not available'}
• **Base Reward Rate**: ${foundCard.baseRewardRate}%
• **Welcome Bonus**: ${foundCard.welcomeBonus || 'None'}
• **Highlights**: ${foundCard.highlights.join(', ')}

📊 **Rewards Rates**:
${foundCard.rewards.map((r) => `• ${CATEGORY_EMOJIS[r.category] || '📌'} ${CATEGORY_LABELS[r.category]}: **${r.rate}%**`).join('\n')}

${userHasIt ? '' : `💡 *Cross-reference this card with your profile in the **Analyzer** tab to see if you are eligible!*`}`,
        cards: [foundCard],
      };
    },
  },
  // 10. CHECK FOR BANK NAME ALONE
  {
    name: 'specific_bank',
    test: (lower) => {
      const banks = ['hdfc', 'sbi', 'icici', 'axis', 'yes bank', 'yes', 'indusind', 'canara', 'rbl', 'kotak', 'au', 'bob', 'pnb'];
      return banks.some((b) => lower.includes(b));
    },
    handler: (_query, _userCards, lower) => {
      const banks = ['hdfc', 'sbi', 'icici', 'axis', 'yes bank', 'yes', 'indusind', 'canara', 'rbl', 'kotak', 'au', 'bob', 'pnb'];
      const matchedBank = banks.find((b) => lower.includes(b))!;
      const bankNorm = matchedBank === 'yes' ? 'yes bank' : matchedBank;
      const bankCards = CARD_DATASET.filter((c) => c.bank.toLowerCase().includes(bankNorm)).slice(0, 3);
      if (bankCards.length > 0) {
        return {
          content: `🏦 **Top credit cards offered by ${bankCards[0].bank}:**

${bankCards.map((c, i) => `${i + 1}. **${c.name}** (Fee: ₹${c.annualFee})
   • Base rate: ${c.baseRewardRate}% | Lounge: ${c.loungeAccess ? `${c.loungeAccess}/yr` : 'No'}
   • Benefits: ${c.highlights.slice(0, 2).join(', ')}`).join('\n\n')}

💡 *Compare these cards inside the **Analyzer** tab to view personalized reward scores based on your credit eligibility.*`,
          cards: bankCards,
        };
      }
      return { content: `I couldn't find any cards for that bank.` };
    },
  },
  // 11. OFFERS & DEALS
  {
    name: 'offers',
    test: (lower) => /\b(offer|offers|discount|discounts|deal|deals)\b/i.test(lower),
    handler: () => ({
      content: `🎁 **Credit Card Offers & Deals**

I noticed you are looking for current offers!

To see the most accurate and personalized offers for your cards, please visit the **Offers** tab in the main navigation. It cross-references your exact wallet with our live merchant database to show you exactly where you can save money today!`,
    }),
  },
];

// Helper to get and validate the AI Backend URL
const getAiBackendUrl = (): string | null => {
  const envUrl = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_AI_API_URL : undefined;
  
  if (envUrl) {
    try {
      new URL(envUrl); // Validates URL format
      return envUrl;
    } catch (e) {
      console.error(`Invalid VITE_AI_API_URL provided: ${envUrl}`);
      return null;
    }
  }

  // Fallbacks
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV) {
    return "http://localhost:8000/chat"; // Sensible development fallback
  }

  return null;
};

export async function generateTaqdeerResponse(
  query: string,
  userCards: CardData[] = [],
): Promise<{ content: string; cards?: FinixCard[]; evaluation?: TransactionEvaluationResult }> {
  const lower = query.toLowerCase().trim();
  const apiUrl = getAiBackendUrl();

  try {
    let token: string | null = null;
    if (typeof window !== 'undefined' && (window as any).Clerk && (window as any).Clerk.session) {
      token = await (window as any).Clerk.session.getToken();
    }
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch('/api/taqdeer', {
      method: 'POST',
      headers,
      body: JSON.stringify({ query, userCards })
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.content) {
        return { content: data.content };
      }
    }
  } catch (err: any) {
    // Gracefully proceed to offline engine
  }
  if (apiUrl) {
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, userCards })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.intent !== "unknown" && data.content) {
          return { content: data.content };
        }
      }
    } catch (error) {
      // ignore
    }
  }

  // Match query against intent registry
  const matchedIntent = INTENT_REGISTRY.find((intent) => intent.test(lower, query, userCards));

  if (matchedIntent) {
    return matchedIntent.handler(query, userCards, lower);
  }

  // 8. SPECIFIC MERCHANT OR GENERAL SPEND OPTIMIZATION (FALLBACK)
  const merchant = extractMerchant(lower);
  const category = merchant
    ? detectCategory(merchant)
    : detectCategory(lower);

  // If no merchant was detected AND the query doesn't sound like a card query,
  // provide a clean, helpful guide without ugly technical error messages.
  if (!merchant && !/\b(card|cards|spend|reward|rewards|cashback|buy|pay|offer|offers|discount|discounts|deal|deals|wallet|best|shopping|dining|hotel|flight|travel|bill)\b/i.test(lower)) {
    return {
      content: `👋 **Taqdeer Intelligence Assistant**

I specialize in Indian credit cards, reward optimizations, and smart spending strategies.

**Try asking me:**
• 🍳 *"Which card is best for Swiggy or Zomato?"*
• 🛒 *"Best card for Amazon & Flipkart shopping?"*
• ✈️ *"Which cards offer free airport lounge access?"*
• 💳 *"What is my wallet health score?"*
• 🌐 *"Zero Forex markup cards for international trips"*`
    };
  }

  const emoji = CATEGORY_EMOJIS[category] || '🍳';
  const displayCategory = CATEGORY_LABELS[category] || 'General spend';
  const merchantStr = merchant || displayCategory;

  // Use the shared evaluator with a default amount if none provided
  // In a real NLP flow we'd extract the amount. Let's assume ₹5000 as default for analysis.
  const evalAmount = 5000;
  const activeCardIds = userCards.map(c => c.id);
  
  const transactions = useDashboardStore.getState().transactions;
  const context = { previousTransactions: transactions };
  const result = evaluateTransaction(merchantStr, evalAmount, activeCardIds, context);
  
  const bestGlobalCard = getBestCardForCategory(category);
  const maxGlobalRate = getCardRewardForCategory(bestGlobalCard, category);
  const runners = CARD_DATASET
    .filter((c) => c.id !== bestGlobalCard.id)
    .sort((a, b) => getCardRewardForCategory(b, category) - getCardRewardForCategory(a, category))
    .slice(0, 2);

  if (!result || !result.best) {
    return {
      content: `🏆 **Spend Optimization for ${merchantStr} (${displayCategory} ${emoji})**

💳 **In Your Wallet:**
• *You currently have 0 cards linked.* Add your cards to your wallet on the Dashboard to see personalized rankings from your own cards!

🔥 **Top Cards in the Market for ${displayCategory}:**
1. **${bestGlobalCard.bank} ${bestGlobalCard.name}** — **${maxGlobalRate}%** rewards
${runners.map((c, i) => `${i + 2}. **${c.bank} ${c.name}** — **${getCardRewardForCategory(c, category)}%** rewards`).join('\n')}

💡 *Link your cards to unlock instant real-time reward calculations for ${merchantStr}!*`,
      cards: [bestGlobalCard, ...runners]
    };
  }

  const isActuallyOptimal = result.best.rewardRate >= maxGlobalRate;

  let walletAdvice = `💳 **In Your Wallet:**
You should pay with **${result.best.card.name}** which gives you **${result.best.rewardRate}%** rewards.
${isActuallyOptimal ? '🟢 *This is the absolute best reward rate available for this transaction!*' : `🟡 *Optimization opportunity:* You are earning ${result.best.rewardRate}%, but you could earn **${maxGlobalRate}%** with **${bestGlobalCard.bank} ${bestGlobalCard.name}**.`}`;

  if (result.best.isCapped) {
    walletAdvice += `\n⚠️ *Note: ${result.best.limitations[0]}*`;
  }

  return {
    content: `🏆 **Spend Optimization for ${merchantStr} (${displayCategory} ${emoji})**

${walletAdvice}

🔥 **Top Cards in the Market for ${displayCategory}:**
1. **${bestGlobalCard.bank} ${bestGlobalCard.name}** — **${maxGlobalRate}%** rewards
${runners.map((c, i) => `${i + 2}. **${c.bank} ${c.name}** — **${getCardRewardForCategory(c, category)}%** rewards`).join('\n')}

💡 *Swipe your optimal card to maximize statement cashback and reward multipliers!*`,
    cards: [bestGlobalCard, ...runners],
    evaluation: result
  };
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

