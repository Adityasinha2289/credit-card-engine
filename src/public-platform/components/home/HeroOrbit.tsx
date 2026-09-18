import React, { useEffect } from 'react';
import { motion, useAnimationFrame, useMotionValue, useTransform, useReducedMotion } from 'framer-motion';

const Basketball = () => (
  <div className="w-12 h-12 md:w-16 md:h-16 bg-[#D45524] rounded-full relative overflow-hidden shadow-[inset_-4px_-6px_12px_rgba(0,0,0,0.3),_4px_8px_16px_rgba(0,0,0,0.15)] flex items-center justify-center">
    <svg viewBox="0 0 100 100" className="w-[120%] h-[120%] text-[#2A1610] opacity-80" fill="none" stroke="currentColor" strokeWidth="2.5">
      <circle cx="50" cy="50" r="48" strokeWidth="2" />
      <path d="M50 2v96M2 50h96" />
      <path d="M15 15c25 25 25 65 0 90M85 15c-25 25-25 65 0 90" />
    </svg>
    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-black/20 to-white/20 pointer-events-none" />
  </div>
);

const Burger = () => (
  <div className="flex flex-col items-center justify-center w-12 md:w-16 drop-shadow-xl">
    <div className="w-10 md:w-14 h-3.5 md:h-4 bg-[#E29B38] rounded-t-full shadow-[inset_0_-2px_4px_rgba(0,0,0,0.2)]" />
    <div className="w-11 md:w-[3.75rem] h-1.5 md:h-2 bg-[#649C44] rounded-full my-0.5 relative z-10 shadow-sm" />
    <div className="w-10 md:w-14 h-3 md:h-3.5 bg-[#64341B] rounded-md shadow-[inset_0_2px_2px_rgba(0,0,0,0.3)]" />
    <div className="w-10 md:w-14 h-2.5 md:h-3 bg-[#E29B38] rounded-b-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.15)] mt-0.5" />
  </div>
);

const Pizza = () => (
  <div className="w-12 h-12 md:w-16 md:h-16 relative flex items-center justify-center drop-shadow-xl transform -rotate-[15deg]">
    <svg viewBox="0 0 100 100" className="w-10 h-10 md:w-14 md:h-14" fill="none">
      <path d="M50 5 L10 90 Q50 95 90 90 Z" fill="#F4B840" />
      <path d="M10 90 Q50 95 90 90" stroke="#C47920" strokeWidth="8" strokeLinecap="round" />
      <circle cx="50" cy="65" r="7" fill="#C83B3B" />
      <circle cx="35" cy="75" r="5" fill="#C83B3B" />
      <circle cx="65" cy="70" r="6" fill="#C83B3B" />
      <circle cx="48" cy="45" r="5" fill="#C83B3B" />
      <circle cx="52" cy="82" r="3" fill="#D3A537" />
      <circle cx="30" cy="55" r="2.5" fill="#D3A537" />
    </svg>
  </div>
);

const Coupon = () => (
  <div className="bg-editorial-deep-forest text-editorial-warm-cream rounded-xl px-3 py-2 shadow-xl border border-white/10 flex flex-col items-center justify-center relative overflow-hidden backdrop-blur-sm">
    <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-editorial-light-cream rounded-full border-r border-editorial-soft-sage/30"></div>
    <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-editorial-light-cream rounded-full border-l border-editorial-soft-sage/30"></div>
    <div className="absolute left-3 top-1/2 -translate-y-1/2 h-[60%] w-[1px] border-l border-dashed border-white/20"></div>
    <span className="text-[10px] md:text-[11px] font-bold tracking-[0.15em] uppercase pl-2">20% Off</span>
  </div>
);

const Garment = () => (
  <div className="w-10 h-12 md:w-14 md:h-16 relative drop-shadow-xl flex flex-col items-center">
    <svg viewBox="0 0 24 24" className="w-10 h-10 md:w-14 md:h-14 text-editorial-deep-forest" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2s-1.5.5-1.5 2v1.5M7 6h10M12 6L8.5 11.5V20a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1v-8.5L12 6z" fill="#F4F7F1"/>
      <path d="M12 2a1.5 1.5 0 0 1 1.5 1.5" strokeLinecap="round" />
    </svg>
  </div>
);

const ORBIT_OBJECTS = [
  { id: 'basketball', comp: Basketball, offset: 0 },
  { id: 'garment', comp: Garment, offset: 0.2 },
  { id: 'coupon', comp: Coupon, offset: 0.4 },
  { id: 'pizza', comp: Pizza, offset: 0.6 },
  { id: 'burger', comp: Burger, offset: 0.8 },
];

function OrbitItem({ item, progress, isMobile }: { item: any, progress: any, isMobile: boolean }) {
  const { id, comp: Comp, offset } = item;
  
  const angle = useTransform(progress, (p: number) => (p + offset) * Math.PI * 2);
  const left = useTransform(angle, (a: number) => `${50 + Math.cos(a) * (isMobile ? 48 : 45)}%`);
  const top = useTransform(angle, (a: number) => `${50 + Math.sin(a) * (isMobile ? 35 : 30)}%`);
  
  // Refined depth scaling (front: 1.1, back: 0.8)
  const scale = useTransform(angle, (a: number) => 0.95 + (Math.sin(a) * 0.15));
  const opacity = useTransform(angle, (a: number) => 0.75 + (Math.sin(a) * 0.25));
  const zIndex = useTransform(angle, (a: number) => (Math.sin(a) > 0 ? 30 : 5));
  const filter = useTransform(angle, (a: number) => Math.sin(a) < -0.2 ? 'blur(1.5px)' : 'blur(0px)');

  // Smoother, calmer micro-animations
  const rotate = useTransform(angle, (a: number) => {
    if (id === 'basketball') return (a * 180 / Math.PI) % 360; 
    if (id === 'garment') return Math.cos(a) * 5; 
    if (id === 'pizza') return Math.sin(a) * 3 - 12;
    if (id === 'burger') return Math.cos(a) * 2; 
    if (id === 'coupon') return (Math.sin(a) > 0.8) ? 8 : -2;
    return 0;
  });

  const yBounce = useTransform(angle, (a: number) => {
    if (id === 'basketball') {
      const peak = Math.pow(Math.max(0, Math.sin(a)), 30);
      return peak * (isMobile ? -15 : -25);
    }
    return 0;
  });
  
  const innerScale = useTransform(angle, (a: number) => {
    if (id === 'coupon') {
      const peak = Math.pow(Math.max(0, Math.sin(a)), 30);
      return 1 + (peak * 0.15);
    }
    return 1;
  });

  if (isMobile && id === 'burger') return null;

  return (
    <motion.div
      style={{ left, top, zIndex, position: 'absolute' }}
      className="transform -translate-x-1/2 -translate-y-1/2"
    >
      <motion.div style={{ scale, opacity, filter }}>
        <motion.div style={{ rotate, y: yBounce, scale: innerScale }}>
          <Comp />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export function HeroOrbit() {
  const shouldReduceMotion = useReducedMotion();
  const progress = useMotionValue(0);
  const [isMobile, setIsMobile] = React.useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useAnimationFrame((time) => {
    if (shouldReduceMotion) return;
    const duration = 12000;
    progress.set((time % duration) / duration);
  });

  return (
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] md:w-[90%] aspect-[1.3/1] md:aspect-[1.5/1] border border-editorial-forest/10 rounded-[100%] shadow-[inset_0_0_20px_rgba(0,0,0,0.02)]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[96%] md:w-[96%] aspect-[1.3/1] md:aspect-[1.5/1] border border-editorial-forest/5 rounded-[100%]" />
      
      {ORBIT_OBJECTS.map((item) => (
        <OrbitItem key={item.id} item={item} progress={progress} isMobile={isMobile} />
      ))}
    </div>
  );
}
