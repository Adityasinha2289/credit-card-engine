import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Zap, Building2, CreditCard, Sparkles, Check } from 'lucide-react';

const STATUSES = [
  { text: 'Analyzing lifestyle', icon: Compass },
  { text: 'Connecting recommendation engine', icon: Zap },
  { text: 'Preparing merchants', icon: Building2 },
  { text: 'Building wallet intelligence', icon: CreditCard },
  { text: 'Finalizing dashboard', icon: Sparkles },
];

export function FinalLoadingStep() {
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const intervals = [700, 1400, 2100, 2800];
    const timers = intervals.map((time, i) =>
      setTimeout(() => setActiveIdx(i + 1), time)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="relative min-h-[100dvh] w-full flex flex-col items-center justify-center overflow-hidden"
      style={{ backgroundColor: '#050606' }}
    >
      {/* Subtle glow */}
      <div className="absolute w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(93,143,116,0.06) 0%, transparent 70%)' }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center z-10 max-w-[400px] px-6 text-center"
      >
        <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight mb-14"
          style={{ color: '#F4F4F2' }}
        >
          Building your financial profile
        </h1>

        {/* Progress bar */}
        <div className="w-full h-[2px] rounded-full overflow-hidden mb-12"
          style={{ backgroundColor: '#232626' }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: '#5D8F74' }}
            initial={{ width: '0%' }}
            animate={{ width: `${((activeIdx + 1) / STATUSES.length) * 100}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>

        {/* Status list */}
        <div className="flex flex-col gap-5 w-full text-left">
          {STATUSES.map((status, idx) => {
            const isActive = idx === activeIdx;
            const isCompleted = idx < activeIdx;

            return (
              <motion.div
                key={status.text}
                initial={false}
                animate={{
                  opacity: isActive ? 1 : (isCompleted ? 0.4 : 0.15),
                  x: isActive ? 4 : 0,
                }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-3"
              >
                {isCompleted ? (
                  <div className="w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(93,143,116,0.2)' }}
                  >
                    <Check size={11} strokeWidth={3} style={{ color: '#5D8F74' }} />
                  </div>
                ) : (
                  <status.icon size={16} strokeWidth={1.5}
                    style={{ color: isActive ? '#5D8F74' : '#6E7471' }}
                  />
                )}
                <span className="text-sm font-medium"
                  style={{ color: isActive ? '#F4F4F2' : '#6E7471' }}
                >
                  {status.text}
                </span>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
