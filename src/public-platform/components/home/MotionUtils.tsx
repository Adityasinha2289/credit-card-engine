import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion, useSpring, useTransform, useScroll } from 'framer-motion';

// Number Counter
export function NumberCounter({ from, to, delay = 0 }: { from: number, to: number, delay?: number }) {
  const reducedMotion = useReducedMotion();
  const [count, setCount] = useState(reducedMotion ? to : from);

  useEffect(() => {
    if (reducedMotion) return;
    const timeout = setTimeout(() => {
      let current = from;
      const step = Math.max(1, Math.floor((to - from) / 20));
      const interval = setInterval(() => {
        current += step;
        if (current >= to) {
          setCount(to);
          clearInterval(interval);
        } else {
          setCount(current);
        }
      }, 30);
      return () => clearInterval(interval);
    }, delay * 1000);
    return () => clearTimeout(timeout);
  }, [from, to, delay, reducedMotion]);

  return <>{count.toLocaleString('en-IN')}</>;
}

// Floating Object
export function FloatingObject({ 
  children, 
  className, 
  delay = 0, 
  yOffset = 15,
  rotation = 10,
  duration = 4
}: { 
  children: React.ReactNode, 
  className?: string, 
  delay?: number,
  yOffset?: number,
  rotation?: number,
  duration?: number
}) {
  const reducedMotion = useReducedMotion();
  
  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.5, rotate: 0 }}
      animate={{ opacity: 1, scale: 1, rotate: rotation }}
      transition={{ delay, type: 'spring', stiffness: 200, damping: 15 }}
    >
      <motion.div
        animate={{ y: [0, -yOffset, 0], rotate: [rotation, rotation + 5, rotation] }}
        transition={{ repeat: Infinity, duration, ease: "easeInOut", delay }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
