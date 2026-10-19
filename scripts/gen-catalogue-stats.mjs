/**
 * Builds the website's view of the full card catalogue
 * (renocred-data/datasets/renocred_card_master.json, ~10 MB, far too big to ship):
 *   - site/catalogueStats.json: headline counts
 *   - site/catalogueCards.json: one light record per card (name, issuer, fees,
 *     key benefits, issuer link) so the directory and card pages cover every card.
 * Re-run after the catalogue changes: `npm run site:stats`.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const SRC = new URL('../renocred-data/datasets/renocred_card_master.json', import.meta.url);
const OUT_STATS = new URL('../src/public-platform/site/catalogueStats.json', import.meta.url);
const OUT_CARDS = new URL('../src/public-platform/site/catalogueCards.json', import.meta.url);

// Issuer spellings vary by source ("RBL BANK", "IDFC Bank", "BOBCARD"); fold them to one name each.
const ISSUER_KEY = [
  [/^sbi/i, 'SBI Card'], [/^hdfc/i, 'HDFC Bank'], [/^rbl/i, 'RBL Bank'], [/^axis/i, 'Axis Bank'],
  [/^yes/i, 'Yes Bank'], [/^federal/i, 'Federal Bank'], [/^icici/i, 'ICICI Bank'], [/^bob/i, 'Bank of Baroda'],
  [/^indus|^induslnd/i, 'IndusInd Bank'], [/^kotak/i, 'Kotak Mahindra Bank'], [/^idfc/i, 'IDFC FIRST Bank'],
  [/^standard chartered/i, 'Standard Chartered'], [/^hsbc/i, 'HSBC'], [/^au small/i, 'AU Small Finance Bank'],
  [/^american express/i, 'American Express'], [/^punjab national/i, 'Punjab National Bank'], [/^union bank/i, 'Union Bank of India'],
];
const NOT_ISSUERS = new Set(['rupay']);
const issuerName = (raw) => {
  const s = (raw ?? '').trim();
  if (!s || NOT_ISSUERS.has(s.toLowerCase())) return null;
  return ISSUER_KEY.find(([re]) => re.test(s))?.[1] ?? s.replace(/\b([A-Z])([A-Z]+)\b/g, (_, a, b) => a + b.toLowerCase());
};

const clean = (s, max) => {
  const t = String(s ?? '').replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  return `${cut.slice(0, Math.max(cut.lastIndexOf('. '), cut.lastIndexOf(', '), max - 20)).replace(/[,.]$/, '')}…`;
};

/**
 * A fee is trusted only when its text states a fee ("annual fee of ₹500", "Joining Fee: ₹999").
 * The extractor sometimes stored spend thresholds ("waiver on spending ₹1") as the fee.
 */
const feeFrom = (f) => {
  if (!f || typeof f.amount !== 'number') return null;
  const text = String(f.conditions ?? '').toLowerCase();
  if (/waive|spend/.test(text) && !/fee (of|:|–|-)/.test(text)) return null;
  if (f.amount === 0) return 0;
  return f.amount >= 100 ? Math.round(f.amount) : null;
};

const raw = JSON.parse(readFileSync(SRC, 'utf8')).data;
const cards = [];
for (const c of raw) {
  const issuer = issuerName(c.identity?.issuer);
  const name = clean(c.identity?.card_name, 90);
  if (!issuer || !name) continue;
  const texts = [
    ...(c.benefits ?? []).map((b) => b.description),
    ...(c.features ?? []).filter((f) => f.field === 'benefit').map((f) => f.raw_text),
  ].filter(Boolean);
  const all = texts.join(' ').toLowerCase();
  const lifetimeFree = /lifetime free|life time free|no annual fee|zero annual fee/.test(`${all} ${String(c.fees?.fee_waiver_condition ?? '').toLowerCase()}`);
  cards.push({
    id: c.identity.card_id,
    name,
    issuer,
    network: c.identity?.network ?? null,
    annualFee: lifetimeFree ? 0 : feeFrom(c.fees?.annual_fee),
    joiningFee: feeFrom(c.fees?.joining_fee),
    feeWaiver: c.fees?.fee_waiver_condition ? clean(c.fees.fee_waiver_condition, 140) : null,
    lounge: (c.benefits ?? []).some((b) => /lounge/i.test(`${b.category} ${b.description}`)),
    benefits: [...new Set(texts.map((t) => clean(t, 150)))].filter((t) => t.length > 25 && !/sourcing of this credit card has been stopped/i.test(t)).slice(0, 3),
    discontinued: /sourcing of this credit card has been stopped|no longer (issued|available|offered)/i.test(all),
    url: c.identity?.official_url ?? c.source_url ?? null,
  });
}

const issuers = new Set(cards.map((c) => c.issuer));
const stats = {
  cards: raw.length,
  issuers: issuers.size,
  pagesRead: new Set(raw.map((c) => c.source_url).filter(Boolean)).size,
  sourcedFacts: raw.reduce((n, c) => n + (c.evidence_data?.length ?? 0), 0),
  feeWaivers: raw.filter((c) => c.fees?.fee_waiver).length,
};
writeFileSync(OUT_STATS, `${JSON.stringify(stats, null, 2)}\n`);
writeFileSync(OUT_CARDS, `${JSON.stringify(cards)}\n`);
console.log(stats, `${cards.length} card records`, `${(JSON.stringify(cards).length / 1024).toFixed(0)} KB`);
