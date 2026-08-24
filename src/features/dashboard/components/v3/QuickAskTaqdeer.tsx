import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, ArrowRight, Activity, Clock, CheckCircle2, CreditCard, ShieldCheck, ChevronRight, Check, Search
} from 'lucide-react';
import { useDashboardStore } from '../../store/dashboardStore';
import { generateTaqdeerResponse } from '../../../finix/lib/taqdeerEngine';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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

export function QuickAskTaqdeer() {
  const userCards = useDashboardStore((s) => s.userCards);
  
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
      const res = await generateTaqdeerResponse(text, userCards);
      setTimeout(() => {
        setDecision(res);
        setAppState('result');
      }, 3000);
    } catch (e) {
      setDecision({ content:"I couldn't process that request right now." });
      setAppState('result');
    }
  };

  const reset = () => {
    setAppState('idle');
    setQuery('');
    setDecision(null);
  };

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto min-h-[600px] text-gray-900 h-full relative">
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
            className="absolute inset-0 flex flex-col items-center justify-center p-4 md:p-8 w-full h-full"
          >
            <div className="w-full max-w-3xl flex flex-col items-center text-center mt-[-10vh]">
              
              {/* TAQDEER Mark & Headline */}
              <div className="w-14 h-14 rounded-2xl bg-[#111] border border-gray-300 flex items-center justify-center mb-8 shadow-2xl">
                <Sparkles className="w-6 h-6 text-[#2A9D5C]" />
              </div>
              
              <h1 className="text-4xl md:text-5xl font-display font-medium text-gray-900 mb-4 tracking-tight">
                What are you planning to buy?
              </h1>
              <p className="text-gray-600 text-lg md:text-xl font-light mb-12">
                Describe any purchase. TAQDEER recommends exactly which card to use.
              </p>

              {/* HERO COMPOSER */}
              <div className="w-full relative group mb-12 z-20">
                <div className="absolute inset-[-4px] bg-gradient-to-r from-[#2A9D5C]/0 via-[#2A9D5C]/20 to-[#2A9D5C]/0 blur-xl rounded-[2.5rem] opacity-0 group-focus-within:opacity-100 transition-opacity duration-700 pointer-events-none" />
                
                <div className="relative bg-[#0F0F0F] border border-white/[0.1] group-focus-within:border-white/[0.2] rounded-[2rem] shadow-2xl transition-all duration-300 flex flex-col overflow-hidden">
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
                    className="w-full bg-transparent border-none outline-none text-gray-900 placeholder:text-gray-600 text-xl md:text-2xl font-light resize-none min-h-[80px] p-6 pb-2 no-scrollbar leading-relaxed"
                    rows={1}
                    autoFocus
                  />
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 pt-2 bg-[#0F0F0F]">
                    {/* Action Chips */}
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 sm:pb-0">
                      {POPULAR_SCENARIOS.map((scenario) => (
                        <button
                          key={scenario}
                          onClick={() => executeQuery(scenario)}
                          className="px-4 py-2 rounded-full bg-gray-100 hover:bg-white/[0.08] text-gray-400 hover:text-gray-900 text-sm font-medium transition-colors whitespace-nowrap"
                        >
                          {scenario}
                        </button>
                      ))}
                    </div>
                    
                    {/* Submit Button */}
                    <button
                      onClick={() => executeQuery(query)}
                      disabled={!query.trim()}
                      className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shrink-0 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition-all shadow-lg self-end sm:self-auto"
                    >
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* RECENT RECOMMENDATIONS */}
              <div className="w-full text-left">
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-600 mb-6 pl-2">Recent Recommendations</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {RECENT_RECS.map((rec, i) => (
                    <div key={i} className="bg-[#111] border border-border-subtle rounded-2xl p-5 flex flex-col justify-between hover:border-gray-300 transition-colors cursor-pointer group">
                      <div>
                        <div className="text-gray-400 text-xs font-medium mb-1">{rec.title}</div>
                        <div className="text-gray-900 font-medium text-lg tracking-tight mb-4">{rec.card}</div>
                      </div>
                      <div className="flex items-center justify-between border-t border-border-subtle pt-4 mt-2">
                        <span className="text-xs text-gray-600">Saved</span>
                        <span className="text-sm font-semibold text-[#2A9D5C] group-hover:text-gray-900 transition-colors">{rec.saved}</span>
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
                transition={{ duration: 8, repeat: Infinity, ease:"linear" }}
                className="absolute inset-0 rounded-full border border-dashed border-white/[0.1]"
              />
              <motion.div 
                animate={{ rotate: -360 }}
                transition={{ duration: 12, repeat: Infinity, ease:"linear" }}
                className="absolute inset-2 rounded-full border border-dashed border-[#2A9D5C]/30"
              />
              <Sparkles className="w-8 h-8 text-[#2A9D5C] animate-pulse" />
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
                    <div className="w-5 h-5 rounded-full flex items-center justify-center bg-[#111] border border-white/[0.1] shrink-0">
                      {isDone ? (
                        <Check className="w-3 h-3 text-[#2A9D5C]" />
                      ) : isActive ? (
                        <motion.div 
                          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="w-1.5 h-1.5 rounded-full bg-[#2A9D5C]" 
                        />
                      ) : (
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-900" />
                      )}
                    </div>
                    <span className={`text-sm ${isActive ? 'text-gray-900 font-medium' : isDone ? 'text-gray-400' : 'text-gray-600'}`}>
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
            <div className="flex-1 overflow-y-auto no-scrollbar pb-32 pt-10">
              <div className="max-w-4xl mx-auto w-full flex flex-col gap-8">
                
                <div className="flex items-center justify-between w-full border-b border-border-subtle pb-4">
                  <h3 className="text-lg font-display font-medium text-gray-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#2A9D5C]" />
                    Financial Decision Report
                  </h3>
                  <button 
                    onClick={reset}
                    className="text-xs font-semibold uppercase tracking-wider text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1"
                  >
                    Reset Workspace <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Top Decision Card */}
                <div className="w-full bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] rounded-[2rem] p-1 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.05)] border border-gray-300 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#2A9D5C]/40 to-transparent" />
                  
                  <div className="p-6 md:p-8">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="px-3 py-1 rounded-full bg-[#2A9D5C]/10 border border-[#2A9D5C]/20 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#2A9D5C]" />
                            <span className="text-[10px] font-bold text-[#2A9D5C] tracking-widest uppercase">98% Confidence</span>
                          </div>
                          <span className="text-xs text-gray-600 font-medium">Optimal Recommendation</span>
                        </div>
                        
                        <h3 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-2">
                          {decision.cards?.[0]?.name ||"Recommended Strategy"}
                        </h3>
                        
                        <p className="text-gray-400 text-lg leading-relaxed max-w-xl mb-8">
                          Based on current merchant categories, your wallet configuration, and active network offers, this provides the highest absolute return for this transaction.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center gap-4">
                          <button className="w-full sm:w-auto bg-white text-black font-semibold px-8 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors shadow-lg shadow-white/10">
                            Use This Card
                          </button>
                          <button className="w-full sm:w-auto bg-[#111] text-gray-900 font-medium px-8 py-3 rounded-xl flex items-center justify-center gap-2 border border-white/[0.1] hover:bg-[#1A1A1A] transition-colors">
                            Save Decision
                          </button>
                        </div>
                      </div>

                      <div className="shrink-0 w-full lg:w-[280px]">
                        <div className="w-full aspect-[1.58/1] rounded-2xl bg-gradient-to-br from-gray-800 to-black p-4 border border-white/[0.1] shadow-xl relative overflow-hidden flex flex-col justify-between">
                          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay" />
                          <div className="flex justify-between items-start relative z-10">
                            <CreditCard className="w-6 h-6 text-gray-600" />
                            <span className="text-[10px] font-mono text-gray-300 tracking-widest">TAP TO PAY</span>
                          </div>
                          <div className="relative z-10">
                            <div className="text-sm font-medium text-gray-800 mb-1">{decision.cards?.[0]?.bank ||"Bank Name"}</div>
                            <div className="text-lg font-bold text-gray-900 tracking-tight">{decision.cards?.[0]?.name ||"Credit Card"}</div>
                          </div>
                        </div>
                        <div className="mt-4 bg-[#111] rounded-xl p-4 border border-border-subtle">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-gray-600 font-medium">Base Multiplier</span>
                            <span className="text-sm font-bold text-gray-900">5.0%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detailed Explanation */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 bg-[#0F0F0F] rounded-[1.5rem] p-6 md:p-8 border border-border-subtle">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-[#2A9D5C]" />
                      Decision Breakdown
                    </h4>
                    <div className="prose prose-sm prose-invert max-w-none text-gray-400 leading-relaxed font-light text-base prose-p:leading-relaxed prose-li:my-2 prose-ul:my-2">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {decision.content}
                      </ReactMarkdown>
                    </div>
                  </div>

                  <div className="bg-[#0F0F0F] rounded-[1.5rem] p-6 md:p-8 border border-border-subtle">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#2A9D5C]" />
                      Alternatives
                    </h4>
                    <div className="space-y-3">
                      {decision.cards?.slice(1, 4).map((card, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-[#111] border border-white/[0.02] hover:border-gray-300 transition-colors cursor-pointer">
                          <div>
                            <div className="text-sm font-medium text-gray-200">{card.name}</div>
                            <div className="text-xs text-gray-600 mt-1">Yields ~{card.baseRewardRate}% return</div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-600" />
                        </div>
                      ))}
                      {(!decision.cards || decision.cards.length <= 1) && (
                        <p className="text-sm text-gray-600 italic">No alternative suggestions available for this category.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Fixed Bottom Composer in Result State */}
            <div className="absolute bottom-0 left-0 w-full pb-6 pt-20 bg-gradient-to-t from-[#050505] via-[#050505] to-transparent pointer-events-none">
              <div className="max-w-4xl mx-auto px-4 pointer-events-auto">
                <div className="relative bg-[#111] border border-gray-300 focus-within:border-white/[0.2] rounded-full shadow-2xl transition-all duration-300 flex items-center p-2 pl-6">
                  <Search className="w-5 h-5 text-gray-600 shrink-0" />
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
                    className="flex-1 bg-transparent border-none outline-none text-gray-900 placeholder:text-gray-600 py-3 px-4 text-base font-light resize-none h-[48px] no-scrollbar"
                    rows={1}
                  />
                  <button
                    onClick={() => executeQuery(query)}
                    disabled={!query.trim()}
                    className="w-10 h-10 shrink-0 flex items-center justify-center rounded-full bg-white text-black hover:bg-gray-200 disabled:bg-[#1A1A1A] disabled:text-gray-600 transition-all active:scale-95"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-center text-[10px] text-gray-600 font-medium mt-4">
                  TAQDEER AI analyzes merchant codes (MCC) and real-time bank offers. AI decisions may occasionally be inaccurate.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
