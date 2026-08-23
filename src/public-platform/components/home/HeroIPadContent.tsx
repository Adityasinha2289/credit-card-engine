import { ArrowRight, ShoppingBag, Utensils, Plane } from 'lucide-react';
import { motion } from 'framer-motion';

export function HeroIPadContent() {
  return (
    <div className="w-full h-full bg-[#030303] relative flex flex-col overflow-hidden p-2 md:p-2.5">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-[100px] h-[100px] bg-semantic-brand-strong/10 blur-[30px] rounded-full pointer-events-none" />
      
      {/* Fake top bar */}
      <div className="w-full flex items-center justify-between mb-2 md:mb-3 opacity-50 relative z-10">
        <div className="flex items-center gap-1">
           <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-[2px] bg-semantic-brand-strong flex items-center justify-center shadow-[0_0_10px_rgba(42,157,92,0.5)]">
             <div className="w-1 h-1 md:w-1.5 md:h-1.5 border border-[#050505] rounded-[1px]" />
           </div>
           <span className="text-white text-[5px] md:text-[6px] font-bold tracking-tight">RenoCred Dashboard</span>
        </div>
        <div className="flex gap-1.5 text-[4px] md:text-[5px] text-white/70 font-medium bg-[#111] px-1.5 py-0.5 md:px-2 md:py-1 rounded-full border border-white/5">
           <span className="text-white border-b border-semantic-brand-strong pb-0.5">Overview</span>
           <span className="hover:text-white transition-colors cursor-pointer">Offers</span>
        </div>
      </div>

      <div className="flex-1 w-full grid grid-cols-2 gap-1.5 md:gap-2 z-10">
        {/* Left Column: Savings Summary */}
        <motion.div 
          className="bg-[#0D0D0D]/90 backdrop-blur-xl rounded-md md:rounded-lg p-2 md:p-2.5 shadow-[0_10px_20px_-5px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(255,255,255,0.15)] ring-1 ring-white/10 relative overflow-hidden flex flex-col justify-between"
        >
           <div>
             <h3 className="text-white/60 text-[4px] md:text-[5px] font-semibold uppercase tracking-wider mb-0.5">Monthly Savings</h3>
             <p className="text-[10px] md:text-[12px] font-bold text-white mb-1">₹12,450</p>
             <div className="flex items-center gap-0.5 text-[4px] md:text-[4px] text-semantic-brand-strong bg-semantic-brand-strong/10 w-max px-1 py-0.5 rounded-[2px] border border-semantic-brand-strong/20">
               <ArrowRight className="w-1.5 h-1.5 -rotate-45" /> +15% vs last month
             </div>
           </div>
           
           <div className="space-y-1 mt-2">
             <div className="flex justify-between text-[4px] md:text-[5px]">
               <span className="text-white/50">SBI Cashback</span>
               <span className="text-white font-medium">₹5,000</span>
             </div>
             <div className="flex justify-between text-[4px] md:text-[5px]">
               <span className="text-white/50">Amex Platinum Travel</span>
               <span className="text-white font-medium">₹4,200</span>
             </div>
             <div className="flex justify-between text-[4px] md:text-[5px]">
               <span className="text-white/50">HDFC Swiggy</span>
               <span className="text-white font-medium">₹3,250</span>
             </div>
           </div>
        </motion.div>

        {/* Right Column: Brand Deals */}
        <motion.div 
          className="bg-[#0D0D0D]/90 backdrop-blur-xl rounded-md md:rounded-lg p-2 md:p-2.5 shadow-[0_10px_20px_-5px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(255,255,255,0.15)] ring-1 ring-white/10 relative overflow-hidden flex flex-col"
        >
          <div className="absolute top-0 right-0 w-[40px] h-[40px] bg-purple-500/10 blur-[15px] rounded-full pointer-events-none" />
          
          <h3 className="text-white/60 text-[4px] md:text-[5px] font-semibold uppercase tracking-wider mb-1.5">Active Brand Deals</h3>
          
          <div className="flex-1 flex flex-col gap-1 md:gap-1.5">
             <div className="bg-white/5 rounded-[4px] p-1 md:p-1.5 flex items-center gap-1.5 border border-white/5">
                <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                  <Plane className="w-2 h-2 md:w-2.5 md:h-2.5" />
                </div>
                <div>
                  <p className="text-[5px] md:text-[6px] text-white font-medium leading-tight">MakeMyTrip</p>
                  <p className="text-[4px] md:text-[4px] text-white/50">15% off with ICICI</p>
                </div>
             </div>
             
             <div className="bg-white/5 rounded-[4px] p-1 md:p-1.5 flex items-center gap-1.5 border border-white/5">
                <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 shrink-0">
                  <Utensils className="w-2 h-2 md:w-2.5 md:h-2.5" />
                </div>
                <div>
                  <p className="text-[5px] md:text-[6px] text-white font-medium leading-tight">Zomato / Swiggy</p>
                  <p className="text-[4px] md:text-[4px] text-white/50">10% cashback active</p>
                </div>
             </div>
             
             <div className="bg-white/5 rounded-[4px] p-1 md:p-1.5 flex items-center gap-1.5 border border-white/5">
                <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-400 shrink-0">
                  <ShoppingBag className="w-2 h-2 md:w-2.5 md:h-2.5" />
                </div>
                <div>
                  <p className="text-[5px] md:text-[6px] text-white font-medium leading-tight">Myntra</p>
                  <p className="text-[4px] md:text-[4px] text-white/50">Extra 5% with Kotak</p>
                </div>
             </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
