import { useId, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Plus, Search, X } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { Container, Display, Eyebrow, Reveal, EASE_OUT, formatINR } from '../../site/primitives';
import { CardFace, bankLabel, displayCardName } from '../../site/CardFace';
import {
  CATALOG, SPEND_CATEGORIES, bestInCatalog, cardsByIds, rankCards, slugifyCardName,
  type FinixCard, type SpendCategory,
} from '../../site/swipeMath';
import { analytics } from '../../../lib/analytics';

const START_WALLET = ['sbi_cashback', 'axis_ace', 'icici_amazon_pay', 'hdfc_regalia_gold'];
const PRESETS = [500, 2500, 10000, 50000];
const MAX_CARDS = 6;
const MIN_AMOUNT = 100;
const MAX_AMOUNT = 200000;

function CardPicker({ exclude, onAdd, disabled }: { exclude: string[]; onAdd: (c: FinixCard) => void; disabled: boolean }) {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    return CATALOG
      .filter((c) => !exclude.includes(c.id) && `${c.name} ${bankLabel(c.bank)}`.toLowerCase().includes(q))
      .slice(0, 6);
  }, [query, exclude]);

  const choose = (c: FinixCard) => { onAdd(c); setQuery(''); setActive(0); inputRef.current?.focus(); };

  return (
    <div className="relative">
      <label className="relative block">
        <span className="sr-only">Add a card</span>
        <Search aria-hidden className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-rc-muted" />
        <input
          ref={inputRef}
          role="combobox"
          aria-expanded={matches.length > 0}
          aria-controls={listId}
          aria-activedescendant={matches.length ? `${listId}-${active}` : undefined}
          aria-autocomplete="list"
          disabled={disabled}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setActive(0); }}
          onKeyDown={(e) => {
            if (!matches.length) return;
            if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => (a + 1) % matches.length); }
            if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => (a - 1 + matches.length) % matches.length); }
            if (e.key === 'Enter') { e.preventDefault(); choose(matches[active]); }
            if (e.key === 'Escape') setQuery('');
          }}
          placeholder={disabled ? `Up to ${MAX_CARDS} cards` : 'Add a card, e.g. Regalia'}
          className="h-12 w-full rounded-full border border-rc-ink/15 bg-white pl-11 pr-4 text-[14px] text-rc-ink outline-none transition-colors placeholder:text-rc-muted/80 focus:border-rc-ink/50 disabled:cursor-not-allowed disabled:bg-rc-cream"
        />
      </label>
      {matches.length > 0 && (
        <ul id={listId} role="listbox" className="absolute inset-x-0 top-[calc(100%+6px)] z-20 overflow-hidden rounded-2xl border border-rc-ink/10 bg-white py-1.5 shadow-[0_20px_40px_-20px_rgba(10,31,21,0.35)]">
          {matches.map((c, i) => (
            <li
              key={c.id}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              onMouseEnter={() => setActive(i)}
              onMouseDown={(e) => { e.preventDefault(); choose(c); }}
              className={cn('flex cursor-pointer items-center gap-3 px-4 py-2.5', i === active && 'bg-rc-cream')}
            >
              <CardFace name={c.name} bank={c.bank} width={44} lifted={false} />
              <span className="min-w-0">
                <span className="block truncate text-[14px] text-rc-ink">{displayCardName(c.name)}</span>
                <span className="block text-[12px] text-rc-muted">{bankLabel(c.bank)}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function SwipeSimulator() {
  // rendered as the page body of /calculators/which-card-to-use
  const reduce = useReducedMotion();
  const [category, setCategory] = useState<SpendCategory>('dining');
  const [amount, setAmount] = useState(2500);
  const [walletIds, setWalletIds] = useState<string[]>(START_WALLET);
  const touched = useRef(false);

  const touch = () => {
    if (touched.current) return;
    touched.current = true;
    analytics.track('Feature Used', { featureName: 'landing_swipe_simulator' });
  };

  const wallet = useMemo(() => cardsByIds(walletIds), [walletIds]);
  const ranked = useMemo(() => rankCards(wallet, category, amount), [wallet, category, amount]);
  const market = useMemo(() => bestInCatalog(category, amount, walletIds), [category, amount, walletIds]);
  const [best, next] = ranked;
  const top = Math.max(best?.reward ?? 0, 1);
  const categoryLabel = SPEND_CATEGORIES.find((c) => c.id === category)?.label.toLowerCase() ?? category;

  return (
    <section className="pb-28 pt-16 lg:pb-36 lg:pt-24">
      <Container>
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <Reveal className="lg:col-span-7">
            <Eyebrow>Free tool</Eyebrow>
            <Display as="h1" className="mt-6 text-rc-ink">Which card <span className="italic text-rc-forest">should I use?</span></Display>
          </Reveal>
          <Reveal delay={0.1} className="lg:col-span-5">
            <p className="max-w-[42ch] text-[17px] leading-relaxed text-rc-muted">
              Real reward rates from our catalogue. Swap the cards below for the ones in your wallet and see what each swipe is worth.
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.15} className="mt-14">
          <div className="grid overflow-hidden rounded-[28px] border border-rc-ink/10 bg-rc-paper lg:grid-cols-12">
            {/* inputs */}
            <div className="space-y-9 border-b border-rc-ink/10 p-6 sm:p-9 lg:col-span-5 lg:border-b-0 lg:border-r">
              <fieldset>
                <legend className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-rc-muted">What are you paying for?</legend>
                <div role="radiogroup" className="flex flex-wrap gap-2">
                  {SPEND_CATEGORIES.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      role="radio"
                      aria-checked={category === c.id}
                      onClick={() => { setCategory(c.id); touch(); }}
                      className={cn(
                        'rounded-full border px-4 py-2 text-[14px] transition-colors',
                        category === c.id ? 'border-rc-ink bg-rc-ink text-rc-cream' : 'border-rc-ink/15 text-rc-ink hover:border-rc-ink/40',
                      )}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </fieldset>

              <div>
                <div className="mb-4 flex items-baseline justify-between">
                  <label htmlFor="sim-amount" className="text-[11px] font-semibold uppercase tracking-[0.2em] text-rc-muted">How much?</label>
                  <div className="flex items-baseline gap-1 font-serif text-[34px] leading-none text-rc-ink">
                    <span aria-hidden>₹</span>
                    <input
                      id="sim-amount"
                      inputMode="numeric"
                      value={amount.toLocaleString('en-IN')}
                      onChange={(e) => {
                        const n = Number(e.target.value.replace(/[^\d]/g, ''));
                        setAmount(Math.min(MAX_AMOUNT, Number.isFinite(n) ? n : 0));
                        touch();
                      }}
                      onBlur={() => setAmount((a) => Math.max(MIN_AMOUNT, a))}
                      style={{ width: `${Math.max(2, amount.toLocaleString('en-IN').length) + 0.4}ch` }}
                      className="bg-transparent text-left tabular-nums outline-none focus:underline focus:decoration-rc-ink/30 focus:underline-offset-8"
                    />
                  </div>
                </div>
                <input
                  type="range"
                  aria-label="Amount"
                  min={MIN_AMOUNT}
                  max={60000}
                  step={100}
                  value={Math.min(amount, 60000)}
                  onChange={(e) => { setAmount(Number(e.target.value)); touch(); }}
                  className="rc-range w-full"
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  {PRESETS.map((p) => (
                    <button key={p} type="button" onClick={() => { setAmount(p); touch(); }} className={cn('rounded-full px-3 py-1 text-[12px] transition-colors', amount === p ? 'bg-rc-ink/10 text-rc-ink' : 'text-rc-muted hover:text-rc-ink')}>
                      {formatINR(p)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-rc-muted">Your cards</p>
                <ul className="mb-3 flex flex-wrap gap-2">
                  {wallet.map((c) => (
                    <li key={c.id} className="flex items-center gap-2 rounded-full border border-rc-ink/15 bg-white py-1 pl-1.5 pr-1 text-[13px] text-rc-ink">
                      <CardFace name={c.name} bank={c.bank} width={30} lifted={false} />
                      <span className="max-w-[16ch] truncate">{displayCardName(c.name)}</span>
                      <button
                        type="button"
                        aria-label={`Remove ${c.name}`}
                        disabled={wallet.length <= 1}
                        onClick={() => { setWalletIds((ids) => ids.filter((id) => id !== c.id)); touch(); }}
                        className="rounded-full p-1 text-rc-muted transition-colors hover:bg-rc-ink/[0.06] hover:text-rc-ink disabled:opacity-30"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
                <CardPicker
                  exclude={walletIds}
                  disabled={walletIds.length >= MAX_CARDS}
                  onAdd={(c) => { setWalletIds((ids) => [...ids, c.id]); touch(); }}
                />
              </div>
            </div>

            {/* answer */}
            <div className="flex flex-col p-6 sm:p-9 lg:col-span-7">
              {best && (
                <div aria-live="polite" className="min-h-[132px]">
                  <p className="text-[14px] text-rc-muted">For {formatINR(amount)} on {categoryLabel}, swipe</p>
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={best.card.id}
                      initial={reduce ? false : { opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.35, ease: EASE_OUT }}
                      className="mt-2 flex flex-wrap items-end justify-between gap-x-6 gap-y-2"
                    >
                      <p className="font-serif text-[clamp(2rem,3.4vw,2.75rem)] leading-[1.02] text-rc-ink">{displayCardName(best.card.name)}</p>
                      <p className="font-serif text-[clamp(2rem,3.4vw,2.75rem)] leading-none text-rc-emerald tabular-nums">+{formatINR(best.reward)}</p>
                    </motion.div>
                  </AnimatePresence>
                  <p className="mt-3 text-[14px] text-rc-muted">
                    {next && best.reward > next.reward
                      ? <>That's {formatINR(best.reward - next.reward)} more than your next best card.</>
                      : next ? <>Same value as {displayCardName(next.card.name)}{(best.card.annualFee ?? 0) < (next.card.annualFee ?? 0) ? ', with a lower annual fee' : ''}.</> : null}
                  </p>
                </div>
              )}

              <ol className="mt-8 space-y-2">
                {ranked.map((r, i) => (
                  <motion.li
                    layout={!reduce}
                    transition={{ type: 'spring', stiffness: 400, damping: 36 }}
                    key={r.card.id}
                    className={cn('grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-2xl px-4 py-3', i === 0 ? 'bg-rc-ink text-rc-cream' : 'bg-white/60')}
                  >
                    <CardFace name={r.card.name} bank={r.card.bank} width={56} lifted={false} />
                    <div className="min-w-0">
                      <p className="truncate text-[14px] font-medium">{displayCardName(r.card.name)}</p>
                      <div className="mt-1.5 flex items-center gap-3">
                        <span className={cn('h-1 overflow-hidden rounded-full', i === 0 ? 'bg-white/15' : 'bg-rc-ink/10')} style={{ width: '45%' }}>
                          <motion.span
                            className={cn('block h-full rounded-full', i === 0 ? 'bg-rc-pistachio' : 'bg-rc-sage')}
                            animate={{ width: `${(r.reward / top) * 100}%` }}
                            transition={{ duration: reduce ? 0 : 0.5, ease: EASE_OUT }}
                          />
                        </span>
                        <span className={cn('text-[12px]', i === 0 ? 'text-rc-mist' : 'text-rc-muted')}>
                          {r.rate}% {r.categoryMatch ? `on ${categoryLabel}` : 'base rate'}{r.capped ? ', capped' : ''}
                        </span>
                      </div>
                    </div>
                    <p className="text-[15px] font-medium tabular-nums">{formatINR(r.reward)}</p>
                  </motion.li>
                ))}
              </ol>

              {market && (
                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-dashed border-rc-ink/20 px-5 py-4 text-[14px]">
                  {market.reward > (best?.reward ?? 0) ? (
                    <p className="text-rc-ink">
                      Best on the market for this:{' '}
                      <Link to={`/cards/${slugifyCardName(market.card.name)}`} className="font-medium underline decoration-rc-ink/30 underline-offset-4 hover:decoration-rc-ink">
                        {displayCardName(market.card.name)}
                      </Link>{' '}
                      at {market.rate}%, {formatINR(market.reward)} back.
                    </p>
                  ) : (
                    <p className="text-rc-ink">Your wallet already holds the best card in our catalogue for this.</p>
                  )}
                </div>
              )}

              <p className="mt-auto pt-8 text-[12px] leading-relaxed text-rc-muted">
                Estimates use each card's published rate for the category, and caps where the issuer states one. Exclusions and points conversion vary; check the issuer's terms.
              </p>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
