import { CARD_DATASET, type FinixCard, type SpendCategory } from '../data/cardDataset';
import { detectCategory } from '../data/merchantMap';
import type { Transaction } from '../../dashboard/types/dashboard.types';

export interface TransactionContext {
  previousTransactions?: Transaction[];
}

export type ConfidenceLevel = 'EXACT' | 'ESTIMATED' | 'LIMITED' | 'UNSUPPORTED';

export interface CardEvaluation {
  card: FinixCard;
  /** The theoretically calculated base reward based on rate */
  baseRewardValue: number;
  /** The final reward value after applying monthly caps (if available) */
  cappedRewardValue: number;
  /** True if the transaction hit the cap */
  isCapped: boolean;
  /** Any active merchant offer (separated from base reward) */
  offerRewardValue: number;
  /** The remaining cap after previous transactions (null if no cap or context unavailable) */
  capRemaining: number | null;
  /** Explicit confidence state of the calculation */
  confidence: ConfidenceLevel;
  rewardRate: number;
  reason: string;
  limitations: string[];
}

export interface TransactionEvaluationResult {
  merchant: string;
  category: SpendCategory;
  best: CardEvaluation | null;
  secondBest: CardEvaluation | null;
  delta: number;
  confidence: ConfidenceLevel;
}

/**
 * Normalizes input transaction history by summing up previously earned rewards for the card and category.
 * We only count transactions that are debits for the current calendar month.
 */
function getConsumedCap(
  cardId: string, 
  category: SpendCategory, 
  rate: number,
  context?: TransactionContext
): { consumed: number, isLimited: boolean } {
  if (!context?.previousTransactions) return { consumed: 0, isLimited: true };
  
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  let consumed = 0;
  let isLimited = false; // If we lack actual reward amounts and have to estimate from today's rate

  for (const t of context.previousTransactions) {
    if (t.cardId === cardId && t.category === category && t.type === 'debit') {
      const tDate = new Date(t.date);
      if (tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear) {
        // We lack definitive INR historical reward value in the Transaction schema
        // So we conservatively reconstruct from today's rate, which is a limited assumption.
        isLimited = true;
        const amountInInr = t.amount / 100;
        const reward = (amountInInr * rate) / 100;
        consumed += reward;
      }
    }
  }

  return { consumed, isLimited };
}

export function evaluateTransaction(
  merchant: string,
  amountInInr: number,
  userCardIds: string[],
  context?: TransactionContext
): TransactionEvaluationResult | null {
  if (!merchant || isNaN(amountInInr) || amountInInr <= 0 || userCardIds.length === 0) {
    return null;
  }

  const category = detectCategory(merchant);
  let globalConfidence: ConfidenceLevel = 'EXACT';

  const evaluated: CardEvaluation[] = userCardIds.map((cardId) => {
    const card = CARD_DATASET.find((c) => c.id === cardId);
    if (!card) return null;

    let cap: number | undefined = undefined;
    let categoryMatch = false;
    let confidence: ConfidenceLevel = 'EXACT';
    const limitations: string[] = [];

    const catReward = card.rewards?.find((r) => r.category === category);
    let rewardRate: number;

    if (catReward) {
      rewardRate = catReward.rate;
      cap = catReward.cap;
      categoryMatch = true;
    } else {
      if (card.baseRewardRate === null || card.baseRewardRate === undefined) {
        rewardRate = 0;
        confidence = 'UNSUPPORTED';
        limitations.push(`Base reward rate is unknown for this card. Using 0%.`);
      } else {
        rewardRate = card.baseRewardRate;
      }
    }

    const baseRewardValue = (amountInInr * rewardRate) / 100;
    
    let cappedRewardValue = baseRewardValue;
    let isCapped = false;
    let capRemaining: number | null = null;

    // Model cashback caps
    if (cap !== undefined && cap !== null) {
      if (!context?.previousTransactions) {
        // We know there's a cap, but we don't know the history. We must estimate.
        if (confidence === 'EXACT') confidence = 'ESTIMATED';
        if (baseRewardValue > cap) {
          cappedRewardValue = cap;
          isCapped = true;
          limitations.push(`Reward theoretically capped at ₹${cap} per cycle. Actual limit unknown without history.`);
        } else {
           limitations.push(`Card has a ₹${cap} reward cap per cycle. Unknown if you've hit it without history.`);
        }
      } else {
        // We have history, we can precisely calculate cap remaining
        const { consumed, isLimited } = getConsumedCap(cardId, category, rewardRate, context);
        if (isLimited && confidence === 'EXACT') confidence = 'LIMITED';
        
        capRemaining = Math.max(0, cap - consumed);
        
        if (baseRewardValue > capRemaining) {
          cappedRewardValue = capRemaining;
          isCapped = true;
          const exceededBy = baseRewardValue - capRemaining;
          limitations.push(`₹${exceededBy.toFixed(2)} of potential reward exceeds your remaining reward cap.`);
        }
        limitations.push(`Based on available calendar-month transaction history (billing cycle unknown).`);
      }
    }

    let reason = '';
    if (isCapped) {
      reason = capRemaining !== null
        ? `This card hits its reward cap, yielding ₹${cappedRewardValue.toFixed(2)} based on your history.`
        : `This card hits its ₹${cap} theoretical reward cap, yielding ₹${cappedRewardValue.toFixed(2)}.`;
    } else if (categoryMatch) {
      reason = `This card offers a specialized ${rewardRate}% rate for ${category}.`;
    } else {
      reason = `Based on the card's base reward rate.`;
    }

    // Downgrade global confidence if this card is less confident
    if (confidence === 'UNSUPPORTED') globalConfidence = 'UNSUPPORTED';
    else if (confidence === 'LIMITED' && globalConfidence !== 'UNSUPPORTED') globalConfidence = 'LIMITED';
    else if (confidence === 'ESTIMATED' && (globalConfidence === 'EXACT')) globalConfidence = 'ESTIMATED';

    return {
      card,
      baseRewardValue,
      cappedRewardValue,
      isCapped,
      offerRewardValue: 0, // Explicitly separate offer rewards (stubbed until commerce engine integrated)
      capRemaining,
      confidence,
      rewardRate,
      reason,
      limitations,
    };
  }).filter(Boolean) as CardEvaluation[];

  if (evaluated.length === 0) {
    return {
      merchant,
      category,
      best: null,
      secondBest: null,
      delta: 0,
      confidence: 'UNSUPPORTED'
    };
  }

  // Sort by highest capped reward value, breaking ties by lowest annual fee, then alphabetically
  evaluated.sort((a, b) => {
    if (b.cappedRewardValue !== a.cappedRewardValue) {
      return b.cappedRewardValue - a.cappedRewardValue;
    }
    const aFee = a.card.annualFee ?? 0;
    const bFee = b.card.annualFee ?? 0;
    if (aFee !== bFee) {
      return aFee - bFee;
    }
    return a.card.name.localeCompare(b.card.name);
  });

  const best = evaluated[0];
  
  if (best.confidence === 'UNSUPPORTED' && best.cappedRewardValue === 0) {
     return {
        merchant,
        category,
        best: null,
        secondBest: null,
        delta: 0,
        confidence: 'UNSUPPORTED'
     };
  }

  const secondBest = evaluated.length > 1 ? evaluated[1] : null;
  const delta = secondBest ? best.cappedRewardValue - secondBest.cappedRewardValue : best.cappedRewardValue;

  return {
    merchant,
    category,
    best,
    secondBest,
    delta,
    confidence: globalConfidence,
  };
}
