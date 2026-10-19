/**
 * Money: this month on a receipt (income, what's gone, what's coming, what's
 * safe to spend), then subscriptions, activity and savings goals.
 */
import { useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useShallow } from 'zustand/shallow';
import { PiggyBank, Plus, Trash2 } from 'lucide-react';
import { useDashboardStore } from '../../../features/dashboard/store/dashboardStore';
import { SafeToSpendEngine } from '../../../features/money/engines/SafeToSpendEngine';
import { formatRupees, toPaise } from '../../../features/money/lib/moneyMath';
import { useIsDemo } from '../../../features/demo/DemoAppProvider';
import { PageContainer } from '../../../components/shared/PageContainer';
import { AppTabs, useTab } from '../../../components/shared/AppTabs';
import { EASE_OUT } from '../../../public-platform/site/primitives';
import SubscriptionsPage from './SubscriptionsPage';
import TransactionsPage from './TransactionsPage';
import { Receipt } from './Receipt';

export default function MoneyManagerPage() {
  const { transactions, budgets, subscriptions, goals, profile } = useDashboardStore(useShallow((s) => ({
    transactions: s.transactions,
    budgets: s.budgets,
    subscriptions: s.subscriptions,
    goals: s.goals,
    profile: s.profile,
  })));
  const updateProfile = useDashboardStore((s) => s.updateProfile);
  const isDemo = useIsDemo();
  const [tab, setTab] = useTab(['subscriptions', 'activity', 'goals'] as const, 'subscriptions');

  // Profile salary is ANNUAL RUPEES; everything else here is paise.
  const monthlyIncome = profile?.salary ? toPaise(profile.salary / 12) : null;
  const safe = useMemo(
    () => SafeToSpendEngine.calculate({ monthlyIncome, transactions, budgets, goals, subscriptions, isDemo }),
    [monthlyIncome, transactions, budgets, goals, subscriptions, isDemo],
  );
  const month = new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  const activeSubs = subscriptions.filter((s) => s.status === 'active').length;

  const saveIncome = (monthlyRupees: number) => {
    if (!profile) return;
    void updateProfile({ ...profile, salary: Math.round(monthlyRupees * 12) });
  };

  return (
    <PageContainer
      eyebrow={`${month}${isDemo ? ' · demo' : ''}`}
      title={<>Your month, <span className="italic">so far.</span></>}
      center
      band={<Receipt safe={safe} month={new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })} monthlyIncomePaise={monthlyIncome} onSaveIncome={saveIncome} />}
    >
      <div className="mx-auto w-full max-w-[860px] space-y-7">
        <AppTabs
          layoutId="money-tabs"
          value={tab}
          onChange={setTab}
          tabs={[
            { id: 'subscriptions', label: 'Subscriptions', count: activeSubs },
            { id: 'activity', label: 'Activity' },
            { id: 'goals', label: 'Goals', count: goals.length },
          ]}
        />
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.28, ease: EASE_OUT }}>
            {tab === 'subscriptions' && <SubscriptionsPage embedded />}
            {tab === 'activity' && <TransactionsPage embedded />}
            {tab === 'goals' && <Goals />}
          </motion.div>
        </AnimatePresence>
      </div>
    </PageContainer>
  );
}

/** Savings goals, each a jar that fills as you put money in. */
function Goals() {
  const reduce = useReducedMotion();
  const goals = useDashboardStore((s) => s.goals);
  const addGoal = useDashboardStore((s) => s.addGoal);
  const deleteGoal = useDashboardStore((s) => s.deleteGoal);
  const [form, setForm] = useState<{ name: string; target: string; monthly: string } | null>(null);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    const target = Number(form.target.replace(/[^\d]/g, ''));
    const monthly = Number(form.monthly.replace(/[^\d]/g, ''));
    if (!form.name.trim() || !(target > 0)) return;
    void addGoal({ id: `goal-${Date.now().toString(36)}`, goal: form.name.trim(), targetAmount: toPaise(target), currentAmount: 0, monthlyContribution: toPaise(monthly || 0), deadline: null });
    setForm(null);
  };

  const field = 'h-12 w-full rounded-full border border-rc-ink/15 bg-white px-5 text-[16px] outline-none focus:border-rc-forest/50';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="max-w-[46ch] text-[14px] text-rc-muted">Money set aside for a goal each month is kept out of what’s safe to spend.</p>
        {!form && <button type="button" onClick={() => setForm({ name: '', target: '', monthly: '' })} className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-rc-ink px-4 text-[14px] font-medium text-rc-cream hover:bg-rc-moss"><Plus size={15} /> Goal</button>}
      </div>

      <AnimatePresence initial={false}>
        {form && (
          <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} onSubmit={save} className="overflow-hidden rounded-[26px] border border-rc-ink/[0.08] bg-rc-paper">
            <div className="grid gap-2.5 p-4 sm:grid-cols-2 sm:p-5">
              <input autoFocus className={`${field} sm:col-span-2`} placeholder="What for? e.g. Goa trip" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} aria-label="Goal" />
              <input className={field} inputMode="numeric" placeholder="Target ₹" value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value })} aria-label="Target in rupees" />
              <input className={field} inputMode="numeric" placeholder="Each month ₹" value={form.monthly} onChange={(e) => setForm({ ...form, monthly: e.target.value })} aria-label="Each month in rupees" />
            </div>
            <div className="flex justify-end gap-2 border-t border-rc-ink/[0.07] px-4 py-3">
              <button type="button" onClick={() => setForm(null)} className="h-10 rounded-full px-4 text-[14px] text-rc-muted hover:text-rc-ink">Cancel</button>
              <button type="submit" className="h-10 rounded-full bg-rc-ink px-5 text-[14px] font-medium text-rc-cream">Save goal</button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {goals.length === 0 && !form ? (
        <button type="button" onClick={() => setForm({ name: '', target: '', monthly: '' })} className="flex w-full items-center gap-4 rounded-[24px] border border-dashed border-rc-ink/20 px-5 py-6 text-left hover:border-rc-ink/40">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-rc-pistachio text-rc-forest"><PiggyBank size={22} /></span>
          <span>
            <span className="block text-[16px] font-semibold text-rc-ink">Start a goal</span>
            <span className="block text-[14px] text-rc-muted">A trip, a phone, an emergency fund.</span>
          </span>
        </button>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {goals.map((g, i) => {
            const pct = g.targetAmount > 0 ? Math.min(1, g.currentAmount / g.targetAmount) : 0;
            const monthsLeft = g.monthlyContribution > 0 ? Math.ceil(Math.max(0, g.targetAmount - g.currentAmount) / g.monthlyContribution) : null;
            return (
              <motion.li key={g.id} initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE_OUT, delay: i * 0.06 }} className="flex gap-4 rounded-[24px] border border-rc-ink/[0.08] bg-rc-paper p-4">
                {/* the jar */}
                <div aria-hidden className="relative h-[92px] w-[64px] shrink-0 overflow-hidden rounded-b-[20px] rounded-t-[12px] border-2 border-rc-ink/15 bg-white">
                  <span className="absolute inset-x-2 top-0 h-2 rounded-b-md bg-rc-ink/15" />
                  <motion.span className="absolute inset-x-0 bottom-0 bg-rc-forest" initial={reduce ? false : { height: 0 }} animate={{ height: `${Math.max(6, pct * 100)}%` }} transition={{ duration: 1.1, ease: EASE_OUT, delay: 0.2 + i * 0.06 }} />
                  <span className="absolute inset-x-0 bottom-1.5 text-center text-[11px] font-semibold text-white mix-blend-difference">{Math.round(pct * 100)}%</span>
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate font-serif text-[21px] font-semibold leading-tight text-rc-ink">{g.goal}</p>
                    <button type="button" onClick={() => void deleteGoal(g.id)} aria-label={`Remove ${g.goal}`} className="-mr-1 -mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-rc-muted hover:bg-rc-ink/[0.06] hover:text-rc-ink"><Trash2 size={15} /></button>
                  </div>
                  <p className="mt-1 text-[14px] text-rc-ink"><span className="font-semibold tabular-nums">{formatRupees(g.currentAmount)}</span> <span className="text-rc-muted">of {formatRupees(g.targetAmount)}</span></p>
                  <p className="mt-auto text-[13px] text-rc-muted">{formatRupees(g.monthlyContribution)} a month{monthsLeft != null ? ` · about ${monthsLeft} ${monthsLeft === 1 ? 'month' : 'months'} to go` : ''}</p>
                </div>
              </motion.li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
