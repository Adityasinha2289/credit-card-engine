import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, CreditCard, Wallet, Activity, ArrowRight, ShieldCheck, PieChart, Sparkles, Building2, Smartphone, Info } from 'lucide-react';
import { useDashboardStore } from '../../features/dashboard/store/dashboardStore';
import { PageContainer } from '../../components/shared/PageContainer';
import { CommerceOptimizationService } from '../../features/commerce';
import { walletCoverage } from './walletCoverage';
import { cn } from '../../lib/utils';
import { CreditCard as PhysicalCard } from '../../features/cards/components/CreditCard';
import { toast } from 'sonner';
import AddCardModal from '../../features/dashboard/components/AddCardModal';

import { useUser } from '@clerk/clerk-react';
import { useProfileQuery, useUserCardsQuery } from '../../hooks/queries';
import { useDashboardMutations } from '../../hooks/queries/useDashboardMutations';
import { CardDetailsModal } from '../../features/dashboard/components/CardDetailsModal';
import { UpiSimulator } from '../../features/dashboard/components/v3/UpiSimulator';
import { ArrowChip } from '../../public-platform/site/primitives';
import { CardFan } from '../../public-platform/site/CardFan';
import { SPEND_CATEGORIES, cardsByIds, slugifyCardName } from '../../public-platform/site/swipeMath';
import { Link } from 'react-router-dom';


export default function WalletPage() {
  const { user } = useUser();
  const { data: profileQuery } = useProfileQuery(user?.id);
  const { data: userCardsQuery } = useUserCardsQuery(user?.id);
  const { deleteUserCard } = useDashboardMutations(user?.id);
  const store = useDashboardStore();

  const profile = profileQuery ?? store.profile;
  const userCards = store.userCards;
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [showHowItWorksModal, setShowHowItWorksModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState<any>(null);

  // What a card is best at: its highest published category rate.
  const bestJob = (cardId: string) => {
    const [catalogCard] = cardsByIds([cardId]);
    const top = [...(catalogCard?.rewards ?? [])].sort((x, y) => y.rate - x.rate)[0];
    if (!top) return null;
    return { label: (SPEND_CATEGORIES.find((c) => c.id === top.category)?.label ?? top.category).toLowerCase(), rate: top.rate };
  };

  // How well the wallet covers each kind of spend, from published reward rates.
  const coverage = useMemo(() => walletCoverage(userCards.map((c) => c.id)), [userCards]);

  const totalCards = userCards.length;
  const activeCards = userCards.filter(c => c.status === 'active').length;

  const renderCoverageMatrix = () => {
    if (!coverage) return <p className="text-[14px] text-rc-muted">Add a card to see which spends it covers.</p>;
    return (
      <ul className="space-y-3.5">
        {coverage.rows.map((row) => (
          <li key={row.category} className="grid grid-cols-[7.5rem_1fr_auto] items-center gap-3">
            <span className="text-[14px] text-rc-ink">{row.label}</span>
            <span className="h-2 overflow-hidden rounded-full bg-rc-ink/10">
              <span className="block h-full rounded-full bg-rc-forest transition-all duration-1000 ease-out" style={{ width: `${Math.max(row.coverage, 3)}%` }} />
            </span>
            <span className="w-24 text-right text-[13px] tabular-nums text-rc-muted">
              <span className="font-semibold text-rc-ink">{row.yourRate}%</span> of {row.marketRate}%
            </span>
          </li>
        ))}
      </ul>
    );
  };

  const renderTopPaths = () => {
    if (!coverage) return <p className="text-[14px] text-rc-muted">Add a card to see the best one for each spend.</p>;
    return (
      <ul className="space-y-2">
        {coverage.rows.filter((r) => r.yourCard).map((row) => (
          <li key={row.category} className="flex items-center justify-between gap-4 rounded-[18px] bg-white/70 px-4 py-3">
            <div className="min-w-0">
              <div className="text-[12px] text-rc-muted">{row.label}</div>
              <div className="mt-0.5 truncate text-[15px] font-medium text-rc-ink">{row.yourCard!.name}</div>
            </div>
            <div className="shrink-0 font-display text-[19px] font-semibold tabular-nums text-rc-forest">{row.yourRate}%</div>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <PageContainer
      eyebrow="Wallet"
      title={totalCards > 0 ? <>Every card, <span className="italic">one job each.</span></> : <>Your wallet, <span className="italic">waiting.</span></>}
      subtitle={totalCards > 0
        ? 'What each of your cards is best at, so the right one comes out at the till.'
        : 'Add the cards you own and RenoCred works out which one to use for each kind of spend.'}
      heroStats={totalCards > 0 ? [
        { value: activeCards, label: activeCards === 1 ? 'active card' : 'active cards' },
        ...(coverage ? [{ value: `${coverage.overall}%`, label: 'of the best rates on the market' }] : []),
        ...(coverage ? [{ value: coverage.rows.filter((r) => r.coverage === 100).length, label: 'spends where you hold the top card' }] : []),
      ] : undefined}
      heroActions={(
        <>
          <button type="button" onClick={() => setShowAddModal(true)} className="group inline-flex h-12 items-center gap-3 rounded-full bg-rc-cream pl-6 pr-1.5 text-[14px] font-medium text-rc-ink transition-colors hover:bg-white">
            Add a card <ArrowChip variant="cream" size="md" />
          </button>
          {totalCards > 0 && (
            <Link to="/app/tools/which-card-to-use" className="inline-flex h-12 items-center rounded-full border border-rc-cream/25 px-6 text-[14px] font-medium text-rc-cream transition-colors hover:border-rc-cream/70">
              Which card to use
            </Link>
          )}
        </>
      )}
      heroAside={totalCards > 0 ? (
        <CardFan width={180} cards={userCards.slice(0, 5).map((c) => ({ id: c.id, name: c.label || 'Credit card', bank: c.bank || '', network: c.network }))} />
      ) : undefined}
    >
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* your cards, each with the job it does best */}
        <section className="lg:col-span-7">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-[26px] font-semibold tracking-[-0.02em] text-rc-ink">Your cards</h2>
            <button onClick={() => setShowAddModal(true)} className="inline-flex items-center gap-1.5 rounded-full bg-rc-ink/[0.06] px-4 py-2 text-[13px] font-medium text-rc-ink hover:bg-rc-ink/[0.1]">
              <Plus size={14} /> Add
            </button>
          </div>

          {userCards.length === 0 ? (
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="flex w-full flex-col items-center justify-center rounded-[28px] border border-dashed border-rc-ink/20 px-6 py-14 text-center transition-colors hover:border-rc-ink/40"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rc-pistachio text-rc-ink"><Wallet size={22} /></span>
              <span className="mt-5 font-display text-[24px] font-semibold text-rc-ink">Add your first card</span>
              <span className="mt-1 text-[15px] text-rc-muted">Pick it from the catalogue; no card number needed.</span>
            </button>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2">
              {userCards.map((card) => {
                const job = bestJob(card.id);
                return (
                  <li key={card.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedCard(card)}
                      className={cn(
                        'group block w-full rounded-[28px] border border-rc-ink/10 bg-rc-paper p-3 text-left transition-[transform,border-color,box-shadow] duration-500 hover:-translate-y-1 hover:border-rc-ink/20 hover:shadow-[0_30px_60px_-36px_rgba(15,42,29,0.45)]',
                        card.status !== 'active' && 'opacity-60 grayscale',
                      )}
                    >
                      <PhysicalCard card={card} variant="wallet" className="!max-w-none" />
                      <div className="px-2 pb-1 pt-4">
                        <p className="truncate font-display text-[19px] font-semibold leading-tight text-rc-ink">{card.label}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-[13px]">
                          {job ? (
                            <span className="rounded-full bg-rc-pistachio px-3 py-1 font-semibold text-rc-ink">Best at {job.label}, {job.rate}%</span>
                          ) : (
                            <span className="rounded-full bg-rc-ink/[0.06] px-3 py-1 text-rc-muted">Reward rates not published</span>
                          )}
                          <span className="text-rc-muted">{card.creditLimit > 0 ? `Limit ₹${(card.creditLimit / 100).toLocaleString('en-IN')}` : 'Limit not added'}</span>
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <div className="space-y-6 lg:col-span-5">
          <UpiSimulator />

          {/* where the wallet is strong, and where it isn't */}
          <section className="rounded-[28px] border border-rc-ink/10 bg-rc-paper p-6 md:p-7">
            <h3 className="font-display text-[22px] font-semibold tracking-[-0.01em] text-rc-ink">Where your wallet earns</h3>
            <p className="mt-1 text-[14px] text-rc-muted">Your best rate for each spend, against the best card on the market.</p>
            <div className="mt-6">{renderCoverageMatrix()}</div>

            {coverage?.gap && (
              <div className="mt-6 rounded-[22px] bg-rc-ink p-5 text-rc-cream">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-rc-mist">Most to gain: {coverage.gap.label.toLowerCase()}</p>
                <p className="mt-2 font-display text-[20px] font-semibold leading-snug">{coverage.gap.marketCard!.name}</p>
                <p className="mt-1 text-[14px] leading-relaxed text-rc-mist">
                  {coverage.gap.marketRate}% on {coverage.gap.label.toLowerCase()}, against {coverage.gap.yourRate}% from your best card today.
                </p>
                <Link to={`/app/cards/${slugifyCardName(coverage.gap.marketCard!.name)}`} className="mt-4 inline-flex items-center gap-2 rounded-full bg-rc-cream px-4 py-2 text-[13px] font-medium text-rc-ink hover:bg-white">
                  See the card <ArrowRight size={14} />
                </Link>
              </div>
            )}
          </section>

          {/* the best paths right now */}
          <section className="rounded-[28px] border border-rc-ink/10 bg-rc-paper p-6 md:p-7">
            <button type="button" className="group flex w-full items-start justify-between gap-4 text-left" onClick={() => setShowHowItWorksModal(true)}>
              <span>
                <span className="block font-display text-[22px] font-semibold tracking-[-0.01em] text-rc-ink">Best card by spend</span>
                <span className="mt-1 block text-[14px] text-rc-muted">Which of your cards pays the most for each spend.</span>
              </span>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rc-ink/[0.06] text-rc-muted group-hover:text-rc-ink"><Info size={15} /></span>
            </button>
            <div className="mt-5">{renderTopPaths()}</div>
          </section>
        </div>
      </div>

        {/* ADD PAYMENT METHOD MODAL */}
        <AnimatePresence>
          {showAddModal && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowAddModal(false)}
                className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50"
              />
              <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4">
                <motion.div 
                  initial={{ opacity: 0, y: 50, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 50, scale: 0.95 }}
                  className="w-full max-w-md bg-white border border-gray-300 rounded-[24px] shadow-2xl overflow-hidden pointer-events-auto"
                >
                  <div className="p-6 md:p-8 space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-display text-gray-900">Add Payment Method</h2>
                    <p className="text-gray-600 text-sm">Expand your optimization coverage.</p>
                  </div>
                  
                  <div className="space-y-3">
                    {[
                      { title: 'Credit Card', desc: 'Add a new credit line', icon: CreditCard, action: () => { setShowAddModal(false); setShowAddCardModal(true); } },
                      { title: 'Debit Card', desc: 'Link a bank account', icon: Building2, action: () => toast.info('Debit card support is coming soon!') },
                      { title: 'UPI ID', desc: 'Link for quick payments', icon: Smartphone, action: () => toast.info('UPI ID support is coming soon!') },
                    ].map(type => (
                      <button key={type.title} onClick={type.action} className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-300 hover:bg-gray-100 transition-all text-left group">
                        <div className="w-12 h-12 rounded-xl bg-gray-100/50 border border-white/[0.02] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                          <type.icon size={20} className="text-gray-700 group-hover:text-gray-900" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{type.title}</div>
                          <div className="text-xs text-gray-600 mt-0.5">{type.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>

                  <button 
                    onClick={() => setShowAddModal(false)}
                    className="w-full py-3 rounded-xl bg-transparent hover:bg-gray-100 text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors border border-transparent hover:border-gray-300"
                  >
                    Cancel
                  </button>
                </div>
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showHowItWorksModal && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowHowItWorksModal(false)}
                className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50"
              />
              <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4">
                <motion.div 
                  initial={{ opacity: 0, y: 50, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 50, scale: 0.95 }}
                  className="w-full max-w-md bg-white border border-gray-300 rounded-[24px] shadow-2xl overflow-hidden pointer-events-auto"
                >
                  <div className="p-6 md:p-8 space-y-6">
                  <div className="flex items-center gap-3 text-[#2A9D5C] mb-2">
                    <Sparkles size={20} />
                    <span className="text-xs tracking-widest uppercase font-bold">Intelligence Engine</span>
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-2xl font-display text-gray-900">How we optimize your spending</h2>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      RenoCred acts as a financial co-pilot. By understanding the cards in your wallet, our engine maps out exactly which card to use for every purchase category to maximize your return.
                    </p>
                  </div>
                  
                  <div className="space-y-4 pt-2">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 border border-gray-200">
                        <PieChart size={16} className="text-gray-900" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Category Mapping</h4>
                        <p className="text-xs text-gray-600 mt-1 leading-relaxed">We cross-reference your cards' reward rates across 15+ spend categories like Dining, Travel, and Utilities.</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 border border-gray-200">
                        <ShieldCheck size={16} className="text-gray-900" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Fee & Milestone Tracking</h4>
                        <p className="text-xs text-gray-600 mt-1 leading-relaxed">We factor in annual fee waivers and milestone bonuses so you hit your targets automatically.</p>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => setShowHowItWorksModal(false)}
                    className="w-full mt-2 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium text-sm transition-colors border border-gray-200 hover:border-gray-300"
                  >
                    Got it
                  </button>
                </div>
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showAddCardModal && (
            <AddCardModal onClose={() => setShowAddCardModal(false)} />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {selectedCard && (
            <CardDetailsModal
              card={selectedCard}
              onClose={() => setSelectedCard(null)}
              onRemove={async () => {
                await deleteUserCard.mutateAsync(selectedCard.id);
              }}
            />
          )}
        </AnimatePresence>
    </PageContainer>
  );
}
