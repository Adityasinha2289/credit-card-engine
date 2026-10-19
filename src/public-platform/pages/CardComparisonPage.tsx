import { useParams, Link, Navigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { SEO } from '../components/SEO';
import { getComparisonPairBySlug, getPopularComparisons, getRatesFor, monthlyIncome, type PublicCardEntity } from '../lib/cardKnowledgeGraph';
import { getBreadcrumbSchema, getOrganizationSchema, getWebSiteSchema } from '../lib/schemaBuilders';
import { cn } from '../../lib/utils';
import { ButtonLink, Container, Eyebrow, Reveal, formatINR, useMediaQuery } from '../site/primitives';
import { PageBody, PageHero } from '../site/PageHero';
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
    <div className="flex w-full flex-1 flex-col">
      <SEO
        title={`${nameA} vs ${nameB}: Fees, Rewards & Perks Compared | RenoCred`}
        description={`Compare ${nameA} and ${nameB} side by side: annual fees (${cardA.formattedAnnualFee} vs ${cardB.formattedAnnualFee}), reward rates, lounge access and eligibility.`}
        canonicalUrl={canonicalUrl}
        schemaData={[getOrganizationSchema(), getWebSiteSchema(), breadcrumbSchema]}
      />

      <PageHero
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Cards', to: '/cards' }, { label: `${nameA} vs ${nameB}` }]}
        eyebrow="Head to head"
        title={<>{nameA} <span className="italic">vs</span> {nameB}</>}
        lede="Fees, reward rates, lounge access and eligibility, side by side from each issuer's published terms."
        aside={(
          <div className="relative flex items-center justify-center py-6">
            {[cardA, cardB].map((c, i) => (
              <Link key={c.id} to={`/cards/${c.slug}`} className={cn('group relative flex flex-col items-center', i === 0 ? '-mr-1 sm:-mr-10' : '-ml-1 sm:-ml-10')}>
                <div className={cn('transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)]', i === 0 ? 'rotate-[-9deg] group-hover:rotate-[-4deg] group-hover:-translate-y-2' : 'rotate-[9deg] group-hover:rotate-[4deg] group-hover:-translate-y-2')}>
                  <CardFace name={c.cardName} bank={c.issuer} network={c.network} width={wide ? 230 : 140} />
                </div>
                <p className="mt-6 max-w-[11ch] text-center font-serif text-[15px] font-semibold leading-snug text-rc-cream sm:max-w-[16ch] sm:text-[17px]">{displayCardName(c.cardName)}</p>
                <p className="mt-1 text-[13px] text-rc-mist">{fee(c)}{c.annualFee ? ' a year' : ''}</p>
              </Link>
            ))}
            <span aria-hidden className="absolute left-1/2 top-[30%] z-10 flex h-12 w-12 text-[18px] sm:top-[34%] sm:h-16 sm:w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-rc-pistachio font-serif font-semibold italic text-rc-ink sm:text-[22px] shadow-[0_0_0_8px_rgba(10,31,21,1)]">vs</span>
          </div>
        )}
      />

      <PageBody>
      <section className="py-16 lg:py-24">
        <Container className="grid gap-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-4">
            <Eyebrow index="01">The short answer</Eyebrow>
            <p className="mt-6 font-serif text-[clamp(1.45rem,2.2vw,1.9rem)] leading-[1.3] text-rc-ink">{verdict}</p>
          </Reveal>
          <Reveal delay={0.08} className="lg:col-span-8">
            <div className="overflow-x-auto rounded-[28px] border border-rc-ink/10 bg-rc-paper">
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

      <section className="px-3 sm:px-5">
        <div className="relative mx-auto max-w-[1360px] overflow-hidden rounded-[40px] bg-rc-ink py-16 text-rc-cream lg:rounded-[56px] lg:py-20">
          <div aria-hidden className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[radial-gradient(closest-side,rgba(227,238,212,0.16),transparent)]" />
          <Container className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <p className="max-w-[22ch] font-serif text-[clamp(2rem,3.6vw,3.25rem)] font-semibold leading-[1.05] tracking-[-0.025em]">The right pick depends on <span className="italic text-rc-pistachio">how you spend.</span></p>
            <ButtonLink to={SIGN_UP} variant="cream" size="lg">Compare with your spending</ButtonLink>
          </Container>
        </div>
      </section>

      {others.length > 0 && (
        <section className="pb-28 pt-16 lg:pb-36 lg:pt-20">
          <Container>
            <Eyebrow>More comparisons</Eyebrow>
            <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
              {others.map((o) => (
                <li key={o.slug}>
                  <Link to={`/compare/${o.slug}`} className="group flex items-center justify-between gap-4 rounded-[22px] border border-rc-ink/10 bg-rc-paper px-6 py-5 transition-colors hover:border-rc-ink/30">
                    <span className="text-[15px] text-rc-ink">{o.label}</span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-rc-ink transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}
      </PageBody>
    </div>
  );
}
