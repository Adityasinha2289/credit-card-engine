import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface GlobalTaqdeerButtonProps {
  onClick: () => void;
  isOpen: boolean;
}

export function GlobalTaqdeerButton({ onClick, isOpen }: GlobalTaqdeerButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
      <AnimatePresence>
        {isHovered && !isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="bg-surface-elevated border border-border-subtle px-3 py-1.5 rounded-lg shadow-ag-modal text-xs font-semibold text-text-primary hidden sm:block"
          >
            Ask Taqdeer
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label="Open Taqdeer"
        className={cn(
          "w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300",
          "bg-surface-elevated border border-border-subtle shadow-ag-base",
          "hover:border-brand-emerald/50 hover:shadow-ag-glow-primary",
          isOpen ? "bg-brand-emerald/10 border-brand-emerald/30 text-brand-emerald" : "text-text-primary"
        )}
      >
        <Sparkles size={24} className={isOpen ? "text-brand-emerald" : ""} />
      </button>
    </div>
  );
}
