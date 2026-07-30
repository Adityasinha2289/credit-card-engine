import { History, CheckCircle2 } from 'lucide-react';
import type { Transaction } from '../../types/dashboard.types';
import type { FinixCard } from '../../../../features/finix/data/cardDataset';

function formatRelativeTime(dateString: string) {
  const diff = Date.now() - new Date(dateString).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return new Date(dateString).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

interface RecentDecisionsV3Props {
  transactions: Transaction[];
  userCards: FinixCard[];
}

export function RecentDecisionsV3({ transactions, userCards }: RecentDecisionsV3Props) {
  // We only want the 3 most recent transactions to show as"Decisions"
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  if (recentTransactions.length === 0) {
    return null;
  }

  return (
    <div className="panel-glass rounded-3xl p-6 border border-border-subtle  shadow-lg flex flex-col justify-between h-full bg-gradient-to-b from-surface to-canvas-50 dark:to-white/[0.02]">
      <div className="flex items-center gap-2 mb-6">
        <History size={16} className="text-text-muted" />
        <span className="text-[10px] font-extrabold tracking-widest text-text-muted uppercase">Recent Decisions</span>
      </div>
      
      <div className="flex flex-col gap-6 relative">
        <div className="absolute left-[9px] top-2 bottom-4 w-px bg-surface-secondary dark:bg-white/10" />
        
        {recentTransactions.map((tx) => {
          const card = userCards.find((c) => c.id === tx.cardId);
          // Mocking savings based on a 2% base reward rate for illustration of a"Smart Decision"
          const estimatedSavings = Math.round((tx.amount / 100) * 0.02);
          const isSmart = estimatedSavings > 0;

          return (
            <div key={tx.id} className="relative pl-8">
              <div className="absolute left-0 top-1 w-[19px] h-[19px] rounded-full bg-surface dark:bg-[#1a1d21] border-2 border-brand-emerald flex items-center justify-center shadow-sm">
                <div className="w-2 h-2 rounded-full bg-brand-emerald" />
              </div>
              
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold text-text-muted uppercase">
                    {formatRelativeTime(tx.date)}
                  </span>
                </div>
                
                <h4 className="text-sm font-bold text-text-primary mb-0.5">
                  {tx.merchant}
                </h4>
                
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                  <span className="text-xs text-text-secondary">
                    Used <span className="font-semibold text-text-primary">{card?.label || 'Credit Card'}</span>
                  </span>
                  {isSmart && (
                    <div className="flex items-center gap-1 text-profit">
                      <CheckCircle2 size={12} />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Saved ₹{estimatedSavings}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
