import { useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { MotionButton } from '../../../motion';

export function CtaSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end end"]
  });



  return (
    <section ref={containerRef} className="relative w-full py-16 md:py-24 overflow-hidden bg-editorial-deep-forest flex items-center justify-center border-t border-editorial-soft-sage/20">
      
      {/* Sophisticated atmospheric background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay" />
        <div className="w-[800px] h-[800px] bg-editorial-forest rounded-full blur-[150px] opacity-[0.3]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-[clamp(3rem,6vw,5rem)] font-serif font-medium text-editorial-warm-cream mb-10 tracking-tight leading-[1.05]"
        >
          Ready to make your money<br/>
          <motion.span 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.3 }}
            className="inline-block text-editorial-soft-sage italic"
          >
            work harder
          </motion.span>?
        </motion.h2>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 relative"
        >
          <MotionButton 
            onClick={() => window.location.href = '/app/sign-up'}
            className="w-full sm:w-auto group bg-editorial-light-cream text-editorial-deep-forest font-semibold px-8 py-4 rounded-full inline-flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 hover:bg-white focus:outline-none shadow-lg z-10"
          >
            Get Started <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </MotionButton>
          <MotionButton 
            onClick={() => window.location.href = '/cards'}
            className="w-full sm:w-auto group bg-transparent border border-editorial-soft-sage/30 text-editorial-warm-cream font-semibold px-8 py-4 rounded-full inline-flex items-center justify-center transition-all hover:-translate-y-0.5 hover:bg-white/5 focus:outline-none z-10"
          >
            Explore Cards
          </MotionButton>

        </motion.div>
      </div>
    </section>
  );
}
