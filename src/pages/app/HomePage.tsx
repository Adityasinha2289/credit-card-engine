import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getGreeting } from '../../lib/greeting';
import { useDashboardStore } from '../../features/dashboard/store/dashboardStore';
import { CommerceOptimizationService } from '../../features/commerce';
import { cn } from '../../lib/utils';
import { 
  Search, Layers, CreditCard, Compass, Plane, Utensils, 
  ShoppingBag, BookOpen, Activity, ArrowRight, CheckCircle2 
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
//  HOME V4 — Information Architecture Recomposition
// ─────────────────────────────────────────────────────────────────────────────

const INTENTS = [
  { id: 'travel',    label: 'Travel',        path: '/app/lifestyle/plan' },
  { id: 'dining',    label: 'Dining',         path: '/app/lifestyle/plan/date' },
  { id: 'shopping',  label: 'Shopping',       path: '/app/lifestyle/shop' },
  { id: 'learning',  label: 'Learning',       path: '/app/lifestyle/invest' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const profile = useDashboardStore((s) => s.profile);
  const userCards = useDashboardStore((s) => s.userCards);
  const transactions = useDashboardStore((s) => s.transactions);

  const [hoveredIntent, setHoveredIntent] = useState<string | null>(null);
  const [savings, setSavings] = useState<number>(0);

  // Derive real financial data from the store
  const totalSpend = useMemo(() => {
    return transactions
      .filter(t => t.type === 'debit')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  useEffect(() => {
    async function fetchResults() {
      try {
        const userId = profile?.id || 'demo-user-id';
        const data = await CommerceOptimizationService.optimizeCollection(userId);
        const total = data.reduce((sum, { result }) => sum + result.savings, 0);
        setSavings(total > 0 ? total : 12000);
      } catch (err) {
        console.error("Failed to load commerce data", err);
      }
    }
    fetchResults();
  }, [profile?.id]);

  const firstName = profile?.name?.split(' ')[0] || 'there';
  const creditScore = profile?.creditScore || 810;

  return (
    <div className="w-full max-w-[1200px] mx-auto px-6 sm:px-8 lg:px-12 py-10 lg:py-16 pb-32 flex flex-col gap-16 lg:gap-24 relative">
      
      {/* Global Background Atmosphere */}
      <div className="fixed inset-0 pointer-events-none z-[-1] bg-[#050806]" />
      <div className="fixed inset-0 pointer-events-none z-[-1] bg-[radial-gradient(ellipse_at_top_right,_rgba(13,107,67,0.05)_0%,_transparent_50%)]" />

      {/* ── 1. HERO ──────────────────────────────────────────────────────── */}
      <section className="relative z-10 flex flex-col gap-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-semantic-text-muted text-[10px] font-semibold tracking-[0.2em] uppercase mb-4">
            {getGreeting()}, {firstName}
          </p>
          <h1 className="text-[2.75rem] lg:text-[4rem] font-display font-medium text-semantic-text-primary tracking-tight leading-[1.05] whitespace-pre-line mb-4">
            {'Your money,\nworking smarter.'}
          </h1>
          <p className="text-sm lg:text-base text-semantic-text-muted tracking-wide max-w-md">
            One intelligent view of your cards, spending and opportunities.
          </p>
        </motion.div>

        {/* Intent Navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-wrap items-center gap-6 lg:gap-10"
        >
          {INTENTS.map((intent) => {
            const isHovered = hoveredIntent === intent.id;
            return (
              <button
                key={intent.id}
                onClick={() => navigate(intent.path)}
                onMouseEnter={() => setHoveredIntent(intent.id)}
                onMouseLeave={() => setHoveredIntent(null)}
                className="relative py-2 group flex items-center gap-2"
              >
                <span className={cn(
                  "text-[12px] font-medium tracking-wider transition-all duration-300 uppercase",
                  isHovered ? "text-[#19B86A]" : "text-semantic-text-muted"
                )}>
                  {intent.label}
                </span>
                <div className={cn(
                  "absolute bottom-0 left-0 h-[1px] bg-[#19B86A] transition-all duration-300 ease-out",
                  isHovered ? "w-full opacity-100" : "w-0 opacity-0"
                )} />
              </button>
            );
          })}
        </motion.div>
      </section>

      {/* ── 2. PRIMARY ACTIONS & TRANSACTION INTELLIGENCE ──────────────── */}
      <section className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
        
        {/* Left Column: Primary Actions */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Large Action */}
          <button 
            onClick={() => navigate('/app/credit/advisor')}
            className="group flex flex-col gap-4 p-8 rounded-[1.5rem] bg-white/[0.01] hover:bg-white/[0.02] border border-white/[0.03] transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-full bg-white/[0.03] flex items-center justify-center mb-2 group-hover:text-[#19B86A] transition-colors">
              <Search className="w-4 h-4 text-semantic-text-secondary group-hover:text-[#19B86A]" />
            </div>
            <div>
              <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-semantic-text-muted mb-1">
                Find Your Card
              </p>
              <h3 className="text-lg text-semantic-text-primary font-medium mb-2 group-hover:text-[#19B86A] transition-colors">
                What's the best credit card for me?
              </h3>
              <p className="text-[13px] text-semantic-text-muted">
                Analyze your spending to find cards that maximize your rewards.
              </p>
            </div>
          </button>

          {/* Medium Actions Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button 
              onClick={() => navigate('/app/wallet')}
              className="group flex flex-col gap-3 p-6 rounded-[1rem] bg-white/[0.01] hover:bg-white/[0.02] border border-white/[0.03] transition-colors text-left"
            >
              <Layers className="w-4 h-4 text-semantic-text-secondary group-hover:text-[#19B86A]" />
              <div>
                <p className="text-[9px] font-semibold tracking-[0.18em] uppercase text-semantic-text-muted mb-1">
                  Compare Wallet
                </p>
                <p className="text-[13px] text-semantic-text-secondary group-hover:text-[#19B86A] transition-colors">
                  Which card should I keep, use or replace?
                </p>
              </div>
            </button>
            <button 
              onClick={() => navigate('/app/lifestyle')}
              className="group flex flex-col gap-3 p-6 rounded-[1rem] bg-white/[0.01] hover:bg-white/[0.02] border border-white/[0.03] transition-colors text-left"
            >
              <Compass className="w-4 h-4 text-semantic-text-secondary group-hover:text-[#19B86A]" />
              <div>
                <p className="text-[9px] font-semibold tracking-[0.18em] uppercase text-semantic-text-muted mb-1">
                  Explore
                </p>
                <p className="text-[13px] text-semantic-text-secondary group-hover:text-[#19B86A] transition-colors">
                  Discover rewards and smarter ways to spend.
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Right Column: Transaction Intelligence */}
        <div className="lg:col-span-7 flex h-full">
          <div className="w-full relative overflow-hidden bg-[#06140D] rounded-[1.5rem] lg:rounded-[2rem] border border-white/[0.02] p-8 lg:p-12 flex flex-col justify-center">
            {/* Atmospheric light */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,_rgba(25,184,106,0.08)_0%,_transparent_70%)] pointer-events-none" />
            
            <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-[#19B86A] mb-8 flex items-center gap-2">
              <CreditCard className="w-3 h-3" />
              Which card should I use?
            </p>
            
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="text-4xl lg:text-5xl font-mono font-medium text-semantic-text-primary tracking-tight mb-2">
                  ₹8,500
                </h3>
                <p className="text-semantic-text-secondary text-lg">
                  for a flight to Dubai
                </p>
              </div>

              <div className="h-[1px] w-full bg-white/[0.05]" />

              <div>
                <p className="text-[11px] font-medium tracking-[0.1em] uppercase text-semantic-text-muted mb-2">
                  RenoCred Recommendation
                </p>
                <div className="flex items-center gap-4">
                  <p className="text-semantic-text-primary font-medium">SBI Signature Rewards</p>
                  <span className="px-2 py-1 rounded-full bg-[#19B86A]/10 text-[#19B86A] text-[11px] font-semibold tracking-wider">
                    + ₹1,240 estimated value
                  </span>
                </div>
              </div>

              <button className="group self-start flex items-center gap-2 mt-4 text-[12px] font-semibold tracking-wider uppercase text-semantic-text-primary hover:text-[#19B86A] transition-colors">
                Use this card
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. FINANCIAL POSITION & OPPORTUNITY ──────────────────────── */}
      <section className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
        
        {/* Left: Financial Signature */}
        <div className="lg:col-span-7 flex items-center">
          <div className="flex flex-col">
            <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-semantic-text-muted mb-6">
              Your Financial Position
            </p>
            <div className="flex flex-wrap items-center gap-8 lg:gap-16">
              <div className="flex flex-col gap-1">
                <span className="text-2xl font-mono font-medium text-semantic-text-primary">
                  {String(userCards.length).padStart(2, '0')}
                </span>
                <span className="text-[9px] uppercase tracking-widest text-semantic-text-muted">
                  Cards
                </span>
              </div>
              <div className="w-[1px] h-8 bg-white/[0.05]" />
              <div className="flex flex-col gap-1">
                <span className="text-2xl font-mono font-medium text-semantic-text-primary">
                  {creditScore}
                </span>
                <span className="text-[9px] uppercase tracking-widest text-semantic-text-muted">
                  CIBIL
                </span>
              </div>
              <div className="w-[1px] h-8 bg-white/[0.05]" />
              <div className="flex flex-col gap-1">
                <span className="text-2xl font-mono font-medium text-semantic-text-primary">
                  ₹{(totalSpend / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </span>
                <span className="text-[9px] uppercase tracking-widest text-semantic-text-muted">
                  Cycle spend
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: The Reduced Opportunity Insight */}
        <div className="lg:col-span-5">
          <div className="w-full relative overflow-hidden bg-[#0A1A13] rounded-[1.5rem] border border-[#19B86A]/[0.08] p-6 lg:p-8 flex flex-col justify-center">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(25,184,106,0.1)_0%,_transparent_60%)] pointer-events-none" />
            
            <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-[#19B86A] mb-4 flex items-center gap-2">
              <Activity className="w-3 h-3" />
              Your Opportunity
            </p>
            
            <h3 className="text-3xl font-mono font-medium text-semantic-text-primary tracking-tight mb-1">
              ₹{savings.toLocaleString('en-IN')}
            </h3>
            <p className="text-[12px] text-semantic-text-secondary mb-4">
              potential value this cycle
            </p>
            
            <p className="text-[13px] text-semantic-text-muted mb-6 leading-relaxed">
              RenoCred found opportunities across travel, dining and card rewards.
            </p>
            
            <button 
              onClick={() => navigate('/app/lifestyle/shop')}
              className="group flex items-center gap-2 text-[11px] font-semibold text-[#19B86A] tracking-wider uppercase transition-colors"
            >
              View opportunities
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* ── 4. DISCOVER / MARKETPLACE ──────────────────────────────────── */}
      <section className="relative z-10 flex flex-col gap-6">
        <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-semantic-text-muted">
          Discover
        </p>
        
        <div className="flex overflow-x-auto hide-scrollbar gap-4 lg:gap-6 pb-4">
          <button 
            onClick={() => navigate('/app/lifestyle/plan')}
            className="flex-none w-[280px] lg:w-[320px] group flex flex-col p-6 rounded-[1.25rem] bg-[#071811] border border-[#19B86A]/[0.05] hover:border-[#19B86A]/30 transition-colors text-left relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_100%,_rgba(25,184,106,0.05)_0%,_transparent_50%)] pointer-events-none group-hover:opacity-100 transition-opacity opacity-50" />
            <Plane className="w-5 h-5 text-[#19B86A] mb-4" />
            <h4 className="text-semantic-text-primary font-medium mb-2">Travel</h4>
            <p className="text-[13px] text-semantic-text-muted">Earn more from your next trip.</p>
          </button>
          
          <button 
            onClick={() => navigate('/app/lifestyle/plan/date')}
            className="flex-none w-[280px] lg:w-[320px] group flex flex-col p-6 rounded-[1.25rem] bg-white/[0.01] hover:bg-white/[0.02] border border-white/[0.03] transition-colors text-left"
          >
            <Utensils className="w-5 h-5 text-semantic-text-secondary mb-4 group-hover:text-semantic-text-primary transition-colors" />
            <h4 className="text-semantic-text-primary font-medium mb-2">Dining</h4>
            <p className="text-[13px] text-semantic-text-muted">Unlock better rewards where you already spend.</p>
          </button>
          
          <button 
            onClick={() => navigate('/app/lifestyle/shop')}
            className="flex-none w-[280px] lg:w-[320px] group flex flex-col p-6 rounded-[1.25rem] bg-white/[0.01] hover:bg-white/[0.02] border border-white/[0.03] transition-colors text-left"
          >
            <ShoppingBag className="w-5 h-5 text-semantic-text-secondary mb-4 group-hover:text-semantic-text-primary transition-colors" />
            <h4 className="text-semantic-text-primary font-medium mb-2">Shopping</h4>
            <p className="text-[13px] text-semantic-text-muted">Offers worth knowing about.</p>
          </button>
        </div>
      </section>

      {/* ── 5. NEXT FOR YOU ────────────────────────────────────────────── */}
      <section className="relative z-10 flex flex-col gap-6 mt-4">
        <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-semantic-text-muted">
          Next for you
        </p>
        
        <div className="flex flex-col max-w-2xl">
          {[
            { id: 1, text: `Review your ${userCards.length} active cards` },
            { id: 2, text: 'Upcoming bill in 4 days' },
            { id: 3, text: `You're leaving ₹2,450 in rewards unused` },
            { id: 4, text: 'Premium card upgrade available' },
          ].map((action, i, arr) => (
            <button 
              key={action.id}
              className={cn(
                "group flex items-center justify-between py-4 transition-colors",
                i !== arr.length - 1 ? "border-b border-white/[0.04]" : ""
              )}
            >
              <div className="flex items-center gap-4">
                <CheckCircle2 className="w-4 h-4 text-semantic-text-muted group-hover:text-[#19B86A] transition-colors" />
                <span className="text-[14px] text-semantic-text-secondary group-hover:text-semantic-text-primary transition-colors">
                  {action.text}
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-transparent group-hover:text-[#19B86A] transition-all -translate-x-2 group-hover:translate-x-0" />
            </button>
          ))}
        </div>
      </section>

    </div>
  );
}
