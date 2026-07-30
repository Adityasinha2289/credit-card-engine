import type { Transition } from 'framer-motion';

/**
 * springSnappy: For tactile feedback, hover states, and button presses.
 * Fast, tight, and physical.
 */
export const springSnappy: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 25,
};

/**
 * springSmooth: For elegant, cinematic entrances like text reveals and modal opens.
 * Slower, deliberate, and calm.
 */
export const springSmooth: Transition = {
  type: 'spring',
  stiffness: 80,
  damping: 20,
};

/**
 * springScroll: Tuned specifically for useSpring wrappers around scroll progress.
 * Eliminates jitter while maintaining responsiveness.
 */
export const springScroll = {
  stiffness: 70,
  damping: 25,
  restDelta: 0.001,
};
