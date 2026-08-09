import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';
import { TrendingUp, type LucideIcon } from 'lucide-react';
import React from 'react';

export function StatPanel({
  label,
  value,
  subtext,
  icon: Icon = TrendingUp,
  iconBg,
  iconColor,
  glowColor,
  children,
}: {
  label: string;
  value: string;
  subtext: string;
  icon?: LucideIcon;
  iconBg: string;
  iconColor: string;
  glowColor?: string;
  children?: React.ReactNode;
}) {
  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={cn(
        'panel-glass rounded-2xl p-5 flex flex-col justify-between h-44',
        'cursor-pointer group',
      )}
      style={glowColor ? {
        boxShadow: `0 2px 12px 0 ${glowColor}`,
      } : undefined}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-text-secondary">{label}</p>
        <div className={cn(
          'w-9 h-9 rounded-xl flex items-center justify-center',
          'transition-transform duration-300 group-hover:scale-110',
          iconBg,
        )}>
          <Icon size={17} strokeWidth={2.2} className={iconColor} />
        </div>
      </div>
      <div>
        <p className="text-3xl font-display font-bold text-text-primary tabular-nums tracking-tight">
          {value}
        </p>
        <p className="text-xs font-medium text-text-muted mt-1">
          {subtext}
        </p>
        {children}
      </div>
    </motion.div>
  );
}
