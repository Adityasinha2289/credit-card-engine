/**
 * Today: the app's front page, and the one place to ask "which card?". It answers
 * that from the user's own cards, shows only what needs attention, and lists the
 * wallet at a glance. Everything else lives in Wallet, Money or Discover.
 */
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useShallow } from 'zustand/shallow';
import { useUser } from '@clerk/clerk-react';
import { Plus } from 'lucide-react';
import { useDashboardStore } from '../../features/dashboard/store/dashboardStore';
import { evaluatePayment } from '../../features/financial-engine/rewardsApi';
import { upcomingCharges } from '../../features/subscriptions/reminderPlanner';
import { istDate } from '../../features/subscriptions/billingCycle';
import { CardDueEngine } from '../../features/money/engines/SafeToSpendEngine';
import { formatRupees } from '../../features/money/lib/moneyMath';
import { CardFace, displayCardName } from '../../public-platform/site/CardFace';
import { ArrowChip, EASE_OUT } from '../../public-platform/site/primitives';
import { SPEND_CATEGORIES, cardsByIds } from '../../public-platform/site/swipeMath';
import { cn } from '../../lib/utils';

const QUICK = [
  { label: 'Swiggy', merchant: 'Swiggy', amount: 600 },
  { label: 'Amazon', merchant: 'Amazon', amount: 2500 },
  { label: 'Fuel', merchant: 'Indian Oil', amount: 3000 },
  { label: 'Flights', merchant: 'MakeMyTrip', amount: 9000 },
  { label: 'Groceries', merchant: 'BigBasket', amount: 2000 },
];

const rupees = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

export default function HomePage() {
  const { user } = useUser();
  const { profile, userCards, subscriptions, creditAccounts, transactions } = useDashboardStore(useShallow((s) => ({
    profile: s.profile,
    userCards: s.userCards,
    subscriptions: s.subscriptions,
    creditAccounts: s.creditAccounts,
    transactions: s.transactions,
  })));

  const firstName = (profile?.name || user?.firstName || '').split(' ')[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState('');
  const amountNum = Number(amount.replace(/[^\d.]/g, ''));
  const activeIds = useMemo(() => userCards.filter((c) => c.status === 'active').map((c) => c.id), [userCards]);
  const result = useMemo(() => {
    if (!merchant.trim() || !(amountNum > 0) || activeIds.length === 0) return null;
    return evaluatePayment(merchant.trim(), amountNum, activeIds, { previousTransactions: transactions });
  }, [merchant, amountNum, activeIds, transactions]);

  // only what needs the user: bills due soon, renewals this week, missing limits
  const attention = useMemo(() => {
    const names: Record<string, string> = {};
    userCards.forEach((c) => { names[c.id] = c.label || c.bank || 'Card'; });
    const dues = CardDueEngine.evaluate(creditAccounts, names)
      .filter((d) => d.state === 'OVERDUE' || d.state === 'DUE_TODAY' || d.state === 'DUE_SOON')
      .map((d) => ({
        id: `due-${d.cardId}`,
        tone: 'danger' as const,
        title: d.state === 'OVERDUE' ? `${d.name} bill is overdue` : `${d.name} bill due ${d.daysRemaining === 0 ? 'today' : `in ${d.daysRemaining} days`}`,
        amount: formatRupees(d.totalDue),
        to: '/app/money',
      }));
    const renewals = upcomingCharges(subscriptions, istDate(), 7).map((u) => ({
      id: `sub-${u.subscription.id}`,
      tone: 'warn' as const,
      title: `${u.subscription.name} ${u.kind === 'trial_ending' ? 'trial turns paid' : 'renews'} ${u.daysLeft === 0 ? 'today' : u.daysLeft === 1 ? 'tomorrow' : `in ${u.daysLeft} days`}`,
      amount: formatRupees(u.subscription.amount),
      to: '/app/money?tab=subscriptions',
    }));
    const noLimit = userCards.filter((c) => !(c.creditLimit > 0)).length;
    const setup = noLimit > 0 ? [{
      id: 'limits',
      tone: 'info' as const,
      title: `Add the credit limit for ${noLimit} ${noLimit === 1 ? 'card' : 'cards'}`,
      amount: '',
      to: '/app/wallet',
    }] : [];
    return [...dues, ...renewals, ...setup].slice(0, 4);
  }, [userCards, creditAccounts, subscriptions]);

  const catalogue = useMemo(() => new Map(cardsByIds(userCards.map((c) => c.id)).map((c) => [c.id, c])), [userCards]);
  const bestAt = (id: string) => {
    const top = [...(catalogue.get(id)?.rewards ?? [])].sort((a, b) => b.rate - a.rate)[0];
    return top ? `${(SPEND_CATEGORIES.find((s) => s.id === top.category)?.label ?? top.category).toLowerCase()}, ${top.rate}%` : null;
  };

  const hasCards = userCards.length > 0;

  return (
    <div className="mx-auto flex w-full max-w-[1120px] flex-1 flex-col gap-10 px-4 pb-28 pt-2 md:px-8 lg:px-12">
      {/* ── ask: which card for this payment ───────────────────────────────── */}
      <section className="relative overflow-hidden rounded-[32px] bg-rc-night px-5 py-8 text-rc-cream sm:px-8 md:rounded-[40px] md:px-10 md:py-11">
        <div aria-hidden className="pointer-events-none absolute -left-24 -top-32 h-[420px] w-[520px] rounded-full bg-[radial-gradient(closest-side,rgba(227,238,212,0.12),transparent)]" />
        <div className="relative">
          <p className="flex items-center gap-2.5 text-[12px] font-semibold uppercase tracking-[0.2em] text-rc-mist">
            <span aria-hidden className="h-2 w-2 rounded-full bg-rc-pistachio" />
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <h1 className="mt-4 font-display text-[clamp(2.1rem,4.6vw,3.6rem)] font-semibold leading-[1.02] tracking-[-0.03em]">
            {greeting}{firstName ? <>, <span className="italic text-rc-pistachio">{firstName}.</span></> : '.'}
          </h1>

          {hasCards ? (
            <>
              <p className="mt-3 text-[16px] text-rc-mist">About to pay? We'll tell you which card to use.</p>
              <form onSubmit={(e) => e.preventDefault()} className="mt-6 grid gap-2.5 sm:grid-cols-[1fr_170px]">
                <label className="block">
                  <span className="sr-only">Where are you paying?</span>
                  <input
                    value={merchant}
                    onChange={(e) => setMerchant(e.target.value)}
                    placeholder="Where? e.g. Swiggy"
                    className="h-14 w-full rounded-full bg-rc-cream px-6 text-[16px] text-rc-ink outline-none placeholder:text-rc-ink/40 focus:ring-2 focus:ring-rc-pistachio"
                  />
                </label>
                <label className="relative block">
                  <span className="sr-only">Amount in rupees</span>
                  <span aria-hidden className="absolute left-6 top-1/2 -translate-y-1/2 text-[16px] text-rc-ink/50">₹</span>
                  <input
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    inputMode="numeric"
                    placeholder="Amount"
                    className="h-14 w-full rounded-full bg-rc-cream pl-10 pr-6 text-[16px] tabular-nums text-rc-ink outline-none placeholder:text-rc-ink/40 focus:ring-2 focus:ring-rc-pistachio"
                  />
                </label>
              </form>
              <div className="mt-3 flex flex-wrap gap-2">
                {QUICK.map((q) => (
                  <button
                    key={q.label}
                    type="button"
                    onClick={() => { setMerchant(q.merchant); setAmount(String(q.amount)); }}
                    className={cn('rounded-full border px-3.5 py-1.5 text-[13px] transition-colors', merchant === q.merchant ? 'border-rc-pistachio bg-rc-pistachio text-rc-ink' : 'border-white/15 text-rc-mist hover:border-white/40 hover:text-rc-cream')}
                  >
                    {q.label}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait" initial={false}>
                {result?.best && (
                  <motion.div
                    key={`${result.best.card.id}-${amountNum}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.3, ease: EASE_OUT }}
                    className="mt-6 flex flex-col gap-5 rounded-[26px] bg-rc-pistachio p-4 text-rc-ink sm:flex-row sm:items-center sm:p-5"
                  >
                    <CardFace name={result.best.card.name} bank={result.best.card.bank} network={result.best.card.network} width={150} className="shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] text-rc-ink/60">Use</p>
                      <p className="font-display text-[24px] font-semibold leading-tight">{displayCardName(result.best.card.name)}</p>
                      <p className="mt-1 text-[14px] text-rc-ink/70">
                        {result.best.rewardRate}% on {result.category}
                        {result.secondBest && result.delta > 0 ? ` · ${rupees(result.delta)} more than ${displayCardName(result.secondBest.card.name)}` : ''}
                      </p>
                    </div>
                    <p className="font-display text-[34px] font-semibold leading-none tabular-nums text-rc-forest">
                      {result.best.confidence !== 'EXACT' ? '~' : ''}+{rupees(result.best.cappedRewardValue)}
                    </p>
                  </motion.div>
                )}
                {result && !result.best && (
                  <motion.p key="none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-6 text-[14px] text-rc-mist">
                    None of your cards has a published reward for this. Try the shop's name, like “Swiggy” or “Amazon”.
                  </motion.p>
                )}
              </AnimatePresence>
            </>
          ) : (
            <>
              <p className="mt-3 max-w-[44ch] text-[16px] text-rc-mist">Add the cards you own and RenoCred tells you which one to use every time you pay.</p>
              <Link to="/app/wallet" className="group mt-6 inline-flex h-12 items-center gap-3 rounded-full bg-rc-cream pl-6 pr-1.5 text-[14px] font-medium text-rc-ink hover:bg-white">
                Add your cards <ArrowChip variant="cream" size="md" />
              </Link>
            </>
          )}
        </div>
      </section>

      {/* ── needs attention ────────────────────────────────────────────────── */}
      <section>
        <h2 className="font-display text-[26px] font-semibold tracking-[-0.02em] text-rc-ink">Needs you</h2>
        {attention.length === 0 ? (
          <p className="mt-3 rounded-[22px] border border-dashed border-rc-ink/15 px-5 py-5 text-[15px] text-rc-muted">Nothing today. Bills due and renewals this week will show up here.</p>
        ) : (
          <ul className="mt-4 overflow-hidden rounded-[24px] border border-rc-ink/10 bg-rc-paper">
            {attention.map((a) => (
              <li key={a.id} className="border-b border-rc-ink/[0.07] last:border-0">
                <Link to={a.to} className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-white/70">
                  <span className="flex min-w-0 items-center gap-3">
                    <span aria-hidden className={cn('h-2 w-2 shrink-0 rounded-full', a.tone === 'danger' ? 'bg-[#C2410C]' : a.tone === 'warn' ? 'bg-[#B7791F]' : 'bg-rc-sage')} />
                    <span className="truncate text-[15px] text-rc-ink">{a.title}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-3">
                    {a.amount && <span className="font-display text-[19px] font-semibold tabular-nums text-rc-ink">{a.amount}</span>}
                    <span aria-hidden className="text-rc-muted">→</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ── your cards ─────────────────────────────────────────────────────── */}
      <section>
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-display text-[26px] font-semibold tracking-[-0.02em] text-rc-ink">Your cards</h2>
          <Link to="/app/wallet" className="text-[14px] font-medium text-rc-forest hover:underline">{hasCards ? 'Manage' : 'Add a card'}</Link>
        </div>
        {hasCards ? (
          <ul className="-mx-4 mt-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden">
            {userCards.map((c) => {
              const job = bestAt(c.id);
              return (
                <li key={c.id} className="w-[220px] shrink-0 snap-start md:w-auto">
                  <div className="rounded-[24px] border border-rc-ink/10 bg-rc-paper p-3">
                    <CardFace name={c.label || 'Credit card'} bank={c.bank || ''} network={c.network} width={300} lifted={false} className="!h-auto !w-full aspect-[1.586]" />
                    <p className="mt-3 truncate px-1 text-[15px] font-semibold text-rc-ink">{displayCardName(c.label || '')}</p>
                    <p className="px-1 pb-1 text-[13px] text-rc-muted">{job ? `Best at ${job}` : 'No published rates'}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <Link to="/app/wallet" className="mt-4 flex items-center justify-center gap-2 rounded-[24px] border border-dashed border-rc-ink/20 px-6 py-10 text-[15px] font-medium text-rc-ink hover:border-rc-ink/40">
            <Plus size={16} /> Add your first card
          </Link>
        )}
      </section>
    </div>
  );
}
