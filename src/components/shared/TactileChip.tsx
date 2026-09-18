import React from 'react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

interface TactileChipProps {
  id: string;
  label: string;
  icon?: React.ReactNode;
  selected: boolean;
  onClick: (id: string) => void;
  className?: string;
}

export function TactileChip({ id, label, icon, selected, onClick, className }: TactileChipProps) {
  return (
    <button
      onClick={() => onClick(id)}
      className={cn(
        'relative px-4 py-3 rounded-2xl flex items-center gap-2 font-bold transition-all duration-200 shadow-sm overflow-hidden text-sm md:text-base border',
        selected
          ? 'bg-brand-emerald text-gray-900 border-brand-emerald scale-[1.02] shadow-[0_4px_20px_rgba(4,59,39,0.3)]'
          : 'bg-surface/85 dark:bg-surface/40 hover:bg-surface-secondary text-text-secondary border-border-subtle',
        className
      )}
    >
      {selected && (
        <motion.div 
          layoutId="chip-active" 
          className="absolute inset-0 bg-white/20 pointer-events-none" 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
        />
      )}
      {icon && <span className={cn('z-10', selected ? 'text-gray-900' : 'text-text-muted')}>{icon}</span>}
      <span className="z-10">{label}</span>
    </button>
  );
}
