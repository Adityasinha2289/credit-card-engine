/**
 * Experiences: the perks already on your cards, plans for trips, dates and
 * weekends priced against your wallet, and partner offers by category.
 */
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Film, Gift, Heart, Map as MapIcon, PlaneTakeoff, Sparkles, Utensils } from 'lucide-react';
import { PageContainer } from '../../components/shared/PageContainer';
import { EmptyState, HeadAction, IconTile, Panel, SectionHead } from '../../components/shared/appUi';
import { MARKETPLACE_CATEGORIES } from '../../features/marketplace/taxonomy/categories';
import { useDashboardStore } from '../../features/dashboard/store/dashboardStore';
import { cardsByIds } from '../../public-platform/site/swipeMath';
import { CardFace, displayCardName } from '../../public-platform/site/CardFace';

const PLANS = [
  { to: '/app/plan/trip', icon: PlaneTakeoff, title: 'A trip', note: 'Flights, stays, the lot' },
  { to: '/app/plan/weekend', icon: MapIcon, title: 'A weekend away', note: 'A short break, sorted' },
  { to: '/app/plan/date', icon: Heart, title: 'A date', note: 'Dinner and after' },
  { to: '/app/plan/movie', icon: Film, title: 'A movie night', note: 'Tickets and food' },
  { to: '/app/plan/food', icon: Utensils, title: 'A food day', note: 'Where to eat, all day' },
  { to: '/app/plan/occasion', icon: Gift, title: 'An occasion', note: 'Birthdays and more' },
];

export default function MarketplaceHome() {
  const userCards = useDashboardStore((s) => s.userCards);

  // perks the issuers publish for the cards in the wallet
  const perks = useMemo(() => cardsByIds(userCards.map((c) => c.id)).map((card) => ({
    card,
    lounge: card.loungeAccess ?? 0,
    lines: [card.welcomeBonus, ...card.highlights].filter((x): x is string => Boolean(x && x.length > 8)).slice(0, 2),
  })).filter((p) => p.lounge > 0 || p.lines.length > 0), [userCards]);
  const loungeTotal = perks.reduce((s, p) => s + p.lounge, 0);

  return (
    <PageContainer
      eyebrow="Experiences"
      title={<>Rewards and <span className="italic">experiences.</span></>}
      subtitle="The perks already on your cards, plans that pay with the right one at each step, and partner offers."
      heroStats={loungeTotal > 0 ? [
        { value: loungeTotal, label: 'lounge visits a year on your cards' },
        { value: perks.length, label: perks.length === 1 ? 'card with perks' : 'cards with perks' },
      ] : undefined}
    >
      {/* perks you already have */}
      <section>
        <SectionHead title="Perks you already have" note="As each issuer publishes them for the cards in your wallet." />
        {perks.length === 0 ? (
          <EmptyState icon={Sparkles} title="Nothing to show yet" note="Add your cards in Wallet and their lounge visits, welcome benefits and perks show up here." action={<HeadAction to="/app/wallet">Go to Wallet</HeadAction>} />
        ) : (
          <ul className="-mx-5 flex snap-x snap-mandatory scroll-px-5 gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:snap-none sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3 [&::-webkit-scrollbar]:hidden">
            {perks.map(({ card, lounge, lines }) => (
              <Panel as="li" key={card.id} className="flex w-[82%] max-w-[320px] shrink-0 snap-start flex-col p-4 sm:w-auto sm:max-w-none">
                <div className="flex items-center gap-3">
                  <CardFace name={card.name} bank={card.bank} network={card.network} width={64} lifted={false} />
                  <p className="min-w-0 truncate text-[15px] font-semibold text-rc-ink">{displayCardName(card.name)}</p>
                </div>
                {lounge > 0 && (
                  <p className="mt-4 flex items-baseline gap-2">
                    <span className="font-serif text-[30px] font-semibold leading-none tabular-nums text-rc-forest">{lounge}</span>
                    <span className="text-[14px] text-rc-muted">lounge visits a year</span>
                  </p>
                )}
                <ul className="mt-3 space-y-1.5">
                  {lines.map((l) => <li key={l} className="text-[14px] leading-snug text-rc-ink/80">{l}</li>)}
                </ul>
              </Panel>
            ))}
          </ul>
        )}
      </section>

      {/* plan something */}
      <section>
        <SectionHead title={<>Plan something <span className="italic text-rc-forest">worth it.</span></>} note="Build the plan and see which of your cards to pay with at each step." />
        <ul className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-3">
          {PLANS.map((p, i) => (
            <li key={p.to}>
              <Link
                to={p.to}
                className={i === 0
                  ? 'flex h-full flex-col rounded-[22px] bg-rc-ink p-4 text-rc-cream transition-colors hover:bg-rc-moss'
                  : 'flex h-full flex-col rounded-[22px] border border-rc-ink/[0.08] bg-rc-paper p-4 transition-colors hover:bg-white'}
              >
                <IconTile icon={p.icon} tone={i === 0 ? 'good' : 'ink'} className="h-10 w-10" />
                <span className="mt-4 text-[15px] font-semibold leading-snug">{p.title}</span>
                <span className={i === 0 ? 'mt-0.5 text-[13px] text-rc-mist' : 'mt-0.5 text-[13px] text-rc-muted'}>{p.note}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* partner offers by category */}
      <section>
        <SectionHead title="Offers by category" note="Partners we work with, by what you’re spending on." />
        <ul className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
          {MARKETPLACE_CATEGORIES.map((c) => (
            <li key={c.id}>
              <Link to={`/app/marketplace/${c.slug}`} className="group relative block aspect-[4/5] overflow-hidden rounded-[22px] bg-rc-ink sm:aspect-[4/3]">
                <img src={c.image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-105" />
                <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-rc-night via-rc-night/45 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-3.5 text-rc-cream sm:p-4">
                  <p className="flex items-center justify-between gap-2 text-[16px] font-semibold leading-tight">
                    {c.name} <ArrowUpRight size={16} className="shrink-0 opacity-70" />
                  </p>
                  <p className="mt-1 line-clamp-2 text-[12px] leading-snug text-rc-mist">{c.description}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </PageContainer>
  );
}
