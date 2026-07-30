import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Link2, Sparkles } from 'lucide-react';

const STATUSES = [
  { text: 'Preparing secure workspace', icon: ShieldCheck },
  { text: 'Connecting profile', icon: Link2 },
  { text: 'Creating personalized experience', icon: Sparkles },
];

export function InitializationStep({ onComplete }: { onComplete: () => void }) {
  const [statusIdx, setStatusIdx] = useState(0);

  const stableComplete = useCallback(onComplete, []);

  useEffect(() => {
    const t1 = setTimeout(() => setStatusIdx(1), 800);
    const t2 = setTimeout(() => setStatusIdx(2), 1600);
    const t3 = setTimeout(() => stableComplete(), 2400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [stableComplete]);

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden"
      style={{ backgroundColor: '#050606' }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center z-10 max-w-[400px] px-6 text-center"
      >
        {/* Logo */}
        <div className="w-14 h-14 rounded-2xl overflow-hidden flex items-center justify-center mb-10"
          style={{ border: '1px solid #232626', boxShadow: '0 0 30px rgba(93,143,116,0.08)' }}
        >
          <img src="/logo.jpg" alt="RenoCred" className="w-full h-full object-cover" />
        </div>

        {/* Brand mark */}
        <h1 className="font-display text-2xl font-bold tracking-tight mb-1"
          style={{ color: '#F4F4F2' }}
        >
          TAQDEER
        </h1>
        <p className="text-sm mb-14" style={{ color: '#6E7471' }}>
          Initializing Financial Intelligence
        </p>

        {/* Progress bar */}
        <div className="w-full h-[2px] rounded-full overflow-hidden mb-8"
          style={{ backgroundColor: '#232626' }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: '#5D8F74' }}
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 2.4, ease: [0.4, 0, 0.2, 1] }}
          />
        </div>

        {/* Status text */}
        <AnimatePresence mode="wait">
          <motion.div
            key={statusIdx}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="flex items-center gap-2.5 text-sm"
            style={{ color: '#6E7471' }}
          >
            {React.createElement(STATUSES[statusIdx].icon, { size: 14, strokeWidth: 1.5 })}
            <span>{STATUSES[statusIdx].text}</span>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
