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

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column (Primary Focus) */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          <QuickAskTaqdeer />
          <SmartRecommendationV3 decision={decision} featuredCard={featuredCard} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <SmartInsightsV3 alert={highestPriorityAlert} />
            <RecentDecisionsV3 transactions={transactions} userCards={userCards} />
          </div>
        </div>

        {/* Right Column (Secondary / Context) */}
        <aside className="lg:col-span-4 flex flex-col gap-8 lg:sticky lg:top-24">
          <WalletSnapshotV3 
            userCards={userCards} 
            creditAccounts={creditAccounts} 
            activeCardId={activeCardId}
            setActiveCardId={setActiveCardId}
            onAddCard={() => setShowAddModal(true)}
          />
          <FinancialSnapshotV3 
            health={health} 
            ledgerSummary={ledgerSummary} 
            recentWin={recentWin} 
          />
        </aside>

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
