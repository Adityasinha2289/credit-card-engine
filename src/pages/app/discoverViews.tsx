/** The "Recommended" and "Compare" views of Picks for you. */
import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight, Car, Check, Film, Fuel, HeartPulse, Music, Plane, PlaneTakeoff, Plus,
  Scale, Search, ShoppingBag, ShoppingCart, Tag, Utensils, X, Zap, type LucideIcon,
} from 'lucide-react';
import { useDashboardStore } from '../../features/dashboard/store/dashboardStore';
import { cn } from '../../lib/utils';
import { CATEGORIES_LIST, type UserProfile, type RecommendedCard } from '../../features/finix/lib/recommendEngine';
import { recommendCardsFor } from '../../features/financial-engine/rewardsApi';
import { normalizeGoal } from '../../config/goals';
import { CARD_DATASET, type FinixCard, type SpendCategory } from '../../features/finix/data/cardDataset';
import { CardFace, bankLabel, displayCardName } from '../../public-platform/site/CardFace';
import { slugifyCardName } from '../../public-platform/site/swipeMath';
import { EmptyState, Panel, Pill, SectionHead } from '../../components/shared/appUi';
import { EASE_OUT } from '../../public-platform/site/primitives';

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  dining: Utensils, shopping: ShoppingBag, travel: Plane, groceries: ShoppingCart, fuel: Fuel,
  entertainment: Film, utilities: Zap, health: HeartPulse, transport: Car, subscriptions: Music, other: Tag,
};

/** Short chip labels; the engine's list has longer ones. */
const CHIP_LABEL: Record<string, string> = {
  dining: 'Food & dining', shopping: 'Online shopping', travel: 'Travel', groceries: 'Groceries', fuel: 'Fuel',
  entertainment: 'Movies', utilities: 'Bills', health: 'Health', transport: 'Cabs', subscriptions: 'Subscriptions',
};

const FEES = [
  { id: 'any', label: 'Any fee', max: undefined },
  { id: 'free', label: 'Lifetime free', max: 0 },
  { id: '1k', label: 'Up to ₹1,000', max: 1000 },
  { id: '5k', label: 'Up to ₹5,000', max: 5000 },
] as const;

const BANK_APPLY_URLS: Record<string, string> = {
  HDFC: 'https://www.hdfcbank.com/personal/pay/cards/credit-cards',
  SBI: 'https://www.sbicard.com/en/apply-now.page',
  ICICI: 'https://www.icicibank.com/card/credit-cards',
  Axis: 'https://www.axisbank.com/retail/cards/credit-card',
  Kotak: 'https://www.kotak.com/en/personal-banking/cards/credit-cards.html',
  AMEX: 'https://www.americanexpress.com/in/credit-cards/',
  RBL: 'https://www.rblbank.com/credit-cards',
  IndusInd: 'https://www.indusind.com/in/en/personal/cards/credit-card.html',
  YES: 'https://www.yesbank.in/personal-banking/yes-individual/cards/credit-cards',
  BOB: 'https://www.bankofbaroda.in/personal-banking/digital-products/cards/credit-cards',
  HSBC: 'https://www.hsbc.co.in/credit-cards/',
  SC: 'https://www.sc.com/in/credit-cards/',
  AU: 'https://www.aubank.in/personal-banking/credit-card',
  Federal: 'https://www.federalbank.co.in/credit-card',
  IDFC: 'https://www.idfcfirstbank.com/credit-card',
  OneCard: 'https://www.getonecard.app/',
};

const rupees = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;
const feeText = (fee: number | null) => (fee === null ? 'Fee not published' : fee === 0 ? 'Lifetime free' : `${rupees(fee)} a year`);
const lakh = (n: number) => (n >= 100000 ? `₹${(n / 100000).toFixed(n % 100000 === 0 ? 0 : 1)}L` : rupees(n));

/** What the unified engine adds to a recommendation, when it ran. */
type Pick = RecommendedCard & { netAnnualValue?: number; reasons?: string[]; spendAssumed?: boolean };

function getRate(card: FinixCard, cat: SpendCategory): number {
  return card.rewards?.find((x) => x.category === cat)?.rate ?? card.baseRewardRate ?? 0;
}

function bestRate(card: FinixCard): number {
  return Math.max(card.baseRewardRate ?? 0, ...(card.rewards ?? []).map((r) => r.rate));
}

// ─────────────────────────────────────────────────────────────────────────────
//  RECOMMENDED
// ─────────────────────────────────────────────────────────────────────────────

export function RecommendTab({ onSwitchToCompare }: { onSwitchToCompare: (ids?: string[]) => void }) {
  const profile = useDashboardStore((s) => s.profile);
  const userCards = useDashboardStore((s) => s.userCards);
  const transactions = useDashboardStore((s) => s.transactions);

  const [categories, setCategories] = useState<SpendCategory[]>(() => {
    if (profile?.spendCategories?.length) return (profile.spendCategories as SpendCategory[]).slice(0, 4);
    const goal = normalizeGoal(profile?.primaryGoal);
    if (goal === 'cashback') return ['dining', 'shopping'];
    if (goal === 'travel') return ['travel'];
    return ['shopping', 'dining'];
  });
  const [wantsLounge, setWantsLounge] = useState(() => normalizeGoal(profile?.primaryGoal) === 'travel');
  const [fee, setFee] = useState<(typeof FEES)[number]['id']>('any');

  const toggle = (cat: SpendCategory) =>
    setCategories((prev) => (prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat].slice(-4)));

  // recomputed on every change: no "submit" step
  const picks = useMemo<Pick[]>(() => {
    const p: UserProfile = {
      annualIncome: profile?.salary || 0,
      cibilScore: profile?.creditScore || 0,
      topCategories: categories,
      maxAnnualFee: FEES.find((f) => f.id === fee)?.max,
      wantsLounge,
    };
    return recommendCardsFor(p, 5, { transactions, walletCardIds: userCards.map((c) => c.id) }) as Pick[];
  }, [profile?.salary, profile?.creditScore, categories, wantsLounge, fee, transactions, userCards]);

  const [top, ...rest] = picks;

  return (
    <div className="grid gap-8 lg:grid-cols-[360px_1fr] lg:gap-10">
      {/* what to rank on */}
      <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
        <Link to="/app/account" className="flex items-center justify-between gap-3 rounded-[20px] border border-rc-ink/[0.08] bg-rc-paper px-4 py-3 text-[13px] text-rc-muted hover:bg-white">
          <span className="min-w-0 truncate">
            Income <span className="font-semibold text-rc-ink">{profile?.salary ? `${lakh(profile.salary)}/yr` : 'not added'}</span>
            {' · '}CIBIL <span className="font-semibold text-rc-ink">{profile?.creditScore || 'not added'}</span>
            {' · '}<span className="font-semibold text-rc-ink">{userCards.length}</span> {userCards.length === 1 ? 'card' : 'cards'}
          </span>
          <span className="shrink-0 font-medium text-rc-forest">Edit</span>
        </Link>

        <div>
          <p className="text-[15px] font-semibold text-rc-ink">What do you spend most on?</p>
          <p className="text-[13px] text-rc-muted">Pick up to four.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {CATEGORIES_LIST.map(({ value }) => {
              const on = categories.includes(value);
              const Icon = CATEGORY_ICONS[value] ?? Tag;
              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggle(value)}
                  className={cn('inline-flex h-10 items-center gap-2 rounded-full border pl-3 pr-4 text-[14px] transition-colors', on ? 'border-rc-ink bg-rc-ink text-rc-cream' : 'border-rc-ink/15 bg-rc-paper text-rc-ink hover:border-rc-ink/35')}
                >
                  {on ? <Check size={15} className="text-rc-pistachio" /> : <Icon size={15} className="text-rc-forest" />}
                  {CHIP_LABEL[value] ?? value}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-[15px] font-semibold text-rc-ink">Annual fee</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {FEES.map((f) => (
              <button
                key={f.id}
                type="button"
                aria-pressed={fee === f.id}
                onClick={() => setFee(f.id)}
                className={cn('h-10 rounded-full border text-[14px] transition-colors', fee === f.id ? 'border-rc-ink bg-rc-ink text-rc-cream' : 'border-rc-ink/15 bg-rc-paper text-rc-ink hover:border-rc-ink/35')}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={wantsLounge}
          onClick={() => setWantsLounge((v) => !v)}
          className="flex w-full items-center gap-3 rounded-[20px] border border-rc-ink/[0.08] bg-rc-paper px-4 py-3 text-left"
        >
          <PlaneTakeoff size={18} className="shrink-0 text-rc-forest" />
          <span className="flex-1 text-[14px] font-medium text-rc-ink">Must have airport lounge access</span>
          <span className={cn('relative h-7 w-12 shrink-0 rounded-full transition-colors', wantsLounge ? 'bg-rc-forest' : 'bg-rc-ink/15')}>
            <span className={cn('absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-[left] duration-300', wantsLounge ? 'left-6' : 'left-1')} />
          </span>
        </button>
      </aside>

      {/* the picks */}
      <section aria-live="polite">
        {!top ? (
          <EmptyState icon={Search} title="No card fits all of that" note="Try a higher fee limit, turn off lounge access, or add your income and CIBIL in Account so we can check approval." />
        ) : (
          <>
            <AnimatePresence mode="wait">
              <motion.article
                key={top.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: EASE_OUT }}
                className="relative overflow-hidden rounded-[30px] bg-rc-ink p-5 text-rc-cream sm:p-7"
              >
                <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[radial-gradient(closest-side,rgba(227,238,212,0.16),transparent)]" />
                <p className="relative inline-flex items-center gap-2 rounded-full bg-rc-pistachio px-3 py-1 text-[12px] font-semibold text-rc-ink">Top pick for you</p>
                <div className="relative mt-5 flex flex-col gap-5 sm:flex-row sm:items-center">
                  <motion.div initial={{ rotate: -8, y: 10 }} animate={{ rotate: -4, y: 0 }} transition={{ duration: 0.6, ease: EASE_OUT }} className="self-center sm:self-auto">
                    <CardFace name={top.name} bank={top.bank} network={top.network} width={220} />
                  </motion.div>
                  <div className="min-w-0">
                    <p className="text-[13px] text-rc-mist">{bankLabel(top.bank)}</p>
                    <h3 className="font-serif text-[28px] font-semibold leading-[1.05] tracking-[-0.02em]">{displayCardName(top.name)}</h3>
                    {(top.netAnnualValue ?? 0) > 0 && (
                      <p className="mt-3 font-serif text-[34px] font-semibold leading-none text-rc-pistachio tabular-nums">
                        +{rupees(top.netAnnualValue!)}<span className="ml-1.5 font-sans text-[14px] font-normal text-rc-mist">a year, after fees</span>
                      </p>
                    )}
                  </div>
                </div>

                <dl className="relative mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-[18px] bg-white/10">
                  <div className="bg-rc-ink/95 px-4 py-3"><dt className="text-[12px] text-rc-mist">Annual fee</dt><dd className="mt-0.5 text-[15px] font-medium">{feeText(top.annualFee)}</dd></div>
                  <div className="bg-rc-ink/95 px-4 py-3"><dt className="text-[12px] text-rc-mist">Best rate</dt><dd className="mt-0.5 text-[15px] font-medium">{bestRate(top)}% back</dd></div>
                </dl>

                {(top.reasons?.length ? top.reasons : top.highlights)?.slice(0, 3).map((r) => (
                  <p key={r} className="relative mt-3 flex gap-2.5 text-[14px] leading-relaxed text-rc-mist first-of-type:mt-5">
                    <Check size={16} className="mt-0.5 shrink-0 text-rc-pistachio" /> <span>{r}</span>
                  </p>
                ))}
                {top.eligibilityReason && <p className="relative mt-4 rounded-[14px] bg-white/[0.06] px-3.5 py-2.5 text-[13px] text-rc-mist">{top.eligibilityReason}</p>}

                <div className="relative mt-6 flex flex-wrap gap-2">
                  <Link to={`/cards/${slugifyCardName(top.name)}`} className="inline-flex h-11 items-center gap-2 rounded-full bg-rc-cream px-5 text-[14px] font-medium text-rc-ink hover:bg-white">See the card</Link>
                  <button type="button" onClick={() => onSwitchToCompare([top.id, ...userCards.map((c) => c.id)].slice(0, 2))} className="inline-flex h-11 items-center gap-2 rounded-full border border-white/20 px-5 text-[14px] font-medium hover:bg-white/10">
                    <Scale size={15} /> Compare
                  </button>
                  {BANK_APPLY_URLS[top.bank] && (
                    <a href={BANK_APPLY_URLS[top.bank]} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center gap-1.5 rounded-full px-3 text-[14px] font-medium text-rc-pistachio hover:underline">
                      Apply at {bankLabel(top.bank)} <ArrowUpRight size={15} />
                    </a>
                  )}
                </div>
              </motion.article>
            </AnimatePresence>

            {rest.length > 0 && (
              <div className="mt-8">
                <SectionHead title="Also worth a look" />
                <Panel as="ul" className="divide-y divide-rc-ink/[0.07]">
                  {rest.map((c) => (
                    <li key={c.id}>
                      <Link to={`/cards/${slugifyCardName(c.name)}`} className="flex items-center gap-3.5 px-3.5 py-3 transition-colors hover:bg-white sm:px-4">
                        <CardFace name={c.name} bank={c.bank} network={c.network} width={76} lifted={false} />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[15px] font-medium text-rc-ink">{displayCardName(c.name)}</span>
                          <span className="block truncate text-[13px] text-rc-muted">{bankLabel(c.bank)} · {feeText(c.annualFee)}</span>
                        </span>
                        {(c.netAnnualValue ?? 0) > 0 && (
                          <span className="shrink-0 text-right font-serif text-[17px] font-semibold tabular-nums text-rc-forest">+{rupees(c.netAnnualValue!)}<span className="block font-sans text-[11px] font-normal text-rc-muted">a year</span></span>
                        )}
                      </Link>
                    </li>
                  ))}
                </Panel>
              </div>
            )}
            {top.spendAssumed && (
              <p className="mt-4 text-[13px] leading-relaxed text-rc-muted">
                Yearly amounts assume about ₹25,000 a month of card spend. Add your spending in Money for figures built on your own.
              </p>
            )}
          </>
        )}
      </section>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  COMPARE
// ─────────────────────────────────────────────────────────────────────────────

const COMPARE_ROWS: { key: SpendCategory; label: string }[] = [
  { key: 'dining', label: 'Dining' },
  { key: 'travel', label: 'Travel' },
  { key: 'shopping', label: 'Online shopping' },
  { key: 'groceries', label: 'Groceries' },
  { key: 'fuel', label: 'Fuel' },
  { key: 'entertainment', label: 'Movies' },
  { key: 'utilities', label: 'Bills' },
  { key: 'health', label: 'Health' },
];

/** Index of the single best value, or -1 on a tie. */
function winner(values: number[], higherIsBetter = true): number {
  if (values.length < 2) return -1;
  const best = higherIsBetter ? Math.max(...values) : Math.min(...values);
  return values.filter((v) => v === best).length === 1 ? values.indexOf(best) : -1;
}

function CardPickerSheet({ onSelect, onClose, excludeIds }: { onSelect: (card: FinixCard) => void; onClose: () => void; excludeIds: string[] }) {
  const [query, setQuery] = useState('');
  const q = query.toLowerCase().replace(/[^a-z0-9]/g, '');
  const list = CARD_DATASET
    .filter((c) => !excludeIds.includes(c.id))
    .filter((c) => !q || `${c.bank}${c.name}`.toLowerCase().replace(/[^a-z0-9]/g, '').includes(q));

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-rc-night/70 backdrop-blur-sm" />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Pick a card to compare"
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 60 }}
        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
        className="relative flex h-[85dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-[32px] bg-rc-cream text-rc-ink sm:h-auto sm:max-h-[80dvh] sm:rounded-[32px]"
      >
        <div aria-hidden className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-rc-ink/15 sm:hidden" />
        <div className="px-5 pb-3 pt-4 sm:px-6 sm:pt-6">
          <div className="flex items-center justify-between gap-4">
            <h3 className="font-serif text-[24px] font-semibold">Pick a card</h3>
            <button type="button" onClick={onClose} aria-label="Close" className="flex h-10 w-10 items-center justify-center rounded-full bg-rc-ink/[0.06] hover:bg-rc-ink/[0.1]"><X size={16} /></button>
          </div>
          <label className="mt-3 flex h-12 items-center gap-3 rounded-full border border-rc-ink/10 bg-white px-4">
            <Search aria-hidden size={17} className="text-rc-ink/40" />
            <span className="sr-only">Search cards</span>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by card or bank" className="h-full w-full bg-transparent text-[16px] outline-none placeholder:text-rc-ink/40" />
          </label>
        </div>
        <ul className="flex-1 overflow-y-auto overscroll-contain px-3 pb-[calc(16px+env(safe-area-inset-bottom))] sm:px-4">
          {list.slice(0, 60).map((c) => (
            <li key={c.id}>
              <button type="button" onClick={() => { onSelect(c); onClose(); }} className="flex w-full items-center gap-3.5 rounded-[18px] px-2.5 py-2.5 text-left hover:bg-white active:bg-white">
                <CardFace name={c.name} bank={c.bank} network={c.network} width={64} lifted={false} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-medium">{displayCardName(c.name)}</span>
                  <span className="block text-[13px] text-rc-muted">{bankLabel(c.bank)} · {feeText(c.annualFee)}</span>
                </span>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rc-ink/[0.06]"><Plus size={16} /></span>
              </button>
            </li>
          ))}
          {list.length === 0 && <li className="px-3 py-10 text-center text-[15px] text-rc-muted">No card matches “{query}”.</li>}
        </ul>
      </motion.div>
    </div>
  );
}

export function CompareTab({ initialIds = [] }: { initialIds?: string[] }) {
  const userCards = useDashboardStore((s) => s.userCards);
  const [selected, setSelected] = useState<FinixCard[]>(() => initialIds.map((id) => CARD_DATASET.find((c) => c.id === id)).filter(Boolean) as FinixCard[]);
  const [picking, setPicking] = useState(false);

  const add = (card: FinixCard) => setSelected((s) => (s.length < 4 && !s.some((c) => c.id === card.id) ? [...s, card] : s));
  const remove = (id: string) => setSelected((s) => s.filter((c) => c.id !== id));
  const mine = userCards.map((u) => CARD_DATASET.find((c) => c.id === u.id)).filter(Boolean) as FinixCard[];

  const rows = COMPARE_ROWS.filter(({ key }) => selected.some((c) => c.rewards?.some((r) => r.category === key && r.rate > (c.baseRewardRate ?? 0))));

  return (
    <div className="space-y-6">
      {/* the shortlist */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, slot) => {
          const card = selected[slot];
          if (!card) {
            return (
              <button
                key={`slot-${slot}`}
                type="button"
                onClick={() => setPicking(true)}
                className="flex min-h-[150px] flex-col items-center justify-center gap-2 rounded-[22px] border border-dashed border-rc-ink/20 text-[14px] font-medium text-rc-muted transition-colors hover:border-rc-ink/40 hover:text-rc-ink"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-rc-ink/[0.06]"><Plus size={17} /></span>
                Add a card
              </button>
            );
          }
          return (
            <motion.div key={card.id} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="relative rounded-[22px] border border-rc-ink/[0.08] bg-rc-paper p-2.5">
              <CardFace name={card.name} bank={card.bank} network={card.network} width={200} lifted={false} className="!h-auto !w-full aspect-[1.586]" />
              <p className="mt-2.5 line-clamp-2 px-1 text-[14px] font-medium leading-snug text-rc-ink">{displayCardName(card.name)}</p>
              <button type="button" onClick={() => remove(card.id)} aria-label={`Remove ${card.name}`} className="absolute right-1.5 top-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-rc-night/60 text-white backdrop-blur hover:bg-rc-night/80">
                <X size={14} />
              </button>
            </motion.div>
          );
        })}
      </div>

      {selected.length < 2 && (
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-[14px] text-rc-muted">Add two to four cards to see where each one wins.</p>
          {mine.length >= 2 && selected.length === 0 && (
            <Pill variant="ghost" onClick={() => setSelected(mine.slice(0, 4))}>Compare my cards</Pill>
          )}
        </div>
      )}

      {selected.length >= 2 && (
        <Panel className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-[14px]">
            <thead>
              <tr className="border-b border-rc-ink/[0.08]">
                <th className="sticky left-0 z-10 w-[130px] bg-rc-paper px-4 py-3 text-left text-[12px] font-medium text-rc-muted"><span className="sr-only">Feature</span></th>
                {selected.map((c) => (
                  <th key={c.id} className="px-3 py-3 text-left align-bottom text-[13px] font-semibold leading-snug text-rc-ink">{displayCardName(c.name)}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-rc-ink/[0.06]">
              <CompareRow label="Annual fee" cards={selected} value={(c) => c.annualFee ?? Infinity} lowerIsBetter format={(c) => feeText(c.annualFee).replace(' a year', '')} />
              <CompareRow label="Everything else" cards={selected} value={(c) => c.baseRewardRate ?? 0} format={(c) => (c.baseRewardRate !== null ? `${c.baseRewardRate}%` : '–')} />
              {rows.map(({ key, label }) => (
                <CompareRow key={key} label={label} cards={selected} value={(c) => getRate(c, key)} format={(c) => `${getRate(c, key)}%`} />
              ))}
              <CompareRow label="Lounge visits" cards={selected} value={(c) => c.loungeAccess ?? 0} format={(c) => (c.loungeAccess ? `${c.loungeAccess} a year` : 'None')} />
            </tbody>
          </table>
          <p className="border-t border-rc-ink/[0.06] px-4 py-3 text-[12px] text-rc-muted">Highlighted: the single best value in each row. Rates are value back, from each issuer’s published terms.</p>
        </Panel>
      )}

      <AnimatePresence>
        {picking && <CardPickerSheet onSelect={add} onClose={() => setPicking(false)} excludeIds={selected.map((c) => c.id)} />}
      </AnimatePresence>
    </div>
  );
}

function CompareRow({ label, cards, value, format, lowerIsBetter }: {
  label: string; cards: FinixCard[]; value: (c: FinixCard) => number; format: (c: FinixCard) => string; lowerIsBetter?: boolean;
}) {
  const win = winner(cards.map(value), !lowerIsBetter);
  return (
    <tr>
      <td className="sticky left-0 z-10 bg-rc-paper px-4 py-3 text-[13px] text-rc-muted">{label}</td>
      {cards.map((c, i) => (
        <td key={c.id} className="px-3 py-2">
          <span className={cn('inline-block rounded-full px-2.5 py-1 tabular-nums', i === win ? 'bg-rc-pistachio font-semibold text-rc-forest' : 'text-rc-ink')}>{format(c)}</span>
        </td>
      ))}
    </tr>
  );
}
