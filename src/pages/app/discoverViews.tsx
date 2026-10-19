/** The Compare view of Picks for you. */
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Search, X } from 'lucide-react';
import { useDashboardStore } from '../../features/dashboard/store/dashboardStore';
import { cn } from '../../lib/utils';
import { CARD_DATASET, type FinixCard, type SpendCategory } from '../../features/finix/data/cardDataset';
import { CardFace, bankLabel, displayCardName } from '../../public-platform/site/CardFace';
import { Panel, Pill } from '../../components/shared/appUi';

const rupees = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;
const feeText = (fee: number | null) => (fee === null ? 'Fee not published' : fee === 0 ? 'Lifetime free' : `${rupees(fee)} a year`);

function getRate(card: FinixCard, cat: SpendCategory): number {
  return card.rewards?.find((x) => x.category === cat)?.rate ?? card.baseRewardRate ?? 0;
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

  return createPortal(
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
    </div>,
    document.body,
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
