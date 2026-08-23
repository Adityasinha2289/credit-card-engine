import { useState } from 'react';
import { motion, LayoutGroup } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import type { CardData } from '../../types/dashboard.types';
import { getCardTheme } from '../../../finix/config/cardThemeRegistry';


interface AICuratedWalletProps {
  cards: CardData[];
  onOpenWallet: () => void;
  onAskTaqdeer: (query: string) => void;
  bestCardId?: string;
  context?: string;
}

export function AICuratedWallet({ cards, onOpenWallet, onAskTaqdeer, bestCardId, context = 'Swiggy' }: AICuratedWalletProps) {
  // The AI's primary recommendation
  const topPickId = bestCardId || cards[0]?.id || '';
  
  // State for which card is currently taking the hero spot
  const [activeCardId, setActiveCardId] = useState<string>(topPickId);

  // If no cards, don't render (handled by empty state in parent)
  if (cards.length === 0) return null;

  // Cards to display in the mini gallery
  const otherCards = cards.filter(c => c.id !== activeCardId);
  const displayLimit = 4;
  const showOtherCards = otherCards.slice(0, displayLimit);
  const overflowCount = Math.max(0, otherCards.length - displayLimit);

  // Helper to get card info
  const activeCard = cards.find(c => c.id === activeCardId) || cards[0];
  const isAIPick = activeCardId === topPickId;

  return (
    <div className="mb-32 px-4 md:px-0 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-display font-medium text-text-primary tracking-tight">Your Wallet</h2>
          <p className="text-sm text-text-secondary mt-1">AI has already chosen today's smartest card.</p>
        </div>
      </div>

      <LayoutGroup>
        <div className="flex flex-col items-center">
          
          {/* HERO SECTION */}
          <div className="w-full flex justify-center mb-12">
            <motion.div 
              layoutId={`card-container-${activeCardId}`}
              className="relative w-full max-w-2xl aspect-[1.58] md:aspect-[1.8] rounded-[2rem] p-6 md:p-10 flex flex-col justify-between border border-border-subtle overflow-hidden cursor-pointer group shadow-2xl"
              style={{
                background: `linear-gradient(135deg, ${getCardTheme(activeCard.id).gradientFrom}, ${getCardTheme(activeCard.id).gradientTo})`,
              }}
              whileHover={{ 
                y: -5,
                rotateX: 2,
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
              }}
              transition={{ type:"spring", bounce: 0.2, duration: 0.6 }}
            >
              {/* Soft Reflections & Grain */}
              <div 
                className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none"
                style={{ backgroundImage:"url('https://grainy-gradients.vercel.app/noise.svg')" }}
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none transform -translate-x-full group-hover:translate-x-full" style={{ transition: 'transform 2s ease-out' }} />
              
              {/* Top Banner (AI Pick vs Preview) */}
              <div className="relative z-10 flex items-center justify-between">
                {isAIPick ? (
                  <motion.div layoutId="hero-badge" className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-gray-300">
                    <Sparkles size={14} className="text-gray-900" />
                    <span className="text-xs font-bold text-gray-900 tracking-widest uppercase">Today's Pick</span>
                  </motion.div>
                ) : (
                  <motion.div layoutId="hero-badge" className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100/50 backdrop-blur-md border border-border-subtle">
                    <span className="text-xs font-bold text-gray-700 tracking-widest uppercase">Preview Mode</span>
                  </motion.div>
                )}
                
                <span className="text-sm font-bold text-gray-900 uppercase tracking-widest">{activeCard.bank}</span>
              </div>

              {/* Main Information */}
              <div className="relative z-10 mt-auto">
                <div className="mb-4">
                  <h3 className="text-3xl md:text-5xl font-display font-medium text-gray-900 tracking-tight mb-2">
                    {activeCard.cardName || activeCard.bank}
                  </h3>
                  
                  {isAIPick ? (
                    <div className="flex flex-col gap-1">
                      <p className="text-lg md:text-xl text-gray-900 font-light">
                        Save <span className="font-bold">₹340</span> today.
                      </p>
                      <p className="text-sm md:text-base text-gray-700 font-medium">
                        Perfect for {context}
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1">
                      <p className="text-lg md:text-xl text-gray-900 font-light">
                        Standard rewards apply.
                      </p>
                      <p className="text-sm md:text-base text-gray-700 font-medium">
                        Sub-optimal for {context}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-end justify-between">
                  {/* Reasoning Bullets */}
                  <div className="hidden md:flex flex-col gap-1.5">
                    {isAIPick ? (
                      <>
                        <p className="text-xs text-gray-800 flex items-center gap-2"><span className="text-gray-900">•</span> 10% Instant Discount</p>
                        <p className="text-xs text-gray-800 flex items-center gap-2"><span className="text-gray-900">•</span> 5X reward multiplier</p>
                      </>
                    ) : (
                      <>
                        <p className="text-xs text-gray-600 flex items-center gap-2"><span className="text-gray-400">•</span> No active multiplier</p>
                        <p className="text-xs text-gray-600 flex items-center gap-2"><span className="text-gray-400">•</span> Base 1% cashback</p>
                      </>
                    )}
                  </div>
                  
                  {/* Confidence / CTA */}
                  <div className="flex flex-col items-end gap-3 text-right w-full md:w-auto">
                    {isAIPick && (
                      <span className="text-xs font-bold text-gray-800 bg-gray-100/50 px-2 py-1 rounded-md backdrop-blur-sm border border-border-subtle">
                        AI Confidence • 99%
                      </span>
                    )}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onAskTaqdeer(`Why use ${activeCard.bank} for ${context}?`);
                      }}
                      className="text-sm font-bold text-gray-900 flex items-center gap-1.5 group/btn"
                    >
                      Why this recommendation
                      <ArrowRight size={16} className="transform group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* MINI GALLERY SECTION */}
          <div className="w-full max-w-4xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-widest">Other Cards</h3>
              <button 
                onClick={onOpenWallet}
                className="text-xs font-bold text-text-muted hover:text-brand-emerald transition-colors flex items-center gap-1 uppercase tracking-wider"
              >
                View All Cards <ArrowRight size={12} />
              </button>
            </div>

            {/* Mobile swipe container */}
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x -mx-4 px-4 sm:mx-0 sm:px-0 hide-scrollbar">
              {showOtherCards.map((card) => (
                <motion.div
                  key={card.id}
                  layoutId={`card-container-${card.id}`}
                  onMouseEnter={() => setActiveCardId(card.id)}
                  className="snap-start shrink-0 w-[180px] md:w-[220px] aspect-[1.58] rounded-2xl p-4 flex flex-col justify-between border border-border-subtle cursor-pointer overflow-hidden shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, ${getCardTheme(card.id).gradientFrom}, ${getCardTheme(card.id).gradientTo})`,
                  }}
                  whileHover={{ y: -4, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)' }}
                >
                  <div 
                    className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none"
                    style={{ backgroundImage:"url('https://grainy-gradients.vercel.app/noise.svg')" }}
                  />
                  <span className="text-[10px] font-bold text-gray-900 uppercase tracking-widest relative z-10">{card.bank}</span>
                  
                  <div className="relative z-10">
                    <p className="text-xs font-semibold text-gray-800 leading-tight mb-2 truncate">
                      {card.cardName || 'Credit Card'}
                    </p>
                    <p className="text-[10px] font-medium text-gray-600 tracking-widest">
                      ••{card.pan.slice(-4)}
                    </p>
                  </div>
                </motion.div>
              ))}

              {overflowCount > 0 && (
                <div 
                  onClick={onOpenWallet}
                  className="snap-start shrink-0 w-[180px] md:w-[220px] aspect-[1.58] rounded-2xl border border-dashed border-border-subtle dark:border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-brand-emerald/50 hover:bg-brand-emerald/5 transition-all"
                >
                  <span className="text-xl font-display font-medium text-text-secondary">+{overflowCount}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </LayoutGroup>
    </div>
  );
}
