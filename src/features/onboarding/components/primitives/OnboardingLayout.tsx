import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '../../../../lib/utils';

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
    <div className="relative min-h-[100dvh] w-full flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: '#FAFBF9' }}
    >
      {/* Subtle emerald atmosphere — never overwhelming */}
      <div
        className="absolute top-[-200px] right-[-100px] w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(93,143,116,0.06) 0%, transparent 70%)' }}
      />
      <div
        className="absolute bottom-[-200px] left-[-100px] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(93,143,116,0.04) 0%, transparent 70%)' }}
      />

      {/* Header */}
      <div className="absolute top-0 left-0 w-full px-6 md:px-10 py-6 md:py-8 flex justify-between items-center z-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center"
            style={{ border: '1px solid #E5E7EB' }}
          >
            <img src="/logo.jpg" alt="RenoCred" className="w-full h-full object-cover" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight hidden sm:block"
            style={{ color: '#111827' }}
          >
            renocred
          </span>
        </div>

        {/* Progress — minimal line indicator */}
        {currentStep > 0 && totalSteps > 0 && (
          <div className="flex items-center gap-3 md:gap-4">
            <span className="text-[12px] font-bold tracking-widest"
              style={{ color: '#111827' }}
            >
              {String(currentStep).padStart(2, '0')} <span style={{ color: '#9CA3AF' }}>/ {String(totalSteps).padStart(2, '0')}</span>
            </span>
            <div className="w-16 md:w-24 h-1 bg-[#E5E7EB] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-[#2A9D5C]"
                initial={false}
                animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-[720px] px-6 md:px-10 flex flex-col justify-center min-h-[500px]">
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
