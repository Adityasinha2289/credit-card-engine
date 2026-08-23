import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '../../../../lib/utils';

interface OnboardingLayoutProps {
  children: React.ReactNode;
  stepKey: string;
  currentStep: number;
  totalSteps: number;
}

export function OnboardingLayout({ children, stepKey, currentStep, totalSteps }: OnboardingLayoutProps) {
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
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-medium tracking-wide"
              style={{ color: '#6B7280' }}
            >
              {currentStep} of {totalSteps}
            </span>
            <div className="flex gap-1.5">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <motion.div
                  key={i}
                  className="h-[3px] rounded-full"
                  initial={false}
                  animate={{
                    width: i + 1 <= currentStep ? 24 : 12,
                    backgroundColor: i + 1 <= currentStep ? '#2A9D5C' : '#E5E7EB',
                  }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-[720px] px-6 md:px-10 flex flex-col justify-center min-h-[500px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={stepKey}
            initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="w-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
