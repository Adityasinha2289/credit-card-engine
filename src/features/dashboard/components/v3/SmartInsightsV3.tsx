import { AlertCircle, ArrowRight } from 'lucide-react';
import type { SmartAlert } from '../../../../features/notifications';

interface SmartInsightsV3Props {
  alert: SmartAlert | null;
}

export function SmartInsightsV3({ alert }: SmartInsightsV3Props) {
  if (!alert) {
    return null; // Return null if there are no actionable insights to keep the UI clean
  }

  return (
    <div className="panel-glass rounded-3xl p-6 border border-canvas-200/50 dark:border-white/[0.05] shadow-lg flex flex-col justify-between h-full bg-gradient-to-b from-surface to-canvas-50 dark:to-white/[0.02]">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle size={16} className="text-caution" />
          <span className="text-[10px] font-extrabold tracking-widest text-ink-tertiary uppercase">Smart Insight</span>
        </div>
        
        <h3 className="text-lg font-bold text-ink-primary leading-tight mb-2">
          {alert.title}
        </h3>
        <p className="text-sm text-ink-secondary leading-relaxed">
          {alert.message}
        </p>
      </div>

      <button className="flex items-center justify-between w-full mt-6 pt-4 border-t border-canvas-200/50 dark:border-white/[0.05] group">
        <span className="text-xs font-bold text-brand-500 uppercase tracking-wider">{alert.action}</span>
        <ArrowRight size={16} className="text-brand-500 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
}
