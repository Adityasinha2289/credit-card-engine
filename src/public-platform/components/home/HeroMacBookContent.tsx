import { Sparkles, ShoppingCart, Percent, TrendingUp, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export function HeroMacBookContent() {
  return (
    <div className="w-full h-full bg-[#030303] relative flex flex-col overflow-hidden p-3 md:p-4">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-[200px] h-[200px] bg-orange-500/10 blur-[40px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[150px] h-[150px] bg-semantic-brand-strong/10 blur-[40px] rounded-full pointer-events-none" />

      {/* Fake top bar */}
      <div className="w-full flex items-center justify-between mb-4 opacity-50 relative z-10">
        <div className="flex items-center gap-1.5">
           <div className="w-3 h-3 md:w-4 md:h-4 rounded-[3px] bg-semantic-brand-strong flex items-center justify-center shadow-[0_0_10px_rgba(42,157,92,0.5)]">
             <div className="w-1.5 h-1.5 md:w-2 md:h-2 border border-[#050505] rounded-[1px]" />
           </div>
           <span className="text-white text-[7px] md:text-[9px] font-bold tracking-tight">RenoCred Extension</span>
        </div>
        <div className="flex gap-3 text-[6px] md:text-[8px] text-white/70 font-medium">
           <span className="text-white border-b border-semantic-brand-strong pb-0.5">Shopping Optimizer</span>
           <span className="hover:text-white transition-colors cursor-pointer">Travel</span>
           <span className="hover:text-white transition-colors cursor-pointer">Dining</span>
           <span className="bg-white/10 px-1.5 py-0.5 rounded-full text-white ml-1 flex items-center gap-0.5 hover:bg-white/20 transition-colors cursor-pointer">
             Checkout <Sparkles className="w-2 h-2 text-semantic-brand-strong" />
           </span>
        </div>
      </div>

      <div className="flex-1 w-full grid grid-cols-12 gap-3 md:gap-4 z-10">
        {/* Left Sidebar (Context) */}
        <div className="col-span-4 flex flex-col justify-center">
           <div className="bg-white/5 border border-white/10 rounded-lg md:rounded-xl p-2.5 md:p-3 mb-2 md:mb-3 backdrop-blur-md">
             <div className="flex items-center gap-2 mb-2 md:mb-3">
               <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400">
                 <ShoppingCart className="w-3 h-3" />
               </div>
               <div>
                 <p className="text-white text-[7px] md:text-[9px] font-semibold leading-tight">Amazon India</p>
                 <p className="text-white/50 text-[6px] md:text-[7px]">Cart Value: ₹45,000</p>
               </div>
             </div>
             
             <p className="text-white/70 text-[6px] md:text-[7px] leading-relaxed mb-2 md:mb-3">
               RenoCred has scanned your 4 active cards and found the best payment method for this transaction.
             </p>
             
             <div className="bg-semantic-brand-strong/10 border border-semantic-brand-strong/20 rounded-md p-1.5 md:p-2 flex justify-between items-center">
               <span className="text-semantic-brand-strong text-[6px] md:text-[7px] font-semibold">Total Savings</span>
               <span className="text-white font-bold text-[7px] md:text-[9px]">₹2,250</span>
             </div>
           </div>
        </div>

        {/* Right Area (Recommendation) */}
        <div className="col-span-8 flex flex-col justify-center">
          <motion.div 
            className="bg-[#0D0D0D]/90 backdrop-blur-xl rounded-lg md:rounded-xl p-3 md:p-4 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(255,255,255,0.15)] ring-1 ring-white/10 relative overflow-hidden"
          >
            {/* Animated sweep */}
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: "200%" }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="absolute top-0 left-0 w-[100px] h-[1px] bg-gradient-to-r from-transparent via-semantic-brand-strong to-transparent" 
            />

            <div className="flex justify-between items-start mb-3 md:mb-4 relative z-10">
              <div>
                <div className="bg-semantic-brand-strong/10 text-semantic-brand-strong text-[5px] md:text-[6px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full mb-1.5 md:mb-2 flex items-center gap-1 w-max border border-semantic-brand-strong/20">
                  <Sparkles className="w-2 h-2" /> Best Choice
                </div>
                <p className="text-[11px] md:text-sm font-bold text-white tracking-tight leading-tight">
                  ICICI Amazon Pay
                </p>
              </div>
              
              <div className="w-6 h-6 md:w-8 md:h-8 rounded-full border-[2px] border-white/5 relative flex items-center justify-center bg-[#111]">
                <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
                  <circle cx="50%" cy="50%" r="42%" className="stroke-semantic-brand-strong fill-none stroke-[1.5px] drop-shadow-[0_0_4px_rgba(42,157,92,0.8)]" strokeDasharray="100" strokeDashoffset="0" strokeLinecap="round" />
                </svg>
                <CheckCircle2 className="w-3 h-3 text-white" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 md:gap-3">
               <div className="bg-white/5 rounded-md md:rounded-lg p-2 md:p-3 border border-white/5">
                 <div className="flex items-center gap-1 mb-1">
                   <Percent className="w-2.5 h-2.5 text-blue-400" />
                   <span className="text-white/60 text-[6px] md:text-[7px] font-medium">Flat Cashback</span>
                 </div>
                 <p className="text-[9px] md:text-[11px] text-white font-bold">5%</p>
                 <p className="text-[5px] md:text-[6px] text-white/40 mt-0.5">Prime Members</p>
               </div>
               
               <div className="bg-white/5 rounded-md md:rounded-lg p-2 md:p-3 border border-white/5">
                 <div className="flex items-center gap-1 mb-1">
                   <TrendingUp className="w-2.5 h-2.5 text-purple-400" />
                   <span className="text-white/60 text-[6px] md:text-[7px] font-medium">Earned Value</span>
                 </div>
                 <p className="text-[9px] md:text-[11px] text-white font-bold">₹2,250</p>
                 <p className="text-[5px] md:text-[6px] text-white/40 mt-0.5">Added to A-Pay</p>
               </div>
            </div>
            
          </motion.div>
        </div>
      </div>
    </div>
  );
}
