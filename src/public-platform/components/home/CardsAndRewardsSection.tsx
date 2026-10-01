import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CreditCard as CreditCardIcon, Sparkles, TrendingDown, TrendingUp, AlertTriangle } from 'lucide-react';
import { CreditCard } from '../../../features/cards/components/CreditCard';
import { getAllPublicCards } from '../../lib/cardKnowledgeGraph';

const INTEL_UPDATES = [
  { type: 'alert', icon: TrendingDown, text: 'Axis Atlas base offline earn rate reduced to 1 EDGE Mile.', color: 'text-red-500' },
  { type: 'offer', icon: TrendingUp, text: 'HDFC Infinia 10X reward points on Swiggy (SmartBuy).', color: 'text-green-600' },
  { type: 'news', icon: AlertTriangle, text: 'Amex Platinum domestic lounge guest policy changes.', color: 'text-yellow-600' },
  { type: 'alert', icon: TrendingDown, text: 'Axis Atlas base offline earn rate reduced to 1 EDGE Mile.', color: 'text-red-500' },
  { type: 'offer', icon: TrendingUp, text: 'HDFC Infinia 10X reward points on Swiggy (SmartBuy).', color: 'text-green-600' },
];

export function CardsAndRewardsSection() {
  const cards = getAllPublicCards().slice(0, 4);
  const [activeCategory, setActiveCategory] = useState('All');
  
  return (
    <section className="py-20 bg-editorial-light-cream text-editorial-deep-forest relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-[clamp(2.5rem,4vw,3.5rem)] font-serif font-medium tracking-tight mb-4"
            >
              Find the cards<br/>that fit your life.
            </motion.h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {['All', 'Cashback', 'Travel', 'Premium', 'Lifetime Free'].map((cat) => (
              <motion.button 
                key={cat} 
                onClick={() => setActiveCategory(cat)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`relative px-4 py-2 rounded-full text-sm font-medium transition-colors z-10 ${
                  activeCategory === cat ? 'text-editorial-warm-cream' : 'text-editorial-forest hover:text-editorial-deep-forest'
                }`}
              >
                {activeCategory === cat && (
                  <motion.div
                    layoutId="activePill"
                    className="absolute inset-0 bg-editorial-deep-forest rounded-full -z-10 shadow-md"
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  />
                )}
                {!Math.random() /* Just for conditional rendering base class if needed */}
                {cat}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Curated Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 relative">
          <AnimatePresence mode="popLayout">
            {cards.map((card, idx) => (
              <motion.div
                key={`${card.id}-${activeCategory}`}
                initial={{ opacity: 0, y: idx % 2 === 0 ? 30 : 60, rotate: idx % 2 === 0 ? -2 : 2 }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 100, damping: 15, delay: idx * 0.1 }}
                whileHover={{ y: -8, rotate: idx % 2 === 0 ? 2 : -2 }}
                onClick={() => window.location.href = card.url}
                className="bg-white border border-editorial-soft-sage/30 rounded-3xl p-5 hover:shadow-xl transition-shadow group cursor-pointer flex flex-col z-10 hover:z-20 relative bg-clip-padding"
              >
                <div className="w-full mb-4 group-hover:scale-[1.02] transition-transform duration-300">
                  <CreditCard
                    card={{
                      id: card.id,
                      pan: '•••• •••• •••• ••••',
                      cardholderName: 'CARDHOLDER NAME',
                      expiry: '12/28',
                      network: (card.network?.toLowerCase() as any) || 'visa',
                      bank: card.issuer,
                      status: 'active',
                      availableCredit: 0,
                      creditLimit: 0,
                      label: card.cardName
                    }}
                    variant="compact"
                    className="w-full"
                  />
                </div>
                
                <div className="flex-1">
                  <p className="text-xs text-editorial-muted-sage uppercase tracking-widest font-medium mb-1">Base Reward</p>
                  <p className="text-sm font-bold text-editorial-deep-forest truncate" title={card.rewardRate}>{card.rewardRate}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* RenoCred Intel Ticker */}
        <div className="bg-editorial-forest/10 border border-editorial-soft-sage/30 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 overflow-hidden group">
          <div className="flex items-center gap-2 shrink-0 z-10 bg-editorial-light-cream px-2 rounded-r-lg shadow-[4px_0_10px_rgba(246,244,236,1)]">
            <Sparkles className="w-4 h-4 text-editorial-forest group-hover:animate-spin-slow" />
            <span className="text-xs font-bold uppercase tracking-widest text-editorial-forest">RenoCred Intel</span>
          </div>
          <div className="h-4 w-px bg-editorial-soft-sage/40 hidden md:block z-10" />
          
          <div className="flex-1 overflow-hidden relative flex items-center">
            <motion.div 
              animate={{ x: [0, -1000] }}
              transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
              className="flex gap-4 items-center w-max group-hover:[animation-play-state:paused]"
            >
              {[...INTEL_UPDATES, ...INTEL_UPDATES].map((update, i) => (
                <div key={i} className="flex items-center gap-2 shrink-0 bg-white/70 px-3 py-1.5 rounded-lg border border-editorial-soft-sage/20 shadow-sm">
                  <update.icon className={`w-3.5 h-3.5 ${update.color}`} />
                  <span className="text-xs font-medium text-editorial-deep-forest">{update.text} <span className="text-editorial-muted-sage font-normal">(Demo)</span></span>
                </div>
              ))}
            </motion.div>
          </div>
          
          <button className="shrink-0 text-xs font-semibold text-editorial-forest hover:text-editorial-deep-forest flex items-center gap-1 transition-colors z-10 bg-editorial-light-cream px-2 rounded-l-lg shadow-[-4px_0_10px_rgba(246,244,236,1)]">
            View All <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

      </div>
    </section>
  );
}
