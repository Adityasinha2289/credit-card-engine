/**
 * Picks for you: the cards that would add the most to your wallet, read out by
 * the card machine, and a side-by-side compare. Values are rupees a year on your
 * spend, over your best current card, after fees.
 */
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useShallow } from 'zustand/shallow';
import { Check } from 'lucide-react';
import { PageContainer } from '../../components/shared/PageContainer';
import { AppTabs, useTab } from '../../components/shared/AppTabs';
import { CompareTab } from './discoverViews';
import { useDashboardStore } from '../../features/dashboard/store/dashboardStore';
import { normalizeGoal } from '../../config/goals';
import { CardFace, bankLabel, displayCardName } from '../../public-platform/site/CardFace';
import { EASE_OUT, formatINR } from '../../public-platform/site/primitives';
import { SPEND_CATEGORIES, slugifyCardName, type SpendCategory } from '../../public-platform/site/swipeMath';
import { PickTerminal } from './picks/PickTerminal';
import { ASSUMED_MONTHLY, picksFor, spendProfile } from './picks/picks';
import { cn } from '../../lib/utils';

const TABS = ['picks', 'compare'] as const;
const FOCUS = SPEND_CATEGORIES.filter((c) => c.id !== 'other');
const FEES = [
  { id: 'any', label: 'Any fee', max: undefined },
  { id: 'free', label: 'Free', max: 0 },
  { id: '1k', label: '≤ ₹1,000', max: 1000 },
  { id: '5k', label: '≤ ₹5,000', max: 5000 },
] as const;

export default function DiscoverPage() {
  const reduce = useReducedMotion();
  const [tab, setTab] = useTab(TABS, 'picks');
  const { profile, userCards, transactions, updateProfile } = useDashboardStore(useShallow((s) => ({
    profile: s.profile, userCards: s.userCards, transactions: s.transactions, updateProfile: s.updateProfile,
  })));

  const [focus, setFocus] = useState<SpendCategory[]>(() => {
    const saved = (profile?.spendCategories ?? []).filter((c) => FOCUS.some((f) => f.id === c)) as SpendCategory[];
    if (saved.length) return saved.slice(0, 3);
    return normalizeGoal(profile?.primaryGoal) === 'travel' ? ['travel'] : ['dining', 'shopping'];
  });
  const [fee, setFee] = useState<(typeof FEES)[number]['id']>('any');
  const [lounge, setLounge] = useState(false);
  const [index, setIndex] = useState(0);
  const [compareIds, setCompareIds] = useState<string[]>([]);

  const { profile: spend, assumed } = useMemo(() => spendProfile(transactions, focus), [transactions, focus]);
  const picks = useMemo(() => picksFor({
    walletIds: userCards.map((c) => c.id),
    profile: spend,
    income: profile?.salary || 0,
    cibil: profile?.creditScore || 0,
    maxFee: FEES.find((f) => f.id === fee)?.max,
    lounge,
  }), [userCards, spend, profile?.salary, profile?.creditScore, fee, lounge]);

  const at = Math.min(index, Math.max(0, picks.length - 1));
  // what you spend most on is remembered for next time
  const toggle = (c: SpendCategory) => {
    const next = focus.includes(c) ? focus.filter((x) => x !== c) : [...focus, c].slice(-3);
    setIndex(0);
    setFocus(next);
    if (profile) void updateProfile({ ...profile, spendCategories: next });
  };

  const band = (
    <div className="grid grid-cols-[minmax(0,1fr)] items-center gap-10 md:grid-cols-[auto_minmax(0,1fr)] md:gap-16">
      <PickTerminal picks={picks} index={at} onIndex={setIndex} />

      <div className="min-w-0">
        <p className="text-[15px] text-rc-mist md:text-[17px]">
          Ranked on {assumed ? `a typical ${formatINR(ASSUMED_MONTHLY)} month, leaning to what you pick below` : 'your logged spending'}, against the best of your {userCards.length} {userCards.length === 1 ? 'card' : 'cards'}.
        </p>

        <p className="mt-6 text-[13px] font-medium text-rc-mist">You spend most on</p>
        <div className="-mx-5 mt-2 flex gap-1.5 overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0 [&::-webkit-scrollbar]:hidden">
          {FOCUS.map((c) => {
            const on = focus.includes(c.id);
            return (
              <button key={c.id} type="button" aria-pressed={on} onClick={() => toggle(c.id)}
                className={cn('inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-medium transition-colors', on ? 'bg-rc-pistachio text-rc-ink' : 'border border-white/12 text-rc-mist hover:border-white/30 hover:text-rc-cream')}>
                {on && <Check size={13} strokeWidth={3} />}{c.label}
              </button>
            );
          })}
        </div>

        <p className="mt-5 text-[13px] font-medium text-rc-mist">Annual fee</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {FEES.map((f) => (
            <button key={f.id} type="button" aria-pressed={fee === f.id} onClick={() => { setFee(f.id); setIndex(0); }}
              className={cn('h-9 rounded-full px-3.5 text-[13px] font-medium transition-colors', fee === f.id ? 'bg-rc-pistachio text-rc-ink' : 'border border-white/12 text-rc-mist hover:border-white/30 hover:text-rc-cream')}>
              {f.label}
            </button>
          ))}
          <button type="button" aria-pressed={lounge} onClick={() => { setLounge((v) => !v); setIndex(0); }}
            className={cn('inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-medium transition-colors', lounge ? 'bg-rc-pistachio text-rc-ink' : 'border border-white/12 text-rc-mist hover:border-white/30 hover:text-rc-cream')}>
            {lounge && <Check size={13} strokeWidth={3} />}Lounge access
          </button>
        </div>

        <Eligibility income={profile?.salary || 0} cibil={profile?.creditScore || 0} onSave={(income, cibil) => profile && updateProfile({ ...profile, salary: income, creditScore: cibil })} />
      </div>
    </div>
  );

  return (
    <PageContainer eyebrow="Picks for you" title={<>Cards that would <span className="italic">pay you more.</span></>} band={band}>
      <div className="mx-auto w-full max-w-[860px] space-y-7">
        <AppTabs layoutId="picks-tabs" value={tab} onChange={setTab} tabs={[{ id: 'picks', label: 'All picks', count: picks.length }, { id: 'compare', label: 'Compare' }]} />

        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.28, ease: EASE_OUT }}>
            {tab === 'picks' ? (
              picks.length === 0 ? (
                <p className="rounded-[24px] border border-dashed border-rc-ink/15 px-5 py-8 text-center text-[15px] text-rc-muted">No card beats your wallet with these filters. Try a higher fee or turn off lounge access.</p>
              ) : (
                <ol className="space-y-3">
                  {picks.map((p, i) => (
                    <motion.li key={p.card.id} initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE_OUT, delay: i * 0.05 }}
                      className={cn('rounded-[24px] border p-4 transition-colors sm:p-5', i === at ? 'border-rc-ink bg-white' : 'border-rc-ink/[0.08] bg-rc-paper')}>
                      <div className="flex items-start gap-3.5 sm:items-center sm:gap-4">
                        <span className="hidden w-5 shrink-0 font-serif text-[20px] font-semibold text-rc-ink/30 sm:block">{i + 1}</span>
                        <button type="button" onClick={() => { setIndex(i); window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); }} aria-label={`Show ${p.card.name} in the reader`} className="shrink-0">
                          <CardFace name={p.card.name} bank={p.card.bank} network={p.card.network} width={84} lifted={false} />
                        </button>
                        <div className="min-w-0 flex-1">
                          <Link to={`/cards/${slugifyCardName(p.card.name)}`} className="block text-[16px] font-semibold leading-snug text-rc-ink hover:underline">{displayCardName(p.card.name)}</Link>
                          <p className="text-[13px] text-rc-muted">{bankLabel(p.card.bank)} · {p.fee === 0 ? (p.feeWaived ? 'fee waived on your spend' : 'lifetime free') : `${formatINR(p.fee)} a year`}</p>
                          <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                            <span className="font-serif text-[22px] font-semibold leading-none tabular-nums text-rc-forest sm:hidden">{p.net >= 0 ? '+' : '−'}{formatINR(Math.abs(p.net))}<span className="ml-1 font-sans text-[12px] font-normal text-rc-muted">a year</span></span>
                            {p.needs && (
                              <span className="inline-flex rounded-full bg-[#B7791F]/12 px-2.5 py-0.5 text-[12px] font-medium text-[#8A5A0E]">
                                Needs {[p.needs.cibil ? `${p.needs.cibil}+ CIBIL` : null, p.needs.income ? `${formatINR(p.needs.income)} income` : null].filter(Boolean).join(' and ')}
                              </span>
                            )}
                          </p>
                        </div>
                        <p className="hidden shrink-0 text-right sm:block">
                          <span className="block font-serif text-[22px] font-semibold leading-none tabular-nums text-rc-forest">{p.net >= 0 ? '+' : '−'}{formatINR(Math.abs(p.net))}</span>
                          <span className="text-[12px] text-rc-muted">a year</span>
                        </p>
                      </div>
                      {p.wins.length > 0 && (
                        <p className="mt-3 border-t border-dashed border-rc-ink/15 pt-3 text-[13px] leading-relaxed text-rc-muted">
                          {p.wins.slice(0, 3).map((w, n) => (
                            <span key={w.category}>{n > 0 && ' · '}<span className="font-medium text-rc-ink">{w.label}</span> {w.rate}% vs your {w.yourRate}% (+{formatINR(w.perYear)})</span>
                          ))}
                        </p>
                      )}
                      <div className="mt-3 flex justify-end">
                        <button type="button" onClick={() => { setCompareIds([p.card.id, ...userCards.map((c) => c.id)].slice(0, 3)); setTab('compare'); }} className="text-[13px] font-medium text-rc-forest hover:underline">Compare with my cards</button>
                      </div>
                    </motion.li>
                  ))}
                </ol>
              )
            ) : (
              <CompareTab key={compareIds.join()} initialIds={compareIds} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </PageContainer>
  );
}

/** Income and CIBIL, checked against each card's published minimums; editable right here. */
function Eligibility({ income, cibil, onSave }: { income: number; cibil: number; onSave: (income: number, cibil: number) => void }) {
  const [editing, setEditing] = useState(false);
  const [i, setI] = useState(income ? String(income) : '');
  const [c, setC] = useState(cibil ? String(cibil) : '');
  const known = income > 0 && cibil > 0;

  if (!editing) {
    return (
      <p className="mt-6 text-[13px] leading-relaxed text-rc-mist">
        {known
          ? <>Checked against your <span className="text-rc-cream">{formatINR(income)}</span> a year and <span className="text-rc-cream">{cibil}</span> CIBIL score; cards that ask for more are marked. </>
          : <>Add your income and CIBIL score and we’ll mark cards you’re unlikely to get. </>}
        <button type="button" onClick={() => setEditing(true)} className="font-medium text-rc-pistachio underline underline-offset-2">{known ? 'Change' : 'Add them'}</button>
      </p>
    );
  }
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); const n = Number(i) || 0; const s = Number(c) || 0; if (s && (s < 300 || s > 900)) return; onSave(n, s); setEditing(false); }}
      className="mt-6 flex flex-wrap items-center gap-2"
    >
      <span className="flex h-10 items-center rounded-full bg-white/[0.07] px-3.5 text-[14px]">
        <span className="text-rc-mist">₹</span>
        <input aria-label="Annual income" inputMode="numeric" value={i ? Number(i).toLocaleString('en-IN') : ''} onChange={(e) => setI(e.target.value.replace(/[^\d]/g, '').slice(0, 10))} placeholder="income a year" className="ml-1 w-[120px] bg-transparent text-rc-cream outline-none placeholder:text-rc-mist/50" />
      </span>
      <span className="flex h-10 items-center rounded-full bg-white/[0.07] px-3.5 text-[14px]">
        <input aria-label="CIBIL score" inputMode="numeric" value={c} onChange={(e) => setC(e.target.value.replace(/[^\d]/g, '').slice(0, 3))} placeholder="CIBIL" className="w-[52px] bg-transparent text-rc-cream outline-none placeholder:text-rc-mist/50" />
      </span>
      <button type="submit" className="h-10 rounded-full bg-rc-pistachio px-4 text-[13px] font-semibold text-rc-ink">Save</button>
      <button type="button" onClick={() => setEditing(false)} className="h-10 px-2 text-[13px] text-rc-mist">Cancel</button>
    </form>
  );
}
