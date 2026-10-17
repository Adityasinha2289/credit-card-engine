import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { SEO } from '../components/SEO';
import { FAQSchema } from '../components/FAQSchema';
import { getBreadcrumbSchema } from '../lib/schemaBuilders';
import { Container, Display, Eyebrow, Reveal, formatINR } from '../site/primitives';
import { CardFace, displayCardName } from '../site/CardFace';
import { CATALOG_STATS, cardsByIds, rankCards } from '../site/swipeMath';

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
    answer: `From issuers' published terms for the ${CATALOG_STATS.cards} cards we cover. Where an issuer has not published a figure, we show it as not disclosed rather than estimating it. If you spot something out of date, tell us.`,
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
    <>
      <SEO
        title="How RenoCred Ranks Credit Cards | Methodology"
        description="How RenoCred turns issuers' published reward rates, caps and fees into card rankings: the data, the maths and the limits."
        canonicalUrl="https://renocred.com/methodology"
        schemaData={getBreadcrumbSchema([{ name: 'Home', item: '/' }, { name: 'Methodology', item: '/methodology' }])}
      />
      <FAQSchema items={METHODOLOGY_FAQS} />

      <section className="border-b border-rc-ink/10">
        <Container className="pb-20 pt-16 lg:pb-28 lg:pt-24">
          <Eyebrow>Methodology</Eyebrow>
          <Display as="h1" size="xl" className="mt-7 max-w-[13ch] text-rc-ink">How we rank <span className="italic text-rc-forest">cards.</span></Display>
          <p className="mt-9 max-w-[54ch] text-[19px] leading-relaxed text-rc-muted">
            Rules you can check, not a black box. Here is the data we use, the maths behind each answer, and where it stops being precise.
          </p>
        </Container>
      </section>

      <section className="py-20 lg:py-28">
        <Container className="grid gap-10 md:grid-cols-3">
          {PRINCIPLES.map((p, i) => (
            <Reveal key={p.k} delay={i * 0.06} className="border-t border-rc-ink/15 pt-6">
              <p className="text-[12px] tabular-nums text-rc-muted">{String(i + 1).padStart(2, '0')}</p>
              <p className="mt-4 font-serif text-[26px] leading-tight text-rc-ink">{p.k}</p>
              <p className="mt-3 text-[15px] leading-relaxed text-rc-muted">{p.v}</p>
            </Reveal>
          ))}
        </Container>
      </section>

      <section className="bg-rc-paper py-20 lg:py-28">
        <Container className="grid gap-14 lg:grid-cols-12">
          <Reveal className="rc-prose lg:col-span-6">
            <h2>Which card to use</h2>
            <p>For a purchase, each card you hold is worth <strong>the amount × its reward rate for that category</strong>, or its base rate if it has no category rate. If the issuer publishes a monthly cap for that category, the value is capped there.</p>
            <p>The card with the highest value wins. When two cards tie, the one with the lower annual fee goes first.</p>
            <p>Rates are the effective value back as a share of spend, so a "5X points" card and a "5% cashback" card are compared in rupees, not in points.</p>
          </Reveal>
          <Reveal delay={0.08} className="lg:col-span-5 lg:col-start-8">
            <div className="rounded-[24px] bg-rc-ink p-7 text-rc-cream">
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

      <section className="border-t border-rc-ink/10 py-20 lg:py-28">
        <Container className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Eyebrow>Questions</Eyebrow>
          </div>
          <div className="lg:col-span-7 lg:col-start-6">
            {METHODOLOGY_FAQS.map((f, i) => (
              <details key={f.question} open={i === 0} className="group border-b border-rc-ink/10 first:border-t">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 [&::-webkit-details-marker]:hidden">
                  <span className="text-[17px] font-medium text-rc-ink">{f.question}</span>
                  <Plus className="h-4 w-4 shrink-0 text-rc-ink transition-transform duration-300 group-open:rotate-45" />
                </summary>
                <p className="pb-6 pr-10 text-[16px] leading-relaxed text-rc-muted">{f.answer}</p>
              </details>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
