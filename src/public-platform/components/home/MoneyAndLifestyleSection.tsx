import { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { Sparkles, ShoppingBag } from 'lucide-react';
import { NumberCounter, FloatingObject } from './MotionUtils';

export function MoneyAndLifestyleSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Subtle Parallax
  const travelY = useTransform(scrollYProgress, [0, 1], [30, -30]);
  const diningY = useTransform(scrollYProgress, [0, 1], [-20, 40]);
  const shoppingY = useTransform(scrollYProgress, [0, 1], [10, -10]);

  return (
    <section ref={containerRef} className="py-24 bg-[#050505] text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-12 items-center">
          
          {/* LEFT: Money Tracker */}
          <div className="flex flex-col items-start relative">
            <FloatingObject delay={0.3} rotation={10} yOffset={5} duration={4} className="absolute -left-12 -top-12 z-0 hidden md:block">
              <ShoppingBag className="w-16 h-16 text-white/10" />
            </FloatingObject>

            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-[clamp(2.5rem,4vw,3.5rem)] font-display font-medium tracking-tight mb-6 leading-[1.1] z-10"
            >
              Your money<br/>doesn't live in a spreadsheet.
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-xl font-display text-gray-400 italic mb-10 z-10"
            >
              It lives here.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, type: "spring", stiffness: 100, damping: 20 }}
              className="w-full max-w-sm bg-white/5 border border-white/10 rounded-3xl p-6 shadow-sm relative z-10 backdrop-blur-md"
            >
              <div className="absolute -top-3 -right-3 bg-semantic-brand text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full shadow-md flex items-center gap-1 hover:scale-110 transition-transform cursor-default">
                <Sparkles className="w-3 h-3" /> Demo View
              </div>

              <h3 className="text-sm font-medium text-gray-400 mb-1">Monthly Spend</h3>
              <p className="text-3xl font-bold mb-8 tracking-tight font-mono text-white">₹<NumberCounter from={20000} to={42850} delay={0.4} /></p>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#0AB377]" />
                    <span className="text-sm font-medium">Dining</span>
                  </div>
                  <span className="text-sm font-bold font-mono">₹<NumberCounter from={0} to={8200} delay={0.6} /></span>
                </div>
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#0DE699]" />
                    <span className="text-sm font-medium">Travel</span>
                  </div>
                  <span className="text-sm font-bold font-mono">₹<NumberCounter from={0} to={12400} delay={0.7} /></span>
                </div>
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#2A9D5C]" />
                    <span className="text-sm font-medium">Shopping</span>
                  </div>
                  <span className="text-sm font-bold font-mono">₹<NumberCounter from={0} to={7650} delay={0.8} /></span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#0BCC88]" />
                    <span className="text-sm font-medium">Bills</span>
                  </div>
                  <span className="text-sm font-bold font-mono">₹<NumberCounter from={0} to={9600} delay={0.9} /></span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* RIGHT: Lifestyle Visuals */}
          <div className="relative w-full h-[500px] flex items-center justify-center">
            
            {/* Travel Image */}
            <motion.div 
              style={shouldReduceMotion ? {} : { y: travelY }}
              className="absolute top-0 right-0 w-[60%] aspect-square rounded-3xl shadow-xl z-20 group"
            >
              <motion.div
                initial={{ clipPath: "inset(100% 0 0 0)" }}
                whileInView={{ clipPath: "inset(0% 0 0 0)" }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="w-full h-full overflow-hidden rounded-3xl"
              >
                <img src="https://images.unsplash.com/photo-1540339832862-474599807836?auto=format&fit=crop&q=80" alt="Travel" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
                className="absolute bottom-4 left-4 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 shadow-sm text-xs font-semibold text-white cursor-default hover:scale-105 transition-transform"
              >
                Save more on flights
              </motion.div>
            </motion.div>

            {/* Dining Image */}
            <motion.div 
              style={shouldReduceMotion ? {} : { y: diningY }}
              className="absolute bottom-0 left-0 w-[55%] aspect-[4/5] rounded-3xl shadow-xl z-30 group"
            >
              <motion.div
                initial={{ clipPath: "inset(0 0 100% 0)" }}
                whileInView={{ clipPath: "inset(0 0 0% 0)" }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="w-full h-full overflow-hidden rounded-3xl"
              >
                <img src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80" alt="Dining" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.8, type: "spring" }}
                className="absolute top-4 right-4 bg-semantic-brand/20 border border-semantic-brand/30 backdrop-blur-md text-semantic-brand px-3 py-1.5 rounded-xl shadow-md text-xs font-semibold flex items-center gap-1 cursor-default hover:scale-105 transition-transform"
              >
                <Sparkles className="w-3 h-3" /> 5X here
              </motion.div>
            </motion.div>

            {/* Shopping Image */}
            <motion.div 
              style={shouldReduceMotion ? {} : { y: shoppingY }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] aspect-square rounded-3xl shadow-2xl z-40 border-4 border-black group"
            >
              <motion.div
                initial={{ clipPath: "inset(50% 50% 50% 50%)" }}
                whileInView={{ clipPath: "inset(0% 0% 0% 0%)" }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="w-full h-full overflow-hidden rounded-3xl"
              >
                <img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80" alt="Shopping" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 1.0 }}
                className="absolute bottom-3 right-3 bg-white/10 border border-white/20 backdrop-blur-md text-white px-2 py-1 rounded-lg shadow-sm text-[10px] font-bold cursor-default hover:-translate-y-1 transition-transform"
              >
                Offer unlocked
              </motion.div>
            </motion.div>

          </div>
        </div>

      </div>
    </section>
  );
}
