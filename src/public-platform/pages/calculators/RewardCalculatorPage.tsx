import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '../../components/SEO';
import { getFlagshipPublicCards } from '../../lib/cardKnowledgeGraph';
import { getBreadcrumbSchema, getOrganizationSchema, getWebSiteSchema } from '../../lib/schemaBuilders';
import { Calculator, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

// Helper component for animating number changes
function AnimatedNumber({ value, prefix = '₹', className = '' }: { value: number, prefix?: string, className?: string }) {
  const shouldReduceMotion = useReducedMotion();
  
  if (shouldReduceMotion) {
    return <span className={className}>{prefix}{value.toLocaleString('en-IN')}</span>;
  }
  
  return (
    <span className={`inline-flex relative ${className}`}>
      {prefix}
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="inline-block"
        >
          {value.toLocaleString('en-IN')}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export function RewardCalculatorPage() {
  const cards = getFlagshipPublicCards();
  const [selectedCardId, setSelectedCardId] = useState<string>(cards[0]?.id || '');
  const [monthlySpend, setMonthlySpend] = useState<number>(50000);
  const shouldReduceMotion = useReducedMotion();

  const selectedCard = cards.find((c) => c.id === selectedCardId) || cards[0];

  // =========================================================
  // DO NOT CHANGE FUNCTIONAL BEHAVIOR / FINANCIAL LOGIC
  // =========================================================
  const isCashback = selectedCard?.rewardType === 'cashback';
  const effectiveRate = selectedCard?.annualFee >= 10000 ? 0.05 : isCashback ? 0.04 : 0.02;
  const estimatedMonthlyReward = Math.round(monthlySpend * effectiveRate);
  const estimatedAnnualReward = estimatedMonthlyReward * 12;
  const annualFee = selectedCard?.annualFee || 0;
  const estimatedNetAnnualValue = Math.max(0, estimatedAnnualReward - annualFee);
  // =========================================================

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', item: '/' },
    { name: 'Calculators', item: '/calculators/credit-card-reward-calculator' },
    { name: 'Credit Card Reward Calculator', item: '/calculators/credit-card-reward-calculator' },
  ]);

  return (
    <div className="w-full relative min-h-[100dvh] bg-editorial-light-cream text-editorial-deep-forest selection:bg-[#008933]/20 font-sans flex flex-col">
      <SEO
        title="Credit Card Reward Calculator (2026) | Estimate Cashback & Points | RenoCred"
        description="Calculate your estimated monthly and annual reward earnings across Indian credit cards. Calculate net annual value after annual fee deductions."
        canonicalUrl="https://renocred.com/calculators/credit-card-reward-calculator"
        schemaData={[getOrganizationSchema(), getWebSiteSchema(), breadcrumbSchema]}
      />

      {/* Main Content Area - constrained for optimal desktop viewport (MacBook Air 1280x800) */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-24 lg:py-32 flex flex-col gap-12 lg:gap-16">
        
        {/* Page Hero */}
        <header className="w-full max-w-3xl">
          <motion.div 
            initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="flex items-center gap-2 mb-4"
          >
            <div className="text-[10px] font-bold text-editorial-muted-sage uppercase tracking-widest border border-editorial-soft-sage/30 px-3 py-1.5 rounded-full flex items-center gap-1.5 bg-white/50">
              <Calculator size={12} /> PUBLIC UTILITY
            </div>
          </motion.div>
          
          <motion.h1 
            initial={shouldReduceMotion ? false : { opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-serif font-medium tracking-tight leading-[1.05] text-editorial-deep-forest mb-6"
          >
            Credit Card Reward<br className="hidden sm:block" /> Calculator.
          </motion.h1>
          
          <motion.p 
            initial={shouldReduceMotion ? false : { opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg text-editorial-muted-sage font-light max-w-xl leading-relaxed"
          >
            Estimate the reward value of your card and understand what it can actually return after annual fees.
          </motion.p>
        </header>

        {/* Layout: Input (Left) & Result (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_440px] gap-8 lg:gap-16 items-start">
          
          {/* LEFT: INPUT / CARD SELECTION */}
          <motion.div 
            initial={shouldReduceMotion ? false : { opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ delay: 0.3 }}
            className="flex flex-col gap-8 w-full"
          >
            
            <div className="bg-white border border-editorial-soft-sage/30 rounded-3xl p-6 sm:p-10 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow duration-500">
              {/* Subtle ambient lighting inside card */}
              <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-editorial-soft-sage/5 rounded-full blur-[80px] pointer-events-none" />
              
              <div className="relative z-10 flex flex-col gap-10">
                
                {/* Card Selection */}
                <div className="flex flex-col gap-4">
                  <label htmlFor="card-select" className="text-[10px] font-bold text-editorial-muted-sage uppercase tracking-widest flex items-center gap-2">
                    <span className="w-4 h-[1px] bg-editorial-muted-sage/30"></span>
                    Select your card
                  </label>
                  
                  <div className="relative">
                    <select
                      id="card-select"
                      value={selectedCardId}
                      onChange={(e) => setSelectedCardId(e.target.value)}
                      className="w-full appearance-none bg-editorial-light-cream/50 border border-editorial-soft-sage/40 text-base lg:text-lg text-editorial-deep-forest font-medium rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-[#008933]/20 focus:border-[#008933]/50 transition-all cursor-pointer hover:bg-white"
                    >
                      {cards.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.cardName} ({c.issuer})
                        </option>
                      ))}
                    </select>
                    {/* Custom Arrow */}
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-editorial-muted-sage">
                      <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Monthly Spend Slider */}
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-2 border-b border-editorial-soft-sage/20 pb-4">
                    <label htmlFor="spend-slider" className="text-[10px] font-bold text-editorial-muted-sage uppercase tracking-widest flex items-center gap-2">
                      <span className="w-4 h-[1px] bg-editorial-muted-sage/30"></span>
                      Estimated Monthly Spend
                    </label>
                    <div className="text-3xl font-serif text-[#008933] font-medium leading-none">
                      <AnimatedNumber value={monthlySpend} />
                    </div>
                  </div>
                  
                  <div className="relative pt-2 pb-6">
                    <input
                      id="spend-slider"
                      type="range"
                      min={5000}
                      max={500000}
                      step={5000}
                      value={monthlySpend}
                      onChange={(e) => setMonthlySpend(Number(e.target.value))}
                      className="w-full h-1.5 bg-editorial-soft-sage/20 rounded-full appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#008933]/20
                        [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#008933] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110"
                      style={{
                        background: `linear-gradient(to right, #008933 ${(monthlySpend - 5000) / (500000 - 5000) * 100}%, rgba(174, 195, 176, 0.3) ${(monthlySpend - 5000) / (500000 - 5000) * 100}%)`
                      }}
                    />
                    <div className="flex justify-between text-[10px] text-editorial-muted-sage mt-3 font-medium uppercase tracking-wider">
                      <span>₹5,000</span>
                      <span>₹5,00,000</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Selected Card Details Info Block */}
            <div className="bg-editorial-soft-sage/5 border border-editorial-soft-sage/20 rounded-2xl p-5 sm:p-6 text-sm flex flex-col gap-3">
              <div className="text-[10px] font-bold text-editorial-muted-sage uppercase tracking-widest flex items-center gap-2 mb-1">
                <ShieldCheck size={14} className="text-editorial-muted-sage" />
                Selected Card
              </div>
              <div className="font-serif text-lg text-editorial-deep-forest font-medium">
                {selectedCard?.cardName} <span className="font-sans text-sm font-normal text-editorial-muted-sage ml-1">({selectedCard?.issuer})</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 mt-2">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-editorial-muted-sage uppercase tracking-wider font-bold">Reward Structure</span>
                  <span className="text-editorial-deep-forest">{selectedCard?.rewardRate}</span>
                </div>
                <div className="w-[1px] bg-editorial-soft-sage/20 hidden sm:block"></div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-editorial-muted-sage uppercase tracking-wider font-bold">Annual Fee</span>
                  <span className="text-editorial-deep-forest">{selectedCard?.formattedAnnualFee}</span>
                </div>
              </div>
            </div>

          </motion.div>

          {/* RIGHT: RESULT / OUTPUT */}
          <motion.div 
            initial={shouldReduceMotion ? false : { opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ delay: 0.4 }}
            className="w-full flex flex-col gap-6 sticky top-28"
          >
            {/* The Result Card */}
            <div className="bg-[#0b1c11] text-white border border-[#1b3c25] rounded-[2rem] p-8 sm:p-10 shadow-xl relative overflow-hidden flex flex-col">
              
              <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-[#008933]/10 rounded-full blur-[60px] pointer-events-none" />

              <div className="text-[10px] font-bold text-editorial-soft-sage uppercase tracking-widest mb-10 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#008933]"></span>
                Your Estimate
              </div>

              <div className="flex flex-col gap-8 relative z-10 flex-1">
                
                {/* Primary Metric */}
                <div className="flex flex-col gap-3 pb-8 border-b border-white/10">
                  <span className="text-xs text-editorial-soft-sage uppercase tracking-widest font-semibold">Estimated Net Annual Value</span>
                  <div className="text-[clamp(3rem,5vw,4rem)] font-serif text-white leading-none tracking-tight">
                    <AnimatedNumber value={estimatedNetAnnualValue} />
                  </div>
                </div>

                {/* Secondary Metrics */}
                <div className="flex flex-col gap-5">
                  <div className="flex justify-between items-center group">
                    <span className="text-sm text-editorial-soft-sage font-light group-hover:text-white transition-colors">Monthly reward value</span>
                    <span className="text-base font-mono text-white"><AnimatedNumber value={estimatedMonthlyReward} /></span>
                  </div>
                  
                  <div className="flex justify-between items-center group">
                    <span className="text-sm text-editorial-soft-sage font-light group-hover:text-white transition-colors">Gross annual rewards</span>
                    <span className="text-base font-mono text-white"><AnimatedNumber value={estimatedAnnualReward} /></span>
                  </div>
                  
                  <div className="flex justify-between items-center group">
                    <span className="text-sm text-editorial-soft-sage/70 font-light">Annual fee</span>
                    <span className="text-sm font-mono text-white/50">- <AnimatedNumber value={annualFee} /></span>
                  </div>
                </div>

              </div>
              
              <div className="pt-10 mt-2 relative z-10">
                <Link
                  to="/app"
                  className="w-full group flex items-center justify-between px-6 py-4 rounded-xl bg-white text-editorial-deep-forest font-bold text-sm transition-all hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] active:scale-[0.98]"
                >
                  <span>Optimize in RenoCred</span>
                  <ArrowRight size={16} className="text-editorial-deep-forest/50 group-hover:translate-x-1 group-hover:text-editorial-deep-forest transition-all" />
                </Link>
              </div>
              
            </div>

            {/* Disclaimer */}
            <div className="px-2">
              <p className="text-[11px] leading-relaxed text-editorial-muted-sage">
                <strong className="font-semibold block mb-1">Calculator Disclaimer</strong>
                Calculated figures are estimates based on standard reward multipliers. Actual payouts depend on category spend breakdowns, portal multipliers (e.g. SmartBuy), reward redemption choices, and monthly capping policies.
              </p>
            </div>
            
          </motion.div>
          
        </div>
      </main>
    </div>
  );
}
