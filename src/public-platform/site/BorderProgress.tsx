/**
 * A line that runs once around a pill's border, as a countdown ("this tab moves
 * on when the line closes"). Put it inside a relatively positioned pill and pass
 * its corner radius (half its height); change its `key` to restart it.
 */
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export function BorderProgress({ duration, radius, className, color = '#375534', width = 2 }: {
  duration: number;
  /** the pill's corner radius in px: half its height */
  radius: number;
  className?: string;
  color?: string;
  width?: number;
}) {
  return (
    <svg aria-hidden className={cn('pointer-events-none absolute inset-0 h-full w-full overflow-visible', className)}>
      {/* drawn on the element's edge, so the line sits on the border; runs clockwise from the top left */}
      <motion.rect
        x="0"
        y="0"
        width="100%"
        height="100%"
        rx={radius}
        ry={radius}
        fill="none"
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray="1 1"
        initial={{ strokeDashoffset: 1 }}
        animate={{ strokeDashoffset: 0 }}
        transition={{ duration, ease: 'linear' }}
      />
    </svg>
  );
}
