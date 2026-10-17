import { useParams, Link, Navigate } from 'react-router-dom';
import { ArrowRight, Plus } from 'lucide-react';
import { SEO } from '../components/SEO';
import { getCardBySlug, getDirectoryCards, getRatesFor, monthlyIncome, type PublicCardEntity } from '../lib/cardKnowledgeGraph';
import { getCreditCardProductSchema, getBreadcrumbSchema, getFAQPageSchema } from '../lib/schemaBuilders';
import { ButtonLink, Container, Eyebrow, Reveal, formatINR } from '../site/primitives';
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
    <div className="border-t border-rc-ink/10 pt-4">
      <dt className="text-[11px] uppercase tracking-[0.16em] text-rc-muted">{label}</dt>
      <dd className={muted ? 'mt-1.5 text-[15px] text-rc-muted' : 'mt-1.5 font-serif text-[24px] leading-tight text-rc-ink'}>{muted ? NOT_DISCLOSED : value}</dd>
    </div>
  );
}

export function CardDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const card = slug ? getCardBySlug(slug) : undefined;

  if (!card) return <Navigate to="/cards" replace />;

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
    <div className="w-full">
      <SEO
        title={`${name} Rewards, Fees & Benefits | RenoCred`}
        description={`${name} by ${issuer}: ${card.rewardRate}. Annual fee: ${card.formattedAnnualFee}. Lounge access: ${card.loungeAccess}.`}
        canonicalUrl={`https://renocred.com/cards/${card.slug}`}
        schemaData={[productSchema, breadcrumbSchema, getFAQPageSchema(faqs)]}
      />

      {/* hero */}
      <section className="border-b border-rc-ink/10">
        <Container className="pb-16 pt-10 lg:pb-24 lg:pt-14">
          <nav aria-label="Breadcrumb" className="mb-12 flex items-center gap-2 overflow-x-auto whitespace-nowrap text-[13px] text-rc-muted">
            <Link to="/" className="hover:text-rc-ink">Home</Link>
            <span aria-hidden>/</span>
            <Link to="/cards" className="hover:text-rc-ink">Cards</Link>
            <span aria-hidden>/</span>
            <span className="truncate text-rc-ink">{name}</span>
          </nav>
          <div className="grid items-center gap-14 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <Eyebrow>{issuer} · {card.network}</Eyebrow>
              <h1 className="mt-6 font-serif text-[clamp(2.6rem,5.4vw,4.75rem)] font-medium leading-[1] tracking-[-0.025em] text-rc-ink">{name}</h1>
              <p className="mt-6 max-w-[48ch] text-[18px] leading-relaxed text-rc-muted">{card.topBenefit}</p>
              <dl className="mt-10 grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-4">
                <Fact label="Annual fee" value={card.formattedAnnualFee === 'Free Lifetime' ? 'Free' : card.formattedAnnualFee} />
                <Fact label="Joining fee" value={card.formattedJoiningFee} />
                <Fact label="Forex markup" value={card.forexMarkup !== null ? `${card.forexMarkup}%` : NOT_DISCLOSED} />
                <Fact label="Rewards" value={card.rewardType.charAt(0).toUpperCase() + card.rewardType.slice(1)} />
              </dl>
              <div className="mt-10 flex flex-wrap gap-3">
                <ButtonLink to={SIGN_UP} size="lg">See how it fits your wallet</ButtonLink>
                <ButtonLink to="/calculators/credit-card-reward-calculator" variant="outline" size="lg" arrow={false}>Estimate rewards</ButtonLink>
              </div>
            </div>
            <div className="lg:col-span-5">
              <div className="flex aspect-[5/4] items-center justify-center rounded-[32px] bg-rc-pistachio">
                <div className="rotate-[-6deg] transition-transform duration-700 hover:rotate-0">
                  <CardFace name={card.cardName} bank={card.issuer} network={card.network} width={340} />
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* how it earns */}
      <section className="py-20 lg:py-28">
        <Container className="grid gap-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-4">
            <Eyebrow index="01">How it earns</Eyebrow>
            <h2 className="mt-5 font-serif text-[clamp(2rem,3.4vw,3rem)] font-medium leading-[1.04] tracking-[-0.02em] text-rc-ink">Where this card <span className="italic text-rc-forest">pays most.</span></h2>
          </Reveal>
          <Reveal delay={0.08} className="lg:col-span-7 lg:col-start-6">
            <p className="text-[17px] leading-relaxed text-rc-ink">{card.rewardRate}</p>
            {rates.length > 0 && (
              <ul className="mt-10 divide-y divide-rc-ink/10 border-y border-rc-ink/10">
                {rates.map((r) => (
                  <li key={r.category} className="grid grid-cols-[8rem_1fr_auto] items-center gap-5 py-4 sm:grid-cols-[10rem_1fr_auto]">
                    <span className="text-[15px] text-rc-ink">{categoryLabel(r.category)}</span>
                    <span className="h-1.5 overflow-hidden rounded-full bg-rc-ink/10">
                      <span className="block h-full rounded-full bg-rc-forest" style={{ width: `${(r.rate / topRate) * 100}%` }} />
                    </span>
                    <span className="text-right text-[15px] font-medium tabular-nums text-rc-ink">
                      {r.rate}%{r.cap ? <span className="ml-1 text-[12px] font-normal text-rc-muted">cap {formatINR(r.cap)}</span> : null}
                    </span>
                  </li>
                ))}
                {baseRate != null && (
                  <li className="grid grid-cols-[8rem_1fr_auto] items-center gap-5 py-4 sm:grid-cols-[10rem_1fr_auto]">
                    <span className="text-[15px] text-rc-muted">Everything else</span>
                    <span className="h-1.5 overflow-hidden rounded-full bg-rc-ink/10">
                      <span className="block h-full rounded-full bg-rc-sage" style={{ width: `${(baseRate / topRate) * 100}%` }} />
                    </span>
                    <span className="text-right text-[15px] tabular-nums text-rc-muted">{baseRate}%</span>
                  </li>
                )}
              </ul>
            )}
            <p className="mt-6 text-[13px] leading-relaxed text-rc-muted">Rates are value back as a share of spend, from the issuer's published terms. Exclusions and redemption values vary.</p>
          </Reveal>
        </Container>
      </section>

      {/* perks + eligibility */}
      <section className="bg-rc-paper py-20 lg:py-28">
        <Container className="grid gap-16 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <Eyebrow index="02">Perks</Eyebrow>
            <dl className="mt-8 grid gap-x-10 gap-y-8 sm:grid-cols-2">
              {perks.map((p, i) => (
                <div key={`${p.label}-${i}`} className="border-t border-rc-ink/10 pt-4">
                  <dt className="text-[11px] uppercase tracking-[0.16em] text-rc-muted">{p.label}</dt>
                  <dd className="mt-2 text-[16px] leading-relaxed text-rc-ink">{p.value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
          <Reveal delay={0.08} className="lg:col-span-4 lg:col-start-9">
            <Eyebrow index="03">Eligibility</Eyebrow>
            <div className="mt-8 rounded-[24px] bg-rc-ink p-7 text-rc-cream">
              <p className="text-[11px] uppercase tracking-[0.16em] text-rc-mist">Typical minimum income</p>
              <p className="mt-2 font-serif text-[34px] leading-none">{income ? `${formatINR(income)}` : NOT_DISCLOSED}</p>
              {income && <p className="mt-1 text-[13px] text-rc-mist">a month, about {formatINR(income * 12)} a year</p>}
              {card.eligibility?.minCreditScore && (
                <>
                  <p className="mt-7 text-[11px] uppercase tracking-[0.16em] text-rc-mist">Credit score</p>
                  <p className="mt-2 font-serif text-[34px] leading-none">{card.eligibility.minCreditScore}+</p>
                </>
              )}
              <p className="mt-7 border-t border-white/10 pt-5 text-[13px] leading-relaxed text-rc-mist">The issuer makes the final decision. Checking here never touches your credit score.</p>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* faq */}
      <section className="py-20 lg:py-28">
        <Container className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Eyebrow index="04">Questions</Eyebrow>
            <h2 className="mt-5 font-serif text-[clamp(2rem,3.4vw,3rem)] font-medium leading-[1.04] tracking-[-0.02em] text-rc-ink">About the {name}</h2>
          </div>
          <div className="lg:col-span-7 lg:col-start-6">
            {faqs.map((f, i) => (
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

      {/* similar */}
      {similar.length > 0 && (
        <section className="border-t border-rc-ink/10 py-20 lg:py-28">
          <Container>
            <div className="flex items-end justify-between gap-6">
              <h2 className="font-serif text-[clamp(2rem,3.4vw,3rem)] font-medium leading-[1.04] tracking-[-0.02em] text-rc-ink">Cards like this</h2>
              <Link to="/cards" className="hidden items-center gap-2 text-[14px] font-medium text-rc-ink underline decoration-rc-ink/25 underline-offset-[6px] hover:decoration-rc-ink sm:inline-flex">
                All cards <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <ul className="mt-12 grid gap-8 md:grid-cols-3">
              {similar.map((c) => (
                <li key={c.id}>
                  <Link to={`/cards/${c.slug}`} className="group block">
                    <div className="transition-transform duration-500 group-hover:-translate-y-1">
                      <CardFace name={c.cardName} bank={c.issuer} network={c.network} width={300} />
                    </div>
                    <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-rc-muted">{bankLabel(c.issuer)}</p>
                    <p className="mt-1.5 font-serif text-[22px] leading-snug text-rc-ink">{displayCardName(c.cardName)}</p>
                    <p className="mt-1 text-[14px] text-rc-muted">{c.annualFee === null ? 'Fee not disclosed' : c.annualFee === 0 ? 'Lifetime free' : `${formatINR(c.annualFee)} a year`}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}
    </div>
  );
}
