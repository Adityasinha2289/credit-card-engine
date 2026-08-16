import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeUpVariant, staggerContainer } from '../../../motion';
import { Plane, CheckCircle2, AlertCircle, Utensils, Fuel, ShoppingBag } from 'lucide-react';
import { CreditCard as PhysicalCard } from '../../../features/cards/components/CreditCard';
import { CardData } from '../../../features/cards/types/card.types';

const SCENARIOS = [
  {
    id: 'flight',
    icon: Plane,
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-400',
    title: 'Flight Booking',
    merchant: 'MakeMyTrip',
    amount: '₹18,500',
    value: '+₹1,240 value',
    card: {
      id: 'rec-amex',
      pan: '•••• •••••• •3456',
      cardholderName: 'ADITYA SINHA',
      expiry: '09/29',
      network: 'amex',
      bank: 'American Express',
      label: 'Platinum Travel',
      status: 'active',
      availableCredit: 100000,
      creditLimit: 100000,
    } as CardData,
    pros: ['3x travel reward multiplier active', 'Progresses ₹4,00,000 annual milestone'],
    cons: ['SBI Cashback card capped at ₹5,000 this month']
  },
  {
    id: 'dining',
    icon: Utensils,
    iconBg: 'bg-orange-500/10',
    iconColor: 'text-orange-400',
    title: 'Fine Dining',
    merchant: 'Taj Hotels',
    amount: '₹12,000',
    value: '+₹1,200 value',
    card: {
      id: 'rec-diners',
      pan: '•••• •••• •••• 8821',
      cardholderName: 'ADITYA SINHA',
      expiry: '11/27',
      network: 'mastercard',
      bank: 'HDFC Bank',
      label: 'Diners Club Black',
      status: 'active',
      availableCredit: 500000,
      creditLimit: 500000,
    } as CardData,
    pros: ['10x reward points on dining via SmartBuy', 'Complimentary wine benefit applied'],
    cons: ['Standard card yields only 1% return here']
  },
  {
    id: 'fuel',
    icon: Fuel,
    iconBg: 'bg-red-500/10',
    iconColor: 'text-red-400',
    title: 'Fuel Refill',
    merchant: 'IndianOil',
    amount: '₹4,000',
    value: '+₹290 value',
    card: {
      id: 'rec-octane',
      pan: '•••• •••• •••• 5590',
      cardholderName: 'ADITYA SINHA',
      expiry: '03/28',
      network: 'visa',
      bank: 'SBI Card',
      label: 'BPCL Octane',
      status: 'active',
      availableCredit: 50000,
      creditLimit: 50000,
    } as CardData,
    pros: ['7.25% value back on BPCL fuel', '1% fuel surcharge waiver applied'],
    cons: ['HDFC card gives 0 rewards on fuel transactions']
  },
  {
    id: 'shopping',
    icon: ShoppingBag,
    iconBg: 'bg-yellow-500/10',
    iconColor: 'text-yellow-400',
    title: 'Electronics',
    merchant: 'Amazon India',
    amount: '₹45,000',
    value: '+₹2,250 value',
    card: {
      id: 'rec-amazon',
      pan: '•••• •••• •••• 1142',
      cardholderName: 'ADITYA SINHA',
      expiry: '07/30',
      network: 'visa',
      bank: 'ICICI Bank',
      label: 'Amazon Pay',
      status: 'active',
      availableCredit: 250000,
      creditLimit: 250000,
    } as CardData,
    pros: ['Flat 5% cashback as Prime member', 'No upper cap on cashback limits'],
    cons: ['SBI Cashback card capped at ₹5,000 this month']
  }
];

export function SmartRecommendations() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % SCENARIOS.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const activeScenario = SCENARIOS[currentIndex];

  return (
    <section className="relative w-full py-24 md:py-32 bg-[#0A0A0A] text-white overflow-hidden border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col items-center">
        
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-16"
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.h2 variants={fadeUpVariant} className="text-[clamp(2.5rem,4vw,3.5rem)] font-display font-medium tracking-tight mb-6">
            Stop guessing which card to use.
          </motion.h2>
          <motion.p variants={fadeUpVariant} className="text-gray-400 text-lg md:text-xl font-light leading-relaxed">
            RenoCred evaluates your entire wallet against any transaction to determine exactly which card yields the highest return.
          </motion.p>
        </motion.div>

        {/* MacBook Frame wrapping the interactive mock */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full max-w-5xl mx-auto relative mt-8"
        >
          {/* MacBook Screen */}
          <div className="relative bg-[#1A1A1A] rounded-t-3xl md:rounded-t-[2rem] p-3 sm:p-5 border-4 sm:border-[12px] border-b-0 border-[#2A2A2A] shadow-2xl overflow-hidden aspect-[4/3] md:aspect-video flex flex-col">
            {/* Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 md:w-32 h-5 md:h-6 bg-[#2A2A2A] rounded-b-xl z-20 flex justify-center items-center">
               <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-[#111] border border-white/10" />
            </div>

            {/* Inner App Container */}
            <div className="flex-1 bg-[#0A0A0A] rounded-xl overflow-hidden relative border border-white/5 flex flex-col justify-center">
              <div className="absolute top-0 right-0 w-64 h-64 bg-semantic-brand-strong/10 blur-[100px] rounded-full pointer-events-none" />
              
              <AnimatePresence mode="wait">
                <motion.div 
                  key={activeScenario.id}
                  initial={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, scale: 1.02, filter: 'blur(4px)' }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center relative z-10 p-6 md:p-10 h-full overflow-y-auto custom-scrollbar"
                >
                  {/* Left side: Transaction Input Mock */}
                  <div className="flex flex-col gap-6">
                    <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl p-6 shadow-lg">
                      <span className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-4 block">Transaction Details</span>
                      
                      <div className="flex items-center gap-4 mb-6">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${activeScenario.iconBg} ${activeScenario.iconColor}`}>
                          <activeScenario.icon className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="text-lg font-medium text-white">{activeScenario.title}</div>
                          <div className="text-sm text-gray-400">{activeScenario.merchant}</div>
                        </div>
                      </div>

                      <div className="bg-black/50 rounded-xl p-4 border border-white/5 flex justify-between items-center">
                        <span className="text-gray-400">Amount</span>
                        <span className="text-2xl font-display font-medium text-white">{activeScenario.amount}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 text-sm text-gray-400">
                      <div className="w-2 h-2 rounded-full bg-semantic-brand-strong animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                      Analyzing 4 active cards in your wallet...
                    </div>
                  </div>

                  {/* Right side: Recommendation Output */}
                  <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-semantic-brand-strong to-emerald-400 rounded-3xl blur opacity-20" />
                    <div className="bg-[#050505] border border-semantic-brand-strong/30 rounded-2xl p-6 relative shadow-xl">
                      <div className="flex items-center justify-between mb-6">
                        <span className="text-xs font-bold uppercase tracking-widest text-semantic-brand-strong flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" /> Recommended
                        </span>
                        <span className="text-sm font-bold text-profit">{activeScenario.value}</span>
                      </div>

                      <div className="flex justify-center mb-6 scale-90 origin-top h-48 pointer-events-none">
                        <PhysicalCard
                          card={activeScenario.card}
                          variant="compact"
                        />
                      </div>

                      <div className="space-y-3">
                        {activeScenario.pros.map((pro, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm text-gray-300">
                            <CheckCircle2 className="w-4 h-4 text-semantic-brand-strong mt-0.5 shrink-0" />
                            <span>{pro}</span>
                          </div>
                        ))}
                        {activeScenario.cons.map((con, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm text-gray-500">
                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                            <span>{con}</span>
                          </div>
                        ))}
                      </div>

                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
          
          {/* MacBook Base/Keyboard Lip */}
          <div className="relative mx-auto w-[105%] sm:w-[110%] -left-[2.5%] sm:-left-[5%] h-3 sm:h-5 bg-gradient-to-b from-[#444] via-[#222] to-[#111] rounded-b-2xl sm:rounded-b-3xl flex justify-center shadow-2xl border-t border-white/10">
            <div className="w-1/4 h-1 bg-[#1A1A1A] rounded-b-md mx-auto shadow-inner" />
          </div>
        </motion.div>

      </div>
    </section>
  );
}
