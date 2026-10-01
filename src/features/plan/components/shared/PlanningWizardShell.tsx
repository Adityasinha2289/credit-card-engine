import React, { useEffect, useState } from 'react';
import { PageContainer } from '../../../../components/shared/PageContainer';
import { useIsDemo } from '../../../demo/DemoAppProvider';
import { Database } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PlanningWizardShellProps {
  currentStep: number;
  totalSteps: number;
  children: React.ReactNode;
}

const variants = {
  enter: (direction: number) => {
    return {
      x: direction > 0 ? 50 : -50,
      opacity: 0
    };
  },
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => {
    return {
      zIndex: 0,
      x: direction < 0 ? 50 : -50,
      opacity: 0
    };
  }
};

export function PlanningWizardShell({ currentStep, totalSteps, children }: PlanningWizardShellProps) {
  const isDemo = useIsDemo();
  const [prevStep, setPrevStep] = useState(currentStep);
  const direction = currentStep > prevStep ? 1 : currentStep < prevStep ? -1 : 0;

  useEffect(() => {
    setPrevStep(currentStep);
  }, [currentStep]);

  return (
    <PageContainer hideHeader className="max-w-3xl mx-auto h-[100dvh] flex flex-col pt-6 pb-safe relative overflow-hidden">
      
      {/* Demo Indicator override (if needed inside shell) */}
      {isDemo && (
        <div className="absolute top-6 right-6 hidden md:flex items-center gap-2 text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-full z-10 pointer-events-none">
          <Database className="w-3.5 h-3.5" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Demo Provider</span>
        </div>
      )}

      {/* Header / Progress */}
      <div className="flex items-center justify-between mb-8 shrink-0 px-4 md:px-0 z-10 relative">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
            {String(currentStep).padStart(2, '0')}
          </span>
          <span className="text-sm font-medium text-gray-400">/ {String(totalSteps).padStart(2, '0')}</span>
        </div>
      </div>

      <div className="flex-1 relative w-full h-full px-4 md:px-0">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentStep}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            className="absolute inset-0 pb-8 overflow-y-auto hide-scrollbar"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </PageContainer>
  );
}
