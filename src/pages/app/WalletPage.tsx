import React, { useState, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Zap, FileText, Calculator } from 'lucide-react';
import { PageContainer } from '../../components/shared/PageContainer';
import { cn } from '../../lib/utils';

const WalletOptimizerPanel = lazy(() => import('../../features/finix/components/WalletUpiPanels').then(m => ({ default: m.WalletOptimizerPanel })));
const UpiSimulatorPanel = lazy(() => import('../../features/finix/components/WalletUpiPanels').then(m => ({ default: m.UpiSimulatorPanel })));
const BillTrackerPanel = lazy(() => import('../../features/finix/components/FinixPanels').then(m => ({ default: m.BillTrackerPanel })));
const EmiCalculatorPanel = lazy(() => import('../../features/finix/components/EmiCalculatorPanel').then(m => ({ default: m.EmiCalculatorPanel })));

type WalletTabId = 'optimizer' | 'upi' | 'bills' | 'emi';

const WALLET_TABS: { id: WalletTabId; label: string; icon: typeof CreditCard }[] = [
  { id: 'optimizer', label: 'Optimizer', icon: CreditCard },
  { id: 'upi',       label: 'Pay',       icon: Zap        },
  { id: 'bills',     label: 'Bills',     icon: FileText   },
  { id: 'emi',       label: 'EMI',       icon: Calculator },
];

export default function WalletPage() {
  const [activeTab, setActiveTab] = useState<WalletTabId>('optimizer');

  const WALLET_TAB_INFO: Record<WalletTabId, { title: string; subtitle: string }> = {
    optimizer: { title: 'Wallet Optimizer',  subtitle: 'Best card for every spend category'     },
    upi:       { title: 'UPI Simulator',     subtitle: 'Find the optimal card for any payment'  },
    bills:     { title: 'Bill Tracker',      subtitle: 'Upcoming and overdue bills at a glance' },
    emi:       { title: 'EMI Calculator',    subtitle: 'Plan big purchases & find the best card to convert' },
  };

  return (
    <PageContainer
      title={WALLET_TAB_INFO[activeTab].title}
      subtitle={WALLET_TAB_INFO[activeTab].subtitle}
    >
      <div className="flex gap-1 bg-surface-secondary/60 dark:bg-surface-elevated/30 rounded-2xl p-1 backdrop-blur-sm">
        {WALLET_TABS.map(({ id, label, icon: Icon }) => (
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
                layoutId="wallet-tab-bg"
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

      <div className="surface-card rounded-3xl p-6 md:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'optimizer' && <Suspense fallback={null}><WalletOptimizerPanel /></Suspense>}
            {activeTab === 'upi'       && <Suspense fallback={null}><UpiSimulatorPanel /></Suspense>}
            {activeTab === 'bills'     && <Suspense fallback={null}><BillTrackerPanel /></Suspense>}
            {activeTab === 'emi'       && <Suspense fallback={null}><EmiCalculatorPanel /></Suspense>}
          </motion.div>
        </AnimatePresence>
      </div>
    </PageContainer>
  );
}
