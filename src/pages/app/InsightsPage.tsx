import React, { useState, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Target, ShieldCheck, Zap, FileText } from 'lucide-react';
import { PageContainer } from '../../components/shared/PageContainer';
import { cn } from '../../lib/utils';

const CibilPanel = lazy(() => import('../../features/finix/components/FinixPanels').then(m => ({ default: m.CibilPanel })));
const InsightsPanel = lazy(() => import('../../features/finix/components/FinixPanels').then(m => ({ default: m.InsightsPanel })));
const BudgetingPanel = lazy(() => import('../../features/finix/components/BudgetingPanel').then(m => ({ default: m.BudgetingPanel })));
const MonthlyReport = lazy(() => import('../../features/dashboard/components/MonthlyReport').then(m => ({ default: m.MonthlyReport })));
const CreditScoreSimulator = lazy(() => import('../../features/finix/components/CreditScoreSimulator').then(m => ({ default: m.CreditScoreSimulator })));

type InsightsTabId = 'insights' | 'cibil' | 'budget' | 'report' | 'simulator';

const INSIGHTS_TABS: { id: InsightsTabId; label: string; icon: typeof BarChart3 }[] = [
  { id: 'insights',  label: 'Insights',   icon: BarChart3   },
  { id: 'budget',    label: 'Budget',     icon: Target      },
  { id: 'cibil',     label: 'CIBIL',      icon: ShieldCheck },
  { id: 'simulator', label: 'Simulator',  icon: Zap         },
  { id: 'report',    label: 'Report',     icon: FileText    },
];

export default function InsightsPage() {
  const [activeTab, setActiveTab] = useState<InsightsTabId>('insights');

  return (
    <PageContainer
      title={activeTab === 'insights' ? 'Spend Insights' : activeTab === 'budget' ? 'Category Budgets' : activeTab === 'report' ? 'Monthly Report' : activeTab === 'simulator' ? 'Score Simulator' : 'CIBIL Score'}
      subtitle={activeTab === 'insights' ? 'Smart analysis of your spending patterns' : activeTab === 'budget' ? 'Track your credit health and budgets' : activeTab === 'report' ? 'Detailed breakdown of your monthly spending' : activeTab === 'simulator' ? 'See how your actions impact your credit score' : 'Your credit health report'}
    >
      <div className="flex gap-1 bg-surface-secondary/60 dark:bg-surface-elevated/30 rounded-2xl p-1 backdrop-blur-sm">
        {INSIGHTS_TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn(
              'relative flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200',
              activeTab === id
                ? 'text-text-primary'
                : 'text-text-muted hover:text-text-secondary',
            )}
          >
            {activeTab === id && (
              <motion.div
                layoutId="insights-tab-bg"
                className="absolute inset-0 bg-surface dark:bg-surface-raised shadow-ag-base rounded-xl"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <Icon size={14} />
              {label}
            </span>
          </button>
        ))}
      </div>

      <div className="panel-glass rounded-3xl p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <Suspense fallback={<div className="h-[400px] flex items-center justify-center text-text-muted">Loading panel...</div>}>
              {activeTab === 'insights'  && <InsightsPanel />}
              {activeTab === 'budget'    && <BudgetingPanel />}
              {activeTab === 'cibil'     && <CibilPanel />}
              {activeTab === 'simulator' && <CreditScoreSimulator />}
              {activeTab === 'report'    && <MonthlyReport />}
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </div>
    </PageContainer>
  );
}
