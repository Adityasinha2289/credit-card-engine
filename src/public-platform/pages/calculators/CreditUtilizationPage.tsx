import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '../../components/SEO';
import { getBreadcrumbSchema, getOrganizationSchema, getWebSiteSchema } from '../../lib/schemaBuilders';
import { Calculator, ArrowRight, CheckCircle2, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

// Helper component for animating number changes
function AnimatedNumber({ value, prefix = '', suffix = '', className = '' }: { value: number | string, prefix?: string, suffix?: string, className?: string }) {
  const shouldReduceMotion = useReducedMotion();
  
  if (shouldReduceMotion) {
    return <span className={className}>{prefix}{typeof value === 'number' ? value.toLocaleString('en-IN') : value}{suffix}</span>;
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
          {typeof value === 'number' ? value.toLocaleString('en-IN') : value}
        </motion.span>
      </AnimatePresence>
      {suffix}
    </span>
  );
}

export function CreditUtilizationPage() {
  const [totalCreditLimit, setTotalCreditLimit] = useState<number>(300000);
  const [currentBalance, setCurrentBalance] = useState<number>(45000);
  const shouldReduceMotion = useReducedMotion();

  // =========================================================
  // DO NOT CHANGE FUNCTIONAL BEHAVIOR / FINANCIAL LOGIC
  // =========================================================
  const utilizationRatio = totalCreditLimit > 0 ? Math.round((currentBalance / totalCreditLimit) * 100) : 0;
  
  const isHealthy = utilizationRatio <= 30;
  const isModerate = utilizationRatio > 30 && utilizationRatio <= 50;
  // =========================================================

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', item: '/' },
    { name: 'Calculators', item: '/calculators/credit-utilization' },
    { name: 'Credit Utilization Calculator', item: '/calculators/credit-utilization' },
  ]);

  return (
    <div className="w-full relative min-h-[100dvh] bg-editorial-light-cream text-editorial-deep-forest selection:bg-[#008933]/20 font-sans flex flex-col">
      <SEO
        title="Credit Utilization Ratio Calculator (2026) | CIBIL Impact | RenoCred"
        description="Calculate your credit card utilization ratio percentage and understand its impact on your CIBIL score. Ideal credit utilization benchmark guide."
        canonicalUrl="https://renocred.com/calculators/credit-utilization"
        schemaData={[getOrganizationSchema(), getWebSiteSchema(), breadcrumbSchema]}
      />

      {/* Main Content Area - constrained for optimal desktop viewport */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-24 lg:py-32 flex flex-col gap-12 lg:gap-16">
        
        {/* Page Hero */}
        <header className="w-full max-w-3xl">
          <motion.div 
            initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="flex items-center gap-2 mb-4"
          >
            <div className="text-[10px] font-bold text-editorial-muted-sage uppercase tracking-widest border border-editorial-soft-sage/30 px-3 py-1.5 rounded-full flex items-center gap-1.5 bg-white/50">
              <Calculator size={12} /> PUBLIC FINANCIAL TOOL
            </div>
          </motion.div>
          
          <motion.h1 
            initial={shouldReduceMotion ? false : { opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-serif font-medium tracking-tight leading-[1.05] text-editorial-deep-forest mb-6"
          >
            Credit Utilization<br className="hidden sm:block" /> Calculator.
          </motion.h1>
          
          <motion.p 
            initial={shouldReduceMotion ? false : { opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg text-editorial-muted-sage font-light max-w-xl leading-relaxed"
          >
            Calculate your current utilization ratio and understand how your available credit is being used.
          </motion.p>
        </header>

        {/* Layout: Input (Left) & Result (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_440px] gap-8 lg:gap-16 items-start">
          
          {/* LEFT: INPUT */}
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
                
                {/* Total Credit Limit Slider */}
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-2 border-b border-editorial-soft-sage/20 pb-4">
                    <label htmlFor="limit-slider" className="text-[10px] font-bold text-editorial-muted-sage uppercase tracking-widest flex items-center gap-2">
                      <span className="w-4 h-[1px] bg-editorial-muted-sage/30"></span>
                      Total Credit Limit (All Cards)
                    </label>
                    <div className="text-3xl font-serif text-editorial-deep-forest font-medium leading-none">
                      <AnimatedNumber value={totalCreditLimit} prefix="₹" />
                    </div>
                  </div>
                  
                  <div className="relative pt-2 pb-6">
                    <input
                      id="limit-slider"
                      type="range"
                      min={50000}
                      max={2000000}
                      step={25000}
                      value={totalCreditLimit}
                      onChange={(e) => {
                        const newLimit = Number(e.target.value);
                        setTotalCreditLimit(newLimit);
                        // Ensure balance doesn't exceed new limit visually/functionally
                        if (currentBalance > newLimit) {
                          setCurrentBalance(newLimit);
                        }
                      }}
                      className="w-full h-1.5 bg-editorial-soft-sage/20 rounded-full appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#008933]/20
                        [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#008933] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110"
                      style={{
                        background: `linear-gradient(to right, #008933 ${(totalCreditLimit - 50000) / (2000000 - 50000) * 100}%, rgba(174, 195, 176, 0.3) ${(totalCreditLimit - 50000) / (2000000 - 50000) * 100}%)`
                      }}
                    />
                    <div className="flex justify-between text-[10px] text-editorial-muted-sage mt-3 font-medium uppercase tracking-wider">
                      <span>₹50,000</span>
                      <span>₹20,00,000</span>
                    </div>
                  </div>
                </div>

                {/* Current Outstanding Balance Slider */}
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-2 border-b border-editorial-soft-sage/20 pb-4">
                    <label htmlFor="balance-slider" className="text-[10px] font-bold text-editorial-muted-sage uppercase tracking-widest flex items-center gap-2">
                      <span className="w-4 h-[1px] bg-editorial-muted-sage/30"></span>
                      Current Total Outstanding Balance
                    </label>
                    <div className="text-3xl font-serif text-[#008933] font-medium leading-none">
                      <AnimatedNumber value={currentBalance} prefix="₹" />
                    </div>
                  </div>
                  
                  <div className="relative pt-2 pb-6">
                    <input
                      id="balance-slider"
                      type="range"
                      min={0}
                      max={totalCreditLimit}
                      step={5000}
                      value={currentBalance}
                      onChange={(e) => setCurrentBalance(Number(e.target.value))}
                      className="w-full h-1.5 bg-editorial-soft-sage/20 rounded-full appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#008933]/20
                        [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#008933] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110"
                      style={{
                        background: `linear-gradient(to right, #008933 ${(currentBalance / totalCreditLimit) * 100}%, rgba(174, 195, 176, 0.3) ${(currentBalance / totalCreditLimit) * 100}%)`
                      }}
                    />
                    <div className="flex justify-between text-[10px] text-editorial-muted-sage mt-3 font-medium uppercase tracking-wider">
                      <span>₹0</span>
                      <span><AnimatedNumber value={totalCreditLimit} prefix="₹" /></span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </motion.div>

          {/* RIGHT: RESULT */}
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
                <span className={`w-2 h-2 rounded-full ${isHealthy ? 'bg-[#008933]' : isModerate ? 'bg-yellow-500' : 'bg-red-500'}`}></span>
                Credit Health
              </div>

              <div className="flex flex-col relative z-10 flex-1">
                
                {/* Visual Arc / Meter Representation */}
                <div className="w-full h-1 bg-white/10 rounded-full mb-8 overflow-hidden relative">
                  <motion.div 
                    className={`absolute top-0 left-0 h-full rounded-full ${isHealthy ? 'bg-[#008933]' : isModerate ? 'bg-yellow-500' : 'bg-red-500'}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${utilizationRatio}%` }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                  />
                </div>

                {/* Primary Metric: Utilization % */}
                <div className="flex flex-col gap-1 pb-8 border-b border-white/10">
                  <div className={`text-[clamp(4rem,7vw,5.5rem)] font-serif leading-none tracking-tight ${isHealthy ? 'text-white' : isModerate ? 'text-yellow-400' : 'text-red-400'}`}>
                    <AnimatedNumber value={utilizationRatio} suffix="%" />
                  </div>
                  <span className="text-xs text-editorial-soft-sage uppercase tracking-widest font-semibold mt-2">
                    Utilization Ratio
                  </span>
                </div>

                {/* Status Explanation */}
                <div className="py-6 border-b border-white/10 flex flex-col gap-3">
                  {isHealthy ? (
                    <>
                      <div className="flex items-center gap-2 font-bold text-sm tracking-widest uppercase text-white">
                        <CheckCircle2 size={16} className="text-[#008933]" /> Healthy Range
                      </div>
                      <p className="text-xs leading-relaxed text-editorial-soft-sage font-light">
                        Optimal Ratio! Credit bureaus (CIBIL/Experian) favor utilization below 30%.
                      </p>
                    </>
                  ) : isModerate ? (
                    <>
                      <div className="flex items-center gap-2 font-bold text-sm tracking-widest uppercase text-yellow-400">
                        <AlertTriangle size={16} /> Moderate Range
                      </div>
                      <p className="text-xs leading-relaxed text-editorial-soft-sage font-light">
                        Moderate Utilization (30%-50%). Consider making partial payments before bill generation.
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 font-bold text-sm tracking-widest uppercase text-red-400">
                        <AlertTriangle size={16} /> High Range
                      </div>
                      <p className="text-xs leading-relaxed text-editorial-soft-sage font-light">
                        High Utilization ({utilizationRatio}%). Ratios above 50% can lower your CIBIL score.
                      </p>
                    </>
                  )}
                </div>

                {/* Secondary Metrics */}
                <div className="flex flex-col gap-4 mt-6">
                  <div className="flex justify-between items-center group">
                    <span className="text-sm text-editorial-soft-sage font-light">Total Credit Limit</span>
                    <span className="text-sm font-mono text-white"><AnimatedNumber value={totalCreditLimit} prefix="₹" /></span>
                  </div>
                  
                  <div className="flex justify-between items-center group">
                    <span className="text-sm text-editorial-soft-sage font-light">Current Balance</span>
                    <span className="text-sm font-mono text-white"><AnimatedNumber value={currentBalance} prefix="₹" /></span>
                  </div>
                </div>

              </div>
              
              <div className="pt-8 mt-4 relative z-10">
                <Link
                  to="/app"
                  className="w-full group flex items-center justify-between px-6 py-4 rounded-xl bg-white text-editorial-deep-forest font-bold text-sm transition-all hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] active:scale-[0.98]"
                >
                  <span>Track in RenoCred</span>
                  <ArrowRight size={16} className="text-editorial-deep-forest/50 group-hover:translate-x-1 group-hover:text-editorial-deep-forest transition-all" />
                </Link>
              </div>
              
            </div>

            {/* Disclaimer */}
            <div className="px-2">
              <p className="text-[11px] leading-relaxed text-editorial-muted-sage">
                <strong className="font-semibold block mb-1">Educational Disclaimer</strong>
                Credit utilization accounts for approximately 30% of your total credit score calculation. This calculator provides educational estimates and does not guarantee exact credit score outcomes.
              </p>
            </div>
            
          </motion.div>
          
        </div>
      </main>
    </div>
  );
}
