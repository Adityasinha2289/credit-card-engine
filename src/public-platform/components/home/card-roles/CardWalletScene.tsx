import { motion, MotionValue, useTransform, useMotionTemplate } from 'framer-motion';
import { CreditCard as PhysicalCard } from '../../../../features/cards/components/CreditCard';
import { cn } from '../../../../lib/utils';

interface CardWalletSceneProps {
  progress: MotionValue<number>;
  isMobile: boolean;
}

const CARDS = [
  { id: 'c1', bank: 'HDFC', name: 'HDFC Diners Club Black', network: 'Visa', category: 'DINING' },
  { id: 'c2', bank: 'ICICI', name: 'Amazon Pay ICICI Bank', network: 'Visa', category: 'SHOPPING' },
  { id: 'c3', bank: 'Axis', name: 'Axis Atlas Credit Card', network: 'Visa', category: 'TRAVEL' },
  { id: 'c4', bank: 'American Express', name: 'Amex Platinum Reserve', network: 'Amex', category: 'LIFESTYLE' },
];

export function CardWalletScene({ progress, isMobile }: CardWalletSceneProps) {
  // 12 keyframes for the scroll story
  const TIMES = [0, 0.15, 0.28, 0.35, 0.43, 0.50, 0.58, 0.65, 0.73, 0.80, 0.88, 1];

  const getValues = (index: number) => {
    const isFocus = (timeIndex: number) => {
      if (index === 0 && (timeIndex === 3 || timeIndex === 4)) return true;
      if (index === 1 && (timeIndex === 5 || timeIndex === 6)) return true;
      if (index === 2 && (timeIndex === 7 || timeIndex === 8)) return true;
      if (index === 3 && (timeIndex === 9 || timeIndex === 10)) return true;
      return false;
    };

    const isPastFocus = (timeIndex: number) => {
      if (index === 0 && timeIndex > 4) return true;
      if (index === 1 && timeIndex > 6) return true;
      if (index === 2 && timeIndex > 8) return true;
      if (index === 3 && timeIndex > 10) return true;
      return false;
    };

    return TIMES.map((t, tIndex) => {
      // 1. Stack (0, 0.15)
      if (tIndex <= 1) {
        return {
          x: index * (isMobile ? 3 : 5),
          y: index * (isMobile ? 10 : 15),
          rotateZ: index * -2,
          scale: 1 - (index * 0.04),
          z: -index * 15,
          opacity: 1,
          labelOpacity: 0
        };
      }
      
      // 2. Fan (0.28)
      if (tIndex === 2) {
        const spreadX = isMobile ? 30 : 70;
        const spreadY = isMobile ? 35 : 40;
        return {
          x: (index - 1.5) * spreadX,
          y: (index - 1.5) * spreadY,
          rotateZ: (index - 1.5) * 8,
          scale: 0.9,
          z: -index * 10,
          opacity: 1,
          labelOpacity: 0
        };
      }

      // 3. Reorganization (1.0)
      if (tIndex === 11) {
        if (isMobile) {
          return {
            x: 0,
            y: (index - 1.5) * 160,
            rotateZ: 0,
            scale: 0.85,
            z: 0,
            opacity: 1,
            labelOpacity: 1
          };
        }
        return {
          x: (index - 1.5) * 260,
          y: 0,
          rotateZ: 0,
          scale: 0.7,
          z: 0,
          opacity: 1,
          labelOpacity: 1
        };
      }

      // 4. Focus Sequence (0.35 to 0.88)
      if (isFocus(tIndex)) {
        return {
          x: 0,
          y: isMobile ? -40 : -20,
          rotateZ: 0,
          scale: isMobile ? 1.05 : 1.15,
          z: 50,
          opacity: 1,
          labelOpacity: 1
        };
      }

      // Background state during someone else's focus
      const past = isPastFocus(tIndex);
      const bgOffsetX = isMobile ? (past ? -30 : 30) : (past ? -120 : 120);
      const bgOffsetY = isMobile ? (past ? -60 : 60) : (past ? -20 : 20);
      return {
        x: bgOffsetX + (index * 10),
        y: bgOffsetY + (index * 10),
        rotateZ: past ? -10 : 10,
        scale: 0.65,
        z: -50,
        opacity: 0.4,
        labelOpacity: 0
      };
    });
  };

  return (
    <div className="absolute inset-0 overflow-visible perspective-[1200px]">
      {CARDS.map((card, i) => {
        const values = getValues(i);
        
        const xOffset = useTransform(progress, TIMES, values.map(v => v.x));
        const yOffset = useTransform(progress, TIMES, values.map(v => v.y));
        const rotateZ = useTransform(progress, TIMES, values.map(v => v.rotateZ));
        const scale = useTransform(progress, TIMES, values.map(v => v.scale));
        const z = useTransform(progress, TIMES, values.map(v => v.z));
        const opacity = useTransform(progress, TIMES, values.map(v => v.opacity));
        const labelOpacity = useTransform(progress, TIMES, values.map(v => v.labelOpacity));

        const x = useMotionTemplate`calc(-50% + ${xOffset}px)`;
        const y = useMotionTemplate`calc(-50% + ${yOffset}px)`;

        // Z-index dynamically ensures the focused card is always on top
        const zIndex = useTransform(progress, (p) => {
          if (p >= 0.88) return i; // Reorg
          // Focus ranges
          if (p >= 0.28 && p < 0.43 && i === 0) return 50;
          if (p >= 0.43 && p < 0.58 && i === 1) return 50;
          if (p >= 0.58 && p < 0.73 && i === 2) return 50;
          if (p >= 0.73 && p < 0.88 && i === 3) return 50;
          return 10 - i; // Base stack order
        });

        return (
          <motion.div
            key={card.id}
            style={{ x, y, rotateZ, scale, z, opacity, zIndex }}
            className="absolute top-1/2 left-1/2 transform-style-3d will-change-transform flex flex-col items-center"
          >
            {/* The physical tag label */}
            <motion.div 
              style={{ opacity: labelOpacity }}
              className={cn(
                "absolute -top-12 md:-top-16 left-1/2 -translate-x-1/2 flex flex-col items-center whitespace-nowrap",
                "transition-opacity duration-300 pointer-events-none"
              )}
            >
              <span className="text-[9px] md:text-[10px] font-bold text-editorial-muted-sage uppercase tracking-[0.2em] mb-1 drop-shadow-sm">
                Best For
              </span>
              <div className="bg-editorial-deep-forest text-editorial-warm-cream text-xs md:text-sm font-semibold uppercase tracking-widest px-4 py-1.5 rounded-sm shadow-lg border border-white/10 relative">
                {card.category}
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-editorial-deep-forest rotate-45 border-r border-b border-white/10" />
              </div>
            </motion.div>

            {/* The Physical Card itself */}
            <div className="shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] rounded-[14px]">
              <PhysicalCard 
                card={card} 
                variant="wallet" 
                className="w-[240px] md:w-[320px] lg:w-[340px] aspect-[1.586/1]" 
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
