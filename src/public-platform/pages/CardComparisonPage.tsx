import { useParams, Link, Navigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { SEO } from '../components/SEO';
import { getComparisonPairBySlug, getPopularComparisons, getRatesFor, monthlyIncome, type PublicCardEntity } from '../lib/cardKnowledgeGraph';
import { getBreadcrumbSchema, getOrganizationSchema, getWebSiteSchema } from '../lib/schemaBuilders';
import { cn } from '../../lib/utils';
import { ButtonLink, Container, Eyebrow, Reveal, formatINR, useMediaQuery } from '../site/primitives';
import { CardFace, displayCardName } from '../site/CardFace';
import { bankLabel } from '../site/banks';
import { SPEND_CATEGORIES } from '../site/swipeMath';
import { SIGN_UP } from '../site/nav';

const fee = (c: PublicCardEntity) => (c.annualFee === null ? 'Not disclosed' : c.annualFee === 0 ? 'Lifetime free' : formatINR(c.annualFee));
const label = (id: string) => SPEND_CATEGORIES.find((c) => c.id === id)?.label ?? id.charAt(0).toUpperCase() + id.slice(1);

function Row({ name, a, b, better }: { name: string; a: string; b: string; better?: 'a' | 'b' | null }) {
  const cell = (v: string, win: boolean) => (
    <td className={cn('px-4 py-4 align-top text-[15px] leading-relaxed sm:px-6', win ? 'font-medium text-rc-ink' : 'text-rc-ink/80', v === 'Not disclosed' && 'text-rc-muted')}>
      {v}
      {win && <span className="ml-2 inline-block rounded-full bg-rc-pistachio px-2 py-0.5 align-middle text-[10px] font-semibold uppercase tracking-[0.12em] text-rc-forest">Better</span>}
    </td>
  );
  return (
    <tr className="border-b border-rc-ink/10 last:border-0">
      <th scope="row" className="w-[26%] px-4 py-4 text-left align-top text-[13px] font-normal text-rc-muted sm:px-6">{name}</th>
      {cell(a, better === 'a')}
      {cell(b, better === 'b')}
    </tr>
  );
}

export function CardComparisonPage() {
  // routed as /compare/:categoryOrPairSlug (CompareRouter decides hub vs. pair)
  const { categoryOrPairSlug } = useParams<{ categoryOrPairSlug: string }>();
  const pair = categoryOrPairSlug ? getComparisonPairBySlug(categoryOrPairSlug) : undefined;
  const wide = useMediaQuery('(min-width: 640px)');

  if (!pair) return <Navigate to="/cards" replace />;

  const { cardA, cardB, canonicalUrl, verdict } = pair;
  const nameA = displayCardName(cardA.cardName);
  const nameB = displayCardName(cardB.cardName);
  const ratesA = getRatesFor(cardA);
  const ratesB = getRatesFor(cardB);
  const categories = [...new Set([...(ratesA?.rates ?? []), ...(ratesB?.rates ?? [])].map((r) => r.category))];
  const rateOf = (r: typeof ratesA, cat: string) => r?.rates.find((x) => x.category === cat)?.rate ?? r?.baseRate ?? null;
  const pick = (a: number | null, b: number | null, higherWins = true): 'a' | 'b' | null => {
    if (a == null || b == null || a === b) return null;
    return (a > b) === higherWins ? 'a' : 'b';
  };
  const incomeA = monthlyIncome(cardA.eligibility?.minSalary);
  const incomeB = monthlyIncome(cardB.eligibility?.minSalary);
  const others = getPopularComparisons().filter((c) => c.slug !== pair.pairSlug).slice(0, 4);

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', item: '/' },
    { name: 'Credit Cards Directory', item: '/cards' },
    { name: `${cardA.cardName} vs ${cardB.cardName}`, item: `/compare/${pair.pairSlug}` },
  ]);

  return (
    <div className="w-full">
      <SEO
        title={`${nameA} vs ${nameB}: Fees, Rewards & Perks Compared | RenoCred`}
        description={`Compare ${nameA} and ${nameB} side by side: annual fees (${cardA.formattedAnnualFee} vs ${cardB.formattedAnnualFee}), reward rates, lounge access and eligibility.`}
        canonicalUrl={canonicalUrl}
        schemaData={[getOrganizationSchema(), getWebSiteSchema(), breadcrumbSchema]}
      />

      <header className="border-b border-rc-ink/10">
        <Container className="pb-16 pt-10 lg:pb-24 lg:pt-14">
          <nav aria-label="Breadcrumb" className="mb-12 flex items-center gap-2 overflow-x-auto whitespace-nowrap text-[13px] text-rc-muted">
            <Link to="/" className="hover:text-rc-ink">Home</Link><span aria-hidden>/</span>
            <Link to="/cards" className="hover:text-rc-ink">Cards</Link><span aria-hidden>/</span>
            <span className="truncate text-rc-ink">{nameA} vs {nameB}</span>
          </nav>
          <Eyebrow>Head to head</Eyebrow>
          <h1 className="mt-6 font-serif text-[clamp(2.4rem,5vw,4.5rem)] font-medium leading-[1.02] tracking-[-0.025em] text-rc-ink">
            {nameA} <span className="italic text-rc-sage">vs</span> {nameB}
          </h1>
          <div className="mt-14 grid grid-cols-2 gap-6 sm:gap-10">
            {[cardA, cardB].map((c) => (
              <Link key={c.id} to={`/cards/${c.slug}`} className="group flex flex-col items-center rounded-[28px] bg-rc-paper px-4 py-10 transition-colors hover:bg-white sm:py-14">
                <div className="transition-transform duration-500 group-hover:-translate-y-1">
                  <CardFace name={c.cardName} bank={c.issuer} network={c.network} width={wide ? 300 : 140} />
                </div>
                <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-rc-muted sm:mt-8">{bankLabel(c.issuer)}</p>
                <p className="mt-1.5 text-center font-serif text-[20px] leading-snug text-rc-ink sm:text-[24px]">{displayCardName(c.cardName)}</p>
                <p className="mt-1 text-[14px] text-rc-muted">{fee(c)}{c.annualFee ? ' a year' : ''}</p>
              </Link>
            ))}
          </div>
        </Container>
      </header>

      <section className="py-16 lg:py-24">
        <Container className="grid gap-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-4">
            <Eyebrow index="01">The short answer</Eyebrow>
            <p className="mt-6 font-serif text-[clamp(1.35rem,2vw,1.75rem)] leading-[1.3] text-rc-ink">{verdict}</p>
          </Reveal>
          <Reveal delay={0.08} className="lg:col-span-8">
            <div className="overflow-x-auto rounded-[24px] border border-rc-ink/10 bg-rc-paper">
              <table className="w-full min-w-[560px] border-collapse">
                <thead>
                  <tr className="border-b border-rc-ink/10">
                    <th className="px-4 py-4 sm:px-6"><span className="sr-only">Feature</span></th>
                    <th scope="col" className="px-4 py-4 text-left font-serif text-[18px] font-normal text-rc-ink sm:px-6">{nameA}</th>
                    <th scope="col" className="px-4 py-4 text-left font-serif text-[18px] font-normal text-rc-ink sm:px-6">{nameB}</th>
                  </tr>
                </thead>
                <tbody>
                  <Row name="Annual fee" a={fee(cardA)} b={fee(cardB)} better={pick(cardA.annualFee, cardB.annualFee, false)} />
                  <Row name="Network" a={cardA.network} b={cardB.network} />
                  {categories.map((cat) => {
                    const a = rateOf(ratesA, cat);
                    const b = rateOf(ratesB, cat);
                    return <Row key={cat} name={`${label(cat)} rate`} a={a != null ? `${a}%` : 'Not disclosed'} b={b != null ? `${b}%` : 'Not disclosed'} better={pick(a, b)} />;
                  })}
                  <Row name="Rewards, in their words" a={cardA.rewardRate} b={cardB.rewardRate} />
                  <Row name="Lounge access" a={cardA.loungeAccess} b={cardB.loungeAccess} />
                  <Row name="Forex markup" a={cardA.forexMarkup != null ? `${cardA.forexMarkup}%` : 'Not disclosed'} b={cardB.forexMarkup != null ? `${cardB.forexMarkup}%` : 'Not disclosed'} better={pick(cardA.forexMarkup, cardB.forexMarkup, false)} />
                  <Row name="Typical income" a={incomeA ? `${formatINR(incomeA)} a month` : 'Not disclosed'} b={incomeB ? `${formatINR(incomeB)} a month` : 'Not disclosed'} />
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-[13px] leading-relaxed text-rc-muted">"Better" marks the higher reward rate, or the lower fee or markup. Rates are value back as a share of spend from issuers' published terms.</p>
          </Reveal>
        </Container>
      </section>

      <section className="bg-rc-ink py-20 text-rc-cream lg:py-24">
        <Container className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <p className="max-w-[22ch] font-serif text-[clamp(2rem,3.6vw,3.25rem)] leading-[1.05]">The right pick depends on <span className="italic text-rc-pistachio">how you spend.</span></p>
          <ButtonLink to={SIGN_UP} variant="cream" size="lg">Compare with your spending</ButtonLink>
        </Container>
      </section>

      {others.length > 0 && (
        <section className="py-16 lg:py-20">
          <Container>
            <p className="mb-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-rc-muted">More comparisons</p>
            <ul className="grid gap-px overflow-hidden rounded-[20px] border border-rc-ink/10 bg-rc-ink/10 sm:grid-cols-2">
              {others.map((o) => (
                <li key={o.slug}>
                  <Link to={`/compare/${o.slug}`} className="group flex items-center justify-between gap-4 bg-rc-cream px-6 py-5 transition-colors hover:bg-rc-paper">
                    <span className="text-[15px] text-rc-ink">{o.label}</span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-rc-ink transition-transform group-hover:translate-x-0.5" />
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
