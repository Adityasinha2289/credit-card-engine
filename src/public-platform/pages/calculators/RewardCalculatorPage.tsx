import { useMemo, useState } from 'react';
import { SiteLink as Link } from '../../site/SiteLink';
import { ArrowRight } from 'lucide-react';
import { SEO } from '../../components/SEO';
import { getCardBySlug, getDirectoryCards } from '../../lib/cardKnowledgeGraph';
import { getBreadcrumbSchema, getOrganizationSchema, getWebSiteSchema } from '../../lib/schemaBuilders';
import { ButtonLink, formatINR } from '../../site/primitives';
import { displayCardName } from '../../site/CardFace';
import { CalculatorShell } from '../../site/CalculatorShell';
import { CardSelect, MoneyInput } from '../../site/CardSelect';
import { DEFAULT_PROFILE, SPEND_ROWS, cardValue, type Profile } from '../../site/calc';
import { SIGN_UP } from '../../site/nav';

const ROUTE = '/calculators/credit-card-reward-calculator';

export function RewardCalculatorPage() {
  const cards = useMemo(() => getDirectoryCards().filter((c) => c.annualFee !== null), []);
  const [card, setCard] = useState(() => getCardBySlug('sbi-cashback-credit-card') ?? cards[0]);
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);

  const value = useMemo(() => cardValue(card, profile), [card, profile]);
  const monthlyTotal = Object.values(profile).reduce((s, v) => s + v, 0);
  const best = useMemo(() => {
    let top: { card: typeof card; net: number } | null = null;
    for (const c of cards) {
      const v = cardValue(c, profile);
      if (v.known && (!top || v.net > top.net)) top = { card: c, net: v.net };
    }
    return top;
  }, [cards, profile]);
  const maxYearly = Math.max(1, ...value.byCategory.map((c) => c.yearly));

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', item: '/' },
    { name: 'Credit Card Reward Calculator', item: ROUTE },
  ]);

  return (
    <>
      <SEO
        title="Credit Card Reward Calculator | Estimate Cashback & Points | RenoCred"
        description="Estimate what an Indian credit card returns on your spending, category by category, after caps, fee waivers and the annual fee."
        canonicalUrl={`https://renocred.com${ROUTE}`}
        schemaData={[getOrganizationSchema(), getWebSiteSchema(), breadcrumbSchema]}
      />
      <CalculatorShell
        current={ROUTE}
        title={<>Reward <span className="italic text-rc-forest">calculator</span></>}
        lede="What a card actually returns on your spending, category by category, after monthly caps, fee waivers and the annual fee."
        note="Rates are the effective value back as a share of spend, from each issuer's published terms, with monthly caps and fee-waiver thresholds where stated. Portal-only multipliers, exclusions and redemption choices change real outcomes."
        inputs={
          <div className="space-y-12">
            <CardSelect cards={cards} value={card} onChange={setCard} label="Your card" />
            <div>
              <div className="mb-2 flex items-baseline justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-rc-muted">Monthly spend</p>
                <p className="text-[14px] text-rc-muted">Total <span className="font-medium text-rc-ink tabular-nums">{formatINR(monthlyTotal)}</span></p>
              </div>
              {SPEND_ROWS.map((r) => (
                <MoneyInput key={r.id} id={`spend-${r.id}`} label={r.label} value={profile[r.id] ?? 0} onChange={(n) => setProfile((p) => ({ ...p, [r.id]: n }))} />
              ))}
            </div>
          </div>
        }
        result={
          <div className="overflow-hidden rounded-[28px] bg-rc-ink text-rc-cream">
            <div className="p-7 sm:p-9">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-rc-mist">Net value a year</p>
              {value.known ? (
                <>
                  <p className={`mt-3 font-serif text-[clamp(3rem,6vw,4.25rem)] leading-none tabular-nums ${value.net < 0 ? 'text-[#F2B8A0]' : 'text-rc-cream'}`}>
                    {value.net < 0 ? '−' : ''}{formatINR(Math.abs(value.net))}
                  </p>
                  <p className="mt-3 text-[14px] text-rc-mist">{value.blendedRate.toFixed(2)}% back on {formatINR(monthlyTotal)} a month</p>
                </>
              ) : (
                <p className="mt-3 text-[16px] leading-relaxed text-rc-mist">We don't have per-category rates for this card yet, so we won't guess. Try another card.</p>
              )}
              {value.known && (
                <dl className="mt-8 space-y-3 border-t border-white/10 pt-6 text-[14px]">
                  <div className="flex justify-between"><dt className="text-rc-mist">Rewards a year</dt><dd className="tabular-nums">{formatINR(value.gross)}</dd></div>
                  <div className="flex justify-between">
                    <dt className="text-rc-mist">Annual fee</dt>
                    <dd className="tabular-nums">{value.fee === 0 ? 'None' : value.feeWaived ? <span>Waived <span className="text-rc-mist line-through">{formatINR(value.fee)}</span></span> : `−${formatINR(value.fee)}`}</dd>
                  </div>
                  {value.feeWaiverSpend && !value.feeWaived && value.fee > 0 && (
                    <p className="text-[12px] text-rc-mist">Fee is waived above {formatINR(value.feeWaiverSpend)} a year of spend.</p>
                  )}
                </dl>
              )}
            </div>
            {value.known && (
              <ul className="space-y-2.5 border-t border-white/10 bg-white/[0.03] p-7 sm:p-9">
                {value.byCategory.filter((c) => c.monthly > 0).map((c) => (
                  <li key={c.id} className="grid grid-cols-[7.5rem_1fr_auto] items-center gap-3 text-[13px]">
                    <span className="truncate text-rc-mist">{SPEND_ROWS.find((r) => r.id === c.id)?.label}</span>
                    <span className="h-1 overflow-hidden rounded-full bg-white/10"><span className="block h-full rounded-full bg-rc-pistachio" style={{ width: `${(c.yearly / maxYearly) * 100}%` }} /></span>
                    <span className="tabular-nums">{c.rate}%{c.capped ? '*' : ''} · {formatINR(c.yearly)}</span>
                  </li>
                ))}
                {value.byCategory.some((c) => c.capped) && <li className="pt-1 text-[11px] text-rc-mist">* hits the monthly cap</li>}
              </ul>
            )}
            {best && best.card.id !== card.id && (
              <div className="border-t border-white/10 p-7 sm:p-9">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-rc-mist">Best for this spend</p>
                <Link to={`/cards/${best.card.slug}`} className="group mt-3 flex items-center justify-between gap-4">
                  <span className="font-serif text-[22px] leading-snug">{displayCardName(best.card.cardName)}</span>
                  <span className="shrink-0 text-right">
                    <span className="block font-serif text-[22px] text-rc-pistachio tabular-nums">{formatINR(best.net)}</span>
                    <span className="text-[11px] text-rc-mist">net a year</span>
                  </span>
                </Link>
                <button type="button" onClick={() => setCard(best.card)} className="mt-4 inline-flex items-center gap-1.5 text-[13px] text-rc-cream underline decoration-white/30 underline-offset-4 hover:decoration-white">
                  Calculate for this card <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
            <div className="border-t border-white/10 p-7 sm:p-9">
              <ButtonLink to={SIGN_UP} variant="cream" className="w-full">Track it with your real spending</ButtonLink>
            </div>
          </div>
        }
      />
    </>
  );
}
