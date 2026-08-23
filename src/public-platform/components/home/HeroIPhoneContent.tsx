import { Sparkles, CheckCircle2, TrendingUp, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export function HeroIPhoneContent() {
  return (
    <div className="w-full h-full bg-[#030303] relative flex flex-col overflow-hidden pt-4 md:pt-6 px-2 md:px-3">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-[80px] h-[80px] bg-semantic-brand-strong/10 blur-[20px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[60px] h-[60px] bg-blue-500/10 blur-[20px] rounded-full pointer-events-none" />

      {/* Fake top bar */}
      <div className="w-full flex items-center justify-between mb-3 md:mb-4 opacity-50 relative z-10">
        <div className="flex items-center gap-1">
           <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-[2px] bg-semantic-brand-strong flex items-center justify-center shadow-[0_0_10px_rgba(42,157,92,0.5)]">
             <div className="w-1 h-1 md:w-1.5 md:h-1.5 border border-[#050505] rounded-[1px]" />
           </div>
           <span className="text-white text-[5px] md:text-[7px] font-bold tracking-tight">RenoCred</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center relative items-center w-full z-10">
        {/* Core Card Glow */}
        <div className="absolute inset-0 bg-semantic-brand-strong/15 blur-[30px] rounded-full w-4/5 h-4/5 m-auto pointer-events-none" />

        <motion.div 
          className="bg-[#0D0D0D]/90 backdrop-blur-xl rounded-md md:rounded-lg p-2 md:p-3 shadow-[0_10px_20px_-5px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(255,255,255,0.15)] ring-1 ring-white/10 relative w-full overflow-hidden"
        >
          {/* Animated sweeping gradient line on top edge */}
          <motion.div 
            initial={{ x: "-100%" }}
            animate={{ x: "200%" }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
            className="absolute top-0 left-0 w-[60px] h-[1px] bg-gradient-to-r from-transparent via-semantic-brand-strong to-transparent" 
          />
          
          <div className="flex justify-between items-start mb-2 md:mb-3 relative z-10">
            <div>
              <div className="bg-semantic-brand-strong/10 text-semantic-brand-strong text-[4px] md:text-[5px] font-bold uppercase tracking-widest px-1 py-0.5 rounded-sm mb-1 flex items-center gap-0.5 w-max border border-semantic-brand-strong/20 shadow-[0_0_10px_rgba(42,157,92,0.15)]">
                <Sparkles className="w-1.5 h-1.5 md:w-2 md:h-2" /> 98% Match
              </div>
              <p className="text-[9px] md:text-[11px] font-bold text-white tracking-tight leading-tight drop-shadow-md">
                HDFC Infinia
              </p>
            </div>
            
            {/* Mock Ring Chart */}
            <div className="w-5 h-5 md:w-6 md:h-6 rounded-full border-[1.5px] border-white/5 relative flex items-center justify-center shadow-[inset_0_0_10px_rgba(0,0,0,0.5)] bg-[#111]">
              <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
                <circle cx="50%" cy="50%" r="42%" className="stroke-semantic-brand-strong fill-none stroke-[1px] drop-shadow-[0_0_4px_rgba(42,157,92,0.8)]" strokeDasharray="100" strokeDashoffset="20" strokeLinecap="round" />
              </svg>
              <CheckCircle2 className="w-2 h-2 md:w-2.5 md:h-2.5 text-white drop-shadow-[0_0_2px_rgba(0,0,0,1)]" />
            </div>
          </div>

          {/* Breakdown */}
          <div className="space-y-1 md:space-y-1.5 mb-2 md:mb-3 relative z-10">
            <div className="flex justify-between items-center text-[5px] md:text-[6px] group">
              <div className="flex items-center gap-1">
                <div className="w-1 h-1 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
                <span className="text-gray-400 font-medium group-hover:text-gray-300 transition-colors">Instant Discount</span>
              </div>
              <span className="text-white font-semibold tracking-wide">₹6,000</span>
            </div>
            
            <div className="flex justify-between items-center text-[5px] md:text-[6px] group">
              <div className="flex items-center gap-1">
                <div className="w-1 h-1 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.8)]" />
                <span className="text-gray-400 font-medium group-hover:text-gray-300 transition-colors">Reward Value</span>
              </div>
              <span className="text-white font-semibold tracking-wide">₹4,490</span>
            </div>
          </div>

          {/* Total Savings */}
          <div className="relative overflow-hidden bg-gradient-to-r from-semantic-brand-strong/20 to-semantic-brand-strong/5 rounded-md md:rounded-lg p-1.5 md:p-2 border border-semantic-brand-strong/30 flex justify-between items-center group shadow-[0_10px_20px_rgba(0,0,0,0.2)]">
            <div className="absolute inset-0 bg-semantic-brand-strong/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="flex flex-col gap-0.5 relative z-10">
              <span className="text-[4px] md:text-[5px] font-bold text-semantic-brand-strong/90 uppercase tracking-widest">Total Value</span>
              <span className="text-[7px] md:text-[9px] font-black text-white flex items-center gap-0.5 md:gap-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                ₹10,490 <TrendingUp className="w-2 h-2 md:w-2.5 md:h-2.5 text-semantic-brand-strong drop-shadow-[0_0_8px_rgba(42,157,92,0.8)]" />
              </span>
            </div>
            <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-semantic-brand-strong/20 flex items-center justify-center relative z-10 group-hover:bg-semantic-brand-strong transition-colors duration-300">
              <ChevronRight className="w-2 h-2 md:w-2.5 md:h-2.5 text-semantic-brand-strong group-hover:text-[#0A0A0A]" />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
