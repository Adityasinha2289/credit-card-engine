import React from 'react';
import { cn } from '../../../lib/utils';

interface GlobalTaqdeerButtonProps {
  onClick: () => void;
  isOpen: boolean;
}

export function GlobalTaqdeerButton({ onClick, isOpen }: GlobalTaqdeerButtonProps) {
  return (
    <div className="fixed bottom-[88px] lg:bottom-6 right-4 lg:right-6 z-[100] flex items-center justify-center">
      <button
        onClick={onClick}
        aria-label="Open Taqdeer"
        className={cn(
          "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300",
          "bg-semantic-surface-elevated border shadow-ag-card",
          "hover:border-semantic-border-intelligence hover:shadow-ag-glow-primary hover:-translate-y-0.5",
          isOpen ? "border-semantic-brand text-semantic-brand" : "border-semantic-border-subtle text-semantic-text-primary"
        )}
      >
        <span className="font-display font-bold text-lg tracking-tighter">R</span>
      </button>
    </div>
  );
}
