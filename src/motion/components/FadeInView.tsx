import { motion, useReducedMotion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';
import { ReactNode } from 'react';
import { fadeUpVariant } from '../variants';
import { revealOptions } from '../viewport';

export interface FadeInViewProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  delay?: number;
}

export function FadeInView({ children, delay = 0, variants, viewport, ...props }: FadeInViewProps) {
  const shouldReduceMotion = useReducedMotion();

  const activeVariants = variants || fadeUpVariant;
  
  // If reduced motion is enabled, fallback to immediate show
  const initial = shouldReduceMotion ?"show" :"hidden";

  // If there's a custom delay, we need to create a custom variant
  const finalVariants = delay && !shouldReduceMotion ? {
    ...activeVariants,
    show: {
      ...activeVariants.show,
      transition: {
        ...(activeVariants.show as any)?.transition,
        delay,
      }
    }
  } : activeVariants;

  return (
    <motion.div
      initial={initial}
      whileInView="show"
      viewport={viewport || revealOptions}
      variants={finalVariants}
      {...props}
    >
      {children}
    </motion.div>
  );
}
