import { motion, MotionValue, useTransform } from 'framer-motion';
import { IPadMockup } from '../IPadMockup';
import { cn } from '../../../../lib/utils';
import { ReactNode } from 'react';

interface TabletSplitProps {
  progress: MotionValue<number>; // 0 to 1 representing the split phase
  children: ReactNode;
  className?: string;
  isMobile?: boolean;
}

export function TabletSplit({ progress, children, className, isMobile = false }: TabletSplitProps) {
  // Mobile uses smaller split distances and rotations to prevent horizontal overflow
  const splitDistance = isMobile ? 60 : 140; 
  const splitRotation = isMobile ? 8 : 15;

  // Left Half Transforms
  const leftX = useTransform(progress, [0, 1], [0, -splitDistance]);
  const leftRotateY = useTransform(progress, [0, 1], [0, splitRotation]);
  const leftZ = useTransform(progress, [0, 1], [0, -50]); // Push slightly back when split

  // Right Half Transforms
  const rightX = useTransform(progress, [0, 1], [0, splitDistance]);
  const rightRotateY = useTransform(progress, [0, 1], [0, -splitRotation]);
  const rightZ = useTransform(progress, [0, 1], [0, -50]);

  // The tablet content
  const tabletContent = (
    <IPadMockup className="w-full">
      <div className="w-full h-full bg-[#030303] relative flex flex-col items-center justify-center p-6 text-center">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-editorial-forest/20 blur-[50px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[150px] h-[150px] bg-editorial-soft-sage/10 blur-[50px] rounded-full pointer-events-none" />
        
        <h2 className="text-white text-2xl md:text-3xl font-serif font-medium mb-3 relative z-10 tracking-tight">
          WELCOME<br/>TO RENO CRED
        </h2>
        <p className="text-editorial-soft-sage text-xs md:text-sm tracking-widest uppercase font-bold relative z-10">
          YOUR OFFERS AWAIT.
        </p>
        
        <div className="mt-8 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-white/70 text-[10px] md:text-xs relative z-10 font-medium tracking-wide">
          Smarter cards. Brighter choices.
        </div>
      </div>
    </IPadMockup>
  );

  return (
    <div className={cn("relative w-full h-full perspective-[1200px] transform-style-3d", className)}>
      
      {/* Left Half (clipped) */}
      <motion.div
        style={{
          x: leftX,
          z: leftZ,
          rotateY: leftRotateY,
          clipPath: 'inset(0 50% 0 0)',
        }}
        className="absolute inset-0 origin-center transform-style-3d will-change-transform"
      >
        {tabletContent}
      </motion.div>

      {/* Right Half (clipped) */}
      <motion.div
        style={{
          x: rightX,
          z: rightZ,
          rotateY: rightRotateY,
          clipPath: 'inset(0 0 0 50%)',
        }}
        className="absolute inset-0 origin-center transform-style-3d will-change-transform"
      >
        {tabletContent}
      </motion.div>

    </div>
  );
}
