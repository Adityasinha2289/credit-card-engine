/**
 * Wallet: the cards you hold, what each is best at, and how close the wallet
 * comes to the best rates on the market for each kind of spend.
 */
import { useMemo, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Plus, WalletCards } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { useDashboardStore } from '../../features/dashboard/store/dashboardStore';
import { useDashboardMutations } from '../../hooks/queries/useDashboardMutations';
import type { CardData } from '../../features/cards/types/card.types';
import { PageContainer } from '../../components/shared/PageContainer';
import { EmptyState, HeadAction, Panel, Pill, SectionHead } from '../../components/shared/appUi';
import AddCardModal from '../../features/dashboard/components/AddCardModal';
import { CardDetailsModal } from '../../features/dashboard/components/CardDetailsModal';
import { ArrowChip } from '../../public-platform/site/primitives';
import { CardFan } from '../../public-platform/site/CardFan';
import { CardFace, displayCardName } from '../../public-platform/site/CardFace';
import { SPEND_CATEGORIES, cardsByIds, slugifyCardName } from '../../public-platform/site/swipeMath';
import { walletCoverage } from './walletCoverage';
import { cn } from '../../lib/utils';

export default function WalletPage() {
  const { user } = useUser();
  const { deleteUserCard } = useDashboardMutations(user?.id);
  const userCards = useDashboardStore((s) => s.userCards);
  const [adding, setAdding] = useState(false);
  const [selected, setSelected] = useState<CardData | null>(null);

  // What a card is best at: its highest published category rate.
  const bestJob = (cardId: string) => {
    const [catalogCard] = cardsByIds([cardId]);
    const top = [...(catalogCard?.rewards ?? [])].sort((x, y) => y.rate - x.rate)[0];
    if (!top) return null;
    return { label: (SPEND_CATEGORIES.find((c) => c.id === top.category)?.label ?? top.category).toLowerCase(), rate: top.rate };
  };

  // How well the wallet covers each kind of spend, from published reward rates.
  const coverage = useMemo(() => walletCoverage(userCards.map((c) => c.id)), [userCards]);
  const total = userCards.length;
  const active = userCards.filter((c) => c.status === 'active').length;
  const topSpends = coverage?.rows.filter((r) => r.coverage === 100).length ?? 0;

  return (
    <PageContainer
      eyebrow="Wallet"
      title={total > 0 ? <>Every card, <span className="italic">one job each.</span></> : <>Your wallet, <span className="italic">waiting.</span></>}
      subtitle={total > 0
        ? 'What each of your cards is best at, so the right one comes out at the till.'
        : 'Add the cards you own and RenoCred works out which one to use for each kind of spend.'}
      heroStats={total > 0 ? [
        { value: active, label: active === 1 ? 'active card' : 'active cards' },
        ...(coverage ? [{ value: `${coverage.overall}%`, label: 'of the best rates' }] : []),
        ...(coverage ? [{ value: topSpends, label: topSpends === 1 ? 'spend you top' : 'spends you top' }] : []),
      ] : undefined}
      heroActions={(
        <button type="button" onClick={() => setAdding(true)} className="group inline-flex h-12 items-center gap-3 rounded-full bg-rc-cream pl-6 pr-1.5 text-[14px] font-medium text-rc-ink transition-colors hover:bg-white">
          Add a card <ArrowChip variant="cream" size="md" />
        </button>
      )}
      heroAside={total > 0 ? (
        <CardFan width={180} cards={userCards.slice(0, 5).map((c) => ({ id: c.id, name: c.label || 'Credit card', bank: c.bank || '', network: c.network }))} />
      ) : undefined}
    >
      {/* the cards: a swipeable row on phones, a grid on wider screens */}
      <section>
        <SectionHead title="Your cards" note={total > 0 ? 'Tap a card to add its limit or remove it.' : undefined} action={total > 0 && <HeadAction onClick={() => setAdding(true)}><Plus size={14} /> Add</HeadAction>} />
        {total === 0 ? (
          <EmptyState icon={WalletCards} title="Add your first card" note="Pick it from the catalogue. No card number needed." action={<Pill onClick={() => setAdding(true)}><Plus size={16} /> Add a card</Pill>} />
        ) : (
          <ul className="-mx-5 flex snap-x snap-mandatory scroll-px-5 gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:snap-none sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 lg:grid-cols-3 [&::-webkit-scrollbar]:hidden">
            {userCards.map((card) => {
              const job = bestJob(card.id);
              return (
                <li key={card.id} className="w-[84%] max-w-[340px] shrink-0 snap-start sm:w-auto sm:max-w-none">
                  <button
                    type="button"
                    onClick={() => setSelected(card)}
                    className={cn(
                      'group block w-full rounded-[26px] border border-rc-ink/[0.08] bg-rc-paper p-2.5 text-left transition-[transform,box-shadow,background-color] duration-500 hover:-translate-y-1 hover:bg-white hover:shadow-[0_30px_60px_-36px_rgba(15,42,29,0.45)]',
                      card.status !== 'active' && 'opacity-60 grayscale',
                    )}
                  >
                    <CardFace name={card.label || 'Credit card'} bank={card.bank || ''} network={card.network} width={340} lifted={false} className="!h-auto !w-full aspect-[1.586]" />
                    <div className="px-2 pb-1.5 pt-3.5">
                      <p className="truncate text-[16px] font-semibold leading-tight text-rc-ink">{displayCardName(card.label || '')}</p>
                      <div className="mt-2 flex items-center justify-between gap-2 text-[13px]">
                        {job ? (
                          <span className="truncate rounded-full bg-rc-pistachio px-2.5 py-1 font-medium text-rc-forest">Best at {job.label}, {job.rate}%</span>
                        ) : (
                          <span className="truncate rounded-full bg-rc-ink/[0.06] px-2.5 py-1 text-rc-muted">No published rates</span>
                        )}
                        <span className={cn('shrink-0', card.creditLimit > 0 ? 'text-rc-muted' : 'font-medium text-rc-forest')}>
                          {card.creditLimit > 0 ? `₹${(card.creditLimit / 100).toLocaleString('en-IN')}` : '+ Limit'}
                        </span>
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {coverage && (
        <div className="grid gap-9 lg:grid-cols-[1.25fr_1fr] lg:gap-10">
          {/* each spend: your best card and rate, against the best on the market */}
          <section>
            <SectionHead title="Which card, for what" note="Your best card for each spend, and how its rate compares with the best on the market." />
            <Panel as="ul" className="divide-y divide-rc-ink/[0.07]">
              {coverage.rows.map((row) => (
                <li key={row.category} className="px-4 py-3.5 sm:px-5">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-[15px] font-medium text-rc-ink">{row.label}</p>
                    <p className="shrink-0 text-[13px] tabular-nums text-rc-muted">
                      <span className="font-serif text-[18px] font-semibold text-rc-ink">{row.yourRate}%</span> of {row.marketRate}%
                    </p>
                  </div>
                  <p className="mt-0.5 truncate text-[13px] text-rc-muted">{row.yourCard ? displayCardName(row.yourCard.name) : 'None of your cards earns extra here'}</p>
                  <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-rc-ink/[0.08]">
                    <div className={cn('h-full rounded-full transition-[width] duration-1000 ease-out', row.coverage === 100 ? 'bg-rc-forest' : 'bg-rc-sage')} style={{ width: `${Math.max(row.coverage, 3)}%` }} />
                  </div>
                </li>
              ))}
            </Panel>
          </section>

          {/* the biggest gap, and the card that would close it */}
          <section className="lg:pt-[76px]">
            {coverage.gap ? (
              <div className="relative overflow-hidden rounded-[28px] bg-rc-ink p-6 text-rc-cream sm:p-7">
                <div aria-hidden className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-[radial-gradient(closest-side,rgba(227,238,212,0.16),transparent)]" />
                <p className="relative text-[13px] font-medium text-rc-pistachio">Most to gain: {coverage.gap.label.toLowerCase()}</p>
                <div className="relative mt-5 flex items-center gap-4">
                  <CardFace name={coverage.gap.marketCard!.name} bank={coverage.gap.marketCard!.bank} network={coverage.gap.marketCard!.network} width={110} className="-rotate-3" />
                  <div className="min-w-0">
                    <p className="font-serif text-[21px] font-semibold leading-tight">{displayCardName(coverage.gap.marketCard!.name)}</p>
                    <p className="mt-1 text-[14px] text-rc-mist">{coverage.gap.marketCard!.bank}</p>
                  </div>
                </div>
                <p className="relative mt-5 text-[15px] leading-relaxed text-rc-mist">
                  <span className="font-semibold text-rc-cream">{coverage.gap.marketRate}%</span> on {coverage.gap.label.toLowerCase()}, against <span className="font-semibold text-rc-cream">{coverage.gap.yourRate}%</span> from your best card today.
                </p>
                <Link to={`/cards/${slugifyCardName(coverage.gap.marketCard!.name)}`} className="relative mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-rc-cream px-5 text-[14px] font-medium text-rc-ink hover:bg-white">
                  See the card <ArrowRight size={15} />
                </Link>
              </div>
            ) : (
              <div className="rounded-[28px] bg-rc-pistachio p-6 sm:p-7">
                <p className="font-serif text-[22px] font-semibold text-rc-ink">Your wallet is close to the best on the market.</p>
                <p className="mt-2 text-[15px] text-rc-ink/70">No single card would add a point or more on any kind of spend.</p>
              </div>
            )}
            <Link to="/app/discover" className="mt-3 flex items-center justify-between rounded-[22px] border border-rc-ink/[0.08] bg-rc-paper px-5 py-4 text-[15px] font-medium text-rc-ink hover:bg-white">
              See all picks for you <ArrowRight size={16} className="text-rc-forest" />
            </Link>
          </section>
        </div>
      )}

      <AnimatePresence>
        {adding && <AddCardModal onClose={() => setAdding(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {selected && (
          <CardDetailsModal
            card={selected}
            onClose={() => setSelected(null)}
            onRemove={async () => { await deleteUserCard.mutateAsync(selected.id); }}
          />
        )}
      </AnimatePresence>
    </PageContainer>
  );
}
