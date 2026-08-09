import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Compass, MapPin, ShoppingBag, Book, Sparkles } from 'lucide-react';
import { SavingsMetricDisplay } from '../../components/shared/SavingsMetricDisplay';
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
    { id: 'date', label: 'Plan a Date', icon: MapPin, path: '/app/lifestyle/plan/date', color: 'from-rose-500/20 to-orange-500/5' },
    { id: 'trip', label: 'Plan a Trip', icon: Compass, path: '/app/lifestyle/plan', color: 'from-blue-500/20 to-cyan-500/5' },
    { id: 'shop', label: 'Shop Smarter', icon: ShoppingBag, path: '/app/lifestyle/shop', color: 'from-brand-500/20 to-emerald-500/5' },
    { id: 'invest', label: 'Invest in Yourself', icon: Book, path: '/app/lifestyle/invest', color: 'from-purple-500/20 to-indigo-500/5' },
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
    <div className="max-w-4xl mx-auto pb-24 text-text-primary min-h-screen">
      
      {/* ── HERO: INTENT CAPTURE ────────────────────────────────────── */}
      <section className="mb-12 pt-8">
        <header className="mb-10">
          <p className="text-brand-emerald text-[10px] font-bold tracking-[0.2em] uppercase mb-2 flex items-center gap-2">
            <Sparkles size={12} /> {getGreeting()}, {profile?.name?.split(' ')[0] || 'there'}
          </p>
          <h1 className="text-5xl md:text-6xl font-display font-medium tracking-tight text-white mb-4 leading-tight">
            What are you planning?
          </h1>
          <p className="text-lg text-text-muted font-light max-w-2xl leading-relaxed">
            Tell RenoCred what you want to do. We'll find the smartest way to pay for it.
          </p>
        </header>

        {/* Action Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {actions.map((action, idx) => (
            <motion.button
              key={action.id}
              onClick={() => navigate(action.path)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`relative overflow-hidden glass-panel p-6 flex flex-col items-start text-left group hover:border-brand-emerald/30 transition-colors`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              <div className="w-10 h-10 rounded-xl bg-surface-elevated border border-border-subtle flex items-center justify-center mb-4 relative z-10 group-hover:scale-110 transition-transform duration-300">
                <action.icon size={20} className="text-text-primary group-hover:text-brand-emerald transition-colors" />
              </div>
              
              <h3 className="font-semibold text-text-primary relative z-10">{action.label}</h3>
            </motion.button>
          ))}
        </div>
      </section>

      <hr className="border-border-subtle my-12" />

      {/* ── SECONDARY: WALLET & SAVINGS ────────────────────────────────────── */}
      <section className="mb-12 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-text-muted mb-6">
            Your Wallet
          </h2>
          <div className="glass-panel p-6 flex items-center justify-between">
            <div>
              <p className="text-3xl font-display font-bold text-text-primary tracking-tight">
                {userCards.length}
              </p>
              <p className="text-sm text-text-muted mt-1">Active Cards</p>
            </div>
            <button onClick={() => navigate('/app/wallet')} className="text-sm font-medium text-brand-emerald hover:text-brand-400">
              View Credit →
            </button>
          </div>
        </div>

        <div>
          <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-text-muted mb-6 opacity-0">
            Savings
          </h2>
          <SavingsMetricDisplay amount={4820} period="This month" />
        </div>
      </section>

      <hr className="border-border-subtle my-12" />

      {/* ── TERTIARY: SMARTER PURCHASES ────────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-text-muted">
            Smarter Purchases For You
          </h2>
          <button onClick={() => navigate('/app/lifestyle')} className="text-xs font-semibold text-brand-emerald uppercase tracking-wider">
            Explore All
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 rounded-2xl bg-surface-elevated animate-pulse border border-border-subtle" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map(({ entity, result }) => (
              <SmartSpendCard
                key={entity.id}
                title={entity.name}
                originalPrice={entity.basePrice}
                optimizationResult={result}
                recommendation={{
                  reason: result.reason.primary || 'Best overall value',
                  features: result.reason.supportingFactors || [],
                  badge: result.savings > 0 ? 'Best Value' : undefined
                }}
                onViewDeal={() => navigate(`/app/lifestyle/partner/${entity.partnerId}`)}
              />
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
