import { useParams, Navigate } from 'react-router-dom';
import { SiteLink as Link, useSitePath } from '../site/SiteLink';
import { motion, useReducedMotion } from 'framer-motion';
import { SEO } from '../components/SEO';
import { getCardBySlug, getDirectoryCards, getRatesFor, monthlyIncome, type PublicCardEntity } from '../lib/cardKnowledgeGraph';
import { getCreditCardProductSchema, getBreadcrumbSchema, getFAQPageSchema } from '../lib/schemaBuilders';
import { ArrowLink, ButtonLink, Container, EASE_OUT, Eyebrow, Reveal, formatINR, useMediaQuery } from '../site/primitives';
import { PageBody, PageHero } from '../site/PageHero';
import { TiltCard } from '../site/TiltCard';
import { Accordion } from '../site/Accordion';
import { CardFace, displayCardName } from '../site/CardFace';
import { bankLabel } from '../site/banks';
import { SPEND_CATEGORIES } from '../site/swipeMath';
import { SIGN_UP } from '../site/nav';

const NOT_DISCLOSED = 'Not disclosed';

const categoryLabel = (id: string) =>
  SPEND_CATEGORIES.find((c) => c.id === id)?.label ?? id.charAt(0).toUpperCase() + id.slice(1);

function hasLounge(text: string) {
  return !!text && !/^(none|no complimentary)/i.test(text.trim());
}

function buildFaqs(card: PublicCardEntity) {
  const name = displayCardName(card.cardName);
  const income = monthlyIncome(card.eligibility?.minSalary);
  return [
    {
      question: `What is the annual fee for ${name}?`,
      answer: card.annualFee === null
        ? `${bankLabel(card.issuer)} has not published an annual fee for ${name}. Check the issuer's site before applying.`
        : card.annualFee === 0
          ? `${name} is lifetime free: there is no annual fee.`
          : `The annual fee for ${name} is ${formatINR(card.annualFee)}.${card.joiningFee != null ? ` The joining fee is ${card.joiningFee === 0 ? 'nil' : formatINR(card.joiningFee)}.` : ''}`,
    },
    {
      question: `What is the reward rate on ${name}?`,
      answer: `The reward structure for ${name} is: ${card.rewardRate}.`,
    },
    {
      question: `Does ${name} offer lounge access?`,
      answer: hasLounge(card.loungeAccess) ? `Yes: ${card.loungeAccess}.` : `${name} does not include complimentary lounge access.`,
    },
    {
      question: `What income do I need for ${name}?`,
      answer: income
        ? `${bankLabel(card.issuer)} typically looks for an income of about ${formatINR(income)} a month (around ${formatINR(income * 12)} a year). The issuer makes the final decision.`
        : `${bankLabel(card.issuer)} has not published a minimum income for ${name}; its standard eligibility criteria apply.`,
    },
  ];
}

function Fact({ label, value }: { label: string; value: string }) {
  const muted = value === NOT_DISCLOSED || value === 'Not Disclosed';
  return (
    <div className="rounded-[24px] border border-rc-ink/10 bg-rc-paper px-5 py-5">
      <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-rc-muted">{label}</dt>
      <dd className={muted ? 'mt-2 text-[15px] text-rc-muted' : 'mt-2 font-serif text-[28px] font-semibold leading-none tracking-[-0.02em] text-rc-ink'}>{muted ? NOT_DISCLOSED : value}</dd>
    </div>
  );
}

/** A rate bar that fills when it scrolls into view. */
function RateBar({ share, tone }: { share: number; tone: 'forest' | 'sage' }) {
  const reduce = useReducedMotion();
  return (
    <span className="h-2 overflow-hidden rounded-full bg-rc-ink/10">
      <motion.span
        className={tone === 'forest' ? 'block h-full rounded-full bg-rc-forest' : 'block h-full rounded-full bg-rc-sage'}
        initial={reduce ? false : { width: 0 }}
        whileInView={{ width: `${share * 100}%` }}
        viewport={{ once: true, margin: '0px 0px -10% 0px' }}
        transition={{ duration: 1.1, ease: EASE_OUT }}
        style={reduce ? { width: `${share * 100}%` } : undefined}
      />
    </span>
  );
}

export function CardDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const card = slug ? getCardBySlug(slug) : undefined;
  const sitePath = useSitePath();
  const wide = useMediaQuery('(min-width: 640px)');

  if (!card) return <Navigate to={sitePath('/cards')} replace />;

  const name = displayCardName(card.cardName);
  const issuer = bankLabel(card.issuer);
  const faqs = buildFaqs(card);
  const income = monthlyIncome(card.eligibility?.minSalary);
  const similar = getDirectoryCards()
    .filter((c) => c.id !== card.id && c.categories.some((cat) => card.categories.includes(cat)))
    .sort((a, b) => Math.abs((a.annualFee ?? 0) - (card.annualFee ?? 0)) - Math.abs((b.annualFee ?? 0) - (card.annualFee ?? 0)))
    .slice(0, 3);
  const rateData = getRatesFor(card);
  const baseRate = rateData?.baseRate ?? null;
  const rates = (rateData?.rates ?? []).filter((r) => r.rate > 0).sort((a, b) => b.rate - a.rate);
  const topRate = Math.max(...rates.map((r) => r.rate), baseRate ?? 0, 1);
  const perks = [
    { label: 'Lounge access', value: hasLounge(card.loungeAccess) ? card.loungeAccess : 'None' },
    { label: 'Fuel', value: card.fuelBenefits },
    ...card.welcomeBenefits.map((w) => ({ label: 'Welcome benefit', value: w })),
    ...card.milestoneBenefits.map((m) => ({ label: 'Milestone', value: m })),
  ];

  const productSchema = getCreditCardProductSchema({
    name: card.cardName,
    issuer: card.issuer,
    annualFee: card.annualFee,
    joiningFee: card.joiningFee,
    rewardRate: card.rewardRate,
    network: card.network,
    perksSummary: card.topBenefit,
  });
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', item: '/' },
    { name: 'Credit Cards Directory', item: '/cards' },
    { name: card.cardName, item: `/cards/${card.slug}` },
  ]);

  return (
    <div className="flex w-full flex-1 flex-col">
      <SEO
        title={`${name} Rewards, Fees & Benefits | RenoCred`}
        description={`${name} by ${issuer}: ${card.rewardRate}. Annual fee: ${card.formattedAnnualFee}. Lounge access: ${card.loungeAccess}.`}
        canonicalUrl={`https://renocred.com/cards/${card.slug}`}
        schemaData={[productSchema, breadcrumbSchema, getFAQPageSchema(faqs)]}
      />

      <PageHero
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Cards', to: '/cards' }, { label: name }]}
        eyebrow={`${issuer} · ${card.network}`}
        title={name}
        lede={card.topBenefit}
        actions={(
          <>
            <ButtonLink to={SIGN_UP} variant="cream" size="lg">See how it fits your wallet</ButtonLink>
            <ButtonLink to="/calculators/credit-card-reward-calculator" variant="outline-cream" size="lg" arrow={false}>Estimate rewards</ButtonLink>
          </>
        )}
        aside={(
          <div className="relative flex aspect-[5/4] items-center justify-center overflow-hidden rounded-[40px] bg-rc-pistachio">
            <div aria-hidden className="absolute inset-0 bg-[radial-gradient(60%_55%_at_50%_42%,rgba(255,255,255,0.8),transparent)]" />
            <div aria-hidden className="absolute bottom-[16%] left-1/2 h-10 w-[62%] -translate-x-1/2 rounded-[50%] bg-rc-ink/25 blur-2xl" />
            <div className="relative">
              <TiltCard name={card.cardName} bank={card.issuer} network={card.network} width={wide ? 330 : 240} />
            </div>
            <p className="absolute bottom-5 left-0 right-0 hidden text-center lg:block text-[11px] font-semibold uppercase tracking-[0.18em] text-rc-ink/45">Move your pointer over the card</p>
          </div>
        )}
      />

      <PageBody>
        {/* the numbers people look for first */}
        <Container className="pt-12 lg:pt-16">
          <Reveal>
            <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <Fact label="Annual fee" value={card.formattedAnnualFee === 'Free Lifetime' ? 'Free' : card.formattedAnnualFee} />
              <Fact label="Joining fee" value={card.formattedJoiningFee} />
              <Fact label="Forex markup" value={card.forexMarkup !== null ? `${card.forexMarkup}%` : NOT_DISCLOSED} />
              <Fact label="Rewards" value={card.rewardType.charAt(0).toUpperCase() + card.rewardType.slice(1)} />
            </dl>
          </Reveal>
        </Container>

        {/* how it earns */}
        <section className="py-20 lg:py-28">
          <Container className="grid gap-12 lg:grid-cols-12">
            <Reveal className="lg:col-span-4">
              <Eyebrow index="01">How it earns</Eyebrow>
              <h2 className="mt-5 font-serif text-[clamp(2.2rem,3.8vw,3.4rem)] font-semibold leading-[1.02] tracking-[-0.03em] text-rc-ink">Where this card <span className="italic text-rc-forest">pays most.</span></h2>
            </Reveal>
            <Reveal delay={0.08} className="lg:col-span-7 lg:col-start-6">
              <p className="text-[17px] leading-relaxed text-rc-ink">{card.rewardRate}</p>
              {rates.length > 0 && (
                <ul className="mt-10 space-y-2">
                  {rates.map((r) => (
                    <li key={r.category} className="grid grid-cols-[7.5rem_1fr_auto] items-center gap-5 rounded-2xl bg-rc-paper px-5 py-4 sm:grid-cols-[10rem_1fr_auto]">
                      <span className="text-[15px] text-rc-ink">{categoryLabel(r.category)}</span>
                      <RateBar share={r.rate / topRate} tone="forest" />
                      <span className="text-right font-serif text-[20px] font-semibold tabular-nums text-rc-ink">
                        {r.rate}%{r.cap ? <span className="ml-1 font-sans text-[12px] font-normal text-rc-muted">cap {formatINR(r.cap)}</span> : null}
                      </span>
                    </li>
                  ))}
                  {baseRate != null && (
                    <li className="grid grid-cols-[7.5rem_1fr_auto] items-center gap-5 rounded-2xl border border-rc-ink/10 px-5 py-4 sm:grid-cols-[10rem_1fr_auto]">
                      <span className="text-[15px] text-rc-muted">Everything else</span>
                      <RateBar share={baseRate / topRate} tone="sage" />
                      <span className="text-right font-serif text-[20px] tabular-nums text-rc-muted">{baseRate}%</span>
                    </li>
                  )}
                </ul>
              )}
              <p className="mt-6 text-[13px] leading-relaxed text-rc-muted">Rates are value back as a share of spend, from the issuer's published terms. Exclusions and redemption values vary.</p>
            </Reveal>
          </Container>
        </section>

        {/* perks + eligibility */}
        <section className="pb-20 lg:pb-28">
          <Container className="grid gap-16 lg:grid-cols-12">
            <Reveal className="lg:col-span-7">
              <Eyebrow index="02">Perks</Eyebrow>
              <dl className="mt-8 grid gap-3 sm:grid-cols-2">
                {perks.map((p, i) => (
                  <div key={`${p.label}-${i}`} className="rounded-[24px] border border-rc-ink/10 bg-rc-paper p-5 transition-colors hover:border-rc-ink/25">
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-rc-muted">{p.label}</dt>
                    <dd className="mt-2 text-[16px] leading-relaxed text-rc-ink">{p.value}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
            <Reveal delay={0.08} className="lg:col-span-4 lg:col-start-9">
              <Eyebrow index="03">Eligibility</Eyebrow>
              <div className="relative mt-8 overflow-hidden rounded-[32px] bg-rc-ink p-7 text-rc-cream">
                <div aria-hidden className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[radial-gradient(closest-side,rgba(227,238,212,0.18),transparent)]" />
                <p className="relative text-[11px] font-semibold uppercase tracking-[0.16em] text-rc-mist">Typical minimum income</p>
                <p className="relative mt-2 font-serif text-[40px] font-semibold leading-none text-rc-pistachio">{income ? `${formatINR(income)}` : NOT_DISCLOSED}</p>
                {income && <p className="relative mt-1.5 text-[13px] text-rc-mist">a month, about {formatINR(income * 12)} a year</p>}
                {card.eligibility?.minCreditScore && (
                  <>
                    <p className="relative mt-7 text-[11px] font-semibold uppercase tracking-[0.16em] text-rc-mist">Credit score</p>
                    <p className="relative mt-2 font-serif text-[40px] font-semibold leading-none">{card.eligibility.minCreditScore}+</p>
                  </>
                )}
                <p className="relative mt-7 border-t border-white/10 pt-5 text-[13px] leading-relaxed text-rc-mist">The issuer makes the final decision. Checking here never touches your credit score.</p>
              </div>
            </Reveal>
          </Container>
        </section>

        {/* faq */}
        <section className="pb-20 lg:pb-28">
          <Container className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <Eyebrow index="04">Questions</Eyebrow>
              <h2 className="mt-5 font-serif text-[clamp(2.2rem,3.8vw,3.4rem)] font-semibold leading-[1.02] tracking-[-0.03em] text-rc-ink">About the {name}</h2>
            </div>
            <Accordion className="lg:col-span-7 lg:col-start-6" items={faqs} />
          </Container>
        </section>

        {/* similar */}
        {similar.length > 0 && (
          <section className="relative z-10 rounded-t-[40px] bg-rc-ink py-20 text-rc-cream lg:rounded-t-[56px] lg:py-28">
            <Container>
              <div className="flex items-end justify-between gap-6">
                <div>
                  <Eyebrow tone="cream">Keep looking</Eyebrow>
                  <h2 className="mt-5 font-serif text-[clamp(2.2rem,3.8vw,3.4rem)] font-semibold leading-[1.02] tracking-[-0.03em]">Cards like this</h2>
                </div>
                <ArrowLink to="/cards" tone="cream" className="hidden sm:inline-flex">All cards</ArrowLink>
              </div>
              <ul className="mt-12 grid gap-4 md:grid-cols-3">
                {similar.map((c, i) => (
                  <Reveal as="li" key={c.id} delay={i * 0.08}>
                    <Link to={`/cards/${c.slug}`} className="group block rounded-[32px] border border-white/10 bg-white/[0.03] p-6 transition-colors hover:border-white/25 hover:bg-white/[0.06]">
                      <div className="flex justify-center py-4">
                        <div className="transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:-translate-y-2 group-hover:rotate-[-3deg]">
                          <CardFace name={c.cardName} bank={c.issuer} network={c.network} width={260} />
                        </div>
                      </div>
                      <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-rc-mist">{bankLabel(c.issuer)}</p>
                      <p className="mt-1.5 font-serif text-[22px] leading-snug">{displayCardName(c.cardName)}</p>
                      <p className="mt-1 text-[14px] text-rc-mist">{c.annualFee === null ? 'Fee not disclosed' : c.annualFee === 0 ? 'Lifetime free' : `${formatINR(c.annualFee)} a year`}</p>
                    </Link>
                  </Reveal>
                ))}
              </ul>
            </Container>
          </section>
        )}
      </PageBody>
    </div>
  );
}
