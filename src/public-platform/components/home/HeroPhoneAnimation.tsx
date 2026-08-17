import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Sparkles, Activity, CheckCircle2 } from 'lucide-react';
import { interactiveSecondary } from '../../../motion';

export function HeroPhoneAnimation() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, margin: "-100px" });
  
  // 0: Initial Checkout
  // 1: AI Scanning
  // 2: Analyzing / Math
  // 3: Recommendation
  // 4: Savings Highlight / Confidence
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    
    let timeoutId: NodeJS.Timeout;

    const runSequence = () => {
      // Step 0 -> 1 (Wait 1.2s on checkout)
      timeoutId = setTimeout(() => {
        setStep(1);
        
        // Step 1 -> 2 (Wait 1.5s on scanning)
        timeoutId = setTimeout(() => {
          setStep(2);
          
          // Step 2 -> 3 (Wait 1s on analyzing)
          timeoutId = setTimeout(() => {
            setStep(3);
            
            // Step 3 -> 4 (Wait 1.5s on recommendation)
            timeoutId = setTimeout(() => {
              setStep(4);
              
              // Step 4 -> 0 (Wait 2.5s on final state to read, then reset)
              timeoutId = setTimeout(() => {
                setStep(0);
                // Loop
                runSequence();
              }, 2500);
            }, 1500);
          }, 1000);
        }, 1500);
      }, 1200);
    };

    runSequence();

    return () => clearTimeout(timeoutId);
  }, [isInView]);

  return (
    <div ref={ref} className="relative flex justify-center items-center w-full h-full py-10">
      
      {/* Subtle phone floating animation */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="relative w-full flex justify-center items-start"
        style={{ height: 'calc(737px * min(1, calc((100vw - 48px) / 340)))' }}
      >
        <div className="relative transform scale-[min(1,calc((100vw-48px)/340))] md:scale-100 origin-top flex justify-center">
        {/* Glow behind phone */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[600px] bg-semantic-brand-strong rounded-[100px] blur-[160px] opacity-[0.1]" />

        {/* iPhone 17 Pro - Black Titanium Outer Frame */}
        <div className="w-[340px] h-[737px] bg-[#161617] rounded-[55px] p-[2px] shadow-[0_40px_100px_-20px_rgba(0,0,0,1)] relative border border-[#2b2b2c] ring-1 ring-[#000000]">
          
          {/* Hardware Buttons */}
          <div className="absolute top-[120px] -left-[3px] w-[3px] h-[30px] bg-[#1a1a1a] rounded-l-md border border-[#2b2b2c] border-r-0" />
          <div className="absolute top-[170px] -left-[3px] w-[3px] h-[50px] bg-[#1a1a1a] rounded-l-md border border-[#2b2b2c] border-r-0" />
          <div className="absolute top-[240px] -left-[3px] w-[3px] h-[50px] bg-[#1a1a1a] rounded-l-md border border-[#2b2b2c] border-r-0" />
          <div className="absolute top-[200px] -right-[3px] w-[3px] h-[80px] bg-[#1a1a1a] rounded-r-md border border-[#2b2b2c] border-l-0" />

          {/* Inner Bezel */}
          <div className="w-full h-full bg-black rounded-[53px] border-[10px] border-black overflow-hidden relative">
            
            {/* Screen Background */}
            <div className="w-full h-full bg-[#050505] relative flex flex-col pt-12 px-5">
              
              {/* Dynamic Island */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[100px] h-[28px] bg-black rounded-full z-50 flex items-center justify-between px-2">
                <div className="w-2.5 h-2.5 bg-[#0a0a0a] rounded-full border border-[#1a1a1a]" />
              </div>

              {/* Status Bar Fake */}
              <div className="absolute top-3 left-6 text-[11px] font-medium text-white">9:41</div>
              <div className="absolute top-3 right-6 flex items-center gap-1">
                <div className="w-3 h-3 border border-white rounded-sm flex items-center justify-center"><div className="w-1.5 h-1.5 bg-white" /></div>
              </div>

              {/* Screen Content */}
              <div className="flex-1 flex flex-col justify-center relative">
                
                {/* 1. Checkout Context */}
                <motion.div 
                  initial={false}
                  animate={{ y: step > 0 ? -40 : 0, opacity: step > 0 ? 0.4 : 1, scale: step > 0 ? 0.95 : 1 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="mb-8"
                >
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mb-2">Checkout Context</p>
                  <div className="flex justify-between items-end">
                    <h3 className="text-xl font-medium text-white tracking-tight">Apple Store</h3>
                    <h3 className="text-xl font-medium text-white tracking-tight">₹1,34,900</h3>
                  </div>
                  <div className="h-[1px] w-full bg-white/[0.05] mt-4" />
                </motion.div>

                {/* 2 & 3. AI Scanning Process */}
                <div className="absolute top-[120px] left-0 w-full">
                  <AnimatePresence>
                    {(step === 1 || step === 2) && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.4 }}
                        className="flex flex-col gap-5"
                      >
                        {/* Scanning visual */}
                        <div className="relative h-1 w-full bg-gray-900 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ x: "-100%" }}
                            animate={{ x: "100%" }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                            className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-semantic-brand-strong to-transparent"
                          />
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Activity className="w-4 h-4 text-semantic-brand-strong animate-pulse" />
                          <span className="text-sm font-medium text-gray-300">
                            {step === 1 ? "Analyzing 12 connected cards..." : "Calculating maximum value..."}
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 4 & 5. Final Recommendation */}
                <div className="absolute top-[100px] left-0 w-full">
                  <AnimatePresence>
                    {step >= 3 && (
                      <motion.div
                        initial={{ opacity: 0, y: 40, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                        className="bg-gradient-to-br from-[#121212] to-[#080808] rounded-[24px] p-5 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.05)] ring-1 ring-white/[0.06] relative"
                      >
                        {/* Edge highlight */}
                        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-semantic-brand-strong/0 via-semantic-brand-strong/40 to-semantic-brand-strong/0" />
                        
                        <div className="flex justify-between items-start mb-5">
                          <div>
                            <p className="text-semantic-brand-strong text-[9px] font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1">
                              <Sparkles className="w-2.5 h-2.5" /> Undeniable Choice
                            </p>
                            <p className="text-lg font-medium text-white tracking-tight">HDFC Infinia</p>
                          </div>
                        </div>

                        {/* Breakdown */}
                        <div className="space-y-2 mb-5">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-400 font-light">Instant Discount</span>
                            <span className="text-white font-medium">₹6,000</span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-400 font-light">Reward Value</span>
                            <span className="text-white font-medium">₹4,490</span>
                          </div>
                        </div>

                        {/* Total Savings animate in slightly delayed */}
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4, duration: 0.5 }}
                          className="bg-semantic-brand-strong/10 rounded-xl p-3 border border-semantic-brand-strong/20 flex justify-between items-center"
                        >
                          <span className="text-xs font-semibold text-semantic-brand-strong">Total Savings</span>
                          <span className="text-lg font-bold text-semantic-brand-strong">₹10,490</span>
                        </motion.div>

                        {/* Confidence Metric - Appears at step 4 */}
                        <AnimatePresence>
                          {step === 4 && (
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.4, type: "spring" }}
                              className="absolute -top-3 -right-3 bg-[#0A0A0A] border border-white/[0.1] rounded-full px-3 py-1 flex items-center gap-1.5 shadow-xl"
                            >
                              <CheckCircle2 className="w-3 h-3 text-semantic-brand-strong" />
                              <span className="text-[10px] font-bold text-white tracking-wider">98% CONFIDENCE</span>
                            </motion.div>
                          )}
                        </AnimatePresence>
                        
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Ambient Home Indicator */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1/3 h-1 bg-white rounded-full opacity-20" />
              </div>
            </div>
          </div>
        </div>
        </div>
      </motion.div>
    </div>
  );
}
