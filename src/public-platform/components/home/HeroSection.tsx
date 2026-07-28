import { motion } from 'framer-motion';
import { Sparkles, ChevronRight } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#0A0A0A] text-white pt-24 pb-16">
      

      {/* Main Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center justify-between h-full gap-16 lg:gap-8">
        
        {/* Left Text */}
        <motion.div 
          className="w-full lg:w-[55%] flex flex-col items-start z-20"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] text-xs font-medium text-gray-400 mb-8">
            <Sparkles className="w-3.5 h-3.5 text-[#00E599]" />
            <span className="text-white">TAQDEER Engine v2.0</span>
          </div>
          
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-display font-bold mb-6 tracking-tighter leading-[1.05]">
            Stop Guessing. <br/>
            <span className="text-gray-500">Start Maximizing.</span>
          </h1>
          
          <p className="text-lg text-gray-400 mb-10 max-w-lg leading-relaxed">
            The intelligent financial operating system that analyzes your cards, rewards, and merchant offers to recommend the exact right card before every purchase.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <button className="w-full sm:w-auto bg-[#00E599] text-[#0A0A0A] font-semibold px-8 py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-[#00c985] transition-colors">
              Find My Best Card <ChevronRight className="w-4 h-4" />
            </button>
            <button className="w-full sm:w-auto bg-[#111111] text-white font-medium px-8 py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-[#1A1A1A] transition-colors border border-white/[0.08]">
              View Methodology
            </button>
          </div>
        </motion.div>

        {/* Right UI Element - Clean, immediately showing the recommendation */}
        <motion.div 
          className="w-full lg:w-[45%] flex justify-center lg:justify-end items-center relative"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        >
          {/* Main Interface Frame */}
          <div className="w-full max-w-[420px] bg-[#111111] border border-white/[0.08] rounded-3xl p-6 shadow-2xl relative overflow-hidden">
            
            {/* Context Header */}
            <div className="flex justify-between items-center mb-8 border-b border-white/[0.04] pb-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-1">Purchase Context</p>
                <h3 className="text-xl font-bold text-white">Apple Store Online</h3>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-1">Amount</p>
                <h3 className="text-xl font-bold text-white">₹1,34,900</h3>
              </div>
            </div>

            {/* The Analysis Pipeline (Visual only) */}
            <div className="flex flex-col gap-3 mb-8">
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00E599]" /> Checking 12 connected cards
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00E599]" /> Analyzing Apple partner offers
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00E599]" /> Calculating reward point values
              </div>
            </div>

            {/* Recommendation Card */}
            <div className="bg-[#1A1A1A] border border-[#00E599]/20 rounded-2xl p-5 relative">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#00E599] rounded-l-2xl" />
              
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-[#00E599] text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3" /> Top Choice
                  </p>
                  <p className="text-lg font-bold text-white">HDFC Infinia Metal</p>
                </div>
                <div className="bg-[#00E599]/10 text-[#00E599] px-3 py-1 rounded-md text-sm font-bold border border-[#00E599]/20">
                  Save ₹10,490
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Instant Discount</span>
                  <span className="text-white font-medium">₹6,000</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Reward Points (3.3%)</span>
                  <span className="text-white font-medium">₹4,490</span>
                </div>
              </div>
            </div>

            {/* Secondary Option */}
            <div className="mt-4 bg-[#0A0A0A] border border-white/[0.04] rounded-xl p-4 flex justify-between items-center opacity-70 grayscale">
              <div>
                <p className="text-sm font-bold text-white">SBI Cashback</p>
                <p className="text-xs text-gray-500">Capped at ₹5,000/mo</p>
              </div>
              <div className="text-sm font-bold text-gray-400">
                Save ₹5,000
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </section>
  );
}
