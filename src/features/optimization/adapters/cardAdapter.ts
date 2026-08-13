import type { CardData } from '../../cards/types/card.types';
import type { PaymentMethod } from '../types';

/**
 * Adapter to translate existing real CardData into the pure PaymentMethod domain abstraction.
 * This preserves required metadata without polluting the generic core engine.
 */
export function adaptCardDataToPaymentMethod(card: CardData, userId: string): PaymentMethod {
  return {
    id: card.id,
    userId,
    
    // User-Controlled
    name: card.label || `${card.bank} ${card.network}`,
    status: card.status === 'active' ? 'active' : 'inactive',
    
    // System-Verified
    type: 'credit_card',
    provider: card.bank || 'Unknown Bank',
    metadata: {
      network: card.network,
      panLast4: card.pan.slice(-4),
      legacy_card_id: card.id,
      status_raw: card.status,
    },
  };
}

/**
 * Convenience method to adapt an array of CardData.
 */
export function adaptUserCardsToPaymentMethods(cards: CardData[], userId: string): PaymentMethod[] {
  return cards.map(c => adaptCardDataToPaymentMethod(c, userId));
}
