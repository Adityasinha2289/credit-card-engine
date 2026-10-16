import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useShallow } from 'zustand/shallow';
import { useDashboardStore } from '../../../features/dashboard/store/dashboardStore';
import { SafeToSpendEngine, CardDueEngine } from '../../../features/money/engines/SafeToSpendEngine';
import { formatRupees, toPaise, daysUntil, isValidDate } from '../../../features/money/lib/moneyMath';
import { useIsDemo } from '../../../features/demo/DemoAppProvider';
import { PageContainer } from '../../../components/shared/PageContainer';

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
    () => subscriptions
      .filter((s) => s.status === 'active' && isValidDate(s.nextBillingDate))
      .map((s) => ({ sub: s, days: daysUntil(s.nextBillingDate) }))
      .filter(({ days }) => days >= 0 && days <= UPCOMING_WINDOW_DAYS)
      .sort((a, b) => a.days - b.days),
    [subscriptions],
  );

  if (isHydratingFromSupabase) {
    return (
      <PageContainer title="Money Manager">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500 animate-pulse">Loading Money Manager...</p>
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

  return (
    <PageContainer title="Money Manager" className="pb-safe max-w-3xl mx-auto">
      <div className="py-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* Money Pulse */}
        <section className="bg-white p-6 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-display font-medium text-gray-900">This Month</h2>
            {isDemo && <span className="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold tracking-wider uppercase rounded">Demo</span>}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-gray-50 rounded-2xl">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Spent</p>
              <p className="text-2xl font-medium text-gray-900">{formatRupees(safe.netSpent)}</p>
              {safe.refunds > 0 && (
                <p className="text-xs text-gray-500 mt-1">after {formatRupees(safe.refunds)} refunds</p>
              )}
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Income</p>
              <p className="text-2xl font-medium text-gray-900">{safe.hasIncome ? formatRupees(safe.totalIncome) : '—'}</p>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Safe to Spend</p>
            {safe.hasIncome ? (
              <>
                <p className="text-4xl font-display font-medium text-emerald-600 mb-1">{formatRupees(safe.safeToSpend)}</p>
                <p className="text-sm text-gray-600 mb-2">
                  ≈ {formatRupees(safe.perDay)}/day for the next {safe.daysLeft} {safe.daysLeft === 1 ? 'day' : 'days'}
                </p>
                <p className="text-xs text-gray-500">
                  Income minus what you've spent
                  {safe.reservedForBudgets > 0 && <>, {formatRupees(safe.reservedForBudgets)} still reserved for budgets</>}
                  {safe.upcomingSubscriptions > 0 && <>, {formatRupees(safe.upcomingSubscriptions)} in renewals due this month</>}
                  {safe.savingsTarget > 0 && <> and {formatRupees(safe.savingsTarget)} for savings goals</>}.
                </p>
              </>
            ) : (
              <form onSubmit={saveIncome} className="mt-2 space-y-2">
                <p className="text-sm text-gray-600">Tell us your monthly take-home pay to see what's safe to spend.</p>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                    <input
                      inputMode="numeric"
                      value={incomeInput}
                      onChange={(e) => setIncomeInput(e.target.value)}
                      placeholder="e.g. 75,000"
                      aria-label="Monthly income in rupees"
                      className="w-full pl-7 pr-3 py-2 rounded-xl border border-gray-200 focus:border-gray-900 outline-none"
                    />
                  </div>
                  <button type="submit" className="px-4 py-2 rounded-xl bg-gray-900 text-white text-sm font-medium disabled:opacity-50" disabled={!incomeInput}>
                    Save
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>

        {/* What Needs Attention */}
        {hasAttention && (
          <section>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Needs Attention</h3>
            <div className="space-y-3">
              {dueAlerts.map((due) => (
                <div key={due.cardId} className="bg-red-50 p-4 rounded-2xl border border-red-100 flex justify-between items-center gap-4">
                  <div>
                    <p className="text-red-900 font-medium">
                      {due.state === 'OVERDUE'
                        ? `Your ${due.name} bill is overdue`
                        : `Your ${due.name} bill is due ${due.daysRemaining === 0 ? 'today' : `in ${due.daysRemaining} ${due.daysRemaining === 1 ? 'day' : 'days'}`}`}
                    </p>
                    <p className="text-sm text-red-700 mt-1">Minimum due keeps the account active, but paying in full avoids interest.</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-red-900">{formatRupees(due.totalDue)}</p>
                    <p className="text-xs text-red-700 uppercase">Outstanding</p>
                  </div>
                </div>
              ))}

              {needsDueDate.map((card) => (
                <div key={card.cardId} className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex flex-wrap justify-between items-center gap-3">
                  <div>
                    <p className="text-gray-900 font-medium">{card.name}: {formatRupees(card.outstanding)} outstanding</p>
                    <p className="text-sm text-gray-500 mt-1">Add the payment due date so we can remind you before it's late.</p>
                  </div>
                  <input
                    type="date"
                    aria-label={`Payment due date for ${card.name}`}
                    onChange={(e) => e.target.value && void setCardDueDate(card.cardId, e.target.value)}
                    className="px-3 py-2 rounded-xl border border-gray-200 text-sm"
                  />
                </div>
              ))}

              {upcomingRenewals.map(({ sub, days }) => (
                <div key={sub.id} className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex justify-between items-center gap-4">
                  <div>
                    <p className="text-amber-900 font-medium">
                      {sub.isFreeTrial ? `${sub.name} free trial converts to paid` : `${sub.name} renews`}{' '}
                      {days === 0 ? 'today' : days === 1 ? 'tomorrow' : `in ${days} days`}
                    </p>
                    {sub.hasPriceHike && sub.previousAmount ? (
                      <p className="text-sm text-amber-800 mt-1">Price went up from {formatRupees(sub.previousAmount)}.</p>
                    ) : null}
                  </div>
                  <p className="font-bold text-amber-900 shrink-0">{formatRupees(sub.amount)}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Savings goals */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Savings Goals</h3>
            {!goalForm && (
              <button onClick={() => setGoalForm({ name: '', target: '', monthly: '' })} className="text-xs font-bold text-emerald-700">
                + Add goal
              </button>
            )}
          </div>
          {goalForm && (
            <form onSubmit={saveGoal} className="bg-white p-4 rounded-2xl border border-gray-100 grid grid-cols-1 sm:grid-cols-4 gap-2 mb-3">
              <input className="px-3 py-2 rounded-xl border border-gray-200 text-sm sm:col-span-2" placeholder="Goal (e.g. Goa trip)" value={goalForm.name} onChange={(e) => setGoalForm({ ...goalForm, name: e.target.value })} aria-label="Goal name" />
              <input className="px-3 py-2 rounded-xl border border-gray-200 text-sm" inputMode="numeric" placeholder="Target ₹" value={goalForm.target} onChange={(e) => setGoalForm({ ...goalForm, target: e.target.value })} aria-label="Target amount in rupees" />
              <input className="px-3 py-2 rounded-xl border border-gray-200 text-sm" inputMode="numeric" placeholder="Per month ₹" value={goalForm.monthly} onChange={(e) => setGoalForm({ ...goalForm, monthly: e.target.value })} aria-label="Monthly contribution in rupees" />
              <div className="sm:col-span-4 flex justify-end gap-2">
                <button type="button" onClick={() => setGoalForm(null)} className="px-3 py-1.5 text-sm text-gray-500">Cancel</button>
                <button type="submit" className="px-4 py-1.5 rounded-xl bg-gray-900 text-white text-sm">Save goal</button>
              </div>
            </form>
          )}
          {goals.length === 0 && !goalForm ? (
            <p className="text-sm text-gray-500">No goals yet. Money you set aside for goals is excluded from safe-to-spend.</p>
          ) : (
            <div className="space-y-2">
              {goals.map((g) => {
                const pct = g.targetAmount > 0 ? Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100)) : 0;
                return (
                  <div key={g.id} className="bg-white p-4 rounded-2xl border border-gray-100">
                    <div className="flex justify-between items-center">
                      <p className="font-medium text-gray-900">{g.goal}</p>
                      <button onClick={() => void deleteGoal(g.id)} className="text-xs text-gray-400 hover:text-red-500" aria-label={`Remove goal ${g.goal}`}>Remove</button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatRupees(g.currentAmount)} of {formatRupees(g.targetAmount)} · {formatRupees(g.monthlyContribution)}/month
                    </p>
                    <div className="h-1.5 bg-gray-100 rounded-full mt-2">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Quick Tools */}
        <section className="grid grid-cols-2 gap-4">
          <Link to="/app/money/coach" className="bg-gray-900 p-5 rounded-3xl text-white block hover:bg-gray-800 transition-colors">
            <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center mb-4">
              ✨
            </div>
            <h3 className="font-medium mb-1">Payment Coach</h3>
            <p className="text-xs text-gray-400">Ask which card to use</p>
          </Link>
          <Link to="/app/money/transactions" className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm block hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              🧾
            </div>
            <h3 className="font-medium text-gray-900 mb-1">Transactions</h3>
            <p className="text-xs text-gray-500">View recent activity</p>
          </Link>
        </section>

      </div>
    </PageContainer>
  );
}
