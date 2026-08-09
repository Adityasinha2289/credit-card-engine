import { describe, expect, it } from 'vitest';
import { adaptCardDataToPaymentMethod } from '../cardAdapter';
import type { CardData } from '../../../cards/types/card.types';

describe('CardAdapter', () => {
  it('correctly maps CardData to PaymentMethod', () => {
    const mockCard: CardData = {
      id: 'card-123',
      pan: '1111222233334444',
      cardholderName: 'John Doe',
      expiry: '12/28',
      network: 'visa',
      bank: 'SBI',
      status: 'active',
      availableCredit: 500000,
      creditLimit: 1000000,
      label: 'My SBI Card',
    };

    const paymentMethod = adaptCardDataToPaymentMethod(mockCard);

    expect(paymentMethod.id).toBe('card-123');
    expect(paymentMethod.type).toBe('credit_card');
    expect(paymentMethod.name).toBe('My SBI Card');
    expect(paymentMethod.provider).toBe('SBI');
    expect(paymentMethod.metadata).toEqual({
      network: 'visa',
      panLast4: '4444',
      status: 'active',
    });
  });

  it('provides fallbacks when optional fields are missing', () => {
    const mockCard: CardData = {
      id: 'card-456',
      pan: '0000000000001234',
      cardholderName: 'Jane Doe',
      expiry: '01/29',
      network: 'mastercard',
      status: 'active',
      availableCredit: 10000,
      creditLimit: 20000,
      // missing bank and label
    };

    const paymentMethod = adaptCardDataToPaymentMethod(mockCard);

    expect(paymentMethod.name).toBe('undefined mastercard');
    expect(paymentMethod.provider).toBe('Unknown Bank');
  });
});
