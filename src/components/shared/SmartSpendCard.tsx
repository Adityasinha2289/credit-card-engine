import { motion } from 'framer-motion';
import { CreditCard, Tag, TrendingDown, ArrowRight, Zap } from 'lucide-react';
import type { MockRecommendation } from '../../features/lifestyle/types';
import { cn } from '../../lib/utils';
import { useState, useEffect } from 'react';
import { RecommendationReason } from './RecommendationReason';

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
    <div className={cn("glass-panel overflow-hidden flex flex-col group relative", className)}>
      {isCalculating ? (
        <div className="absolute inset-0 z-20 bg-surface-base/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            className="text-brand-emerald mb-4"
          >
            <Zap size={28} className="fill-brand-emerald/20" />
          </motion.div>
          <p className="text-sm font-medium text-text-primary mb-1">Finding the smartest option...</p>
          <p className="text-xs text-text-muted">Comparing rewards & offers</p>
        </div>
      ) : null}

      {/* Header */}
      <div className="px-5 py-4 border-b border-border-subtle bg-surface-elevated/30">
        <h3 className="font-semibold text-text-primary text-lg tracking-tight group-hover:text-brand-emerald transition-colors">
          {title}
        </h3>
      </div>

      <div className="p-5 flex-1 flex flex-col gap-6">
        
        {/* Core Value Prop */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-text-muted font-semibold mb-1">Price</p>
            <p className="text-sm font-medium text-text-secondary line-through decoration-text-muted/50">
              ₹{originalPrice.toLocaleString('en-IN')}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-text-muted font-semibold mb-1">RenoCred Value</p>
            <p className="text-sm font-medium text-brand-emerald">
              -₹{recommendation.totalSavings.toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-widest text-text-muted font-semibold mb-1">Effective Cost</p>
          <div className="flex items-end gap-3">
            <p className="text-3xl font-display font-bold text-text-primary tracking-tight">
              ₹{recommendation.effectiveCost.toLocaleString('en-IN')}
            </p>
            <div className="bg-brand-emerald/10 text-brand-emerald px-2 py-1 rounded text-xs font-bold mb-1 border border-brand-emerald/20 flex items-center gap-1">
              <TrendingDown size={12} />
              YOU SAVE ₹{recommendation.totalSavings.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* Breakdown Context */}
        <div className="space-y-2 pt-4 border-t border-border-subtle">
          <p className="text-[10px] uppercase tracking-widest text-text-muted font-semibold mb-2">Smart Payment Plan</p>
          {recommendation.merchantOffer && (
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <Tag size={14} className="text-text-muted" />
              <span>{recommendation.merchantOffer.description}</span>
            </div>
          )}
          {recommendation.cardReward && (
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <CreditCard size={14} className="text-text-muted" />
              <span>{recommendation.cardReward.description} on {recommendation.bestCard.bankName} {recommendation.bestCard.cardName}</span>
            </div>
          )}
        </div>

        <div className="mt-auto pt-2">
          <RecommendationReason reason={recommendation.reason} />
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

