import type { CardData } from '../../cards/types/card.types';
import type { CreditAccount, Transaction } from '../../dashboard/types/dashboard.types';
import { CARD_DATASET, type SpendCategory } from '../../finix/data/cardDataset';
import { evaluateTransaction, type ConfidenceLevel } from '../../finix/lib/evaluateTransaction';

export interface PaymentContext {
  /** Amount in RUPEES (what the user typed) */
  amount: number;
  merchant: string;
  merchantType: 'P2P' | 'P2M';
  /** Optional explicit category; inferred from merchant when omitted */
  category?: SpendCategory;
}

export interface PaymentRecommendation {
  recommendedMethodId: string;
  alternativeMethodId?: string;
  reason: string;
  /** ₹ value of rewards on the recommended card */
  estimatedRewardValue?: number;
  /** ₹ value of rewards on the runner-up */
  alternativeRewardValue?: number;
  eligibility: boolean;
  confidence: ConfidenceLevel;
  warnings: string[];
  source: 'DEMO' | 'LIVE';
}

/** Above this utilisation we warn — bureaus start penalising around 30%. */
const HIGH_UTILISATION = 0.3;

/**
 * Picks the best card in the user's wallet for a payment using the same reward
 * maths as the rest of the app (evaluateTransaction: category rates + caps),
 * and the real runner-up — not hard-coded demo card ids.
 */
export class PaymentDecisionEngine {
  static evaluate(
    context: PaymentContext,
    cards: CardData[],
    accounts: CreditAccount[],
    opts: { isDemo?: boolean; history?: Transaction[] } = {},
  ): PaymentRecommendation {
    const source = opts.isDemo ? 'DEMO' : 'LIVE';
    const available = cards.filter((c) => c.status === 'active');

    if (context.merchantType === 'P2P') {
      return {
        recommendedMethodId: 'bank_upi',
        reason: 'Paying a person: use your bank account over UPI. Credit-card-on-UPI only works for merchant (P2M) payments.',
        eligibility: true,
        confidence: 'EXACT',
        warnings: [],
        source,
      };
    }

    if (available.length === 0) {
      return {
        recommendedMethodId: '',
        reason: 'Add a card to your wallet to get a recommendation.',
        eligibility: false,
        confidence: 'UNSUPPORTED',
        warnings: [],
        source,
      };
    }

    const result = evaluateTransaction(
      context.merchant || context.category || 'other',
      context.amount,
      available.map((c) => c.id),
      { previousTransactions: opts.history, category: context.category },
    );

    const warnings: string[] = [];
    // evaluateTransaction silently skips cards it has no reward data for — say so.
    const unrated = available.filter((c) => !CARD_DATASET.some((d) => d.id === c.id));
    if (unrated.length > 0) {
      warnings.push(`No reward data yet for ${unrated.map((c) => c.label || 'one card').join(', ')}, so ${unrated.length === 1 ? "it wasn't" : "they weren't"} compared.`);
    }

    if (!result || !result.best) {
      return {
        recommendedMethodId: available[0].id,
        reason: "We don't have reward data for the cards in your wallet yet, so we can't compare them.",
        eligibility: true,
        confidence: 'UNSUPPORTED',
        warnings,
        source,
      };
    }

    const best = result.best;
    const runnerUp = result.secondBest;

    const account = accounts.find((a) => a.cardId === best.card.id);
    if (account && account.totalLimit > 0 && account.currentBalance / account.totalLimit > HIGH_UTILISATION) {
      const label = available.find((c) => c.id === best.card.id)?.label || best.card.name;
      warnings.push(`${label} is over ${Math.round(HIGH_UTILISATION * 100)}% utilised. Using it more can dent your credit score — consider ${runnerUp ? 'the alternative' : 'UPI from your bank account'}.`);
    }
    warnings.push(...best.limitations);

    const delta = runnerUp ? best.cappedRewardValue - runnerUp.cappedRewardValue : 0;
    const reason = runnerUp && delta > 0
      ? `${best.reason} That's ₹${delta.toFixed(0)} more than your next best card.`
      : best.reason;

    return {
      recommendedMethodId: best.card.id,
      alternativeMethodId: runnerUp?.card.id,
      reason,
      estimatedRewardValue: best.cappedRewardValue,
      alternativeRewardValue: runnerUp?.cappedRewardValue,
      eligibility: true,
      confidence: best.confidence,
      warnings,
      source,
    };
  }
}
