import { motion } from 'framer-motion';
import { ChevronRight, CheckCircle2, Zap } from 'lucide-react';
import React from 'react';

export interface DecisionCardProps {
  title?: string;
  bestFit: string;
  why: string;
  expectedValue: string;
  tradeoff?: string;
  actionText?: string;
  onAction?: () => void;
  confidence?: number;
}

export function DecisionCard({
  title = "Best Fit",
  bestFit,
  why,
  expectedValue,
  tradeoff,
  actionText = "Use This",
  onAction,
  confidence
}: DecisionCardProps) {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="rounded-[2rem] p-6 md:p-8 border border-border-emerald shadow-2xl relative overflow-hidden bg-gradient-to-br from-brand-500/10 via-surface to-brand-500/5 group cursor-pointer"
      onClick={onAction}
    >
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand-emerald-muted rounded-full blur-[80px] pointer-events-none transition-colors duration-700" />
      
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
        
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-xl bg-brand-emerald text-gray-900 flex items-center justify-center font-bold shrink-0 shadow-[0_0_15px_rgba(4,59,39,0.3)]">
              <CheckCircle2 size={16} />
            </div>
            <div>
              <span className="text-[10px] md:text-xs font-extrabold tracking-[0.2em] uppercase text-brand-emerald block">
                {title}
              </span>
            </div>
            {confidence && (
              <div className="ml-2 px-2 py-1 rounded-full bg-profit/10 border border-profit/20 flex items-center gap-1">
                <Zap size={10} className="text-profit" />
                <span className="text-[9px] md:text-[10px] font-bold text-profit uppercase tracking-wider">{confidence}% Match</span>
              </div>
            )}
          </div>

          <h2 className="text-2xl md:text-4xl font-display font-extrabold text-text-primary tracking-tight mb-3">
            {bestFit}
          </h2>
          
          <div className="space-y-3 mt-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-text-muted block mb-1">Why</span>
              <p className="text-sm md:text-base text-text-secondary leading-relaxed font-medium">
                {why}
              </p>
            </div>
            
            {tradeoff && (
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-text-muted block mb-1">Tradeoff</span>
                <p className="text-sm md:text-base text-text-muted leading-relaxed">
                  {tradeoff}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4 w-full md:w-auto shrink-0 md:min-w-[200px]">
          <div className="p-4 rounded-2xl bg-surface-secondary dark:bg-gray-100 border border-border-subtle backdrop-blur-md">
            <span className="text-xs uppercase font-bold tracking-wider text-text-muted block mb-1">Expected Value</span>
            <p className="text-2xl font-mono tabular-nums font-bold text-brand-emerald">
              {expectedValue}
            </p>
          </div>
          
          <button 
            className="flex items-center justify-between w-full p-4 rounded-2xl bg-brand-emerald hover:bg-brand-600 text-gray-900 font-bold transition-all shadow-[0_0_15px_rgba(4,59,39,0.3)] active:scale-95 group/btn"
            onClick={(e) => {
              e.stopPropagation();
              onAction?.();
            }}
          >
            <span>{actionText}</span>
            <ChevronRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>
        
      </div>
    </motion.div>
  );
}
