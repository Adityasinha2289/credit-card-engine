/**
 * Reni's mark: a speech bubble with a lowercase "r", drawn in the same rounded
 * strokes as the RenoCred "R" so the assistant reads as part of the brand.
 * `tone` is the bubble: pistachio on dark surfaces, ink on light ones.
 */
import { cn } from '../../../lib/utils';

const TONES = {
  pistachio: { bubble: '#E3EED4', glyph: '#0F2A1D' },
  ink: { bubble: '#0F2A1D', glyph: '#E3EED4' },
  forest: { bubble: '#375534', glyph: '#E3EED4' },
} as const;

export function ReniMark({ size = 32, tone = 'ink', className }: { size?: number; tone?: keyof typeof TONES; className?: string }) {
  const t = TONES[tone];
  return (
    <svg aria-hidden viewBox="0 0 40 40" width={size} height={size} className={cn('shrink-0', className)} fill="none">
      {/* bubble: a soft square with its tail at the lower left */}
      <path d="M12 3h16a9 9 0 0 1 9 9v12a9 9 0 0 1-9 9H14.5l-6.2 4.6c-.8.6-1.9 0-1.8-1l.4-4.3A9 9 0 0 1 3 24V12a9 9 0 0 1 9-9Z" fill={t.bubble} />
      {/* the r: a stem and a shoulder that rolls over to the right */}
      <path d="M15.5 25.5V17.5" stroke={t.glyph} strokeWidth="4.2" strokeLinecap="round" />
      <path d="M15.5 19.2c0-3 2.3-4.7 5.4-4.7h2.6" stroke={t.glyph} strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" />
      {/* a dot, the way a message ends */}
      <circle cx="27.6" cy="24.6" r="2.3" fill={t.glyph} />
    </svg>
  );
}
