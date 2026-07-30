import { motion, useReducedMotion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';
import { forwardRef } from 'react';
import { interactivePrimary, interactiveSecondary } from '../gestures';

export interface MotionButtonProps extends HTMLMotionProps<"button"> {
  intent?: 'primary' | 'secondary';
}

export const MotionButton = forwardRef<HTMLButtonElement, MotionButtonProps>(
  ({ children, intent = 'primary', whileHover, whileTap, ...props }, ref) => {
    const shouldReduceMotion = useReducedMotion();

    const baseGestures = intent === 'primary' ? interactivePrimary : interactiveSecondary;

    // If reduced motion is preferred, disable the scale effects
    const activeHover = shouldReduceMotion ? undefined : (whileHover || baseGestures.hover);
    const activeTap = shouldReduceMotion ? undefined : (whileTap || baseGestures.tap);

    return (
      <motion.button
        ref={ref}
        whileHover={activeHover}
        whileTap={activeTap}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);

MotionButton.displayName = 'MotionButton';
