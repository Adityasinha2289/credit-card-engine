import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { getBreadcrumbSchema } from '../lib/schemaBuilders';
import { Container, Reveal, formatINR } from '../site/primitives';
import { PageBody, PageHero } from '../site/PageHero';
import { CardFace, displayCardName } from '../site/CardFace';
import { CATALOGUE_STATS, cardsByIds, rankCards } from '../site/swipeMath';
import { picksFor, type SpendProfile } from '../../pages/app/picks/picks';

/** The worked examples below are computed, not typed: same code as the app. */
const USE_WALLET = ['hdfc_swiggy', 'sbi_cashback', 'axis_ace', 'icici_amazon_pay'];
const GET_WALLET = ['icici_amazon_pay'];
const GET_SPEND: SpendProfile = { dining: 6000, groceries: 6000, shopping: 5000, travel: 3000, fuel: 3000, utilities: 3000 };

export function MethodologyPage() {
  const use = useMemo(() => rankCards(cardsByIds(USE_WALLET), 'dining', 2400), []);
  const get = useMemo(() => picksFor({ walletIds: GET_WALLET, profile: GET_SPEND, limit: 1 })[0], []);
  const [held] = cardsByIds(GET_WALLET);
  const monthly = Object.values(GET_SPEND).reduce((a, b) => a + (b ?? 0), 0);

  return (
    <div className="flex w-full flex-1 flex-col">
      <SEO
        title="How RenoCred Ranks Credit Cards | Methodology"
        description="How RenoCred turns issuers' published reward rates, caps and fees into rankings: which card to use for a spend, which card to get next, and where the maths stops being precise."
        canonicalUrl="https://renocred.com/methodology"
        schemaData={getBreadcrumbSchema([{ name: 'Home', item: '/' }, { name: 'Methodology', item: '/methodology' }])}
      />

      <PageHero
        eyebrow="How we rank"
        title={<>Two questions, <span className="italic">two rules.</span></>}
        lede="Which of your cards to pay with, and which card to get next. Both are worked out in rupees, from each issuer's published terms, so you can check every answer yourself."
        aside={(
          <div className="rounded-[36px] border border-white/10 bg-white/[0.04] p-7 text-rc-cream">
            <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-rc-mist">What we work from</p>
            <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-6">
              {[
                [CATALOGUE_STATS.listed, 'cards read'],
                [CATALOGUE_STATS.issuers, 'issuers'],
                [CATALOGUE_STATS.pagesRead, 'issuer pages'],
                [CATALOGUE_STATS.sourcedFacts.toLocaleString('en-IN'), 'facts, each sourced'],
              ].map(([v, k]) => (
                <div key={k}>
                  <dd className="font-serif text-[34px] font-semibold leading-none text-rc-pistachio tabular-nums">{v}</dd>
                  <dt className="mt-2 text-[13px] text-rc-mist">{k}</dt>
                </div>
              ))}
            </dl>
            <p className="mt-6 border-t border-white/10 pt-5 text-[13px] leading-relaxed text-rc-mist">Where an issuer doesn't publish a figure, we show it as not published. We never fill a gap with a guess.</p>
          </div>
        )}
      />

      <PageBody>
        {/* rule 1 */}
        <section className="py-16 lg:py-28">
          <Container className="grid gap-10 lg:grid-cols-12 lg:gap-14">
            <Reveal className="lg:col-span-6">
              <p className="font-serif text-[15px] text-rc-forest">01</p>
              <h2 className="mt-2 font-serif text-[clamp(2rem,3.6vw,3rem)] font-semibold leading-[1.05] tracking-[-0.03em] text-rc-ink">Which card <span className="italic text-rc-forest">to use</span></h2>
              <div className="rc-prose mt-6">
                <p>Each card you hold is worth <strong>the amount × its published rate for that kind of spend</strong>, or its base rate if it has none. If the issuer caps that rate each month, the value stops at the cap.</p>
                <p>The card worth the most wins. On a tie, the one with the lower annual fee goes first.</p>
                <p>Rates are value back as a share of spend, so a “5X points” card and a “5% cashback” card are compared in rupees, not points.</p>
              </div>
            </Reveal>
            <Reveal delay={0.08} className="lg:col-span-5 lg:col-start-8">
              <div className="rounded-[32px] bg-rc-ink p-6 text-rc-cream sm:p-7">
                <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-rc-mist">Dinner for two, {formatINR(2400)}</p>
                <ol className="mt-6 space-y-3.5">
                  {use.map((r, i) => (
                    <li key={r.card.id} className="flex items-center gap-4">
                      <CardFace name={r.card.name} bank={r.card.bank} width={56} lifted={false} />
                      <span className="min-w-0 flex-1 text-[14px]">
                        <span className="block truncate">{displayCardName(r.card.name)}</span>
                        <span className="text-[12px] text-rc-mist">{formatINR(2400)} × {r.rate}%</span>
                      </span>
                      <span className={i === 0 ? 'font-serif text-[24px] text-rc-pistachio tabular-nums' : 'text-[15px] tabular-nums text-rc-mist'}>{formatINR(r.reward)}</span>
                    </li>
                  ))}
                </ol>
                <p className="mt-6 border-t border-white/10 pt-4 text-[13px] text-rc-mist">Swipe the {displayCardName(use[0].card.name)}.</p>
              </div>
            </Reveal>
          </Container>
        </section>

        {/* rule 2 */}
        <section className="mx-3 rounded-[40px] bg-rc-paper py-16 sm:mx-5 lg:rounded-[56px] lg:py-28 2xl:mx-auto 2xl:max-w-[1360px]">
          <Container className="grid gap-10 lg:grid-cols-12 lg:gap-14">
            <Reveal className="lg:col-span-6">
              <p className="font-serif text-[15px] text-rc-forest">02</p>
              <h2 className="mt-2 font-serif text-[clamp(2rem,3.6vw,3rem)] font-semibold leading-[1.05] tracking-[-0.03em] text-rc-ink">Which card <span className="italic text-rc-forest">to get</span></h2>
              <div className="rc-prose mt-6">
                <p>For every card you don't hold, we work out <strong>how much more a year it would earn than your best current card</strong> on each kind of spend, add that up, and subtract its annual fee. If your yearly spend clears the issuer's waiver threshold, the fee is waived.</p>
                <p>Spend comes from what you log. Until you've logged any, we use a typical {formatINR(25000)} month leaning toward the spends you tell us matter, and we say so.</p>
                <p>If the issuer asks for more income or a higher CIBIL score than you've shared, the card stays in the list, marked with what it needs, after the ones you can get.</p>
              </div>
            </Reveal>
            <Reveal delay={0.08} className="lg:col-span-5 lg:col-start-8">
              {get && held && (
                <div className="rounded-[32px] bg-rc-pistachio p-6 text-rc-ink sm:p-7">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-rc-ink/60">Holds the {displayCardName(held.name)}, spends {formatINR(monthly)} a month</p>
                  <div className="mt-5 flex items-center gap-4">
                    <CardFace name={get.card.name} bank={get.card.bank} network={get.card.network} width={96} />
                    <p className="font-serif text-[22px] font-semibold leading-tight">{displayCardName(get.card.name)}</p>
                  </div>
                  <ul className="mt-6 space-y-2.5 text-[14px]">
                    {get.wins.slice(0, 3).map((w) => (
                      <li key={w.category} className="flex items-baseline justify-between gap-3 border-b border-dashed border-rc-ink/20 pb-2.5">
                        <span><span className="font-medium">{w.label}</span> <span className="text-rc-ink/60">{w.rate}% vs {w.yourRate}%</span></span>
                        <span className="tabular-nums">+{formatINR(w.perYear)}</span>
                      </li>
                    ))}
                    {get.wins.length > 3 && (
                      <li className="flex justify-between gap-3 border-b border-dashed border-rc-ink/20 pb-2.5 text-rc-ink/70">
                        <span>Everything else it beats</span>
                        <span className="tabular-nums">+{formatINR(get.wins.slice(3).reduce((s, w) => s + w.perYear, 0))}</span>
                      </li>
                    )}
                    <li className="flex justify-between gap-3 border-b border-dashed border-rc-ink/20 pb-2.5">
                      <span>Annual fee</span>
                      <span className="tabular-nums">{get.feeWaived ? 'waived on this spend' : get.fee ? `−${formatINR(get.fee)}` : 'none'}</span>
                    </li>
                  </ul>
                  <p className="mt-5 flex items-baseline justify-between">
                    <span className="text-[14px] font-medium">Adds a year</span>
                    <span className="font-serif text-[34px] font-semibold leading-none tabular-nums text-rc-forest">+{formatINR(get.net)}</span>
                  </p>
                </div>
              )}
            </Reveal>
          </Container>
        </section>

        {/* limits */}
        <section className="py-16 pb-28 lg:py-28 lg:pb-36">
          <Container className="grid gap-10 lg:grid-cols-12 lg:gap-14">
            <Reveal className="lg:col-span-5">
              <h2 className="font-serif text-[clamp(2rem,3.6vw,3rem)] font-semibold leading-[1.05] tracking-[-0.03em] text-rc-ink">Where it stops being <span className="italic text-rc-forest">precise</span></h2>
            </Reveal>
            <Reveal delay={0.08} className="rc-prose lg:col-span-6 lg:col-start-7">
              <ul>
                <li>Some boosted rates only apply through an issuer's portal or at named merchants.</li>
                <li>Exclusions (wallet loads, rent, fuel on some cards) and how you redeem points change real returns.</li>
                <li>Issuers change terms, and our data can lag behind for a while.</li>
                <li>Approval is always the issuer's decision.</li>
              </ul>
              <p>Commissions never change a ranking; see our <Link to="/affiliate-disclosure">affiliate disclosure</Link>. Check the issuer's terms before you apply, and read the <Link to="/disclaimer">disclaimer</Link>.</p>
            </Reveal>
          </Container>
        </section>
      </PageBody>
    </div>
  );
}
