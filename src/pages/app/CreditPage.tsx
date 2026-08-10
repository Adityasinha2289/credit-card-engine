import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Scale, Wallet, ChevronRight, Search, X, Star,
  Utensils, ShoppingBag, Plane, ShoppingCart, Fuel, Film, Zap,
  HeartPulse, Car, Music, Tag, ExternalLink, Plus, Trophy, Check,
  CreditCard, ArrowRight, PlaneTakeoff, Info, Circle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDashboardStore } from '../../features/dashboard/store/dashboardStore';
import { PageContainer } from '../../components/shared/PageContainer';
import { cn } from '../../lib/utils';
import {
  recommendCards,
  CATEGORIES_LIST,
  type UserProfile,
  type RecommendedCard,
} from '../../features/finix/lib/recommendEngine';
import { CARD_DATASET, type FinixCard, type SpendCategory } from '../../features/finix/data/cardDataset';
import { getCardTheme } from '../../features/finix/config/cardThemeRegistry';

// ─────────────────────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function formatINR(val: number): string {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)} Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)} Lakh`;
  if (val >= 1000) return `₹${(val / 1000).toFixed(0)}K`;
  if (val === 0) return '₹0';
  return `₹${val.toLocaleString('en-IN')}`;
}

const CATEGORY_ICONS: Record<string, any> = {
  dining: Utensils, shopping: ShoppingBag, travel: Plane,
  groceries: ShoppingCart, fuel: Fuel, entertainment: Film,
  utilities: Zap, health: HeartPulse, transport: Car,
  subscriptions: Music, other: Tag,
};

const BANK_APPLY_URLS: Record<string, string> = {
  'HDFC': 'https://www.hdfcbank.com/personal/pay/cards/credit-cards',
  'SBI': 'https://www.sbicard.com/en/apply-now.page',
  'ICICI': 'https://www.icicibank.com/card/credit-cards',
  'Axis': 'https://www.axisbank.com/retail/cards/credit-card',
  'Kotak': 'https://www.kotak.com/en/personal-banking/cards/credit-cards.html',
  'AMEX': 'https://www.americanexpress.com/in/credit-cards/',
  'RBL': 'https://www.rblbank.com/credit-cards',
  'IndusInd': 'https://www.indusind.com/in/en/personal/cards/credit-card.html',
  'YES': 'https://www.yesbank.in/personal-banking/yes-individual/cards/credit-cards',
  'BOB': 'https://www.bankofbaroda.in/personal-banking/digital-products/cards/credit-cards',
  'HSBC': 'https://www.hsbc.co.in/credit-cards/',
  'SC': 'https://www.sc.com/in/credit-cards/',
  'AU': 'https://www.aubank.in/personal-banking/credit-card',
  'Federal': 'https://www.federalbank.co.in/credit-card',
  'IDFC': 'https://www.idfcfirstbank.com/credit-card',
  'OneCard': 'https://www.getonecard.app/',
};

function getRate(card: FinixCard, cat: SpendCategory): number {
  const r = card.rewards?.find((x) => x.category === cat);
  return r ? r.rate : card.baseRewardRate;
}

function getWinnerIdx(cards: FinixCard[], getValue: (c: FinixCard) => number, higherIsBetter = true): number {
  if (cards.length < 2) return -1;
  const vals = cards.map(getValue);
  const best = higherIsBetter ? Math.max(...vals) : Math.min(...vals);
  const bestIdx = vals.findIndex((v) => v === best);
  return vals.filter((v) => v === best).length === 1 ? bestIdx : -1;
}

type CreditTab = 'recommend' | 'compare' | 'wallet';

const TABS: { id: CreditTab; label: string; Icon: any }[] = [
  { id: 'recommend', label: 'Recommend', Icon: Sparkles },
  { id: 'compare', label: 'Compare', Icon: Scale },
  { id: 'wallet', label: 'My Wallet', Icon: Wallet },
];

const COMPARE_CATEGORIES: { key: SpendCategory; label: string }[] = [
  { key: 'dining', label: 'Dining' },
  { key: 'travel', label: 'Travel' },
  { key: 'shopping', label: 'Shopping' },
  { key: 'groceries', label: 'Groceries' },
  { key: 'fuel', label: 'Fuel' },
  { key: 'entertainment', label: 'Entertainment' },
  { key: 'utilities', label: 'Utilities' },
  { key: 'health', label: 'Health' },
];

// ─────────────────────────────────────────────────────────────────────────────
//  RECOMMEND TAB
// ─────────────────────────────────────────────────────────────────────────────

function RecommendTab({ onSwitchToCompare }: { onSwitchToCompare: () => void }) {
  const profile = useDashboardStore((s) => s.profile);
  const userCards = useDashboardStore((s) => s.userCards);

  const [categories, setCategories] = useState<SpendCategory[]>([]);
  const [wantsLounge, setWantsLounge] = useState(false);
  const [results, setResults] = useState<RecommendedCard[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const toggleCategory = useCallback((cat: SpendCategory) => {
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat].slice(0, 4)
    );
  }, []);

  function handleRecommend() {
    const userProfile: UserProfile = {
      annualIncome: profile?.salary || 1500000,
      cibilScore: profile?.creditScore || 750,
      topCategories: categories,
      maxAnnualFee: 0,
      wantsLounge,
    };
    const newResults = recommendCards(userProfile, 5);
    setResults(newResults);
    setHasSearched(true);
  }

  return (
    <div className="space-y-12">
      {/* DECISION FLOW: INTENT CAPTURE */}
      <section className="space-y-8 max-w-3xl">
        
        {/* A. YOUR PROFILE (Contextual Strip) */}
        <div className="space-y-2">
          <p className="text-[10px] font-semibold text-[#737C77] uppercase tracking-wider pl-1">Your Financial Context</p>
          <div className="flex flex-wrap gap-[1px] bg-[#0F1412] border border-[#0F1412] rounded-2xl overflow-hidden p-[1px]">
            <div className="flex flex-col px-5 py-3 bg-[#131917] flex-1 min-w-[120px] rounded-tl-[15px] rounded-bl-[15px] md:rounded-bl-none">
              <span className="text-[10px] text-[#737C77] uppercase tracking-wider mb-0.5">Income</span>
              <span className="text-sm text-[#F2F4F2] font-medium">{formatINR(profile?.salary || 1500000)}<span className="text-[#737C77] font-normal text-xs">/yr</span></span>
            </div>
            <div className="flex flex-col px-5 py-3 bg-[#131917] flex-1 min-w-[120px] rounded-tr-[15px] md:rounded-tr-none">
              <span className="text-[10px] text-[#737C77] uppercase tracking-wider mb-0.5">CIBIL</span>
              <span className="text-sm text-[#F2F4F2] font-medium">{profile?.creditScore || 750}</span>
            </div>
            {profile?.primaryGoal && (
              <div className="flex flex-col px-5 py-3 bg-[#131917] flex-1 min-w-[120px]">
                <span className="text-[10px] text-[#737C77] uppercase tracking-wider mb-0.5">Primary Goal</span>
                <span className="text-sm text-[#F2F4F2] font-medium">{profile.primaryGoal}</span>
              </div>
            )}
            <div className="flex flex-col px-5 py-3 bg-[#131917] flex-1 min-w-[120px] rounded-bl-[15px] md:rounded-bl-none rounded-br-[15px]">
              <span className="text-[10px] text-[#737C77] uppercase tracking-wider mb-0.5">Connected</span>
              <span className="text-sm text-[#F2F4F2] font-medium">{userCards.length} cards</span>
            </div>
          </div>
        </div>

        {/* B. SPENDING PRIORITIES */}
        <div className="bg-[#0F1412] border border-[#242D29] rounded-[2rem] p-6 md:p-10 space-y-8">
          <div className="space-y-5">
            <div className="flex items-end justify-between">
              <div>
                <h3 className="text-xl font-display font-medium text-[#F2F4F2]">What matters most to you?</h3>
                <p className="text-sm text-[#737C77] mt-1">Choose up to 4 spending areas to calibrate your recommendation.</p>
              </div>
              <div className="hidden md:flex text-xs font-mono px-3 py-1 bg-[#131917] rounded-lg text-[#A0AAA5] border border-[#242D29]">
                <span className={categories.length > 0 ? "text-[#F2F4F2] font-medium" : ""}>{categories.length}</span> / 4 selected
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {CATEGORIES_LIST.map(({ value, label }) => {
                const isSelected = categories.includes(value);
                const Icon = CATEGORY_ICONS[value] || Tag;
                return (
                  <button
                    key={value}
                    onClick={() => toggleCategory(value)}
                    className={cn(
                      'flex items-center gap-3 p-4 rounded-2xl text-sm font-medium transition-all duration-200 border text-left group',
                      isSelected
                        ? 'bg-[#181F1C] border-[#384640] text-[#F2F4F2] shadow-sm'
                        : 'bg-[#131917] border-[#242D29] text-[#A0AAA5] hover:border-[#384640] hover:text-[#F2F4F2] hover:bg-[#181F1C]'
                    )}
                  >
                    <div className={cn(
                      'p-2 rounded-xl transition-colors',
                      isSelected ? 'bg-emerald-500/10' : 'bg-[#242D29] group-hover:bg-[#384640]'
                    )}>
                      <Icon size={16} className={isSelected ? 'text-emerald-400' : 'text-[#A0AAA5] group-hover:text-[#F2F4F2]'} />
                    </div>
                    {label}
                  </button>
                );
              })}
            </div>
            <div className="md:hidden flex text-xs font-mono px-3 py-1 bg-[#131917] rounded-lg text-[#A0AAA5] border border-[#242D29] w-fit">
              <span className={categories.length > 0 ? "text-[#F2F4F2] font-medium" : ""}>{categories.length}</span> / 4 selected
            </div>
          </div>

          {/* C. LOUNGE / PREFERENCE */}
          <div className="pt-8 border-t border-[#242D29]">
            <div className="flex items-center justify-between">
              <div className="flex gap-4 items-start">
                <div className="p-3 bg-[#131917] rounded-2xl border border-[#242D29]">
                  <PlaneTakeoff size={20} className="text-[#A0AAA5]" />
                </div>
                <div>
                  <h4 className="text-[10px] font-semibold text-[#737C77] uppercase tracking-wider mb-1">Travel Benefits</h4>
                  <p className="text-sm font-medium text-[#F2F4F2]">Prioritize cards with airport lounge access</p>
                </div>
              </div>
              <button
                onClick={() => setWantsLounge(!wantsLounge)}
                className={cn(
                  'w-12 h-7 rounded-full transition-all duration-300 relative border',
                  wantsLounge ? 'bg-emerald-500/20 border-emerald-500/50' : 'bg-[#131917] border-[#384640]'
                )}
              >
                <div className={cn(
                  'w-5 h-5 rounded-full absolute top-[3px] transition-all duration-300 shadow-sm',
                  wantsLounge ? 'left-[22px] bg-emerald-400' : 'left-1 bg-[#737C77]'
                )} />
              </button>
            </div>
          </div>

          {/* CTA */}
          <div className="pt-6">
            <button
              onClick={handleRecommend}
              disabled={categories.length === 0}
              className={cn(
                'w-full py-4 rounded-xl font-medium text-sm transition-all duration-300 flex items-center justify-center gap-2',
                categories.length > 0
                  ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30'
                  : 'bg-[#131917] text-[#737C77] border border-[#242D29] cursor-not-allowed'
              )}
            >
              Tell RenoCred what matters <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* RESULTS */}
      {hasSearched && (
        <section className="space-y-6 pt-10 border-t border-[#242D29]">
          <div className="space-y-1">
            <h3 className="text-[10px] font-bold text-[#737C77] uppercase tracking-widest">Your Best Match</h3>
            <p className="text-2xl font-display font-medium text-[#F2F4F2]">Cards worth considering</p>
          </div>

          {results.length === 0 ? (
            <div className="bg-[#0F1412] border border-[#242D29] rounded-[2rem] p-12 text-center space-y-4 max-w-3xl">
              <div className="w-16 h-16 mx-auto bg-[#131917] rounded-2xl flex items-center justify-center border border-[#242D29]">
                <Search size={24} className="text-[#737C77]" />
              </div>
              <div>
                <p className="text-[#F2F4F2] font-medium text-lg">No eligible cards found</p>
                <p className="text-sm text-[#737C77] mt-2 max-w-sm mx-auto leading-relaxed">
                  Try adjusting your income or CIBIL score in your profile, or broaden your category selection to see more matches.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col xl:flex-row gap-6 max-w-6xl">
              {/* Primary Pick (55-60% width) */}
              <div className="xl:w-[58%]">
                {results.slice(0, 1).map((card) => {
                  const theme = getCardTheme(card.id);
                  const applyUrl = BANK_APPLY_URLS[card.bank];
                  const estimatedHighRate = Math.max(...(card.rewards?.map(r=>r.rate) || [0]), card.baseRewardRate);
                  
                  return (
                    <motion.div
                      key={card.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-[#0F1412] border border-[#242D29] rounded-[2rem] overflow-hidden flex flex-col h-full relative"
                    >
                      <div className="px-8 py-6 border-b border-[#242D29] flex items-center justify-between bg-[#131917]">
                        <div className="flex items-center gap-2">
                          <Trophy size={14} className="text-[#A0AAA5]" />
                          <span className="text-[10px] font-bold text-[#F2F4F2] tracking-widest uppercase">RenoCred Pick</span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-2xl font-mono text-emerald-400 font-medium leading-none">{card.matchPercent}</span>
                          <span className="text-[9px] font-bold text-emerald-500/70 tracking-widest uppercase mt-1">Match</span>
                        </div>
                      </div>

                      <div className="p-8 md:p-10 flex flex-col items-center flex-1">
                        <div
                          className="w-56 h-36 md:w-64 md:h-40 rounded-2xl shadow-xl relative overflow-hidden ring-1 ring-white/10 mb-8"
                          style={{ background: `linear-gradient(135deg, ${theme.gradientFrom}, ${theme.gradientTo})` }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                          <div className="absolute bottom-4 left-5 right-5">
                            <p className="text-white/90 text-sm font-mono tracking-wider opacity-80">•••• •••• ••••</p>
                            <p className="text-white/90 text-xs mt-1.5 font-medium truncate tracking-wide">{card.bank}</p>
                          </div>
                        </div>

                        <div className="w-full text-center mb-8">
                          <h4 className="text-2xl md:text-3xl font-display font-medium text-[#F2F4F2] leading-tight mb-2">{card.name}</h4>
                          <p className="text-sm text-[#A0AAA5]">{card.network}</p>
                        </div>

                        {card.highlights && card.highlights.length > 0 && (
                          <div className="w-full bg-[#131917] rounded-2xl p-6 border border-[#242D29] mb-8">
                            <h5 className="text-[10px] font-semibold text-[#737C77] uppercase tracking-wider mb-4">Why RenoCred thinks this fits you</h5>
                            <ul className="space-y-3">
                              {card.highlights.slice(0, 3).map((h, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm text-[#A0AAA5] leading-relaxed">
                                  <div className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-emerald-500/50" />
                                  <span>{h}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="w-full grid grid-cols-2 gap-4 mt-auto border-t border-[#242D29] pt-6 mb-6">
                          <div>
                            <div className="text-[10px] font-semibold text-[#737C77] uppercase tracking-wider mb-1">Annual Fee</div>
                            <div className="text-base font-medium text-[#F2F4F2]">{card.annualFee === 0 ? 'Lifetime Free' : formatINR(card.annualFee)}</div>
                          </div>
                          <div>
                            <div className="text-[10px] font-semibold text-[#737C77] uppercase tracking-wider mb-1">Reward Rate</div>
                            <div className="text-base font-medium text-[#F2F4F2]">{card.baseRewardRate}% - {estimatedHighRate}%</div>
                          </div>
                        </div>

                        <div className="w-full flex items-center gap-3">
                          <button
                            onClick={onSwitchToCompare}
                            className="flex-1 py-3.5 rounded-xl bg-[#181F1C] text-[#A0AAA5] text-sm font-medium border border-[#384640] hover:text-[#F2F4F2] transition-colors"
                          >
                            Compare
                          </button>
                          {applyUrl && (
                            <a
                              href={applyUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 py-3.5 rounded-xl bg-emerald-500/10 text-emerald-400 text-sm font-medium border border-emerald-500/20 hover:bg-emerald-500/20 flex items-center justify-center gap-2 transition-colors"
                            >
                              Apply <ExternalLink size={14} />
                            </a>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Secondary Alternatives (42% width) */}
              <div className="xl:w-[42%] flex flex-col gap-4">
                <p className="text-[10px] font-semibold text-[#737C77] uppercase tracking-wider mb-2 pl-2">Strong Alternatives</p>
                {results.slice(1, 4).map((card, idx) => {
                  const theme = getCardTheme(card.id);
                  const applyUrl = BANK_APPLY_URLS[card.bank];
                  return (
                    <motion.div
                      key={card.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (idx + 1) * 0.1 }}
                      className="group bg-[#0F1412] border border-[#242D29] hover:border-[#384640] rounded-2xl overflow-hidden transition-all duration-300 flex"
                    >
                      <div className="w-12 flex-shrink-0 bg-[#131917] border-r border-[#242D29] flex flex-col items-center pt-6">
                        <span className="text-xs font-mono text-[#737C77]">0{idx + 2}</span>
                      </div>
                      <div className="p-5 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="text-base font-medium text-[#F2F4F2] leading-tight mb-1">{card.name}</h4>
                            <p className="text-[10px] text-[#A0AAA5] uppercase tracking-wider">{card.bank}</p>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-lg font-mono text-[#F2F4F2] font-medium leading-none">{card.matchPercent}</span>
                            <span className="text-[8px] font-bold text-[#737C77] tracking-widest uppercase mt-1">Match</span>
                          </div>
                        </div>

                        {card.highlights && card.highlights.length > 0 && (
                          <p className="text-xs text-[#A0AAA5] leading-relaxed mb-5 line-clamp-2">
                            {card.highlights[0]}
                          </p>
                        )}

                        <div className="mt-auto flex items-center justify-between pt-4 border-t border-[#242D29]">
                          <div>
                            <div className="text-[9px] font-semibold text-[#737C77] uppercase tracking-wider mb-0.5">Fee</div>
                            <div className="text-xs font-medium text-[#F2F4F2]">{card.annualFee === 0 ? 'Free' : formatINR(card.annualFee)}</div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={onSwitchToCompare}
                              className="px-3 py-1.5 rounded-lg bg-[#181F1C] text-[#A0AAA5] text-xs font-medium border border-[#384640] hover:text-[#F2F4F2] transition-colors"
                            >
                              Compare
                            </button>
                            {applyUrl && (
                              <a
                                href={applyUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 rounded-lg bg-[#131917] text-emerald-400 text-xs font-medium border border-[#242D29] hover:border-emerald-500/30 transition-colors"
                              >
                                Apply
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  COMPARE TAB
// ─────────────────────────────────────────────────────────────────────────────

function CardPickerModal({ onSelect, onClose, excludeIds }: {
  onSelect: (card: FinixCard) => void;
  onClose: () => void;
  excludeIds: string[];
}) {
  const [query, setQuery] = useState('');
  const [bankFilter, setBankFilter] = useState('');

  const banks = useMemo(() => [...new Set(CARD_DATASET.map(c => c.bank))].sort(), []);

  const filtered = CARD_DATASET
    .filter((c) => !excludeIds.includes(c.id))
    .filter((c) => !bankFilter || c.bank === bankFilter)
    .filter((c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.bank.toLowerCase().includes(query.toLowerCase())
    );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#070A08]/80 backdrop-blur-sm"
      />
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        className="relative w-full max-w-lg bg-[#0F1412] rounded-[2rem] shadow-2xl border border-[#242D29] overflow-hidden flex flex-col max-h-[80vh]"
      >
        <div className="flex items-center justify-between p-6 pb-4 border-b border-[#242D29]">
          <div>
            <h3 className="text-lg font-display font-medium text-[#F2F4F2]">Build your shortlist</h3>
            <p className="text-xs text-[#737C77] mt-1">{CARD_DATASET.length} cards available in the database</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-[#737C77] hover:text-[#F2F4F2] hover:bg-[#181F1C] transition-all">
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-4 flex flex-col gap-4">
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#737C77]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by card name or bank..."
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-[#131917] border border-[#242D29] text-sm text-[#F2F4F2] placeholder:text-[#737C77] focus:outline-none focus:border-[#384640] transition-all"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setBankFilter('')}
              className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border',
                !bankFilter ? 'bg-[#181F1C] text-[#F2F4F2] border-[#384640]' : 'bg-[#131917] text-[#737C77] border-[#242D29] hover:text-[#A0AAA5] hover:border-[#384640]'
              )}
            >All</button>
            {banks.slice(0, 6).map(bank => (
              <button
                key={bank}
                onClick={() => setBankFilter(bank === bankFilter ? '' : bank)}
                className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border',
                  bankFilter === bank ? 'bg-[#181F1C] text-[#F2F4F2] border-[#384640]' : 'bg-[#131917] text-[#737C77] border-[#242D29] hover:text-[#A0AAA5] hover:border-[#384640]'
                )}
              >{bank}</button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-3">
          {filtered.slice(0, 30).map(card => {
            const theme = getCardTheme(card.id);
            return (
              <button
                key={card.id}
                onClick={() => { onSelect(card); onClose(); }}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-[#131917] border border-[#242D29] hover:border-[#384640] transition-all text-left group"
              >
                <div
                  className="w-16 h-10 rounded-lg flex-shrink-0 shadow-md ring-1 ring-white/10"
                  style={{ background: `linear-gradient(135deg, ${theme.gradientFrom}, ${theme.gradientTo})` }}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[#F2F4F2] truncate">{card.name}</p>
                  <p className="text-[10px] text-[#737C77] mt-0.5">{card.bank} · {card.network} · {card.annualFee === 0 ? 'Free' : formatINR(card.annualFee)}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#181F1C] flex items-center justify-center text-[#737C77] group-hover:text-[#F2F4F2] transition-all flex-shrink-0 border border-[#242D29] group-hover:border-[#384640]">
                  <Plus size={14} />
                </div>
              </button>
            );
          })}
          {filtered.length === 0 && (
            <div className="text-center py-12 space-y-3">
              <Search size={24} className="mx-auto text-[#384640]" />
              <p className="text-sm text-[#737C77]">No cards match your search.</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function CompareTab() {
  const [selectedCards, setSelectedCards] = useState<FinixCard[]>([]);
  const [showPicker, setShowPicker] = useState(false);

  const addCard = (card: FinixCard) => {
    if (selectedCards.length < 4 && !selectedCards.find((c) => c.id === card.id))
      setSelectedCards([...selectedCards, card]);
  };
  const removeCard = (id: string) => setSelectedCards(selectedCards.filter((c) => c.id !== id));

  const overallScore = (card: FinixCard) => {
    const rewardScore = COMPARE_CATEGORIES.reduce((sum, { key }) => sum + getRate(card, key), 0);
    const feeScore = card.annualFee === 0 ? 30 : card.annualFee < 1000 ? 20 : card.annualFee < 5000 ? 10 : 0;
    const loungeScore = (card.loungeAccess ?? 0) * 2;
    return rewardScore + feeScore + loungeScore;
  };

  const scores = selectedCards.map(overallScore);
  const maxScore = scores.length > 0 ? Math.max(...scores) : 1;
  const hasCards = selectedCards.length >= 2;
  const winIdx = getWinnerIdx(selectedCards, overallScore);
  const winnerCard = winIdx !== -1 ? selectedCards[winIdx] : null;

  return (
    <div className="space-y-8 max-w-5xl">
      {/* HEADER & PICKER GRID */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h3 className="text-[10px] font-semibold text-[#737C77] uppercase tracking-wider mb-1">Compare Your Shortlist</h3>
            <p className="text-2xl font-display font-medium text-[#F2F4F2]">See what actually differs.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-xs font-mono px-3 py-1.5 bg-[#0F1412] rounded-lg text-[#A0AAA5] border border-[#242D29]">
              <span className={selectedCards.length > 0 ? "text-[#F2F4F2] font-medium" : ""}>{selectedCards.length}</span> of 4 selected
            </div>
            {selectedCards.length > 0 && (
              <button
                onClick={() => setSelectedCards([])}
                className="text-xs font-medium text-[#737C77] hover:text-red-400 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Card Slots */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, slot) => {
            const card = selectedCards[slot];
            if (card) {
              const theme = getCardTheme(card.id);
              return (
                <motion.div
                  key={card.id}
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="relative rounded-2xl border border-[#242D29] bg-[#0F1412] p-5 flex flex-col gap-4 group hover:border-[#384640] transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div
                      className="w-16 h-10 rounded-lg shadow-sm ring-1 ring-white/10"
                      style={{ background: `linear-gradient(135deg, ${theme.gradientFrom}, ${theme.gradientTo})` }}
                    />
                  </div>

                  <div className="min-h-[44px]">
                    <p className="text-sm font-medium text-[#F2F4F2] leading-snug line-clamp-2">{card.name}</p>
                    <p className="text-[10px] text-[#737C77] mt-1 uppercase tracking-wider">{card.bank}</p>
                  </div>
                  
                  <div className="mt-auto pt-4 border-t border-[#242D29] space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-[#737C77]">Fee</span>
                      <span className="text-xs font-medium text-[#F2F4F2]">{card.annualFee === 0 ? 'Free' : formatINR(card.annualFee)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => removeCard(card.id)}
                    className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#131917] flex items-center justify-center text-[#737C77] hover:text-[#F2F4F2] opacity-0 group-hover:opacity-100 transition-all border border-[#242D29] hover:border-[#384640]"
                  >
                    <X size={12} />
                  </button>
                </motion.div>
              );
            }
            return (
              <button
                key={`slot-${slot}`}
                onClick={() => setShowPicker(true)}
                className="rounded-2xl border border-dashed border-[#242D29] bg-[#0F1412]/50 h-[210px] flex flex-col items-center justify-center gap-3 text-[#737C77] hover:border-[#384640] hover:text-[#A0AAA5] transition-all group"
              >
                <div className="w-10 h-10 rounded-full bg-[#131917] flex items-center justify-center border border-[#242D29] group-hover:bg-[#181F1C] group-hover:border-[#384640] transition-all">
                  <Plus size={16} />
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-wider">Build Shortlist</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Comparison Matrix */}
      {hasCards && (
        <section className="space-y-6">
          {winnerCard && (
            <div className="bg-[#0F1412] border border-[#242D29] rounded-2xl p-6 md:px-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Trophy size={14} className="text-[#A0AAA5]" />
                  <span className="text-[10px] font-bold text-[#F2F4F2] tracking-widest uppercase">RenoCred Pick · Winner</span>
                </div>
                <h4 className="text-lg font-display font-medium text-[#F2F4F2] mb-1">
                  {winnerCard.name}
                </h4>
                <p className="text-sm text-[#A0AAA5]">
                  Calculated as the highest overall value across rewards, fees, and travel benefits.
                </p>
              </div>
              <div className="shrink-0 text-right">
                <span className="text-2xl font-mono font-medium text-emerald-400 leading-none">{Math.round((Math.max(...scores) / maxScore) * 100)}</span>
                <span className="text-[9px] font-bold text-emerald-500/70 tracking-widest uppercase ml-1 block mt-1">Score</span>
              </div>
            </div>
          )}

          <div className="bg-[#0F1412] border border-[#242D29] rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#242D29] bg-[#0F1412]">
                    <th className="text-left p-5 text-[10px] text-[#737C77] uppercase tracking-wider font-semibold w-48 sticky left-0 bg-[#0F1412] z-10 border-r border-[#242D29]">Feature</th>
                    {selectedCards.map((card, i) => (
                      <th key={card.id} className="p-5 text-center min-w-[140px] border-r border-[#242D29]/50 last:border-r-0">
                        <p className="text-sm font-medium text-[#F2F4F2] truncate max-w-[140px] mx-auto">{card.name}</p>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#242D29]">
                  
                  {/* 1. COST */}
                  <tr className="bg-[#131917]">
                    <td colSpan={selectedCards.length + 1} className="px-5 py-2.5 text-[9px] font-bold text-[#A0AAA5] uppercase tracking-widest sticky left-0">Cost</td>
                  </tr>
                  <tr>
                    <td className="p-5 text-xs text-[#A0AAA5] sticky left-0 bg-[#0F1412] z-10 border-r border-[#242D29]">Annual Fee</td>
                    {selectedCards.map((card, i) => {
                      const w = getWinnerIdx(selectedCards, c => c.annualFee, false);
                      return (
                        <td key={card.id} className="p-5 text-center border-r border-[#242D29]/50 last:border-r-0">
                          <span className={cn('text-xs font-medium', w === i ? 'text-[#F2F4F2]' : 'text-[#A0AAA5]')}>
                            {card.annualFee === 0 ? 'Free' : formatINR(card.annualFee)}
                          </span>
                        </td>
                      );
                    })}
                  </tr>

                  {/* 2. REWARDS */}
                  <tr className="bg-[#131917]">
                    <td colSpan={selectedCards.length + 1} className="px-5 py-2.5 text-[9px] font-bold text-[#A0AAA5] uppercase tracking-widest sticky left-0">Rewards</td>
                  </tr>
                  <tr>
                    <td className="p-5 text-xs text-[#A0AAA5] sticky left-0 bg-[#0F1412] z-10 border-r border-[#242D29]">Base Rate</td>
                    {selectedCards.map((card, i) => {
                      const w = getWinnerIdx(selectedCards, c => c.baseRewardRate);
                      return (
                        <td key={card.id} className="p-5 text-center border-r border-[#242D29]/50 last:border-r-0">
                          <span className={cn('text-sm font-mono', w === i ? 'text-emerald-400 font-medium' : 'text-[#F2F4F2]')}>
                            {card.baseRewardRate}%
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                  {COMPARE_CATEGORIES.map(({ key, label }) => {
                    // Only show rows where at least one card has a special rate for this category
                    const hasSpecialRate = selectedCards.some(c => c.rewards?.some(r => r.category === key && r.rate > c.baseRewardRate));
                    if (!hasSpecialRate) return null;
                    
                    return (
                    <tr key={key}>
                      <td className="p-5 text-xs text-[#A0AAA5] sticky left-0 bg-[#0F1412] z-10 border-r border-[#242D29]">{label}</td>
                      {selectedCards.map((card, i) => {
                        const rate = getRate(card, key);
                        const w = getWinnerIdx(selectedCards, c => getRate(c, key));
                        const isSpecial = card.rewards?.some(r => r.category === key && r.rate > card.baseRewardRate);
                        return (
                          <td key={card.id} className="p-5 text-center border-r border-[#242D29]/50 last:border-r-0">
                            <span className={cn('text-sm font-mono', w === i ? 'text-emerald-400 font-medium' : isSpecial ? 'text-[#F2F4F2]' : 'text-[#737C77]')}>
                              {rate}%
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                    );
                  })}

                  {/* 3. BENEFITS */}
                  <tr className="bg-[#131917]">
                    <td colSpan={selectedCards.length + 1} className="px-5 py-2.5 text-[9px] font-bold text-[#A0AAA5] uppercase tracking-widest sticky left-0">Benefits</td>
                  </tr>
                  <tr>
                    <td className="p-5 text-xs text-[#A0AAA5] sticky left-0 bg-[#0F1412] z-10 border-r border-[#242D29]">Lounge Access</td>
                    {selectedCards.map((card, i) => {
                      const w = getWinnerIdx(selectedCards, c => c.loungeAccess ?? 0);
                      return (
                        <td key={card.id} className="p-5 text-center border-r border-[#242D29]/50 last:border-r-0">
                          <span className={cn('text-xs font-medium', w === i && card.loungeAccess ? 'text-[#F2F4F2]' : 'text-[#737C77]')}>
                            {card.loungeAccess ? `${card.loungeAccess}/yr` : '—'}
                          </span>
                        </td>
                      );
                    })}
                  </tr>

                  {/* 4. VALUE (OVERALL) */}
                  <tr className="bg-[#131917]">
                    <td colSpan={selectedCards.length + 1} className="px-5 py-2.5 text-[9px] font-bold text-[#A0AAA5] uppercase tracking-widest sticky left-0">Reno Cred Score</td>
                  </tr>
                  <tr>
                    <td className="p-5 text-xs text-[#F2F4F2] font-semibold sticky left-0 bg-[#0F1412] z-10 border-r border-[#242D29]">Overall Score</td>
                    {selectedCards.map((card, i) => {
                      const pct = Math.round((scores[i] / maxScore) * 100);
                      const w = getWinnerIdx(selectedCards, overallScore);
                      return (
                        <td key={card.id} className="p-5 text-center border-r border-[#242D29]/50 last:border-r-0">
                          <span className={cn('text-lg font-mono font-medium', w === i ? 'text-emerald-400' : 'text-[#F2F4F2]')}>
                            {pct}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      <AnimatePresence>
        {showPicker && (
          <CardPickerModal
            onSelect={addCard}
            onClose={() => setShowPicker(false)}
            excludeIds={selectedCards.map(c => c.id)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  MY WALLET TAB
// ─────────────────────────────────────────────────────────────────────────────

function MyWalletTab() {
  const navigate = useNavigate();
  const { userCards } = useDashboardStore();

  return (
    <section className="bg-[#0F1412] border border-[#242D29] rounded-[2rem] p-10 md:p-16 flex flex-col items-center text-center space-y-8 max-w-3xl mx-auto shadow-sm">
      <div className="w-16 h-16 rounded-2xl bg-[#131917] border border-[#242D29] flex items-center justify-center">
        <Wallet size={24} className="text-[#A0AAA5]" />
      </div>

      <div className="space-y-4 max-w-md">
        <div>
          <h3 className="text-[10px] font-bold text-[#737C77] uppercase tracking-widest mb-3">My Wallet</h3>
          <h4 className="text-2xl font-display font-medium text-[#F2F4F2] leading-tight">
            You already own the cards.<br/>Now make every transaction smarter.
          </h4>
        </div>
        
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#131917] border border-[#242D29] rounded-xl text-sm font-medium text-[#F2F4F2]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          {userCards.length} payment method{userCards.length !== 1 ? 's' : ''} connected
        </div>
      </div>

      <div className="pt-2">
        <button
          onClick={() => navigate('/app/wallet')}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#181F1C] text-[#F2F4F2] font-medium text-sm hover:bg-[#242D29] border border-[#384640] transition-colors"
        >
          Open Wallet Intelligence <ArrowRight size={14} />
        </button>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  CREDIT PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function CreditPage() {
  const [activeTab, setActiveTab] = useState<CreditTab>('recommend');

  return (
    <PageContainer hideHeader>
      <div className="w-full min-h-screen text-[#F2F4F2] pb-24 md:pb-32 px-4 md:px-8 max-w-[1400px] mx-auto font-body">

        {/* COMMAND HEADER (Quiet Editorial Hierarchy) */}
        <header className="pt-6 md:pt-10 pb-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 w-fit">
              <span className="text-[10px] font-bold tracking-widest uppercase text-[#737C77]">Credit Intelligence</span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl tracking-tight text-[#F2F4F2] max-w-2xl">
              Find the right credit.<br/>Make every card count.
            </h1>
            <p className="text-[#A0AAA5] text-sm md:text-base max-w-xl leading-relaxed">
              Discover cards that fit your financial profile, compare the differences that matter, and optimize the cards you already own.
            </p>
          </div>
        </header>

        {/* SEGMENTED TABS */}
        <div className="mb-10">
          <div className="flex p-1 bg-[#0F1412] border border-[#242D29] rounded-xl w-fit relative z-20">
            {TABS.map(({ id, label, Icon }) => {
              const isActive = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={cn(
                    'relative flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all duration-300',
                    isActive ? 'text-[#F2F4F2]' : 'text-[#737C77] hover:text-[#A0AAA5]'
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="credit-tab-bg-v4"
                      className="absolute inset-0 bg-[#181F1C] border border-[#384640] rounded-lg shadow-sm"
                      transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    {isActive && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                    {!isActive && <Icon size={14} className="opacity-70" />}
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* TAB CONTENT */}
        <div className="relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              {activeTab === 'recommend' && <RecommendTab onSwitchToCompare={() => setActiveTab('compare')} />}
              {activeTab === 'compare' && <CompareTab />}
              {activeTab === 'wallet' && <MyWalletTab />}
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </PageContainer>
  );
}
