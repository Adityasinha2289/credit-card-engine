/**
 * One Experiences category (and, with a subcategory in the URL, one part of it):
 * the partners we list there, and the card that earns most on that kind of spend.
 */
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Store } from 'lucide-react';
import { MARKETPLACE_CATEGORIES } from '../../features/marketplace/taxonomy/categories';
import { MarketplaceService } from '../../features/marketplace/services/marketplaceService';
import type { MarketplaceOffer } from '../../features/marketplace/types';
import { OfferCard } from '../../features/marketplace/components/OfferCard';
import { PageContainer } from '../../components/shared/PageContainer';
import { EmptyState, Panel, SectionHead } from '../../components/shared/appUi';
import { useDashboardStore } from '../../features/dashboard/store/dashboardStore';
import { bestInCatalog, cardsByIds, rewardFor, slugifyCardName, type SpendCategory } from '../../public-platform/site/swipeMath';
import { CardFace, displayCardName } from '../../public-platform/site/CardFace';
import { cn } from '../../lib/utils';

/** Which spend category's reward rates apply to each Experiences category. */
const SPEND_FOR: Record<string, SpendCategory> = { travel: 'travel', dining: 'dining', shopping: 'shopping', lifestyle: 'entertainment', hobbies: 'shopping' };

export default function CategoryPage() {
  const { categorySlug, subcategorySlug } = useParams();
  const category = MARKETPLACE_CATEGORIES.find((c) => c.slug === categorySlug);
  const subcategory = category?.subcategories.find((s) => s.slug === subcategorySlug);
  const [minor, setMinor] = useState<string>('');
  const [offers, setOffers] = useState<MarketplaceOffer[] | null>(null);
  const userCards = useDashboardStore((s) => s.userCards);

  useEffect(() => {
    if (!category) return;
    let live = true;
    setOffers(null);
    void MarketplaceService.getOffersByCategory(category.slug, subcategory?.slug, minor || undefined).then((data) => { if (live) setOffers(data); });
    return () => { live = false; };
  }, [category, subcategory, minor]);

  useEffect(() => { setMinor(''); }, [subcategorySlug]);

  const spend = category ? SPEND_FOR[category.slug] : undefined;
  const cardTip = useMemo(() => {
    if (!spend) return null;
    const mine = cardsByIds(userCards.map((c) => c.id)).map((c) => rewardFor(c, spend, 1000)).sort((a, b) => b.rate - a.rate)[0];
    const market = bestInCatalog(spend, 1000);
    return { mine: mine && mine.rate > 0 ? mine : null, market: market && (!mine || market.rate > mine.rate) ? market : null };
  }, [spend, userCards]);

  if (!category) {
    return (
      <PageContainer eyebrow="Experiences" title="Not found.">
        <EmptyState icon={Store} title="We couldn’t find that category" action={<Link to="/app/marketplace" className="text-[14px] font-medium text-rc-forest underline">Back to Experiences</Link>} />
      </PageContainer>
    );
  }

  const base = `/app/marketplace/${category.slug}`;
  const chips = subcategory
    ? (subcategory.subSubCategories ?? []).map((m) => ({ key: m.slug, label: m.name, on: minor === m.slug, onClick: () => setMinor(minor === m.slug ? '' : m.slug) }))
    : [];

  return (
    <PageContainer
      eyebrow={subcategory ? category.name : 'Experiences'}
      title={subcategory ? subcategory.name : category.name}
      subtitle={category.description}
      heroActions={(
        <Link to={subcategory ? base : '/app/marketplace'} className="inline-flex h-10 items-center gap-2 rounded-full border border-white/15 px-4 text-[14px] text-rc-mist hover:text-rc-cream">
          <ArrowLeft size={15} /> {subcategory ? category.name : 'All experiences'}
        </Link>
      )}
    >
      {/* where to go next: the parts of this category, or the kinds within one part */}
      <nav aria-label="Narrow down" className="-mx-5 flex gap-2 overflow-x-auto px-5 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0 [&::-webkit-scrollbar]:hidden">
        {subcategory
          ? chips.map((c) => (
            <button key={c.key} type="button" aria-pressed={c.on} onClick={c.onClick} className={cn('h-10 shrink-0 rounded-full border px-4 text-[14px] transition-colors', c.on ? 'border-rc-ink bg-rc-ink text-rc-cream' : 'border-rc-ink/15 bg-rc-paper text-rc-ink hover:border-rc-ink/35')}>{c.label}</button>
          ))
          : category.subcategories.map((s) => (
            <Link key={s.slug} to={`${base}/${s.slug}`} className="flex h-10 shrink-0 items-center rounded-full border border-rc-ink/15 bg-rc-paper px-4 text-[14px] text-rc-ink hover:border-rc-ink/35">{s.name}</Link>
          ))}
      </nav>

      <div className="grid gap-9 lg:grid-cols-[1fr_340px] lg:gap-10">
        <section>
          <SectionHead title="Partners" note={offers && offers.length > 0 ? `${offers.length} listed here` : undefined} />
          {offers === null ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {[0, 1, 2, 3].map((i) => <div key={i} className="h-[120px] animate-pulse rounded-[22px] bg-rc-ink/[0.05]" />)}
            </div>
          ) : offers.length === 0 ? (
            <EmptyState icon={Store} title="No partners here yet" note="We add partners as deals are confirmed. Until then, the card shown here is how to earn most on this kind of spend." />
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {offers.map((o) => <li key={o.id}><OfferCard offer={o} /></li>)}
            </ul>
          )}
        </section>

        {cardTip && (cardTip.mine || cardTip.market) && (
          <aside className="space-y-3 lg:pt-[60px]">
            {cardTip.mine && (
              <Panel className="p-4">
                <p className="text-[13px] font-medium text-rc-muted">Pay with, from your wallet</p>
                <div className="mt-3 flex items-center gap-3">
                  <CardFace name={cardTip.mine.card.name} bank={cardTip.mine.card.bank} network={cardTip.mine.card.network} width={72} lifted={false} />
                  <p className="min-w-0 flex-1 truncate text-[15px] font-semibold text-rc-ink">{displayCardName(cardTip.mine.card.name)}</p>
                  <p className="text-[20px] font-semibold tabular-nums text-rc-forest">{cardTip.mine.rate}%</p>
                </div>
              </Panel>
            )}
            {cardTip.market && (
              <Link to={`/cards/${slugifyCardName(cardTip.market.card.name)}`} className="block rounded-[26px] bg-rc-ink p-4 text-rc-cream hover:bg-rc-moss">
                <p className="text-[13px] font-medium text-rc-pistachio">Best on the market for this</p>
                <div className="mt-3 flex items-center gap-3">
                  <CardFace name={cardTip.market.card.name} bank={cardTip.market.card.bank} network={cardTip.market.card.network} width={72} lifted={false} />
                  <p className="min-w-0 flex-1 truncate text-[15px] font-semibold">{displayCardName(cardTip.market.card.name)}</p>
                  <p className="text-[20px] font-semibold tabular-nums text-rc-pistachio">{cardTip.market.rate}%</p>
                </div>
              </Link>
            )}
          </aside>
        )}
      </div>
    </PageContainer>
  );
}
