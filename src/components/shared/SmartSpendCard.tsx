import { motion } from 'framer-motion';
import { CreditCard, Tag, TrendingDown, ArrowRight, Zap, ShieldCheck } from 'lucide-react';
import type { MockRecommendation } from '../../features/lifestyle/types';
import type { OptimizationResult } from '../../features/optimization/types';
import { cn } from '../../lib/utils';
import { RecommendationReason } from './RecommendationReason';
import { useState } from 'react';
import { OutboundService } from '../../features/commerce/outboundApi';

interface SmartSpendCardProps {
  title: string;
  originalPrice: number;
  recommendation?: MockRecommendation;
  optimizationResult?: OptimizationResult;
  onViewDeal?: () => void;
  className?: string;
  hideAction?: boolean;
  entityId?: string;
  placement?: string;
  isSponsored?: boolean;
}

export function SmartSpendCard({ title, originalPrice, recommendation, optimizationResult, onViewDeal, className, hideAction, entityId, placement, isSponsored }: SmartSpendCardProps) {
  const [isNavigating, setIsNavigating] = useState(false);

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

  const handleAction = async () => {
    if (entityId && placement) {
      try {
        setIsNavigating(true);
        await OutboundService.navigateToPartner({
          commerceEntityId: entityId,
          placement,
          recommendationSnapshot: optimizationResult
        });
      } catch (err) {
        setIsNavigating(false);
        // Fallback to onViewDeal if provided
        if (onViewDeal) onViewDeal();
      }
    } else if (onViewDeal) {
      onViewDeal();
    }
  };

  return (
    <div className={cn("glass-panel overflow-hidden flex flex-col group relative transition-all duration-300 hover:border-brand-emerald/30", className)}>
      {isNavigating ? (
        <div className="absolute inset-0 z-20 bg-obsidian/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            className="text-brand-emerald mb-4"
          >
            <Zap size={28} className="fill-brand-emerald/20" />
          </motion.div>
          <p className="text-sm font-medium text-text-primary mb-1">Redirecting securely...</p>
        </div>
      ) : null}

      {/* Header */}
      <div className="px-5 py-4 border-b border-border-subtle bg-surface-elevated flex items-center justify-between">
        <h3 className="font-semibold text-text-primary text-lg tracking-tight group-hover:text-brand-emerald transition-colors">
          {title}
        </h3>
        {isSponsored && (
          <span className="text-[10px] font-bold tracking-wider uppercase bg-surface-secondary text-text-muted px-2 py-1 rounded-md border border-border-subtle">
            Featured
          </span>
        )}
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
            onClick={handleAction}
            className="w-full flex items-center justify-center gap-2 bg-text-primary text-obsidian hover:bg-white py-3 rounded-xl font-bold transition-colors shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
          >
            <span>Shop with RenoCred</span>
            <ArrowRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

