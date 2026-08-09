import type { CardData } from '../../cards/types/card.types';
import type { PaymentMethod } from '../types';

/**
 * Adapter to translate existing real CardData into the pure PaymentMethod domain abstraction.
 * This preserves required metadata without polluting the generic core engine.
 */
export function adaptCardDataToPaymentMethod(card: CardData): PaymentMethod {
  return {
    id: card.id,
    type: 'credit_card',
    // Fallback to bank/network names if label is missing
    name: card.label || `${card.bank} ${card.network}`,
    provider: card.bank || 'Unknown Bank',
    metadata: {
      network: card.network,
      panLast4: card.pan.slice(-4),
      status: card.status,
    },
  };
}

/**
 * Convenience method to adapt an array of CardData.
 */
export function adaptUserCardsToPaymentMethods(cards: CardData[]): PaymentMethod[] {
  return cards.map(adaptCardDataToPaymentMethod);
}
