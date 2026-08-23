import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Coffee, Fuel, Plane, Utensils, Sparkles, CheckCircle2 } from 'lucide-react';

const scenarios = [
  { id: 'dining', title: 'Dinner at Taj', amount: '₹8,500', icon: Utensils, card: 'HDFC Diners Club', save: '₹450', rewards: '2X Points', confidence: 92, desc: 'Maximize luxury dining multiplier instantly.' },
  { id: 'shopping', title: 'New AirPods', amount: '₹24,900', icon: ShoppingBag, card: 'SBI Cashback', save: '₹1,245', rewards: '5% Value', confidence: 95, desc: 'Highest absolute cashback on electronics.' },
  { id: 'travel', title: 'Flight to Goa', amount: '₹12,000', icon: Plane, card: 'Axis Atlas', save: '₹600', rewards: '5X Edge Miles', confidence: 99, desc: 'Fastest miles accumulation for domestic travel.' },
  { id: 'fuel', title: 'Full Tank', amount: '₹4,500', icon: Fuel, card: 'BPCL SBI Card', save: '₹326', rewards: '7.25% Value', confidence: 98, desc: 'Complete surcharge waiver plus valueback.' },
  { id: 'food', title: 'Morning Coffee', amount: '₹400', icon: Coffee, card: 'Swiggy HDFC Bank', save: '₹40', rewards: '10% Cashback', confidence: 99, desc: 'Unbeatable everyday spend optimization.' },
];

export function WrongCardSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  // Automatically cycle through scenarios to tell the "one premium story"
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % scenarios.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const activeScenario = scenarios[activeIndex];
  const Icon = activeScenario.icon;

  return (
    <section className="relative w-full bg-[#050505] text-white overflow-hidden py-24 lg:py-32 flex items-center justify-center min-h-[750px] lg:min-h-[850px]">
      
      {/* Background Lighting */}
      <div className="absolute top-1/2 right-[20%] -translate-y-1/2 w-[600px] h-[600px] bg-[#2A9D5C] blur-[200px] opacity-[0.04] pointer-events-none rounded-full" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#050505_100%)] pointer-events-none opacity-80" />
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')]" />

      <div className="w-full max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 items-center relative z-10">
        
        {/* LEFT CONTENT (5 COLUMNS) */}
        <div className="col-span-1 lg:col-span-5 flex flex-col items-start text-left w-full min-w-0">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#111111] border border-white/[0.04] text-[10px] uppercase tracking-[0.2em] font-semibold text-gray-400 mb-8 shadow-sm">
            <Sparkles className="w-3 h-3 text-[#2A9D5C]" />
            <span className="text-gray-300">Intelligent Context</span>
          </div>

          <h2 className="text-3xl md:text-5xl font-display font-medium mb-12 tracking-tight">
            You're probably using the <span className="text-gray-500">wrong card</span>.
          </h2>

          <div className="w-full relative h-[220px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeScenario.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0 flex flex-col items-start w-full min-w-0"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center shrink-0">
                    <Icon className="w-6 h-6 text-[#2A9D5C]" />
                  </div>
                  <h3 className="text-[clamp(2rem,4vw,3rem)] font-display font-medium text-white tracking-tight leading-none break-words min-w-0">
                    {activeScenario.title}
                  </h3>
                </div>
                
                <p className="text-[clamp(1.25rem,2vw,1.5rem)] font-light text-gray-500 tracking-tight mb-4">
                  {activeScenario.amount}
                </p>

                <p className="text-sm text-gray-400 leading-relaxed max-w-sm mb-6">
                  {activeScenario.desc}
                </p>

                <div className="flex items-center gap-2">
                  {scenarios.map((s, idx) => (
                    <div 
                      key={s.id} 
                      className={`h-1 rounded-full transition-all duration-500 ${idx === activeIndex ? 'w-8 bg-[#2A9D5C]' : 'w-2 bg-gray-800'}`}
                    />
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* RIGHT CONTENT (7 COLUMNS) */}
        <div className="col-span-1 lg:col-span-7 flex justify-center items-center relative w-full min-w-0 h-auto py-8">
          
          <motion.div 
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="relative flex justify-center w-full max-w-[100vw] overflow-visible items-start"
            style={{ height: 'calc(720px * min(1, calc((100vw - 48px) / 340)))' }}
          >
            <div className="relative transform scale-[min(1,calc((100vw-48px)/340))] md:scale-100 origin-top flex justify-center">
            {/* iPhone 17 Pro - Black Titanium */}
            <div className="w-[340px] h-[720px] bg-[#161617] rounded-[55px] p-[2px] shadow-[0_40px_100px_-20px_rgba(0,0,0,1)] relative border border-[#2b2b2c] ring-1 ring-[#000000] shrink-0">
              
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

                  {/* Status Bar */}
                  <div className="absolute top-3 left-6 text-[11px] font-medium text-white">9:41</div>
                  <div className="absolute top-3 right-6 flex items-center gap-1">
                    <div className="w-3 h-3 border border-white rounded-sm flex items-center justify-center"><div className="w-1.5 h-1.5 bg-white" /></div>
                  </div>

                  <div className="flex-1 flex flex-col justify-center relative">
                    
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeScenario.id}
                        initial={{ opacity: 0, scale: 0.96, y: 10, filter: 'blur(4px)' }}
                        animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, scale: 0.96, y: -10, filter: 'blur(4px)' }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="w-full"
                      >
                        {/* Mini Header Context Inside Phone */}
                        <div className="mb-6">
                          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mb-2">Checkout Details</p>
                          <div className="flex justify-between items-end">
                            <h3 className="text-lg font-medium text-white tracking-tight break-words">{activeScenario.title}</h3>
                            <h3 className="text-lg font-medium text-white tracking-tight">{activeScenario.amount}</h3>
                          </div>
                          <div className="h-[1px] w-full bg-white/[0.05] mt-4" />
                        </div>

                        {/* 3D Recommendation Card */}
                        <div className="bg-gradient-to-br from-[#121212] to-[#080808] rounded-[24px] p-5 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.05)] ring-1 ring-white/[0.06] relative">
                          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-[#2A9D5C]/0 via-[#2A9D5C]/40 to-[#2A9D5C]/0" />
                          
                          <div className="flex justify-between items-start mb-5">
                            <div>
                              <p className="text-[#2A9D5C] text-[9px] font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1">
                                <Sparkles className="w-2.5 h-2.5" /> Best Choice
                              </p>
                              <p className="text-lg font-medium text-white tracking-tight">{activeScenario.card}</p>
                            </div>
                          </div>

                          <div className="space-y-2 mb-5">
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-gray-400 font-light">Rewards Generated</span>
                              <span className="text-white font-medium">{activeScenario.rewards}</span>
                            </div>
                          </div>

                          <div className="bg-[#2A9D5C]/10 rounded-xl p-3 border border-[#2A9D5C]/20 flex justify-between items-center mb-2">
                            <span className="text-xs font-semibold text-[#2A9D5C]">Total Savings</span>
                            <span className="text-lg font-bold text-[#2A9D5C]">{activeScenario.save}</span>
                          </div>

                          <div className="absolute -top-3 -right-3 bg-[#0A0A0A] border border-white/[0.1] rounded-full px-3 py-1 flex items-center gap-1.5 shadow-xl">
                            <CheckCircle2 className="w-3 h-3 text-[#2A9D5C]" />
                            <span className="text-[10px] font-bold text-white tracking-wider">{activeScenario.confidence}% CONFIDENCE</span>
                          </div>
                        </div>
                      </motion.div>
                    </AnimatePresence>

                  </div>

                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1/3 h-1 bg-white rounded-full opacity-20" />
                </div>
              </div>
            </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
