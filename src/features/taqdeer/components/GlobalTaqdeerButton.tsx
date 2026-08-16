import React, { useState } from 'react';
import { cn } from '../../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface GlobalTaqdeerButtonProps {
  onClick: () => void;
  isOpen: boolean;
}

export function GlobalTaqdeerButton({ onClick, isOpen }: GlobalTaqdeerButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="fixed bottom-[88px] lg:bottom-6 right-4 lg:right-6 z-[100] flex items-center justify-center">
      <div 
        className="relative flex items-center justify-center"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <AnimatePresence>
          {isHovered && !isOpen && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="absolute right-[calc(100%+16px)] px-3 py-1.5 rounded-lg bg-[#050806] border border-white/[0.05] shadow-xl pointer-events-none"
            >
              <span className="text-[11px] font-medium text-white whitespace-nowrap">Ask Taqdeer</span>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Breathing emerald backdrop when idle */}
        {!isOpen && (
          <div className="absolute inset-0 rounded-2xl bg-[#237E45]/20 blur-md animate-[pulse_4s_ease-in-out_infinite]" />
        )}

        <button
          onClick={onClick}
          aria-label="Open Taqdeer"
          className={cn(
            "relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300",
            "bg-[#07120D] border border-white/[0.05] shadow-lg",
            "hover:border-[#237E45]/50 hover:bg-[#0A2418] hover:-translate-y-0.5",
            isOpen ? "border-[#237E45] text-[#237E45]" : "text-white/90"
          )}
        >
          <img src="/taqdeer-logo.png" alt="Taqdeer AI" className="w-full h-full object-cover rounded-2xl" />
        </button>
      </div>
    </div>
  );
}
