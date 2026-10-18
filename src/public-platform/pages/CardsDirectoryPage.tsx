import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, Search, X } from 'lucide-react';
import { SEO } from '../components/SEO';
import { getDirectoryCards, type PublicCardEntity } from '../lib/cardKnowledgeGraph';
import { getBreadcrumbSchema, getOrganizationSchema, getWebSiteSchema } from '../lib/schemaBuilders';
import { cn } from '../../lib/utils';
import { Container, CountUp } from '../site/primitives';
import { PageBody, PageHero } from '../site/PageHero';
import { CardFan } from '../site/CardFan';
import { CardFace, displayCardName } from '../site/CardFace';
import { bankLabel } from '../site/banks';

const NEEDS: { id: string; label: string; match: (c: PublicCardEntity) => boolean }[] = [
  { id: 'all', label: 'All cards', match: () => true },
  { id: 'travel', label: 'Travel', match: (c) => c.categories.includes('travel') },
  { id: 'shopping', label: 'Shopping', match: (c) => c.categories.includes('shopping') },
  { id: 'dining', label: 'Dining', match: (c) => c.categories.includes('dining') },
  { id: 'fuel', label: 'Fuel', match: (c) => c.categories.includes('fuel') },
  { id: 'utilities', label: 'Bills', match: (c) => c.categories.includes('utilities') },
  { id: 'lifetime-free', label: 'Lifetime free', match: (c) => c.annualFee === 0 },
  { id: 'premium', label: 'Premium', match: (c) => c.premiumTier === 'premium' || c.premiumTier === 'super_premium' },
];

const SORTS = {
  featured: { label: 'Featured', fn: (a: PublicCardEntity, b: PublicCardEntity) => Number(b.id.startsWith('card-')) - Number(a.id.startsWith('card-')) },
  'fee-asc': { label: 'Annual fee, low to high', fn: (a: PublicCardEntity, b: PublicCardEntity) => (a.annualFee ?? Infinity) - (b.annualFee ?? Infinity) },
  'fee-desc': { label: 'Annual fee, high to low', fn: (a: PublicCardEntity, b: PublicCardEntity) => (b.annualFee ?? -1) - (a.annualFee ?? -1) },
  name: { label: 'Name, A to Z', fn: (a: PublicCardEntity, b: PublicCardEntity) => a.cardName.localeCompare(b.cardName) },
};
type SortKey = keyof typeof SORTS;

const PAGE = 24;

function feeLabel(c: PublicCardEntity): string {
  if (c.annualFee === null) return 'Not disclosed';
  return c.annualFee === 0 ? 'Lifetime free' : `₹${c.annualFee.toLocaleString('en-IN')}`;
}

function DirectoryCard({ card }: { card: PublicCardEntity }) {
  return (
    <Link to={`/cards/${card.slug}`} className="group flex h-full flex-col overflow-hidden rounded-[32px] border border-rc-ink/10 bg-rc-paper transition-[border-color,box-shadow,transform] duration-500 hover:-translate-y-1 hover:border-rc-ink/20 hover:shadow-[0_30px_60px_-36px_rgba(15,42,29,0.45)]">
      <div className="relative m-2 flex items-center justify-center overflow-hidden rounded-[26px] bg-rc-pistachio/60 px-6 py-9">
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_45%,rgba(255,255,255,0.7),transparent)]" />
        <div className="relative transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:-translate-y-2 group-hover:rotate-[-3deg] group-hover:scale-[1.03]">
          <CardFace name={card.cardName} bank={card.issuer} network={card.network} width={236} />
        </div>
      </div>
      <div className="flex flex-1 flex-col px-6 pb-6 pt-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-rc-muted">{bankLabel(card.issuer)}</p>
        <h2 className="mt-2 font-serif text-[23px] font-semibold leading-snug tracking-[-0.01em] text-rc-ink">{displayCardName(card.cardName)}</h2>
        <p className="mb-6 mt-2 line-clamp-2 text-[14px] leading-relaxed text-rc-muted">{card.topBenefit}</p>
        <div className="mt-auto flex items-end justify-between gap-4 border-t border-rc-ink/10 pt-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-rc-muted">Annual fee</p>
            <p className="mt-1 text-[15px] font-medium text-rc-ink">{feeLabel(card)}</p>
          </div>
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-rc-ink/15 text-rc-ink transition-colors group-hover:border-rc-ink group-hover:bg-rc-ink group-hover:text-rc-cream">
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export function CardsDirectoryPage() {
  const all = useMemo(() => getDirectoryCards(), []);
  const [params, setParams] = useSearchParams();
  const need = NEEDS.some((n) => n.id === params.get('category')) ? params.get('category')! : 'all';
  const issuer = params.get('issuer') ?? 'all';
  const sort: SortKey = (params.get('sort') as SortKey) in SORTS ? (params.get('sort') as SortKey) : 'featured';
  const [query, setQuery] = useState(params.get('q') ?? '');
  const [shown, setShown] = useState(PAGE);

  const issuers = useMemo(() => [...new Set(all.map((c) => bankLabel(c.issuer)))].sort(), [all]);

  const update = (key: string, value: string, fallback: string) => {
    const next = new URLSearchParams(params);
    if (value === fallback || !value) next.delete(key); else next.set(key, value);
    setParams(next, { replace: true });
  };

  // keep ?q= in the URL (the site search schema points here) without a history entry per keystroke
  useEffect(() => {
    const t = setTimeout(() => update('q', query.trim(), ''), 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  useEffect(() => { setShown(PAGE); }, [need, issuer, sort, query]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const match = NEEDS.find((n) => n.id === need)!.match;
    return all
      .filter((c) => match(c)
        && (issuer === 'all' || bankLabel(c.issuer) === issuer)
        && (!q || `${c.cardName} ${bankLabel(c.issuer)} ${c.topBenefit}`.toLowerCase().includes(q)))
      .sort(SORTS[sort].fn);
  }, [all, need, issuer, sort, query]);

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', item: '/' },
    { name: 'Credit Cards Directory', item: '/cards' },
  ]);

  const reset = () => { setQuery(''); setParams(new URLSearchParams(), { replace: true }); };
  const filtersActive = need !== 'all' || issuer !== 'all' || !!query.trim();

  return (
    <div className="flex w-full flex-1 flex-col">
      <SEO
        title={`Indian Credit Cards Directory | Compare ${all.length} Cards | RenoCred`}
        description="Every Indian credit card from HDFC, SBI, Axis, ICICI and more. Compare reward rates, lounge access, annual fees and eligibility side by side."
        canonicalUrl="https://renocred.com/cards"
        schemaData={[getOrganizationSchema(), getWebSiteSchema(), breadcrumbSchema]}
      />

      <PageHero
        eyebrow="Card directory"
        title={<>Compare cards, <span className="italic">side by side.</span></>}
        lede="Fees, reward rates, lounge access and eligibility for every card we hold full reward data on, filterable by what you spend on."
        actions={(
          <dl className="flex flex-wrap gap-x-10 gap-y-4">
            {[
              [all.length, 'cards ranked'],
              [issuers.length, 'issuers'],
              [all.filter((c) => c.annualFee === 0).length, 'lifetime free'],
            ].map(([n, label]) => (
              <div key={label as string}>
                <dt className="sr-only">{label}</dt>
                <dd className="font-serif text-[44px] font-semibold leading-none text-rc-pistachio lining-nums tabular-nums"><CountUp to={n as number} delay={0.4} /></dd>
                <p className="mt-2 text-[13px] text-rc-mist">{label}</p>
              </div>
            ))}
          </dl>
        )}
        aside={<CardFan className="hidden lg:block" width={240} cards={all.slice(0, 5).map((c) => ({ id: c.id, name: c.cardName, bank: c.issuer, network: c.network }))} />}
      />

      <PageBody className="overflow-clip">
      {/* toolbar: sticks to the very top; its top padding sits under the floating header when stuck, so nothing shows around it */}
      <div className="z-30 border-b border-rc-ink/10 bg-rc-cream/90 pt-6 backdrop-blur-xl sm:sticky sm:top-0 sm:pt-16 lg:pt-[76px]">
        <Container className="flex flex-col gap-3 pb-4 sm:-mt-6">
          <div role="tablist" aria-label="Filter by need" className="-mx-5 flex gap-1 overflow-x-auto px-5 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {NEEDS.map((n) => (
              <button
                key={n.id}
                type="button"
                role="tab"
                aria-selected={need === n.id}
                onClick={() => update('category', n.id, 'all')}
                className={cn('shrink-0 rounded-full px-4 py-2 text-[14px] transition-colors', need === n.id ? 'bg-rc-ink text-rc-cream' : 'text-rc-ink/75 hover:bg-rc-ink/[0.05] hover:text-rc-ink')}
              >
                {n.label}
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label className="relative block sm:w-80">
              <span className="sr-only">Search cards</span>
              <Search aria-hidden className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-rc-muted" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by card or bank"
                className="h-11 w-full rounded-full border border-rc-ink/15 bg-white pl-11 pr-4 text-[14px] text-rc-ink outline-none placeholder:text-rc-muted/80 focus:border-rc-ink/50"
              />
            </label>
            <div className="flex gap-2 sm:ml-auto">
              <select
                aria-label="Issuer"
                value={issuer}
                onChange={(e) => update('issuer', e.target.value, 'all')}
                className="h-11 w-full min-w-0 flex-1 rounded-full border border-rc-ink/15 bg-white px-4 text-[14px] text-rc-ink outline-none focus:border-rc-ink/50 sm:w-auto sm:flex-none"
              >
                <option value="all">All issuers</option>
                {issuers.map((i) => <option key={i} value={i}>{i}</option>)}
              </select>
              <select
                aria-label="Sort"
                value={sort}
                onChange={(e) => update('sort', e.target.value, 'featured')}
                className="h-11 w-full min-w-0 flex-1 rounded-full border border-rc-ink/15 bg-white px-4 text-[14px] text-rc-ink outline-none focus:border-rc-ink/50 sm:w-auto sm:flex-none"
              >
                {Object.entries(SORTS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
          </div>
        </Container>
      </div>

      <Container className="pb-28 pt-10 lg:pb-36">
        <div className="mb-8 flex items-center justify-between gap-4 text-[14px] text-rc-muted">
          <p aria-live="polite">{filtered.length} {filtered.length === 1 ? 'card' : 'cards'}</p>
          {filtersActive && (
            <button type="button" onClick={reset} className="inline-flex items-center gap-1.5 text-rc-ink underline decoration-rc-ink/25 underline-offset-4 hover:decoration-rc-ink">
              <X className="h-3.5 w-3.5" /> Clear filters
            </button>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-rc-ink/20 px-6 py-24 text-center">
            <p className="font-serif text-[30px] text-rc-ink">No cards match that.</p>
            <p className="mx-auto mt-3 max-w-[40ch] text-[15px] text-rc-muted">Try a different need or issuer, or clear the search.</p>
            <button type="button" onClick={reset} className="mt-8 h-11 rounded-full bg-rc-ink px-6 text-[14px] font-medium text-rc-cream">Clear filters</button>
          </div>
        ) : (
          <>
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.slice(0, shown).map((c) => (
                <li key={c.id}><DirectoryCard card={c} /></li>
              ))}
            </ul>
            {shown < filtered.length && (
              <div className="mt-14 flex justify-center">
                <button type="button" onClick={() => setShown((n) => n + PAGE)} className="h-12 rounded-full border border-rc-ink/20 px-7 text-[14px] font-medium text-rc-ink transition-colors hover:border-rc-ink/60">
                  Show more ({filtered.length - shown} left)
                </button>
              </div>
            )}
          </>
        )}
      </Container>
      </PageBody>
    </div>
  );
}
