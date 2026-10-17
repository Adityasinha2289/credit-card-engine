import { useParams, Link, Navigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { SEO } from '../components/SEO';
import { CATEGORY_TAXONOMY, getCardsForHub, getCategoryTaxonomy } from '../lib/cardKnowledgeGraph';
import { getBreadcrumbSchema, getOrganizationSchema, getWebSiteSchema } from '../lib/schemaBuilders';
import { ButtonLink, Container, Eyebrow, Reveal, formatINR } from '../site/primitives';
import { CardFace, displayCardName } from '../site/CardFace';
import { bankLabel } from '../site/banks';
import { SIGN_UP } from '../site/nav';

export function CategoryHubPage() {
  // routed as /compare/:categoryOrPairSlug (CompareRouter decides hub vs. pair)
  const { categoryOrPairSlug } = useParams<{ categoryOrPairSlug: string }>();
  const taxonomy = categoryOrPairSlug ? getCategoryTaxonomy(categoryOrPairSlug) : undefined;

  if (!taxonomy) return <Navigate to="/cards" replace />;

  const entries = getCardsForHub(taxonomy.slug, 12);
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
    <div className="w-full">
      <SEO
        title={`Best Credit Cards for ${taxonomy.name} in India | RenoCred`}
        description={taxonomy.description}
        canonicalUrl={`https://renocred.com/compare/${taxonomy.slug}`}
        schemaData={[getOrganizationSchema(), getWebSiteSchema(), breadcrumbSchema, itemListSchema]}
      />

      <header className="border-b border-rc-ink/10">
        <Container className="pb-14 pt-10 lg:pb-20 lg:pt-14">
          <nav aria-label="Breadcrumb" className="mb-12 flex items-center gap-2 text-[13px] text-rc-muted">
            <Link to="/" className="hover:text-rc-ink">Home</Link><span aria-hidden>/</span>
            <Link to="/cards" className="hover:text-rc-ink">Cards</Link><span aria-hidden>/</span>
            <span className="text-rc-ink">{taxonomy.name}</span>
          </nav>
          <Eyebrow>Best cards for</Eyebrow>
          <h1 className="mt-6 max-w-[16ch] font-serif text-[clamp(2.75rem,6vw,5.25rem)] font-medium leading-[0.98] tracking-[-0.025em] text-rc-ink">
            {taxonomy.name}
          </h1>
          <p className="mt-7 max-w-[56ch] text-[18px] leading-relaxed text-rc-muted">{taxonomy.description}</p>
        </Container>
      </header>

      <section className="py-16 lg:py-24">
        <Container className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <p className="mb-6 text-[14px] text-rc-muted">Ranked by published reward rate for this need; ties go to the lower annual fee.</p>
            <ol className="divide-y divide-rc-ink/10 border-y border-rc-ink/10">
              {entries.map((e, i) => (
                <li key={e.card.id}>
                  <Link to={`/cards/${e.card.slug}`} className="group grid grid-cols-[2.5rem_auto_1fr] items-center gap-5 py-6 sm:grid-cols-[3rem_auto_1fr_auto] sm:gap-7">
                    <span className="font-serif text-[30px] leading-none text-rc-ink/30 tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                    <span className="transition-transform duration-500 group-hover:-translate-y-0.5">
                      <CardFace name={e.card.cardName} bank={e.card.issuer} network={e.card.network} width={112} lifted={false} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-rc-muted">{bankLabel(e.card.issuer)}</span>
                      <span className="mt-1 block font-serif text-[21px] leading-snug text-rc-ink group-hover:underline group-hover:decoration-rc-ink/30 group-hover:underline-offset-4">{displayCardName(e.card.cardName)}</span>
                      <span className="mt-1 block text-[14px] text-rc-muted sm:hidden">{e.rate}% {e.context} · {e.card.annualFee === 0 ? 'Lifetime free' : e.card.annualFee == null ? 'Fee not disclosed' : `${formatINR(e.card.annualFee)} a year`}</span>
                    </span>
                    <span className="hidden text-right sm:block">
                      <span className="block font-serif text-[28px] leading-none text-rc-ink tabular-nums">{e.rate}%</span>
                      <span className="mt-1 block text-[12px] text-rc-muted">{e.context}</span>
                      <span className="mt-1 block text-[13px] text-rc-muted">{e.card.annualFee === 0 ? 'Lifetime free' : e.card.annualFee == null ? 'Fee not disclosed' : `${formatINR(e.card.annualFee)} a year`}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>

          <aside className="space-y-6 lg:col-span-4">
            <Reveal className="rounded-[24px] border border-rc-ink/10 bg-rc-paper p-7">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-rc-muted">How we judged</p>
              <p className="mt-3 text-[15px] leading-relaxed text-rc-ink">{taxonomy.evaluationMethodology}</p>
              <Link to="/methodology" className="mt-5 inline-flex items-center gap-1.5 text-[14px] font-medium text-rc-ink underline decoration-rc-ink/25 underline-offset-4 hover:decoration-rc-ink">
                Our methodology <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Reveal>
            <Reveal delay={0.06} className="rounded-[24px] bg-rc-pistachio p-7">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-rc-forest">Worth knowing</p>
              <p className="mt-3 text-[15px] leading-relaxed text-rc-ink">{taxonomy.limitations}</p>
            </Reveal>
            <Reveal delay={0.12} className="rounded-[24px] bg-rc-ink p-7 text-rc-cream">
              <p className="font-serif text-[26px] leading-tight">Which of these fits <span className="italic text-rc-pistachio">your</span> spending?</p>
              <p className="mt-3 text-[14px] leading-relaxed text-rc-mist">Add the cards you hold and RenoCred ranks new ones by the value they'd add for you.</p>
              <ButtonLink to={SIGN_UP} variant="cream" className="mt-6">Get started</ButtonLink>
            </Reveal>
          </aside>
        </Container>
      </section>

      <section className="border-t border-rc-ink/10 py-16 lg:py-20">
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
    </div>
  );
}
