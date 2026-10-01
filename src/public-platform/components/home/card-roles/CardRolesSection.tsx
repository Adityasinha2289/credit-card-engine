import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { CardWalletScene } from './CardWalletScene';
import { CreditCard as PhysicalCard } from '../../../../features/cards/components/CreditCard';

export function CardRolesSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024); // lg breakpoint
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Fade out the editorial text near the end of the scroll
  const textOpacity = useTransform(scrollYProgress, [0.8, 0.9], [1, 0]);
  
  // Fade in final message at the very end
  const finalMessageOpacity = useTransform(scrollYProgress, [0.9, 0.95], [0, 1]);

  if (shouldReduceMotion) {
    return (
      <section className="w-full bg-editorial-warm-cream py-24 text-editorial-deep-forest overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16">
            <h2 className="text-[clamp(2.5rem,4vw,4.5rem)] font-serif font-medium leading-[1.05] tracking-tight mb-6">
              EVERY CARD<br/>HAS A JOB.
            </h2>
            <p className="text-base text-editorial-muted-sage max-w-md">
              RenoCred helps you understand which card belongs in which moment.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { id: 'c1', bank: 'HDFC', name: 'HDFC Diners Club Black', category: 'DINING' },
              { id: 'c2', bank: 'ICICI', name: 'Amazon Pay ICICI Bank', category: 'SHOPPING' },
              { id: 'c3', bank: 'Axis', name: 'Axis Atlas Credit Card', category: 'TRAVEL' },
              { id: 'c4', bank: 'American Express', name: 'Amex Platinum Reserve', category: 'LIFESTYLE' },
            ].map(card => (
              <div key={card.id} className="flex flex-col items-center">
                <div className="text-[10px] font-bold text-editorial-muted-sage uppercase tracking-[0.2em] mb-1">
                  Best For
                </div>
                <div className="bg-editorial-deep-forest text-editorial-warm-cream text-sm font-semibold uppercase tracking-widest px-4 py-1.5 rounded-sm mb-8">
                  {card.category}
                </div>
                <PhysicalCard card={card as any} variant="wallet" className="w-full max-w-[280px] aspect-[1.586/1]" />
              </div>
            ))}
          </div>

          <div className="mt-24 text-center">
            <h3 className="text-2xl md:text-3xl font-serif font-medium leading-tight">
              YOUR WALLET ISN'T A COLLECTION OF CARDS.<br/>
              IT'S A COLLECTION OF BETTER MOVES.
            </h3>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={containerRef} className="relative w-full h-[400vh] bg-editorial-warm-cream">
      {/* Sticky viewport container */}
      <div className="sticky top-[60px] h-[calc(100dvh-60px)] w-full overflow-hidden flex items-center justify-center">
        
        {/* Main interactive area */}
        <div className="relative w-full h-full max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-16 lg:pt-0">
          
          {/* Left: Editorial Content */}
          <motion.div 
            style={{ opacity: textOpacity }}
            className="col-span-1 lg:col-span-5 flex flex-col items-center lg:items-start text-center lg:text-left z-30 pointer-events-none"
          >
            <h2 className="text-[clamp(2.5rem,4vw,4.5rem)] font-serif font-medium leading-[1.05] tracking-tight mb-4 lg:mb-6 text-editorial-deep-forest drop-shadow-sm">
              EVERY CARD<br/>HAS A JOB.
            </h2>
            <p className="text-sm md:text-base text-editorial-muted-sage max-w-[320px] lg:max-w-md drop-shadow-sm">
              RenoCred helps you understand which card belongs in which moment.
            </p>
          </motion.div>

          {/* Right/Center: Physical Card Story */}
          <div className="col-span-1 lg:col-span-7 h-[55vh] lg:h-[80vh] relative z-20 pointer-events-none">
            <CardWalletScene progress={scrollYProgress} isMobile={isMobile} />
          </div>

        </div>

        {/* Final Payoff Message (Appears at the very end of scroll) */}
        <motion.div 
          style={{ opacity: finalMessageOpacity }}
          className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none bg-editorial-warm-cream/80 backdrop-blur-sm"
        >
          <div className="text-center px-6 mt-64 lg:mt-96">
            <h3 className="text-2xl md:text-4xl font-serif font-medium leading-tight text-editorial-deep-forest">
              YOUR WALLET ISN'T A COLLECTION OF CARDS.<br/>
              IT'S A COLLECTION OF BETTER MOVES.
            </h3>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
