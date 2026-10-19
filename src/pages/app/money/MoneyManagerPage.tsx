import { useMemo, useState } from 'react';
import { useShallow } from 'zustand/shallow';
import { useDashboardStore } from '../../../features/dashboard/store/dashboardStore';
import { SafeToSpendEngine, CardDueEngine } from '../../../features/money/engines/SafeToSpendEngine';
import { formatRupees, toPaise } from '../../../features/money/lib/moneyMath';
import { upcomingCharges } from '../../../features/subscriptions/reminderPlanner';
import { istDate } from '../../../features/subscriptions/billingCycle';
import { useIsDemo } from '../../../features/demo/DemoAppProvider';
import { PageContainer } from '../../../components/shared/PageContainer';
import { AppTabs, useTab } from '../../../components/shared/AppTabs';
import SubscriptionsPage from './SubscriptionsPage';
import TransactionsPage from './TransactionsPage';
import { CalendarClock, PiggyBank, Plus, Repeat, Trash2 } from 'lucide-react';
import { Amount, EmptyState, HeadAction, Panel, Pill, Row, RowList, SectionHead } from '../../../components/shared/appUi';
import { cn } from '../../../lib/utils';

const UPCOMING_WINDOW_DAYS = 7;

export default function MoneyManagerPage() {
  const {
    transactions,
    budgets,
    subscriptions,
    goals,
    profile,
    creditAccounts,
    userCards,
    isHydratingFromSupabase,
  } = useDashboardStore(useShallow((s) => ({
    transactions: s.transactions,
    budgets: s.budgets,
    subscriptions: s.subscriptions,
    goals: s.goals,
    profile: s.profile,
    creditAccounts: s.creditAccounts,
    userCards: s.userCards,
    isHydratingFromSupabase: s.isHydratingFromSupabase,
  })));
  const updateProfile = useDashboardStore((s) => s.updateProfile);
  const setCardDueDate = useDashboardStore((s) => s.setCardDueDate);
  const addGoal = useDashboardStore((s) => s.addGoal);
  const deleteGoal = useDashboardStore((s) => s.deleteGoal);
  const isDemo = useIsDemo();

  const [incomeInput, setIncomeInput] = useState('');
  const [goalForm, setGoalForm] = useState<{ name: string; target: string; monthly: string } | null>(null);
  const [tab, setTab] = useTab(['overview', 'subscriptions', 'activity'] as const, 'overview');

  // Profile salary is ANNUAL RUPEES; everything else here is paise.
  const monthlyIncome = profile?.salary ? toPaise(profile.salary / 12) : null;

  const safe = useMemo(
    () => SafeToSpendEngine.calculate({ monthlyIncome, transactions, budgets, goals, subscriptions, isDemo }),
    [monthlyIncome, transactions, budgets, goals, subscriptions, isDemo],
  );

  const cardNames = useMemo(() => {
    const names: Record<string, string> = {};
    userCards.forEach((c) => { names[c.id] = c.label || [c.bank, 'card'].filter(Boolean).join(' '); });
    return names;
  }, [userCards]);

  const cardDues = useMemo(() => CardDueEngine.evaluate(creditAccounts, cardNames), [creditAccounts, cardNames]);
  const dueAlerts = cardDues.filter((c) => c.state === 'DUE_SOON' || c.state === 'DUE_TODAY' || c.state === 'OVERDUE');
  const needsDueDate = cardDues.filter((c) => c.outstanding > 0 && !c.dueDate);

  const upcomingRenewals = useMemo(
    () => upcomingCharges(subscriptions, istDate(), UPCOMING_WINDOW_DAYS)
      .map((u) => ({ sub: u.subscription, days: u.daysLeft, trial: u.kind === 'trial_ending' })),
    [subscriptions],
  );

  if (isHydratingFromSupabase) {
    return (
      <PageContainer eyebrow="Money" title="Your money, this month.">
        <div className="flex h-48 items-center justify-center">
          <p className="animate-pulse text-rc-muted">Loading your month…</p>
        </div>
      </PageContainer>
    );
  }

  const saveIncome = (e: React.FormEvent) => {
    e.preventDefault();
    const monthlyRupees = parseFloat(incomeInput.replace(/,/g, ''));
    if (!profile || !Number.isFinite(monthlyRupees) || monthlyRupees <= 0) return;
    void updateProfile({ ...profile, salary: Math.round(monthlyRupees * 12) });
    setIncomeInput('');
  };

  const saveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalForm) return;
    const target = parseFloat(goalForm.target);
    const monthly = parseFloat(goalForm.monthly);
    if (!goalForm.name.trim() || !(target > 0) || !(monthly >= 0)) return;
    void addGoal({
      id: `goal-${Date.now().toString(36)}`,
      goal: goalForm.name.trim(),
      targetAmount: toPaise(target),
      currentAmount: 0,
      monthlyContribution: toPaise(monthly || 0),
      deadline: null,
    });
    setGoalForm(null);
  };

  const hasAttention = dueAlerts.length > 0 || needsDueDate.length > 0 || upcomingRenewals.length > 0;
  const activeSubs = subscriptions.filter((s) => s.status === 'active').length;
  const spentShare = safe.hasIncome && safe.totalIncome > 0 ? Math.min(1, safe.netSpent / safe.totalIncome) : 0;
  const month = new Date().toLocaleDateString('en-IN', { month: 'long' });

  return (
    <PageContainer
      eyebrow={`${month}${isDemo ? ' · demo' : ''}`}
      title={safe.hasIncome
        ? <>{formatRupees(safe.safeToSpend)} <span className="italic">safe to spend.</span></>
        : <>Your money, <span className="italic">this month.</span></>}
      subtitle={safe.hasIncome
        ? <>About {formatRupees(safe.perDay)} a day for the next {safe.daysLeft} {safe.daysLeft === 1 ? 'day' : 'days'}, after what you've spent{safe.upcomingSubscriptions > 0 ? ', renewals due' : ''}{safe.savingsTarget > 0 ? ' and your savings goals' : ''}.</>
        : 'Tell us your monthly take-home pay and RenoCred works out what you can spend without touching bills, renewals or savings.'}
      heroStats={safe.hasIncome ? [
        { value: formatRupees(safe.netSpent), label: safe.refunds > 0 ? `spent, after ${formatRupees(safe.refunds)} refunds` : 'spent so far' },
        { value: formatRupees(safe.totalIncome), label: 'income' },
        ...(safe.upcomingSubscriptions > 0 ? [{ value: formatRupees(safe.upcomingSubscriptions), label: 'renewals due' }] : []),
      ] : undefined}
      heroActions={safe.hasIncome ? (
        <div className="max-w-md lg:hidden" aria-hidden>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-rc-pistachio" style={{ width: `${Math.max(2, Math.round(spentShare * 100))}%` }} />
          </div>
          <p className="mt-2 text-[13px] text-rc-mist">{Math.round(spentShare * 100)}% of this month’s income spent</p>
        </div>
      ) : (
        <form onSubmit={saveIncome} className="flex w-full max-w-md gap-2">
          <label className="relative flex-1">
            <span className="sr-only">Monthly take-home pay in rupees</span>
            <span aria-hidden className="absolute left-4 top-1/2 -translate-y-1/2 text-rc-ink/50">₹</span>
            <input
              inputMode="numeric"
              value={incomeInput}
              onChange={(e) => setIncomeInput(e.target.value)}
              placeholder="e.g. 75,000"
              className="h-12 w-full rounded-full bg-rc-cream pl-8 pr-4 text-[15px] text-rc-ink outline-none placeholder:text-rc-ink/40"
            />
          </label>
          <button type="submit" disabled={!incomeInput} className="h-12 rounded-full bg-rc-pistachio px-6 text-[14px] font-semibold text-rc-ink transition-opacity disabled:opacity-50">Save</button>
        </form>
      )}
      heroAside={safe.hasIncome ? <SpendRing share={spentShare} /> : undefined}
      className="pb-safe"
    >
      <AppTabs
        layoutId="money-tabs"
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'overview', label: 'Overview' },
          { id: 'subscriptions', label: 'Subscriptions', count: activeSubs },
          { id: 'activity', label: 'Activity' },
        ]}
      />
      {tab === 'subscriptions' && <SubscriptionsPage embedded />}
      {tab === 'activity' && <TransactionsPage embedded />}
      {tab === 'overview' && (
      <div className="grid gap-9 lg:grid-cols-2 lg:gap-10">
        {/* what needs attention */}
        <section>
          <SectionHead title="Needs attention" action={<HeadAction onClick={() => setTab('subscriptions')}>Subscriptions</HeadAction>} />
          {!hasAttention ? (
            <RowList>
              <Row icon={CalendarClock} tone="good" title="Nothing due this week" note="Card bills and renewals in the next 7 days show up here." />
            </RowList>
          ) : (
            <RowList>
              {dueAlerts.map((due) => (
                <Row
                  key={due.cardId}
                  icon={CalendarClock}
                  tone="danger"
                  title={due.state === 'OVERDUE' ? `${due.name} bill is overdue` : `${due.name} bill due ${due.daysRemaining === 0 ? 'today' : `in ${due.daysRemaining} ${due.daysRemaining === 1 ? 'day' : 'days'}`}`}
                  note="Pay in full to avoid interest; the minimum only keeps the account active."
                  trailing={<Amount>{formatRupees(due.totalDue)}</Amount>}
                />
              ))}
              {needsDueDate.map((card) => (
                <div key={card.cardId} className="px-4 py-3.5 sm:px-5">
                  <p className="text-[15px] font-medium text-rc-ink">{card.name}: {formatRupees(card.outstanding)} outstanding</p>
                  <p className="mt-0.5 text-[13px] text-rc-muted">Add the payment due date and we’ll remind you before it’s late.</p>
                  <input
                    type="date"
                    aria-label={`Payment due date for ${card.name}`}
                    onChange={(e) => e.target.value && void setCardDueDate(card.cardId, e.target.value)}
                    className="mt-3 h-11 w-full rounded-full border border-rc-ink/15 bg-white px-4 text-[15px] text-rc-ink sm:w-auto"
                  />
                </div>
              ))}
              {upcomingRenewals.map(({ sub, days, trial }) => (
                <Row
                  key={sub.id}
                  icon={Repeat}
                  tone="warn"
                  title={`${trial ? `${sub.name} trial turns paid` : `${sub.name} renews`} ${days === 0 ? 'today' : days === 1 ? 'tomorrow' : `in ${days} days`}`}
                  note={sub.hasPriceHike && sub.previousAmount ? `Price went up from ${formatRupees(sub.previousAmount)}.` : 'Still using it?'}
                  trailing={<Amount>{formatRupees(sub.amount)}</Amount>}
                  onClick={() => setTab('subscriptions')}
                />
              ))}
            </RowList>
          )}
        </section>

        {/* savings goals */}
        <section>
          <SectionHead
            title="Savings goals"
            action={!goalForm && <HeadAction onClick={() => setGoalForm({ name: '', target: '', monthly: '' })}><Plus size={14} /> Add</HeadAction>}
          />
          {goalForm && (
            <form onSubmit={saveGoal} className="mb-3 rounded-[26px] border border-rc-ink/[0.08] bg-rc-paper p-4 sm:p-5">
              <div className="grid gap-2.5 sm:grid-cols-2">
                <input className="h-12 rounded-full border border-rc-ink/15 bg-white px-5 text-[16px] sm:col-span-2" placeholder="What for? e.g. Goa trip" value={goalForm.name} onChange={(e) => setGoalForm({ ...goalForm, name: e.target.value })} aria-label="Goal name" />
                <input className="h-12 rounded-full border border-rc-ink/15 bg-white px-5 text-[16px]" inputMode="numeric" placeholder="Target ₹" value={goalForm.target} onChange={(e) => setGoalForm({ ...goalForm, target: e.target.value })} aria-label="Target amount in rupees" />
                <input className="h-12 rounded-full border border-rc-ink/15 bg-white px-5 text-[16px]" inputMode="numeric" placeholder="Per month ₹" value={goalForm.monthly} onChange={(e) => setGoalForm({ ...goalForm, monthly: e.target.value })} aria-label="Monthly contribution in rupees" />
              </div>
              <div className="mt-3 flex justify-end gap-2">
                <Pill variant="ghost" onClick={() => setGoalForm(null)}>Cancel</Pill>
                <Pill type="submit">Save goal</Pill>
              </div>
            </form>
          )}
          {goals.length === 0 && !goalForm ? (
            <EmptyState icon={PiggyBank} title="No goals yet" note="Money you set aside for a goal is kept out of safe-to-spend." action={<Pill onClick={() => setGoalForm({ name: '', target: '', monthly: '' })}><Plus size={16} /> Add a goal</Pill>} />
          ) : (
            <ul className="space-y-2.5">
              {goals.map((g) => {
                const pct = g.targetAmount > 0 ? Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100)) : 0;
                const monthsLeft = g.monthlyContribution > 0 ? Math.ceil(Math.max(0, g.targetAmount - g.currentAmount) / g.monthlyContribution) : null;
                return (
                  <Panel as="li" key={g.id} className="p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-serif text-[21px] font-semibold leading-tight text-rc-ink">{g.goal}</p>
                        <p className="mt-1 text-[13px] text-rc-muted">
                          {formatRupees(g.monthlyContribution)} a month{monthsLeft != null ? ` · about ${monthsLeft} ${monthsLeft === 1 ? 'month' : 'months'} to go` : ''}
                        </p>
                      </div>
                      <button type="button" onClick={() => void deleteGoal(g.id)} aria-label={`Remove goal ${g.goal}`} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-rc-muted hover:bg-rc-ink/[0.06] hover:text-rc-ink">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-rc-ink/[0.08]">
                      <div className="h-full rounded-full bg-rc-forest" style={{ width: `${Math.max(pct, 2)}%` }} />
                    </div>
                    <p className="mt-2 flex justify-between text-[13px] tabular-nums text-rc-muted">
                      <span><span className="font-semibold text-rc-ink">{formatRupees(g.currentAmount)}</span> saved</span>
                      <span>of {formatRupees(g.targetAmount)}</span>
                    </p>
                  </Panel>
                );
              })}
            </ul>
          )}
        </section>
      </div>
      )}
    </PageContainer>
  );
}

/** How much of this month's income is already spent, as a ring. */
function SpendRing({ share }: { share: number }) {
  const r = 62;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative h-[168px] w-[168px]">
      <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90" aria-hidden>
        <circle cx="80" cy="80" r={r} fill="none" stroke="rgba(227,238,212,0.12)" strokeWidth="14" />
        <circle cx="80" cy="80" r={r} fill="none" stroke="#E3EED4" strokeWidth="14" strokeLinecap="round" strokeDasharray={`${c * share} ${c}`} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="font-display text-[34px] font-semibold leading-none text-rc-cream">{Math.round(share * 100)}%</span>
        <span className="mt-1 text-[12px] text-rc-mist">of income spent</span>
      </div>
    </div>
  );
}
