/* eslint-disable react-hooks/rules-of-hooks */
import { useAnimationFrame, motion, useMotionValue, useTransform, MotionValue } from 'framer-motion';
import { cn } from '../../../../lib/utils';

interface LogoOrbitProps {
  isMobile: boolean;
  emergenceProgress: MotionValue<number>;
  className?: string;
}

const LOGOS = [
  { id: 'greenox', src: '/greenox_logo.png' },
  { id: 'snitch', src: '/snitch-logo.png' },
  { id: 'behrouz', src: '/behrouz-logo.png' },
  { id: 'myntra', src: '/myntra-logo.png' },
  { id: 'renocred', src: '/renocred-logo.jpg' },
  { id: 'taqdeer', src: '/taqdeer-logo.png' },
];

export function LogoOrbit({ isMobile, emergenceProgress, className }: LogoOrbitProps) {
  // The time value drives the continuous rotation
  const time = useMotionValue(0);

  // Update time for continuous rotation (14s per revolution)
  useAnimationFrame((t) => {
    time.set((t / 14000) * Math.PI * 2);
  });

  // Fade and shrink the orbit when the offer cards emerge
  const globalOpacity = useTransform(emergenceProgress, [0, 1], [1, 0.2]);
  const globalScale = useTransform(emergenceProgress, [0, 1], [1, 0.9]);

  // Adjust orbital radius based on device
  const radiusX = isMobile ? 180 : 360;
  const radiusY = isMobile ? 60 : 120;

  return (
    <motion.div
      style={{ opacity: globalOpacity, scale: globalScale }}
      className={cn("absolute inset-0 flex items-center justify-center pointer-events-none", className)}
    >
      {/* Orbital Rings (Subtle) */}
      <div 
        className="absolute rounded-[100%] border border-editorial-soft-sage/30"
        style={{
          width: radiusX * 2,
          height: radiusY * 2,
          opacity: 0.5,
        }}
      />
      <div 
        className="absolute rounded-[100%] border border-editorial-soft-sage/10"
        style={{
          width: (radiusX * 2) - 40,
          height: (radiusY * 2) - 15,
          opacity: 0.3,
        }}
      />

      {/* Orbiting Logos */}
      {LOGOS.map((logo, index) => {
        const offset = (index / LOGOS.length) * Math.PI * 2;
        
        // Compute 3D position
        const x = useTransform(time, (v) => Math.cos(v + offset) * radiusX);
        const y = useTransform(time, (v) => Math.sin(v + offset) * radiusY);
        
        // Depth perception (scale and opacity peak when at the front: sin = 1)
        const scale = useTransform(time, (v) => 1 + (Math.sin(v + offset) * 0.3));
        const opacity = useTransform(time, (v) => 0.5 + (Math.sin(v + offset) * 0.5));
        
        // z-index: front items should be above the tablet, back items behind it
        const zIndex = useTransform(time, (v) => (Math.sin(v + offset) > 0 ? 50 : -10));

        // Logo sizes
        const logoSize = isMobile ? 40 : 64;

        return (
          <motion.div
            key={logo.id}
            className="absolute flex items-center justify-center bg-white rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-editorial-soft-sage/20 overflow-hidden"
            style={{
              x,
              y,
              scale,
              opacity,
              zIndex,
              width: logoSize,
              height: logoSize,
              marginLeft: -logoSize / 2, // Centering adjustments
              marginTop: -logoSize / 2,
            }}
          >
            <img 
              src={logo.src} 
              alt={`${logo.id} logo`} 
              className="w-[65%] h-[65%] object-contain"
            />
          </motion.div>
        );
      })}
    </motion.div>
  );
}
