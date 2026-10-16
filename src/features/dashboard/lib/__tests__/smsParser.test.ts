import { describe, it, expect } from 'vitest';
import { parseSmsText, SMS_SAMPLES, detectDirection } from '../smsParser';
import type { CardData } from '../../../cards/types/card.types';

const card = (id: string, last4: string) =>
  ({ id, pan: `**** **** **** ${last4}`, label: id } as unknown as CardData);

describe('parseSmsText', () => {
  const cards = [card('hdfc_regalia', '1234'), card('axis_ace', '4321')];

  it('extracts the merchant (regression: invalid {2,30?} quantifier never matched)', () => {
    const r = parseSmsText(SMS_SAMPLES[1], cards);
    expect(r?.merchant).toBe('Amazon');
    expect(r?.amount).toBe(129900);
    expect(r?.type).toBe('debit');
  });

  it('matches a card only when the last 4 digits prove it', () => {
    expect(parseSmsText(SMS_SAMPLES[1], cards)?.cardId).toBe('hdfc_regalia');
    expect(parseSmsText(SMS_SAMPLES[4], cards)?.cardId).toBe('axis_ace');
    // Bank account SMS (A/C XX4242) must not land on a credit card
    expect(parseSmsText(SMS_SAMPLES[0], cards)?.cardId).toBeNull();
  });

  it('categorises known merchants', () => {
    expect(parseSmsText(SMS_SAMPLES[0], cards)?.merchant.toLowerCase()).toBe('zomato');
    expect(parseSmsText(SMS_SAMPLES[0], cards)?.category).toBe('dining');
  });

  it('detects refunds and credits', () => {
    const refund = parseSmsText('Refund of Rs 499.00 from Myntra credited to card XX1234 on 02-10-26', cards);
    expect(refund?.type).toBe('refund');
    expect(refund?.merchant).toBe('Myntra');
    expect(detectDirection('INR 50,000 credited to A/c XX9999 by NEFT salary')).toBe('credit');
    expect(detectDirection('Rs 500 debited from A/c XX12 and credited to ZOMATO')).toBe('debit');
  });

  it('never returns "your A/c" as a merchant', () => {
    const r = parseSmsText('Rs 1,000 credited to your A/c XX9999 on 01-10-26', cards);
    expect(r?.merchant).toBe('Unknown Merchant');
  });
});
