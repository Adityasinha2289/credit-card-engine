import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { CARD_DATASET } from '../../../features/finix/data/cardDataset';
import { CreditCard } from '../../../features/cards/components/CreditCard';
import type { CardData, CardNetwork } from '../../../features/cards/types/card.types';

type PurchaseIntent = 'flight' | 'dinner' | 'airpods';

const finixToCardData = (idMatch: string, nameMatch: string): CardData => {
  let finix = CARD_DATASET.find(c => c.id.toLowerCase().includes(idMatch.toLowerCase()));
  if (!finix) {
    finix = CARD_DATASET.find(c => c.name.toLowerCase().includes(nameMatch.toLowerCase())) || CARD_DATASET[0];
  }
  
  return {
    id: finix.id,
    pan: '•••• •••• •••• 1234',
    cardholderName: 'RENO CRED',
    expiry: '12/28',
    network: (finix.network.toLowerCase() || 'visa') as CardNetwork,
    bank: finix.bank,
    status: 'active',
    availableCredit: 50000000,
    creditLimit: 50000000,
    label: finix.name,
  };
};

const purchases = {
  flight: { 
    title: "Flight to Dubai", 
    amount: "₹35,000", 
    card: finixToCardData('infinia', 'Infinia'),
    value: "₹1,250", 
    diff: "1,000", 
    currentChoiceCard: finixToCardData('regalia', 'Regalia')
  },
  dinner: { 
    title: "Taj Dinner", 
    amount: "₹8,000", 
    card: finixToCardData('magnus', 'Magnus'),
    value: "₹640", 
    diff: "480", 
    currentChoiceCard: finixToCardData('icici_platinum', 'Platinum')
  },
  airpods: { 
    title: "Apple AirPods", 
    amount: "₹24,000", 
    card: finixToCardData('sbi_cashback', 'Cashback'),
    value: "₹1,200", 
    diff: "950", 
    currentChoiceCard: finixToCardData('simplysave', 'SimplySAVE')
  }
};

export function RenoCredInActionSection() {
  const [selected, setSelected] = useState<PurchaseIntent | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSelect = (intent: PurchaseIntent) => {
    if (selected === intent) return;
    setIsAnalyzing(true);
    setTimeout(() => {
      setSelected(intent);
      setIsAnalyzing(false);
    }, 400); // slightly faster, snappier transition
  };

  const activeData = selected ? purchases[selected] : purchases.flight;

  return (
    <section className="w-full py-12 lg:py-0 min-h-[100svh] lg:min-h-[calc(100svh-60px)] bg-editorial-deep-forest text-editorial-warm-cream relative overflow-hidden flex flex-col justify-center">
      {/* Subtle ambient lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(110,144,113,0.1)_0%,transparent_70%)] pointer-events-none" />
      
      <div className="w-full max-w-[1200px] mx-auto px-6 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)] gap-10 lg:gap-16 items-center">
          
          {/* LEFT: Headline & Hero Value Difference */}
          <div className="flex flex-col items-start w-full relative">
            
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-[clamp(2rem,3.5vw,3rem)] font-serif font-medium mb-3 lg:mb-4 tracking-tight leading-[1.05] text-white"
            >
              Know the best move<br/>before you pay.
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-editorial-soft-sage text-sm md:text-base mb-8 lg:mb-10 leading-relaxed max-w-[380px] font-light"
            >
              Tell Taqdeer what you're about to buy. It instantly looks across your wallet and figures out the smarter move.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="w-full flex flex-col gap-6"
            >
               {/* Cards Stack */}
               <div className="flex flex-col gap-4">
                 
                 {/* Current Choice */}
                 <motion.div 
                    key={`current-${activeData.title}`}
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}
                 >
                     <div className="text-[9px] text-editorial-soft-sage/70 font-bold uppercase tracking-[0.2em] mb-2">Current Choice</div>
                     <div className="flex items-center gap-4">
                        <div className="w-[100px] h-[63px] relative opacity-60 grayscale-[0.8] hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                          <div className="absolute top-0 left-0 origin-top-left scale-[0.357] w-[280px]">
                            <CreditCard card={activeData.currentChoiceCard} variant="compact" />
                          </div>
                        </div>
                        <div className="text-xl font-serif text-editorial-soft-sage/50 line-through decoration-editorial-soft-sage/30 whitespace-nowrap hidden sm:block">
                          {activeData.amount === "₹35,000" ? "₹250" : activeData.amount === "₹8,000" ? "₹160" : "₹250"}
                        </div>
                     </div>
                 </motion.div>
                 
                 {/* Taqdeer's Choice */}
                 <motion.div
                    key={`taqdeer-${activeData.title}`}
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
                 >
                     <div className="text-[9px] text-[#AEC3B0] font-bold uppercase tracking-[0.2em] mb-2 flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3" /> Taqdeer's Choice
                     </div>
                     <div className="flex items-center gap-4">
                        <div className="w-[120px] h-[75px] relative shadow-[0_0_20px_rgba(174,195,176,0.2)] rounded-xl transition-all duration-300">
                          <div className="absolute top-0 left-0 origin-top-left scale-[0.428] w-[280px]">
                            <CreditCard card={activeData.card} variant="compact" />
                          </div>
                        </div>
                        <div className="text-2xl font-serif text-white whitespace-nowrap hidden sm:block">{activeData.value}</div>
                     </div>
                 </motion.div>

               </div>

               {/* Difference (HERO) */}
               <motion.div
                  key={`diff-${activeData.title}`}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
                  className="mt-2 pt-4 border-t border-editorial-soft-sage/10"
               >
                   <div className="text-[clamp(2.5rem,4vw,3.5rem)] font-mono font-medium text-white leading-none tracking-tighter drop-shadow-[0_0_20px_rgba(174,195,176,0.15)] flex items-start">
                      <span className="text-[clamp(1.5rem,2.5vw,2rem)] mt-1.5 mr-1 text-[#AEC3B0]">+</span>₹{activeData.diff}
                   </div>
                   <div className="text-xs text-[#AEC3B0] font-bold tracking-[0.15em] uppercase mt-2">
                      More Value
                   </div>
               </motion.div>
               
            </motion.div>
          </div>

          {/* RIGHT: Taqdeer Interface */}
          <div className="w-full flex justify-center lg:justify-end">
            <motion.div 
               initial={{ opacity: 0, x: 20 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
               className="w-full max-w-[420px] bg-white/5 border border-white/10 rounded-[1.5rem] p-6 lg:p-8 relative overflow-hidden backdrop-blur-md shadow-2xl"
            >
              {/* Taqdeer Branding */}
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-white/10">
                <div className="w-8 h-8 rounded-full bg-editorial-forest/40 flex items-center justify-center border border-editorial-soft-sage/30 shadow-inner">
                  <Sparkles className="w-3.5 h-3.5 text-[#AEC3B0]" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-white tracking-[0.2em] uppercase">Taqdeer</div>
                  <div className="text-[9px] text-editorial-soft-sage font-medium tracking-wide">Wallet Intelligence</div>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {!selected ? (
                  <motion.div 
                    key="intent-selection"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.3 }}
                  >
                     <h4 className="text-xl font-serif text-white mb-4 leading-tight">What are you planning to buy?</h4>
                     
                     <div className="flex flex-col gap-2.5">
                        {Object.entries(purchases).map(([key, data]) => (
                           <button 
                             key={key}
                             onClick={() => handleSelect(key as PurchaseIntent)}
                             className="flex justify-between items-center w-full px-4 py-3 rounded-xl bg-black/20 hover:bg-black/40 border border-white/5 hover:border-white/10 transition-all text-left group"
                           >
                             <span className="text-sm text-editorial-soft-sage font-medium group-hover:text-white transition-colors">{data.title}</span>
                             <div className="flex items-center gap-2">
                               <span className="text-xs font-mono text-white/60">{data.amount}</span>
                               <ArrowRight className="w-3.5 h-3.5 text-editorial-soft-sage/40 group-hover:text-white transition-colors group-hover:translate-x-1" />
                             </div>
                           </button>
                        ))}
                     </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="intent-result"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                     {/* Purchase Context */}
                     <div className="w-full flex items-center justify-between mb-5 pb-4 border-b border-white/10">
                        <div>
                           <div className="text-[9px] text-editorial-soft-sage uppercase tracking-widest mb-1">Purchase</div>
                           <div className="text-sm text-white font-medium tracking-tight">{purchases[selected].title}</div>
                        </div>
                        <div className="text-sm font-mono text-white/80">{purchases[selected].amount}</div>
                     </div>

                     {/* Recommendation Result */}
                     <div className="text-[9px] text-[#AEC3B0] font-bold uppercase tracking-widest mb-3 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Your best move
                     </div>

                     <div className="w-full mb-5 relative z-10 flex justify-center drop-shadow-lg">
                        <div className="scale-90 origin-top">
                           <CreditCard 
                              card={purchases[selected].card} 
                              variant="recommendation" 
                           />
                        </div>
                     </div>

                     <div className="bg-editorial-forest/40 border border-editorial-soft-sage/20 rounded-xl p-4 relative overflow-hidden flex items-center justify-between mt-[-10px]">
                        <div className="text-[9px] text-editorial-soft-sage max-w-[120px] leading-relaxed">
                           Highest eligible value among your cards.
                        </div>
                        <div className="text-right">
                           <div className="text-[9px] text-editorial-soft-sage uppercase tracking-widest mb-1">Estimated Value</div>
                           <div className="text-lg font-mono text-[#AEC3B0] font-medium">{purchases[selected].value}</div>
                        </div>
                     </div>

                     <button onClick={() => setSelected(null)} className="mt-5 text-[10px] text-editorial-soft-sage hover:text-white transition-colors flex items-center gap-1.5 uppercase tracking-wider font-bold">
                        ← Analyze another purchase
                     </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Fast Analyzing Overlay */}
              <AnimatePresence>
                 {isAnalyzing && (
                    <motion.div 
                       initial={{ opacity: 0 }}
                       animate={{ opacity: 1 }}
                       exit={{ opacity: 0 }}
                       className="absolute inset-0 z-50 backdrop-blur-md bg-editorial-deep-forest/90 flex flex-col items-center justify-center rounded-[1.5rem] border border-editorial-soft-sage/20"
                    >
                       <Sparkles className="w-5 h-5 text-[#AEC3B0] animate-pulse mb-4" />
                       <div className="text-[9px] text-[#AEC3B0] font-bold tracking-[0.2em] uppercase mb-3">Analyzing your wallet</div>
                       <div className="w-24 h-[2px] bg-white/10 rounded-full overflow-hidden relative">
                          <motion.div 
                             initial={{ x: "-100%" }}
                             animate={{ x: "100%" }}
                             transition={{ duration: 0.6, ease: "linear" }}
                             className="absolute inset-y-0 w-1/2 bg-[#AEC3B0] rounded-full"
                          />
                       </div>
                    </motion.div>
                 )}
              </AnimatePresence>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
