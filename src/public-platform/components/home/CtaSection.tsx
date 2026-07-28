import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export function CtaSection() {
  return (
    <section className="w-full py-40 bg-[#0A0A0A] text-white relative overflow-hidden flex flex-col items-center justify-center border-t border-white/[0.04]">
      
      <div className="max-w-4xl mx-auto px-6 relative z-10 text-center flex flex-col items-center">
        
        <motion.h2 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-7xl font-display font-bold mb-16 tracking-tight leading-[1.1]"
        >
          Ready to stop using <br/>
          <span className="text-gray-500">the wrong card?</span>
        </motion.h2>

        <motion.button 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
          className="group bg-[#00E599] text-[#0A0A0A] font-bold text-lg md:text-xl px-10 py-5 rounded-xl flex items-center justify-center gap-4 hover:bg-[#00c985] transition-all"
        >
          Find My Best Card
          <span className="bg-[#0A0A0A] text-[#00E599] p-1.5 rounded-lg group-hover:translate-x-1 transition-transform">
            <ArrowRight className="w-5 h-5" />
          </span>
        </motion.button>
        
      </div>
    </section>
  );
}
