import { motion } from 'framer-motion';
import { Database, TrendingUp, Tags, MapPin, Zap, ArrowRight } from 'lucide-react';
import { RecommendationCard } from './RecommendationCard';

const inputs = [
  { id: 'merchant', icon: MapPin, label: 'Merchant MCC', value: 'Identifies exact spending category' },
  { id: 'rewards', icon: Zap, label: 'Card Multipliers', value: 'Calculates base + accelerated points' },
  { id: 'offers', icon: Tags, label: 'Live Offers', value: 'Scans for instant bank discounts' },
  { id: 'behavior', icon: TrendingUp, label: 'Spending Velocity', value: 'Checks milestone & cap limits' },
  { id: 'benefits', icon: Database, label: 'Card Benefits', value: 'Applies lounge access & waivers' },
];

export function HowTaqdeerThinksSection() {
  return (
    <section id="ai" className="w-full py-32 bg-[#0A0A0A] border-t border-white/[0.04] text-white">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="text-center mb-24">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 tracking-tight">
            How TAQDEER Thinks.
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            A single recommendation requires analyzing millions of data points in real-time. Here is how the engine calculates your perfect card.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8">
          
          {/* Left: Inputs */}
          <div className="w-full lg:w-[40%] flex flex-col gap-4">
            {inputs.map((input, i) => (
              <motion.div 
                key={input.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-4 bg-[#111111] p-4 rounded-2xl border border-white/[0.04]"
              >
                <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center shrink-0">
                  <input.icon className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-white">{input.label}</h4>
                  <p className="text-sm text-gray-500">{input.value}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Middle: The Engine (RenoCred Logo) */}
          <div className="hidden lg:flex w-[20%] flex-col items-center justify-center relative h-[400px]">
            {/* Flowing lines animation */}
            <div className="absolute inset-0 flex flex-col justify-between py-12">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-full h-px bg-gradient-to-r from-transparent via-[#00E599]/20 to-transparent relative">
                  <motion.div 
                    className="absolute top-1/2 left-0 w-2 h-2 -translate-y-1/2 rounded-full bg-[#00E599] shadow-[0_0_10px_#00E599]"
                    animate={{ left: ['0%', '100%'], opacity: [0, 1, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2, ease: "linear" }}
                  />
                </div>
              ))}
            </div>

            {/* RenoCred Brand Box */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              className="relative z-10 flex flex-col items-center"
            >
              <div className="w-24 h-24 rounded-3xl bg-[#0B0B0D] border border-white/[0.1] flex items-center justify-center shadow-[0_0_50px_rgba(0,229,153,0.1)] relative overflow-hidden">
                <div className="absolute inset-0 rounded-3xl border border-[#00E599]/20 animate-pulse" />
                <img src="/logo.jpg" alt="RenoCred Logo" className="w-12 h-12 rounded-xl object-cover relative z-10" />
              </div>
              <p className="text-white font-display font-bold text-xl mt-4 tracking-tight">RenoCred</p>
            </motion.div>
          </div>

          {/* Right: The Output */}
          <div className="w-full lg:w-[40%] flex flex-col items-center lg:items-end relative">
            <div className="absolute top-1/2 -left-8 -translate-y-1/2 w-6 h-6 bg-[#0A0A0A] border border-white/[0.08] rounded-full hidden lg:flex items-center justify-center z-20">
              <ArrowRight className="w-3 h-3 text-gray-500" />
            </div>

            <RecommendationCard 
              cardName="SBI Cashback"
              expectedSavings="₹2,500"
              rewards="5% Value"
              reasons={['Highest net value', 'Monthly cap remaining', 'Instant discount']}
              confidence={99}
              className="w-full max-w-[360px]"
            />
          </div>

        </div>
      </div>
    </section>
  );
}
