import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MapPin, Compass, ShoppingBag, Book, ArrowRight, CreditCard, Clock } from 'lucide-react';
import { getGreeting } from '../../lib/greeting';
import { useDashboardStore } from '../../features/dashboard/store/dashboardStore';
import { CommerceOptimizationService } from '../../features/commerce';
import type { CommerceEntity } from '../../features/commerce/types';
import type { OptimizationResult } from '../../features/optimization/types';
import { cn } from '../../lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
//  HOME V3 — Quiet Luxury Financial Intelligence
// ─────────────────────────────────────────────────────────────────────────────

const INTENTS = [
  { id: 'travel',    label: 'Travel',        path: '/app/lifestyle/plan',       Icon: Compass },
  { id: 'dining',    label: 'Dining',         path: '/app/lifestyle/plan/date',  Icon: MapPin },
  { id: 'shopping',  label: 'Shopping',       path: '/app/lifestyle/shop',       Icon: ShoppingBag },
  { id: 'learning',  label: 'Learning',       path: '/app/lifestyle/invest',     Icon: Book },
];

export default function HomePage() {
  const navigate = useNavigate();
  const profile = useDashboardStore((s) => s.profile);
  const userCards = useDashboardStore((s) => s.userCards);
  const transactions = useDashboardStore((s) => s.transactions);

  const [hoveredIntent, setHoveredIntent] = React.useState<string | null>(null);
  const [commerceResults, setCommerceResults] = React.useState<{entity: CommerceEntity, result: OptimizationResult}[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // Derive real financial data from the store
  const totalSpend = React.useMemo(() => {
    return transactions
      .filter(t => t.type === 'debit')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const topCategory = React.useMemo(() => {
    const cats: Record<string, number> = {};
    transactions.filter(t => t.type === 'debit').forEach(t => {
      cats[t.category] = (cats[t.category] || 0) + t.amount;
    });
    const sorted = Object.entries(cats).sort(([, a], [, b]) => b - a);
    return sorted[0] ? { name: sorted[0][0], amount: sorted[0][1] } : null;
  }, [transactions]);

  React.useEffect(() => {
    async function fetchResults() {
      try {
        const userId = profile?.id || 'demo-user-id';
        const data = await CommerceOptimizationService.optimizeCollection(userId);
        setCommerceResults(data.slice(0, 3));
      } catch (err) {
        console.error("Failed to load commerce data", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchResults();
  }, [profile?.id]);

  // Calculate total potential savings from commerce results
  const totalPotentialSavings = React.useMemo(() => {
    return commerceResults.reduce((sum, { result }) => sum + result.savings, 0);
  }, [commerceResults]);

  const firstName = profile?.name?.split(' ')[0] || 'there';
  const creditScore = profile?.creditScore || 810;

  return (
    <div className="w-full max-w-[1200px] mx-auto px-6 sm:px-8 lg:px-12 py-10 lg:py-16 pb-32">
      
      {/* ── 1. HERO ──────────────────────────────────────────────────────── */}
      <section className="relative mb-16 lg:mb-24">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-[radial-gradient(ellipse_at_center,_rgba(25,184,106,0.06)_0%,_transparent_70%)] rounded-full blur-[80px] pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10"
        >
          <p className="text-semantic-text-muted text-[11px] font-medium tracking-[0.15em] uppercase mb-4">
            {getGreeting()}, {firstName}
          </p>
          <h1 className="text-4xl lg:text-[3.5rem] font-display font-medium text-semantic-text-primary tracking-tight leading-[1.1] max-w-2xl">
            Your money, working smarter.
          </h1>
        </motion.div>
      </section>

      {/* ── 2. INTENT SELECTOR ─────────────────────────────────────────── */}
      <section className="mb-16 lg:mb-24">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex flex-wrap items-center gap-6 lg:gap-10">
            {INTENTS.map((intent) => {
              const isHovered = hoveredIntent === intent.id;
              return (
                <button
                  key={intent.id}
                  onClick={() => navigate(intent.path)}
                  onMouseEnter={() => setHoveredIntent(intent.id)}
                  onMouseLeave={() => setHoveredIntent(null)}
                  className="group relative flex items-center gap-3 py-2 transition-transform duration-300 ease-out hover:-translate-y-1"
                >
                  <intent.Icon 
                    size={16} 
                    strokeWidth={1.5} 
                    className={cn(
                      "transition-colors duration-300",
                      isHovered ? "text-semantic-brand" : "text-semantic-text-muted group-hover:text-semantic-text-secondary"
                    )} 
                  />
                  <span className={cn(
                    "text-sm font-medium tracking-wide transition-all duration-300",
                    isHovered ? "text-semantic-text-primary drop-shadow-[0_0_8px_rgba(25,184,106,0.3)]" : "text-semantic-text-muted group-hover:text-semantic-text-secondary"
                  )}>
                    {intent.label}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* ── MAIN COMPOSITION: Intelligence + Snapshots ─────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">

        {/* ── 3. PRIMARY INTELLIGENCE VISUAL ─────────────────────────────── */}
        <div className="lg:col-span-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="relative rounded-[2rem] overflow-hidden bg-[#0A120E] border border-white/[0.04]">
              {/* Intelligence Field */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(13,107,67,0.15)_0%,_transparent_60%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(25,184,106,0.08)_0%,_transparent_50%)]" />
              
              <div className="relative p-8 lg:p-12 flex flex-col justify-between min-h-[400px]">
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-semantic-brand/80 mb-6 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-semantic-brand animate-pulse" />
                    Optimization Opportunity
                  </p>
                  
                  {totalPotentialSavings > 0 ? (
                    <>
                      <h2 className="text-6xl lg:text-[5rem] font-mono font-medium text-semantic-text-primary tracking-tighter mb-4">
                        ₹{totalPotentialSavings.toLocaleString('en-IN')}
                      </h2>
                      <p className="text-lg text-semantic-text-secondary max-w-md leading-relaxed">
                        Potential value this cycle by optimizing your {topCategory?.name || 'purchases'} across {userCards.length} active cards.
                      </p>
                    </>
                  ) : (
                    <>
                      <h2 className="text-4xl lg:text-5xl font-display font-medium text-semantic-text-primary tracking-tight mb-4">
                        Wallet optimized.
                      </h2>
                      <p className="text-lg text-semantic-text-secondary max-w-md leading-relaxed">
                        You are currently extracting maximum value from your credit cards. Keep spending intentionally.
                      </p>
                    </>
                  )}
                </div>

                <div className="mt-12 flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {userCards.slice(0,3).map((card, idx) => (
                      <div key={idx} className="w-10 h-10 rounded-full border-2 border-[#0A120E] bg-semantic-surface-elevated flex items-center justify-center shrink-0">
                        <CreditCard size={14} className="text-semantic-text-muted" />
                      </div>
                    ))}
                    {userCards.length > 3 && (
                      <div className="w-10 h-10 rounded-full border-2 border-[#0A120E] bg-semantic-surface-elevated flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-semibold text-semantic-text-muted">+{userCards.length - 3}</span>
                      </div>
                    )}
                  </div>
                  
                  <button 
                    onClick={() => navigate('/app/lifestyle/shop')}
                    className="flex items-center gap-2 text-sm font-medium text-semantic-text-primary hover:text-semantic-brand transition-colors group"
                  >
                    Explore optimizations 
                    <ArrowRight size={16} className="text-semantic-text-muted group-hover:text-semantic-brand transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── RIGHT COLUMN: Snapshot & Actions ───────────────────────────── */}
        <div className="lg:col-span-4 flex flex-col gap-12 lg:gap-16">
          
          {/* 4. FINANCIAL SNAPSHOT */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-semantic-text-muted mb-6">
              Financial Position
            </p>
            <div className="flex flex-col gap-8">
              <div className="flex items-baseline justify-between border-b border-white/[0.04] pb-6">
                <div>
                  <p className="text-2xl font-mono font-medium text-semantic-text-primary">{userCards.length}</p>
                  <p className="text-xs text-semantic-text-muted mt-1">Active cards</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-mono font-medium text-semantic-text-primary">810</p>
                  <p className="text-xs text-semantic-text-muted mt-1">CIBIL Score</p>
                </div>
              </div>
              <div>
                <p className="text-3xl font-mono font-medium text-semantic-text-primary">
                  ₹{(totalSpend / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </p>
                <p className="text-xs text-semantic-text-muted mt-1">Spent this cycle</p>
              </div>
            </div>
          </motion.div>

          {/* 5. SECONDARY ACTIONS */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex flex-col gap-4">
              <button 
                onClick={() => navigate('/app/wallet')}
                className="flex items-center gap-4 text-left group w-full"
              >
                <div className="w-10 h-10 rounded-full bg-semantic-surface-primary flex items-center justify-center shrink-0 border border-white/[0.02] group-hover:bg-[#0D2B1C]/30 group-hover:border-semantic-brand/20 transition-all duration-300">
                  <CreditCard size={14} className="text-semantic-text-muted group-hover:text-semantic-brand transition-colors" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-semantic-text-primary group-hover:text-semantic-brand transition-colors">Optimize my cards</h4>
                  <p className="text-xs text-semantic-text-muted mt-0.5">Review {userCards.length} active cards</p>
                </div>
              </button>

              <button 
                onClick={() => navigate('/app/wallet')}
                className="flex items-center gap-4 text-left group w-full"
              >
                <div className="w-10 h-10 rounded-full bg-semantic-surface-primary flex items-center justify-center shrink-0 border border-white/[0.02] group-hover:bg-[#0D2B1C]/30 group-hover:border-semantic-brand/20 transition-all duration-300">
                  <Clock size={14} className="text-semantic-text-muted group-hover:text-semantic-brand transition-colors" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-semantic-text-primary group-hover:text-semantic-brand transition-colors">Review upcoming bills</h4>
                  <p className="text-xs text-semantic-text-muted mt-0.5">Check statement cycles</p>
                </div>
              </button>
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
