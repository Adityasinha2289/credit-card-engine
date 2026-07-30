import { Plus, ArrowRight } from 'lucide-react';

interface EmptyWalletGuidanceProps {
  onAddCard: () => void;
}

export function EmptyWalletGuidance({ onAddCard }: EmptyWalletGuidanceProps) {
  return (
    <div className="panel-glass rounded-[2rem] p-8 border border-dashed border-canvas-300 dark:border-white/[0.1] flex flex-col items-center justify-center text-center shadow-lg relative overflow-hidden bg-canvas-50 dark:bg-[#1a1d21]">
      <div className="absolute inset-0 bg-brand-500/5 blur-2xl" />
      
      <div className="relative z-10 w-24 h-16 rounded-xl border border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md shadow-xl flex flex-col justify-between p-2.5 mb-6">
        <div className="flex justify-between items-start">
          <div className="w-6 h-1.5 bg-white/20 rounded-full" />
          <div className="w-4 h-2.5 bg-white/30 rounded-sm" />
        </div>
        <div className="w-12 h-1.5 bg-white/20 rounded-full" />
      </div>

      <h3 className="text-xl font-display font-bold text-ink-primary mb-2">Let's build your wallet</h3>
      <p className="text-xs text-ink-tertiary max-w-[200px] mb-6">
        Add your first card to unlock TAQDEER's intelligence and insights.
      </p>

      <button
        onClick={onAddCard}
        className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-bold py-3 px-6 rounded-full shadow-ag-glow-primary transition-all active:scale-95 group"
      >
        <Plus size={16} /> 
        Add First Card
        <ArrowRight size={16} className="ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all -ml-5 group-hover:ml-0" />
      </button>
    </div>
  );
}
