/**
 * Activity: what you've spent, newest first, and a quick way to log a spend
 * (which also feeds safe-to-spend and your picks).
 */
import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { Plus, Receipt } from 'lucide-react';
import { useDashboardStore } from '../../../features/dashboard/store/dashboardStore';
import { PageContainer } from '../../../components/shared/PageContainer';
import { formatRupees, isSpend, isRefund, isCardPayment, toPaise } from '../../../features/money/lib/moneyMath';
import { CATEGORY_STYLES } from '../../../features/cards/components/CategoryIcon';
import type { Transaction, TransactionCategory } from '../../../features/dashboard/types/dashboard.types';
import { evaluatePayment } from '../../../features/financial-engine/rewardsApi';
import { displayCardName } from '../../../public-platform/site/CardFace';
import { Amount, EmptyState, HeadAction, Pill, RowList } from '../../../components/shared/appUi';
import { cn } from '../../../lib/utils';

type Filter = 'ALL' | 'SPENT' | 'IN' | 'CARD_PAYMENTS';

const FILTERS: { key: Filter; label: string; test: (t: Transaction) => boolean }[] = [
  { key: 'ALL', label: 'All', test: () => true },
  { key: 'SPENT', label: 'Spent', test: isSpend },
  { key: 'IN', label: 'Refunds', test: isRefund },
  { key: 'CARD_PAYMENTS', label: 'Bill payments', test: isCardPayment },
];

const LOG_CATEGORIES: TransactionCategory[] = ['dining', 'shopping', 'groceries', 'travel', 'fuel', 'transport', 'entertainment', 'utilities', 'health', 'other'];

const todayIso = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

export default function TransactionsPage({ embedded = false }: { embedded?: boolean }) {
  const transactions = useDashboardStore((s) => s.transactions);
  const userCards = useDashboardStore((s) => s.userCards);
  const addTransaction = useDashboardStore((s) => s.addTransaction);
  const [filter, setFilter] = useState<Filter>('ALL');
  const [log, setLog] = useState<{ merchant: string; amount: string; category: TransactionCategory; cardId: string; date: string } | null>(null);

  const instrument = (cardId?: string) => {
    if (!cardId) return 'Bank / UPI';
    const card = userCards.find((c) => c.id === cardId);
    return card ? displayCardName(card.label || card.bank || 'Card') : 'Card';
  };

  const filtered = useMemo(() => {
    const test = FILTERS.find((f) => f.key === filter)?.test ?? (() => true);
    return transactions.filter(test).slice().sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
  }, [transactions, filter]);

  const openLog = () => setLog({ merchant: '', amount: '', category: 'dining', cardId: userCards[0]?.id ?? '', date: todayIso() });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!log) return;
    const rupees = Number(log.amount.replace(/[^\d.]/g, ''));
    if (!log.merchant.trim() || !(rupees > 0)) return void toast.error('Add where you paid and how much.');
    const entry = { ...log, merchant: log.merchant.trim() };
    setLog(null);
    try {
      await addTransaction({
        merchant: entry.merchant,
        amount: toPaise(rupees),
        category: entry.category,
        type: 'debit',
        cardId: entry.cardId,
        date: new Date(`${entry.date}T12:00:00+05:30`).toISOString(),
      });
      // was there a better card for it?
      const verdict = evaluatePayment(entry.merchant, rupees, userCards.filter((c) => c.status === 'active').map((c) => c.id));
      const best = verdict?.best;
      if (best && entry.cardId && best.card.id !== entry.cardId && best.cappedRewardValue > 0) {
        toast.success(`Logged. Next time, ${displayCardName(best.card.name)} earns about ₹${Math.round(best.cappedRewardValue)} here.`);
      } else {
        toast.success('Logged.');
      }
    } catch {
      toast.error('Couldn’t save that. Try again in a moment.');
    }
  };

  const field = 'mt-1.5 h-12 w-full rounded-full border border-rc-ink/15 bg-white px-5 text-[16px] text-rc-ink outline-none focus:border-rc-forest/50';

  return (
    <PageContainer bare={embedded} eyebrow="Money" title={<>Where it <span className="italic">went.</span></>} subtitle="Your recent spending, by card and category." className="pb-safe">
      <div className="max-w-[760px] space-y-5">
        {transactions.length > 0 && (
          <div className="flex items-center justify-between gap-3">
            <p className="text-[14px] text-rc-muted">Newest first. Logged spends feed what’s safe to spend and your picks.</p>
            {!log && <HeadAction onClick={openLog}><Plus size={14} /> Log a spend</HeadAction>}
          </div>
        )}

        <AnimatePresence initial={false}>
          {log && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={submit}
              className="overflow-hidden rounded-[26px] border border-rc-ink/[0.08] bg-rc-paper"
            >
              <div className="grid gap-3.5 p-4 sm:grid-cols-2 sm:p-5">
                <label className="block text-[13px] font-medium text-rc-muted">Where
                  <input className={field} value={log.merchant} onChange={(e) => setLog({ ...log, merchant: e.target.value })} placeholder="e.g. Swiggy" autoFocus />
                </label>
                <label className="block text-[13px] font-medium text-rc-muted">How much
                  <input className={field} inputMode="decimal" value={log.amount} onChange={(e) => setLog({ ...log, amount: e.target.value })} placeholder="₹" />
                </label>
                <label className="block text-[13px] font-medium text-rc-muted">Paid with
                  <select className={field} value={log.cardId} onChange={(e) => setLog({ ...log, cardId: e.target.value })}>
                    {userCards.map((c) => <option key={c.id} value={c.id}>{displayCardName(c.label || c.bank || 'Card')}</option>)}
                    <option value="">UPI / bank account</option>
                  </select>
                </label>
                <label className="block text-[13px] font-medium text-rc-muted">On
                  <input type="date" max={todayIso()} className={field} value={log.date} onChange={(e) => setLog({ ...log, date: e.target.value })} />
                </label>
                <div className="sm:col-span-2">
                  <p className="text-[13px] font-medium text-rc-muted">What for</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {LOG_CATEGORIES.map((c) => (
                      <button key={c} type="button" aria-pressed={log.category === c} onClick={() => setLog({ ...log, category: c })}
                        className={cn('h-9 rounded-full border px-3.5 text-[13px]', log.category === c ? 'border-rc-ink bg-rc-ink text-rc-cream' : 'border-rc-ink/15 bg-white text-rc-ink')}>
                        {CATEGORY_STYLES[c]?.label ?? c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 border-t border-rc-ink/[0.07] px-4 py-3 sm:px-5">
                <Pill variant="ghost" onClick={() => setLog(null)}>Cancel</Pill>
                <Pill type="submit">Log it</Pill>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {transactions.length > 0 && (
          <div className="-mx-5 flex gap-2 overflow-x-auto px-5 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
            {FILTERS.map((f) => (
              <button key={f.key} type="button" onClick={() => setFilter(f.key)} aria-pressed={filter === f.key}
                className={cn('h-9 shrink-0 rounded-full px-4 text-[13px] font-medium transition-colors', filter === f.key ? 'bg-rc-ink text-rc-cream' : 'bg-rc-ink/[0.06] text-rc-ink hover:bg-rc-ink/[0.1]')}>
                {f.label}
              </button>
            ))}
          </div>
        )}

        {transactions.length === 0 ? (
          !log && <EmptyState icon={Receipt} title="No spending logged yet" note="Log what you spend and safe-to-spend gets exact, and picks use your real spending instead of an estimate." action={<Pill onClick={openLog}><Plus size={16} /> Log a spend</Pill>} />
        ) : filtered.length === 0 ? (
          <p className="rounded-[22px] border border-dashed border-rc-ink/15 px-5 py-6 text-center text-[14px] text-rc-muted">Nothing here for this filter.</p>
        ) : (
          <RowList>
            {filtered.map((t) => {
              const inflow = t.amount < 0 || t.type === 'refund' || t.type === 'credit';
              const style = CATEGORY_STYLES[t.category];
              const Icon = style?.Icon ?? Receipt;
              return (
                <div key={t.id} className="flex items-center gap-3.5 px-4 py-3 sm:px-5">
                  <span className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px]', inflow ? 'bg-rc-pistachio text-rc-forest' : 'bg-rc-ink/[0.06] text-rc-forest')}>
                    <Icon size={18} strokeWidth={1.8} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-medium text-rc-ink">{t.merchant || 'Unknown merchant'}</p>
                    <p className="truncate text-[13px] text-rc-muted">{style?.label ?? t.category} · {instrument(t.cardId)}{t.pending ? ' · pending' : ''}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <Amount className={inflow ? 'text-rc-forest' : undefined}>{inflow ? '+' : ''}{formatRupees(Math.abs(t.amount))}</Amount>
                    <p className="text-[12px] text-rc-muted">{new Date(t.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' })}</p>
                  </div>
                </div>
              );
            })}
          </RowList>
        )}
      </div>
    </PageContainer>
  );
}
