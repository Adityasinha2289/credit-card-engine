import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MapPin, Compass, ShoppingBag, Book, ArrowRight, Wallet, CreditCard, Clock, TrendingUp } from 'lucide-react';
import { getGreeting } from '../../lib/greeting';
import { useDashboardStore } from '../../features/dashboard/store/dashboardStore';
import { CommerceOptimizationService } from '../../features/commerce';
import type { CommerceEntity } from '../../features/commerce/types';
import type { OptimizationResult } from '../../features/optimization/types';

// ─────────────────────────────────────────────────────────────────────────────
//  HOME V2 — Financial Intelligence Command Center
//  Hierarchy: Context → Intent → Intelligence → Action → Discovery
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

  const [selectedIntent, setSelectedIntent] = React.useState<string | null>(null);
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
    <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10 pb-28 lg:pb-10">

      {/* ── 1. CONTEXT / HERO ──────────────────────────────────────────── */}
      <section className="mb-10 lg:mb-14">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <p className="text-semantic-text-muted text-xs font-medium tracking-wide mb-2">
            {getGreeting()}, {firstName}
          </p>
          <h1 className="text-3xl lg:text-[2.5rem] font-display font-semibold text-semantic-text-primary tracking-tight leading-tight mb-3">
            Your money, working smarter.
          </h1>
          {totalPotentialSavings > 0 && (
            <div className="flex items-baseline gap-3 mt-4">
              <span className="text-4xl lg:text-5xl font-mono font-bold text-semantic-brand tracking-tight">
                ₹{totalPotentialSavings.toLocaleString('en-IN')}
              </span>
              <span className="text-sm text-semantic-text-muted font-medium">
                potential optimization available
              </span>
            </div>
          )}
        </motion.div>
      </section>

      {/* ── 2. PRIMARY INTENT SURFACE ──────────────────────────────────── */}
      <section className="mb-10 lg:mb-14">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
          className="bg-semantic-surface-primary rounded-2xl p-5 lg:p-7 border border-semantic-border-subtle"
        >
          <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-semantic-text-muted mb-5">
            What are you planning?
          </p>
          <div className="flex flex-wrap gap-2 lg:gap-3 mb-5">
            {INTENTS.map((intent) => {
              const isSelected = selectedIntent === intent.id;
              return (
                <button
                  key={intent.id}
                  onClick={() => setSelectedIntent(isSelected ? null : intent.id)}
                  className={`
                    flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                    ${isSelected
                      ? 'bg-semantic-surface-intelligence text-semantic-brand border border-semantic-border-intelligence'
                      : 'bg-semantic-surface-card text-semantic-text-secondary border border-semantic-border-subtle hover:text-semantic-text-primary hover:border-semantic-border-strong'
                    }
                  `}
                >
                  <intent.Icon size={15} strokeWidth={isSelected ? 2 : 1.5} />
                  {intent.label}
                </button>
              );
            })}
          </div>
          {selectedIntent && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.2 }}
            >
              <button
                onClick={() => {
                  const intent = INTENTS.find(i => i.id === selectedIntent);
                  if (intent) navigate(intent.path);
                }}
                className="flex items-center gap-2 text-sm font-medium text-semantic-brand hover:text-semantic-brand-strong transition-colors"
              >
                Continue to {INTENTS.find(i => i.id === selectedIntent)?.label}
                <ArrowRight size={14} />
              </button>
            </motion.div>
          )}
        </motion.div>
      </section>

      {/* ── 3. FINANCIAL POSITION STRIP ────────────────────────────────── */}
      <section className="mb-10 lg:mb-14">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.14 }}
          className="bg-semantic-surface-primary rounded-2xl border border-semantic-border-subtle overflow-hidden"
        >
          <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-semantic-text-muted px-5 lg:px-7 pt-5 lg:pt-6 pb-3">
            Your financial position
          </p>
          <div className="grid grid-cols-3 divide-x divide-semantic-border-subtle">
            {/* Wallet */}
            <button
              onClick={() => navigate('/app/wallet')}
              className="px-5 lg:px-7 pb-5 lg:pb-6 text-left hover:bg-semantic-surface-card transition-colors group"
            >
              <p className="text-2xl lg:text-3xl font-display font-semibold text-semantic-text-primary tracking-tight">
                {userCards.length}
              </p>
              <p className="text-xs text-semantic-text-muted mt-0.5 group-hover:text-semantic-text-secondary transition-colors">
                {userCards.length === 1 ? 'card' : 'cards'} in wallet
              </p>
            </button>

            {/* Credit Health */}
            <button
              onClick={() => navigate('/app/credit')}
              className="px-5 lg:px-7 pb-5 lg:pb-6 text-left hover:bg-semantic-surface-card transition-colors group"
            >
              <p className="text-2xl lg:text-3xl font-mono font-bold text-semantic-brand tracking-tight">
                {creditScore}
              </p>
              <p className="text-xs text-semantic-text-muted mt-0.5 group-hover:text-semantic-text-secondary transition-colors">
                CIBIL
              </p>
            </button>

            {/* Spend this cycle */}
            <div className="px-5 lg:px-7 pb-5 lg:pb-6 text-left">
              <p className="text-2xl lg:text-3xl font-mono font-semibold text-semantic-text-primary tracking-tight">
                ₹{(totalSpend / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </p>
              <p className="text-xs text-semantic-text-muted mt-0.5">
                spent this cycle
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── MAIN GRID: Intelligence (8 cols) + Actions (4 cols) ─────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

        {/* ── LEFT: Intelligence + Discovery ──────────────────────────── */}
        <div className="lg:col-span-8 flex flex-col gap-10 lg:gap-14">

          {/* ── 4. INTELLIGENCE MODULE ──────────────────────────────── */}
          <section>
            <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-semantic-text-muted mb-4">
              Your money, optimized
            </p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative rounded-2xl overflow-hidden"
            >
              {/* Intelligence background — deep forest with subtle emerald glow */}
              <div className="absolute inset-0 bg-semantic-surface-intelligence" />
              <div className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(ellipse_at_top_right,_rgba(0,229,153,0.06)_0%,_transparent_60%)]" />

              <div className="relative p-6 lg:p-8">
                {/* Primary insight */}
                {topCategory ? (
                  <>
                    <p className="text-sm text-semantic-text-secondary leading-relaxed mb-4 max-w-lg">
                      Your highest spending this cycle is <span className="text-semantic-text-primary font-medium">{topCategory.name}</span> at{' '}
                      <span className="font-mono font-semibold text-semantic-text-primary">
                        ₹{(topCategory.amount / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </span>.
                      {userCards.length > 1
                        ? ' RenoCred can identify the optimal card for each category.'
                        : ' Add more cards to unlock cross-wallet optimization.'}
                    </p>

                    {totalPotentialSavings > 0 && (
                      <div className="flex items-baseline gap-3 mb-6">
                        <span className="text-3xl lg:text-4xl font-mono font-bold text-semantic-brand tracking-tight">
                          ₹{totalPotentialSavings.toLocaleString('en-IN')}
                        </span>
                        <span className="text-xs text-semantic-text-muted font-medium">
                          potential optimization
                        </span>
                      </div>
                    )}

                    {/* Category breakdown from commerce results */}
                    {commerceResults.length > 0 && (
                      <div className="border-t border-white/[0.04] pt-5 mt-2 space-y-3">
                        {commerceResults.map(({ entity, result }) => (
                          <div key={entity.id} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="text-semantic-text-secondary truncate">{entity.name}</span>
                              <span className="text-semantic-text-muted text-xs hidden sm:inline">
                                via {result.recommendedPaymentMethod.paymentMethodName}
                              </span>
                            </div>
                            {result.savings > 0 && (
                              <span className="font-mono text-semantic-brand font-semibold text-xs shrink-0 ml-3">
                                +₹{result.savings.toLocaleString('en-IN')}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    <button
                      onClick={() => navigate('/app/lifestyle/shop')}
                      className="flex items-center gap-2 text-sm font-medium text-semantic-brand hover:text-semantic-brand-strong transition-colors mt-6"
                    >
                      View all optimizations <ArrowRight size={14} />
                    </button>
                  </>
                ) : (
                  <div className="py-4">
                    <p className="text-sm text-semantic-text-secondary">
                      Start spending to unlock optimization insights.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* ── WHY THIS MATTERS ──────────────────────────────────── */}
            {topCategory && userCards.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-4 bg-semantic-surface-card rounded-xl p-5 border border-semantic-border-subtle"
              >
                <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-semantic-text-muted mb-2">
                  Why this matters
                </p>
                <p className="text-sm text-semantic-text-secondary leading-relaxed">
                  Your current wallet gives you the strongest return on{' '}
                  <span className="text-semantic-text-primary font-medium">{topCategory.name}</span>{' '}
                  transactions with your{' '}
                  <span className="text-semantic-text-primary font-medium">{userCards[0]?.bank} {userCards[0]?.label}</span>.
                  {totalPotentialSavings > 0 && (
                    <span className="inline-flex items-center gap-1.5 ml-2 font-mono text-semantic-brand font-semibold text-xs">
                      Potential upside +₹{totalPotentialSavings.toLocaleString('en-IN')}/mo
                    </span>
                  )}
                </p>
              </motion.div>
            )}
          </section>

          {/* ── 6. DISCOVERY / COMMERCE ─────────────────────────────── */}
          <section>
            <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-semantic-text-muted mb-5">
              Smarter purchases
            </p>

            {isLoading ? (
              <div className="space-y-4">
                {[1, 2].map(i => (
                  <div key={i} className="h-32 bg-semantic-surface-primary rounded-2xl animate-pulse border border-semantic-border-subtle" />
                ))}
              </div>
            ) : commerceResults.length > 0 ? (
              <div className="space-y-3">
                {commerceResults.map(({ entity, result }, idx) => (
                  <motion.button
                    key={entity.id}
                    onClick={() => navigate(`/app/lifestyle/partner/${entity.partnerId}`)}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * idx }}
                    className="w-full text-left bg-semantic-surface-primary rounded-xl p-5 border border-semantic-border-subtle hover:border-semantic-border-strong hover:bg-semantic-surface-card transition-all duration-150 group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-semantic-text-primary mb-1 group-hover:text-semantic-brand transition-colors truncate">
                          {entity.name}
                        </h3>
                        <p className="text-xs text-semantic-text-muted">
                          Best via {result.recommendedPaymentMethod.paymentMethodName}
                        </p>
                        {result.reason.primary && (
                          <p className="text-xs text-semantic-text-muted mt-1.5 line-clamp-1">
                            {result.reason.primary}
                          </p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-lg font-mono font-bold text-semantic-text-primary tracking-tight">
                          ₹{result.effectiveCost.toLocaleString('en-IN')}
                        </p>
                        {result.savings > 0 && (
                          <p className="text-xs font-mono font-semibold text-semantic-brand mt-0.5">
                            Save ₹{result.savings.toLocaleString('en-IN')}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            ) : (
              <div className="bg-semantic-surface-primary rounded-xl p-8 text-center border border-semantic-border-subtle">
                <p className="text-sm text-semantic-text-muted">No purchase optimizations available right now.</p>
              </div>
            )}
          </section>
        </div>

        {/* ── RIGHT: Worth Doing ──────────────────────────────────────── */}
        <div className="lg:col-span-4">
          <section className="lg:sticky lg:top-24">
            <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-semantic-text-muted mb-4">
              Worth doing
            </p>
            <div className="bg-semantic-surface-primary rounded-2xl border border-semantic-border-subtle overflow-hidden">
              {[
                {
                  icon: CreditCard,
                  title: 'Optimize my cards',
                  subtitle: `Review ${userCards.length} active ${userCards.length === 1 ? 'card' : 'cards'}`,
                  path: '/app/wallet',
                },
                {
                  icon: Clock,
                  title: 'Review upcoming bills',
                  subtitle: 'Check statement cycles',
                  path: '/app/wallet',
                },
                {
                  icon: TrendingUp,
                  title: 'Compare a new card',
                  subtitle: 'Your wallet may have gaps',
                  path: '/app/credit',
                },
                {
                  icon: Wallet,
                  title: 'Check rewards balance',
                  subtitle: 'Points you can redeem',
                  path: '/app/wallet',
                },
              ].map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => navigate(action.path)}
                  className="w-full flex items-center gap-4 p-4 text-left border-b border-semantic-border-subtle last:border-b-0 hover:bg-semantic-surface-card transition-colors group"
                >
                  <div className="w-9 h-9 rounded-lg bg-semantic-surface-card border border-semantic-border-subtle flex items-center justify-center shrink-0 group-hover:border-semantic-border-strong transition-colors">
                    <action.icon size={16} className="text-semantic-text-muted group-hover:text-semantic-text-secondary transition-colors" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-medium text-semantic-text-primary">{action.title}</h4>
                    <p className="text-xs text-semantic-text-muted mt-0.5 truncate">{action.subtitle}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* ── Small Taqdeer contextual hint ──────────────────── */}
            <div className="mt-4 bg-semantic-surface-card rounded-xl p-4 border border-semantic-border-subtle">
              <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-semantic-text-muted mb-2">
                Taqdeer
              </p>
              <p className="text-xs text-semantic-text-secondary leading-relaxed">
                "Planning a purchase? I can optimize the cards you should use before you buy."
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
