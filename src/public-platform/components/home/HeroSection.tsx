import { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useReducedMotion } from 'framer-motion';
import { Sparkles, ChevronRight, Clock, ShieldCheck, ArrowRight } from 'lucide-react';
import { staggerContainer, fadeUpVariant, springSmooth, MotionButton, interactivePrimary, interactiveSecondary } from '../../../motion';
import { HeroPhoneAnimation } from './HeroPhoneAnimation';

// Soft SVG Grain for premium texture
const grainSvg = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`;

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  
  // Subtle parallax for the right product demo
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });
  
  const yParallax = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const smoothY = useSpring(yParallax, { stiffness: 50, damping: 20 });
  const activeY = shouldReduceMotion ? 0 : smoothY;

  return (
    <section ref={containerRef} className="relative w-full min-h-[100vh] flex flex-col items-center justify-center overflow-hidden bg-[#050505] text-white pt-32 pb-24">
      
      {/* Background Lighting & Grain */}
      <div 
        className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-overlay"
        style={{ backgroundImage: grainSvg }}
      />
      {/* Subtle Radial Depth */}
      <div className="absolute top-1/4 right-1/4 w-[800px] h-[800px] bg-semantic-brand-strong rounded-full blur-[200px] opacity-[0.1] pointer-events-none" />
      <div className="absolute top-1/2 left-1/4 w-[600px] h-[600px] bg-white rounded-full blur-[120px] opacity-[0.015] pointer-events-none" />
      
      {/* Main Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-y-16 lg:gap-x-12 items-center min-h-[calc(100vh-8rem)]">
        
        {/* Left Text - Editorial Typography */}
        <motion.div 
          className="col-span-1 lg:col-span-6 flex flex-col items-start text-left z-20 w-full min-w-0"
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >

          
          <motion.h1 variants={fadeUpVariant} className="text-[clamp(3rem,6vw,5.5rem)] font-display font-medium mb-6 md:mb-8 tracking-[-0.03em] leading-[1.05] text-white break-words w-full">
            Absolute certainty. <br/>
            <span className="text-gray-500">Every time you pay.</span>
          </motion.h1>
          
          <motion.p variants={fadeUpVariant} className="text-[clamp(1rem,2vw,1.125rem)] text-gray-400 mb-10 md:mb-12 max-w-lg leading-[1.7] font-light">
            We analyze your cards, current offers, and purchase history in milliseconds to guarantee maximum return on every transaction. You simply swipe.
          </motion.p>
          
          <motion.div variants={fadeUpVariant} className="flex flex-col sm:flex-row items-center gap-5 w-full sm:w-auto">
            <MotionButton intent="primary" className="group relative overflow-hidden w-full sm:w-auto bg-gradient-to-b from-[#2a9652] to-[#1e6e3c] text-white font-bold px-10 py-4 rounded-full flex items-center justify-center gap-3 transition-all shadow-[0_8px_32px_-8px_rgba(35,126,69,0.5),inset_0_1px_1px_rgba(255,255,255,0.3)] ring-1 ring-white/10 hover:shadow-[0_16px_48px_-12px_rgba(35,126,69,0.7),inset_0_1px_1px_rgba(255,255,255,0.3)] hover:-translate-y-0.5 hover:brightness-110 [text-shadow:0_1px_2px_rgba(0,0,0,0.2)]">
              Analyze My Wallet
            </MotionButton>
            <MotionButton intent="secondary" className="w-full sm:w-auto bg-transparent text-gray-300 font-medium px-8 py-4 rounded-xl flex items-center justify-center gap-2 hover:text-white transition-colors">
              See How It Works <ArrowRight className="w-4 h-4" />
            </MotionButton>
          </motion.div>

          {/* Microcopy Trust Signals */}
          <motion.div variants={fadeUpVariant} className="mt-8 flex items-center gap-4 text-xs font-medium text-gray-500">
             <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Setup takes 60 seconds.</span>
             <span className="w-1 h-1 rounded-full bg-gray-800" />
             <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> Bank-level encryption.</span>
          </motion.div>

        </motion.div>

        {/* Right UI Element - iPhone 17 Pro Demo */}
        <motion.div 
          className="col-span-1 lg:col-span-6 flex justify-center lg:justify-end items-center relative w-full min-w-0"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springSmooth, delay: 0.2 }}
          style={{ y: activeY }}
        >
          <HeroPhoneAnimation />
        </motion.div>
      </div>
    </section>
  );
}
