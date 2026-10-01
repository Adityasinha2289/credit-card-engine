import React, { useMemo } from 'react';
import { useDashboardStore } from '../../../features/dashboard/store/dashboardStore';
import { useMoneyStore } from '../../../features/money/store/moneyStore';
import { SafeToSpendEngine, CardDueEngine } from '../../../features/money/engines/SafeToSpendEngine';
import { PageContainer } from '../../../components/shared/PageContainer';
import { Link } from 'react-router-dom';

export default function MoneyManagerPage() {
  const { 
    transactions,
    budgets,
    subscriptions,
    profile,
    creditAccounts,
    userCards,
    isHydratingFromSupabase
  } = useDashboardStore();
  
  // We still get goals from money store for now since dashboard doesn't have it natively,
  // but we don't load the isolated transactions anymore!
  const { goals } = useMoneyStore();
  
  const isDemoMode = new URLSearchParams(window.location.search).get('demo') !== null || import.meta.env.VITE_USE_DEMO_DATA === 'true';

  if (isHydratingFromSupabase) {
    return (
      <PageContainer title="Money Manager">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500 animate-pulse">Loading Money Manager...</p>
        </div>
      </PageContainer>
    );
  }

  // Calculate Safe to Spend using canonical transactions
  const safeData = SafeToSpendEngine.calculate(
    profile?.salary ? profile.salary / 12 : 75000, 
    transactions, 
    budgets, 
    goals, 
    subscriptions, 
    isDemoMode
  );
  
  const cardNames = useMemo(() => {
    const names: Record<string, string> = {};
    userCards.forEach(c => names[c.id] = c.name);
    return names;
  }, [userCards]);

  // Calculate Card Dues using canonical credit accounts
  const cardDues = CardDueEngine.evaluate(creditAccounts, cardNames);
  const upcomingDues = cardDues.filter(c => c.state === 'DUE_SOON' || c.state === 'DUE_TODAY' || c.state === 'OVERDUE_DEMO');

  return (
    <PageContainer title="Money Manager" className="pb-safe max-w-3xl mx-auto">
      <div className="py-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Money Pulse */}
        <section className="bg-white p-6 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-display font-medium text-gray-900">This Month</h2>
            {isDemoMode && <span className="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold tracking-wider uppercase rounded">Demo</span>}
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-gray-50 rounded-2xl">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Spent</p>
              <p className="text-2xl font-medium text-gray-900">₹{safeData.netSpent.toLocaleString('en-IN')}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Income</p>
              <p className="text-2xl font-medium text-gray-900">₹{Math.round(safeData.totalIncome).toLocaleString('en-IN')}</p>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Safe to Spend</p>
            <p className="text-4xl font-display font-medium text-emerald-600 mb-2">₹{safeData.safeToSpend.toLocaleString('en-IN')}</p>
            <p className="text-sm text-gray-500">Based on your Demo budget & committed expenses.</p>
          </div>
        </section>

        {/* What Needs Attention */}
        {(upcomingDues.length > 0 || subscriptions.length > 0) && (
          <section>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Needs Attention</h3>
            <div className="space-y-3">
              {upcomingDues.map(due => (
                <div key={due.cardId} className="bg-red-50 p-4 rounded-2xl border border-red-100 flex justify-between items-center">
                  <div>
                    <p className="text-red-900 font-medium">Your {due.name} bill is due {due.daysRemaining === 0 ? 'today' : `in ${due.daysRemaining} days`}</p>
                    <p className="text-sm text-red-700 mt-1">Minimum due keeps the account active, but paying full avoids interest.</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-900">₹{Math.round(due.totalDue / 100).toLocaleString('en-IN')}</p>
                    <p className="text-xs text-red-700 uppercase">Total Due</p>
                  </div>
                </div>
              ))}
              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
                <p className="text-amber-900 font-medium">{subscriptions.length} recurring payments are tracked.</p>
              </div>
            </div>
          </section>
        )}

        {/* Quick Tools */}
        <section className="grid grid-cols-2 gap-4">
          <Link to="/app/money/coach" className="bg-gray-900 p-5 rounded-3xl text-white block hover:bg-gray-800 transition-colors">
            <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center mb-4">
              ✨
            </div>
            <h3 className="font-medium mb-1">Payment Coach</h3>
            <p className="text-xs text-gray-400">Ask what to use</p>
          </Link>
          <Link to="/app/wallet" className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm block hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              🧾
            </div>
            <h3 className="font-medium text-gray-900 mb-1">Wallet</h3>
            <p className="text-xs text-gray-500">View recent activity</p>
          </Link>
        </section>

      </div>
    </PageContainer>
  );
}
