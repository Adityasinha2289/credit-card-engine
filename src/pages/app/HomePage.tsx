/**
 * Overview: which of your cards to pay with, and what's due this week.
 * The answer is the landing page's card holder, holding your own cards: pick a
 * spend (or type the shop and amount) and the best card rises out of it.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView, useReducedMotion } from 'framer-motion';
import { useShallow } from 'zustand/shallow';
import { useUser } from '@clerk/clerk-react';
import { toast } from 'sonner';
import { ArrowUpRight, Check, Plus, X } from 'lucide-react';
import { useDashboardStore } from '../../features/dashboard/store/dashboardStore';
import { evaluatePayment } from '../../features/financial-engine/rewardsApi';
import { upcomingCharges } from '../../features/subscriptions/reminderPlanner';
import { istDate } from '../../features/subscriptions/billingCycle';
import { getCancelUrl } from '../../features/subscriptions/presets';
import { CardDueEngine } from '../../features/money/engines/SafeToSpendEngine';
import { formatRupees } from '../../features/money/lib/moneyMath';
import { displayCardName } from '../../public-platform/site/CardFace';
import { EASE_OUT, Reveal } from '../../public-platform/site/primitives';
import { BorderProgress } from '../../public-platform/site/BorderProgress';
import { PageContainer } from '../../components/shared/PageContainer';
import { SPEND_CATEGORIES, cardsByIds, rankCards, rewardFor, type FinixCard, type SpendCategory } from '../../public-platform/site/swipeMath';
import AddCardModal from '../../features/dashboard/components/AddCardModal';
import { WalletHolder } from './overview/WalletHolder';
import { cn } from '../../lib/utils';

const rupees = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;
const MAX_IN_HOLDER = 5;
const ROTATE_MS = 2800;
const ROTATION = SPEND_CATEGORIES.filter((c) => c.id !== 'other').map((c) => c.id);

interface Answer {
  card: FinixCard; reward: number; rate: number; label: string; ahead: number | null; estimate: boolean;
  /** a card you pulled yourself that isn't the best here: which one is, and by how much */
  beatenBy?: { name: string; by: number };
}

export default function HomePage() {
  const reduce = useReducedMotion();
  const { user } = useUser();
  const { profile, userCards, subscriptions, creditAccounts, transactions, payBill } = useDashboardStore(useShallow((s) => ({
    profile: s.profile,
    userCards: s.userCards,
    subscriptions: s.subscriptions,
    creditAccounts: s.creditAccounts,
    transactions: s.transactions,
    payBill: s.payBill,
  })));

  const firstName = (profile?.name || user?.firstName || '').split(' ')[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const [category, setCategory] = useState<SpendCategory>('dining');
  const [amount, setAmount] = useState(2000);
  const [merchant, setMerchant] = useState('');
  const [adding, setAdding] = useState(false);
  // a card you pulled out yourself; stays out until you pick a spend or type a shop
  const [pinned, setPinned] = useState<string | null>(null);
  // the holder walks through spends on its own until you touch it
  const [auto, setAuto] = useState(true);
  const [hovering, setHovering] = useState(false);
  const stopAuto = () => setAuto(false);

  const activeIds = useMemo(() => userCards.filter((c) => c.status === 'active').map((c) => c.id), [userCards]);
  const wallet = useMemo(() => cardsByIds(activeIds), [activeIds]);

  // the shop decides when one is typed; otherwise the chosen kind of spend
  const answer = useMemo<Answer | null>(() => {
    if (wallet.length === 0 || !(amount > 0)) return null;
    if (merchant.trim().length >= 2) {
      const r = evaluatePayment(merchant.trim(), amount, activeIds, { previousTransactions: transactions });
      if (!r?.best) return null;
      const card = wallet.find((c) => c.id === r.best!.card.id) ?? (r.best.card as unknown as FinixCard);
      return { card, reward: r.best.cappedRewardValue, rate: r.best.rewardRate, label: r.category, ahead: r.secondBest && r.delta > 0 ? r.delta : null, estimate: r.best.confidence !== 'EXACT' };
    }
    const [best, next] = rankCards(wallet, category, amount);
    if (!best) return null;
    const label = SPEND_CATEGORIES.find((c) => c.id === category)?.label.toLowerCase() ?? category;
    const own = pinned ? wallet.find((c) => c.id === pinned) : undefined;
    if (own && own.id !== best.card.id) {
      const mine = rewardFor(own, category, amount);
      return {
        card: own, reward: mine.reward, rate: mine.rate, label: mine.categoryMatch ? label : `${label} (base rate)`, ahead: null, estimate: false,
        beatenBy: best.reward > mine.reward ? { name: displayCardName(best.card.name), by: best.reward - mine.reward } : undefined,
      };
    }
    return { card: best.card, reward: best.reward, rate: best.rate, label: best.categoryMatch ? label : `${label} (base rate)`, ahead: next && best.reward > next.reward ? best.reward - next.reward : null, estimate: false };
  }, [wallet, amount, merchant, activeIds, transactions, category, pinned]);

  // rotates only while the holder is on screen
  const holderRef = useRef<HTMLDivElement>(null);
  const onScreen = useInView(holderRef, { amount: 0.2 });
  useEffect(() => {
    if (!auto || hovering || reduce || merchant || pinned || wallet.length < 2 || !onScreen) return;
    const t = setInterval(() => setCategory((c) => ROTATION[(ROTATION.indexOf(c) + 1) % ROTATION.length]), ROTATE_MS);
    return () => clearInterval(t);
  }, [auto, hovering, reduce, merchant, pinned, wallet.length, onScreen]);

  // up to five in the holder, always including the one that wins
  const inHolder = useMemo(() => {
    if (wallet.length <= MAX_IN_HOLDER) return wallet;
    const rest = wallet.filter((c) => c.id !== answer?.card.id).slice(0, MAX_IN_HOLDER - 1);
    return answer ? [...rest.slice(0, 2), answer.card, ...rest.slice(2)] : wallet.slice(0, MAX_IN_HOLDER);
  }, [wallet, answer]);

  // pull a card yourself: it comes out, on the spend where it's your best card
  // (or, if another card beats it everywhere, on the spend it earns most on)
  const pull = (card: FinixCard) => {
    stopAuto();
    setMerchant('');
    const wins = ROTATION
      .map((cat) => ({ cat, top: rankCards(wallet, cat, amount)[0] }))
      .filter((w) => w.top?.card.id === card.id && w.top.reward > 0)
      .sort((a, b) => b.top.reward - a.top.reward)[0];
    if (wins) {
      setCategory(wins.cat);
      setPinned(null);
    } else {
      const best = [...(card.rewards ?? [])].sort((a, b) => b.rate - a.rate)[0];
      if (best) setCategory(best.category);
      setPinned(card.id);
    }
  };

  // this week: card bills and renewals, in date order
  const week = useMemo(() => {
    const today = istDate();
    const names: Record<string, string> = {};
    userCards.forEach((c) => { names[c.id] = displayCardName(c.label || c.bank || 'Card'); });
    const bills = CardDueEngine.evaluate(creditAccounts, names)
      .filter((d) => d.dueDate && (d.state === 'OVERDUE' || d.state === 'DUE_TODAY' || d.state === 'DUE_SOON'))
      .map((d) => ({ key: `bill-${d.cardId}`, kind: 'bill' as const, date: d.dueDate!, days: d.daysRemaining ?? 0, title: `${d.name} bill`, amount: d.totalDue, cardId: d.cardId, cancelUrl: null as string | null, overdue: d.state === 'OVERDUE' }));
    const renewals = upcomingCharges(subscriptions, today, 7).map((u) => ({
      key: `sub-${u.subscription.id}`, kind: u.kind === 'trial_ending' ? 'trial' as const : 'renewal' as const, date: u.dueOn, days: u.daysLeft,
      title: u.subscription.name, amount: u.subscription.amount, cardId: u.subscription.cardId, cancelUrl: u.subscription.cancelUrl ?? getCancelUrl(u.subscription.name) ?? null, overdue: false,
    }));
    return [...bills, ...renewals].sort((a, b) => a.days - b.days);
  }, [userCards, creditAccounts, subscriptions]);
  const weekTotal = week.reduce((s, w) => s + w.amount, 0);

  const markPaid = async (cardId: string, amt: number, name: string) => {
    try { await payBill({ cardId, amount: amt }); toast.success(`${name} marked as paid`); } catch { toast.error('Couldn’t update that. Try again.'); }
  };

  const band = (
    <div className="flex flex-col items-center text-center">
      {/* the answer, written above the holder */}
      <div className="min-h-[104px]" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          {answer ? (
            <motion.div
              key={`${answer.card.id}-${answer.label}-${Math.round(answer.reward)}`}
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.35, ease: EASE_OUT, delay: 0.15 }}
            >
              <p className="font-serif text-[46px] font-semibold leading-none tabular-nums text-rc-pistachio md:text-[56px]">
                {answer.estimate ? '~' : ''}+{rupees(answer.reward)}
              </p>
              <p className="mt-2 text-[14px] text-rc-cream">{answer.rate}% back on {answer.label} with {displayCardName(answer.card.name)}</p>
              <p className="mt-0.5 text-[13px] text-rc-mist">
                {answer.beatenBy
                  ? `${answer.beatenBy.name} earns ${rupees(answer.beatenBy.by)} more here`
                  : answer.ahead ? `${rupees(answer.ahead)} more than your next best card` : wallet.length > 1 ? 'Your other cards earn the same or less' : 'Add more cards to compare'}
              </p>
            </motion.div>
          ) : wallet.length > 0 ? (
            <motion.p key="none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pt-6 text-[15px] text-rc-mist">
              None of your cards publishes a reward for that shop. Try its name, like “Swiggy”.
            </motion.p>
          ) : (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-2">
              <p className="font-serif text-[26px] font-semibold leading-tight">Your holder is empty.</p>
              <p className="mt-1 text-[14px] text-rc-mist">Add the cards you own and we’ll pull out the right one for every spend.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div ref={holderRef} className="mt-4 w-full" onMouseEnter={() => setHovering(true)} onMouseLeave={() => setHovering(false)}>
        <WalletHolder cards={inHolder} pulledId={answer?.card.id ?? null} onPull={pull}>
          <button type="button" onClick={() => setAdding(true)} className="inline-flex h-12 items-center gap-2 rounded-full bg-rc-cream pl-5 pr-2 text-[15px] font-medium text-rc-ink shadow-[0_20px_40px_-20px_rgba(0,0,0,0.8)]">
            Add your first card <span className="flex h-9 w-9 items-center justify-center rounded-full bg-rc-ink text-rc-cream"><Plus size={17} /></span>
          </button>
        </WalletHolder>
      </div>

      {wallet.length > 0 && (
        <>
          {/* what kind of spend */}
          <div role="tablist" aria-label="Kind of spend" className={cn('-mx-5 mt-7 flex w-[calc(100%+2.5rem)] gap-1.5 overflow-x-auto px-5 py-1.5 [scrollbar-width:none] sm:mx-0 sm:w-full sm:flex-wrap sm:justify-center sm:px-0 [&::-webkit-scrollbar]:hidden', merchant.trim().length >= 2 && 'opacity-40')}>
            {SPEND_CATEGORIES.map((c) => {
              const on = !merchant && c.id === category;
              return (
                <button
                  key={c.id}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => { setCategory(c.id); setMerchant(''); setPinned(null); stopAuto(); }}
                  className={cn('relative h-9 shrink-0 rounded-full px-4 text-[13px] font-medium transition-colors duration-300', on ? 'text-rc-ink' : 'border border-white/10 text-rc-mist hover:border-white/30 hover:text-rc-cream')}
                >
                  {on && <motion.span layoutId="spend-pill" className="absolute inset-0 rounded-full bg-rc-pistachio" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
                  {/* how long until the holder moves on: a line closing around the tab */}
                  {on && auto && !hovering && !pinned && !reduce && onScreen && wallet.length > 1 && <BorderProgress key={category} duration={ROTATE_MS / 1000} radius={18} color="#375534" width={2} className="z-10" />}
                  <span className="relative">{c.label}</span>
                </button>
              );
            })}
          </div>

          {/* or the exact shop and amount */}
          <form onSubmit={(e) => e.preventDefault()} className="mt-3 flex h-12 w-full max-w-[460px] items-center rounded-full border border-white/12 bg-white/[0.05] pl-5 pr-1.5 text-[15px] focus-within:border-white/30">
            <span className="text-rc-mist">₹</span>
            <label className="sr-only" htmlFor="pay-amount">Amount</label>
            <input
              id="pay-amount"
              inputMode="numeric"
              value={amount ? amount.toLocaleString('en-IN') : ''}
              onChange={(e) => { stopAuto(); setAmount(Math.min(1000000, Number(e.target.value.replace(/[^\d]/g, '')) || 0)); }}
              style={{ width: `${Math.max(3, (amount ? amount.toLocaleString('en-IN') : '').length) + 0.5}ch` }}
              className="ml-1 bg-transparent font-medium tabular-nums text-rc-cream outline-none"
            />
            <span className="mx-3 h-5 w-px bg-white/15" />
            <span className="shrink-0 text-rc-mist">at</span>
            <label className="sr-only" htmlFor="pay-shop">Shop</label>
            <input
              id="pay-shop"
              value={merchant}
              onChange={(e) => { stopAuto(); setPinned(null); setMerchant(e.target.value); }}
              placeholder="any shop, e.g. Swiggy"
              enterKeyHint="search"
              className="ml-2 min-w-0 flex-1 bg-transparent text-rc-cream outline-none placeholder:text-rc-mist/60"
            />
            {merchant && (
              <button type="button" onClick={() => setMerchant('')} aria-label="Clear shop" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-rc-mist hover:bg-white/10 hover:text-rc-cream">
                <X size={16} />
              </button>
            )}
          </form>
        </>
      )}
    </div>
  );

  return (
    <PageContainer
      eyebrow={new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
      title={<>{greeting}{firstName ? <>, <span className="italic">{firstName}</span></> : ''}. Paying for something?</>}
      band={band}
      center
    >
      <section className="mx-auto w-full max-w-[720px]">
        <Reveal>
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-serif text-[30px] font-semibold leading-none tracking-[-0.02em] text-rc-ink sm:text-[36px]">This week</h2>
            {weekTotal > 0 && <p className="text-[14px] text-rc-muted"><span className="font-serif text-[20px] font-semibold text-rc-ink">{formatRupees(weekTotal)}</span> going out</p>}
          </div>
        </Reveal>

        {week.length === 0 ? (
          <Reveal delay={0.05}>
            <div className="mt-5 flex items-center gap-4 rounded-[24px] bg-rc-pistachio/60 px-5 py-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rc-forest text-rc-cream"><Check size={18} /></span>
              <p className="text-[15px] leading-snug text-rc-ink">Nothing due in the next seven days. Card bills and subscriptions you track will show up here before they’re due.</p>
            </div>
          </Reveal>
        ) : (
          <ol className="relative mt-6">
            <span aria-hidden className="absolute bottom-6 left-[27px] top-6 w-px bg-rc-ink/10" />
            {week.map((w, i) => {
              const d = new Date(`${w.date}T00:00:00+05:30`);
              return (
                <motion.li
                  key={w.key}
                  initial={reduce ? false : { opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{ duration: 0.45, ease: EASE_OUT, delay: i * 0.06 }}
                  className="relative flex gap-4 pb-3"
                >
                  <div className={cn('relative z-10 flex h-[56px] w-[56px] shrink-0 flex-col items-center justify-center rounded-[18px] border', w.days <= 1 ? 'border-rc-ink bg-rc-ink text-rc-cream' : 'border-rc-ink/10 bg-rc-paper text-rc-ink')}>
                    <span className={cn('text-[10px] font-semibold uppercase tracking-[0.12em]', w.days <= 1 ? 'text-rc-pistachio' : 'text-rc-muted')}>{d.toLocaleDateString('en-IN', { weekday: 'short', timeZone: 'Asia/Kolkata' })}</span>
                    <span className="font-serif text-[22px] font-semibold leading-none tabular-nums">{d.toLocaleDateString('en-IN', { day: 'numeric', timeZone: 'Asia/Kolkata' })}</span>
                  </div>
                  <div className="flex min-w-0 flex-1 items-center justify-between gap-3 rounded-[20px] border border-rc-ink/[0.08] bg-rc-paper px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-[15px] font-medium text-rc-ink">{w.title}</p>
                      <p className={cn('text-[13px]', w.overdue ? 'font-medium text-[#C2410C]' : 'text-rc-muted')}>
                        {w.overdue ? 'Overdue' : w.kind === 'bill' ? (w.days === 0 ? 'Due today' : `Due in ${w.days} ${w.days === 1 ? 'day' : 'days'}`) : w.kind === 'trial' ? (w.days === 0 ? 'Trial ends today' : `Trial turns paid in ${w.days}d`) : (w.days === 0 ? 'Renews today' : `Renews in ${w.days} ${w.days === 1 ? 'day' : 'days'}`)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="font-serif text-[18px] font-semibold tabular-nums text-rc-ink">{formatRupees(w.amount)}</span>
                      {w.kind === 'bill' ? (
                        <button type="button" onClick={() => void markPaid(w.cardId, w.amount, w.title)} className="h-8 rounded-full bg-rc-ink px-3 text-[12px] font-medium text-rc-cream hover:bg-rc-moss">Paid</button>
                      ) : w.cancelUrl ? (
                        <a href={w.cancelUrl} target="_blank" rel="noopener noreferrer" aria-label={`Cancel ${w.title}`} className="flex h-8 items-center gap-1 rounded-full bg-rc-ink/[0.06] px-3 text-[12px] font-medium text-rc-ink hover:bg-rc-ink/[0.1]">Cancel <ArrowUpRight size={12} /></a>
                      ) : null}
                    </div>
                  </div>
                </motion.li>
              );
            })}
          </ol>
        )}
      </section>

      <AnimatePresence>{adding && <AddCardModal onClose={() => setAdding(false)} />}</AnimatePresence>
    </PageContainer>
  );
}
