/** Question 3: the cards you already have. Optional; search or tap from the popular list. */
import { useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Check, Plus, Search, X } from 'lucide-react';
import { EASE_OUT } from '../../../../public-platform/site/primitives';
import { CardFace, bankLabel, displayCardName } from '../../../../public-platform/site/CardFace';
import { cardsByIds } from '../../../../public-platform/site/swipeMath';
import { cn } from '../../../../lib/utils';
import { searchCards } from '../../onboardingData';

export function WalletStep({ spendCount, value, onToggle }: { spendCount: number; value: string[]; onToggle: (id: string) => void }) {
  const reduce = useReducedMotion();
  const [query, setQuery] = useState('');
  const results = useMemo(() => searchCards(query), [query]);
  const chosen = useMemo(() => cardsByIds(value), [value]);

  return (
    <div>
      <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-rc-pistachio">
        {spendCount > 0 ? `${spendCount} ${spendCount === 1 ? 'spend' : 'spends'} noted. Last one.` : 'Last one.'}
      </p>
      <h1 className="mt-3 font-serif text-[clamp(2.1rem,5vw,3.4rem)] font-semibold leading-[1.02] tracking-[-0.03em]">Which cards do you already have?</h1>
      <p className="mt-3 text-[15px] text-rc-mist">Add them and we'll tell you which one to use where. Only the card's name, never its number.</p>

      <AnimatePresence initial={false}>
        {chosen.length > 0 && (
          <motion.ul
            initial={reduce ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: EASE_OUT }}
            className="mt-6 flex flex-wrap gap-1.5 overflow-hidden"
            aria-label="In your wallet"
          >
            {chosen.map((c) => (
              <li key={c.id}>
                <button type="button" onClick={() => onToggle(c.id)} className="inline-flex items-center gap-1.5 rounded-full bg-rc-pistachio py-1.5 pl-3 pr-2 text-[13px] font-medium text-rc-ink" aria-label={`Remove ${displayCardName(c.name)}`}>
                  {displayCardName(c.name)} <X className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>

      <label className="mt-6 flex h-12 items-center gap-3 rounded-full bg-white/[0.06] px-4 ring-1 ring-white/10 transition-shadow focus-within:ring-2 focus-within:ring-rc-pistachio/70">
        <Search aria-hidden className="h-[18px] w-[18px] shrink-0 text-rc-mist" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by card or bank, like “HDFC Millennia”"
          aria-label="Search cards"
          className="h-full min-w-0 flex-1 bg-transparent text-[15px] text-rc-cream outline-none placeholder:text-rc-mist/60 [&::-webkit-search-cancel-button]:hidden"
        />
      </label>

      <p className="mb-1 mt-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-rc-mist/70">{query.trim() ? 'Matches' : 'Popular'}</p>
      {results.length === 0 ? (
        <p className="py-6 text-[14px] text-rc-mist">No card matches “{query.trim()}”. Try the bank's name.</p>
      ) : (
        <ul className="divide-y divide-white/[0.07]">
          {results.map((c) => {
            const on = value.includes(c.id);
            return (
              <li key={c.id}>
                <button type="button" aria-pressed={on} onClick={() => onToggle(c.id)} className="flex w-full items-center gap-3.5 py-3 text-left">
                  <CardFace name={c.name} bank={c.bank} network={c.network} width={52} lifted={false} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-medium text-rc-cream">{displayCardName(c.name)}</span>
                    <span className="block truncate text-[13px] text-rc-mist">{bankLabel(c.bank)}</span>
                  </span>
                  <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors duration-200', on ? 'bg-rc-pistachio text-rc-ink' : 'border border-white/15 text-rc-mist')}>
                    {on ? <Check className="h-4 w-4" strokeWidth={3} /> : <Plus className="h-4 w-4" />}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
