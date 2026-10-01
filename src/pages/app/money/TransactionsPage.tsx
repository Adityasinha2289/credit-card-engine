import React, { useState } from 'react';
import { useDashboardStore } from '../../../features/dashboard/store/dashboardStore';
import { PageContainer } from '../../../components/shared/PageContainer';

export default function TransactionsPage() {
  const transactions = useDashboardStore(s => s.transactions);
  const creditAccounts = useDashboardStore(s => s.creditAccounts);
  const userCards = useDashboardStore(s => s.userCards);
  const [filter, setFilter] = useState<'ALL' | 'CREDIT'>('ALL');

  const getInstrumentName = (cardId?: string) => {
    if (!cardId) return 'Cash/Other';
    const card = userCards.find(c => c.id === cardId);
    return card ? `${card.bank} ${card.label}` : cardId;
  };

  const filtered = transactions.filter(t => {
    if (filter === 'ALL') return true;
    if (filter === 'CREDIT' && t.cardId) return true;
    return false;
  });

  return (
    <PageContainer title="Recent Transactions" className="pb-safe max-w-3xl mx-auto">
      <div className="py-6 space-y-4 animate-in fade-in slide-in-from-bottom-4">
        
        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {(['ALL', 'CREDIT'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filter === f ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] divide-y divide-gray-50">
          {filtered.map(t => (
            <div key={t.id} className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${t.type === 'credit' ? 'bg-emerald-50' : 'bg-gray-100'}`}>
                  {t.merchant[0]}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{t.merchant}</p>
                  <p className="text-xs text-gray-500">{t.category} • {getInstrumentName(t.cardId)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-medium ${t.type === 'credit' ? 'text-emerald-600' : 'text-gray-900'}`}>
                  {t.type === 'credit' ? '+' : ''}₹{t.amount.toLocaleString('en-IN')}
                </p>
                <p className="text-[10px] uppercase tracking-widest text-gray-400 mt-1">
                  {new Date(t.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </p>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No transactions found for this filter.
            </div>
          )}
        </div>

      </div>
    </PageContainer>
  );
}
