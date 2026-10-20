/**
 * The onboarding frame, on the site's dark forest: the logo and a three-part
 * progress line at the top, the question on the left, and on wide screens a
 * panel on the right that fills in with what RenoCred has learned. On phones
 * that panel sits under the question and the actions stay pinned to the bottom.
 */
import type { ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Wordmark } from '../../../../public-platform/site/Brand';
import { EASE_OUT } from '../../../../public-platform/site/primitives';
import { cn } from '../../../../lib/utils';

export function OnboardingLayout({ step, total, direction, onBack, aside, footer, children }: {
  /** 0-based; `total` and beyond is the closing screen (no progress shown) */
  step: number;
  total: number;
  direction: number;
  onBack?: () => void;
  aside?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}) {
  const reduce = useReducedMotion();
  const asking = step < total;
  return (
    <div className="relative min-h-[100dvh] overflow-x-hidden bg-rc-night text-rc-cream selection:bg-rc-pistachio selection:text-rc-ink">
      <div aria-hidden className="pointer-events-none absolute -left-[20%] -top-[30%] h-[720px] w-[900px] rounded-full bg-[radial-gradient(closest-side,rgba(227,238,212,0.08),transparent)]" />

      <header className="sticky top-0 z-30 bg-rc-night/95">
        <div className="mx-auto flex h-16 max-w-[1120px] items-center justify-between gap-4 px-5 lg:h-20 lg:px-10">
          <Wordmark dark compact />
          {asking && (
            <div className="flex items-center gap-3" aria-label={`Question ${step + 1} of ${total}`}>
              <span className="hidden text-[12px] font-medium tabular-nums text-rc-mist sm:inline">{step + 1} of {total}</span>
              <span className="flex gap-1.5" aria-hidden>
                {Array.from({ length: total }, (_, i) => (
                  <span key={i} className="relative h-[3px] w-8 overflow-hidden rounded-full bg-white/[0.12] sm:w-10">
                    <motion.span
                      className="absolute inset-0 origin-left rounded-full bg-rc-pistachio"
                      initial={false}
                      animate={{ scaleX: i <= step ? 1 : 0 }}
                      transition={{ duration: reduce ? 0 : 0.5, ease: EASE_OUT }}
                    />
                  </span>
                ))}
              </span>
            </div>
          )}
        </div>
      </header>

      <main className={cn('relative mx-auto grid max-w-[1120px] gap-10 px-5 pb-36 pt-4 lg:gap-16 lg:px-10 lg:pb-20 lg:pt-10', aside && 'lg:grid-cols-[minmax(0,1fr)_380px]')}>
        <div className="min-w-0">
          {onBack && (
            <button type="button" onClick={onBack} className="-ml-1 mb-4 inline-flex items-center gap-1.5 rounded-full px-1 py-1 text-[13px] font-medium text-rc-mist transition-colors hover:text-rc-cream">
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
          )}
          <AnimatePresence mode="wait" initial={false} custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              initial={reduce ? false : { opacity: 0, x: direction * 28 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, x: direction * -20 }}
              transition={{ duration: 0.32, ease: EASE_OUT }}
            >
              {children}
              {aside && <div className="mt-8 lg:hidden">{aside}</div>}
            </motion.div>
          </AnimatePresence>
          {footer && (
            <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-rc-night/95 px-5 pb-[calc(12px+env(safe-area-inset-bottom))] pt-3 lg:static lg:mt-10 lg:border-0 lg:bg-transparent lg:p-0">
              {footer}
            </div>
          )}
        </div>
        {aside && (
          <aside className="hidden lg:block">
            <div className="sticky top-28">{aside}</div>
          </aside>
        )}
      </main>
    </div>
  );
}

/** The main action: the site's cream pill. */
export function NextButton({ children, onClick, disabled, busy, className }: { children: ReactNode; onClick: () => void; disabled?: boolean; busy?: boolean; className?: string }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled || busy}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-rc-cream px-7 text-[15px] font-semibold text-rc-ink transition-[background-color,opacity] duration-300 hover:bg-white disabled:opacity-40 lg:w-auto',
        className,
      )}
    >
      {children}
    </motion.button>
  );
}
