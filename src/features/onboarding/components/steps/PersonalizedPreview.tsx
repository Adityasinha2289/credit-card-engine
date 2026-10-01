import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { OnboardingState } from '../../OnboardingFlow';
import { PRIMARY_GOALS_CONFIG } from '../../../../config/goals';

interface PersonalizedPreviewProps {
  state: OnboardingState;
  onComplete: () => void;
}

export function PersonalizedPreview({ state, onComplete }: PersonalizedPreviewProps) {
  const [phase, setPhase] = useState<'transition' | 'preview' | 'finish'>('transition');

  useEffect(() => {
    // 1. Show transition message for 2 seconds
    const t1 = setTimeout(() => {
      setPhase('preview');
    }, 2000);

    // 2. Show preview for 4 seconds, then transition to finish
    const t2 = setTimeout(() => {
      setPhase('finish');
    }, 6000);

    // 3. Auto-complete after showing finish message
    const t3 = setTimeout(() => {
      onComplete();
    }, 8500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  // Format currency
  const formattedSalary = state.salary 
    ? `₹${new Intl.NumberFormat('en-IN').format(state.salary)}` 
    : 'Not provided';
    
  // Get goal config
  const goalConfig = state.goal ? PRIMARY_GOALS_CONFIG[state.goal] : undefined;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden" style={{ backgroundColor: '#050606' }}>
      <AnimatePresence mode="wait">
        
        {/* PHASE 1: TRANSITION */}
        {phase === 'transition' && (
          <motion.div
            key="phase-transition"
            initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center text-center px-6"
          >
            <h2 className="font-display text-3xl md:text-5xl uppercase tracking-tight text-white mb-4">
              Your wallet is ready.
            </h2>
            <div className="w-16 h-1 bg-[#2A9D5C] rounded-full mt-4" />
          </motion.div>
        )}

        {/* PHASE 2: PREVIEW */}
        {phase === 'preview' && (
          <motion.div
            key="phase-preview"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-[340px] md:max-w-[400px] flex flex-col items-center"
          >
            <h3 className="text-xs font-bold tracking-[0.2em] text-[#9CA3AF] uppercase mb-8">
              Your Reno Cred
            </h3>
            
            <div className="w-full bg-[#111827] rounded-3xl p-6 md:p-8 flex flex-col gap-6 shadow-[0_20px_60px_rgba(42,157,92,0.15)] border border-[#1f2937]">
              
              {/* Row 1 */}
              <div className="flex justify-between items-center border-b border-[#1f2937] pb-4">
                <div className="flex flex-col">
                  <span className="text-[10px] text-[#6B7280] uppercase tracking-wider font-bold mb-1">Current Cards</span>
                  <span className="text-xl font-display text-white font-bold">{state.banks?.length || 0}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-[#6B7280] uppercase tracking-wider font-bold mb-1">CIBIL Score</span>
                  <span className="text-xl font-display text-[#2A9D5C] font-bold">{state.creditScore || 'N/A'}</span>
                </div>
              </div>

              {/* Row 2 */}
              <div className="flex flex-col border-b border-[#1f2937] pb-4">
                <span className="text-[10px] text-[#6B7280] uppercase tracking-wider font-bold mb-2">Primary Goal</span>
                <span className="text-base text-white font-bold">
                  {goalConfig?.title || 'Optimize Finances'}
                </span>
              </div>

              {/* Row 3 */}
              <div className="flex flex-col border-b border-[#1f2937] pb-4">
                <span className="text-[10px] text-[#6B7280] uppercase tracking-wider font-bold mb-2">Focus Areas</span>
                <div className="flex flex-wrap gap-2">
                  {state.priorities?.map(p => (
                    <span key={p} className="px-2 py-1 bg-[#1f2937] text-[#D1D5DB] text-[10px] uppercase tracking-wider rounded-md font-bold">
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              {/* Row 4 */}
              <div className="flex justify-between items-end pt-2">
                <div className="flex flex-col">
                  <span className="text-[10px] text-[#6B7280] uppercase tracking-wider font-bold mb-1">Annual Income</span>
                  <span className="text-lg font-bold text-white tracking-tight">{formattedSalary}</span>
                </div>
                <div className="px-3 py-1 bg-[#2A9D5C]/20 text-[#2A9D5C] text-[10px] uppercase font-bold rounded-full">
                  Verified
                </div>
              </div>
              
            </div>
            
            {/* Manual continue button for impatient users */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
              onClick={() => {
                setPhase('finish');
              }}
              className="mt-8 text-xs font-bold text-[#6B7280] uppercase tracking-widest hover:text-white transition-colors"
            >
              Skip
            </motion.button>
          </motion.div>
        )}

        {/* PHASE 3: FINISH */}
        {phase === 'finish' && (
          <motion.div
            key="phase-finish"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center text-center px-6"
          >
            <h2 className="font-display text-4xl md:text-6xl uppercase tracking-tight text-white mb-6">
              Your money <br/><span className="text-[#2A9D5C]">is ready to move.</span>
            </h2>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
