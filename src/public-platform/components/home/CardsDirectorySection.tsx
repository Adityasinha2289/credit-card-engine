import { ArrowRight, CreditCard, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { getAllPublicCards } from '../../lib/cardKnowledgeGraph';

export function CardsDirectorySection() {
  const cards = getAllPublicCards().slice(0, 4); // Display a curated selection of 4 cards
  
  return (
    <section className="py-24 md:py-32 bg-editorial-light-cream text-editorial-deep-forest border-t border-editorial-soft-sage/20 relative overflow-hidden">
      
      {/* Decorative background blur */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-editorial-soft-sage/30 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="max-w-2xl">
            <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-serif font-medium tracking-tight mb-6">
              Every Card, Deconstructed.
            </h2>
            <p className="text-editorial-muted-sage text-lg md:text-xl font-light leading-relaxed">
              Browse our exhaustive directory of premium credit cards. We break down the math so you don't have to. Compare fees, reward structures, and true value in seconds.
            </p>
          </div>
          <button 
            onClick={() => window.location.href = '/calculators'}
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-editorial-deep-forest text-editorial-light-cream rounded-full font-medium hover:bg-editorial-forest transition-colors shadow-sm shrink-0"
          >
            Explore Directory <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, idx) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-white border border-editorial-soft-sage/30 rounded-3xl p-6 hover:shadow-lg transition-all duration-300 group cursor-pointer flex flex-col justify-between"
              onClick={() => window.location.href = card.url}
            >
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-editorial-light-cream text-editorial-forest text-xs font-semibold uppercase tracking-wider rounded-full mb-6">
                  <Star className="w-3 h-3" /> {card.categories?.[0] || 'Premium'}
                </div>
                
                {/* Physical Card Mockup Representation */}
                <div className={`w-full aspect-[1.58/1] rounded-2xl bg-gradient-to-br from-gray-900 to-black p-5 relative overflow-hidden shadow-md mb-6 transform group-hover:-translate-y-2 group-hover:shadow-xl transition-all duration-300`}>
                  <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay" />
                  <div className="absolute top-5 right-5">
                    <CreditCard className="w-6 h-6 text-white/50" />
                  </div>
                  <div className="absolute bottom-5 left-5 right-5">
                    <p className="text-white/60 text-xs font-medium uppercase tracking-widest mb-1">{card.issuer}</p>
                    <p className="text-white font-bold text-lg tracking-tight leading-tight">{card.cardName}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-auto">
                <div className="flex-1 mr-4">
                  <p className="text-xs text-editorial-muted-sage font-medium uppercase tracking-widest mb-1">Base Reward</p>
                  <p className="text-sm font-bold text-editorial-deep-forest truncate" title={card.rewardRate}>{card.rewardRate}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-editorial-light-cream flex items-center justify-center shrink-0 text-editorial-muted-sage group-hover:bg-editorial-forest group-hover:text-editorial-warm-cream transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
