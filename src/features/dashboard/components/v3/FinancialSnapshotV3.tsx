import { Activity, ShieldCheck, Trophy, CreditCard } from 'lucide-react';
import type { FinancialHealthState } from '../../../../features/financial-health';
import type { LedgerSummary } from '../../../../features/financial-ledger';
import type { LedgerEntry } from '../../../../features/financial-ledger';

interface FinancialSnapshotV3Props {
  health: FinancialHealthState;
  ledgerSummary: LedgerSummary;
  recentWin: LedgerEntry | null;
}

export function FinancialSnapshotV3({ health, ledgerSummary }: FinancialSnapshotV3Props) {
  return (
    <div className="panel-glass rounded-[2rem] p-6 border border-canvas-200/50 dark:border-white/[0.05] shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-display font-bold text-ink-primary flex items-center gap-2">
          <Activity size={20} className="text-brand-500" />
          Financial Snapshot
        </h3>
      </div>

      <div className="flex flex-col gap-3">
        {/* Credit Score */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-canvas-50 dark:bg-white/[0.02] border border-canvas-200/50 dark:border-white/[0.04]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-500/10 text-brand-500 flex items-center justify-center shrink-0">
              <ShieldCheck size={16} />
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-wider uppercase text-ink-tertiary">Credit Health</p>
              <p className="text-sm font-bold text-ink-primary mt-0.5">Excellent</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-display font-bold text-brand-500">{health.score}</p>
          </div>
        </div>

        {/* Optimisation Score */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-canvas-50 dark:bg-white/[0.02] border border-canvas-200/50 dark:border-white/[0.04]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-profit/10 text-profit flex items-center justify-center shrink-0">
              <Trophy size={16} />
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-wider uppercase text-ink-tertiary">Optimisation</p>
              <p className="text-sm font-bold text-ink-primary mt-0.5">Wallet Score</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-display font-bold text-profit">94%</p>
          </div>
        </div>

        {/* Reward Health */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-canvas-50 dark:bg-white/[0.02] border border-canvas-200/50 dark:border-white/[0.04]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
              <CreditCard size={16} />
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-wider uppercase text-ink-tertiary">Total Rewards</p>
              <p className="text-sm font-bold text-ink-primary mt-0.5">Lifetime Value</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-display font-bold text-indigo-500">{ledgerSummary.totalRewards.toLocaleString('en-IN')}</p>
          </div>
        </div>

      </div>
    </div>
  );
}
