import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, CreditCard, ChevronRight, Wallet, Activity, ArrowRight, ShieldCheck, PieChart, Sparkles, Building2, Smartphone, AlertTriangle, Loader2, Info } from 'lucide-react';
import { useDashboardStore } from '../../features/dashboard/store/dashboardStore';
import { PageContainer } from '../../components/shared/PageContainer';
import { CommerceOptimizationService } from '../../features/commerce';
import { loadWalletIntelligence } from './walletIntelligence';
import { cn } from '../../lib/utils';
import { CreditCard as PhysicalCard } from '../../features/cards/components/CreditCard';
import { toast } from 'sonner';
import AddCardModal from '../../features/dashboard/components/AddCardModal';

import { useUser } from '@clerk/clerk-react';
import { useProfileQuery, useUserCardsQuery } from '../../hooks/queries';
import { useDashboardMutations } from '../../hooks/queries/useDashboardMutations';
import { CardDetailsModal } from '../../features/dashboard/components/CardDetailsModal';

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

  const [analysisStatus, setAnalysisStatus] = useState<'loading' | 'success' | 'empty' | 'error'>('loading');
  const [coverageData, setCoverageData] = useState<{name: string, value: number}[]>([]);
  const [topPaths, setTopPaths] = useState<{category: string, card: string, value: number}[]>([]);
  const [availableValue, setAvailableValue] = useState(0);
  const [coveragePercent, setCoveragePercent] = useState(0);

  // Deriving basic stats
  const totalCards = userCards.length;
  const activeCards = userCards.filter(c => c.status === 'active').length;

  useEffect(() => {
    let mounted = true;
    
    async function loadIntelligence() {
      try {
        setAnalysisStatus('loading');
        const userId = profile?.id;
        if (!userId) return;
        const results = await CommerceOptimizationService.optimizeCollection(userId);
        
        if (!mounted) return;
        
        const { isEmpty, coveragePercent, availableValue, coverageData, topPaths } = await loadWalletIntelligence(userId);
        
        if (isEmpty) {
          setAnalysisStatus('empty');
          return;
        }
        
        setCoveragePercent(coveragePercent);
        setAvailableValue(availableValue);
        setCoverageData(coverageData);
        setTopPaths(topPaths);
        setAnalysisStatus('success');

      } catch (err) {
        console.error('Failed to load wallet intelligence', err);
        if (mounted) setAnalysisStatus('error');
      }
    }
    
    loadIntelligence();
    
    return () => { mounted = false; };
  }, [userCards, profile?.id]);

  const renderIntelligenceContent = () => {
    if (analysisStatus === 'loading') {
      return (
        <div className="flex items-center gap-4 text-emerald-400">
          <Loader2 className="animate-spin" size={24} />
          <h3 className="text-xl md:text-2xl font-display leading-tight text-gray-900">
            Analyzing your wallet...
          </h3>
        </div>
      );
    }
    
    if (analysisStatus === 'error') {
      return (
        <div className="flex items-center gap-4 text-amber-500">
          <AlertTriangle size={24} />
          <h3 className="text-xl md:text-2xl font-display leading-tight text-gray-900">
            We couldn't calculate your wallet intelligence right now.
          </h3>
        </div>
      );
    }

    if (analysisStatus === 'empty') {
      return (
        <div className="space-y-2">
          <h3 className="text-xl md:text-2xl font-display leading-tight text-gray-900">
            No optimization paths available yet.
          </h3>
          <p className="text-gray-600">Add more payment methods to unlock intelligence.</p>
        </div>
      );
    }

    return (
      <>
        <h3 className="text-xl md:text-2xl font-display leading-tight text-gray-900">
          RenoCred can optimize most of your everyday spending with your current wallet.
        </h3>
        <div className="flex flex-wrap gap-8">
          <div>
            <div className="text-3xl font-mono text-emerald-400 font-light tracking-tight">{coveragePercent}%</div>
            <div className="text-sm text-gray-600 mt-1">Coverage</div>
          </div>
          <div>
            <div className="text-3xl font-mono text-gray-900 font-light tracking-tight">₹{availableValue.toLocaleString()}</div>
            <div className="text-sm text-gray-600 mt-1">Available optimization value</div>
          </div>
        </div>
      </>
    );
  };

  const renderCoverageMatrix = () => {
    if (analysisStatus === 'loading') return <div className="text-sm text-gray-600">Calculating your coverage...</div>;
    if (analysisStatus === 'empty' || analysisStatus === 'error') return <div className="text-sm text-gray-600">Building from your wallet...</div>;
    
    return (
      <div className="space-y-5">
        {coverageData.map(cat => (
          <div key={cat.name} className="flex items-center justify-between group">
            <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors">{cat.name}</span>
            <div className="flex items-center gap-3">
              <div className="w-24 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                <div 
                  className="h-full bg-emerald-500/80 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${cat.value}%` }}
                />
              </div>
              <span className="text-xs font-mono text-gray-900 w-8 text-right">{cat.value}%</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderTopPaths = () => {
    if (analysisStatus === 'loading') return <div className="text-sm text-gray-600">Analyzing...</div>;
    if (analysisStatus === 'empty' || analysisStatus === 'error') return <div className="text-sm text-gray-600">Add payment methods to reveal paths.</div>;

    return (
      <div className="space-y-3">
        {topPaths.map((item, i) => (
          <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white border border-gray-200 shadow-sm hover:border-gray-300 transition-colors">
            <div>
              <div className="text-xs text-gray-600 uppercase tracking-wider font-semibold">{item.category}</div>
              <div className="text-sm font-medium text-gray-900 mt-1 flex items-center gap-1.5">
                <ArrowRight size={12} className="text-emerald-500/50" />
                {item.card}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-600">Potential</div>
              <div className="text-sm font-mono text-emerald-400 mt-0.5">₹{item.value.toLocaleString()}</div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <PageContainer 
      eyebrow="YOUR PORTFOLIO"
      title="Your Wallet"
      className="text-gray-900 font-body"
    >
      {/* Global Background Atmosphere: Obsidian */}
      <div className="fixed inset-0 pointer-events-none z-[-1] bg-white" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Payment Methods */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* HERO PAYMENT METHODS */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl md:text-2xl font-display font-medium text-gray-900 flex items-center gap-2">
                  <CreditCard size={20} className="text-gray-600" />
                  Payment Methods
                </h2>
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="text-sm text-emerald-500 hover:text-emerald-400 font-medium transition-colors flex items-center gap-1"
                >
                  <Plus size={14} />
                  Add method
                </button>
              </div>

              <div className="grid gap-4">
                {userCards.length === 0 ? (
                  <div className="bg-white border border-gray-300 rounded-[24px] p-8 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-600">
                      <Wallet size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Your wallet is empty</h3>
                      <p className="text-gray-600 mt-1">Add a payment method to unlock intelligence.</p>
                    </div>
                  </div>
                ) : (
                  userCards.map((card, idx) => {
                    const isPreferred = idx === 0;
                    return (
                      <motion.div
                        key={card.id}
                        whileHover={{ y: -2 }}
                        onClick={() => setSelectedCard(card)}
                        className={cn(
                          "group relative bg-white border border-gray-300 hover:border-[#2A9D5C]/20 hover:bg-gray-50 rounded-[24px] p-6 transition-all duration-300 overflow-hidden cursor-pointer",
                          card.status !== 'active' && "opacity-60 grayscale"
                        )}
                      >
                        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                            <PhysicalCard card={card} variant="wallet" />
                            <div className="space-y-1">
                              <div className="flex items-center gap-3">
                                <h3 className="text-lg font-medium text-gray-900">{card.name || `${card.bank} ${card.network}`}</h3>
                                {isPreferred && (
                                  <span className="px-2 py-0.5 rounded bg-gray-100 text-[9px] text-[#2A9D5C] font-bold tracking-widest uppercase border border-[#2A9D5C]/20">
                                    Preferred
                                  </span>
                                )}
                              </div>
                              <p className="text-sm font-mono text-gray-600">•••• {card.pan.slice(-4)}</p>
                              
                              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-300">
                                <div className="text-xs text-gray-600 flex items-center gap-1.5">
                                  <ShieldCheck size={14} className="text-[#2A9D5C]" />
                                  Optimization Ready
                                </div>
                                <div className="text-xs text-gray-600 flex items-center gap-1.5">
                                  <Activity size={14} />
                                  {card.status === 'active' ? 'Active Status' : 'Inactive'}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="hidden sm:flex w-8 h-8 rounded-full bg-gray-50 border border-gray-300 items-center justify-center group-hover:bg-[#2A9D5C]/10 group-hover:border-[#2A9D5C]/30 transition-colors shrink-0">
                            <ChevronRight size={16} className="text-gray-600 group-hover:text-[#2A9D5C]" />
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN: Coverage & Attention */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* OPTIMIZATION COVERAGE */}
            <section className="bg-white border border-gray-300 rounded-[24px] p-6 md:p-8 space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-300 flex items-center justify-center">
                  <PieChart size={18} className="text-gray-900" />
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-display font-medium text-gray-900">Optimization Coverage</h3>
                  <p className="text-sm text-gray-600 mt-0.5">Category readiness</p>
                </div>
              </div>
              
              {renderCoverageMatrix()}
            </section>

            {/* HOW RENOCRED USES YOUR WALLET */}
            <section className="bg-white border border-gray-300 rounded-[24px] p-6 md:p-8 space-y-6">
              <div 
                className="cursor-pointer group flex items-start justify-between"
                onClick={() => setShowHowItWorksModal(true)}
              >
                <div>
                  <h3 className="text-xl md:text-2xl font-display font-medium text-gray-900 group-hover:text-[#2A9D5C] transition-colors">How RenoCred Uses Your Wallet</h3>
                  <p className="text-sm text-gray-600 mt-1">Highest value paths currently available</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400 group-hover:bg-[#2A9D5C]/10 group-hover:text-[#2A9D5C] group-hover:border-[#2A9D5C]/20 transition-all shrink-0">
                  <Info size={16} />
                </div>
              </div>

              {renderTopPaths()}
            </section>

            {/* ATTENTION SYSTEM */}
            <section className="bg-amber-500/5 border border-amber-500/20 rounded-[24px] p-6 space-y-4">
              <div className="flex items-center gap-2 text-amber-500">
                <AlertTriangle size={16} />
                <span className="text-sm font-medium">Attention Required</span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                Add your preferred UPI method to improve utility bill recommendations and tracking.
              </p>
              <button className="text-xs font-medium text-gray-900 hover:text-gray-900 transition-colors flex items-center gap-1">
                Resolve now <ChevronRight size={12} />
              </button>
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
