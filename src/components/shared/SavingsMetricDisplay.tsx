import { TrendingUp, Info } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

interface SavingsMetricDisplayProps {
  amount: number;
  period?: string;
  className?: string;
}

export function SavingsMetricDisplay({ amount, period = "This month", className }: SavingsMetricDisplayProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "glass-panel p-5 relative overflow-hidden group",
        "border-brand-emerald/20 bg-brand-emerald/5",
        className
      )}
    >
      <div className="absolute -right-12 -top-12 w-40 h-40 bg-brand-emerald/10 blur-[50px] rounded-full group-hover:bg-brand-emerald/20 transition-colors duration-500 pointer-events-none" />
      
      <div className="flex items-start justify-between relative z-10">
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <TrendingUp size={14} className="text-brand-emerald" />
            <h4 className="text-[11px] font-semibold tracking-[0.2em] uppercase text-text-secondary">
              RenoCred Savings
            </h4>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-display font-bold text-text-primary tracking-tight">
              ₹{amount.toLocaleString('en-IN')}
            </span>
          </div>
          <p className="text-sm text-text-muted mt-1">{period}</p>
        </div>
        
        <button className="text-text-muted hover:text-text-primary transition-colors" title="How is this calculated?">
          <Info size={16} />
        </button>
      </div>
    </motion.div>
  );
}
