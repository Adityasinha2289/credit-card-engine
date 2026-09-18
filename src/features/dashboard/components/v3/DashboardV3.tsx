import { Suspense, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDashboardStore } from '../../store/dashboardStore';
import { useFinancialLedger } from '../../../financial-ledger';
import { useFinancialHealth } from '../../../financial-health';
import { useTaqdeerDecision } from '../../../taqdeer';
import { useNotificationEngine } from '../../../notifications';
import { useCardIntelligence } from '../../../card-intelligence';
import AddCardModal from '../AddCardModal';

// V3 Sub-components (to be implemented)
import { DashboardHeroV3 } from './DashboardHeroV3';
import { QuickAskTaqdeer } from './QuickAskTaqdeer';
import { SmartRecommendationV3 } from './SmartRecommendationV3';
import { WalletSnapshotV3 } from './WalletSnapshotV3';
import { SmartInsightsV3 } from './SmartInsightsV3';
import { RecentDecisionsV3 } from './RecentDecisionsV3';
import { FinancialSnapshotV3 } from './FinancialSnapshotV3';

export function DashboardV3() {
  const profile = useDashboardStore((s) => s.profile);
  const userCards = useDashboardStore((s) => s.userCards);
  const creditAccounts = useDashboardStore((s) => s.creditAccounts);
  const activeCardId = useDashboardStore((s) => s.activeCardId);
  const setActiveCardId = useDashboardStore((s) => s.setActiveCardId);
  const transactions = useDashboardStore((s) => s.transactions);

  // Engines
  const { highestPriorityAlert } = useNotificationEngine();
  const { health } = useFinancialHealth(profile);
  const { summary: ledgerSummary, recentHistory } = useFinancialLedger();
  const recentWin = recentHistory.length > 0 ? recentHistory[0] : null;
  const { decision } = useTaqdeerDecision(profile);
  const { featuredCard } = useCardIntelligence(userCards);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="max-w-[1200px] mx-auto flex flex-col gap-8 pb-20">
      
      {/* Hero Section */}
      <DashboardHeroV3 
        profile={profile} 
        ledgerSummary={ledgerSummary} 
      />

      {/* Main Layout - 3 Tier Hierarchy */}
      <div className="flex flex-col gap-10 items-stretch max-w-[1000px] mx-auto w-full">
        
        {/* TIER 1: PRIMARY ACTION / RECOMMENDATION */}
        <section className="w-full animate-[fade-in-up_0.4s_ease-out_forwards]">
          <div className="mb-4">
            <h2 className="text-sm font-bold tracking-[0.15em] text-text-muted uppercase">What Should I Do Today?</h2>
          </div>
          <SmartRecommendationV3 decision={decision} featuredCard={featuredCard} />
        </section>

        {/* TIER 2: SECONDARY - WALLET / OPTIMIZER */}
        <section className="w-full animate-[fade-in-up_0.5s_ease-out_forwards]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold tracking-[0.15em] text-text-muted uppercase">Your Wallet</h2>
            <button 
              onClick={() => setShowAddModal(true)}
              className="text-xs font-bold text-brand-emerald hover:text-brand-400 transition-colors uppercase tracking-wider"
            >
              + Add Card
            </button>
          </div>
          <WalletSnapshotV3 
            userCards={userCards} 
            creditAccounts={creditAccounts} 
            activeCardId={activeCardId}
            setActiveCardId={setActiveCardId}
            onAddCard={() => setShowAddModal(true)}
          />
        </section>

        {/* TIER 3: TERTIARY - METRICS, TRANSACTIONS, HEALTH */}
        <section className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 animate-[fade-in-up_0.6s_ease-out_forwards]">
          <div className="flex flex-col gap-8">
            <FinancialSnapshotV3 
              health={health} 
              ledgerSummary={ledgerSummary} 
              recentWin={recentWin} 
            />
          </div>
          <div className="flex flex-col gap-8">
            <RecentDecisionsV3 transactions={transactions} userCards={userCards} />
            <SmartInsightsV3 alert={highestPriorityAlert} />
          </div>
        </section>

      </div>

      {/* Dynamic Searchable Add Card Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <Suspense fallback={null}>
              <AddCardModal onClose={() => setShowAddModal(false)} />
            </Suspense>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
