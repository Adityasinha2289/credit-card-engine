import { springSnappy } from './springs';

/**
 * Primary tactile button physics.
 * Spread these into the `whileHover` and `whileTap` props of a <motion.button>.
 */
export const interactivePrimary = {
  hover: { scale: 1.02, transition: springSnappy },
  tap: { scale: 0.98, transition: springSnappy }
};

/**
 * Secondary interactions for ghost buttons, icons, or minor actions.
 */
export const interactiveSecondary = {
  hover: { scale: 1.01, transition: springSnappy },
  tap: { scale: 0.99, transition: springSnappy }
};
