import { useEffect } from 'react';
import { motion, useReducedMotion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { analytics } from '../../../lib/analytics';
import { fadeUpVariant, staggerContainer } from '../../../motion';

export function PartnerOfferSection() {
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    analytics.track('Partner Section Viewed', { partner: 'greenox' });
  }, []);

  // 3D Parallax State
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const springX = useSpring(mouseX, { stiffness: 150, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 150, damping: 20 });
  
  // Outer card rotation
  const rotateX = useTransform(springY, [-0.5, 0.5], ["5deg", "-5deg"]);
  const rotateY = useTransform(springX, [-0.5, 0.5], ["-5deg", "5deg"]);
  
  // Inner elements translation (Parallax)
  const innerX = useTransform(springX, [-0.5, 0.5], ["-8px", "8px"]);
  const innerY = useTransform(springY, [-0.5, 0.5], ["-8px", "8px"]);
  
  // Subtle light/glow movement
  const glowX = useTransform(springX, [-0.5, 0.5], ["-20px", "20px"]);
  const glowY = useTransform(springY, [-0.5, 0.5], ["-20px", "20px"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    mouseX.set(x / width - 0.5);
    mouseY.set(y / height - 0.5);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <section id="greenox-offer" className="py-20 lg:py-28 bg-editorial-light-cream text-editorial-deep-forest relative overflow-hidden border-t border-editorial-soft-sage/20 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-20 items-center"
          variants={shouldReduceMotion ? undefined : staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Left: Narrative */}
          <div className="flex flex-col items-start order-2 md:order-1">
            <motion.div variants={shouldReduceMotion ? undefined : fadeUpVariant} className="flex items-center gap-3 mb-6">
               <div className="text-[10px] font-bold text-editorial-muted-sage uppercase tracking-widest border border-editorial-soft-sage/30 px-3 py-1.5 rounded-full">
                 RENO CRED × GREENOX
               </div>
            </motion.div>
            <motion.h2 variants={shouldReduceMotion ? undefined : fadeUpVariant} className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium tracking-tight mb-6 leading-[1.05]">
              Good food.<br /> Better value.
            </motion.h2>
            <motion.p variants={shouldReduceMotion ? undefined : fadeUpVariant} className="text-editorial-muted-sage text-base md:text-lg font-light leading-relaxed max-w-md">
              RenoCred has partnered with GreeNox to bring members more value around everyday dining.
            </motion.p>
          </div>

          {/* Right: Premium Partner Spotlight */}
          <motion.div 
            variants={shouldReduceMotion ? undefined : fadeUpVariant} 
            className="order-1 md:order-2 perspective-[1000px] flex justify-center md:justify-end"
          >
            <motion.div
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{ rotateX: shouldReduceMotion ? 0 : rotateX, rotateY: shouldReduceMotion ? 0 : rotateY }}
              whileHover={{ scale: shouldReduceMotion ? 1 : 1.015, y: shouldReduceMotion ? 0 : -5 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="w-full max-w-[440px] bg-white border border-editorial-soft-sage/20 rounded-[2rem] p-8 lg:p-12 flex flex-col items-center justify-center text-center shadow-lg hover:shadow-2xl transition-shadow duration-500 overflow-hidden relative min-h-[380px] cursor-default group transform-style-3d will-change-transform"
            >
              {/* Subtle dynamic ambient glow */}
              <motion.div 
                style={{ x: shouldReduceMotion ? 0 : glowX, y: shouldReduceMotion ? 0 : glowY }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-[#008933]/[0.03] rounded-full blur-[60px] pointer-events-none transition-opacity duration-500 opacity-50 group-hover:opacity-100" 
              />
              
              {/* Eyebrow Reveal */}
              <div className="absolute top-6 left-1/2 -translate-x-1/2 text-[9px] font-bold text-editorial-muted-sage uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                PARTNER OFFER
              </div>

              {/* Logo Layer */}
              <motion.div 
                style={{ x: shouldReduceMotion ? 0 : innerX, y: shouldReduceMotion ? 0 : innerY }}
                className="relative z-10 w-[200px] md:w-[220px] h-[60px] mb-10 mt-4 [transform:translateZ(20px)]"
              >
                <img 
                  src="/greenox_logo.png" 
                  alt="GreeNox" 
                  className="w-full h-full object-contain filter transition-transform duration-500 group-hover:scale-105 origin-center"
                />
              </motion.div>

              {/* Offer Details Layer */}
              <motion.div 
                style={{ x: shouldReduceMotion ? 0 : innerX, y: shouldReduceMotion ? 0 : innerY }}
                className="relative z-10 flex flex-col items-center w-full [transform:translateZ(30px)]"
              >
                <div className="text-[10px] font-bold text-editorial-muted-sage tracking-[0.2em] uppercase mb-3">
                  RenoCred × GreeNox
                </div>
                
                {/* Primary Offer */}
                <div className="text-[clamp(3rem,4vw,3.5rem)] font-serif font-medium text-editorial-deep-forest leading-none mb-6 transition-colors duration-500">
                  20% OFF
                </div>

                {/* Status Toggle Container */}
                <div className="relative h-6 w-full flex justify-center mt-2 overflow-hidden border-t border-editorial-soft-sage/20 pt-4">
                  <div className="absolute top-4 left-0 w-full flex items-center justify-center transition-transform duration-500 group-hover:-translate-y-8">
                    <span className="text-[10px] font-bold text-editorial-muted-sage tracking-widest uppercase">
                      Dining benefit coming soon
                    </span>
                  </div>
                  <div className="absolute top-4 left-0 w-full flex items-center justify-center translate-y-8 transition-transform duration-500 group-hover:translate-y-0">
                    <span className="text-[10px] font-bold text-[#008933] tracking-widest uppercase flex items-center gap-1.5">
                      A better dining move is coming 
                      <span className="text-lg leading-none mt-[-2px] font-serif">→</span>
                    </span>
                  </div>
                </div>
                
              </motion.div>
            </motion.div>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}
