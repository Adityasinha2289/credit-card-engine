import { motion } from 'framer-motion';
import { Sparkles, ChevronRight, Zap } from 'lucide-react';
import type { TaqdeerDecision } from '../../../../features/taqdeer/types';
import type { CardIntelligenceResult } from '../../../../features/card-intelligence';

interface SmartRecommendationV3Props {
  decision: TaqdeerDecision;
  featuredCard: CardIntelligenceResult;
}

export function SmartRecommendationV3({ decision }: SmartRecommendationV3Props) {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="panel-glass rounded-[2.5rem] p-8 md:p-10 border border-border-emerald shadow-2xl relative overflow-hidden bg-gradient-to-br from-brand-500/10 via-surface to-brand-500/5 group cursor-pointer"
    >
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand-emerald-muted rounded-full blur-[80px] pointer-events-none group-hover:bg-brand-emerald-muted transition-colors duration-700" />
      <div className="absolute -bottom-20 -left-20 w-[300px] h-[300px] bg-profit/5 rounded-full blur-[60px] pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
        
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-brand-emerald text-white flex items-center justify-center font-bold shrink-0 shadow-[0_0_20px_rgba(4,59,39,0.3)]">
              <Sparkles size={20} />
            </div>
            <div>
              <span className="text-xs font-extrabold tracking-[0.2em] uppercase text-brand-emerald block">
                Today's Best Card
              </span>
            </div>
            <div className="ml-2 px-3 py-1 rounded-full bg-profit/10 border border-profit/20 flex items-center gap-1.5">
              <Zap size={12} className="text-profit" />
              <span className="text-[10px] font-bold text-profit uppercase tracking-wider">{decision.confidence}% AI Confidence</span>
            </div>
          </div>

          <h2 className="text-3xl md:text-5xl font-display font-extrabold text-text-primary tracking-tight mb-4 leading-tight">
            {decision.title}
          </h2>
          
          <p className="text-base md:text-lg text-text-secondary leading-relaxed font-medium max-w-xl">
            {decision.summary}
          </p>
          
          <p className="text-sm text-text-muted leading-relaxed mt-4 max-w-xl">
            <span className="font-bold text-text-primary">Why: </span>
            {decision.explanation}
          </p>
        </div>

        <div className="flex flex-col gap-4 w-full md:w-auto shrink-0 md:min-w-[240px]">
          <div className="p-5 rounded-3xl bg-surface-secondary dark:bg-white/[0.03] border border-border-subtle  backdrop-blur-md">
            <span className="text-xs uppercase font-bold tracking-wider text-text-muted block mb-1">Estimated Impact</span>
            <p className="text-3xl font-display font-bold text-brand-emerald">
              {decision.estimatedImpact.savings
                ? `₹${decision.estimatedImpact.savings.toLocaleString('en-IN')}`
                : decision.estimatedImpact.rewards
                ? `${decision.estimatedImpact.rewards.toLocaleString()} pts`
                : 'High Protection'}
            </p>
            <p className="text-xs font-semibold text-text-secondary capitalize mt-2">
              Timeframe: {decision.estimatedImpact.timeFrame.replace('_', ' ')}
            </p>
          </div>
          
          <button className="flex items-center justify-between w-full p-4 rounded-2xl bg-brand-emerald hover:bg-brand-600 text-white font-bold transition-all shadow-[0_0_20px_rgba(4,59,39,0.3)] active:scale-95 group/btn">
            <span>View Details</span>
            <ChevronRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>
        
      </div>
    </motion.div>
  );
}
