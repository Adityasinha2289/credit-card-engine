/**
 * Wallet: the cards you hold. Pick one from the stack and everything about it is
 * right below: its limit and how much of it you're using, the bill date, what it
 * earns where, the fine print, and removing it.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useUser } from '@clerk/clerk-react';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { useDashboardStore } from '../../features/dashboard/store/dashboardStore';
import { useDashboardMutations } from '../../hooks/queries/useDashboardMutations';
import { PageContainer } from '../../components/shared/PageContainer';
import AddCardModal from '../../features/dashboard/components/AddCardModal';
import { bankLabel, displayCardName } from '../../public-platform/site/CardFace';
import { EASE_OUT } from '../../public-platform/site/primitives';
import { SPEND_CATEGORIES, cardsByIds } from '../../public-platform/site/swipeMath';
import { formatRupees } from '../../features/money/lib/moneyMath';
import { CardStack } from './wallet/CardStack';
import { cn } from '../../lib/utils';

const label = (id: string) => SPEND_CATEGORIES.find((c) => c.id === id)?.label ?? id;

export default function WalletPage() {
  const reduce = useReducedMotion();
  const { user } = useUser();
  const { deleteUserCard } = useDashboardMutations(user?.id);
  const userCards = useDashboardStore((s) => s.userCards);
  const creditAccounts = useDashboardStore((s) => s.creditAccounts);
  const setCardLimit = useDashboardStore((s) => s.setCardLimit);
  const setCardDueDate = useDashboardStore((s) => s.setCardDueDate);

  const [adding, setAdding] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(userCards[0]?.id ?? null);
  const count = useRef(userCards.length);

  // a new card comes to the front; a removed one hands over to the next
  useEffect(() => {
    if (userCards.length > count.current) setSelectedId(userCards[userCards.length - 1].id);
    else if (!userCards.some((c) => c.id === selectedId)) setSelectedId(userCards[0]?.id ?? null);
    count.current = userCards.length;
  }, [userCards, selectedId]);

  const card = userCards.find((c) => c.id === selectedId) ?? null;
  const facts = useMemo(() => (card ? cardsByIds([card.id])[0] ?? null : null), [card]);
  const account = creditAccounts.find((a) => a.cardId === card?.id);
  const best = facts ? [...facts.rewards].sort((a, b) => b.rate - a.rate)[0] : undefined;

  const band = (
    <div className="grid grid-cols-[minmax(0,1fr)] items-center gap-8 md:grid-cols-[auto_minmax(0,1fr)] md:gap-14">
      <div>
        {userCards.length > 0 ? (
          <CardStack cards={userCards} selectedId={selectedId} onSelect={setSelectedId} />
        ) : (
          <button type="button" onClick={() => setAdding(true)} className="mx-auto flex aspect-[1.586] w-[300px] flex-col items-center justify-center gap-3 rounded-[18px] border border-dashed border-white/20 text-rc-mist transition-colors hover:border-white/40 hover:text-rc-cream md:w-[340px]">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-rc-pistachio text-rc-ink"><Plus size={20} /></span>
            <span className="text-[15px] font-medium">Add your first card</span>
          </button>
        )}
      </div>

      <div className="text-center md:text-left">
        <AnimatePresence mode="wait" initial={false}>
          {card ? (
            <motion.div key={card.id} initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.3, ease: EASE_OUT }}>
              <p className="text-[13px] text-rc-mist">{bankLabel(card.bank || '')}</p>
              <p className="mt-1 font-serif text-[30px] font-semibold leading-[1.05] tracking-[-0.02em] md:text-[40px]">{displayCardName(card.label || 'Card')}</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2 md:justify-start">
                {best && <span className="rounded-full bg-rc-pistachio px-3 py-1.5 text-[13px] font-semibold text-rc-ink">Best at {label(best.category).toLowerCase()}, {best.rate}%</span>}
                <span className="rounded-full border border-white/15 px-3 py-1.5 text-[13px] text-rc-mist">{card.creditLimit > 0 ? `${formatRupees(card.creditLimit)} limit` : 'Limit not added'}</span>
              </div>
            </motion.div>
          ) : (
            <motion.div key="none" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p className="font-serif text-[28px] font-semibold leading-tight">Nothing here yet.</p>
              <p className="mt-2 text-[15px] text-rc-mist">Pick your cards from the catalogue. No card number needed.</p>
            </motion.div>
          )}
        </AnimatePresence>
        {userCards.length > 0 && (
          <button type="button" onClick={() => setAdding(true)} className="mt-6 inline-flex h-11 items-center gap-2 rounded-full border border-white/15 pl-4 pr-5 text-[14px] font-medium text-rc-cream transition-colors hover:bg-white/10">
            <Plus size={16} /> Add a card
          </button>
        )}
      </div>
    </div>
  );

  return (
    <PageContainer
      eyebrow={userCards.length > 0 ? `${userCards.length} ${userCards.length === 1 ? 'card' : 'cards'} in your wallet` : 'Wallet'}
      title={userCards.length > 0 ? <>Your <span className="italic">wallet.</span></> : <>Your wallet is <span className="italic">empty.</span></>}
      band={band}
    >
      <AnimatePresence mode="wait" initial={false}>
        {card && (
          <motion.div
            key={card.id}
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: EASE_OUT }}
            className="grid gap-5 lg:grid-cols-2 lg:gap-6"
          >
            <LimitAndBill
              key={`lb-${card.id}`}
              limitPaise={card.creditLimit}
              balancePaise={account?.currentBalance ?? 0}
              dueDate={account?.paymentDueDate ?? ''}
              onSaveLimit={(p) => setCardLimit(card.id, p)}
              onSaveDue={(d) => setCardDueDate(card.id, d)}
            />

            {facts ? (
              <section className="rounded-[26px] border border-rc-ink/[0.08] bg-rc-paper p-5 sm:p-6">
                <h2 className="font-serif text-[24px] font-semibold tracking-[-0.01em] text-rc-ink">What it earns</h2>
                <EarnBars rates={[...facts.rewards.map((r) => ({ k: label(r.category), v: r.rate })), ...(facts.baseRewardRate != null ? [{ k: 'Everything else', v: facts.baseRewardRate }] : [])]} />
                <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-4 border-t border-dashed border-rc-ink/15 pt-5 text-[14px]">
                  <Fact k="Annual fee" v={facts.annualFee === 0 ? 'Lifetime free' : facts.annualFee == null ? 'Not published' : formatRupees(facts.annualFee * 100)} />
                  <Fact k="Fee waived after" v={facts.annualFee === 0 ? 'No fee to waive' : facts.feeWaiverSpend ? `${formatRupees(facts.feeWaiverSpend * 100)} a year` : 'No waiver'} />
                  <Fact k="Lounge visits" v={facts.loungeAccess ? `${facts.loungeAccess} a year` : 'None'} />
                  <Fact k="Network" v={facts.network} />
                </dl>
              </section>
            ) : (
              <section className="rounded-[26px] border border-dashed border-rc-ink/15 p-6 text-[15px] text-rc-muted">We don’t hold this card’s reward rates yet.</section>
            )}

            <RemoveCard name={displayCardName(card.label || 'this card')} onRemove={async () => { await deleteUserCard.mutateAsync(card.id); }} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>{adding && <AddCardModal onClose={() => setAdding(false)} />}</AnimatePresence>
    </PageContainer>
  );
}

function Fact({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-[12px] text-rc-muted">{k}</dt>
      <dd className="mt-0.5 font-medium text-rc-ink">{v}</dd>
    </div>
  );
}

/** Rates as bars, longest first, growing in when they come into view. */
function EarnBars({ rates }: { rates: { k: string; v: number }[] }) {
  const reduce = useReducedMotion();
  const sorted = [...rates].sort((a, b) => b.v - a.v);
  const max = Math.max(1, ...sorted.map((r) => r.v));
  return (
    <ul className="mt-4 space-y-3">
      {sorted.map((r, i) => (
        <li key={r.k} className="grid grid-cols-[7.5rem_1fr_3rem] items-center gap-3 text-[14px]">
          <span className="truncate text-rc-ink">{r.k}</span>
          <span className="h-2 overflow-hidden rounded-full bg-rc-ink/[0.07]">
            <motion.span
              className={cn('block h-full rounded-full', i === 0 ? 'bg-rc-forest' : 'bg-rc-sage/70')}
              initial={reduce ? false : { width: 0 }}
              whileInView={{ width: `${(r.v / max) * 100}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: EASE_OUT, delay: 0.1 + i * 0.05 }}
            />
          </span>
          <span className="text-right text-[15px] font-semibold tabular-nums text-rc-ink">{r.v}%</span>
        </li>
      ))}
    </ul>
  );
}

function LimitAndBill({ limitPaise, balancePaise, dueDate, onSaveLimit, onSaveDue }: {
  limitPaise: number; balancePaise: number; dueDate: string;
  onSaveLimit: (paise: number) => Promise<void>; onSaveDue: (date: string | null) => Promise<void>;
}) {
  const reduce = useReducedMotion();
  const [limit, setLimit] = useState(limitPaise > 0 ? String(Math.round(limitPaise / 100)) : '');
  const [saving, setSaving] = useState(false);
  const rupees = Number(limit || 0);
  const changed = rupees > 0 && rupees * 100 !== limitPaise;
  const used = limitPaise > 0 ? Math.min(1, balancePaise / limitPaise) : 0;

  const save = async () => {
    setSaving(true);
    try { await onSaveLimit(rupees * 100); toast.success('Limit saved'); } catch { toast.error('Couldn’t save the limit'); } finally { setSaving(false); }
  };

  return (
    <section className="rounded-[26px] bg-rc-ink p-5 text-rc-cream sm:p-6">
      <h2 className="font-serif text-[24px] font-semibold tracking-[-0.01em]">Limit and bill</h2>

      {/* how much of the limit is in use */}
      <div className="mt-5">
        {limitPaise > 0 ? (
          <>
            <div className="flex items-baseline justify-between gap-3">
              <p className="font-serif text-[34px] font-semibold leading-none tabular-nums text-rc-pistachio">{Math.round(used * 100)}%</p>
              <p className="text-[13px] text-rc-mist">{formatRupees(balancePaise)} of {formatRupees(limitPaise)} used</p>
            </div>
            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/10">
              <motion.div className={cn('h-full rounded-full', used > 0.3 ? 'bg-[#E9B872]' : 'bg-rc-pistachio')} initial={reduce ? false : { width: 0 }} animate={{ width: `${Math.max(1.5, used * 100)}%` }} transition={{ duration: 0.9, ease: EASE_OUT }} />
            </div>
            <p className="mt-2 text-[13px] text-rc-mist">{used > 0.3 ? 'Above 30% can weigh on your credit score. Paying early brings it down.' : 'Under 30%, which keeps your credit score healthy.'}</p>
          </>
        ) : (
          <p className="text-[14px] leading-relaxed text-rc-mist">Add the limit (it’s on your statement or in your bank’s app) to see how much of it you’re using.</p>
        )}
      </div>

      <form onSubmit={(e) => { e.preventDefault(); if (changed) void save(); }} className="mt-5">
        <label htmlFor="limit" className="text-[13px] text-rc-mist">Credit limit</label>
        <div className="mt-1.5 flex gap-2">
          <div className="flex h-12 flex-1 items-center rounded-full bg-white/[0.07] px-4 focus-within:bg-white/[0.1]">
            <span className="text-rc-mist">₹</span>
            <input id="limit" inputMode="numeric" value={limit ? Number(limit).toLocaleString('en-IN') : ''} onChange={(e) => setLimit(e.target.value.replace(/[^\d]/g, '').slice(0, 9))} placeholder="e.g. 2,00,000" className="ml-1.5 w-full bg-transparent text-[16px] tabular-nums outline-none placeholder:text-rc-mist/50" />
          </div>
          <AnimatePresence>
            {changed && (
              <motion.button initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }} type="submit" disabled={saving} className="h-12 overflow-hidden whitespace-nowrap rounded-full bg-rc-pistachio px-5 text-[14px] font-semibold text-rc-ink">
                {saving ? 'Saving' : 'Save'}
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </form>

      <label className="mt-4 block">
        <span className="text-[13px] text-rc-mist">Next bill due on</span>
        <input
          type="date"
          value={dueDate ? dueDate.slice(0, 10) : ''}
          onChange={(e) => { void onSaveDue(e.target.value || null).then(() => toast.success(e.target.value ? 'We’ll remind you before it’s due' : 'Due date cleared')); }}
          className="mt-1.5 h-12 w-full rounded-full bg-white/[0.07] px-4 text-[16px] text-rc-cream outline-none [color-scheme:dark] focus:bg-white/[0.1]"
        />
      </label>
    </section>
  );
}

function RemoveCard({ name, onRemove }: { name: string; onRemove: () => Promise<void> }) {
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 lg:col-span-2">
      <p className="text-[13px] text-rc-muted">Cancelled it, or never had it? Removing it here doesn’t touch your bank account.</p>
      {confirm ? (
        <span className="flex gap-2">
          <button type="button" onClick={() => setConfirm(false)} className="h-10 rounded-full px-4 text-[14px] text-rc-muted hover:text-rc-ink">Keep</button>
          <button type="button" disabled={busy} onClick={async () => { setBusy(true); try { await onRemove(); toast.success(`${name} removed`); } catch { toast.error('Couldn’t remove it'); setBusy(false); } }} className="h-10 rounded-full bg-[#C2410C] px-4 text-[14px] font-medium text-white">
            {busy ? 'Removing' : `Remove ${name}`}
          </button>
        </span>
      ) : (
        <button type="button" onClick={() => setConfirm(true)} className="h-10 rounded-full border border-rc-ink/15 px-4 text-[14px] text-rc-ink hover:border-[#C2410C]/50 hover:text-[#C2410C]">Remove card</button>
      )}
    </div>
  );
}
