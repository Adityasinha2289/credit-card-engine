import { motion } from 'framer-motion';
import { fadeUpVariant, staggerContainer } from '../../../motion';

const inputs = [
  'Cards in Wallet',
  'Spending Patterns',
  'Reward Preferences',
  'Eligibility Criteria',
  'Annual Fees',
  'Transaction Context',
  'Milestone Progress',
  'Merchant Offers'
];

export function PersonalizationSection() {
  return (
    <section className="relative w-full py-24 md:py-32 bg-[#050505] text-white overflow-hidden border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center gap-16">
        
        <motion.div 
          className="w-full md:w-1/2 flex flex-col items-start text-left"
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.h2 variants={fadeUpVariant} className="text-[clamp(2.5rem,4vw,3.5rem)] font-display font-medium tracking-tight mb-6 leading-[1.1]">
            Built for your wallet.<br />Not the average user.
          </motion.h2>
          <motion.p variants={fadeUpVariant} className="text-gray-400 text-lg md:text-xl font-light leading-relaxed mb-8 max-w-lg">
            Most financial platforms offer generic rankings designed for an "average" consumer. Your finances aren't average. RenoCred continuously adapts to your unique profile.
          </motion.p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full md:w-1/2 relative"
        >
           <div className="absolute inset-0 bg-semantic-brand-strong/5 blur-3xl rounded-full" />
           <div className="relative bg-[#0a0a0a] border border-white/10 rounded-[2rem] p-8 md:p-10 shadow-2xl overflow-hidden">
             
             <div className="flex flex-wrap gap-3">
               {inputs.map((input, i) => (
                 <motion.div 
                   key={i}
                   initial={{ opacity: 0, scale: 0.9 }}
                   whileInView={{ opacity: 1, scale: 1 }}
                   viewport={{ once: true }}
                   transition={{ duration: 0.4, delay: 0.3 + (i * 0.1) }}
                   className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-gray-300 backdrop-blur-md"
                 >
                   {input}
                 </motion.div>
               ))}
             </div>

           </div>
        </motion.div>

      </div>
    </section>
  );
}
