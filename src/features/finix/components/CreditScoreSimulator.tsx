import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  SlidersHorizontal, TrendingUp, TrendingDown, RotateCcw,
  CreditCard, Clock, AlertTriangle, CheckCircle2,
  Minus, ArrowUpRight, ArrowDownRight, Info, Zap,
  PiggyBank, Landmark, RefreshCw,
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useDashboardStore } from '../../dashboard/store/dashboardStore';
import { CreditScoreDial } from '../../../components/ui/CreditScoreDial';

// ─────────────────────────────────────────────────────────────────────────────
//  SIMULATION ENGINE
// ─────────────────────────────────────────────────────────────────────────────

interface SimParams {
  utilization: number;      // 0-100
  missedPayments: number;   // 0-12
  creditAge: number;        // months
  totalAccounts: number;    // 1-20
  hardInquiries: number;    // 0-10
  newAccounts: number;      // 0-5 in last 6mo
  hasLoan: boolean;
  debtToIncome: number;     // 0-100
}

function simulateScore(base: number, params: SimParams): number {
  let score = base;

  // Payment History (35% weight) — missed payments tank the score heavily
  if (params.missedPayments > 0) {
    const penalty = Math.min(params.missedPayments * 35, 200);
    score -= penalty;
  }

  // Credit Utilization (30% weight)
  if (params.utilization <= 10) score += 20;
  else if (params.utilization <= 30) score += 10;
  else if (params.utilization <= 50) score -= 15;
  else if (params.utilization <= 75) score -= 40;
  else score -= 80;

  // Credit Age (15% weight)
  if (params.creditAge >= 84) score += 30;       // 7+ years
  else if (params.creditAge >= 36) score += 15;   // 3+ years
  else if (params.creditAge >= 12) score += 0;    // 1+ year
  else score -= 20;                               // < 1 year

  // Credit Mix (10% weight)
  if (params.totalAccounts >= 5 && params.hasLoan) score += 15;
  else if (params.totalAccounts >= 3) score += 10;
  else if (params.totalAccounts >= 2) score += 5;
  else score -= 10;

  // New Inquiries (10% weight)
  if (params.hardInquiries >= 6) score -= 40;
  else if (params.hardInquiries >= 3) score -= 20;
  else if (params.hardInquiries >= 1) score -= 5;

  if (params.newAccounts >= 3) score -= 25;
  else if (params.newAccounts >= 2) score -= 10;

  // Debt-to-income ratio
  if (params.debtToIncome > 50) score -= 30;
  else if (params.debtToIncome > 40) score -= 15;
  else if (params.debtToIncome > 30) score -= 5;

  return Math.max(300, Math.min(900, Math.round(score)));
}

function getScoreLabel(score: number): { label: string; color: string } {
  const c = (v: string) => `rgb(var(${v}))`;
  if (score >= 800) return { label: 'Exceptional', color: c('--color-profit')     };
  if (score >= 750) return { label: 'Excellent',   color: c('--color-brand-500')  };
  if (score >= 700) return { label: 'Good',        color: c('--color-sage-500')   };
  if (score >= 650) return { label: 'Fair',        color: c('--color-caution')    };
  if (score >= 550) return { label: 'Poor',        color: c('--color-copper-500') };
  return                    { label: 'Very Poor',   color: c('--color-loss')       };
}

// Palette tokens for slider accents — keeps the simulator on the app's colour system.
const C = {
  brand:   'rgb(var(--color-brand-500))',
  steel:   'rgb(var(--color-steel-500))',
  copper:  'rgb(var(--color-copper-500))',
  profit:  'rgb(var(--color-profit))',
  loss:    'rgb(var(--color-loss))',
  caution: 'rgb(var(--color-caution))',
};

// ─────────────────────────────────────────────────────────────────────────────
//  SLIDER INPUT
// ─────────────────────────────────────────────────────────────────────────────



// ─────────────────────────────────────────────────────────────────────────────
//  IMPACT CHIP
// ─────────────────────────────────────────────────────────────────────────────

function ImpactChip({ label, impact }: { label: string; impact: number }) {
  const isPositive = impact > 0;
  const isNeutral  = impact === 0;
  return (
    <div className={cn(
      'flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all',
      isPositive ? 'border-profit/15 bg-profit/[0.04]' :
      isNeutral  ? 'border-border-subtle bg-white/[0.01]' :
                   'border-loss/15 bg-loss/[0.04]',
    )}>
      <span className="text-xs font-semibold text-text-secondary">{label}</span>
      <div className="flex items-center gap-1">
        {isPositive && <ArrowUpRight size={12} className="text-profit" />}
        {!isPositive && !isNeutral && <ArrowDownRight size={12} className="text-loss" />}
        {isNeutral && <Minus size={12} className="text-text-muted" />}
        <span className={cn('text-xs font-bold tabular-nums',
          isPositive ? 'text-profit' : isNeutral ? 'text-text-muted' : 'text-loss')}>
          {isPositive ? '+' : ''}{impact}
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export function CreditScoreSimulator() {
  const profile        = useDashboardStore((s) => s.profile);
  const creditAccounts = useDashboardStore((s) => s.creditAccounts);
  const userCards      = useDashboardStore((s) => s.userCards);

  const baseScore = profile?.creditScore || 750;
  const totalLimit = creditAccounts.reduce((s, a) => s + a.totalLimit, 0);
  const totalBal   = creditAccounts.reduce((s, a) => s + a.currentBalance, 0);
  const currentUtil = totalLimit > 0 ? Math.round((totalBal / totalLimit) * 100) : 20;

  const defaultParams: SimParams = {
    utilization: currentUtil,
    missedPayments: 0,
    creditAge: 14,
    totalAccounts: userCards.length || 2,
    hardInquiries: 0,
    newAccounts: 0,
    hasLoan: false,
    debtToIncome: 25,
  };

  const [params, setParams] = useState<SimParams>(defaultParams);
  const set = (key: keyof SimParams, val: number | boolean) =>
    setParams((p) => ({ ...p, [key]: val }));

  const simulated = useMemo(() => simulateScore(baseScore, params), [baseScore, params]);
  const diff      = simulated - baseScore;
  const simLabel  = getScoreLabel(simulated);
  const baseLabel = getScoreLabel(baseScore);

  // Per-factor impact calculation
  const factorImpact = useMemo(() => {
    const base = simulateScore(baseScore, defaultParams);
    const impactOf = (key: keyof SimParams, val: number | boolean) => {
      const tweaked = { ...defaultParams, [key]: val };
      return simulateScore(baseScore, tweaked) - base;
    };
    return {
      utilization:    impactOf('utilization', params.utilization),
      missedPayments: impactOf('missedPayments', params.missedPayments),
      creditAge:      impactOf('creditAge', params.creditAge),
      totalAccounts:  impactOf('totalAccounts', params.totalAccounts),
      hardInquiries:  impactOf('hardInquiries', params.hardInquiries),
      newAccounts:    impactOf('newAccounts', params.newAccounts),
      debtToIncome:   impactOf('debtToIncome', params.debtToIncome),
    };
  }, [params, baseScore]);

  const handleReset = () => setParams(defaultParams);

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-emerald/15 flex items-center justify-center">
            <SlidersHorizontal size={18} className="text-brand-emerald" />
          </div>
          <div>
            <h3 className="text-base font-display font-bold text-text-primary">Credit Score Simulator</h3>
            <p className="text-xs text-text-muted">Adjust the sliders to see how actions affect your score</p>
          </div>
        </div>
        <button onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-text-muted hover:text-text-primary bg-white/[0.04] hover:bg-white/[0.08] transition-all">
          <RotateCcw size={12} /> Reset
        </button>
      </div>

      {/* Score Display: Before → After */}
      <div className="panel-glass rounded-2xl p-6">
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-6 items-center">

          {/* Current Score */}
          <div className="flex flex-col items-center gap-2">
            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Current</p>
            <CreditScoreDial score={baseScore} size={140} animate={false} />
            <div className="text-center">
              <p className="text-sm font-bold" style={{ color: baseLabel.color }}>{baseLabel.label}</p>
            </div>
          </div>

          {/* Arrow */}
          <div className="hidden sm:flex flex-col items-center gap-2">
            <motion.div
              animate={{ x: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              className={cn('w-12 h-12 rounded-full flex items-center justify-center',
                diff > 0 ? 'bg-profit/10' : diff < 0 ? 'bg-loss/10' : 'bg-white/[0.04]')}
            >
              {diff > 0 ? <TrendingUp size={20} className="text-profit" /> :
               diff < 0 ? <TrendingDown size={20} className="text-loss" /> :
               <Minus size={20} className="text-text-muted" />}
            </motion.div>
            <p className={cn('text-lg font-bold tabular-nums',
              diff > 0 ? 'text-profit' : diff < 0 ? 'text-loss' : 'text-text-muted')}>
              {diff > 0 ? '+' : ''}{diff}
            </p>
          </div>

          {/* Simulated Score */}
          <div className="flex flex-col items-center gap-2">
            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Simulated</p>
            <CreditScoreDial score={simulated} size={140} />
            <div className="text-center">
              <p className="text-sm font-bold" style={{ color: simLabel.color }}>{simLabel.label}</p>
            </div>
          </div>
        </div>

        {/* Mobile diff display */}
        <div className="sm:hidden flex items-center justify-center gap-2 mt-4 pt-4 border-t border-border-subtle">
          {diff > 0 ? <TrendingUp size={16} className="text-profit" /> :
           diff < 0 ? <TrendingDown size={16} className="text-loss" /> :
           <Minus size={16} className="text-text-muted" />}
          <p className={cn('text-lg font-bold tabular-nums',
            diff > 0 ? 'text-profit' : diff < 0 ? 'text-loss' : 'text-text-muted')}>
            {diff > 0 ? '+' : ''}{diff} points
          </p>
        </div>
      </div>

      {/* What-If Scenarios */}
      <div className="panel-glass rounded-2xl p-5">
        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-3">What-If Scenarios</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { id: 'miss_payment', label: 'What if I miss a payment this month?', update: { missedPayments: params.missedPayments + 1 }, icon: AlertTriangle, color: 'text-loss', bg: 'bg-loss/10', border: 'border-loss/20' },
            { id: 'spend_50k', label: 'What if I max out my card?', update: { utilization: Math.min(100, params.utilization + 50) }, icon: CreditCard, color: 'text-caution', bg: 'bg-caution/10', border: 'border-caution/20' },
            { id: 'close_card', label: 'What if I close my oldest card?', update: { creditAge: Math.max(1, params.creditAge - 36), totalAccounts: Math.max(1, params.totalAccounts - 1) }, icon: RefreshCw, color: 'text-copper-500', bg: 'bg-copper-500/10', border: 'border-copper-500/20' },
            { id: 'new_loan', label: 'What if I take a new personal loan?', update: { hasLoan: true, newAccounts: params.newAccounts + 1, hardInquiries: params.hardInquiries + 1, totalAccounts: params.totalAccounts + 1 }, icon: Landmark, color: 'text-brand-emerald', bg: 'bg-brand-emerald/10', border: 'border-brand-emerald/20' },
            { id: 'clear_debt', label: 'What if I clear all my card debt?', update: { utilization: 0 }, icon: PiggyBank, color: 'text-profit', bg: 'bg-profit/10', border: 'border-profit/20' },
            { id: 'apply_cards', label: 'What if I apply for 3 new cards?', update: { hardInquiries: params.hardInquiries + 3, newAccounts: params.newAccounts + 3 }, icon: Zap, color: 'text-copper-500', bg: 'bg-copper-500/10', border: 'border-copper-500/20' },
          ].map((scenario) => {
            const Icon = scenario.icon;
            return (
              <button
                key={scenario.id}
                onClick={() => setParams({ ...params, ...scenario.update })}
                className="text-left flex items-start gap-3 p-4 rounded-2xl bg-surface-primary dark:bg-white/[0.02] border border-border-subtle hover:border-brand-emerald/40 transition-colors active:scale-95"
              >
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border", scenario.bg, scenario.color, scenario.border)}>
                  <Icon size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary leading-snug">{scenario.label}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Impact Summary */}
      <div className="panel-glass rounded-2xl p-5">
        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-3">Factor Impact</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <ImpactChip label="Utilization"      impact={factorImpact.utilization}    />
          <ImpactChip label="Payment History"  impact={factorImpact.missedPayments} />
          <ImpactChip label="Credit Age"       impact={factorImpact.creditAge}      />
          <ImpactChip label="Total Accounts"   impact={factorImpact.totalAccounts}  />
          <ImpactChip label="Hard Inquiries"   impact={factorImpact.hardInquiries}  />
          <ImpactChip label="New Accounts"     impact={factorImpact.newAccounts}    />
          <ImpactChip label="Debt-to-Income"   impact={factorImpact.debtToIncome}   />
        </div>
      </div>

      {/* Tips */}
      <div className="panel-glass rounded-2xl p-5">
        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-3">Quick Tips</p>
        <div className="flex flex-col gap-2.5">
          {[
            { tip: 'Keep credit utilization below 30% for optimal scoring', show: params.utilization > 30 },
            { tip: 'Even 1 missed payment can drop your score 35+ points', show: params.missedPayments > 0 },
            { tip: 'Avoid opening 3+ new accounts in 6 months', show: params.newAccounts >= 3 },
            { tip: 'Reduce hard inquiries by applying only for cards you need', show: params.hardInquiries >= 3 },
            { tip: 'Having a mix of credit cards + loans improves your score', show: !params.hasLoan },
            { tip: 'Keep debt-to-income ratio below 40%', show: params.debtToIncome > 40 },
          ].filter((t) => t.show).map((t, i) => (
            <div key={i} className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl bg-brand-emerald/[0.04] border border-brand-emerald/10">
              <Info size={13} className="text-brand-emerald mt-0.5 flex-shrink-0" />
              <p className="text-xs text-text-secondary leading-relaxed">{t.tip}</p>
            </div>
          ))}
          {[
            { tip: 'Keep credit utilization below 30% for optimal scoring', show: params.utilization > 30 },
            { tip: 'Even 1 missed payment can drop your score 35+ points', show: params.missedPayments > 0 },
            { tip: 'Avoid opening 3+ new accounts in 6 months', show: params.newAccounts >= 3 },
            { tip: 'Reduce hard inquiries by applying only for cards you need', show: params.hardInquiries >= 3 },
            { tip: 'Having a mix of credit cards + loans improves your score', show: !params.hasLoan },
            { tip: 'Keep debt-to-income ratio below 40%', show: params.debtToIncome > 40 },
          ].every((t) => !t.show) && (
            <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl bg-profit/[0.04] border border-profit/10">
              <CheckCircle2 size={13} className="text-profit mt-0.5 flex-shrink-0" />
              <p className="text-xs text-text-secondary leading-relaxed">Great job! Your current parameters are all in healthy ranges.</p>
            </div>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-[10px] text-text-muted text-center leading-relaxed px-4">
        This is an educational simulator based on general CIBIL scoring factors. Actual scores depend on your full credit history and may differ from these estimates.
      </p>
    </div>
  );
}
