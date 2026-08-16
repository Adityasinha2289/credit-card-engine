import { motion } from 'framer-motion';
import { fadeUpVariant, staggerContainer } from '../../../motion';
import { X, Check } from 'lucide-react';

const comparisons = [
  {
    traditional: 'Generic rankings based on affiliate payouts',
    renocred: 'Personalized intelligence based on your spending profile',
  },
  {
    traditional: 'Fragmented information scattered across blogs',
    renocred: 'Unified platform with context-aware recommendations',
  },
  {
    traditional: 'Static recommendations that become outdated',
    renocred: 'Continuously improving intelligence that adapts to you',
  }
];

export function DifferentiationSection() {
  return (
    <section className="relative w-full py-24 md:py-32 bg-[#050505] text-white overflow-hidden">
      <div className="max-w-4xl mx-auto px-6 relative z-10 flex flex-col items-center">
        
        <motion.div 
          className="text-center w-full mb-16"
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.h2 variants={fadeUpVariant} className="text-[clamp(2rem,4vw,3.5rem)] font-display font-medium tracking-tight mb-6">
            A fundamental shift.
          </motion.h2>
          <motion.p variants={fadeUpVariant} className="text-gray-400 text-lg font-light leading-relaxed">
            Why RenoCred is completely different from traditional credit-card research websites.
          </motion.p>
        </motion.div>

        <motion.div 
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.1 } }
          }}
          className="w-full flex flex-col gap-4"
        >
          {/* Header Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-6 pb-4 border-b border-white/5">
             <div className="text-xs font-bold uppercase tracking-widest text-gray-500 hidden md:block">
               Traditional Research
             </div>
             <div className="text-xs font-bold uppercase tracking-widest text-semantic-brand-strong hidden md:block">
               RenoCred
             </div>
          </div>

          {/* Comparison Rows */}
          {comparisons.map((row, i) => (
            <motion.div 
              key={i}
              variants={fadeUpVariant}
              className="flex flex-col md:grid md:grid-cols-2 bg-[#0a0a0a] border border-white/5 rounded-2xl hover:bg-[#0f0f0f] transition-colors overflow-hidden"
            >
              <div className="flex items-start gap-4 p-6 md:pr-8">
                <div className="w-6 h-6 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center shrink-0 mt-0.5">
                  <X className="w-3.5 h-3.5" />
                </div>
                <div className="text-sm text-gray-400 leading-relaxed">
                  <span className="md:hidden font-bold text-gray-500 uppercase text-[10px] tracking-wider block mb-1">Traditional</span>
                  {row.traditional}
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-6 bg-[#0c120e] md:bg-transparent md:pl-8 border-t md:border-t-0 md:border-l border-white/5">
                <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div className="text-sm text-white leading-relaxed">
                  <span className="md:hidden font-bold text-emerald-500 uppercase text-[10px] tracking-wider block mb-1">RenoCred</span>
                  {row.renocred}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
