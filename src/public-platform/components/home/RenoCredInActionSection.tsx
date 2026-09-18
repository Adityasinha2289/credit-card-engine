import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, CheckCircle2, ChevronRight, CreditCard } from 'lucide-react';
import { generateTaqdeerResponse } from '../../../features/finix/lib/taqdeerEngine';
import { NumberCounter } from './MotionUtils';

export function RenoCredInActionSection() {
  const [query, setQuery] = useState('');
  const [appState, setAppState] = useState<'idle' | 'loading' | 'result'>('idle');
  const [decision, setDecision] = useState<{ content: string; cards?: any[] } | null>(null);
  const [loadingStage, setLoadingStage] = useState(0);

  const STAGES = ['Analyzing intent...', 'Checking active offers...', 'Calculating rewards...'];

  const executeQuery = async (text: string) => {
    if (!text.trim()) return;
    setQuery(text);
    setAppState('loading');
    setLoadingStage(0);

    const interval = setInterval(() => {
      setLoadingStage(p => (p >= 2 ? 2 : p + 1));
    }, 500);

    try {
      const res = await generateTaqdeerResponse(text, []);
      setTimeout(() => {
        clearInterval(interval);
        setDecision(res);
        setAppState('result');
      }, 1500);
    } catch {
      clearInterval(interval);
      setDecision({ content: "Recommendation failed." });
      setAppState('result');
    }
  };

  const reset = () => {
    setAppState('idle');
    setQuery('');
    setDecision(null);
  };

  return (
    <section className="w-full py-24 bg-black text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#050505_100%)] pointer-events-none opacity-80" />
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-12 items-center">
          
          {/* LEFT: Wrong Card / Better Card Context */}
          <div className="flex flex-col items-start w-full relative">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-[clamp(2.5rem,4vw,3.5rem)] font-display font-medium mb-6 tracking-tight leading-[1.1]"
            >
              Know the best move<br/>before you pay.
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-gray-400 text-sm md:text-base mb-12 leading-relaxed max-w-md font-light"
            >
              You could be leaving money on the table. Ask TAQDEER before large transactions to ensure maximum yield.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: 0.2 }}
              className="w-full max-w-sm bg-white/5 border border-white/10 rounded-3xl p-8 relative backdrop-blur-md"
            >
              {/* Desktop visual connector */}
              <div className="absolute top-1/2 -right-12 lg:-right-12 transform -translate-y-1/2 hidden lg:flex items-center text-gray-500 z-10">
                <div className="w-8 h-px bg-white/20" />
                <ArrowRight className="w-4 h-4 text-gray-500" />
              </div>

              <div className="flex justify-between items-center mb-6">
                <span className="text-sm text-gray-400">Wrong Card</span>
                <span className="text-sm font-medium font-mono text-white/80">₹<NumberCounter from={0} to={250} delay={0.4} /></span>
              </div>
              <div className="flex justify-between items-center mb-6 pb-6 border-b border-white/10">
                <span className="text-sm text-gray-300 font-bold">Best Card</span>
                <span className="text-sm font-bold text-white font-mono">₹<NumberCounter from={0} to={1250} delay={0.7} /></span>
              </div>
              <div className="flex justify-between items-center relative">
                <span className="text-lg font-display">Difference</span>
                <motion.span 
                  initial={{ scale: 0.8, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", stiffness: 200, delay: 1.0 }}
                  className="text-2xl font-bold text-semantic-brand font-mono relative"
                >
                  +₹<NumberCounter from={0} to={1000} delay={1.0} />
                  {/* Subtle pop particles */}
                  <motion.div 
                    initial={{ opacity: 1, scale: 1 }}
                    whileInView={{ opacity: 0, scale: 1.5 }}
                    viewport={{ once: true }}
                    transition={{ delay: 1.0, duration: 0.5, ease: "easeOut" }}
                    className="absolute inset-0 bg-semantic-brand/30 rounded-full blur-md -z-10"
                  />
                </motion.span>
              </div>
            </motion.div>
          </div>

          {/* RIGHT: Taqdeer Interaction */}
          <div className="w-full bg-white/5 border border-white/10 rounded-[2rem] p-6 md:p-8 flex flex-col min-h-[400px] relative backdrop-blur-md">
            <AnimatePresence mode="wait">
              {appState === 'idle' && (
                <motion.div key="idle" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex-1 flex flex-col justify-center">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-6 group border border-white/10">
                    <Sparkles className="w-5 h-5 text-gray-300 group-hover:rotate-12 transition-transform" />
                  </div>
                  <h3 className="text-2xl font-display font-medium mb-6">What are you planning to buy?</h3>
                  
                  <div className="flex gap-2 flex-wrap mb-6">
                    {['Flight to Dubai (₹35k)', 'Taj Dinner (₹8k)', 'AirPods (₹24k)'].map(s => (
                      <button key={s} onClick={() => executeQuery(s)} className="px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:scale-105 active:scale-95 text-xs font-medium transition-all text-gray-300 hover:text-white">
                        {s}
                      </button>
                    ))}
                  </div>
                  
                  <div className="flex items-center bg-black/50 border border-white/10 rounded-full p-2 pl-6 focus-within:border-white/30 focus-within:ring-2 focus-within:ring-white/10 transition-all backdrop-blur-sm">
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && executeQuery(query)}
                      placeholder="E.g., I'm booking a ₹35,000 flight to Dubai..."
                      className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-gray-500 text-white"
                    />
                    <button onClick={() => executeQuery(query)} className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-black hover:scale-110 active:scale-95 transition-transform shrink-0">
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {appState === 'loading' && (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center">
                  <div className="relative mb-6">
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      className="absolute -inset-4 border-2 border-dashed border-white/20 rounded-full"
                    />
                    <Sparkles className="w-8 h-8 text-white animate-pulse" />
                  </div>
                  <motion.div 
                    key={loadingStage}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-gray-400 font-medium"
                  >
                    {STAGES[loadingStage]}
                  </motion.div>
                </motion.div>
              )}

              {appState === 'result' && decision && (
                <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", damping: 20 }} className="flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                    <span className="text-sm font-medium text-gray-400">TAQDEER Analysis</span>
                    <button onClick={reset} className="text-xs hover:text-white transition-colors flex items-center group text-gray-400">
                      Reset <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>

                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1, type: "spring" }}
                    className="bg-white/5 rounded-xl p-5 border border-white/10 mb-6 shadow-xl relative overflow-hidden group backdrop-blur-md"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors" />
                    <div className="flex justify-between items-start mb-4 relative z-10">
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-semantic-brand mb-1 flex items-center gap-1">
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: "spring" }}>
                            <CheckCircle2 className="w-3 h-3 text-semantic-brand"/> 
                          </motion.div>
                          Best Card
                        </div>
                        <div className="text-xl font-bold">{decision.cards?.[0]?.name || "Optimal Card"}</div>
                      </div>
                      <CreditCard className="w-6 h-6 text-gray-500" />
                    </div>
                    
                    <div className="text-sm text-gray-300 line-clamp-2 relative z-10">
                      {decision.content.split('\n')[0].replace(/\*\*/g, '')}
                    </div>
                  </motion.div>

                  <motion.button 
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 bg-white text-black rounded-xl font-semibold text-sm hover:bg-gray-200 transition-colors shadow-lg"
                  >
                    Use This Card
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
