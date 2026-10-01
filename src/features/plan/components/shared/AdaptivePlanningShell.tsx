import React, { useEffect, useState } from 'react';
import { PageContainer } from '../../../../components/shared/PageContainer';
import { useIsDemo } from '../../../demo/DemoAppProvider';
import { Database, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PlanSession } from '../../types';

interface AdaptivePlanningShellProps {
  session: PlanSession;
  totalPhases?: number;
  children: React.ReactNode;
  taqdeerContext?: string;
  onBack?: () => void;
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

export function AdaptivePlanningShell({ 
  session, 
  totalPhases = 4, 
  children,
  taqdeerContext,
  onBack 
}: AdaptivePlanningShellProps) {
  const isDemo = useIsDemo();
  const currentPhase = session.currentPhase;
  const [prevPhase, setPrevPhase] = useState(currentPhase);
  const direction = currentPhase > prevPhase ? 1 : currentPhase < prevPhase ? -1 : 0;

  useEffect(() => {
    setPrevPhase(currentPhase);
  }, [currentPhase]);

  return (
    <PageContainer hideHeader className="max-w-3xl mx-auto flex flex-col pt-6 pb-safe relative">
      
      {/* Demo Indicator */}
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
            {String(currentPhase).padStart(2, '0')}
          </span>
          <span className="text-sm font-medium text-gray-400">/ {String(totalPhases).padStart(2, '0')}</span>
        </div>
        {onBack && (
          <button onClick={onBack} className="text-sm font-medium text-gray-400 hover:text-gray-900 transition-colors">
            Back
          </button>
        )}
      </div>

      {/* Taqdeer Context Snippet */}
      {taqdeerContext && (
        <div className="px-4 md:px-0 mb-6 z-10 relative">
          <div className="flex items-start gap-3 bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50 text-blue-900">
            <div className="mt-0.5"><Bot className="w-4 h-4 text-blue-500" /></div>
            <p className="text-sm font-medium leading-snug">{taqdeerContext}</p>
          </div>
        </div>
      )}

      <div className="flex-1 relative w-full h-full px-4 md:px-0">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={children ? (children as any).key || currentPhase : currentPhase}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            className="pb-8 min-h-[50vh] flex flex-col"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </PageContainer>
  );
}
