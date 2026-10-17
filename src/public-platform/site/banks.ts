/**
 * Issuer names arrive as codes ("AXIS", "SOUTHINDIAN") from the catalogue and as
 * names ("Axis Bank", "SBI Card") from curated entries. One label per issuer.
 */
const BANK_LABELS: Record<string, string> = {
  HDFC: 'HDFC Bank', SBI: 'SBI Card', ICICI: 'ICICI Bank', AXIS: 'Axis Bank', KOTAK: 'Kotak',
  AMEX: 'American Express', IDFC: 'IDFC First', AU: 'AU Bank', HSBC: 'HSBC', INDUSIND: 'IndusInd',
  RBL: 'RBL Bank', YES: 'Yes Bank', BOB: 'Bank of Baroda', PNB: 'PNB', CANARA: 'Canara Bank',
  UNION: 'Union Bank', IOB: 'IOB', INDIANBANK: 'Indian Bank', CENTRALBANK: 'Central Bank',
  BOM: 'Bank of Maharashtra', CSB: 'CSB Bank', SOUTHINDIAN: 'South Indian Bank',
  'AMERICAN EXPRESS': 'American Express',
};

export function bankLabel(issuer: string): string {
  const up = issuer.trim().toUpperCase();
  if (BANK_LABELS[up]) return BANK_LABELS[up];
  const stem = up.replace(/\s+(BANK|CARD)$/, '');
  return BANK_LABELS[stem] ?? issuer;
}
