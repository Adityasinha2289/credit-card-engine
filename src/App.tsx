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
  const [isBooting, setIsBooting] = useState(true);
  
  // Simulate network fetching to display premium skeleton loading
  useEffect(() => {
    const timer = setTimeout(() => setIsBooting(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const creditAccounts = useDashboardStore((s) => s.creditAccounts);
  const activeCardId   = useDashboardStore((s) => s.activeCardId);
  const setActiveCard  = useDashboardStore((s) => s.setActiveCard);
  const rewards        = useDashboardStore((s) => s.rewards);
  const userCards      = useDashboardStore((s) => s.userCards);
  const deleteUserCard = useDashboardStore((s) => s.deleteUserCard);
  const profile        = useDashboardStore((s) => s.profile);

  // Feature Flag Engine consumption
  const isLiveOffersEnabled = useFeatureFlag('live_offers');

  // Personalization Engine consumption
  const persona = usePersona();
  const contextualSentence = PersonalizationEngine.getContextualSentence(profile);
  const quickActions = PersonalizationEngine.getQuickActions(profile);
  const motivationBanner = PersonalizationEngine.getMotivationBanner(profile);

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
  const [deleteCardId, setDeleteCardId] = useState<string | null>(null);
  const [deleteCardLabel, setDeleteCardLabel] = useState<string>('');

  // State for card benefits sheet
  const [benefitsCardId, setBenefitsCardId] = useState<string | null>(null);

  // Form Inputs
  const activeCard     = userCards.find((c) => c.id === activeCardId) || userCards[0];
  const activeAccount  = creditAccounts.find((a) => a.cardId === activeCardId);
  const liveBalance    = activeAccount ? activeAccount.currentBalance : 0;
  const availablePoints = rewards.totalPoints - rewards.redeemedPoints;

  return (
    <div className="max-w-6xl mx-auto">
      {/* ── Greeting ──────────────────────────────────────────────── */}
      <div className="mb-6">
        <p className="text-text-muted text-xs font-semibold tracking-[0.2em] uppercase mb-1">
          Overview
        </p>
        <h1 className="text-4xl lg:text-5xl font-display font-bold tracking-tight text-text-primary">
          {getGreeting()}, <span className="text-gradient-brand">{profile?.name?.split(' ')[0] || 'there'}</span>
        </h1>
        <p className="text-sm text-text-secondary mt-1 font-medium">
          {contextualSentence}
        </p>
      </div>

      {/* ── Today's Alerts Widget (Notification Engine) ─────────── */}
      {highestPriorityAlert && (
        <div className="panel-glass rounded-2xl p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border border-caution/20 bg-caution/5 text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-caution/10 text-caution flex items-center justify-center font-bold shrink-0 border border-caution/20">
              <Zap size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold tracking-wider uppercase text-caution">
                  TODAY'S ALERTS
                </span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-caution text-white uppercase tracking-wider">
                  {highestPriorityAlert.priority}
                </span>
              </div>
              <h4 className="text-sm font-bold text-text-primary leading-tight mt-0.5">
                {highestPriorityAlert.title}
              </h4>
              <p className="text-xs text-text-muted mt-0.5">
                {highestPriorityAlert.message}
              </p>
            </div>
          </div>
          <button className="shrink-0 self-end sm:self-auto px-3.5 py-1.5 rounded-xl bg-caution/10 hover:bg-caution/20 text-caution text-xs font-bold transition-colors">
            {highestPriorityAlert.action}
          </button>
        </div>
      )}

      {/* ── Your Financial Impact Widget (Financial Ledger) ──────── */}
      <div className="panel-glass rounded-3xl p-6 mb-6 border border-border-subtle  shadow-xl text-left relative overflow-hidden bg-gradient-to-br from-brand-500/10 via-surface to-profit/5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-emerald-muted text-brand-emerald flex items-center justify-center font-bold shrink-0 border border-border-emerald">
              <Coins size={18} />
            </div>
            <div>
              <span className="text-[10px] font-extrabold tracking-[0.2em] uppercase text-brand-emerald">
                YOUR FINANCIAL IMPACT
              </span>
              <p className="text-xs text-text-muted">Lifetime Savings & Rewards Ledger</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="p-4 rounded-2xl bg-surface-secondary dark:bg-white/[0.04] border border-border-subtle">
            <span className="text-[10px] uppercase font-bold text-text-muted">Total Estimated Savings</span>
            <p className="text-2xl font-display font-bold text-profit mt-1">
              ₹{ledgerSummary.totalSavings.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-surface-secondary dark:bg-white/[0.04] border border-border-subtle">
            <span className="text-[10px] uppercase font-bold text-text-muted">Total Reward Points</span>
            <p className="text-2xl font-display font-bold text-brand-emerald mt-1">
              {ledgerSummary.totalRewards.toLocaleString('en-IN')} pts
            </p>
          </div>
        </div>

        {recentWin && (
          <div className="p-3.5 rounded-2xl bg-profit/5 border border-profit/20 flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-profit tracking-wider">Recent Financial Win</span>
              <p className="text-xs font-semibold text-text-primary mt-0.5">
                {recentWin.explanation}
              </p>
            </div>
            <span className="text-xs font-bold text-profit shrink-0">
              +₹{recentWin.estimatedSavings}
            </span>
          </div>
        )}
      </div>

      {/* ── Financial Health Widget (Financial Health Engine) ───── */}
      <div className="panel-glass rounded-3xl p-6 mb-6 border border-border-subtle  shadow-xl text-left relative overflow-hidden bg-gradient-to-br from-profit/10 via-surface to-brand-500/5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-profit/10 text-profit flex items-center justify-center font-bold shrink-0 border border-profit/20">
              <ShieldCheck size={18} />
            </div>
            <div>
              <span className="text-[10px] font-extrabold tracking-[0.2em] uppercase text-profit">
                FINANCIAL HEALTH
              </span>
              <p className="text-xs text-text-muted">RenoCred Intelligence Score</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="text-right">
              <span className="text-2xl font-display font-extrabold text-text-primary tabular-nums">
                {health.score}
              </span>
              <span className="text-xs text-text-muted">/100</span>
            </div>
            <span className="text-xs font-black px-3 py-1 rounded-xl bg-profit text-white shadow-ag-glow-profit">
              Grade {health.grade}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-border-subtle">
          <div className="p-3 rounded-2xl bg-profit/5 border border-profit/20">
            <span className="text-[10px] uppercase font-bold text-profit tracking-wider">Top Strength</span>
            <p className="text-xs font-semibold text-text-primary mt-1">
              {health.strengths[0] || 'Profile Completeness: High accuracy'}
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-caution/5 border border-caution/20">
            <span className="text-[10px] uppercase font-bold text-caution tracking-wider">Biggest Improvement Area</span>
            <p className="text-xs font-semibold text-text-primary mt-1">
              {health.improvements[0] || 'Reward Optimisation: Consolidate card usage'}
            </p>
          </div>
        </div>
      </div>

      {/* ── Financial Tip of the Day (Financial Knowledge Graph) ── */}
      <div className="panel-glass rounded-2xl p-4 mb-6 flex items-center justify-between gap-4 border border-border-subtle  shadow-lg text-left">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-brand-emerald-muted text-brand-emerald flex items-center justify-center font-bold shrink-0 border border-border-emerald">
            <FileText size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold tracking-wider uppercase text-brand-emerald">
                FINANCIAL TIP OF THE DAY
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-emerald-muted text-brand-emerald border border-border-emerald capitalize">
                {tipOfTheDay.category.replace('_', ' ')}
              </span>
            </div>
            <h4 className="text-sm font-bold text-text-primary leading-tight mt-0.5">
              {tipOfTheDay.title}
            </h4>
            <p className="text-xs text-text-muted mt-0.5 leading-relaxed">
              {tipOfTheDay.summary}
            </p>
          </div>
        </div>
      </div>

      {/* ── Today's Best Offer Widget (Merchant Intelligence - Gated by feature flag) ────── */}
      {isLiveOffersEnabled && (
        <div className="panel-glass rounded-2xl p-5 mb-6 border border-border-subtle  shadow-xl text-left relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold tracking-[0.2em] uppercase text-brand-emerald">
                TODAY'S BEST OFFER
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-profit/10 text-profit border border-profit/20">
                {bestOffer.confidence}% Match
              </span>
            </div>
            <span className="text-[10px] font-semibold text-text-muted">
              Valid until {new Date(bestOffer.offer.validity).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-surface-secondary dark:bg-white/10 p-1 flex items-center justify-center shrink-0 border border-border-subtle">
                <img src={bestOffer.merchant.logo} alt={bestOffer.merchant.name} className="w-full h-full object-contain rounded-lg" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-text-primary leading-tight">
                  {bestOffer.offer.title}
                </h4>
                <p className="text-xs text-text-muted mt-0.5">
                  Merchant: <span className="font-semibold text-text-secondary">{bestOffer.merchant.name}</span> • Eligible Cards: <span className="font-semibold text-text-secondary">Partner Cards ({bestOffer.offer.eligibleCards.length})</span>
                </p>
              </div>
            </div>

            <div className="self-end md:self-auto shrink-0 text-right">
              <p className="text-[10px] uppercase font-bold text-text-muted">Estimated Savings</p>
              <p className="text-sm font-bold text-profit">
                ₹{bestOffer.estimatedSavings.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Featured Card Widget (Card Intelligence Platform) ───── */}
      <div className="panel-glass rounded-2xl p-4 mb-6 flex items-center justify-between gap-4 border border-border-subtle  shadow-lg text-left">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-brand-emerald-muted text-brand-emerald flex items-center justify-center font-bold shrink-0 border border-border-emerald">
            <CreditCard size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold tracking-wider uppercase text-brand-emerald">
                Featured Card Intelligence
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-caution/10 text-caution border border-caution/20 capitalize">
                {featuredCard.premiumTier.replace('_', ' ')}
              </span>
            </div>
            <h4 className="text-sm font-bold text-text-primary leading-tight mt-0.5">
              {featuredCard.cardName}
            </h4>
            <p className="text-xs text-text-muted">
              {featuredCard.issuer} • <span className="text-text-secondary font-medium">{featuredCard.topBenefit}</span>
            </p>
          </div>
        </div>
        <div className="shrink-0 hidden sm:block text-right">
          <span className="text-xs font-bold text-text-primary">₹{featuredCard.annualFee.toLocaleString('en-IN')}/yr</span>
          <p className="text-[10px] text-text-muted">Annual Fee</p>
        </div>
      </div>

      {/* ── TAQDEER's PICK Card (Decision Engine) ──────────────── */}
      <div className="panel-glass rounded-3xl p-6 mb-8 border border-border-emerald shadow-2xl relative overflow-hidden bg-gradient-to-br from-brand-500/10 via-surface to-brand-500/5">
        <div className="absolute top-0 right-0 w-48 h-48 bg-brand-emerald-muted rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-emerald text-white flex items-center justify-center font-bold shrink-0 shadow-[0_0_20px_rgba(4,59,39,0.3)]">
              <Sparkles size={16} />
            </div>
            <div>
              <span className="text-[10px] font-extrabold tracking-[0.2em] uppercase text-brand-emerald">
                TAQDEER'S PICK
              </span>
              <p className="text-xs text-text-muted">Single Best Financial Action Right Now</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-profit/10 text-profit border border-profit/20">
              {decision.confidence}% Match Confidence
            </span>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-lg font-display font-extrabold text-text-primary tracking-tight mb-1">
            {decision.title}
          </h3>
          <p className="text-xs text-text-secondary leading-relaxed font-medium">
            {decision.summary}
          </p>
        </div>

        {/* Estimated Impact */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 p-3.5 rounded-2xl bg-surface-secondary dark:bg-white/[0.04] border border-border-subtle">
          <div>
            <span className="text-[10px] uppercase font-bold text-text-muted">Estimated Impact</span>
            <p className="text-sm font-bold text-brand-emerald mt-0.5">
              {decision.estimatedImpact.savings
                ? `₹${decision.estimatedImpact.savings.toLocaleString('en-IN')} annual savings`
                : decision.estimatedImpact.rewards
                ? `${decision.estimatedImpact.rewards.toLocaleString()} bonus reward points`
                : 'High CIBIL Score Protection'}
            </p>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-text-muted">Timeframe</span>
            <p className="text-xs font-semibold text-text-secondary capitalize mt-0.5">
              {decision.estimatedImpact.timeFrame.replace('_', ' ')}
            </p>
          </div>
        </div>

        {/* Explanation & Evidence */}
        <div className="space-y-2 pt-3 border-t border-border-subtle">
          <p className="text-xs text-text-secondary leading-relaxed">
            <span className="font-bold text-text-primary">Explanation: </span>
            {decision.explanation}
          </p>

          <div className="mt-2">
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">
              Why This Recommendation?
            </p>
            <ul className="space-y-1">
              {decision.evidence.map((ev, idx) => (
                <li key={idx} className="text-xs text-text-muted flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald shrink-0" />
                  {ev}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ── Persona Insight Card ──────────────────────────────────── */}
      <div className="panel-glass rounded-2xl p-5 mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-border-subtle  shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-brand-emerald-muted text-brand-emerald flex items-center justify-center font-bold shrink-0 border border-border-emerald">
            <User size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-text-primary">Your Financial Profile</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-emerald-muted text-brand-emerald border border-border-emerald capitalize">
                {persona.segment} Segment
              </span>
            </div>
            <p className="text-xs text-text-muted mt-1">
              Goal: <span className="font-semibold text-text-secondary">{persona.primaryGoal || 'General'}</span>
              {persona.occupation && <span> • {persona.occupation}</span>}
              {persona.city && <span> • {persona.city}</span>}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 self-end md:self-auto shrink-0">
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wider font-semibold text-text-muted">Profile Completion</p>
            <p className="text-sm font-bold text-brand-emerald">{persona.profileCompleteness}%</p>
          </div>
          <div className="w-20 bg-surface-secondary dark:bg-white/10 h-2 rounded-full overflow-hidden">
            <div
              className="bg-brand-emerald h-full rounded-full transition-all duration-500 shadow-[0_0_20px_rgba(4,59,39,0.3)]"
              style={{ width: `${persona.profileCompleteness}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Smart Quick Actions ───────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {quickActions.map((action, i) => (
          <div
            key={i}
            className="panel-glass rounded-xl p-3.5 flex items-center gap-3 border border-border-subtle  cursor-pointer hover:border-border-emerald transition-all text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-brand-emerald-muted text-brand-emerald flex items-center justify-center shrink-0">
              <Zap size={16} />
            </div>
            <span className="text-xs font-bold text-text-primary truncate">{action}</span>
          </div>
        ))}
      </div>

      {/* ── Motivation Banner ─────────────────────────────────────── */}
      <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-brand-500/15 via-brand-500/5 to-transparent border border-border-emerald flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-brand-emerald text-white flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(4,59,39,0.3)]">
          <Sparkles size={16} />
        </div>
        <p className="text-xs font-bold text-text-primary leading-snug">
"{motivationBanner}"
        </p>
      </div>

      {/* ── Recommended For You Section (Recommendation Engine) ─── */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-display font-bold text-text-primary flex items-center gap-2">
            <Target className="text-brand-emerald" size={18} /> Recommended For You
          </h2>
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider bg-surface-secondary dark:bg-white/5 px-2.5 py-1 rounded-full border border-border-subtle">
            Rule Engine
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendations.slice(0, 3).map((rec) => (
            <div
              key={rec.id}
              className="panel-glass rounded-2xl p-4 flex flex-col justify-between border border-border-subtle  hover:border-border-emerald transition-all text-left"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-brand-emerald bg-brand-emerald-muted px-2 py-0.5 rounded-md uppercase tracking-wider">
                    {rec.category.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] font-bold text-profit bg-profit/10 px-2 py-0.5 rounded-full border border-profit/20">
                    {rec.confidence}% Match
                  </span>
                </div>
                <h3 className="text-xs font-bold text-text-primary leading-tight mb-1">
                  {rec.title}
                </h3>
                <p className="text-[11px] text-text-muted leading-relaxed mb-2">
                  {rec.description}
                </p>
              </div>
              <div className="mt-2 pt-2.5 border-t border-border-subtle">
                <p className="text-[10px] text-text-secondary italic leading-tight">
                  <span className="font-semibold not-italic text-brand-emerald">Why: </span>
                  {rec.reason}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Financial Insights Section (Behaviour Engine) ───────── */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-display font-bold text-text-primary flex items-center gap-2">
            <BarChart3 className="text-brand-emerald" size={18} /> Financial Insights
          </h2>
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider bg-surface-secondary dark:bg-white/5 px-2.5 py-1 rounded-full border border-border-subtle">
            Rule Engine
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {insights.slice(0, 3).map((ins) => (
            <div
              key={ins.id}
              className="panel-glass rounded-2xl p-4 flex flex-col justify-between border border-border-subtle  hover:border-border-emerald transition-all text-left"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-emerald bg-brand-emerald-muted px-2 py-0.5 rounded-md">
                    {ins.type.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] font-semibold text-text-muted">
                    Impact {ins.impactScore}%
                  </span>
                </div>
                <h3 className="text-xs font-bold text-text-primary leading-tight mb-1">
                  {ins.title}
                </h3>
                <p className="text-[11px] text-text-muted leading-relaxed">
                  {ins.description}
                </p>
              </div>
              {ins.actionableText && (
                <div className="mt-3 pt-2.5 border-t border-border-subtle  flex items-center justify-between">
                  <span className="text-[10px] font-bold text-brand-emerald">{ins.actionableText}</span>
                  <ChevronRight size={13} className="text-brand-emerald" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Two-column layout ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-8 items-start">
        {/* Left column: cards + stat panels + wallet optimizer */}
        <div className="flex flex-col gap-8">
          {/* Cards View: Carousel on Mobile, Grid on Desktop */}
          {isBooting ? (
            <div className="flex sm:grid sm:grid-cols-2 overflow-x-hidden gap-6 pb-8 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0">
              <Skeleton className="w-[78vw] sm:w-auto h-[230px] shrink-0" />
              <Skeleton className="w-[78vw] sm:w-auto h-[230px] shrink-0 hidden sm:block" />
            </div>
          ) : (
            <div className="flex sm:grid sm:grid-cols-2 overflow-x-auto sm:overflow-visible gap-6 pt-6 pb-8 sm:pt-0 sm:pb-0 snap-x snap-mandatory sm:snap-none hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
              {userCards.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="col-span-1 sm:col-span-2 flex flex-col items-center justify-center py-16 text-center panel-glass rounded-3xl border border-dashed border-border-subtle dark:border-white/[0.08]"
                >
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-brand-emerald-muted blur-3xl rounded-full" />
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                      className="relative w-32 h-20 rounded-xl border border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md shadow-2xl overflow-hidden flex flex-col justify-between p-3"
                    >
                      <div className="flex justify-between items-start">
                        <div className="w-8 h-2 bg-white/20 rounded-full" />
                        <div className="w-5 h-3 bg-white/30 rounded-sm" />
                      </div>
                      <div className="w-16 h-2 bg-white/20 rounded-full" />
                    </motion.div>
                  </div>
                  <h3 className="text-lg font-display font-bold text-text-primary mb-2">No Cards Added</h3>
                  <p className="text-xs text-text-muted max-w-[240px] leading-relaxed mb-6">
                    Add your first credit card to unlock AI insights, intelligent reward tracking, and seamless spend analytics.
                  </p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-brand-emerald hover:bg-brand-600 text-white text-sm font-semibold py-2.5 px-6 rounded-full shadow-[0_0_20px_rgba(4,59,39,0.3)] transition-all active:scale-95"
                  >
                    Add Your First Card
                  </button>
                </motion.div>
              ) : (
                userCards.map((card) => {
                const account = creditAccounts.find((a) => a.cardId === card.id);
                const cardWithLiveCredit = {
                  ...card,
                  creditLimit:     account ? account.totalLimit : card.creditLimit,
                  availableCredit: account
                    ? Math.max(0, account.totalLimit - account.currentBalance)
                    : card.availableCredit,
                };
                const isActive = activeCardId === card.id;

              return (
                <motion.div
                  key={card.id}
                  onClick={() => setActiveCard(card.id)}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    'snap-center shrink-0 w-[78vw] sm:w-auto flex flex-col gap-3 cursor-pointer transition-all duration-300 rounded-3xl p-3',
                    isActive
                      ? 'opacity-100 ring-2 ring-brand-emerald-glow ring-offset-2 ring-offset-canvas-100 dark:ring-offset-canvas-50 bg-surface/30'
                      : 'opacity-60 hover:opacity-100 hover:-translate-y-1',
                  )}
                >
                  <div className="flex items-center justify-between px-1 gap-2">
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-text-muted truncate">
                        {card.label || 'Credit Card'}
                      </span>
                      {isActive && (
                        <motion.span
                          layoutId="card-active-dot"
                          className="w-1.5 h-1.5 rounded-full bg-brand-emerald flex-shrink-0"
                        />
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[10px] font-semibold text-brand-emerald bg-brand-50 dark:bg-brand-emerald-muted px-2.5 py-1 rounded-full whitespace-nowrap">
                        {formatCents(cardWithLiveCredit.availableCredit)} avail.
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setBenefitsCardId(card.id);
                        }}
                        className="text-text-muted hover:text-brand-emerald p-1 rounded-full hover:bg-surface-secondary dark:hover:bg-white/[0.04] transition-colors flex items-center justify-center font-bold text-xs"
                        title="Card Benefits Info"
                        style={{ width: '22px', height: '22px' }}
                      >
                        <Info size={13} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteCardId(card.id);
                          setDeleteCardLabel(card.label || 'Credit Card');
                        }}
                        className="text-text-muted hover:text-loss p-1 rounded-full hover:bg-surface-secondary dark:hover:bg-white/[0.04] transition-colors"
                        title="Delete Card"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                  <ActiveCard card={cardWithLiveCredit} revealed={false} />
                </motion.div>
              );
            })
            )}
            </div>
          )}

          {/* Add Card Button */}
          <div className="flex justify-center mb-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl border-2 border-dashed border-border-subtle dark:border-white/[0.08] text-sm font-bold text-text-secondary hover:text-brand-emerald hover:border-brand-emerald/50 hover:bg-brand-emerald/[0.02] transition-all"
            >
              <Plus size={16} /> Add Another Card
            </motion.button>
          </div>

          {/* ── Stat panels ──────────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {isBooting ? (
              <>
                <Skeleton className="h-[140px] w-full" />
                <Skeleton className="h-[140px] w-full" />
                <Skeleton className="h-[140px] w-full" />
              </>
            ) : (
              <>
                <StatPanel
                  label="Outstanding"
                  value={formatCents(liveBalance)}
                  subtext={activeCard ? `On ${activeCard.label} card` : 'No active card'}
                  icon={TrendingUp}
                  iconBg="bg-brand-50 dark:bg-brand-emerald-muted"
                  iconColor="text-brand-emerald"
                />

                <StatPanel
                  label="Reward Points"
                  value={availablePoints.toLocaleString()}
                  subtext={`${rewards.tier.charAt(0).toUpperCase() + rewards.tier.slice(1)} tier`}
                  icon={Gift}
                  iconBg="bg-steel-50 dark:bg-steel-500/10"
                  iconColor="text-steel-500"
                />

                {/* Smart Alerts — dynamic insights */}
                <div className="panel-glass rounded-2xl p-5 flex flex-col justify-between h-44 border-gradient-animated relative overflow-hidden">
                  <Suspense fallback={null}><SmartAlerts /></Suspense>
                </div>
              </>
            )}
          </div>

          {/* ── Wallet Optimizer Section ─────────────────────────────── */}
          <div className="panel-glass rounded-3xl p-6 flex flex-col gap-4">
            <div>
              <h2 className="text-lg font-display font-bold text-text-primary">Wallet Optimizer</h2>
              <p className="text-xs text-text-muted">Best card in your wallet for every spend category</p>
            </div>
            {isBooting ? (
              <div className="flex flex-col gap-3">
                <Skeleton className="h-[72px] w-full rounded-2xl" />
                <Skeleton className="h-[72px] w-full rounded-2xl" />
                <Skeleton className="h-[72px] w-full rounded-2xl" />
              </div>
            ) : (
              <Suspense fallback={null}><WalletOptimizerPanel /></Suspense>
            )}
          </div>
        </div>

        {/* Right column: analytics and transaction feed */}
        <aside className="xl:sticky xl:top-24 flex flex-col gap-6">
          {isBooting ? (
            <>
              <Skeleton className="h-[280px] w-full rounded-3xl" />
              <div className="panel-glass rounded-3xl p-5 flex flex-col gap-4">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
              </div>
            </>
          ) : (
            <>
              <Suspense fallback={null}><SpendingAnalytics /></Suspense>
              <div className="panel-glass rounded-3xl p-5">
                <TransactionFeed limit={12} />
              </div>
            </>
          )}
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

      {/* Delete Card Confirmation Modal */}
      <AnimatePresence>
        {deleteCardId && (() => {
          const cardToDelete = userCards.find((c) => c.id === deleteCardId);
          return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteCardId(null)}
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
            />
            {/* Panel */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              className="relative w-full max-w-[360px] bg-surface-primary dark:bg-[#1a1d21] rounded-[2rem] overflow-hidden shadow-2xl border border-border-subtle"
              style={{
                boxShadow: '0 0 80px rgba(220,38,38,0.08), 0 25px 60px rgba(0,0,0,0.3)',
              }}
            >
              {/* Mini card preview strip at top */}
              {cardToDelete && (
                <div
                  className="h-20 w-full relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${cardToDelete.gradientFrom} 0%, ${cardToDelete.gradientTo} 100%)`,
                  }}
                >
                  {/* Frosted overlay */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40" />
                  {/* Noise texture */}
                  <div
                    className="absolute inset-0 opacity-[0.06]"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                      backgroundSize: '120px',
                    }}
                  />
                  {/* Card details on the strip */}
                  <div className="relative z-10 h-full flex items-center justify-between px-6">
                    <div className="min-w-0">
                      <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/50">Removing</p>
                      <p className="text-sm font-bold text-white truncate max-w-[200px] mt-0.5">{deleteCardLabel}</p>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-sm border border-border-subtle flex items-center justify-center">
                      <Trash2 size={16} className="text-white/80" />
                    </div>
                  </div>
                </div>
              )}

              {/* Body */}
              <div className="p-6 pt-5">
                {/* Warning badge */}
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-red-500/10 dark:bg-red-500/15 flex items-center justify-center flex-shrink-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                      <line x1="12" y1="9" x2="12" y2="13"/>
                      <line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-display font-bold text-text-primary">Remove this card?</h3>
                  </div>
                </div>

                <p className="text-[13px] text-text-secondary leading-relaxed">
                  This will permanently delete <strong className="text-text-primary font-semibold">{deleteCardLabel}</strong> from your wallet, including all linked transactions and credit account data.
                </p>

                {/* Danger info box */}
                <div className="mt-4 bg-red-500/[0.06] dark:bg-red-500/[0.08] border border-red-500/10 dark:border-red-500/15 rounded-2xl px-4 py-3 flex items-start gap-3">
                  <div className="w-1 h-full min-h-[32px] rounded-full bg-red-500/40 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-600/80 dark:text-red-400/80 leading-relaxed">
                    This action cannot be undone. You will need to re-add and re-enter all card details if you change your mind.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setDeleteCardId(null)}
                    className="flex-1 py-3 bg-surface-secondary/60 dark:bg-white/[0.06] text-text-secondary rounded-2xl text-sm font-semibold hover:bg-surface-elevated/60 dark:hover:bg-white/[0.10] transition-all active:scale-[0.97]"
                  >
                    Keep Card
                  </button>
                  <button
                    onClick={() => {
                      if (cardToDelete) {
                        analytics.track('Card Deleted', { 
                          bank: cardToDelete.bank || 'Unknown', 
                          network: cardToDelete.network || 'Unknown', 
                          cardName: cardToDelete.label || 'Unknown' 
                        });
                      }
                      deleteUserCard(deleteCardId);
                      setDeleteCardId(null);
                    }}
                    className="flex-1 py-3 rounded-2xl text-sm font-semibold transition-all active:scale-[0.97] text-white"
                    style={{
                      background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                      boxShadow: '0 4px 16px rgba(220,38,38,0.25), inset 0 1px 0 rgba(255,255,255,0.12)',
                    }}
                  >
                    Delete Card
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        );})()}
      </AnimatePresence>

      {/* Card Benefits Detail Sheet */}
      <Suspense fallback={null}><CardBenefitsSheet
        cardId={benefitsCardId}
        onClose={() => setBenefitsCardId(null)}
      /></Suspense>
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
