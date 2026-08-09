import { motion } from 'framer-motion';
import { CreditCard, Tag, TrendingDown, ArrowRight, Zap } from 'lucide-react';
import type { MockRecommendation } from '../../features/lifestyle/types';
import type { OptimizationResult } from '../../features/optimization/types';
import { cn } from '../../lib/utils';
import { useState, useEffect } from 'react';
import { RecommendationReason } from './RecommendationReason';

interface SmartSpendCardProps {
  title: string;
  originalPrice: number;
  recommendation?: MockRecommendation;
  optimizationResult?: OptimizationResult;
  onViewDeal?: () => void;
  className?: string;
  hideAction?: boolean;
}

export function SmartSpendCard({ title, originalPrice, recommendation, optimizationResult, onViewDeal, className, hideAction }: SmartSpendCardProps) {
  const [isCalculating, setIsCalculating] = useState(true);

  // Simulate intelligence engine calculation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsCalculating(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const totalSavings = optimizationResult?.savings ?? recommendation?.totalSavings ?? 0;
  const effectiveCost = optimizationResult?.effectiveCost ?? recommendation?.effectiveCost ?? originalPrice;
  const reasonData = optimizationResult?.reason ?? recommendation?.reason;

  const merchantOfferText = optimizationResult 
    ? optimizationResult.recommendedPaymentMethod.appliedOffers.filter(o => o.source === 'merchant').map(o => o.description).join(', ')
    : recommendation?.merchantOffer?.description;

  const cardRewardText = optimizationResult
    ? optimizationResult.recommendedPaymentMethod.appliedOffers.filter(o => o.source === 'bank').map(o => o.description).join(', ')
    : recommendation?.cardReward?.description;

  const paymentMethodName = optimizationResult
    ? optimizationResult.recommendedPaymentMethod.paymentMethodName
    : `${recommendation?.bestCard?.bankName} ${recommendation?.bestCard?.cardName}`;

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
              -₹{totalSavings.toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-widest text-text-muted font-semibold mb-1">Effective Cost</p>
          <div className="flex items-end gap-3">
            <p className="text-3xl font-display font-bold text-text-primary tracking-tight">
              ₹{effectiveCost.toLocaleString('en-IN')}
            </p>
            <div className="bg-brand-emerald/10 text-brand-emerald px-2 py-1 rounded text-xs font-bold mb-1 border border-brand-emerald/20 flex items-center gap-1">
              <TrendingDown size={12} />
              YOU SAVE ₹{totalSavings.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* Breakdown Context */}
        <div className="space-y-2 pt-4 border-t border-border-subtle">
          <p className="text-[10px] uppercase tracking-widest text-text-muted font-semibold mb-2">Smart Payment Plan</p>
          {merchantOfferText && (
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <Tag size={14} className="text-text-muted" />
              <span>{merchantOfferText}</span>
            </div>
          )}
          {cardRewardText ? (
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <CreditCard size={14} className="text-text-muted" />
              <span>{cardRewardText} on {paymentMethodName}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <CreditCard size={14} className="text-text-muted" />
              <span>Pay using {paymentMethodName}</span>
            </div>
          )}
        </div>

        <div className="mt-auto pt-2">
          {reasonData && <RecommendationReason reason={reasonData} />}
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

