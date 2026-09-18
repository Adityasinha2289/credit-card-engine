import type { CommerceOffer } from '../types';

export interface OfferEligibilityContext {
  userId: string;
  walletCardIds: string[]; // Canonical cards.id values
  walletCards?: { id: string; provider: string }[]; // Full canonical cards
  transactionAmount?: number;
  merchantId?: string; // Canonical partners.id
  location?: string;
  transactionType?: string;
  channel?: 'ONLINE' | 'OFFLINE';
  evaluationTime?: Date; // Allows deterministic testing
}

export interface EligibilityResult {
  isEligible: boolean;
  reasons: string[];
  failedConditions: string[];
  unknownConditions: string[];
  applicableWalletCardIds: string[];
}

export class OfferEligibilityEngine {
  /**
   * Evaluates an offer against a user's context deterministically.
   * This is a pure function with no external side-effects or DB calls.
   */
  public static evaluate(
    offer: CommerceOffer,
    context: OfferEligibilityContext
  ): EligibilityResult {
    const reasons: string[] = [];
    const failedConditions: string[] = [];
    const unknownConditions: string[] = [];
    let isEligible = true; // Assume true until a mandatory condition fails

    const evalTime = context.evaluationTime || new Date();
    const rules = offer.eligibilityRules || {};
    const metadata = offer.internal_campaign_metadata || {}; // Needs to be added to CommerceOffer type if missing, or casted

    // ---------------------------------------------------------
    // 1. TEMPORAL VALIDITY
    // ---------------------------------------------------------
    if (offer.status === 'expired') {
      isEligible = false;
      failedConditions.push('STATUS');
      reasons.push('Offer is explicitly marked as expired.');
    } else {
      const validFrom = new Date(offer.validFrom);
      const validUntil = new Date(offer.validUntil);

      if (evalTime < validFrom) {
        isEligible = false;
        failedConditions.push('TIME_FUTURE');
        reasons.push(`Offer is not active yet (starts ${validFrom.toISOString()}).`);
      } else {
        // Check missing metadata flag. If it's missing, we only rely on validFrom and status.
        // Wait, the business rule says: "Do not blindly interpret 2099-12-31 as proof it expires in 2099."
        // If original_valid_until_missing is true, we assume it's currently active if validFrom and status passed.
        if (metadata.original_valid_until_missing) {
          reasons.push('Offer is active (no original expiry provided).');
        } else {
          if (evalTime > validUntil) {
            isEligible = false;
            failedConditions.push('TIME_EXPIRED');
            reasons.push(`Offer expired on ${validUntil.toISOString()}.`);
          } else {
            reasons.push('Offer is currently active.');
          }
        }
      }
    }

    // ---------------------------------------------------------
    // 2. CARD ELIGIBILITY
    // ---------------------------------------------------------
    const eligibleCards: string[] = rules.eligible_cards || [];
    const requiredIssuer: string | null = rules.issuer || null;
    const cardReconciliationStatus = metadata.card_reconciliation_status;
    
    let applicableWalletCardIds: string[] = [];

    if (cardReconciliationStatus === 'unresolved') {
      isEligible = false;
      unknownConditions.push('CARD_UNRESOLVED');
      reasons.push('Offer card constraint could not be canonically resolved.');
    } else {
      let passedSpecificCard = true;
      let passedIssuer = true;
      
      const walletCardIds = context.walletCardIds || [];
      const walletCards = context.walletCards || walletCardIds.map(id => ({ id, provider: '' }));

      const checkCard = eligibleCards.length > 0;
      const checkIssuer = !!requiredIssuer;

      const cardMatchedIds = new Set<string>();
      const issuerMatchedIds = new Set<string>();

      if (checkCard) {
        walletCardIds.forEach(id => {
          if (eligibleCards.includes(id)) cardMatchedIds.add(id);
        });
        if (cardMatchedIds.size > 0) {
          reasons.push('User owns an eligible card.');
        } else {
          passedSpecificCard = false;
          failedConditions.push('CARD_NOT_OWNED');
          reasons.push('User does not own any eligible cards for this offer.');
        }
      } else if (!checkIssuer) {
        reasons.push('Offer has no specific card restrictions.');
      }

      if (checkIssuer) {
        const walletIssuers = walletCards.map(c => c.provider).filter(Boolean);
        
        if (walletIssuers.length === 0) {
          passedIssuer = false;
          unknownConditions.push('ISSUER_CONTEXT_MISSING');
          reasons.push(`Offer requires issuer ${requiredIssuer}, but wallet issuer cannot be determined.`);
        } else {
          walletCards.forEach(c => {
            if (c.provider && c.provider.toUpperCase() === requiredIssuer.toUpperCase()) {
              issuerMatchedIds.add(c.id);
            }
          });
          if (issuerMatchedIds.size > 0) {
            reasons.push(`User owns a card from the required issuer (${requiredIssuer}).`);
          } else {
            passedIssuer = false;
            failedConditions.push('ISSUER_NOT_OWNED');
            reasons.push(`User does not own any cards from issuer ${requiredIssuer}.`);
          }
        }
      }

      if (!passedSpecificCard || !passedIssuer) {
        isEligible = false;
      } else {
        if (checkCard && checkIssuer) {
          applicableWalletCardIds = [...cardMatchedIds].filter(id => issuerMatchedIds.has(id));
        } else if (checkCard) {
          applicableWalletCardIds = [...cardMatchedIds];
        } else if (checkIssuer) {
          applicableWalletCardIds = [...issuerMatchedIds];
        } else {
          // If there are no specific card or issuer restrictions, the offer applies to all cards
          // Return a wildcard so the frontend doesn't falsely discard it when the backend DB wallet is empty
          applicableWalletCardIds = ['all_cards'];
        }
      }
    }

    // ---------------------------------------------------------
    // 3. MERCHANT ELIGIBILITY
    // ---------------------------------------------------------
    const merchantReconciliationStatus = metadata.merchant_reconciliation_status;
    const canonicalMerchantId = metadata.canonical_merchant_id;
    
    // If the dataset had a merchant constraint (source_merchant_id exists) but it couldn't be resolved
    if (metadata.source_merchant_id && merchantReconciliationStatus === 'unresolved') {
      isEligible = false;
      unknownConditions.push('MERCHANT_UNRESOLVED');
      reasons.push('Offer merchant constraint could not be canonically resolved.');
    } else if (canonicalMerchantId) {
      // If the offer is specifically restricted to a canonical merchant, the context must match it
      if (!context.merchantId) {
        isEligible = false;
        unknownConditions.push('MERCHANT_CONTEXT_MISSING');
        reasons.push('Offer requires merchant context, but none was provided.');
      } else if (canonicalMerchantId !== context.merchantId) {
        isEligible = false;
        failedConditions.push('MERCHANT_MISMATCH');
        reasons.push(`Offer is restricted to merchant ${canonicalMerchantId}.`);
      } else {
        reasons.push('Merchant context matches canonical offer merchant.');
      }
    }

    // ---------------------------------------------------------
    // 4. MINIMUM SPEND
    // ---------------------------------------------------------
    if (offer.minSpend && offer.minSpend > 0) {
      if (context.transactionAmount === undefined) {
        isEligible = false;
        unknownConditions.push('MIN_SPEND_CONTEXT_MISSING');
        reasons.push(`Offer requires a minimum spend of ₹${offer.minSpend}, but transaction amount is unknown.`);
      } else if (context.transactionAmount < offer.minSpend) {
        isEligible = false;
        failedConditions.push('MIN_SPEND');
        reasons.push(`Transaction amount (₹${context.transactionAmount}) is below the minimum spend (₹${offer.minSpend}).`);
      } else {
        reasons.push(`Transaction amount (₹${context.transactionAmount}) meets minimum spend (₹${offer.minSpend}).`);
      }
    }

    // ---------------------------------------------------------
    // 5. LOCATION ELIGIBILITY
    // ---------------------------------------------------------
    const validLocations: string[] = rules.location || [];
    if (validLocations.length > 0) {
      if (!context.location) {
        isEligible = false;
        unknownConditions.push('LOCATION_CONTEXT_MISSING');
        reasons.push('Offer requires location context, but none was provided.');
      } else if (!validLocations.includes(context.location)) {
        isEligible = false;
        failedConditions.push('LOCATION_MISMATCH');
        reasons.push('Transaction location is not eligible for this offer.');
      } else {
        reasons.push('Transaction location matches eligible locations.');
      }
    }

    // ---------------------------------------------------------
    // 6. CHANNEL (ONLINE/OFFLINE) ELIGIBILITY
    // ---------------------------------------------------------
    const requiredChannel = rules.online_offline;
    if (requiredChannel && requiredChannel !== 'BOTH') {
      if (!context.channel) {
        isEligible = false;
        unknownConditions.push('CHANNEL_CONTEXT_MISSING');
        reasons.push(`Offer is restricted to ${requiredChannel} transactions, but channel is unknown.`);
      } else if (context.channel.toUpperCase() !== requiredChannel.toUpperCase()) {
        isEligible = false;
        failedConditions.push('CHANNEL_MISMATCH');
        reasons.push(`Offer is restricted to ${requiredChannel} transactions.`);
      } else {
        reasons.push(`Transaction channel matches required channel (${requiredChannel}).`);
      }
    }

    // ---------------------------------------------------------
    // 7. TRANSACTION TYPE ELIGIBILITY
    // ---------------------------------------------------------
    const requiredTxType = rules.transaction_type;
    if (requiredTxType) {
      if (!context.transactionType) {
        isEligible = false;
        unknownConditions.push('TX_TYPE_CONTEXT_MISSING');
        reasons.push(`Offer is restricted to ${requiredTxType} transactions, but type is unknown.`);
      } else if (context.transactionType.toUpperCase() !== requiredTxType.toUpperCase()) {
        isEligible = false;
        failedConditions.push('TX_TYPE_MISMATCH');
        reasons.push(`Offer requires ${requiredTxType} transaction type.`);
      } else {
        reasons.push(`Transaction type matches required type (${requiredTxType}).`);
      }
    }

    return {
      isEligible,
      reasons,
      failedConditions,
      unknownConditions,
      applicableWalletCardIds
    };
  }
}
