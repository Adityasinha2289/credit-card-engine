import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Compass, MapPin, ShoppingBag, Book, Sparkles, Wallet, TrendingUp, ShieldCheck, ArrowRight, Bot, CreditCard, Clock, Plane, Coffee } from 'lucide-react';
import { SmartSpendCard } from '../../components/shared/SmartSpendCard';
import { getGreeting } from '../../lib/greeting';
import { useDashboardStore } from '../../features/dashboard/store/dashboardStore';
import { CommerceOptimizationService } from '../../features/commerce';
import type { CommerceEntity } from '../../features/commerce/types';
import type { OptimizationResult } from '../../features/optimization/types';

export default function HomePage() {
  const navigate = useNavigate();
  const profile = useDashboardStore((s) => s.profile);
  const userCards = useDashboardStore((s) => s.userCards);
  
  const actions = [
    { id: 'date', label: 'Plan a Date', icon: MapPin, path: '/app/lifestyle/plan/date' },
    { id: 'trip', label: 'Plan a Trip', icon: Compass, path: '/app/lifestyle/plan' },
    { id: 'shop', label: 'Shop Smarter', icon: ShoppingBag, path: '/app/lifestyle/shop' },
    { id: 'invest', label: 'Invest in Yourself', icon: Book, path: '/app/lifestyle/invest' },
  ];

  const [results, setResults] = React.useState<{entity: CommerceEntity, result: OptimizationResult}[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchResults() {
      try {
        const userId = profile?.id || 'demo-user-id';
        const data = await CommerceOptimizationService.optimizeCollection(userId);
        setResults(data.slice(0, 3));
      } catch (err) {
        console.error("Failed to load commerce data", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchResults();
  }, [profile?.id]);

  return (
    <div className="max-w-5xl mx-auto pb-24 text-text-primary min-h-screen px-4 md:px-0">
      
      {/* ── 1. COMMAND / INTENT ────────────────────────────────────── */}
      <section className="mb-12 pt-8">
        <header className="mb-8">
          <p className="text-text-secondary text-[10px] font-bold tracking-[0.2em] uppercase mb-3 flex items-center gap-2">
            <Sparkles size={12} className="text-brand-emerald" /> {getGreeting()}, {profile?.name?.split(' ')[0] || 'there'}
          </p>
          <h1 className="text-4xl md:text-5xl font-display font-light tracking-tight text-white mb-4 leading-tight">
            What are you planning?
          </h1>
          <p className="text-lg text-text-muted font-light max-w-2xl leading-relaxed">
            Tell RenoCred what you're trying to do. We'll figure out the smartest way to pay for it.
          </p>
        </header>

        <div className="bg-surface-primary border border-border-subtle rounded-[2rem] p-6 md:p-8 relative overflow-hidden">
          {/* Decorative hint */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-emerald/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
            {actions.map((action, idx) => (
              <motion.button
                key={action.id}
                onClick={() => navigate(action.path)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex flex-col items-start p-5 rounded-2xl bg-surface-elevated border border-border-subtle hover:border-brand-emerald/30 hover:bg-surface-elevated/80 transition-all text-left group"
              >
                <action.icon size={20} className="text-text-muted mb-4 group-hover:text-brand-emerald transition-colors" />
                <h3 className="font-medium text-text-primary text-sm">{action.label}</h3>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* ── 2. FINANCIAL SNAPSHOT ────────────────────────────────────── */}
      <section className="mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Wallet */}
          <div className="surface-card p-6 flex flex-col justify-between h-32 relative overflow-hidden group cursor-pointer" onClick={() => navigate('/app/wallet')}>
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Wallet size={48} /></div>
            <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-text-muted mb-2">Wallet</h3>
            <div>
              <p className="text-3xl font-display font-medium text-text-primary">{userCards.length}</p>
              <p className="text-sm text-text-secondary">Active Cards</p>
            </div>
          </div>
          {/* CIBIL */}
          <div className="surface-card p-6 flex flex-col justify-between h-32 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5"><ShieldCheck size={48} /></div>
            <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-text-muted mb-2">CIBIL Score</h3>
            <div>
              <p className="text-3xl font-display font-medium text-brand-emerald">810</p>
              <p className="text-sm text-text-secondary">Excellent</p>
            </div>
          </div>
          {/* Savings */}
          <div className="surface-card p-6 flex flex-col justify-between h-32 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5"><TrendingUp size={48} /></div>
            <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-text-muted mb-2">Total Savings</h3>
            <div>
              <p className="text-3xl font-display font-medium text-text-primary">₹4,820</p>
              <p className="text-sm text-text-secondary">This month</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* LEFT COLUMN: Intelligence & Discovery */}
        <div className="lg:col-span-8 space-y-16">
          
          {/* ── 3. INTELLIGENCE ────────────────────────────────────── */}
          <section>
            <h2 className="text-[10px] font-bold tracking-[0.2em] uppercase text-text-muted mb-6">
              Your Money, Optimized
            </h2>
            
            <div className="bg-surface-intelligence border border-border-intelligence rounded-[2rem] p-6 md:p-8 relative overflow-hidden group">
              <div className="flex flex-col md:flex-row items-start gap-6">
                <div className="w-12 h-12 rounded-full bg-brand-900/20 border border-brand-emerald/30 flex items-center justify-center shrink-0">
                  <Bot size={24} className="text-brand-emerald" />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-medium text-white mb-3 leading-snug">
                    You could save ₹1,240 this month by switching your travel spend to Platinum Travel.
                  </h3>
                  <p className="text-text-secondary text-sm mb-6 max-w-lg leading-relaxed">
                    Your dining spend is 18% higher than last month, but your SBI Signature card is currently your strongest rewards card for dining.
                  </p>
                  <button className="flex items-center gap-2 text-sm font-medium text-brand-emerald hover:text-brand-400 transition-colors">
                    Let Taqdeer optimize this <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* ── 5. DISCOVERY ────────────────────────────────────── */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-[10px] font-bold tracking-[0.2em] uppercase text-text-muted">
                Smarter Purchases For You
              </h2>
            </div>
            
            {isLoading ? (
              <div className="space-y-6">
                {[1, 2].map(i => <div key={i} className="h-64 surface-card animate-pulse" />)}
              </div>
            ) : (
              <div className="space-y-8">
                {results.map(({ entity, result }, idx) => {
                  const theme = idx === 0 ? { label: "TRAVEL", msg: "Get more from your next flight.", icon: Plane } :
                                idx === 1 ? { label: "LIFESTYLE", msg: "3 ways to spend smarter on your goals.", icon: Coffee } :
                                { label: "SHOPPING", msg: "Before you buy, check your wallet.", icon: ShoppingBag };
                  
                  return (
                    <motion.div 
                      key={entity.id} 
                      className="relative group"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <theme.icon size={14} className="text-text-muted" />
                        <h3 className="text-xs font-bold tracking-[0.1em] text-text-primary">{theme.label}</h3>
                        <span className="text-text-muted text-sm italic hidden md:inline-block">— {theme.msg}</span>
                      </div>
                      <SmartSpendCard
                        title={entity.name}
                        originalPrice={entity.basePrice}
                        optimizationResult={result}
                        recommendation={{
                          reason: result.reason.primary || 'Best overall value',
                          features: result.reason.supportingFactors || [],
                          badge: result.savings > 0 ? 'Best Value' : undefined
                        }}
                        onViewDeal={() => navigate(`/app/lifestyle/partner/${entity.partnerId}`)}
                        entityId={entity.id}
                        placement="home"
                        isSponsored={false}
                      />
                    </motion.div>
                  )
                })}
                {results.length === 0 && (
                  <div className="text-center py-12 surface-card rounded-[2rem]">
                    <p className="text-text-muted">No items available at this time.</p>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>

        {/* RIGHT COLUMN: Actions */}
        <div className="lg:col-span-4">
          
          {/* ── 4. ACTIONS ────────────────────────────────────── */}
          <section className="sticky top-24">
            <h2 className="text-[10px] font-bold tracking-[0.2em] uppercase text-text-muted mb-6">
              Things worth doing
            </h2>
            
            <div className="bg-surface-card border border-border-subtle rounded-[2rem] overflow-hidden">
              
              <div 
                className="p-5 border-b border-border-subtle hover:bg-surface-elevated cursor-pointer transition-colors flex items-center gap-4 group"
                onClick={() => navigate('/app/wallet')}
              >
                <div className="w-10 h-10 rounded-full bg-surface-primary flex items-center justify-center shrink-0 border border-border-subtle group-hover:border-brand-emerald/20 transition-colors">
                  <CreditCard size={18} className="text-text-secondary group-hover:text-brand-emerald transition-colors" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-text-primary">Optimize my cards</h4>
                  <p className="text-xs text-text-muted mt-0.5">Review 2 active cards</p>
                </div>
              </div>
              
              <div 
                className="p-5 border-b border-border-subtle hover:bg-surface-elevated cursor-pointer transition-colors flex items-center gap-4 group"
              >
                <div className="w-10 h-10 rounded-full bg-surface-primary flex items-center justify-center shrink-0 border border-border-subtle group-hover:border-brand-caution/20 transition-colors">
                  <Clock size={18} className="text-brand-caution/80 group-hover:text-brand-caution transition-colors" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-text-primary">Review upcoming bills</h4>
                  <p className="text-xs text-text-muted mt-0.5">₹8,400 due in 4 days</p>
                </div>
              </div>
              
              <div 
                className="p-5 border-b border-border-subtle hover:bg-surface-elevated cursor-pointer transition-colors flex items-center gap-4 group"
                onClick={() => navigate('/app/lifestyle/shop')}
              >
                <div className="w-10 h-10 rounded-full bg-surface-primary flex items-center justify-center shrink-0 border border-border-subtle group-hover:border-brand-emerald/20 transition-colors">
                  <ShoppingBag size={18} className="text-text-secondary group-hover:text-text-primary transition-colors" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-text-primary">Plan a purchase</h4>
                  <p className="text-xs text-text-muted mt-0.5">Find the smartest payment</p>
                </div>
              </div>
              
              <div 
                className="p-5 hover:bg-surface-elevated cursor-pointer transition-colors flex items-center gap-4 group"
                onClick={() => navigate('/app/wallet')}
              >
                <div className="w-10 h-10 rounded-full bg-surface-primary flex items-center justify-center shrink-0 border border-border-subtle group-hover:border-brand-emerald/20 transition-colors">
                  <TrendingUp size={18} className="text-text-secondary group-hover:text-brand-emerald transition-colors" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-text-primary">Check my rewards</h4>
                  <p className="text-xs text-text-muted mt-0.5">You earned ₹1,240 this month</p>
                </div>
              </div>
              
            </div>
          </section>
        </div>

      </div>
    </div>
  );
}
