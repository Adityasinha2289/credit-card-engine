import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { MotionButton } from '../../../motion';

export function CtaSection() {
  return (
    <section className="relative w-full py-32 overflow-hidden bg-[#FAFBF9] flex items-center justify-center border-t border-gray-100">
      
      {/* Sophisticated atmospheric background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[800px] h-[800px] bg-semantic-brand-strong rounded-full blur-[150px] opacity-[0.08]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-[clamp(3rem,6vw,5rem)] font-display font-medium text-gray-900 mb-6 tracking-tight leading-[1.05]"
        >
          Your wallet can work harder.
        </motion.h2>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-xl md:text-2xl text-gray-600 mb-12 font-light max-w-2xl mx-auto"
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
            className="group bg-[#2A9D5C] text-white font-semibold px-12 py-5 rounded-full inline-flex items-center justify-center gap-3 transition-all shadow-[0_4px_20px_rgba(42,157,92,0.25)] hover:shadow-[0_4px_25px_rgba(42,157,92,0.35)] hover:-translate-y-0.5 text-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2A9D5C]/50"
          >
            Start Optimizing <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </MotionButton>
        </motion.div>
      </div>
    </section>
  );
}
