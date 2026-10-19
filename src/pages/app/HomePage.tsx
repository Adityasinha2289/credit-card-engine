/**
 * Overview: the front page of My RenoCred, and the one place to ask "which card?".
 * It answers that from the user's own cards, shows only what needs attention,
 * the wallet at a glance and shortcuts to the rest.
 */
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useShallow } from 'zustand/shallow';
import { useUser } from '@clerk/clerk-react';
import { CalendarClock, CreditCard, Library, Plane, Plus, Repeat, Scale, Search } from 'lucide-react';
import { useDashboardStore } from '../../features/dashboard/store/dashboardStore';
import { evaluatePayment } from '../../features/financial-engine/rewardsApi';
import { upcomingCharges } from '../../features/subscriptions/reminderPlanner';
import { istDate } from '../../features/subscriptions/billingCycle';
import { CardDueEngine } from '../../features/money/engines/SafeToSpendEngine';
import { formatRupees } from '../../features/money/lib/moneyMath';
import { CardFace, displayCardName } from '../../public-platform/site/CardFace';
import { EASE_OUT } from '../../public-platform/site/primitives';
import { PageContainer } from '../../components/shared/PageContainer';
import { Amount, EmptyState, HeadAction, IconTile, Row, RowList, SectionHead, type Tone } from '../../components/shared/appUi';
import { SPEND_CATEGORIES, CATALOGUE_STATS, cardsByIds } from '../../public-platform/site/swipeMath';
import { walletCoverage } from './walletCoverage';
import { cn } from '../../lib/utils';

const QUICK = [
  { label: 'Swiggy', merchant: 'Swiggy', amount: 600 },
  { label: 'Amazon', merchant: 'Amazon', amount: 2500 },
  { label: 'Fuel', merchant: 'Indian Oil', amount: 3000 },
  { label: 'Flights', merchant: 'MakeMyTrip', amount: 9000 },
  { label: 'Groceries', merchant: 'BigBasket', amount: 2000 },
  { label: 'Movies', merchant: 'BookMyShow', amount: 800 },
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
        icon: CalendarClock,
        tone: 'danger' as Tone,
        title: d.state === 'OVERDUE' ? `${d.name} bill is overdue` : `${d.name} bill due ${d.daysRemaining === 0 ? 'today' : `in ${d.daysRemaining} days`}`,
        note: 'Pay in full to avoid interest',
        amount: formatRupees(d.totalDue),
        to: '/app/money',
      }));
    const renewals = upcomingCharges(subscriptions, istDate(), 7).map((u) => ({
      id: `sub-${u.subscription.id}`,
      icon: Repeat,
      tone: 'warn' as Tone,
      title: `${u.subscription.name} ${u.kind === 'trial_ending' ? 'trial turns paid' : 'renews'} ${u.daysLeft === 0 ? 'today' : u.daysLeft === 1 ? 'tomorrow' : `in ${u.daysLeft} days`}`,
      note: u.kind === 'trial_ending' ? 'Cancel before then if you don’t want it' : 'Still using it?',
      amount: formatRupees(u.subscription.amount),
      to: '/app/money?tab=subscriptions',
    }));
    const noLimit = userCards.filter((c) => !(c.creditLimit > 0)).length;
    const setup = noLimit > 0 ? [{
      id: 'limits',
      icon: CreditCard,
      tone: 'quiet' as Tone,
      title: `Add the credit limit for ${noLimit} ${noLimit === 1 ? 'card' : 'cards'}`,
      note: 'So we can tell you how much of it you’re using',
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
  const coverage = useMemo(() => walletCoverage(userCards.map((c) => c.id)), [userCards]);
  const weekRenewals = useMemo(() => upcomingCharges(subscriptions, istDate(), 7).reduce((s, u) => s + u.subscription.amount, 0), [subscriptions]);

  const hasCards = userCards.length > 0;

  const whichCard = hasCards ? (
    <div className="max-w-[640px]">
      <div className="overflow-hidden rounded-[26px] bg-rc-cream text-rc-ink shadow-[0_30px_60px_-30px_rgba(0,0,0,0.6)]">
        <form onSubmit={(e) => e.preventDefault()} className="grid grid-cols-[1fr_auto] divide-x divide-rc-ink/10">
          <label className="flex min-w-0 items-center gap-3 pl-5">
            <Search aria-hidden size={18} className="shrink-0 text-rc-ink/40" />
            <span className="sr-only">Where are you paying?</span>
            <input
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              placeholder="Where are you paying?"
              enterKeyHint="next"
              className="h-[60px] w-full min-w-0 bg-transparent text-[16px] outline-none placeholder:text-rc-ink/40"
            />
          </label>
          <label className="flex w-[118px] items-center gap-1 px-4 sm:w-[150px]">
            <span className="sr-only">Amount in rupees</span>
            <span aria-hidden className="text-[16px] text-rc-ink/45">₹</span>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              inputMode="numeric"
              enterKeyHint="done"
              placeholder="Amount"
              className="h-[60px] w-full min-w-0 bg-transparent text-[16px] tabular-nums outline-none placeholder:text-rc-ink/40"
            />
          </label>
        </form>

        <AnimatePresence initial={false} mode="wait">
          {result?.best ? (
            <motion.div
              key={`${result.best.card.id}-${amountNum}`}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35, ease: EASE_OUT }}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-4 border-t border-rc-ink/10 bg-rc-pistachio px-4 py-4 sm:px-5">
                <motion.div initial={{ y: 16, rotate: -6 }} animate={{ y: 0, rotate: -3 }} transition={{ duration: 0.5, ease: EASE_OUT }}>
                  <CardFace name={result.best.card.name} bank={result.best.card.bank} network={result.best.card.network} width={92} lifted={false} />
                </motion.div>
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-medium text-rc-forest">Pay with</p>
                  <p className="truncate font-serif text-[19px] font-semibold leading-tight">{displayCardName(result.best.card.name)}</p>
                  <p className="mt-0.5 truncate text-[13px] text-rc-ink/65">
                    {result.best.rewardRate}% on {result.category}
                    {result.secondBest && result.delta > 0 ? ` · ${rupees(result.delta)} more than your next best` : ''}
                  </p>
                </div>
                <p className="shrink-0 font-serif text-[26px] font-semibold leading-none tabular-nums text-rc-forest">
                  {result.best.confidence !== 'EXACT' ? '~' : ''}+{rupees(result.best.cappedRewardValue)}
                </p>
              </div>
            </motion.div>
          ) : result ? (
            <motion.p key="none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="border-t border-rc-ink/10 px-5 py-4 text-[14px] text-rc-muted">
              None of your cards has a published reward for this. Try the shop’s name, like “Swiggy” or “Amazon”.
            </motion.p>
          ) : null}
        </AnimatePresence>
      </div>

      <div className="-mx-5 mt-3 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0 [&::-webkit-scrollbar]:hidden">
        {QUICK.map((q) => (
          <button
            key={q.label}
            type="button"
            onClick={() => { setMerchant(q.merchant); setAmount(String(q.amount)); }}
            className={cn('h-9 shrink-0 rounded-full border px-4 text-[13px] transition-colors', merchant === q.merchant ? 'border-rc-pistachio bg-rc-pistachio font-medium text-rc-ink' : 'border-white/15 text-rc-mist hover:border-white/40 hover:text-rc-cream')}
          >
            {q.label}
          </button>
        ))}
      </div>
    </div>
  ) : (
    <Link to="/app/wallet" className="group inline-flex h-14 items-center gap-3 rounded-full bg-rc-cream pl-6 pr-2 text-[15px] font-medium text-rc-ink">
      Add your cards <span className="flex h-10 w-10 items-center justify-center rounded-full bg-rc-ink text-rc-cream"><Plus size={18} /></span>
    </Link>
  );

  const shortcuts = [
    { to: '/app/discover?tab=compare', icon: Scale, title: 'Compare cards', note: 'Two to four, side by side' },
    { to: '/app/money?tab=subscriptions', icon: Repeat, title: 'Track a subscription', note: 'Reminded before it renews' },
    { to: '/app/plan', icon: Plane, title: 'Plan a trip', note: 'Which card at every step' },
    { to: '/cards', icon: Library, title: `Browse ${CATALOGUE_STATS.listed} cards`, note: 'Every Indian card we’ve read' },
  ];

  return (
    <PageContainer
      eyebrow={new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
      title={<>{greeting}{firstName ? <>, <span className="italic">{firstName}.</span></> : '.'}</>}
      subtitle={hasCards ? 'About to pay? Type the shop and the amount; we’ll pick the card that earns the most.' : 'Add the cards you own and RenoCred tells you which one to use every time you pay.'}
      heroActions={whichCard}
    >
      {/* the wallet in three numbers */}
      {hasCards && (
        <section aria-label="At a glance" className="grid grid-cols-3 gap-2.5 sm:gap-4">
          {[
            { to: '/app/wallet', value: userCards.length, label: userCards.length === 1 ? 'card' : 'cards' },
            { to: '/app/money?tab=subscriptions', value: weekRenewals > 0 ? formatRupees(weekRenewals) : '₹0', label: 'renewing this week' },
            { to: '/app/wallet', value: coverage ? `${coverage.overall}%` : '–', label: 'of the best rates' },
          ].map((s) => (
            <Link key={s.label} to={s.to} className="rounded-[22px] border border-rc-ink/[0.08] bg-rc-paper px-3.5 py-4 transition-colors hover:bg-white sm:px-5 sm:py-5">
              <p className="truncate font-serif text-[24px] font-semibold leading-none tabular-nums lining-nums text-rc-ink sm:text-[32px]">{s.value}</p>
              <p className="mt-2 text-[12px] leading-snug text-rc-muted sm:text-[13px]">{s.label}</p>
            </Link>
          ))}
        </section>
      )}

      <div className="grid gap-9 lg:grid-cols-[1.1fr_1fr] lg:gap-10">
        {/* needs attention */}
        <section>
          <SectionHead title="Needs you" />
          {attention.length === 0 ? (
            <RowList>
              <Row icon={CalendarClock} tone="good" title="You’re all caught up" note="Bills due and renewals this week show up here." />
            </RowList>
          ) : (
            <RowList>
              {attention.map((a) => (
                <Row key={a.id} icon={a.icon} tone={a.tone} title={a.title} note={a.note} to={a.to} trailing={a.amount ? <Amount>{a.amount}</Amount> : undefined} />
              ))}
            </RowList>
          )}
        </section>

        {/* shortcuts */}
        <section>
          <SectionHead title="Shortcuts" />
          <ul className="grid grid-cols-2 gap-2.5 sm:gap-3">
            {shortcuts.map((s) => (
              <li key={s.to}>
                <Link to={s.to} className="flex h-full flex-col rounded-[22px] border border-rc-ink/[0.08] bg-rc-paper p-4 transition-colors hover:bg-white">
                  <IconTile icon={s.icon} tone="ink" className="h-10 w-10" />
                  <span className="mt-4 text-[15px] font-semibold leading-snug text-rc-ink">{s.title}</span>
                  <span className="mt-0.5 text-[13px] leading-snug text-rc-muted">{s.note}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* your cards */}
      <section>
        <SectionHead title="Your cards" action={<HeadAction to="/app/wallet">{hasCards ? 'Manage' : 'Add a card'}</HeadAction>} />
        {hasCards ? (
          <ul className="-mx-5 flex snap-x snap-mandatory scroll-px-5 gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:snap-none sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3 [&::-webkit-scrollbar]:hidden">
            {userCards.map((c) => {
              const job = bestAt(c.id);
              return (
                <li key={c.id} className="w-[78%] max-w-[300px] shrink-0 snap-start sm:w-auto sm:max-w-none">
                  <Link to="/app/wallet" className="block rounded-[24px] border border-rc-ink/[0.08] bg-rc-paper p-2.5 transition-colors hover:bg-white">
                    <CardFace name={c.label || 'Credit card'} bank={c.bank || ''} network={c.network} width={300} lifted={false} className="!h-auto !w-full aspect-[1.586]" />
                    <p className="mt-3 truncate px-1.5 text-[15px] font-semibold text-rc-ink">{displayCardName(c.label || '')}</p>
                    <p className="px-1.5 pb-1.5 text-[13px] text-rc-muted">{job ? `Best at ${job}` : 'No published rates'}</p>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyState icon={CreditCard} title="Add your first card" note="Pick it from the catalogue. No card number needed." action={<HeadAction to="/app/wallet"><Plus size={14} /> Add a card</HeadAction>} />
        )}
      </section>
    </PageContainer>
  );
}
