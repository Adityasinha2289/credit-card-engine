/**
 * smsParser.ts
 * Client-side parser for Indian bank transaction SMS alerts.
 * Supports: SBI, HDFC, ICICI, Axis, Kotak, PNB, and generic patterns.
 */

import type { CardData } from '../../cards/types/card.types';
import { detectCategory } from '../../../features/finix/data/merchantMap';
import type { TransactionCategory, TransactionType } from '../types/dashboard.types';

export interface ParsedSms {
  merchant: string;
  amount: number; // in paise (rupee × 100), always positive
  /** debit = purchase; refund = reversal/cashback; credit = money received */
  type: TransactionType;
  category: TransactionCategory;
  /** null when we couldn't confidently match one of the user's cards — ask the user */
  cardId: string | null;
  /** last 4 digits found in SMS, used for matching */
  last4: string | null;
  date: string; // ISO string
}

// ─────────────────────────────────────────────────────────────────────────────
//  AMOUNT EXTRACTION
// ─────────────────────────────────────────────────────────────────────────────

const AMOUNT_PATTERNS = [
  // Rs. 850.00 / Rs 850 / RS 1,23,456.78
  /(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d{1,2})?)/i,
  // debited.*?(\d+,?\d*\.?\d*) — fallback
  /(?:debited|spent|used|charged)[^\d]*([\d,]+(?:\.\d{1,2})?)/i,
  // 850.00 debited
  /([\d,]+(?:\.\d{1,2})?)\s*(?:Rs\.?|INR|₹|debited|charged)/i,
];

function extractAmount(sms: string): number | null {
  for (const re of AMOUNT_PATTERNS) {
    const m = sms.match(re);
    if (m?.[1]) {
      const cleaned = m[1].replace(/,/g, '');
      const val = parseFloat(cleaned);
      if (!isNaN(val) && val > 0) return Math.round(val * 100);
    }
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
//  MERCHANT EXTRACTION
// ─────────────────────────────────────────────────────────────────────────────

const MERCHANT_PATTERNS = [
  //"at MERCHANT" or"at MERCHANT on"
  /\bat\s+([A-Za-z0-9&'.\-\s]{2,30}?)(?:\s+on|\s+via|\s+for|\s+ref|\.|\n|$)/i,
  //"to MERCHANT" (e.g. UPI transfers)
  /\bto\s+([A-Za-z0-9&'.\-\s]{2,30}?)(?:\s+on|\s+via|\s+ref|\.|\n|$)/i,
  //"for MERCHANT"
  /\bfor\s+([A-Za-z0-9&'.\-\s]{2,30}?)(?:\s+on|\s+via|\s+ref|\.|\n|$)/i,
  //"@ MERCHANT"
  /@\s*([A-Za-z0-9&'.\-\s]{2,30}?)(?:\s+on|\s+via|\s+ref|\.|\n|$)/i,
  // Merchant: MERCHANT
  /Merchant[:\s]+([A-Za-z0-9&'.\-\s]{2,30}?)(?:\.|,|\n|$)/i,
  //"from MERCHANT" (refunds / credits)
  /\bfrom\s+([A-Za-z0-9&'.\-\s]{2,30}?)(?:\s+on|\s+via|\s+ref|\s+(?:has\s+been\s+)?(?:credited|processed|initiated)|\s+to\b|\.|,|\n|$)/i,
];

/** Captures that are clearly not a merchant ("your A/c", "card XX1234", …). */
const NOT_A_MERCHANT = /^(your|you|a\/?c|ac|acct|account|card|the|bank|upi|vpa|xx|\*+)\b|^[x*\d\s]+$/i;

function extractMerchant(sms: string): string | null {
  for (const re of MERCHANT_PATTERNS) {
    const m = sms.match(re);
    if (m?.[1]) {
      const cleaned = m[1].trim().replace(/\s+/g, ' ').replace(/[.\-]+$/, '');
      if (cleaned.length >= 2 && !NOT_A_MERCHANT.test(cleaned)) return cleaned;
    }
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
//  DIRECTION
// ─────────────────────────────────────────────────────────────────────────────

const DEBIT_SIGNAL = /\b(debit(?:ed)?|spent|used|charged|withdrawn|purchase|paid|sent)\b/i;
const REFUND_SIGNAL = /\b(refund(?:ed)?|revers(?:al|ed)|cashback|chargeback)\b/i;
const CREDIT_SIGNAL = /\b(credited|received|deposited)\b/i;

export function detectDirection(sms: string): TransactionType {
  if (REFUND_SIGNAL.test(sms)) return 'refund';
  // "Rs 500 debited from A/c … and credited to X" is a debit for the user.
  if (DEBIT_SIGNAL.test(sms)) return 'debit';
  if (CREDIT_SIGNAL.test(sms)) return 'credit';
  return 'debit';
}

// ─────────────────────────────────────────────────────────────────────────────
//  LAST-4 CARD DIGIT EXTRACTION
// ─────────────────────────────────────────────────────────────────────────────

const LAST4_PATTERNS = [
  // A/C XX1234 or A/c XX4242 or card ending 4242
  /(?:A\/[Cc]|Ac|account|card)[^\d]*[Xx*]{0,6}(\d{4})/i,
  // Card No. XX1234 / card no 1234
  /card\s*(?:no\.?|number)?[^\d]*[Xx*]{0,6}(\d{4})/i,
  // ending 1234 / ending in 1234
  /ending\s+(?:in\s+)?(\d{4})/i,
  // ... 1234
  /[Xx*]{2,}\s*(\d{4})/,
];

function extractLast4(sms: string): string | null {
  for (const re of LAST4_PATTERNS) {
    const m = sms.match(re);
    if (m?.[1] && m[1].length === 4) return m[1];
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
//  DATE EXTRACTION
// ─────────────────────────────────────────────────────────────────────────────

const DATE_PATTERNS = [
  // 29-06-26 or 29/06/2026
  /(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/,
  // 29 Jun 2026 / 29-Jun-26
  /(\d{1,2})[\s-]([A-Za-z]{3})[\s-](\d{2,4})/,
];

const MONTH_MAP: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};

function extractDate(sms: string): string {
  for (const re of DATE_PATTERNS) {
    const m = sms.match(re);
    if (m) {
      try {
        let day: number, month: number, year: number;
        if (/[A-Za-z]/.test(m[2])) {
          day = parseInt(m[1], 10);
          month = MONTH_MAP[m[2].toLowerCase().slice(0, 3)] ?? new Date().getMonth();
          year = parseInt(m[3], 10);
        } else {
          day = parseInt(m[1], 10);
          month = parseInt(m[2], 10) - 1;
          year = parseInt(m[3], 10);
        }
        if (year < 100) year += 2000;
        const d = new Date(year, month, day);
        if (!isNaN(d.getTime())) return d.toISOString();
      } catch {
        // fall through
      }
    }
  }
  return new Date().toISOString();
}

// ─────────────────────────────────────────────────────────────────────────────
//  CARD MATCHING
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Only return a card when the SMS proves it. A bank-account SMS (A/c XX1234)
 * must never silently land on someone's credit card.
 */
function matchCard(last4: string | null, userCards: CardData[]): string | null {
  if (!last4) return null;
  const match = userCards.find((c) => c.pan && c.pan.replace(/\D/g, '').endsWith(last4));
  return match?.id ?? null;
}

// ─────────────────────────────────────────────────────────────────────────────
//  MAIN EXPORT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Parse a raw Indian bank SMS string into a structured transaction object.
 * Returns null if the SMS doesn't appear to be a transaction alert.
 */
export function parseSmsText(raw: string, userCards: CardData[]): ParsedSms | null {
  const sms = raw.trim();
  if (!sms) return null;

  // Must have at least a debit/spent/used/charged signal OR a clear amount pattern
  const hasSignal = DEBIT_SIGNAL.test(sms) || REFUND_SIGNAL.test(sms) || CREDIT_SIGNAL.test(sms) || /\bpayment\b/i.test(sms);
  const hasAmount = AMOUNT_PATTERNS.some((re) => re.test(sms));
  if (!hasSignal && !hasAmount) return null;

  const amount = extractAmount(sms);
  if (!amount) return null;

  const merchant = extractMerchant(sms) ?? 'Unknown Merchant';
  const last4 = extractLast4(sms);
  const cardId = matchCard(last4, userCards);
  const date = extractDate(sms);
  const type = detectDirection(sms);
  const category = (merchant === 'Unknown Merchant' ? 'other' : detectCategory(merchant)) as TransactionCategory;

  return { merchant, amount, type, category, cardId, last4, date };
}

// ─────────────────────────────────────────────────────────────────────────────
//  SAMPLE SMS TEMPLATES (for placeholder display in UI)
// ─────────────────────────────────────────────────────────────────────────────

export const SMS_SAMPLES = [
  'Dear Customer, Rs.850.00 debited from A/C XX4242 at ZOMATO on 29-06-26. Avl Bal Rs.24,150.00',
  'HDFC Bank: Rs 1,299.00 spent on card XX1234 at Amazon on 29/06/2026. Available limit: Rs 48,701',
  'ICICI Bank: INR 2500.00 used at MakeMyTrip via card ending 5678 on 29 Jun 2026',
  'SBI Alert: Rs.450 withdrawn from A/c XX9999 at Swiggy. Bal: Rs.18,230.50',
  'Axis Bank: Your card XX4321 was used for Rs 699 at Netflix on 29-Jun-26',
];
