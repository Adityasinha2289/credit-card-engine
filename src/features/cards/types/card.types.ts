export type CardNetwork = 'visa' | 'mastercard' | 'amex' | 'discover';

/** The card's real last four digits, or '' when the user never gave them. */
export const last4Of = (pan?: string): string => {
  const digits = (pan ?? '').replace(/\D/g, '');
  return digits.length >= 4 ? digits.slice(-4) : '';
};
export type CardStatus = 'active' | 'frozen' | 'pending';

export interface CardData {
  /** Unique identifier */
  id: string;
  /** 16-digit PAN (Primary Account Number) */
  pan: string;
  /** Full cardholder name as embossed */
  cardholderName: string;
  /** Expiry in MM/YY format */
  expiry: string;
  /** Card network */
  network: CardNetwork;
  /** Bank name */
  bank?: string;
  /** Card status */
  status: CardStatus;
  /** Available credit in cents */
  availableCredit: number;
  /** Total credit limit in cents */
  creditLimit: number;
  /** Optional custom label */
  label?: string;
  /** Gradient stops for the card face — CSS color strings */
  gradientFrom?: string;
  gradientVia?: string;
  gradientTo?: string;
}
