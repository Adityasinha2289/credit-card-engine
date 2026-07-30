import type { Variants } from 'framer-motion';
import { springSmooth } from './springs';

/**
 * Orchestrates child animations with a slight delay.
 */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

/**
 * Standard cinematic fade up (y: 20 to y: 0)
 */
export const fadeUpVariant: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: springSmooth,
  },
};

/**
 * Standard fade down
 */
export const fadeDownVariant: Variants = {
  hidden: { opacity: 0, y: -20 },
  show: {
    opacity: 1,
    y: 0,
    transition: springSmooth,
  },
};

/**
 * Simple fade (no translation, pure opacity)
 */
export const fadeVariant: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
};

/**
 * Subtle scale in (useful for modals, cards)
 */
export const scaleInVariant: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  show: {
    opacity: 1,
    scale: 1,
    transition: springSmooth,
  },
};
