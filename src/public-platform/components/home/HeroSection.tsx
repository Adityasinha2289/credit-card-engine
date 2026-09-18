import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { interactivePrimary, interactiveSecondary } from '../../../motion';

export function HeroSection() {
  return (
    <section className="relative w-full flex flex-col items-center justify-center overflow-hidden bg-black text-white min-h-[90vh] pt-32 pb-24">
      
      {/* Abstract Gradient Background (Apple-style localized glow) */}
      <div className="absolute inset-0 flex items-center justify-center opacity-40 pointer-events-none z-0">
        <div className="w-[400px] h-[400px] md:w-[600px] md:h-[600px] bg-semantic-brand-strong/30 blur-[120px] rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 flex flex-col items-center text-center">
        
        {/* Eyebrow */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8"
        >
          <Sparkles className="w-3.5 h-3.5 text-semantic-brand" />
          <span className="text-xs font-medium tracking-wide text-white/80 uppercase">The Intelligent Wallet</span>
        </motion.div>

        {/* Massive Headline (Apple typography: large, tight tracking) */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="text-[clamp(3.5rem,8vw,7.5rem)] font-display font-bold tracking-tighter leading-[1.05] mb-6 text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60"
        >
          Money.<br />Optimized.
        </motion.h1>
        
        {/* Subtitle */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="text-lg md:text-2xl text-gray-400 mb-12 max-w-2xl leading-relaxed font-light"
        >
          Your cards should work harder for you. Rewards, exact offers, and credit health—all calculated with precision.
        </motion.p>
        
        {/* Call to Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto z-20"
        >
          <motion.button 
            whileHover={interactivePrimary.hover}
            whileTap={interactivePrimary.tap}
            onClick={() => window.location.href = '/app#sign-up'} 
            className="w-full sm:w-auto bg-white text-black font-semibold px-8 py-4 rounded-full flex items-center justify-center gap-2 transition-all hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 shadow-[0_0_40px_rgba(255,255,255,0.15)] group"
          >
            Get Started <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </motion.button>
          <motion.button 
            whileHover={interactiveSecondary.hover}
            whileTap={interactiveSecondary.tap}
            onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })} 
            className="w-full sm:w-auto bg-white/5 border border-white/10 backdrop-blur-md text-white font-medium px-8 py-4 rounded-full flex items-center justify-center transition-all hover:bg-white/10 focus:outline-none"
          >
            See How It Works
          </motion.button>
        </motion.div>

        {/* Liquid Glass Signature Element (The "Hero Image") */}
        <motion.div 
          initial={{ opacity: 0, y: 60, rotateX: 20 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
          style={{ transformPerspective: 1200 }}
          className="mt-20 relative w-full max-w-4xl aspect-[16/9] md:aspect-[21/9] rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-2xl shadow-[0_0_80px_rgba(0,0,0,0.8)] overflow-hidden flex items-center justify-center group"
        >
          {/* Internal Glow on hover */}
          <div className="absolute inset-0 bg-gradient-to-tr from-semantic-brand/20 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          
          <div className="relative z-10 flex flex-col items-center">
            <span className="font-display font-semibold text-5xl md:text-7xl tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">
              +₹12,450
            </span>
            <span className="mt-4 text-sm md:text-base text-gray-400 font-medium uppercase tracking-widest">
              Annual Value Found
            </span>
          </div>

          {/* Abstract Interface Lines */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-1/2 bg-gradient-to-t from-white/5 to-transparent border-t border-white/10 rounded-t-[2rem]" />
        </motion.div>

      </div>
    </section>
  );
}
