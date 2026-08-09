import React, { useState, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, BarChart3 } from 'lucide-react';
import { PageContainer } from '../../components/shared/PageContainer';
import { cn } from '../../lib/utils';

const RecommenderPanel = lazy(() => import('../../features/finix/components/RecommenderPanel').then(m => ({ default: m.RecommenderPanel })));
const CardComparisonPanel = lazy(() => import('../../features/finix/components/CardComparisonPanel').then(m => ({ default: m.CardComparisonPanel })));
const PerksDashboard = lazy(() => import('../../features/finix/components/PerksDashboard').then(m => ({ default: m.PerksDashboard })));

type AnalyzeTabId = 'recommend' | 'compare';

const ANALYZE_TABS: { id: AnalyzeTabId; label: string; icon: typeof Search }[] = [
  { id: 'recommend', label: 'Recommend', icon: Search },
  { id: 'compare',   label: 'Compare',   icon: BarChart3 },
];

function AnalyzeTab() {
  const [activeTab, setActiveTab] = useState<AnalyzeTabId>('recommend');

  return (
    <PageContainer
      title={activeTab === 'recommend' ? 'Card Analyzer' : 'Card Comparison'}
      subtitle={activeTab === 'recommend' ? 'Get personalized credit card recommendations' : 'Compare cards side-by-side across all dimensions'}
    >
      <div className="flex gap-1 bg-surface-secondary/60 dark:bg-surface-elevated/30 rounded-2xl p-1 backdrop-blur-sm">
        {ANALYZE_TABS.map(({ id, label, icon: Icon }) => (
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
                layoutId="analyze-tab-bg"
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
              {activeTab === 'recommend' && <RecommenderPanel />}
              {activeTab === 'compare'   && <CardComparisonPanel />}
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </div>
    </PageContainer>
  );
}

function PerksTab() {
  return (
    <PageContainer
      title="Perks & Rewards"
      subtitle="Milestone tracking & card benefits"
    >
      <Suspense fallback={<div className="h-[400px] flex items-center justify-center text-text-muted">Loading perks...</div>}>
        <PerksDashboard />
      </Suspense>
    </PageContainer>
  );
}

export default function ExplorePage() {
  return (
    <div className="space-y-12">
      <AnalyzeTab />
      <hr className="border-border-subtle my-8" />
      <PerksTab />
    </div>
  );
}
