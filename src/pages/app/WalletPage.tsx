import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, CreditCard, ChevronRight, Wallet, Activity, ArrowRight, ShieldCheck, PieChart, Sparkles, Building2, Smartphone, AlertTriangle, Loader2 } from 'lucide-react';
import { useDashboardStore } from '../../features/dashboard/store/dashboardStore';
import { PageContainer } from '../../components/shared/PageContainer';
import { CommerceOptimizationService } from '../../features/commerce';
import { loadWalletIntelligence } from './walletIntelligence';
import { cn } from '../../lib/utils';

export default function WalletPage() {
  const { userCards, profile } = useDashboardStore();
  const [showAddModal, setShowAddModal] = useState(false);

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
        const userId = profile?.id || 'demo-user-id';
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
          <h3 className="text-xl md:text-2xl font-display leading-tight text-[#F2F4F2]">
            Analyzing your wallet...
          </h3>
        </div>
      );
    }
    
    if (analysisStatus === 'error') {
      return (
        <div className="flex items-center gap-4 text-amber-500">
          <AlertTriangle size={24} />
          <h3 className="text-xl md:text-2xl font-display leading-tight text-[#F2F4F2]">
            We couldn't calculate your wallet intelligence right now.
          </h3>
        </div>
      );
    }

    if (analysisStatus === 'empty') {
      return (
        <div className="space-y-2">
          <h3 className="text-xl md:text-2xl font-display leading-tight text-[#F2F4F2]">
            No optimization paths available yet.
          </h3>
          <p className="text-[#A0AAA5]">Add more payment methods to unlock intelligence.</p>
        </div>
      );
    }

    return (
      <>
        <h3 className="text-xl md:text-2xl font-display leading-tight text-[#F2F4F2]">
          RenoCred can optimize most of your everyday spending with your current wallet.
        </h3>
        <div className="flex flex-wrap gap-8">
          <div>
            <div className="text-3xl font-mono text-emerald-400 font-light tracking-tight">{coveragePercent}%</div>
            <div className="text-sm text-[#A0AAA5] mt-1">Coverage</div>
          </div>
          <div>
            <div className="text-3xl font-mono text-[#F2F4F2] font-light tracking-tight">₹{availableValue.toLocaleString()}</div>
            <div className="text-sm text-[#A0AAA5] mt-1">Available optimization value</div>
          </div>
        </div>
      </>
    );
  };

  const renderCoverageMatrix = () => {
    if (analysisStatus === 'loading') return <div className="text-sm text-[#A0AAA5]">Calculating your coverage...</div>;
    if (analysisStatus === 'empty' || analysisStatus === 'error') return <div className="text-sm text-[#A0AAA5]">Building from your wallet...</div>;
    
    return (
      <div className="space-y-5">
        {coverageData.map(cat => (
          <div key={cat.name} className="flex items-center justify-between group">
            <span className="text-sm font-medium text-[#A0AAA5] group-hover:text-[#F2F4F2] transition-colors">{cat.name}</span>
            <div className="flex items-center gap-3">
              <div className="w-24 h-1.5 rounded-full bg-[#131917] overflow-hidden">
                <div 
                  className="h-full bg-emerald-500/80 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${cat.value}%` }}
                />
              </div>
              <span className="text-xs font-mono text-[#F2F4F2] w-8 text-right">{cat.value}%</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderTopPaths = () => {
    if (analysisStatus === 'loading') return <div className="text-sm text-[#A0AAA5]">Analyzing...</div>;
    if (analysisStatus === 'empty' || analysisStatus === 'error') return <div className="text-sm text-[#A0AAA5]">Add payment methods to reveal paths.</div>;

    return (
      <div className="space-y-3">
        {topPaths.map((item, i) => (
          <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-[#131917] border border-[#242D29]/50 hover:border-[#384640] transition-colors">
            <div>
              <div className="text-xs text-[#737C77] uppercase tracking-wider font-semibold">{item.category}</div>
              <div className="text-sm font-medium text-[#F2F4F2] mt-1 flex items-center gap-1.5">
                <ArrowRight size={12} className="text-emerald-500/50" />
                {item.card}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-[#A0AAA5]">Potential</div>
              <div className="text-sm font-mono text-emerald-400 mt-0.5">₹{item.value.toLocaleString()}</div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <PageContainer hideHeader>
      <div className="w-full min-h-screen text-[#F2F4F2] pb-24 md:pb-32 px-4 md:px-8 max-w-[1600px] mx-auto font-body">
        
        {/* WALLET COMMAND HEADER */}
        <header className="pt-8 md:pt-12 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#242D29]">
          <div className="space-y-4">
            <h1 className="font-display text-3xl md:text-5xl tracking-tight text-[#F2F4F2]">Your Wallet</h1>
            <p className="text-[#A0AAA5] text-lg max-w-xl leading-relaxed">
              Your payment methods power every RenoCred recommendation.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono font-medium text-[#737C77] uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
              Wallet Active
            </span>
            <span className="text-[#242D29]">•</span>
            <span>{totalCards} Methods</span>
            <span className="text-[#242D29]">•</span>
            <span className={analysisStatus === 'success' ? "text-emerald-500/80" : "text-[#737C77]"}>
              {analysisStatus === 'success' ? 'Optimization Ready' : 'Analyzing'}
            </span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
          
          {/* LEFT COLUMN: Intelligence & Payment Methods */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* WALLET INTELLIGENCE SUMMARY */}
            <section className="bg-[#0A2117] border border-emerald-900/30 rounded-3xl overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-50" />
              <div className="relative p-6 md:p-8 flex flex-col md:flex-row justify-between gap-8">
                <div className="space-y-6 flex-1">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <Sparkles size={18} />
                    <span className="text-sm font-semibold tracking-wide uppercase">Wallet Intelligence</span>
                  </div>
                  {renderIntelligenceContent()}
                </div>
              </div>
            </section>

            {/* HERO PAYMENT METHODS */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-[#F2F4F2] flex items-center gap-2">
                  <CreditCard size={18} className="text-[#737C77]" />
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
                  <div className="bg-[#0F1412] border border-[#242D29] rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-[#131917] flex items-center justify-center text-[#737C77]">
                      <Wallet size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-[#F2F4F2]">Your wallet is empty</h3>
                      <p className="text-[#A0AAA5] mt-1">Add a payment method to unlock intelligence.</p>
                    </div>
                  </div>
                ) : (
                  userCards.map((card, idx) => {
                    const isPreferred = idx === 0;
                    return (
                      <motion.div
                        key={card.id}
                        whileHover={{ scale: 1.01, y: -2 }}
                        className={cn(
                          "group relative bg-[#0F1412] border border-[#242D29] hover:border-[#384640] rounded-3xl p-6 transition-all duration-300 overflow-hidden cursor-pointer",
                          card.status !== 'active' && "opacity-60 grayscale"
                        )}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#131917] opacity-0 group-hover:opacity-100 transition-opacity" />
                        
                        <div className="relative flex items-start justify-between">
                          <div className="flex items-start gap-5">
                            <div className="w-14 h-14 rounded-2xl bg-[#181F1C] border border-[#242D29] flex items-center justify-center flex-shrink-0 shadow-inner">
                              <Building2 size={24} className="text-[#A0AAA5]" />
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-3">
                                <h3 className="text-lg font-medium text-[#F2F4F2]">{card.bank} {card.network}</h3>
                                {isPreferred && (
                                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">
                                    Preferred
                                  </span>
                                )}
                              </div>
                              <p className="text-sm font-mono text-[#737C77]">•••• {card.pan.slice(-4)}</p>
                              
                              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-[#242D29]/50">
                                <div className="text-xs text-[#A0AAA5] flex items-center gap-1.5">
                                  <ShieldCheck size={14} className="text-emerald-500/70" />
                                  Optimization Ready
                                </div>
                                <div className="text-xs text-[#737C77] flex items-center gap-1.5">
                                  <Activity size={14} />
                                  {card.status === 'active' ? 'Active Status' : 'Inactive'}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="w-8 h-8 rounded-full bg-[#131917] border border-[#242D29] flex items-center justify-center group-hover:bg-[#181F1C] group-hover:border-[#384640] transition-colors">
                            <ChevronRight size={16} className="text-[#A0AAA5]" />
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
            <section className="bg-[#0F1412] border border-[#242D29] rounded-3xl p-6 md:p-8 space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#131917] border border-[#242D29] flex items-center justify-center">
                  <PieChart size={18} className="text-[#F2F4F2]" />
                </div>
                <div>
                  <h3 className="font-medium text-[#F2F4F2]">Optimization Coverage</h3>
                  <p className="text-xs text-[#A0AAA5] mt-0.5">Category readiness</p>
                </div>
              </div>
              
              {renderCoverageMatrix()}
            </section>

            {/* HOW RENOCRED USES YOUR WALLET */}
            <section className="bg-[#0F1412] border border-[#242D29] rounded-3xl p-6 md:p-8 space-y-6">
              <div>
                <h3 className="font-medium text-[#F2F4F2]">How RenoCred Uses Your Wallet</h3>
                <p className="text-xs text-[#A0AAA5] mt-1">Highest value paths currently available</p>
              </div>

              {renderTopPaths()}
            </section>

            {/* ATTENTION SYSTEM */}
            <section className="bg-[#131917] border border-[#384640]/50 rounded-3xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-[#A0AAA5]">
                <AlertTriangle size={16} className="text-amber-500/70" />
                <span className="text-sm font-medium">Attention Required</span>
              </div>
              <p className="text-sm text-[#737C77] leading-relaxed">
                Add your preferred UPI method to improve utility bill recommendations and tracking.
              </p>
              <button className="text-xs font-medium text-[#F2F4F2] hover:text-white transition-colors flex items-center gap-1">
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
                className="fixed inset-0 bg-[#070A08]/80 backdrop-blur-sm z-50"
              />
              <motion.div 
                initial={{ opacity: 0, y: 100, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 100, scale: 0.95 }}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-[#0F1412] border border-[#242D29] rounded-[2rem] shadow-2xl z-50 overflow-hidden"
              >
                <div className="p-6 md:p-8 space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-display text-[#F2F4F2]">Add Payment Method</h2>
                    <p className="text-[#A0AAA5] text-sm">Expand your optimization coverage.</p>
                  </div>
                  
                  <div className="space-y-3">
                    {[
                      { title: 'Credit Card', desc: 'Add a new credit line', icon: CreditCard },
                      { title: 'Debit Card', desc: 'Link a bank account', icon: Building2 },
                      { title: 'UPI ID', desc: 'Link for quick payments', icon: Smartphone },
                    ].map(type => (
                      <button key={type.title} className="w-full flex items-center gap-4 p-4 rounded-2xl bg-[#131917] border border-[#242D29] hover:border-[#384640] hover:bg-[#181F1C] transition-all text-left group">
                        <div className="w-12 h-12 rounded-xl bg-[#0F1412] border border-[#242D29] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                          <type.icon size={20} className="text-[#F2F4F2]" />
                        </div>
                        <div>
                          <div className="font-medium text-[#F2F4F2]">{type.title}</div>
                          <div className="text-xs text-[#737C77] mt-0.5">{type.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>

                  <button 
                    onClick={() => setShowAddModal(false)}
                    className="w-full py-3 rounded-xl bg-[#131917] text-[#A0AAA5] hover:text-[#F2F4F2] font-medium text-sm transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </PageContainer>
  );
}
