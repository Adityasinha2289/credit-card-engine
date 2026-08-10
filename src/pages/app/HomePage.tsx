import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getGreeting } from '../../lib/greeting';
import { useDashboardStore } from '../../features/dashboard/store/dashboardStore';
import { CommerceOptimizationService } from '../../features/commerce';
import type { OptimizationResult } from '../../features/optimization/types';
import { cn } from '../../lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
//  HOME V3.1 — Intelligence Canvas Refinement
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
    <div className="w-full max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-16 py-10 lg:py-16 pb-32 flex flex-col gap-10 lg:gap-14">
      
      {/* ── 1. HERO ──────────────────────────────────────────────────────── */}
      <section className="relative z-10">
        {/* Subtle emerald atmospheric light behind typography */}
        <div className="absolute top-20 left-0 w-96 h-64 bg-[radial-gradient(ellipse_at_center,_rgba(25,184,106,0.06)_0%,_transparent_70%)] rounded-full blur-[80px] pointer-events-none" />
        
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-semantic-text-muted text-[10px] font-semibold tracking-[0.2em] uppercase mb-5">
            {getGreeting()}, {firstName}
          </p>
          <h1 className="text-5xl lg:text-[4.5rem] font-display font-medium text-semantic-text-primary tracking-tight leading-[1.05] whitespace-pre-line">
            {'Your money,\nworking smarter.'}
          </h1>
        </motion.div>
      </section>

      {/* ── 2. INTENT SELECTOR (Navigation Style) ──────────────────────── */}
      <section className="relative z-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex items-center gap-8 lg:gap-12"
        >
          {INTENTS.map((intent) => {
            const isHovered = hoveredIntent === intent.id;
            return (
              <button
                key={intent.id}
                onClick={() => navigate(intent.path)}
                onMouseEnter={() => setHoveredIntent(intent.id)}
                onMouseLeave={() => setHoveredIntent(null)}
                className="relative py-2 group"
              >
                <span className={cn(
                  "text-[13px] font-medium tracking-wider transition-all duration-300 uppercase",
                  isHovered ? "text-[#19B86A]" : "text-semantic-text-muted"
                )}>
                  {intent.label}
                </span>
                
                {/* Subtle emerald underline indicator */}
                <div className={cn(
                  "absolute bottom-0 left-0 h-[1px] bg-[#19B86A] transition-all duration-300 ease-out",
                  isHovered ? "w-full opacity-100" : "w-0 opacity-0"
                )} />
              </button>
            );
          })}
        </motion.div>
      </section>

      {/* ── 3. INTELLIGENCE CANVAS ───────────────────────────────────────── */}
      <section className="relative w-full">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full overflow-hidden bg-[#060907] rounded-[2rem] lg:rounded-[2.5rem] border border-white/[0.03]"
        >
          {/* Atmospheric field inside canvas */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,_rgba(13,107,67,0.06)_0%,_transparent_70%)]" />
          
          <div className="relative flex flex-col lg:flex-row min-h-[380px] lg:min-h-[440px]">
            
            {/* Left: Financial Insight */}
            <div className="flex-1 p-8 lg:p-16 flex flex-col justify-center z-20">
              <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-semantic-text-muted mb-6 lg:mb-8 flex items-center gap-3">
                <span className="w-1 h-1 rounded-full bg-[#19B86A] animate-pulse" />
                Intelligence Signal
              </p>
              
              <motion.h2 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.8 }}
                className="text-6xl lg:text-[5.5rem] font-mono font-medium text-semantic-text-primary tracking-tighter mb-4"
              >
                ₹{savings.toLocaleString('en-IN')}
              </motion.h2>
              
              <p className="text-xl lg:text-2xl font-medium text-semantic-text-secondary tracking-tight mb-4">
                potential value this cycle
              </p>
              
              <p className="text-[13px] text-semantic-text-muted max-w-sm leading-relaxed mb-8 lg:mb-10">
                RenoCred identified an opportunity to improve the value you're extracting from your current wallet.
              </p>
              
              <button 
                onClick={() => navigate('/app/lifestyle/shop')}
                className="group flex items-center gap-3 text-[13px] font-semibold text-[#19B86A] tracking-wider uppercase transition-colors"
              >
                Explore opportunity
                <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
              </button>
            </div>

            {/* Right: Restrained Visualization */}
            <div className="hidden lg:block absolute inset-0 left-1/3 pointer-events-none z-10 overflow-hidden">
              <svg 
                width="100%" 
                height="100%" 
                viewBox="0 0 800 600" 
                preserveAspectRatio="xMidYMid slice"
                className="absolute right-0 top-0 opacity-40"
              >
                <defs>
                  <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="transparent" />
                    <stop offset="50%" stopColor="#19B86A" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="transparent" />
                  </linearGradient>
                </defs>
                <motion.g
                  animate={{
                    x: [0, -20, 0],
                    y: [0, 10, 0]
                  }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <path d="M 0,300 Q 400,100 800,300" fill="none" stroke="url(#lineGrad)" strokeWidth="0.5" />
                  <path d="M 0,320 Q 400,500 800,320" fill="none" stroke="url(#lineGrad)" strokeWidth="0.5" />
                  <path d="M 100,100 Q 500,400 900,100" fill="none" stroke="url(#lineGrad)" strokeWidth="0.5" />
                  <circle cx="400" cy="220" r="1.5" fill="#19B86A" fillOpacity="0.6" />
                  <circle cx="550" cy="380" r="1.5" fill="#19B86A" fillOpacity="0.6" />
                  <circle cx="650" cy="270" r="1.5" fill="#19B86A" fillOpacity="0.6" />
                </motion.g>
              </svg>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── 4. QUIET FINANCIAL SIGNATURE ───────────────────────────────── */}
      <section className="relative z-10 mt-2 px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="flex flex-wrap items-center gap-10 lg:gap-16"
        >
          <div className="flex items-baseline gap-3">
            <span className="text-xl font-mono font-medium text-semantic-text-primary">
              {String(userCards.length).padStart(2, '0')}
            </span>
            <span className="text-[10px] uppercase tracking-widest text-semantic-text-muted">
              Active cards
            </span>
          </div>

          <div className="w-[1px] h-6 bg-white/[0.05]" />

          <div className="flex items-baseline gap-3">
            <span className="text-xl font-mono font-medium text-semantic-text-primary">
              {creditScore}
            </span>
            <span className="text-[10px] uppercase tracking-widest text-semantic-text-muted">
              CIBIL
            </span>
          </div>

          <div className="w-[1px] h-6 bg-white/[0.05]" />

          <div className="flex items-baseline gap-3">
            <span className="text-xl font-mono font-medium text-semantic-text-primary">
              ₹{(totalSpend / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </span>
            <span className="text-[10px] uppercase tracking-widest text-semantic-text-muted">
              Cycle spend
            </span>
          </div>
        </motion.div>
      </section>

    </div>
  );
}
