/**
 * Counts for the public website, taken from the full card catalogue
 * (renocred-data/datasets/renocred_card_master.json). The catalogue is ~10 MB,
 * far too big to ship to the browser, so the site imports these few numbers
 * instead. Re-run after the catalogue changes: `npm run site:stats`.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const SRC = new URL('../renocred-data/datasets/renocred_card_master.json', import.meta.url);
const OUT = new URL('../src/public-platform/site/catalogueStats.json', import.meta.url);

// Issuer spellings vary by source ("RBL BANK", "IDFC Bank", "BOBCARD"); fold them to one name each.
const ISSUER_KEY = [
  [/^sbi/i, 'SBI Card'], [/^hdfc/i, 'HDFC Bank'], [/^rbl/i, 'RBL Bank'], [/^axis/i, 'Axis Bank'],
  [/^yes/i, 'Yes Bank'], [/^federal/i, 'Federal Bank'], [/^icici/i, 'ICICI Bank'], [/^bob/i, 'Bank of Baroda'],
  [/^indus|^induslnd/i, 'IndusInd Bank'], [/^kotak/i, 'Kotak Mahindra Bank'], [/^idfc/i, 'IDFC FIRST Bank'],
  [/^standard chartered/i, 'Standard Chartered'], [/^hsbc/i, 'HSBC'], [/^au small/i, 'AU Small Finance Bank'],
  [/^american express/i, 'American Express'],
];
const NOT_ISSUERS = new Set(['rupay']);

const cards = JSON.parse(readFileSync(SRC, 'utf8')).data;
const issuers = new Set();
for (const c of cards) {
  const raw = (c.identity?.issuer ?? '').trim();
  if (!raw || NOT_ISSUERS.has(raw.toLowerCase())) continue;
  issuers.add(ISSUER_KEY.find(([re]) => re.test(raw))?.[1] ?? raw.toLowerCase());
}

const stats = {
  cards: cards.length,
  issuers: issuers.size,
  pagesRead: new Set(cards.map((c) => c.source_url).filter(Boolean)).size,
  sourcedFacts: cards.reduce((n, c) => n + (c.evidence_data?.length ?? 0), 0),
  feeWaivers: cards.filter((c) => c.fees?.fee_waiver).length,
};
writeFileSync(OUT, `${JSON.stringify(stats, null, 2)}\n`);
console.log(stats);
