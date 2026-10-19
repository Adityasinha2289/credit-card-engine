/**
 * Add a card to the wallet: search the cards we hold reward rates for and tap
 * one. Cards we know only from the wider catalogue show up too, with a link to
 * their page, so a search never dead-ends. A bottom sheet on phones.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Plus, Search, X } from 'lucide-react';
import { toast } from 'sonner';
import { CARD_DATASET } from '../../finix/data/cardDataset';
import { useDashboardStore } from '../store/dashboardStore';
import { analytics } from '../../../lib/analytics';
import { getCardTheme } from '../../finix/config/cardThemeRegistry';
import { CardFace, bankLabel, displayCardName } from '../../../public-platform/site/CardFace';
import { cn } from '../../../lib/utils';

interface CatalogueOnly { slug: string; name: string; issuer: string }

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

export default function AddCardModal({ onClose }: { onClose: () => void }) {
  const profile = useDashboardStore((s) => s.profile);
  const userCards = useDashboardStore((s) => s.userCards);
  const addUserCard = useDashboardStore((s) => s.addUserCard);

  const [query, setQuery] = useState('');
  const [bank, setBank] = useState('');
  const [others, setOthers] = useState<CatalogueOnly[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // phones: don't throw the keyboard up over the list before the sheet settles
    const t = setTimeout(() => { if (window.matchMedia('(min-width: 640px)').matches) inputRef.current?.focus(); }, 250);
    return () => clearTimeout(t);
  }, []);

  const available = useMemo(() => CARD_DATASET.filter((c) => !userCards.some((u) => u.id === c.id)), [userCards]);
  const banks = useMemo(() => {
    const count = new Map<string, number>();
    available.forEach((c) => count.set(c.bank, (count.get(c.bank) ?? 0) + 1));
    return [...count.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([b]) => b);
  }, [available]);

  const q = norm(query);
  const matches = available
    .filter((c) => !bank || c.bank === bank)
    .filter((c) => !q || norm(`${c.bank} ${c.name}`).includes(q) || norm(c.name).includes(q));

  // the wider catalogue, loaded only once someone searches
  useEffect(() => {
    if (q.length < 3) { setOthers([]); return; }
    let live = true;
    void import('../../../public-platform/lib/cardKnowledgeGraph').then(({ getDirectoryCards }) => {
      if (!live) return;
      setOthers(getDirectoryCards()
        .filter((c) => c.hasRates === false && norm(`${c.issuer} ${c.cardName}`).includes(q))
        .slice(0, 6)
        .map((c) => ({ slug: c.slug, name: c.cardName, issuer: c.issuer })));
    });
    return () => { live = false; };
  }, [q]);

  const add = (c: (typeof CARD_DATASET)[number]) => {
    // Only what we know: the product. Number, expiry and limit stay empty rather than invented.
    void addUserCard({
      id: c.id,
      pan: '',
      cardholderName: profile?.name || '',
      expiry: '',
      network: c.network.toLowerCase() as never,
      bank: c.bank,
      status: 'active',
      availableCredit: 0,
      creditLimit: 0,
      label: c.name,
      gradientFrom: getCardTheme(c.id).gradientFrom,
      gradientTo: getCardTheme(c.id).gradientTo,
    });
    analytics.track('Card Added', { bank: c.bank, network: c.network, cardName: c.name });
    toast.success(`${displayCardName(c.name)} added`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-rc-night/70 backdrop-blur-sm" />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Add a card"
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 60 }}
        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
        className="relative flex h-[88dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-[32px] bg-rc-cream text-rc-ink sm:h-auto sm:max-h-[86dvh] sm:rounded-[32px]"
      >
        <div aria-hidden className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-rc-ink/15 sm:hidden" />
        <div className="px-5 pb-3 pt-4 sm:px-6 sm:pt-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-serif text-[26px] font-semibold leading-tight tracking-[-0.02em]">Add a card</h2>
              <p className="mt-0.5 text-[14px] text-rc-muted">Pick the product. No card number needed.</p>
            </div>
            <button type="button" onClick={onClose} aria-label="Close" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rc-ink/[0.06] hover:bg-rc-ink/[0.1]">
              <X size={16} />
            </button>
          </div>

          <label className="mt-4 flex h-12 items-center gap-3 rounded-full border border-rc-ink/10 bg-white px-4 focus-within:border-rc-forest/40">
            <Search aria-hidden size={17} className="text-rc-ink/40" />
            <span className="sr-only">Search cards</span>
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by card or bank"
              enterKeyHint="search"
              className="h-full w-full bg-transparent text-[16px] outline-none placeholder:text-rc-ink/40"
            />
            {query && <button type="button" onClick={() => setQuery('')} aria-label="Clear search" className="text-rc-ink/40 hover:text-rc-ink"><X size={16} /></button>}
          </label>

          <div className="-mx-5 mt-3 flex gap-2 overflow-x-auto px-5 [scrollbar-width:none] sm:-mx-6 sm:px-6 [&::-webkit-scrollbar]:hidden">
            {['', ...banks].map((b) => (
              <button
                key={b || 'all'}
                type="button"
                onClick={() => setBank(b === bank ? '' : b)}
                className={cn('h-8 shrink-0 rounded-full px-3.5 text-[13px] transition-colors', bank === b ? 'bg-rc-ink font-medium text-rc-cream' : 'bg-rc-ink/[0.06] text-rc-ink hover:bg-rc-ink/[0.1]')}
              >
                {b ? bankLabel(b) : 'All banks'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-3 pb-[calc(16px+env(safe-area-inset-bottom))] sm:px-4">
          <ul>
            {matches.slice(0, 60).map((c) => (
              <li key={c.id}>
                <button type="button" onClick={() => add(c)} className="flex w-full items-center gap-3.5 rounded-[18px] px-2.5 py-2.5 text-left transition-colors hover:bg-white active:bg-white">
                  <CardFace name={c.name} bank={c.bank} network={c.network} width={64} lifted={false} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-medium">{displayCardName(c.name)}</span>
                    <span className="block text-[13px] text-rc-muted">
                      {bankLabel(c.bank)} · {c.annualFee === null ? 'fee not published' : c.annualFee === 0 ? 'lifetime free' : `₹${c.annualFee.toLocaleString('en-IN')} a year`}
                    </span>
                  </span>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rc-ink text-rc-cream"><Plus size={16} /></span>
                </button>
              </li>
            ))}
          </ul>

          {matches.length === 0 && others.length === 0 && (
            <p className="px-3 py-10 text-center text-[15px] text-rc-muted">No card matches “{query}”. Try the bank’s name.</p>
          )}

          {others.length > 0 && (
            <div className="mt-4 rounded-[22px] bg-rc-ink/[0.04] p-3">
              <p className="px-2 pb-2 text-[13px] leading-snug text-rc-muted">
                In our catalogue, not yet in wallets: we’re still filling in their reward rates.
              </p>
              <ul>
                {others.map((o) => (
                  <li key={o.slug}>
                    <Link to={`/cards/${o.slug}`} onClick={onClose} className="flex items-center justify-between gap-3 rounded-[14px] px-2 py-2.5 text-[14px] hover:bg-white">
                      <span className="min-w-0 truncate"><span className="font-medium">{displayCardName(o.name)}</span> <span className="text-rc-muted">· {bankLabel(o.issuer)}</span></span>
                      <ArrowUpRight size={15} className="shrink-0 text-rc-forest" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
