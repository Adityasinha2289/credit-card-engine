import { motion } from 'framer-motion';
import { fadeUpVariant, staggerContainer } from '../../../motion';
import { ShieldCheck, Database, Lock } from 'lucide-react';

export function TrustSection() {
  return (
    <section className="w-full py-24 md:py-32 bg-[#0a0a0a] text-white relative border-t border-white/5 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-semantic-brand-strong/5 via-transparent to-transparent pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center gap-16">
        
        <motion.div 
          className="w-full md:w-1/2 flex flex-col items-start text-left"
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div variants={fadeUpVariant} className="flex items-center gap-2 text-gray-500 mb-6">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-xs font-bold tracking-widest uppercase">Trust & Transparency</span>
          </motion.div>
          <motion.h2 variants={fadeUpVariant} className="text-[clamp(2.5rem,4vw,3.5rem)] font-display font-medium tracking-tight mb-6 leading-[1.1]">
            Transparent reasoning.<br />Precise data.
          </motion.h2>
          <motion.p variants={fadeUpVariant} className="text-gray-400 text-lg md:text-xl font-light leading-relaxed max-w-lg">
            We don't deal in hype. RenoCred relies on accurate card information, up-to-date fee structures, and transparent reward calculations to empower your decisions.
          </motion.p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full md:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-6"
        >
           <div className="bg-[#111] border border-white/5 p-6 rounded-2xl flex flex-col gap-4">
             <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400">
               <Database className="w-5 h-5" />
             </div>
             <h4 className="text-lg font-medium text-white">Verified Data</h4>
             <p className="text-sm text-gray-500 leading-relaxed">Our intelligence relies on verified reward rates, milestone structures, and merchant exclusions.</p>
           </div>
           
           <div className="bg-[#111] border border-white/5 p-6 rounded-2xl flex flex-col gap-4 mt-0 sm:mt-12">
             <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400">
               <ShieldCheck className="w-5 h-5" />
             </div>
             <h4 className="text-lg font-medium text-white">Clear Logic</h4>
             <p className="text-sm text-gray-500 leading-relaxed">Every recommendation includes exactly why it was chosen and how the estimated value was calculated.</p>
           </div>

           <div className="bg-[#111] border border-white/5 p-6 rounded-2xl flex flex-col gap-4">
             <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400">
               <Lock className="w-5 h-5" />
             </div>
             <h4 className="text-lg font-medium text-white">Privacy First</h4>
             <p className="text-sm text-gray-500 leading-relaxed">Your financial data is used exclusively to power your personal intelligence engine.</p>
           </div>
        </motion.div>

      </div>
    </section>
  );
}
