import * as crypto from 'crypto';
import type { RawOfferDataset, SupabaseOfferRow } from './offerTypes';
import { MerchantReconciler } from './reconciliation/merchantReconciler';
import { CardReconciler } from './reconciliation/cardReconciler';

export class OfferMapper {
  private static normalizeIssuer(issuer?: string): string | null {
    if (!issuer) return null;
    const map: Record<string, string> = {
      'SBI Card': 'SBI',
      'HDFC Bank': 'HDFC',
      'ICICI Bank': 'ICICI',
      'Axis Bank': 'AXIS',
      'Kotak Mahindra Bank': 'KOTAK',
      'IndusInd Bank': 'INDUSIND',
      'Yes Bank': 'Yes Bank',
      'American Express': 'AMEX',
      'Bank of Baroda': 'BOB',
      'Punjab National Bank': 'PNB',
      'RBL Bank': 'RBL',
      'IDFC First Bank': 'IDFC',
      'IDFC FIRST Bank': 'IDFC',
      'HSBC': 'HSBC',
    };
    return map[issuer] || issuer;
  }

  private static generateDeterministicUuid(input: string): string {
    const hash = crypto.createHash('md5').update(input).digest('hex');
    return `${hash.substring(0, 8)}-${hash.substring(8, 12)}-4${hash.substring(13, 16)}-a${hash.substring(17, 20)}-${hash.substring(20, 32)}`;
  }

  public static toSupabaseRow(offer: RawOfferDataset): SupabaseOfferRow {
    let offer_type = 'percentage_discount';
    let value = 0;
    
    const benefitType = offer.benefit?.benefit_type;
    
    if (benefitType === 'PERCENTAGE_DISCOUNT') {
      offer_type = 'percentage_discount';
      value = offer.benefit?.discount_percentage || 0;
    } else if (benefitType === 'FLAT_DISCOUNT') {
      offer_type = 'flat_discount';
      value = offer.benefit?.flat_discount || offer.benefit?.maximum_benefit || 0;
    } else if (benefitType === 'CASHBACK') {
      offer_type = 'cashback';
      value = offer.benefit?.cashback || offer.benefit?.discount_percentage || offer.benefit?.flat_discount || 0;
    } else if (benefitType === 'REWARD_MULTIPLIER') {
      offer_type = 'points';
      value = offer.benefit?.reward_multiplier || 0;
    } else {
      // For BOGO, COMPLIMENTARY_UNIT, etc.
      offer_type = 'flat_discount';
      value = 0; 
    }

    let max_discount: number | null = offer.benefit?.maximum_benefit || null;
    
    const valid_from = offer.validity?.valid_from || new Date().toISOString();
    const valid_until = offer.validity?.valid_until || '2099-12-31T23:59:59Z';
    const status = offer.validity?.status === 'ACTIVE' ? 'active' : 'expired';
    const source = offer.identity?.grantor_scope === 'ISSUER' ? 'bank' : 'merchant';

    // --- RECONCILIATION ---
    const merchantReconciler = MerchantReconciler.getInstance();
    const resolvedMerchantId = merchantReconciler.resolve(offer.merchant?.merchant_id, offer.merchant?.merchant_name);
    
    const cardReconciler = CardReconciler.getInstance();
    const sourceCards = offer.eligibility?.card_ids || [];
    const resolvedCards: string[] = [];
    const unresolvedCards: string[] = [];
    
    for (const card of sourceCards) {
      const resolved = cardReconciler.resolve(card);
      if (resolved) {
        resolvedCards.push(resolved);
      } else {
        unresolvedCards.push(card);
      }
    }

    let merchantStatus = 'unresolved';
    if (resolvedMerchantId) merchantStatus = 'resolved';

    let cardStatus = 'unresolved';
    if (sourceCards.length === 0) {
      cardStatus = 'fully_resolved'; // Vacuously true
    } else if (unresolvedCards.length === 0) {
      cardStatus = 'fully_resolved';
    } else if (resolvedCards.length > 0) {
      cardStatus = 'partially_resolved';
    }

    return {
      id: this.generateDeterministicUuid(offer.identity.offer_id),
      source,
      offer_type,
      value,
      title: offer.identity.title,
      description: offer.identity.description || (offer.benefit?.benefit_text ?? ''),
      min_spend: offer.eligibility?.minimum_spend || 0,
      max_discount,
      valid_from,
      valid_until,
      status,
      eligibility_rules: {
        eligible_cards: resolvedCards,
        unresolved_source_cards: unresolvedCards,
        issuer: this.normalizeIssuer(offer.identity?.issuer),
        location: offer.eligibility?.location || [],
        transaction_type: offer.eligibility?.transaction_type || null,
        online_offline: offer.eligibility?.online_offline || null,
      },
      internal_campaign_metadata: {
        external_id: offer.identity.offer_id,
        source_name: offer.source_name,
        canonical_merchant_id: resolvedMerchantId,
        source_merchant_id: offer.merchant?.merchant_id,
        merchant_reconciliation_status: merchantStatus,
        card_reconciliation_status: cardStatus,
        merchant_name: offer.merchant?.merchant_name,
        original_valid_until_missing: !offer.validity?.valid_until,
        quality: offer.quality || {},
        data_quality: offer.data_quality || 'UNKNOWN',
        lifecycle_status: offer.lifecycle_status || 'UNKNOWN'
      }
    };
  }
}



