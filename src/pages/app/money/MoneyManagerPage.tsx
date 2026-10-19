import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useShallow } from 'zustand/shallow';
import { useDashboardStore } from '../../../features/dashboard/store/dashboardStore';
import { SafeToSpendEngine, CardDueEngine } from '../../../features/money/engines/SafeToSpendEngine';
import { formatRupees, toPaise } from '../../../features/money/lib/moneyMath';
import { upcomingCharges } from '../../../features/subscriptions/reminderPlanner';
import { istDate } from '../../../features/subscriptions/billingCycle';
import { useIsDemo } from '../../../features/demo/DemoAppProvider';
import { PageContainer } from '../../../components/shared/PageContainer';
import { Plus, Receipt, Repeat, Sparkles } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { ArrowChip } from '../../../public-platform/site/primitives';

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
      heroActions={!safe.hasIncome ? (
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
      ) : undefined}
      heroAside={safe.hasIncome ? <SpendRing share={spentShare} /> : undefined}
      className="pb-safe"
    >
      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-10">
          {/* What needs attention */}
          {hasAttention && (
            <section>
              <SectionTitle title="Needs attention" action={<Link to="/app/money/subscriptions" className="text-[13px] font-medium text-rc-forest hover:underline">All subscriptions</Link>} />
              <ul className="space-y-2.5">
                {dueAlerts.map((due) => (
                  <AttentionRow
                    key={due.cardId}
                    tone="danger"
                    title={due.state === 'OVERDUE'
                      ? `${due.name} bill is overdue`
                      : `${due.name} bill is due ${due.daysRemaining === 0 ? 'today' : `in ${due.daysRemaining} ${due.daysRemaining === 1 ? 'day' : 'days'}`}`}
                    note="Paying the full amount avoids interest; the minimum only keeps the account active."
                    amount={formatRupees(due.totalDue)}
                  />
                ))}
                {needsDueDate.map((card) => (
                  <li key={card.cardId} className="flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-rc-ink/10 bg-rc-paper px-5 py-4">
                    <div className="flex items-start gap-3">
                      <span aria-hidden className="mt-2 h-2 w-2 shrink-0 rounded-full bg-rc-sage" />
                      <div>
                        <p className="font-medium text-rc-ink">{card.name}: {formatRupees(card.outstanding)} outstanding</p>
                        <p className="mt-0.5 text-[14px] text-rc-muted">Add the payment due date and we'll remind you before it's late.</p>
                      </div>
                    </div>
                    <input
                      type="date"
                      aria-label={`Payment due date for ${card.name}`}
                      onChange={(e) => e.target.value && void setCardDueDate(card.cardId, e.target.value)}
                      className="h-10 rounded-full border border-rc-ink/15 bg-white px-4 text-[14px] text-rc-ink"
                    />
                  </li>
                ))}
                {upcomingRenewals.map(({ sub, days, trial }) => (
                  <AttentionRow
                    key={sub.id}
                    tone="warn"
                    title={`${trial ? `${sub.name} trial turns paid` : `${sub.name} renews`} ${days === 0 ? 'today' : days === 1 ? 'tomorrow' : `in ${days} days`}`}
                    note={sub.hasPriceHike && sub.previousAmount ? `Price went up from ${formatRupees(sub.previousAmount)}.` : undefined}
                    amount={formatRupees(sub.amount)}
                  />
                ))}
              </ul>
            </section>
          )}

          {/* Savings goals */}
          <section>
            <SectionTitle
              title="Savings goals"
              action={!goalForm && (
                <button onClick={() => setGoalForm({ name: '', target: '', monthly: '' })} className="inline-flex items-center gap-1.5 rounded-full bg-rc-ink px-4 py-2 text-[13px] font-medium text-rc-cream hover:bg-rc-moss">
                  <Plus className="h-3.5 w-3.5" /> Add goal
                </button>
              )}
            />
            {goalForm && (
              <form onSubmit={saveGoal} className="mb-3 grid grid-cols-1 gap-2 rounded-[24px] border border-rc-ink/10 bg-rc-paper p-4 sm:grid-cols-4">
                <input className="h-11 rounded-full border border-rc-ink/15 bg-white px-4 text-[14px] sm:col-span-2" placeholder="Goal (e.g. Goa trip)" value={goalForm.name} onChange={(e) => setGoalForm({ ...goalForm, name: e.target.value })} aria-label="Goal name" />
                <input className="h-11 rounded-full border border-rc-ink/15 bg-white px-4 text-[14px]" inputMode="numeric" placeholder="Target ₹" value={goalForm.target} onChange={(e) => setGoalForm({ ...goalForm, target: e.target.value })} aria-label="Target amount in rupees" />
                <input className="h-11 rounded-full border border-rc-ink/15 bg-white px-4 text-[14px]" inputMode="numeric" placeholder="Per month ₹" value={goalForm.monthly} onChange={(e) => setGoalForm({ ...goalForm, monthly: e.target.value })} aria-label="Monthly contribution in rupees" />
                <div className="flex justify-end gap-2 sm:col-span-4">
                  <button type="button" onClick={() => setGoalForm(null)} className="rounded-full px-4 py-2 text-[14px] text-rc-muted hover:text-rc-ink">Cancel</button>
                  <button type="submit" className="rounded-full bg-rc-ink px-5 py-2 text-[14px] font-medium text-rc-cream hover:bg-rc-moss">Save goal</button>
                </div>
              </form>
            )}
            {goals.length === 0 && !goalForm ? (
              <p className="rounded-[24px] border border-dashed border-rc-ink/15 px-5 py-6 text-[15px] text-rc-muted">
                No goals yet. Money you set aside for a goal is kept out of safe-to-spend.
              </p>
            ) : (
              <ul className="space-y-2.5">
                {goals.map((g) => {
                  const pct = g.targetAmount > 0 ? Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100)) : 0;
                  const monthsLeft = g.monthlyContribution > 0 ? Math.ceil(Math.max(0, g.targetAmount - g.currentAmount) / g.monthlyContribution) : null;
                  return (
                    <li key={g.id} className="rounded-[24px] border border-rc-ink/10 bg-rc-paper px-5 py-4">
                      <div className="flex items-baseline justify-between gap-4">
                        <p className="font-display text-[22px] font-semibold leading-tight text-rc-ink">{g.goal}</p>
                        <button onClick={() => void deleteGoal(g.id)} className="text-[12px] text-rc-muted hover:text-rc-ink" aria-label={`Remove goal ${g.goal}`}>Remove</button>
                      </div>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-rc-ink/10">
                        <div className="h-full rounded-full bg-rc-forest" style={{ width: `${Math.max(pct, 2)}%` }} />
                      </div>
                      <p className="mt-2 flex flex-wrap justify-between gap-x-4 text-[13px] text-rc-muted">
                        <span>{formatRupees(g.currentAmount)} of {formatRupees(g.targetAmount)}</span>
                        <span>{formatRupees(g.monthlyContribution)} a month{monthsLeft != null ? ` · about ${monthsLeft} ${monthsLeft === 1 ? 'month' : 'months'} to go` : ''}</span>
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>

        {/* Tools */}
        <aside className="space-y-2.5">
          <ToolTile to="/app/money/coach" icon={Sparkles} title="Payment coach" body="Ask which card to use before you pay." featured />
          <ToolTile to="/app/money/subscriptions" icon={Repeat} title="Subscriptions" body={activeSubs > 0 ? `${activeSubs} tracked, reminders on` : 'Track renewals and free trials.'} />
          <ToolTile to="/app/money/transactions" icon={Receipt} title="Transactions" body="Your recent spending, by card and category." />
        </aside>
      </div>
    </PageContainer>
  );
}

function SectionTitle({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-4">
      <h2 className="font-display text-[26px] font-semibold tracking-[-0.02em] text-rc-ink">{title}</h2>
      {action}
    </div>
  );
}

function AttentionRow({ tone, title, note, amount }: { tone: 'danger' | 'warn'; title: string; note?: string; amount: string }) {
  return (
    <li className="flex items-center justify-between gap-4 rounded-[24px] border border-rc-ink/10 bg-rc-paper px-5 py-4">
      <div className="flex items-start gap-3">
        <span aria-hidden className={cn('mt-2 h-2 w-2 shrink-0 rounded-full', tone === 'danger' ? 'bg-[#C2410C]' : 'bg-[#B7791F]')} />
        <div>
          <p className="font-medium text-rc-ink">{title}</p>
          {note && <p className="mt-0.5 text-[14px] text-rc-muted">{note}</p>}
        </div>
      </div>
      <p className="shrink-0 font-display text-[20px] font-semibold tabular-nums text-rc-ink">{amount}</p>
    </li>
  );
}

function ToolTile({ to, icon: Icon, title, body, featured }: { to: string; icon: typeof Sparkles; title: string; body: string; featured?: boolean }) {
  return (
    <Link
      to={to}
      className={cn(
        'group flex items-start justify-between gap-4 rounded-[24px] p-5 transition-[transform,border-color] duration-300 hover:-translate-y-0.5',
        featured ? 'bg-rc-pistachio text-rc-ink' : 'border border-rc-ink/10 bg-rc-paper text-rc-ink hover:border-rc-ink/25',
      )}
    >
      <span>
        <span className={cn('flex h-10 w-10 items-center justify-center rounded-2xl', featured ? 'bg-rc-ink text-rc-pistachio' : 'bg-rc-ink/[0.06] text-rc-forest')}>
          <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
        </span>
        <span className="mt-4 block font-display text-[21px] font-semibold leading-tight">{title}</span>
        <span className="mt-1 block text-[14px] leading-relaxed text-rc-ink/70">{body}</span>
      </span>
      <ArrowChip variant="ink" size="sm" />
    </Link>
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
