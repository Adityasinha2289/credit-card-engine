import { useMemo, useState } from 'react';
import { SEO } from '../../components/SEO';
import { getCardBySlug, getDirectoryCards, getRatesFor } from '../../lib/cardKnowledgeGraph';
import { getBreadcrumbSchema, getOrganizationSchema, getWebSiteSchema } from '../../lib/schemaBuilders';
import { cn } from '../../../lib/utils';
import { ButtonLink, formatINR } from '../../site/primitives';
import { CalculatorShell } from '../../site/CalculatorShell';
import { CardSelect } from '../../site/CardSelect';
import { DEFAULT_PROFILE, blendedRate, breakEvenMonthly, type Profile } from '../../site/calc';
import { SIGN_UP } from '../../site/nav';

const ROUTE = '/calculators/annual-fee-break-even';

const MIXES: { id: string; label: string; shares: Profile }[] = [
  { id: 'balanced', label: 'A bit of everything', shares: DEFAULT_PROFILE },
  { id: 'online', label: 'Mostly online shopping', shares: { shopping: 60, dining: 15, utilities: 10, other: 15 } },
  { id: 'travel', label: 'Mostly travel', shares: { travel: 60, dining: 15, shopping: 10, other: 15 } },
  { id: 'dining', label: 'Mostly food & dining', shares: { dining: 55, groceries: 20, shopping: 10, other: 15 } },
  { id: 'bills', label: 'Mostly bills', shares: { utilities: 50, groceries: 20, fuel: 15, other: 15 } },
];

/** Rewards-per-year line against the flat annual fee, with the crossing marked. */
function BreakEvenChart({ fee, monthly, ratePct }: { fee: number; monthly: number; ratePct: number }) {
  const maxX = Math.max(monthly * 2, 20000);
  const maxY = Math.max(fee * 2, 1);
  const W = 320, H = 180, P = 8;
  const x = (v: number) => P + (v / maxX) * (W - 2 * P);
  const y = (v: number) => H - P - (Math.min(v, maxY) / maxY) * (H - 2 * P);
  const rewardsAt = (m: number) => m * 12 * (ratePct / 100);
  const endX = Math.min(maxX, maxY / (12 * (ratePct / 100)));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`Rewards reach the ${formatINR(fee)} fee at ${formatINR(monthly)} a month`}>
      <line x1={P} y1={H - P} x2={W - P} y2={H - P} stroke="white" strokeOpacity="0.15" />
      <line x1={P} y1={y(fee)} x2={W - P} y2={y(fee)} stroke="#AEC3B0" strokeDasharray="5 5" strokeWidth="1.5" />
      <line x1={x(0)} y1={y(0)} x2={x(endX)} y2={y(rewardsAt(endX))} stroke="#E3EED4" strokeWidth="2.5" />
      <circle cx={x(monthly)} cy={y(fee)} r="6" fill="#2A9D5C" />
      <circle cx={x(monthly)} cy={y(fee)} r="13" fill="#2A9D5C" fillOpacity="0.2" />
      <text x={P + 2} y={y(fee) - 8} fontSize="10" fill="#AEC3B0" fontFamily="Inter">Annual fee</text>
      <text x={W - P} y={H - P - 8} fontSize="10" fill="#AEC3B0" fontFamily="Inter" textAnchor="end">{formatINR(maxX)}/mo</text>
    </svg>
  );
}

export function BreakEvenCalculatorPage() {
  const cards = useMemo(() => getDirectoryCards().filter((c) => (c.annualFee ?? 0) > 0), []);
  const [card, setCard] = useState(() => getCardBySlug('hdfc-regalia-gold-credit-card') ?? cards[0]);
  const [mix, setMix] = useState(MIXES[0].id);

  const shares = MIXES.find((m) => m.id === mix)!.shares;
  const rates = getRatesFor(card);
  const ratePct = rates ? blendedRate(rates, shares) : 0;
  const monthly = breakEvenMonthly(card, shares);
  const fee = card.annualFee ?? 0;

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', item: '/' },
    { name: 'Annual Fee Break-Even Calculator', item: ROUTE },
  ]);

  return (
    <>
      <SEO
        title="Credit Card Annual Fee Break-Even Calculator | RenoCred"
        description="Find out how much you need to spend for a credit card's rewards to cover its annual fee, and when the fee is waived."
        canonicalUrl={`https://renocred.com${ROUTE}`}
        schemaData={[getOrganizationSchema(), getWebSiteSchema(), breadcrumbSchema]}
      />
      <CalculatorShell
        current={ROUTE}
        title={<>Annual fee <span className="italic text-rc-forest">break-even</span></>}
        lede="How much you need to spend before a card's rewards pay for its fee, and the spend at which the issuer waives it altogether."
        note="Break-even uses the card's published rate for each category in the spend mix you choose, ignoring monthly caps, so it is the lowest spend at which the fee can pay for itself. Waiver thresholds are the issuer's yearly spend targets."
        inputs={
          <div className="space-y-12">
            <CardSelect cards={cards} value={card} onChange={setCard} label="Card with a fee" />
            <fieldset>
              <legend className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-rc-muted">Where does your money go?</legend>
              <div role="radiogroup" className="grid gap-2 sm:grid-cols-2">
                {MIXES.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    role="radio"
                    aria-checked={mix === m.id}
                    onClick={() => setMix(m.id)}
                    className={cn('rounded-2xl border px-5 py-4 text-left text-[15px] transition-colors', mix === m.id ? 'border-rc-ink bg-rc-ink text-rc-cream' : 'border-rc-ink/15 bg-white text-rc-ink hover:border-rc-ink/40')}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>
        }
        result={
          <div className="overflow-hidden rounded-[28px] bg-rc-ink text-rc-cream">
            <div className="p-7 sm:p-9">
              {monthly == null ? (
                <p className="text-[16px] leading-relaxed text-rc-mist">We don't have per-category rates for this card yet, so we can't work out its break-even honestly. Try another card.</p>
              ) : (
                <>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-rc-mist">Rewards cover the {formatINR(fee)} fee at</p>
                  <p className="mt-3 font-serif text-[clamp(3rem,6vw,4.25rem)] leading-none tabular-nums">{formatINR(monthly)}</p>
                  <p className="mt-3 text-[14px] text-rc-mist">a month, about {formatINR(monthly * 12)} a year, at {ratePct.toFixed(2)}% back</p>
                  <div className="mt-8"><BreakEvenChart fee={fee} monthly={monthly} ratePct={ratePct} /></div>
                </>
              )}
            </div>
            {rates?.feeWaiverSpend ? (
              <div className="border-t border-white/10 p-7 sm:p-9">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-rc-mist">Fee waived entirely at</p>
                <p className="mt-2 font-serif text-[30px] leading-none tabular-nums">{formatINR(rates.feeWaiverSpend)}<span className="ml-2 font-sans text-[14px] text-rc-mist">a year</span></p>
                <p className="mt-2 text-[13px] text-rc-mist">About {formatINR(Math.ceil(rates.feeWaiverSpend / 12))} a month.</p>
              </div>
            ) : null}
            <div className="border-t border-white/10 p-7 sm:p-9">
              <ButtonLink to={SIGN_UP} variant="cream" className="w-full">See if it pays off for you</ButtonLink>
            </div>
          </div>
        }
      />
    </>
  );
}
