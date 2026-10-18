import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { FAQSchema } from '../components/FAQSchema';
import { getBreadcrumbSchema } from '../lib/schemaBuilders';
import { Container, Eyebrow, Reveal, formatINR } from '../site/primitives';
import { PageBody, PageHero } from '../site/PageHero';
import { Accordion } from '../site/Accordion';
import { CardFace, displayCardName } from '../site/CardFace';
import { CATALOGUE_STATS, cardsByIds, rankCards } from '../site/swipeMath';

const METHODOLOGY_FAQS = [
  {
    question: 'How does RenoCred evaluate credit cards?',
    answer: "From each card's published terms: fees, fee-waiver thresholds, reward rates by spending category, monthly caps and minimum income and credit score. For a purchase, we rank your cards by the rupee value each would return. For new cards, we weigh reward rates on the categories you spend most on, fees and waivers, lounge access and welcome benefits, and filter out cards whose published eligibility is above what you have shared.",
  },
  {
    question: 'Is RenoCred a financial advisor?',
    answer: 'No. RenoCred is an informational and analytical tool, not a licensed financial advisor. Verify product details with the issuing bank before making a financial decision.',
  },
  {
    question: 'Where does the card data come from?',
    answer: `From each issuer's own published terms. So far we have read ${CATALOGUE_STATS.cards} cards from ${CATALOGUE_STATS.issuers} issuers. Where an issuer has not published a figure, we show it as not disclosed rather than estimating it. If you spot something out of date, tell us.`,
  },
  {
    question: 'Does checking cards affect my credit score?',
    answer: 'No. RenoCred never pulls your credit report. Eligibility checks compare the income and score range you choose to share with each card\'s published minimums.',
  },
  {
    question: 'Do partner commissions change the rankings?',
    answer: 'No. Rankings come from the data and your inputs. Our affiliate disclosure explains where we may earn money.',
  },
];

const PRINCIPLES = [
  { k: 'Published terms only', v: 'Every rate, cap and fee comes from the issuer. Missing figures are shown as not disclosed, never filled in with a guess.' },
  { k: 'Your numbers, not averages', v: 'Values are worked out on the spend you enter, so a travel card can rightly lose to a cashback card for someone who rarely flies.' },
  { k: 'Fees count', v: 'A card is only worth what it returns after its annual fee, unless your spend clears the waiver threshold.' },
];

export function MethodologyPage() {
  const example = useMemo(() => rankCards(cardsByIds(['hdfc_swiggy', 'sbi_cashback', 'axis_ace', 'icici_amazon_pay']), 'dining', 2400), []);

  return (
    <div className="flex w-full flex-1 flex-col">
      <SEO
        title="How RenoCred Ranks Credit Cards | Methodology"
        description="How RenoCred turns issuers' published reward rates, caps and fees into card rankings: the data, the maths and the limits."
        canonicalUrl="https://renocred.com/methodology"
        schemaData={getBreadcrumbSchema([{ name: 'Home', item: '/' }, { name: 'Methodology', item: '/methodology' }])}
      />
      <FAQSchema items={METHODOLOGY_FAQS} />

      <PageHero
        eyebrow="Methodology"
        title={<>How we rank <span className="italic">cards.</span></>}
        lede="Rules you can check, not a black box. Here is the data we use, the maths behind each answer, and where it stops being precise."
        aside={(
          <div className="rounded-[40px] bg-rc-pistachio p-8 text-rc-ink">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-rc-ink/55">The whole rule, for one swipe</p>
            <p className="mt-6 font-serif text-[clamp(2rem,3.2vw,2.9rem)] font-semibold leading-[1.15] tracking-[-0.02em] tabular-nums">
              {formatINR(2400)} <span className="text-rc-ink/40">×</span> {example[0].rate}%
              <br /><span className="text-rc-ink/40">=</span> <span className="rounded-[0.2em] bg-rc-ink px-[0.2em] text-rc-pistachio">{formatINR(example[0].reward)}</span>
            </p>
            <p className="mt-6 text-[14px] leading-relaxed text-rc-ink/70">Dinner for two on the {displayCardName(example[0].card.name)}: spend times the card's published rate for dining, capped where the issuer caps it.</p>
          </div>
        )}
      />

      <PageBody>
      <section className="py-20 lg:py-28">
        <Container className="grid gap-4 md:grid-cols-3">
          {PRINCIPLES.map((p, i) => (
            <Reveal key={p.k} delay={i * 0.06} className="rounded-[28px] border border-rc-ink/10 bg-rc-paper p-7">
              <p className="text-[12px] tabular-nums text-rc-muted">{String(i + 1).padStart(2, '0')}</p>
              <p className="mt-4 font-serif text-[26px] font-semibold leading-tight text-rc-ink">{p.k}</p>
              <p className="mt-3 text-[15px] leading-relaxed text-rc-muted">{p.v}</p>
            </Reveal>
          ))}
        </Container>
      </section>

      <section className="mx-3 rounded-[40px] bg-rc-paper py-20 sm:mx-5 lg:rounded-[56px] lg:py-28 2xl:mx-auto 2xl:max-w-[1360px]">
        <Container className="grid gap-14 lg:grid-cols-12">
          <Reveal className="rc-prose lg:col-span-6">
            <h2>Which card to use</h2>
            <p>For a purchase, each card you hold is worth <strong>the amount × its reward rate for that category</strong>, or its base rate if it has no category rate. If the issuer publishes a monthly cap for that category, the value is capped there.</p>
            <p>The card with the highest value wins. When two cards tie, the one with the lower annual fee goes first.</p>
            <p>Rates are the effective value back as a share of spend, so a "5X points" card and a "5% cashback" card are compared in rupees, not in points.</p>
          </Reveal>
          <Reveal delay={0.08} className="lg:col-span-5 lg:col-start-8">
            <div className="rounded-[32px] bg-rc-ink p-7 text-rc-cream">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-rc-mist">Worked example · dinner, {formatINR(2400)}</p>
              <ol className="mt-6 space-y-3">
                {example.map((r, i) => (
                  <li key={r.card.id} className="flex items-center gap-4">
                    <CardFace name={r.card.name} bank={r.card.bank} width={56} lifted={false} />
                    <span className="min-w-0 flex-1 text-[14px]">
                      <span className="block truncate">{displayCardName(r.card.name)}</span>
                      <span className="text-[12px] text-rc-mist">{formatINR(2400)} × {r.rate}%</span>
                    </span>
                    <span className={i === 0 ? 'font-serif text-[22px] text-rc-pistachio tabular-nums' : 'text-[15px] tabular-nums text-rc-mist'}>{formatINR(r.reward)}</span>
                  </li>
                ))}
              </ol>
            </div>
          </Reveal>
        </Container>
      </section>

      <section className="py-20 lg:py-28">
        <Container className="grid gap-14 lg:grid-cols-12">
          <Reveal className="rc-prose lg:col-span-6">
            <h2>Which card to get</h2>
            <p>Card suggestions in the app weigh a card's reward rates on the categories you spend most on, its annual fee and fee-waiver terms, lounge access and welcome benefits.</p>
            <p>Cards whose published minimum income or credit score is above what you have shared are left out. If you have not shared them, the card stays in with a note that eligibility was not checked.</p>
            <h3>On this website's tools</h3>
            <p>The <Link to="/calculators/credit-card-reward-calculator">reward calculator</Link> and the "best on the market" answers add up a year of capped rewards across your categories and subtract the annual fee, unless your yearly spend clears the waiver threshold.</p>
          </Reveal>
          <Reveal delay={0.08} className="rc-prose lg:col-span-5 lg:col-start-8">
            <h2>Where it stops being precise</h2>
            <ul>
              <li>Some accelerated rates only apply through an issuer's portal or with specific merchants.</li>
              <li>Exclusions (wallet loads, rent, fuel on some cards) and points redemption choices change real returns.</li>
              <li>Issuers change terms; there can be a lag before our data reflects it.</li>
              <li>Approval is always the issuer's decision.</li>
            </ul>
            <p>Check the issuer's terms before you apply. Read our <Link to="/disclaimer">financial disclaimer</Link>.</p>
          </Reveal>
        </Container>
      </section>

      <section className="pb-28 lg:pb-36">
        <Container className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Eyebrow>Questions</Eyebrow>
            <h2 className="mt-5 font-serif text-[clamp(2.2rem,3.8vw,3.4rem)] font-semibold leading-[1.02] tracking-[-0.03em] text-rc-ink">Asked, <span className="italic text-rc-forest">answered.</span></h2>
          </div>
          <Accordion className="lg:col-span-7 lg:col-start-6" items={METHODOLOGY_FAQS} />
        </Container>
      </section>
      </PageBody>
    </div>
  );
}
