import type { MerchantOffer } from '../merchant-intelligence/types';
import type { SupabaseOfferRow } from './offerTypes';

export class OfferMapper {
  public static toSupabaseRow(offer: MerchantOffer): SupabaseOfferRow {
    return {
      id: offer.id,
      merchant_id: offer.merchantId,
      title: offer.title,
      description: offer.description,
      discount_type: offer.discountType,
      discount_value: offer.discountValue,
      eligible_cards: offer.eligibleCards || ['all'],
      eligible_networks: offer.eligibleNetworks || ['Visa', 'Mastercard'],
      minimum_spend: offer.minimumSpend || 0,
      validity: offer.validity,
      priority: offer.priority || 'medium',
      stackable: offer.stackable || false,
      category: offer.category,
    };
  }
}
