import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, X, Sparkles, CreditCard, Bot, Zap, CheckCircle2 } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useDashboardStore } from '../../dashboard/store/dashboardStore';
import { generateTaqdeerResponse } from '../../finix/lib/taqdeerEngine';
import { DecisionCard } from '../../../components/shared/DecisionCard';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface TaqdeerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const LOADING_STAGES = [
  'Understanding purchase intent...',
  'Analyzing merchant category...',
  'Evaluating active offers...',
  'Calculating optimal reward...'
];

export function TaqdeerDrawer({ isOpen, onClose }: TaqdeerDrawerProps) {
  const [query, setQuery] = useState('');
  const [appState, setAppState] = useState<'idle' | 'loading' | 'result'>('idle');
  const [loadingStage, setLoadingStage] = useState(0);
  const [decision, setDecision] = useState<{ content: string; cards?: any[] } | null>(null);
  
  const userCards = useDashboardStore(state => state.userCards);

  const handleSubmit = async (e?: React.FormEvent, presetQuery?: string) => {
    if (e) e.preventDefault();
    const finalQuery = presetQuery || query;
    if (!finalQuery.trim()) return;

    setQuery(finalQuery);
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
      const response = await generateTaqdeerResponse(finalQuery, userCards);
      setTimeout(() => {
        setDecision(response);
        setAppState('result');
      }, 1000); // reduced timeout for better UX
    } catch (error) {
      setDecision({ content: 'I encountered an error while trying to generate a response. Please try again.' });
      setAppState('result');
    }
  };

  const reset = () => {
    setAppState('idle');
    setQuery('');
    setDecision(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 12 }}
          transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
          className={cn(
            "fixed bottom-[144px] lg:bottom-[88px] right-4 lg:right-6 z-[100] flex flex-col origin-bottom-right",
            "w-[calc(100vw-32px)] lg:w-[420px]",
            "h-[600px] max-h-[calc(100dvh-160px)] lg:max-h-[calc(100dvh-120px)]",
            "bg-white border border-gray-200 rounded-[2rem] shadow-2xl overflow-hidden"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 shrink-0 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-brand-emerald text-gray-900 flex items-center justify-center">
                <Sparkles size={14} />
              </div>
              <h2 className="text-xs font-bold text-gray-900 tracking-widest uppercase">TAQDEER</h2>
            </div>
            <button 
              onClick={onClose}
              className="w-7 h-7 rounded-full flex items-center justify-center bg-gray-50 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <X size={14} />
            </button>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col hide-scrollbar relative">
            
            <AnimatePresence mode="wait">
              {appState === 'idle' && (
                <motion.div 
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col h-full"
                >
                  <div className="flex flex-col gap-1 mt-4 mb-8">
                    <h1 className="text-3xl font-display font-medium text-gray-900 mb-2">Decision Engine</h1>
                    <p className="text-[15px] text-gray-600 leading-relaxed">
                      Describe any purchase. Taqdeer will analyze your wallet and recommend the best strategy.
                    </p>
                  </div>

                  <div className="mt-2">
                    <p className="text-[11px] font-bold tracking-wider uppercase text-gray-400 mb-3">Popular Scenarios</p>
                    <div className="flex flex-col gap-3">
                      {[
                        { icon: <CreditCard size={18} />, text: 'Buying a MacBook Pro on Amazon' },
                        { icon: <Zap size={18} />, text: 'Dinner at Taj Hotel' },
                        { icon: <Bot size={18} />, text: 'Booking Emirates flight to Dubai' },
                      ].map((item, i) => (
                        <button
                          key={i}
                          onClick={() => handleSubmit(undefined, item.text)}
                          className="flex items-center gap-4 px-5 py-4 rounded-2xl bg-gray-50 hover:bg-white border border-gray-200 hover:border-brand-emerald hover:shadow-sm transition-all text-gray-900 text-[13px] font-medium text-left"
                        >
                          <div className="text-gray-400 group-hover:text-brand-emerald">{item.icon}</div>
                          {item.text}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {appState === 'loading' && (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center h-full gap-8"
                >
                  <div className="w-16 h-16 relative flex items-center justify-center">
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 4, repeat: Infinity, ease:"linear" }}
                      className="absolute inset-0 rounded-full border border-dashed border-brand-emerald/30"
                    />
                    <Sparkles className="w-6 h-6 text-brand-emerald animate-pulse" />
                  </div>
                  <div className="flex flex-col gap-3 w-full max-w-[200px]">
                    {LOADING_STAGES.map((stage, idx) => {
                      const isActive = idx === loadingStage;
                      const isDone = idx < loadingStage;
                      return (
                        <motion.div 
                          key={stage}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: isActive || isDone ? 1 : 0.3, x: 0 }}
                          className="flex items-center gap-3 w-full"
                        >
                          <div className="w-4 h-4 rounded-full flex items-center justify-center bg-gray-50 border border-gray-200 shrink-0">
                            {isDone ? (
                              <CheckCircle2 className="w-3 h-3 text-brand-emerald" />
                            ) : isActive ? (
                              <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 1, repeat: Infinity }} className="w-1.5 h-1.5 rounded-full bg-brand-emerald" />
                            ) : (
                              <div className="w-1 h-1 rounded-full bg-gray-300" />
                            )}
                          </div>
                          <span className={`text-[11px] font-semibold ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                            {stage}
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {appState === 'result' && decision && (
                <motion.div 
                  key="result"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col h-full gap-6 pb-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-gray-900">Recommendation</h3>
                    <button onClick={reset} className="text-xs font-semibold text-brand-emerald">Reset</button>
                  </div>
                  
                  {decision.evaluation && decision.evaluation.best ? (
                    <DecisionCard 
                      title="Best Fit"
                      bestFit={decision.evaluation.best.card.name}
                      why={decision.evaluation.delta > 0 && decision.evaluation.secondBest ? `Using this card earns you +₹${decision.evaluation.delta.toFixed(2)} more than your next best option. ${decision.evaluation.best.limitations.length > 0 ? decision.evaluation.best.limitations[0] : ''}` : decision.evaluation.best.reason}
                      expectedValue={`${decision.evaluation.best.confidence !== 'EXACT' ? '~' : ''}₹${decision.evaluation.best.cappedRewardValue.toFixed(2)}`}
                      tradeoff={decision.evaluation.secondBest ? `Next best: ${decision.evaluation.secondBest.card.name} (${decision.evaluation.secondBest.confidence !== 'EXACT' ? '~' : ''}₹${decision.evaluation.secondBest.cappedRewardValue.toFixed(2)})` : undefined}
                      confidence={98}
                      actionText="Use This Card"
                    />
                  ) : decision.cards && decision.cards.length > 0 ? (
                    <DecisionCard 
                      title="Best Fit"
                      bestFit={decision.cards[0].name}
                      why={`Based on ${query}, this card provides the highest yield.`}
                      expectedValue={`${decision.cards[0].baseRewardRate}% Yield`}
                      tradeoff={`Annual fee: ₹${decision.cards[0].annualFee || 0}`}
                      confidence={98}
                      actionText="Use This Card"
                    />
                  ) : (
                    <div className="p-4 bg-gray-50 rounded-2xl text-sm text-gray-600">
                      No matching cards found for this transaction.
                    </div>
                  )}

                  <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                    <h4 className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-3">Rationale</h4>
                    <div className="prose prose-sm prose-gray max-w-none text-gray-700 text-[13px] leading-relaxed">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {decision.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
          </div>

          {/* Input Area */}
          <div className="p-4 shrink-0 bg-white border-t border-gray-100">
            <form onSubmit={(e) => handleSubmit(e)} className="relative">
              <input 
                type="text" 
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Ask Taqdeer anything..." 
                className="w-full bg-gray-50 border border-gray-200 rounded-full py-4 pl-5 pr-14 text-[13px] font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald focus:bg-white transition-all shadow-inner"
              />
              <button 
                type="submit" 
                disabled={appState === 'loading' || !query.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-gray-900 text-white hover:bg-brand-emerald disabled:opacity-50 disabled:hover:bg-gray-900 flex items-center justify-center transition-all shadow-md active:scale-95"
              >
                <ArrowRight size={16} />
              </button>
            </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
