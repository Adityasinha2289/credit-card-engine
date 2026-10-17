import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { PublicCardEntity } from '../lib/cardKnowledgeGraph';
import { CardFace, displayCardName } from './CardFace';
import { bankLabel } from './banks';

/** Searchable card picker (combobox) for the calculators. */
export function CardSelect({ cards, value, onChange, label = 'Card' }: {
  cards: PublicCardEntity[];
  value: PublicCardEntity;
  onChange: (c: PublicCardEntity) => void;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const listId = useId();
  const root = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (q ? cards.filter((c) => `${c.cardName} ${bankLabel(c.issuer)}`.toLowerCase().includes(q)) : cards).slice(0, 40);
  }, [cards, query]);

  useEffect(() => {
    if (!open) return;
    input.current?.focus();
    const close = (e: MouseEvent) => { if (!root.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const choose = (c: PublicCardEntity) => { onChange(c); setOpen(false); setQuery(''); };

  return (
    <div ref={root} className="relative">
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-rc-muted">{label}</p>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-4 rounded-2xl border border-rc-ink/15 bg-white px-4 py-3 text-left transition-colors hover:border-rc-ink/40"
      >
        <CardFace name={value.cardName} bank={value.issuer} network={value.network} width={64} lifted={false} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[16px] font-medium text-rc-ink">{displayCardName(value.cardName)}</span>
          <span className="block text-[13px] text-rc-muted">{bankLabel(value.issuer)}</span>
        </span>
        <ChevronDown className={cn('h-4 w-4 shrink-0 text-rc-muted transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute inset-x-0 top-[calc(100%+8px)] z-30 overflow-hidden rounded-2xl border border-rc-ink/10 bg-white shadow-[0_24px_48px_-24px_rgba(10,31,21,0.4)]">
          <label className="relative block border-b border-rc-ink/10">
            <span className="sr-only">Search cards</span>
            <Search aria-hidden className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-rc-muted" />
            <input
              ref={input}
              role="combobox"
              aria-expanded
              aria-controls={listId}
              aria-activedescendant={matches.length ? `${listId}-${active}` : undefined}
              value={query}
              onChange={(e) => { setQuery(e.target.value); setActive(0); }}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, matches.length - 1)); }
                if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
                if (e.key === 'Enter' && matches[active]) { e.preventDefault(); choose(matches[active]); }
                if (e.key === 'Escape') setOpen(false);
              }}
              placeholder="Search 140+ cards"
              className="h-12 w-full bg-transparent pl-11 pr-4 text-[14px] text-rc-ink outline-none placeholder:text-rc-muted/80"
            />
          </label>
          <ul id={listId} role="listbox" className="max-h-80 overflow-y-auto py-1.5">
            {matches.length === 0 && <li className="px-4 py-6 text-center text-[14px] text-rc-muted">No card matches "{query}"</li>}
            {matches.map((c, i) => (
              <li
                key={c.id}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={c.id === value.id}
                onMouseEnter={() => setActive(i)}
                onMouseDown={(e) => { e.preventDefault(); choose(c); }}
                className={cn('flex cursor-pointer items-center gap-3 px-4 py-2.5', i === active && 'bg-rc-cream')}
              >
                <CardFace name={c.cardName} bank={c.issuer} network={c.network} width={44} lifted={false} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] text-rc-ink">{displayCardName(c.cardName)}</span>
                  <span className="block text-[12px] text-rc-muted">{bankLabel(c.issuer)}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/** ₹ amount field used for the spend inputs. */
export function MoneyInput({ id, value, onChange, label }: { id: string; value: number; onChange: (n: number) => void; label: string }) {
  return (
    <label htmlFor={id} className="flex items-center justify-between gap-4 border-b border-rc-ink/10 py-3.5">
      <span className="text-[15px] text-rc-ink">{label}</span>
      <span className="flex items-baseline gap-1 rounded-full bg-white px-4 py-1.5 ring-1 ring-rc-ink/10 focus-within:ring-rc-ink/40">
        <span className="text-[14px] text-rc-muted">₹</span>
        <input
          id={id}
          inputMode="numeric"
          value={value ? value.toLocaleString('en-IN') : ''}
          placeholder="0"
          onChange={(e) => onChange(Math.min(10_000_000, Number(e.target.value.replace(/[^\d]/g, '')) || 0))}
          className="w-24 bg-transparent text-right text-[15px] tabular-nums text-rc-ink outline-none"
        />
      </span>
    </label>
  );
}
