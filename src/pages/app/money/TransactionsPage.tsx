import { useMemo, useState } from 'react';
import { useDashboardStore } from '../../../features/dashboard/store/dashboardStore';
import { PageContainer } from '../../../components/shared/PageContainer';
import { formatRupees, isSpend, isRefund, isCardPayment } from '../../../features/money/lib/moneyMath';
import { CATEGORY_STYLES } from '../../../features/cards/components/CategoryIcon';
import type { Transaction } from '../../../features/dashboard/types/dashboard.types';

type Filter = 'ALL' | 'SPENT' | 'IN' | 'CARD_PAYMENTS';

const FILTERS: { key: Filter; label: string; test: (t: Transaction) => boolean }[] = [
  { key: 'ALL', label: 'All', test: () => true },
  { key: 'SPENT', label: 'Spent', test: isSpend },
  { key: 'IN', label: 'Refunds & credits', test: isRefund },
  { key: 'CARD_PAYMENTS', label: 'Card payments', test: isCardPayment },
];

export default function TransactionsPage({ embedded = false }: { embedded?: boolean }) {
  const transactions = useDashboardStore(s => s.transactions);
  const userCards = useDashboardStore(s => s.userCards);
  const [filter, setFilter] = useState<Filter>('ALL');

  const getInstrumentName = (cardId?: string) => {
    if (!cardId) return 'Bank / UPI';
    const card = userCards.find(c => c.id === cardId);
    return card ? (card.label || card.bank || 'Card') : 'Card';
  };

  const filtered = useMemo(() => {
    const test = FILTERS.find((f) => f.key === filter)?.test ?? (() => true);
    return transactions
      .filter(test)
      .slice()
      .sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
  }, [transactions, filter]);

  return (
    <PageContainer bare={embedded} eyebrow="Money" title={<>Where it <span className="italic">went.</span></>} subtitle="Your recent spending, by card and category." className="pb-safe max-w-3xl mx-auto">
      <div className="space-y-4">

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              aria-pressed={filter === f.key}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filter === f.key ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] divide-y divide-gray-50">
          {filtered.map(t => {
            const inflow = t.amount < 0 || t.type === 'refund' || t.type === 'credit';
            const categoryLabel = CATEGORY_STYLES[t.category]?.label ?? t.category ?? 'Other';
            return (
              <div key={t.id} className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-lg ${inflow ? 'bg-emerald-50' : 'bg-gray-100'}`}>
                    {(t.merchant?.trim()?.[0] ?? '?').toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">{t.merchant || 'Unknown merchant'}</p>
                    <p className="text-xs text-gray-500">{categoryLabel} • {getInstrumentName(t.cardId)}{t.pending ? ' • Pending' : ''}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className={`font-medium ${inflow ? 'text-emerald-600' : 'text-gray-900'}`}>
                    {inflow ? '+' : ''}{formatRupees(t.amount)}
                  </p>
                  <p className="text-[13px] font-medium text-rc-muted mt-1">
                    {new Date(t.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' })}
                  </p>
                </div>
              </div>
            );
          })}
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
