import { motion } from 'framer-motion';
import { CreditCard, Tag, TrendingDown, ArrowRight, Zap } from 'lucide-react';
import type { MockRecommendation } from '../../features/lifestyle/types';
import { cn } from '../../lib/utils';
import { useState, useEffect } from 'react';

interface SmartSpendCardProps {
  title: string;
  originalPrice: number;
  recommendation: MockRecommendation;
  onViewDeal?: () => void;
  className?: string;
  hideAction?: boolean;
}

export function SmartSpendCard({ title, originalPrice, recommendation, onViewDeal, className, hideAction }: SmartSpendCardProps) {
  const [isCalculating, setIsCalculating] = useState(true);

  // Simulate intelligence engine calculation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsCalculating(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={cn("glass-panel overflow-hidden flex flex-col group", className)}>
      {/* Header */}
      <div className="px-5 py-4 border-b border-border-subtle bg-surface-elevated/30 flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-text-primary text-lg tracking-tight group-hover:text-brand-emerald transition-colors">
            {title}
          </h3>
          <p className="text-text-muted text-sm mt-0.5 line-through decoration-text-muted/50">
            ₹{originalPrice.toLocaleString('en-IN')}
          </p>
        </div>
        {!isCalculating && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-emerald/10 border border-brand-emerald/20 text-brand-emerald"
          >
            <TrendingDown size={14} />
            <span className="text-xs font-bold tracking-wide">Save ₹{recommendation.totalSavings.toLocaleString('en-IN')}</span>
          </motion.div>
        )}
      </div>

      <div className="p-5 flex-1 flex flex-col gap-5 relative">
        {isCalculating ? (
          <div className="absolute inset-0 z-10 bg-surface-base/80 backdrop-blur-sm flex flex-col items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              className="text-brand-emerald mb-3"
            >
              <Zap size={24} className="fill-brand-emerald/20" />
            </motion.div>
            <p className="text-sm font-medium text-text-primary">Optimizing payment...</p>
          </div>
        ) : null}

        {/* Breakdown */}
        <div className="space-y-3">
          {recommendation.merchantOffer && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-text-secondary">
                <Tag size={14} className="text-brand-400" />
                <span>{recommendation.merchantOffer.description}</span>
              </div>
              <span className="font-medium text-brand-emerald">-₹{recommendation.merchantOffer.value.toLocaleString('en-IN')}</span>
            </div>
          )}
          {recommendation.cardReward && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-text-secondary">
                <CreditCard size={14} className="text-brand-400" />
                <span>{recommendation.cardReward.description}</span>
              </div>
              <span className="font-medium text-brand-emerald">-₹{recommendation.cardReward.value.toLocaleString('en-IN')}</span>
            </div>
          )}
        </div>

        {/* Best Card */}
        <div className="bg-surface-secondary/50 rounded-xl p-3 border border-border-subtle flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-surface-elevated border border-border-subtle flex items-center justify-center shrink-0">
            <CreditCard size={18} className="text-text-primary" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-text-muted font-semibold mb-0.5">Best Card</p>
            <p className="text-sm font-medium text-text-primary">{recommendation.bestCard.bankName} {recommendation.bestCard.cardName}</p>
          </div>
        </div>

        <div className="mt-auto">
          <p className="text-text-muted text-xs mb-1">Effective Cost</p>
          <p className="text-2xl font-display font-bold text-text-primary tracking-tight">
            ₹{recommendation.effectiveCost.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-text-muted mt-2 border-t border-border-subtle pt-3">
            <span className="font-medium text-text-secondary">Why:</span> {recommendation.reason}
          </p>
        </div>
      </div>

      {!hideAction && (
        <div className="p-4 pt-0">
          <button 
            onClick={onViewDeal}
            className="w-full flex items-center justify-center gap-2 bg-text-primary text-surface-base hover:bg-white py-3 rounded-xl font-medium transition-colors"
          >
            <span>View Deal</span>
            <ArrowRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
