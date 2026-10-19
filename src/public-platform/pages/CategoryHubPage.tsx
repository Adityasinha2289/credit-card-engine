import { useParams, Link, Navigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { SEO } from '../components/SEO';
import { CATEGORY_TAXONOMY, getCardsForHub, getCategoryTaxonomy } from '../lib/cardKnowledgeGraph';
import { getBreadcrumbSchema, getOrganizationSchema, getWebSiteSchema } from '../lib/schemaBuilders';
import { ButtonLink, Container, Reveal, formatINR, useMediaQuery } from '../site/primitives';
import { PageBody, PageHero } from '../site/PageHero';
import { TiltCard } from '../site/TiltCard';
import { CardFace, displayCardName } from '../site/CardFace';
import { bankLabel } from '../site/banks';
import { SIGN_UP } from '../site/nav';

export function CategoryHubPage() {
  // routed as /compare/:categoryOrPairSlug (CompareRouter decides hub vs. pair)
  const { categoryOrPairSlug } = useParams<{ categoryOrPairSlug: string }>();
  const taxonomy = categoryOrPairSlug ? getCategoryTaxonomy(categoryOrPairSlug) : undefined;
  const wide = useMediaQuery('(min-width: 640px)');

  if (!taxonomy) return <Navigate to="/cards" replace />;

  const entries = getCardsForHub(taxonomy.slug, 12);
  const top = entries[0];
  const others = CATEGORY_TAXONOMY.filter((t) => t.slug !== taxonomy.slug);

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', item: '/' },
    { name: 'Credit Cards Directory', item: '/cards' },
    { name: taxonomy.name, item: `/compare/${taxonomy.slug}` },
  ]);
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Best Credit Cards for ${taxonomy.name} in India`,
    description: taxonomy.description,
    itemListElement: entries.map((e, index) => ({ '@type': 'ListItem', position: index + 1, name: e.card.cardName, url: e.card.url })),
  };

  return (
    <div className="flex w-full flex-1 flex-col">
      <SEO
        title={`Best Credit Cards for ${taxonomy.name} in India | RenoCred`}
        description={taxonomy.description}
        canonicalUrl={`https://renocred.com/compare/${taxonomy.slug}`}
        schemaData={[getOrganizationSchema(), getWebSiteSchema(), breadcrumbSchema, itemListSchema]}
      />

      <PageHero
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Cards', to: '/cards' }, { label: taxonomy.name }]}
        eyebrow="Best cards for"
        title={taxonomy.name}
        lede={taxonomy.description}
        aside={top && (
          <Link to={`/cards/${top.card.slug}`} className="relative flex aspect-[5/4] flex-col items-center justify-center overflow-hidden rounded-[40px] bg-rc-pistachio text-rc-ink">
            <div aria-hidden className="absolute inset-0 bg-[radial-gradient(60%_55%_at_50%_45%,rgba(255,255,255,0.8),transparent)]" />
            <span className="absolute left-5 top-5 rounded-full bg-rc-ink px-3.5 py-1.5 text-[12px] font-semibold text-rc-pistachio">#1 for {taxonomy.name.toLowerCase()}</span>
            <span className="absolute right-6 top-4 text-right">
              <span className="block font-serif text-[44px] font-semibold leading-none tabular-nums">{top.rate}%</span>
              <span className="block text-[11px] text-rc-ink/60">{top.context}</span>
            </span>
            <div className="relative mt-14 sm:mt-10"><TiltCard name={top.card.cardName} bank={top.card.issuer} network={top.card.network} width={wide ? 300 : 210} /></div>
            <span className="relative mt-6 font-serif text-[20px] font-semibold">{displayCardName(top.card.cardName)}</span>
          </Link>
        )}
      />

      <PageBody>
      <section className="py-16 lg:py-24">
        <Container className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <p className="mb-6 text-[14px] text-rc-muted">Ranked by published reward rate for this need; ties go to the lower annual fee.</p>
            <ol className="space-y-2.5">
              {entries.map((e, i) => (
                <Reveal as="li" key={e.card.id} delay={Math.min(i, 6) * 0.04}>
                  <Link
                    to={`/cards/${e.card.slug}`}
                    className={cn(
                      'group grid grid-cols-[2.5rem_auto_1fr] items-center gap-3 rounded-[26px] border px-3.5 py-4 transition-[border-color,box-shadow,background-color] duration-300 sm:grid-cols-[3.25rem_auto_1fr_auto] sm:gap-6 sm:px-6',
                      i === 0 ? 'border-transparent bg-rc-ink text-rc-cream' : 'border-rc-ink/10 bg-rc-paper hover:border-rc-ink/25 hover:shadow-[0_24px_50px_-34px_rgba(15,42,29,0.45)]',
                    )}
                  >
                    <span className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-full font-serif text-[17px] sm:h-11 sm:w-11 sm:text-[18px] font-semibold tabular-nums',
                      i === 0 ? 'bg-rc-pistachio text-rc-ink' : i < 3 ? 'bg-rc-ink text-rc-pistachio' : 'bg-rc-ink/[0.06] text-rc-ink/60',
                    )}>{i + 1}</span>
                    <span className="transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:rotate-[-2deg]">
                      <CardFace name={e.card.cardName} bank={e.card.issuer} network={e.card.network} width={wide ? 112 : 72} lifted={false} />
                    </span>
                    <span className="min-w-0">
                      <span className={cn('block text-[11px] font-semibold uppercase tracking-[0.18em]', i === 0 ? 'text-rc-mist' : 'text-rc-muted')}>{bankLabel(e.card.issuer)}</span>
                      <span className="mt-1 block font-serif text-[18px] font-semibold leading-snug sm:text-[21px]">{displayCardName(e.card.cardName)}</span>
                      <span className={cn('mt-1 block text-[14px] sm:hidden', i === 0 ? 'text-rc-mist' : 'text-rc-muted')}>{e.rate}% {e.context} · {e.card.annualFee === 0 ? 'Lifetime free' : e.card.annualFee == null ? 'Fee not disclosed' : `${formatINR(e.card.annualFee)} a year`}</span>
                    </span>
                    <span className="hidden text-right sm:block">
                      <span className={cn('block font-serif text-[30px] font-semibold leading-none tabular-nums', i === 0 && 'text-rc-pistachio')}>{e.rate}%</span>
                      <span className={cn('mt-1 block text-[12px]', i === 0 ? 'text-rc-mist' : 'text-rc-muted')}>{e.context}</span>
                      <span className={cn('mt-1 block text-[13px]', i === 0 ? 'text-rc-mist' : 'text-rc-muted')}>{e.card.annualFee === 0 ? 'Lifetime free' : e.card.annualFee == null ? 'Fee not disclosed' : `${formatINR(e.card.annualFee)} a year`}</span>
                    </span>
                  </Link>
                </Reveal>
              ))}
            </ol>
          </div>

          <aside className="space-y-6 lg:col-span-4">
            <Reveal className="rounded-[28px] border border-rc-ink/10 bg-rc-paper p-7">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-rc-muted">How we judged</p>
              <p className="mt-3 text-[15px] leading-relaxed text-rc-ink">{taxonomy.evaluationMethodology}</p>
              <Link to="/methodology" className="mt-5 inline-flex items-center gap-1.5 text-[14px] font-medium text-rc-ink underline decoration-rc-ink/25 underline-offset-4 hover:decoration-rc-ink">
                Our methodology <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Reveal>
            <Reveal delay={0.06} className="rounded-[28px] bg-rc-pistachio p-7">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-rc-forest">Worth knowing</p>
              <p className="mt-3 text-[15px] leading-relaxed text-rc-ink">{taxonomy.limitations}</p>
            </Reveal>
            <Reveal delay={0.12} className="relative overflow-hidden rounded-[28px] bg-rc-ink p-7 text-rc-cream">
              <p className="font-serif text-[26px] leading-tight">Which of these fits <span className="italic text-rc-pistachio">your</span> spending?</p>
              <p className="mt-3 text-[14px] leading-relaxed text-rc-mist">Add the cards you hold and RenoCred ranks new ones by the value they'd add for you.</p>
              <ButtonLink to={SIGN_UP} variant="cream" className="mt-6">Get started</ButtonLink>
            </Reveal>
          </aside>
        </Container>
      </section>

      <section className="pb-28 lg:pb-36">
        <Container>
          <p className="mb-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-rc-muted">More ways to compare</p>
          <div className="flex flex-wrap gap-2">
            {others.map((t) => (
              <Link key={t.slug} to={`/compare/${t.slug}`} className="rounded-full border border-rc-ink/15 px-5 py-2.5 text-[14px] text-rc-ink transition-colors hover:border-rc-ink/50">
                {t.name}
              </Link>
            ))}
          </div>
        </Container>
      </section>
      </PageBody>
    </div>
  );
}
