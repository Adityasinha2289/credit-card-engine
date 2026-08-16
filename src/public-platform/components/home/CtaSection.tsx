import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { MotionButton } from '../../../motion';

export function CtaSection() {
  return (
    <section className="relative w-full py-32 overflow-hidden bg-[#050505] flex items-center justify-center">
      
      {/* Sophisticated atmospheric background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[800px] h-[800px] bg-semantic-brand-strong rounded-full blur-[150px] opacity-[0.05]" />
        <div className="absolute w-[600px] h-[600px] bg-white rounded-full blur-[100px] opacity-[0.02]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-[clamp(3rem,6vw,5rem)] font-display font-medium text-white mb-6 tracking-tight leading-[1.05]"
        >
          Your wallet can work harder.
        </motion.h2>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-xl md:text-2xl text-gray-400 mb-12 font-light max-w-2xl mx-auto"
        >
          RenoCred helps you make smarter financial decisions.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <MotionButton 
            onClick={() => window.location.href = '/app#sign-up'}
            className="group bg-emerald-500 text-[#0A0A0A] font-semibold px-12 py-5 rounded-full inline-flex items-center justify-center gap-3 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] hover:-translate-y-0.5 text-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
          >
            Start Optimizing <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </MotionButton>
        </motion.div>
      </div>
    </section>
  );
}
