import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { TabletSplit } from './TabletSplit';
import { OfferStack } from './OfferStack';
import { LogoOrbit } from './LogoOrbit';
import { cn } from '../../../../lib/utils';

export function InteractiveHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // ==========================================
  // SCROLL PROGRESS MODEL
  // ==========================================

  // --- Typography / Editorial Text ---
  const textOpacity = useTransform(scrollYProgress, [0.05, 0.15], [1, 0]);
  const textX = useTransform(scrollYProgress, [0.05, 0.15], [0, -40]);
  const textDisplay = useTransform(scrollYProgress, (p) => p > 0.15 ? 'none' : 'flex');

  // --- Tablet Approach ---
  // Adjusted Initial X: move tablet closer to text to reduce empty space and build visual tension
  const tabletInitialX = isMobile ? 0 : 200; 
  const tabletInitialY = isMobile ? 120 : 0;
  const tabletInitialScale = isMobile ? 0.8 : 0.85;
  const tabletInitialRotate = isMobile ? 0 : -10;

  const tabletX = useTransform(scrollYProgress, [0.15, 0.32], [tabletInitialX, 0]);
  const tabletY = useTransform(scrollYProgress, [0.15, 0.32], [tabletInitialY, 0]);
  const tabletScale = useTransform(scrollYProgress, [0.15, 0.32], [tabletInitialScale, 1.1]);
  const tabletRotateY = useTransform(scrollYProgress, [0.15, 0.32], [tabletInitialRotate, 0]);

  // Background gradient shift to focus on center
  const bgOpacity = useTransform(scrollYProgress, [0.15, 0.32], [0, 1]);

  // --- Tablet Split ---
  const splitProgress = useTransform(scrollYProgress, [0.32, 0.48], [0, 1]);
  const tabletOpacity = useTransform(scrollYProgress, [0.48, 0.60], [1, 0.5]);

  // --- Card Emergence & Swipe ---
  const emergenceProgress = useTransform(scrollYProgress, [0.48, 0.60], [0, 1]);
  const swipeProgress = useTransform(scrollYProgress, [0.60, 0.90], [0, 1]);

  // --- Final Transition ---
  const sceneScale = useTransform(scrollYProgress, [0.90, 1], [1, 0.9]);
  const sceneOpacity = useTransform(scrollYProgress, [0.95, 1], [1, 0]);

  // Fallback for reduced motion
  if (shouldReduceMotion) {
    return (
      <section className="relative w-full flex flex-col items-center justify-start overflow-hidden bg-editorial-light-cream text-editorial-deep-forest pt-12 pb-16">
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-y-12 items-center">
          <div className="col-span-1 lg:col-span-5 flex flex-col items-start text-left z-20">
            <h1 className="text-[clamp(2.5rem,4.5vw,4.5rem)] font-serif font-medium mb-6 tracking-tight leading-[1.05]">
              SMART MONEY.<br/>BETTER MOVES.
            </h1>
            <p className="text-base text-editorial-muted-sage mb-10 max-w-md">
              Your cards should work harder for you. Rewards. Offers. Credit health. All in one intelligent wallet.
            </p>
            <button className="bg-editorial-deep-forest text-editorial-warm-cream font-semibold px-8 py-3.5 rounded-full">
              Get Started
            </button>
          </div>
          <div className="col-span-1 lg:col-span-7 flex justify-center w-full max-w-[620px] mx-auto">
             <TabletSplit progress={new motion.MotionValue(0)} isMobile={isMobile}>
             </TabletSplit>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={containerRef} className="relative w-full h-[400vh] bg-editorial-light-cream">
      
      {/* Sticky viewport container - reduced height slightly to accommodate announcement bar without clipping */}
      <div className="sticky top-[60px] h-[calc(100dvh-60px)] w-full overflow-hidden flex items-center justify-center perspective-[1200px]">
        
        {/* Dynamic Focus Background */}
        <motion.div 
          style={{ opacity: bgOpacity }}
          className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.8)_0%,rgba(245,243,233,0)_70%)] pointer-events-none" 
        />

        {/* Global Scene Wrapper */}
        <motion.div 
          style={{ scale: sceneScale, opacity: sceneOpacity }}
          className="relative w-full h-full flex items-center justify-center transform-style-3d"
        >
          
          {/* Editorial Typography (Arrival State) */}
          <motion.div 
            style={{ opacity: textOpacity, x: textX, display: textDisplay }}
            className="absolute inset-0 w-full max-w-7xl mx-auto px-6 flex-col justify-center pointer-events-none z-30"
          >
            <div className="w-full lg:w-5/12 flex flex-col items-start text-left mt-[-15vh] md:mt-0 pointer-events-auto">
              <h1 className="text-[clamp(2.5rem,4vw,4.5rem)] font-serif font-medium mb-6 tracking-tight leading-[1.05] text-editorial-deep-forest">
                SMART MONEY.<br/>BETTER MOVES.
              </h1>
              <p className="text-sm md:text-base text-editorial-muted-sage mb-10 max-w-md leading-relaxed font-light">
                Discover → unlock → use your money better. The intelligent wallet that works for you.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                <button onClick={() => window.location.href = '/app/sign-up'} className="w-full sm:w-auto bg-editorial-deep-forest text-editorial-warm-cream font-semibold px-8 py-3.5 rounded-full flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 hover:bg-editorial-forest shadow-md group">
                  Get Started <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
              
              {/* Scroll Indicator */}
              <motion.div 
                animate={{ y: [0, 5, 0] }} 
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="mt-12 flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-editorial-muted-sage opacity-70"
              >
                <div className="w-4 h-6 border-2 border-editorial-muted-sage rounded-full flex justify-center p-0.5">
                  <div className="w-1 h-1.5 bg-editorial-muted-sage rounded-full animate-bounce" />
                </div>
                Scroll to explore
              </motion.div>
            </div>
          </motion.div>

          {/* Interactive Tablet, Orbit & Cards */}
          <motion.div
            style={{
              x: tabletX,
              y: tabletY,
              scale: tabletScale,
              rotateY: tabletRotateY,
            }}
            // Significantly enlarged tablet size via clamp for dominant presence
            className="absolute z-20 flex items-center justify-center transform-style-3d w-[clamp(280px,40vw,620px)] aspect-[4/3]"
          >
            {/* The Logo Orbit revolves completely around the tablet container */}
            <LogoOrbit isMobile={isMobile} emergenceProgress={emergenceProgress} className="z-0" />

            <motion.div style={{ opacity: tabletOpacity }} className="absolute inset-0 w-full h-full z-10">
               <TabletSplit progress={splitProgress} isMobile={isMobile}>
                 {/* Internal content handled by TabletSplit */}
               </TabletSplit>
            </motion.div>

            {/* Offer Cards (Centered behind/within tablet) */}
            <div className="absolute z-30">
               <OfferStack 
                 emergenceProgress={emergenceProgress}
                 swipeProgress={swipeProgress}
                 isMobile={isMobile}
               />
            </div>
            
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}
