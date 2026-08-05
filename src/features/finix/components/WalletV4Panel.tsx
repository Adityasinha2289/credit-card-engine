import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Check, ChevronRight } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useDashboardStore } from '../../dashboard/store/dashboardStore';
import { CARD_DATASET, type SpendCategory } from '../data/cardDataset';
import type { CardData } from '../../cards/types/card.types';
import { getCardTheme } from '../config/cardThemeRegistry';

function getRewardRateForCard(cardId: string, category: SpendCategory): number {
  if (cardId === 'card-001') {
    if (category === 'dining') return 3;
    if (category === 'groceries') return 2;
    return 1;
  }
  if (cardId === 'card-002') {
    if (category === 'travel') return 3;
    if (category === 'subscriptions') return 1;
    return 0.5;
  }
  const datasetCard = CARD_DATASET.find((c) => c.id === cardId);
  if (datasetCard) {
    const r = datasetCard.rewards?.find((x) => x.category === category);
    return r ? r.rate : (datasetCard.baseRewardRate || 0.5);
  }
  return 0.5;
}

export function getBestCardForCategory(category: SpendCategory, userCards: CardData[]) {
  if (!userCards || userCards.length === 0) return null;
  let best = userCards[0];
  let bestRate = -1;
  for (const card of userCards) {
    const rate = getRewardRateForCard(card.id, category);
    if (rate > bestRate) {
      bestRate = rate;
      best = card;
    }
  }
  return { card: best, rate: bestRate };
}

// ─────────────────────────────────────────────────────────────────────────────
//  WALLET V4 — The Signature Experience
// ─────────────────────────────────────────────────────────────────────────────

const WALLET_CATEGORIES: { id: SpendCategory; label: string; tag: string; icon: string }[] = [
  { id: 'travel', label: 'Travel', tag: '5X Miles', icon: '✈️' },
  { id: 'shopping', label: 'Shopping', tag: '5% Cashback', icon: '🛍️' },
  { id: 'fuel', label: 'Fuel', tag: '4% Cashback', icon: '⛽' },
  { id: 'groceries', label: 'Groceries', tag: '5% Cashback', icon: '🛒' },
  { id: 'entertainment', label: 'Entertainment', tag: '10X Rewards', icon: '🎬' },
];

export function WalletV4Panel() {
  const userCards = useDashboardStore((s) => s.userCards);
  const [hoveredCategory, setHoveredCategory] = useState<SpendCategory | null>(null);

  // Get the hero card (assume dining for the hero showcase, similar to the image)
  const diningResult = getBestCardForCategory('dining', userCards) || {
    card: CARD_DATASET.find(c => c.id === 'card-001') || CARD_DATASET[0],
    rate: 5,
  };

  const heroCard = diningResult.card;

  return (
    <div className="relative w-full max-w-[1000px] mx-auto flex flex-col gap-8 pb-12 pt-4">
      {/* Background Ambient Effects */}
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden rounded-3xl">
        <div className="absolute top-[-20%] left-[10%] w-[600px] h-[600px] bg-brand-emerald/5 rounded-full blur-[120px]" />
        <div className="absolute top-[30%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <div className="flex flex-col gap-1 px-2">
        <h1 className="text-[22px] font-display font-medium text-text-primary flex items-center gap-2">
          Your card intelligence <Sparkles size={18} className="text-brand-emerald" />
        </h1>
        <p className="text-[13px] text-text-secondary">AI picks the best card for every category.</p>
      </div>

      {/* ── Immersive Hero Section ────────────────────────────────────────── */}
      <div className="relative w-full rounded-[24px] bg-[#0A0A0A] border border-border-subtle p-8 overflow-hidden shadow-2xl flex flex-col md:flex-row items-center justify-between gap-10">
        
        {/* Subtle background glow behind the card */}
        <div className="absolute left-[15%] top-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-brand-emerald-muted rounded-full blur-[80px] pointer-events-none" />

        {/* Hero Card Visual */}
        <motion.div 
          className="relative w-full md:w-[320px] flex-shrink-0 perspective-[1000px]"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease:"easeInOut" }}
        >
          {/* Card Component */}
          <div className="w-full aspect-[1.586/1] rounded-[16px] relative overflow-hidden bg-gradient-to-br from-[#1A1E2E] to-black border border-border-subtle shadow-[0_20px_40px_rgba(0,0,0,0.4)] ring-1 ring-white/5">
            {/* Card Background Details */}
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-brand-500/10 to-white/10" />
            
            {/* Ambient Lighting curves */}
            <div className="absolute -bottom-[20%] -left-[10%] w-[150%] h-[150%] rounded-[100%] border-t-[0.5px] border-border-subtle" />
            <div className="absolute -bottom-[10%] -left-[5%] w-[120%] h-[120%] rounded-[100%] border-t-[0.5px] border-border-emerald" />
            
            {/* Card Content */}
            <div className="absolute inset-0 p-5 flex flex-col justify-between z-10">
              <div className="flex items-center gap-2">
                <span className="text-white font-bold tracking-widest text-[10px] bg-blue-600/80 px-2 py-0.5 rounded-sm">{heroCard.bank?.toUpperCase() || 'HDFC'}</span>
                <span className="text-white/90 text-[13px] font-semibold tracking-wider">{heroCard.name || 'Infinia Metal'}</span>
              </div>
              <div className="flex flex-col gap-3">
                <p className="text-white/60 font-mono tracking-[0.2em] text-[15px]">•••• •••• •••• {heroCard.pan ? heroCard.pan.slice(-4) : '5559'}</p>
                <div className="flex justify-end">
                  <span className="text-white font-bold italic text-xl">VISA</span>
                </div>
              </div>
            </div>
            
            {/* Soft Reflection */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />
          </div>
          
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-emerald-muted border border-border-emerald text-brand-emerald text-[9px] font-bold uppercase tracking-widest px-3 py-0.5 rounded-full whitespace-nowrap backdrop-blur-md z-20">
            Today's Top Pick
          </div>
        </motion.div>

        {/* Center: Savings & Reasoning */}
        <div className="flex-1 flex flex-col gap-3 z-10 pl-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center">
              <span className="text-[11px]">🍽️</span>
            </div>
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Dining</span>
          </div>
          <h2 className="text-[28px] font-display font-medium text-text-primary leading-tight">{heroCard.name || 'HDFC Infinia'}</h2>
          
          <div className="flex flex-col mt-2">
            <span className="text-[12px] text-text-muted mb-1">Estimated savings</span>
            <span className="text-[32px] font-light text-brand-400 tabular-nums">₹340</span>
          </div>

          <div className="mt-2 flex items-center gap-2">
            <div className="bg-white/5 border border-border-subtle text-text-secondary text-[11px] px-3 py-1 rounded-full flex items-center gap-1.5 font-medium">
              Confidence 99%
            </div>
          </div>
        </div>

        {/* Right: Why this card? & 3D Element */}
        <div className="flex-[1.2] flex flex-col gap-5 border-l border-border-subtle pl-8 z-10 relative h-full min-h-[220px]">
          <h3 className="text-[13px] font-semibold text-text-primary">Why this card?</h3>
          
          <div className="flex flex-col gap-3.5">
            <div className="flex items-start gap-3">
              <Check size={14} strokeWidth={2.5} className="text-brand-emerald mt-0.5" />
              <span className="text-[13px] text-text-secondary leading-tight">10% instant discount at Swiggy</span>
            </div>
            <div className="flex items-start gap-3">
              <Check size={14} strokeWidth={2.5} className="text-brand-emerald mt-0.5" />
              <span className="text-[13px] text-text-secondary leading-tight">Dining rewards active</span>
            </div>
            <div className="flex items-start gap-3">
              <Check size={14} strokeWidth={2.5} className="text-brand-emerald mt-0.5" />
              <span className="text-[13px] text-text-secondary leading-tight">Highest effective return</span>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-auto">
            <button className="bg-white hover:bg-white/90 text-black font-semibold text-[12px] py-2 px-4 rounded-xl transition-all active:scale-95 shadow-xl">
              Tap to Pay
            </button>
            <button className="flex items-center gap-1 text-[12px] font-medium text-text-muted hover:text-text-primary transition-colors">
              Compare <ChevronRight size={14} />
            </button>
          </div>

          {/* Glowing 3D Coin Placeholder */}
          <div className="absolute right-0 bottom-0 w-28 h-36 pointer-events-none flex flex-col items-center justify-end">
            <motion.div 
              animate={{ y: [-4, 4, -4], rotateY: [0, 15, -15, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease:"easeInOut" }}
              className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-300 via-brand-500 to-emerald-700 shadow-[0_0_25px_rgba(34,197,94,0.3)] border border-white/20 flex items-center justify-center text-white font-bold text-xl relative z-10 transform-gpu mb-4"
            >
              <span className="opacity-90 drop-shadow-md">₹</span>
              {/* Inner highlight */}
              <div className="absolute inset-0 rounded-full bg-white/10 border-t border-white/40" />
            </motion.div>
            
            {/* Pedestal base */}
            <div className="w-20 h-5 bg-brand-emerald-muted rounded-[100%] blur-[4px] absolute bottom-1 shadow-[0_0_15px_rgba(34,197,94,0.1)]" />
            <div className="w-16 h-8 bg-gradient-to-t from-transparent to-brand-500/10 rounded-[100%] absolute bottom-3 blur-sm" />
          </div>
        </div>

      </div>

      {/* ── Interactive Category Experiences ──────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {WALLET_CATEGORIES.map((cat, idx) => {
          const result = getBestCardForCategory(cat.id, userCards);
          const cardName = result ? result.card.name : 'Premium Card';
          const isHovered = hoveredCategory === cat.id;
          
          // Generate a deterministic saving amount for the visual
          const savings = [1250, 520, 210, 180, 300][idx] || 150;

          return (
            <motion.div
              key={cat.id}
              onMouseEnter={() => setHoveredCategory(cat.id)}
              onMouseLeave={() => setHoveredCategory(null)}
              className="relative rounded-2xl bg-[#0F0F0F] border border-white/[0.03] p-5 flex flex-col gap-4 overflow-hidden group cursor-pointer hover:border-border-subtle hover:bg-[#141414] transition-all duration-300 min-h-[190px]"
            >
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110">
                    <span className="text-[13px]">{cat.icon}</span>
                  </div>
                  <h4 className="text-[13px] font-semibold text-text-primary leading-none mb-1">{cat.label}</h4>
                  <p className="text-[11px] text-text-muted mt-0.5 truncate">{cardName}</p>
                </div>
                
                <div className="mt-4 flex flex-col gap-1.5">
                  <span className="text-[10px] text-text-muted">Save up to</span>
                  <span className="text-[20px] font-light text-brand-400 tabular-nums">₹{savings.toLocaleString()}</span>
                  <div className="mt-2">
                    <span className="inline-block text-[9px] font-bold text-brand-emerald/90 border border-border-emerald bg-brand-emerald-muted px-2 py-0.5 rounded-[4px] uppercase tracking-widest">
                      {cat.tag}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* More Categories Card */}
        <div className="relative rounded-2xl bg-[#0A0A0A] border border-white/[0.03] p-5 flex flex-col items-center justify-center gap-3 overflow-hidden cursor-pointer hover:bg-[#0F0F0F] transition-colors duration-300 min-h-[190px]">
           <div className="grid grid-cols-2 gap-1 opacity-40">
             <div className="w-1.5 h-1.5 rounded-sm bg-white" />
             <div className="w-1.5 h-1.5 rounded-sm bg-white" />
             <div className="w-1.5 h-1.5 rounded-sm bg-white" />
             <div className="w-1.5 h-1.5 rounded-sm bg-white" />
           </div>
           <span className="text-[13px] font-medium text-text-secondary text-center mt-2">More categories</span>
           <span className="text-[11px] font-medium text-text-muted flex items-center gap-1 mt-1 group-hover:text-text-primary transition-colors">
             View all <ChevronRight size={12} strokeWidth={2} />
           </span>
        </div>
      </div>

    </div>
  );
}
