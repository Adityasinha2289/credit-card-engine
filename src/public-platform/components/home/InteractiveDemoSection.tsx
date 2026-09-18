import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, ArrowRight, Activity, Clock, CheckCircle2, CreditCard, ShieldCheck, ChevronRight, Check, Search
} from 'lucide-react';
import { generateTaqdeerResponse } from '../../../features/finix/lib/taqdeerEngine';

const POPULAR_SCENARIOS = [
  'MacBook Pro',
  'Dinner at Taj',
  'Dubai Flight',
  'Fuel',
  'Groceries',
  'Netflix'
];

const RECENT_RECS = [
  { title: 'MacBook Pro', card: 'HDFC Infinia', saved: '₹10,490' },
  { title: 'Dinner at Taj', card: 'Diners Club', saved: '₹450' },
  { title: 'Dubai Flight', card: 'Axis Atlas', saved: '₹2,180' },
];

const LOADING_STAGES = [
  'Understanding purchase intent...',
  'Checking merchant category (MCC)...',
  'Analyzing connected wallet cards...',
  'Comparing reward structures...',
  'Evaluating active offers...',
  'Calculating redemption values...',
  'Selecting optimal recommendation...',
];

export function InteractiveDemoSection() {
  const [query, setQuery] = useState('');
  const [appState, setAppState] = useState<'idle' | 'loading' | 'result'>('idle');
  const [loadingStage, setLoadingStage] = useState(0);
  const [decision, setDecision] = useState<{ content: string; cards?: any[] } | null>(null);
  
  const bottomTextareaRef = useRef<HTMLTextAreaElement>(null);
  const heroTextareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuery(e.target.value);
    const target = e.target;
    target.style.height = 'auto';
    target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
  };

  const executeQuery = async (text: string) => {
    if (!text.trim()) return;
    setQuery(text);
    setAppState('loading');
    setLoadingStage(0);
    
    const stageInterval = setInterval(() => {
      setLoadingStage(prev => {
        if (prev >= LOADING_STAGES.length - 1) {
          clearInterval(stageInterval);
          return prev;
        }
        return prev + 1;
      });
    }, 400);

    try {
      const res = await generateTaqdeerResponse(text, []);
      setTimeout(() => {
        setDecision(res);
        setAppState('result');
      }, 3000);
    } catch (e) {
      setDecision({ content: "I couldn't process that request right now." });
      setAppState('result');
    }
  };

  const reset = () => {
    setAppState('idle');
    setQuery('');
    setDecision(null);
  };

  return (
    <section className="w-full py-24 md:py-32 bg-editorial-light-cream text-editorial-deep-forest relative overflow-hidden">
      
      {/* Background Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-editorial-soft-sage rounded-full blur-[250px] opacity-[0.2] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative z-10 flex flex-col items-center">
        
        {/* Intro Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-editorial-soft-sage/20 border border-editorial-soft-sage/30 text-[10px] font-bold tracking-widest uppercase text-editorial-forest mb-6">
            <Sparkles className="w-3.5 h-3.5 text-editorial-forest" />
            <span className="text-editorial-deep-forest">TAQDEER AI Copilot</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium mb-6 tracking-tight text-editorial-deep-forest">
            Consult your financial analyst.
          </h2>
        </div>

        {/* The Workspace Container */}
        <div className="w-full bg-editorial-deep-forest border border-editorial-soft-sage/30 rounded-[2.5rem] shadow-2xl flex flex-col min-h-[700px] relative overflow-hidden">
          
          <AnimatePresence mode="wait">
            {/* ============================================================== */}
            {/* IDLE STATE: THE PREMIUM AI WORKSPACE */}
            {/* ============================================================== */}
            {appState === 'idle' && (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0 flex flex-col items-center justify-center p-6 md:p-12 w-full h-full"
              >
                <div className="w-full max-w-3xl flex flex-col items-center text-center">
                  
                  {/* TAQDEER Mark & Headline */}
                  <div className="w-14 h-14 rounded-2xl bg-editorial-forest/50 border border-editorial-soft-sage/20 flex items-center justify-center mb-8 shadow-2xl">
                    <Sparkles className="w-6 h-6 text-editorial-soft-sage" />
                  </div>
                  
                  <h3 className="text-4xl md:text-5xl font-serif font-medium text-editorial-warm-cream mb-4 tracking-tight">
                    What are you planning to buy?
                  </h3>
                  <p className="text-editorial-muted-sage text-lg md:text-xl font-light mb-12">
                    Describe any purchase. TAQDEER recommends exactly which card to use.
                  </p>

                  {/* HERO COMPOSER */}
                  <div className="w-full relative group mb-12 z-20">
                    <div className="absolute inset-[-4px] bg-gradient-to-r from-editorial-soft-sage/0 via-editorial-soft-sage/20 to-editorial-soft-sage/0 blur-xl rounded-[2.5rem] opacity-0 group-focus-within:opacity-100 transition-opacity duration-700 pointer-events-none" />
                    
                    <div className="relative bg-editorial-forest/30 border border-editorial-soft-sage/20 group-focus-within:border-editorial-soft-sage/40 rounded-[2rem] shadow-2xl transition-all duration-300 flex flex-col overflow-hidden">
                      <textarea
                        ref={heroTextareaRef}
                        value={query}
                        onChange={handleInput}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            executeQuery(query);
                          }
                        }}
                        placeholder="Ask about a purchase..."
                        className="w-full bg-transparent border-none outline-none text-editorial-warm-cream placeholder:text-editorial-muted-sage text-xl md:text-2xl font-light resize-none min-h-[80px] p-6 pb-2 no-scrollbar leading-relaxed"
                        rows={1}
                        autoFocus
                      />
                      
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 pt-2 bg-transparent">
                        {/* Action Chips */}
                        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 sm:pb-0">
                          {POPULAR_SCENARIOS.map((scenario) => (
                            <button
                              key={scenario}
                              onClick={() => executeQuery(scenario)}
                              className="px-4 py-2 rounded-full bg-editorial-forest/40 hover:bg-editorial-forest text-editorial-muted-sage hover:text-editorial-warm-cream text-sm font-medium transition-colors whitespace-nowrap"
                            >
                              {scenario}
                            </button>
                          ))}
                        </div>
                        
                        {/* Submit Button */}
                        <button
                          onClick={() => executeQuery(query)}
                          disabled={!query.trim()}
                          className="w-12 h-12 rounded-full bg-editorial-soft-sage text-editorial-deep-forest flex items-center justify-center shrink-0 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition-all shadow-lg self-end sm:self-auto"
                        >
                          <ArrowRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* RECENT RECOMMENDATIONS */}
                  <div className="w-full text-left">
                    <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-editorial-muted-sage mb-6 pl-2">Recent Recommendations</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {RECENT_RECS.map((rec, i) => (
                        <div key={i} className="bg-editorial-forest/30 border border-editorial-soft-sage/20 rounded-2xl p-5 flex flex-col justify-between hover:border-editorial-soft-sage/50 transition-colors cursor-pointer group">
                          <div>
                            <div className="text-editorial-muted-sage text-xs font-medium mb-1">{rec.title}</div>
                            <div className="text-editorial-warm-cream font-medium text-lg tracking-tight mb-4">{rec.card}</div>
                          </div>
                          <div className="flex items-center justify-between border-t border-editorial-soft-sage/20 pt-4 mt-2">
                            <span className="text-xs text-editorial-muted-sage">Saved</span>
                            <span className="text-sm font-semibold text-editorial-soft-sage group-hover:text-editorial-warm-cream transition-colors">{rec.saved}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

            {/* ============================================================== */}
            {/* LOADING STATE */}
            {/* ============================================================== */}
            {appState === 'loading' && (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="absolute inset-0 flex flex-col items-center justify-center p-6 w-full h-full"
              >
                <div className="w-24 h-24 relative mb-12 flex items-center justify-center">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 rounded-full border border-dashed border-editorial-soft-sage/20"
                  />
                  <motion.div 
                    animate={{ rotate: -360 }}
                    transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-2 rounded-full border border-dashed border-editorial-soft-sage/40"
                  />
                  <Sparkles className="w-8 h-8 text-editorial-soft-sage animate-pulse" />
                </div>

                <div className="flex flex-col items-start gap-4 w-full max-w-sm">
                  {LOADING_STAGES.map((stage, idx) => {
                    const isActive = idx === loadingStage;
                    const isDone = idx < loadingStage;
                    
                    return (
                      <motion.div 
                        key={stage}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: isActive || isDone ? 1 : 0.3, x: 0 }}
                        className="flex items-center gap-4 w-full"
                      >
                        <div className="w-5 h-5 rounded-full flex items-center justify-center bg-editorial-forest/40 border border-editorial-soft-sage/20 shrink-0">
                          {isDone ? (
                            <Check className="w-3 h-3 text-editorial-soft-sage" />
                          ) : isActive ? (
                            <motion.div 
                              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                              className="w-1.5 h-1.5 rounded-full bg-editorial-soft-sage" 
                            />
                          ) : (
                            <div className="w-1.5 h-1.5 rounded-full bg-editorial-forest" />
                          )}
                        </div>
                        <span className={`text-sm ${isActive ? 'text-editorial-warm-cream font-medium' : isDone ? 'text-editorial-muted-sage' : 'text-editorial-forest'}`}>
                          {stage}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* ============================================================== */}
            {/* RESULT STATE & BOTTOM COMPOSER */}
            {/* ============================================================== */}
            {appState === 'result' && decision && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full h-full flex flex-col relative z-10"
              >
                {/* Scrollable Results Area */}
                <div className="flex-1 overflow-y-auto no-scrollbar p-6 md:p-10 pb-32">
                  <div className="max-w-4xl mx-auto w-full flex flex-col gap-8">
                    
                    <div className="flex items-center justify-between w-full border-b border-editorial-soft-sage/20 pb-4">
                      <h3 className="text-lg font-serif font-medium text-editorial-warm-cream flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-editorial-soft-sage" />
                        Financial Decision Report
                      </h3>
                      <button 
                        onClick={reset}
                        className="text-xs font-semibold uppercase tracking-wider text-editorial-muted-sage hover:text-editorial-warm-cream transition-colors flex items-center gap-1"
                      >
                        Reset Workspace <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Top Decision Card */}
                    <div className="w-full bg-gradient-to-br from-editorial-forest to-editorial-forest/50 rounded-[2rem] p-1 shadow-2xl border border-editorial-soft-sage/20 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-editorial-soft-sage/40 to-transparent" />
                      
                      <div className="p-6 md:p-8">
                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="px-3 py-1 rounded-full bg-editorial-soft-sage/20 border border-editorial-soft-sage/30 flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-editorial-soft-sage" />
                                <span className="text-[10px] font-bold text-editorial-soft-sage tracking-widest uppercase">98% Confidence</span>
                              </div>
                              <span className="text-xs text-editorial-muted-sage font-medium">Optimal Recommendation</span>
                            </div>
                            
                            <h3 className="text-4xl font-serif font-bold text-editorial-warm-cream mb-2">
                              {decision.cards?.[0]?.name || "Recommended Strategy"}
                            </h3>
                            
                            <p className="text-editorial-muted-sage text-lg leading-relaxed max-w-xl mb-8">
                              Based on current merchant categories and active network offers, this provides the highest absolute return for this transaction.
                            </p>
                          </div>

                          <div className="shrink-0 w-full lg:w-[280px]">
                            <div className="w-full aspect-[1.58/1] rounded-2xl bg-gradient-to-br from-editorial-deep-forest to-black p-4 border border-editorial-soft-sage/30 shadow-xl relative overflow-hidden flex flex-col justify-between">
                              <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay" />
                              <div className="flex justify-between items-start relative z-10">
                                <CreditCard className="w-6 h-6 text-editorial-warm-cream/50" />
                                <span className="text-[10px] font-mono text-editorial-warm-cream/30 tracking-widest">TAP TO PAY</span>
                              </div>
                              <div className="relative z-10">
                                <div className="text-sm font-medium text-editorial-warm-cream/80 mb-1">{decision.cards?.[0]?.bank || "Bank Name"}</div>
                                <div className="text-lg font-bold text-editorial-warm-cream tracking-tight">{decision.cards?.[0]?.name || "Credit Card"}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Detailed Explanation */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2 bg-editorial-forest/30 rounded-[1.5rem] p-6 md:p-8 border border-editorial-soft-sage/20">
                        <h4 className="text-xs font-bold text-editorial-muted-sage uppercase tracking-widest mb-6 flex items-center gap-2">
                          <Activity className="w-4 h-4 text-editorial-soft-sage" />
                          Decision Breakdown
                        </h4>
                        <div className="prose prose-sm prose-invert max-w-none text-editorial-muted-sage leading-relaxed font-light text-base">
                          {decision.content.split('\n').map((line, i) => {
                            if (line.startsWith('•')) {
                              return (
                                <div key={i} className="flex items-start gap-3 mb-4">
                                  <div className="w-1.5 h-1.5 rounded-full bg-editorial-soft-sage mt-2.5 shrink-0" />
                                  <span className="text-editorial-warm-cream">{line.replace('•', '').replace(/\*\*/g, '').trim()}</span>
                                </div>
                              );
                            }
                            if (line.trim().length === 0) return <div key={i} className="h-4" />;
                            return <p key={i} className="mb-4">{line.replace(/\*\*/g, '')}</p>;
                          })}
                        </div>
                      </div>

                      <div className="bg-editorial-forest/30 rounded-[1.5rem] p-6 md:p-8 border border-editorial-soft-sage/20">
                        <h4 className="text-xs font-bold text-editorial-muted-sage uppercase tracking-widest mb-6 flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-editorial-soft-sage" />
                          Alternatives
                        </h4>
                        <div className="space-y-3">
                          {decision.cards?.slice(1, 4).map((card, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-editorial-forest/40 border border-editorial-soft-sage/10 hover:border-editorial-soft-sage/30 transition-colors cursor-pointer">
                              <div>
                                <div className="text-sm font-medium text-editorial-warm-cream">{card.name}</div>
                                <div className="text-xs text-editorial-muted-sage mt-1">Yields ~{card.baseRewardRate}% return</div>
                              </div>
                              <ChevronRight className="w-4 h-4 text-gray-600" />
                            </div>
                          ))}
                          {(!decision.cards || decision.cards.length <= 1) && (
                            <p className="text-sm text-gray-500 italic">No alternative suggestions available for this category.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fixed Bottom Composer in Result State */}
                <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-editorial-deep-forest via-editorial-deep-forest to-transparent pt-20">
                  <div className="max-w-4xl mx-auto">
                    <div className="relative bg-editorial-forest border border-editorial-soft-sage/30 focus-within:border-editorial-soft-sage/60 rounded-full shadow-2xl transition-all duration-300 flex items-center p-2 pl-6">
                      <Search className="w-5 h-5 text-editorial-muted-sage shrink-0" />
                      <textarea
                        ref={bottomTextareaRef}
                        value={query}
                        onChange={handleInput}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            executeQuery(query);
                          }
                        }}
                        placeholder="Ask follow-up or new purchase..."
                        className="flex-1 bg-transparent border-none outline-none text-editorial-warm-cream placeholder:text-editorial-muted-sage py-3 px-4 text-base font-light resize-none h-[48px] no-scrollbar"
                        rows={1}
                      />
                      <button
                        onClick={() => executeQuery(query)}
                        disabled={!query.trim()}
                        className="w-10 h-10 shrink-0 flex items-center justify-center rounded-full bg-editorial-soft-sage text-editorial-deep-forest hover:scale-105 disabled:bg-editorial-forest disabled:text-editorial-muted-sage transition-all active:scale-95"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
