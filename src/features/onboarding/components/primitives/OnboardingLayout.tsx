import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Wordmark } from '../../../../public-platform/site/Brand';

interface OnboardingLayoutProps {
  children: React.ReactNode;
  stepKey: string;
  currentStep: number;
  totalSteps: number;
  direction?: number;
}

export function OnboardingLayout({ children, stepKey, currentStep, totalSteps, direction = 1 }: OnboardingLayoutProps) {
  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 30 : -30,
      opacity: 0,
      scale: 0.98,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -30 : 30,
      opacity: 0,
      scale: 0.98,
    }),
  };
  return (
    <div className="relative flex min-h-[100dvh] w-full justify-center overflow-hidden bg-rc-cream text-rc-ink">
      <div aria-hidden className="pointer-events-none absolute -right-[160px] -top-[220px] h-[640px] w-[640px] rounded-full bg-[radial-gradient(closest-side,rgba(227,238,212,0.9),transparent)]" />
      <div aria-hidden className="pointer-events-none absolute -bottom-[240px] -left-[160px] h-[560px] w-[560px] rounded-full bg-[radial-gradient(closest-side,rgba(174,195,176,0.35),transparent)]" />

      {/* Header */}
      <div className="absolute left-0 top-0 z-50 flex w-full items-center justify-between px-6 py-6 md:px-10 md:py-8">
        <Wordmark dark={false} />

        {currentStep > 0 && totalSteps > 0 && (
          <div className="flex items-center gap-3 md:gap-4">
            <span className="text-[12px] font-semibold tabular-nums tracking-[0.16em] text-rc-ink">
              {String(currentStep).padStart(2, '0')} <span className="text-rc-ink/40">/ {String(totalSteps).padStart(2, '0')}</span>
            </span>
            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-rc-ink/10 md:w-24">
              <motion.div
                className="h-full rounded-full bg-rc-forest"
                initial={false}
                animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Main content */}
      {/* top-aligned under the header, so tall steps never slide beneath it */}
      <div className="relative z-10 flex w-full max-w-[720px] flex-col px-6 pb-16 pt-28 md:px-10 md:pt-36">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={stepKey}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="w-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
