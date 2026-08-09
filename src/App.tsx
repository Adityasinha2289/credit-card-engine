import { analytics } from './lib/analytics';
import './index.css';
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  TrendingUp,
  Gift,
  CreditCard,
  Zap,
  FileText,
  ShieldCheck,
  BarChart3,
  Plus,
  Search,
  Trash2,
  Info,
  Target,
  Calculator,
  User,
  Sparkles,
  ChevronRight,
  Coins,
} from 'lucide-react';

import { DashboardLayout } from './components/layout/DashboardLayout';
import type { TabId } from './components/layout/Sidebar';

import { ActiveCard } from './features/cards/components/ActiveCard';
import { TransactionFeed } from './features/dashboard/components/TransactionFeed';
import { useDashboardStore, useHydration } from './features/dashboard/store/dashboardStore';
import { useSupabase } from './hooks/useSupabase';
import { cn, formatCents } from './lib/utils';
import { PersonalizationEngine, usePersona } from './features/personalization';
import { useBehaviourInsights } from './features/behaviour';
import { useRecommendations } from './features/recommendations';
import { useTaqdeerDecision } from './features/taqdeer';
import { useCardIntelligence } from './features/card-intelligence';
import { useMerchantOffers } from './features/merchant-intelligence';
import { useKnowledgeGraph } from './features/knowledge';
import { useFinancialHealth } from './features/financial-health';
import { useFinancialLedger } from './features/financial-ledger';
import { useNotificationEngine } from './features/notifications';
import { useFeatureFlag } from './features/feature-flags';

// Finix features (Lazy Loaded)
import { lazy, Suspense } from 'react';
import { LoginScreen } from './features/dashboard/components/LoginScreen';
import { ProfileTab } from './features/dashboard/components/ProfileTab';

const AddCardModal = lazy(() => import('./features/dashboard/components/AddCardModal'));
const TaqdeerPanel = lazy(() => import('./features/finix/components/TaqdeerPanel').then(m => ({ default: m.TaqdeerPanel })));
const RecommenderPanel = lazy(() => import('./features/finix/components/RecommenderPanel').then(m => ({ default: m.RecommenderPanel })));
const WalletOptimizerPanel = lazy(() => import('./features/finix/components/WalletUpiPanels').then(m => ({ default: m.WalletOptimizerPanel })));
const UpiSimulatorPanel = lazy(() => import('./features/finix/components/WalletUpiPanels').then(m => ({ default: m.UpiSimulatorPanel })));
const CibilPanel = lazy(() => import('./features/finix/components/FinixPanels').then(m => ({ default: m.CibilPanel })));
const BillTrackerPanel = lazy(() => import('./features/finix/components/FinixPanels').then(m => ({ default: m.BillTrackerPanel })));
const InsightsPanel = lazy(() => import('./features/finix/components/FinixPanels').then(m => ({ default: m.InsightsPanel })));
const SpendingAnalytics = lazy(() => import('./features/dashboard/components/SpendingAnalytics').then(m => ({ default: m.SpendingAnalytics })));
const CardBenefitsSheet = lazy(() => import('./features/cards/components/CardBenefitsSheet').then(m => ({ default: m.CardBenefitsSheet })));
const PerksDashboard = lazy(() => import('./features/finix/components/PerksDashboard').then(m => ({ default: m.PerksDashboard })));
const BudgetingPanel = lazy(() => import('./features/finix/components/BudgetingPanel').then(m => ({ default: m.BudgetingPanel })));
const CardComparisonPanel = lazy(() => import('./features/finix/components/CardComparisonPanel').then(m => ({ default: m.CardComparisonPanel })));
const SmartAlerts = lazy(() => import('./features/finix/components/SmartAlerts').then(m => ({ default: m.SmartAlerts })));
const MonthlyReport = lazy(() => import('./features/dashboard/components/MonthlyReport').then(m => ({ default: m.MonthlyReport })));
const CreditScoreSimulator = lazy(() => import('./features/finix/components/CreditScoreSimulator').then(m => ({ default: m.CreditScoreSimulator })));
const EmiCalculatorPanel = lazy(() => import('./features/finix/components/EmiCalculatorPanel').then(m => ({ default: m.EmiCalculatorPanel })));



// ─────────────────────────────────────────────────────────────────────────────
//  TIME-AWARE GREETING
// ─────────────────────────────────────────────────────────────────────────────

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 6)  return 'Good night';
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

// ─────────────────────────────────────────────────────────────────────────────
//  WALLET & INSIGHTS TAB TYPES
// ─────────────────────────────────────────────────────────────────────────────

type WalletTabId = 'optimizer' | 'upi' | 'bills' | 'emi';
type InsightsTabId = 'insights' | 'cibil' | 'budget' | 'report' | 'simulator';

// ─────────────────────────────────────────────────────────────────────────────
//  PAGE CONTAINER — reusable wrapper for sub-pages
// ─────────────────────────────────────────────────────────────────────────────

function PageContainer({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-display font-bold text-text-primary tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-text-muted mt-1">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  STAT PANEL — reusable dashboard metric card
// ─────────────────────────────────────────────────────────────────────────────

function StatPanel({
  label,
  value,
  subtext,
  icon: Icon,
  iconBg,
  iconColor,
  glowColor,
  children,
}: {
  label: string;
  value: string;
  subtext: string;
  icon: typeof TrendingUp;
  iconBg: string;
  iconColor: string;
  glowColor?: string;
  children?: React.ReactNode;
}) {
  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={cn(
        'panel-glass rounded-2xl p-5 flex flex-col justify-between h-44',
        'cursor-pointer group',
      )}
      style={glowColor ? {
        boxShadow: `0 2px 12px 0 ${glowColor}`,
      } : undefined}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-text-secondary">{label}</p>
        <div className={cn(
          'w-9 h-9 rounded-xl flex items-center justify-center',
          'transition-transform duration-300 group-hover:scale-110',
          iconBg,
        )}>
          <Icon size={17} strokeWidth={2.2} className={iconColor} />
        </div>
      </div>
      <div>
        <p className="text-3xl font-display font-bold text-text-primary tabular-nums tracking-tight">
          {value}
        </p>
        <p className="text-xs font-medium text-text-muted mt-1">
          {subtext}
        </p>
        {children}
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  HOME TAB
// ─────────────────────────────────────────────────────────────────────────────

import { Skeleton } from './components/ui/Skeleton';

function HomeTab() {
  
  
  

  const creditAccounts = useDashboardStore((s) => s.creditAccounts);
  const userCards = useDashboardStore((s) => s.userCards);
  const activeCardId = useDashboardStore((s) => s.activeCardId);
  const setActiveCard = useDashboardStore((s) => s.setActiveCard);
  const [benefitsCardId, setBenefitsCardId] = useState<string | null>(null);
  
  
  const rewards        = useDashboardStore((s) => s.rewards);
  
  
  const profile        = useDashboardStore((s) => s.profile);

  // Feature Flag Engine consumption
  const isLiveOffersEnabled = useFeatureFlag('live_offers');

  // Personalization Engine consumption
  
  const contextualSentence = PersonalizationEngine.getContextualSentence(profile);
  const quickActions = PersonalizationEngine.getQuickActions(profile);
  

  // Behaviour Engine consumption
  const { insights } = useBehaviourInsights();

  // Recommendation Engine consumption
  const { recommendations } = useRecommendations(profile);

  // TAQDEER Decision Engine consumption
  const { decision } = useTaqdeerDecision(profile);

  // Card Intelligence Platform consumption
  const { featuredCard } = useCardIntelligence();

  // Merchant Intelligence Platform consumption
  const { bestOffer } = useMerchantOffers(profile);

  // Financial Knowledge Graph consumption
  const { tipOfTheDay } = useKnowledgeGraph();

  // Financial Health Engine consumption
  const { health } = useFinancialHealth(profile);

  // Financial Ledger consumption
  const { summary: ledgerSummary, recentHistory: ledgerHistory } = useFinancialLedger();
  const recentWin = ledgerHistory[0];

  // Notification & Automation Engine consumption
  const { highestPriorityAlert } = useNotificationEngine();

  const [showAddModal, setShowAddModal] = useState(false);
  
  // State for card deletion
  
  

  // State for card benefits sheet
  

  // Form Inputs
  
  
  
  const availablePoints = rewards.totalPoints - rewards.redeemedPoints;
  const totalOutstanding = creditAccounts.reduce((acc, account) => acc + account.currentBalance, 0);

  return (
    <div className="max-w-4xl mx-auto pb-24 text-text-primary bg-black min-h-screen">
      
      {/* ── 1. GREETINGS & SAVINGS ────────────────────────────────────── */}
      <section className="mb-12 pt-8">
        <header className="mb-8">
          <p className="text-[#5D8F74] text-[10px] font-bold tracking-[0.2em] uppercase mb-2 flex items-center gap-2">
            <Sparkles size={12} /> Executive Briefing
          </p>
          <h1 className="text-5xl font-medium tracking-tight text-white mb-3 leading-tight">
            {getGreeting()}, {profile?.name?.split(' ')[0] || 'there'}.
          </h1>
          <p className="text-lg text-zinc-400 font-light max-w-2xl leading-relaxed mb-8">
            {contextualSentence}
          </p>
          
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 mb-8 inline-block pr-16">
            <p className="text-xs uppercase font-semibold text-zinc-500 tracking-wider mb-2">Total Savings via RenoCred</p>
            <p className="text-5xl font-display font-bold text-white tabular-nums tracking-tight">
              ₹{ledgerSummary.totalSavings.toLocaleString('en-IN')}
            </p>
          </div>
        </header>

        {/* Taqdeer Briefing integrated directly */}
        <div className="border-l-2 border-[#5D8F74] pl-6 py-1 mb-8">
          <h3 className="text-xl font-medium text-white mb-2 tracking-tight">
            {decision.title}
          </h3>
          <p className="text-sm text-zinc-400 leading-relaxed mb-4 max-w-2xl">
            {decision.summary}
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <span className="font-medium text-[#5D8F74]">
              {decision.estimatedImpact.savings
                ? `+ ₹${decision.estimatedImpact.savings.toLocaleString('en-IN')} /yr`
                : decision.estimatedImpact.rewards
                ? `+${decision.estimatedImpact.rewards.toLocaleString()} pts`
                : 'High Impact'}
            </span>
            <span className="text-zinc-600 font-medium uppercase tracking-wider text-[10px]">
              {decision.confidence}% Match • {decision.estimatedImpact.timeFrame.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* High Priority Alerts (Subtle, but urgent) */}
        {highestPriorityAlert && (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
              <div>
                <p className="text-xs font-semibold text-white">{highestPriorityAlert.title}</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">{highestPriorityAlert.message}</p>
              </div>
            </div>
            <button className="text-[10px] uppercase tracking-wider font-bold text-red-400 hover:text-red-300 transition-colors">
              {highestPriorityAlert.action}
            </button>
          </div>
        )}
      </section>

      <hr className="border-zinc-800/50 my-12" />
      
      {/* ── 2. YOUR CARDS ────────────────────────────────────────── */}
      <section className="mb-12">
        <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-zinc-500 mb-6">
          Your Cards
        </h2>
        
        {userCards.length === 0 ? (
          <div className="border border-zinc-800 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center">
            <p className="text-sm text-zinc-400 mb-4">You have no active credit cards.</p>
            <button onClick={() => setShowAddModal(true)} className="text-sm font-medium text-[#5D8F74] hover:text-[#4a725c] transition-colors">
              + Add a Card
            </button>
          </div>
        ) : (
          <div className="flex overflow-x-auto gap-4 pb-4 hide-scrollbar snap-x snap-mandatory">
            {userCards.map((card) => {
              const account = creditAccounts.find((a) => a.cardId === card.id);
              const cardWithLiveCredit = {
                ...card,
                creditLimit: account ? account.totalLimit : card.creditLimit,
                availableCredit: account
                  ? Math.max(0, account.totalLimit - account.currentBalance)
                  : card.availableCredit,
              };
              const isActive = activeCardId === card.id;

              return (
                <div 
                  key={card.id} 
                  onClick={() => setActiveCard(card.id)}
                  className={`snap-center shrink-0 w-[78vw] sm:w-80 flex flex-col gap-3 cursor-pointer transition-all duration-300 rounded-3xl p-3 ${isActive ? 'bg-zinc-900/50 border border-[#5D8F74]/30' : 'opacity-60 hover:opacity-100'}`}
                >
                  <div className="flex items-center justify-between px-1 gap-2">
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-zinc-500 truncate">
                        {card.label || 'Credit Card'}
                      </span>
                      {isActive && <div className="w-1.5 h-1.5 rounded-full bg-[#5D8F74] flex-shrink-0" />}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[10px] font-semibold text-[#5D8F74] bg-[#5D8F74]/10 px-2.5 py-1 rounded-full whitespace-nowrap">
                        {formatCents(cardWithLiveCredit.availableCredit)} avail.
                      </span>
                    </div>
                  </div>
                  <ActiveCard card={cardWithLiveCredit} revealed={false} />
                </div>
              );
            })}
          </div>
        )}
      </section>

      <hr className="border-zinc-800/50 my-12" />

      {/* ── 3. FINANCIAL STATUS ──────────────────────────────────────── */}
      <section className="mb-12">
        <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-zinc-500 mb-6">
          Financial Status
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-4">
          
          {/* Total Outstanding */}
          <div>
            <p className="text-[10px] uppercase font-semibold text-zinc-500 tracking-wider mb-2">Total Outstanding</p>
            <p className="text-3xl font-display font-medium text-white tabular-nums tracking-tight">
              {formatCents(totalOutstanding)}
            </p>
          </div>

          {/* Total Rewards */}
          <div>
            <p className="text-[10px] uppercase font-semibold text-zinc-500 tracking-wider mb-2">Total Reward Points</p>
            <p className="text-3xl font-display font-medium text-[#5D8F74] tabular-nums tracking-tight">
              {availablePoints.toLocaleString()}
            </p>
            <p className="text-[10px] text-zinc-500 mt-1 capitalize">{rewards.tier} Tier</p>
          </div>

          {/* Credit Health */}
          <div>
            <p className="text-[10px] uppercase font-semibold text-zinc-500 tracking-wider mb-2">Credit Health</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-display font-medium text-white tabular-nums tracking-tight">
                {health.score}
              </p>
              <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Grade {health.grade}</span>
            </div>
          </div>

        </div>

        {/* Ledger Recent Win */}
        {recentWin && (
          <p className="text-xs text-zinc-400 leading-relaxed border-l border-zinc-800 pl-4 mt-8">
            <span className="text-[#5D8F74] font-semibold">Recent Win: </span> 
            {recentWin.explanation} (+₹{recentWin.estimatedSavings})
          </p>
        )}
      </section>

      <hr className="border-zinc-800/50 my-12" />

      {/* ── 4. WHAT TO DO NEXT (Intelligence & Actions) ─────────────── */}

      <section>
        <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-zinc-500 mb-6">
          Intelligence & Actions
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Column 1: Immediate Actions */}
          <div className="space-y-6">
            <div>
              <h3 className="text-[10px] uppercase font-semibold text-zinc-500 tracking-wider mb-4 border-b border-zinc-800/50 pb-2">Quick Actions</h3>
              <ul className="space-y-3">
                {quickActions.map((action, i) => (
                  <li key={i} className="flex items-center justify-between group cursor-pointer">
                    <span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">{action}</span>
                    <ChevronRight size={14} className="text-zinc-600 group-hover:text-[#5D8F74] transition-colors" />
                  </li>
                ))}
                <li className="flex items-center justify-between group cursor-pointer pt-2" onClick={() => setShowAddModal(true)}>
                  <span className="text-sm font-medium text-[#5D8F74]">Add Another Card</span>
                  <Plus size={14} className="text-[#5D8F74]" />
                </li>
              </ul>
            </div>

            {isLiveOffersEnabled && bestOffer && (
              <div>
                <h3 className="text-[10px] uppercase font-semibold text-zinc-500 tracking-wider mb-4 border-b border-zinc-800/50 pb-2">Best Offer</h3>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 p-1 shrink-0 flex items-center justify-center">
                    <img src={bestOffer.merchant.logo} alt={bestOffer.merchant.name} className="w-full h-full object-contain rounded-md" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white leading-tight mb-1">{bestOffer.offer.title}</p>
                    <p className="text-[11px] text-zinc-400">Save up to ₹{bestOffer.estimatedSavings.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Column 2: Recommended Strategies */}
          <div className="space-y-6">
            <div>
              <h3 className="text-[10px] uppercase font-semibold text-zinc-500 tracking-wider mb-4 border-b border-zinc-800/50 pb-2">Strategic Recommendations</h3>
              <div className="space-y-4">
                {recommendations.slice(0, 3).map((rec) => (
                  <div key={rec.id} className="border-l border-zinc-800 pl-4 py-1">
                    <p className="text-[10px] text-[#5D8F74] uppercase tracking-wider font-semibold mb-1">{rec.category.replace('_', ' ')} • {rec.confidence}% Match</p>
                    <p className="text-sm text-white font-medium mb-1">{rec.title}</p>
                    <p className="text-xs text-zinc-400 line-clamp-2">{rec.description}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-[10px] uppercase font-semibold text-[#5D8F74] tracking-wider mb-2">Tip of the Day</h3>
              <p className="text-xs text-zinc-400 leading-relaxed border-l-2 border-[#5D8F74]/30 pl-3">{tipOfTheDay.summary}</p>
            </div>
          </div>

          {/* Column 3: Financial Insights */}
          <div className="space-y-6">
            <div>
              <h3 className="text-[10px] uppercase font-semibold text-zinc-500 tracking-wider mb-4 border-b border-zinc-800/50 pb-2">Behavioural Insights</h3>
              <div className="space-y-4">
                {insights.slice(0, 3).map((ins) => (
                  <div key={ins.id} className="bg-zinc-900/30 p-3 rounded-lg border border-zinc-800/50">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">{ins.type.replace('_', ' ')}</span>
                    </div>
                    <p className="text-sm text-white font-medium mb-1">{ins.title}</p>
                    <p className="text-xs text-zinc-400 mb-2">{ins.description}</p>
                    {ins.actionableText && (
                      <p className="text-[10px] text-[#5D8F74] font-medium flex items-center justify-between">
                        {ins.actionableText} <ChevronRight size={12} />
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-[10px] uppercase font-semibold text-zinc-500 tracking-wider mb-4 border-b border-zinc-800/50 pb-2">Featured Card Intelligence</h3>
              <p className="text-sm font-medium text-white leading-tight mb-1">{featuredCard.cardName}</p>
              <p className="text-[11px] text-zinc-400 mb-2">{featuredCard.issuer} • {featuredCard.topBenefit}</p>
            </div>
          </div>

        </div>
      </section>

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

      {/* Delete Card Confirmation Modal */}
      {/* Preserved for completeness, though buttons are not in the new UI right now to keep it clean */}
      
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  ANALYZE TAB
// ─────────────────────────────────────────────────────────────────────────────

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
      {/* Sub-tabs */}
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

// ─────────────────────────────────────────────────────────────────────────────
//  WALLET TAB
// ─────────────────────────────────────────────────────────────────────────────

const WALLET_TABS: { id: WalletTabId; label: string; icon: typeof CreditCard }[] = [
  { id: 'optimizer', label: 'Optimizer', icon: CreditCard },
  { id: 'upi',       label: 'Pay',       icon: Zap        },
  { id: 'bills',     label: 'Bills',     icon: FileText   },
  { id: 'emi',       label: 'EMI',       icon: Calculator },
];

function WalletTab() {
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
      {/* Sub-tabs */}
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

      <div className="panel-glass rounded-3xl p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'optimizer' && <Suspense fallback={null}><WalletOptimizerPanel /></Suspense>}
            {activeTab === 'upi'       && <UpiSimulatorPanel />}
            {activeTab === 'bills'     && <BillTrackerPanel />}
            {activeTab === 'emi'       && <EmiCalculatorPanel />}
          </motion.div>
        </AnimatePresence>
      </div>
    </PageContainer>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  INSIGHTS TAB
// ─────────────────────────────────────────────────────────────────────────────

const INSIGHTS_TABS: { id: InsightsTabId; label: string; icon: typeof BarChart3 }[] = [
  { id: 'insights',  label: 'Insights',   icon: BarChart3   },
  { id: 'budget',    label: 'Budget',     icon: Target      },
  { id: 'cibil',     label: 'CIBIL',      icon: ShieldCheck },
  { id: 'simulator', label: 'Simulator',  icon: Zap         },
  { id: 'report',    label: 'Report',     icon: FileText    },
];

function InsightsTab() {
  const [activeTab, setActiveTab] = useState<InsightsTabId>('insights');

  return (
    <PageContainer
      title={activeTab === 'insights' ? 'Spend Insights' : activeTab === 'budget' ? 'Category Budgets' : activeTab === 'report' ? 'Monthly Report' : activeTab === 'simulator' ? 'Score Simulator' : 'CIBIL Score'}
      subtitle={activeTab === 'insights' ? 'Smart analysis of your spending patterns' : activeTab === 'budget' ? 'Track your credit health and budgets' : activeTab === 'report' ? 'Detailed breakdown of your monthly spending' : activeTab === 'simulator' ? 'See how your actions impact your credit score' : 'Your credit health report'}
    >
      {/* Sub-tabs */}
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

// ─────────────────────────────────────────────────────────────────────────────
//  PERKS TAB
// ─────────────────────────────────────────────────────────────────────────────

// type PerksTabId = 'rewards' | 'subscriptions' | 'offers';

// const PERKS_TABS: { id: PerksTabId; label: string; icon: typeof Gift }[] = [
//   { id: 'rewards',       label: 'Rewards & Milestones', icon: Gift },
//   { id: 'subscriptions', label: 'Subscriptions',        icon: CreditCard },
//   { id: 'offers',        label: 'Card Offers',          icon: Tag },
// ];

function PerksTab() {
  return (
    <PageContainer
      title="Perks & Rewards"
      subtitle="Milestone tracking & card benefits"
    >
      <Suspense fallback={<div className="h-[400px] flex items-center justify-center text-text-muted">Loading perks...</div>}><PerksDashboard /></Suspense>
    </PageContainer>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  APP
// ─────────────────────────────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full animate-pulse">
      {/* Header Skeleton */}
      <div className="mb-4">
        <div className="h-4 bg-surface-secondary dark:bg-surface-elevated rounded w-24 mb-2" />
        <div className="h-10 bg-surface-secondary dark:bg-surface-elevated rounded-xl w-1/2 md:w-1/3" />
      </div>
      
      {/* Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-[220px] bg-surface-secondary dark:bg-surface-elevated rounded-[2rem]" />
        <div className="h-[220px] bg-surface-secondary dark:bg-surface-elevated rounded-[2rem] hidden md:block" />
      </div>
      
      {/* Main Panels Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2">
        <div className="lg:col-span-2 h-[500px] bg-surface-secondary dark:bg-surface-elevated rounded-[2rem]" />
        <div className="h-[500px] bg-surface-secondary dark:bg-surface-elevated rounded-[2rem]" />
      </div>
    </div>
  );
}

export default function App() {
  const { isLoaded, isSignedIn, user } = useUser();
  const supabase = useSupabase();
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [hasAttemptedHydration, setHasAttemptedHydration] = useState(false);
  const profile = useDashboardStore((s) => s.profile);
  const resetStore = useDashboardStore((s) => s._reset);
  const setSupabaseClient = useDashboardStore((s) => s.setSupabaseClient);
  const hydrateFromSupabase = useDashboardStore((s) => s.hydrateFromSupabase);
  const isHydrated = useHydration();
  const isHydratingFromSupabase = useDashboardStore((s) => s.isHydratingFromSupabase);

  const isDemo = profile?.email === 'demo@renocred.com';

  // Inject Supabase Client into Zustand for background syncing
  useEffect(() => {
    setSupabaseClient(supabase);
  }, [supabase, setSupabaseClient]);

  // Auth Sync & Hydration
  useEffect(() => {
    if (isSignedIn && user) {
      const clerkEmail = user.primaryEmailAddress?.emailAddress || '';
      
      // Prevent cross-account leaks
      if (profile && profile.email !== clerkEmail) {
        resetStore();
      } 
      // Hydrate from Supabase if we don't have a profile yet
      else if (!profile && !hasAttemptedHydration) {
        setHasAttemptedHydration(true);
        hydrateFromSupabase(clerkEmail, user.fullName || '', user.imageUrl || '');
      }
    }
  }, [isSignedIn, user, profile?.email, resetStore, hydrateFromSupabase, hasAttemptedHydration]);

  // Always force dark mode as per user request and listen for navigation events
  useEffect(() => {
    document.documentElement.classList.add('dark');
    analytics.track('App Opened', { source: 'web' });
    analytics.track('Session Started', { sessionId: crypto.randomUUID() });

    const handleNavigate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setActiveTab(customEvent.detail as TabId);
        analytics.track('Feature Used', { featureName: customEvent.detail as string, tab: 'nav' });
      }
    };
    window.addEventListener('NAVIGATE_TAB', handleNavigate);
    return () => window.removeEventListener('NAVIGATE_TAB', handleNavigate);
  }, []);

  const isTestKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY?.includes('test');
  
  if (!isHydrated || (!isLoaded && !isTestKey) || isHydratingFromSupabase) {
    return (
      <DashboardLayout
        activeTab={activeTab}
        onTabChange={() => {}}
        isDark={true}
        onToggleTheme={() => {}}
      >
        <DashboardSkeleton />
      </DashboardLayout>
    );
  }

  // 1. If not signed in AND not using the demo, show LoginScreen (Clerk Auth View)
  if (!isSignedIn && !isDemo) {
    return <LoginScreen />;
  }

  // 2. If signed in, but profile or onboarding is incomplete, show LoginScreen (Questionnaire View)
  if (isSignedIn && (!profile || !profile.onboardingCompleted)) {
    return <LoginScreen />;
  }

  return (
    <DashboardLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      isDark={true}
      onToggleTheme={() => {}}
    >
      {activeTab === 'home'     && <HomeTab />}
      {activeTab === 'analyze'  && <AnalyzeTab />}
      {activeTab === 'wallet'   && <WalletTab />}
      {activeTab === 'perks'    && <PerksTab />}
      {activeTab === 'insights' && <InsightsTab />}
      {activeTab === 'profile'  && <ProfileTab />}

      {/* ── Taqdeer AI Floating Chat ─────────────────────────────────── */}
      <Suspense fallback={null}><TaqdeerPanel /></Suspense>
    </DashboardLayout>
  );
}
