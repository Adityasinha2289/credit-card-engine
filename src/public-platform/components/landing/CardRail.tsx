import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { ArrowLink, Container, Display, Eyebrow, Reveal, formatINR } from '../../site/primitives';
import { CardFace, bankLabel, shortCardName } from '../../site/CardFace';
import { CATALOG, CATALOG_STATS, SPEND_CATEGORIES, slugifyCardName, type FinixCard, type SpendCategory } from '../../site/swipeMath';

const POPULAR = [
  'hdfc_infinia', 'axis_atlas', 'sbi_cashback', 'icici_amazon_pay', 'hdfc_swiggy', 'hdfc_regalia_gold',
  'axis_ace', 'hsbc_live_plus', 'hdfc_millennia', 'idfc_first_wealth', 'hdfc_tata_neu_infinity', 'amex_platinum_travel',
];

const rate = (c: FinixCard, cat: SpendCategory) => c.rewards?.find((r) => r.category === cat)?.rate ?? 0;

const FILTERS: { id: string; label: string; pick: (cards: FinixCard[]) => FinixCard[] }[] = [
  { id: 'popular', label: 'Popular', pick: (cards) => POPULAR.map((id) => cards.find((c) => c.id === id)).filter((c): c is FinixCard => !!c) },
  { id: 'free', label: 'Lifetime free', pick: (cards) => cards.filter((c) => c.annualFee === 0).sort((a, b) => (b.baseRewardRate ?? 0) - (a.baseRewardRate ?? 0)) },
  { id: 'travel', label: 'Travel', pick: (cards) => cards.filter((c) => rate(c, 'travel') >= 3).sort((a, b) => rate(b, 'travel') - rate(a, 'travel')) },
  { id: 'dining', label: 'Dining', pick: (cards) => cards.filter((c) => rate(c, 'dining') >= 3).sort((a, b) => rate(b, 'dining') - rate(a, 'dining')) },
  { id: 'shopping', label: 'Shopping', pick: (cards) => cards.filter((c) => rate(c, 'shopping') >= 3).sort((a, b) => rate(b, 'shopping') - rate(a, 'shopping')) },
  { id: 'fuel', label: 'Fuel', pick: (cards) => cards.filter((c) => rate(c, 'fuel') >= 3).sort((a, b) => rate(b, 'fuel') - rate(a, 'fuel')) },
  { id: 'premium', label: 'Premium', pick: (cards) => cards.filter((c) => (c.annualFee ?? 0) >= 10000).sort((a, b) => (b.annualFee ?? 0) - (a.annualFee ?? 0)) },
];

function bestLine(c: FinixCard): string {
  const top = [...(c.rewards ?? [])].sort((a, b) => b.rate - a.rate)[0];
  if (top && top.rate > (c.baseRewardRate ?? 0)) {
    const label = SPEND_CATEGORIES.find((s) => s.id === top.category)?.label.toLowerCase() ?? top.category;
    return `${top.rate}% on ${label}`;
  }
  return c.baseRewardRate != null ? `${c.baseRewardRate}% on everything` : 'Reward rate not published';
}

function feeLine(c: FinixCard): string {
  if (c.annualFee === null) return 'Fee not disclosed';
  return c.annualFee === 0 ? 'Lifetime free' : `${formatINR(c.annualFee)} a year`;
}

export function CardRail() {
  const [filter, setFilter] = useState(FILTERS[0].id);
  const scroller = useRef<HTMLUListElement>(null);
  const cards = useMemo(() => FILTERS.find((f) => f.id === filter)!.pick(CATALOG).slice(0, 12), [filter]);

  const scrollBy = (dir: 1 | -1) => scroller.current?.scrollBy({ left: dir * 320, behavior: 'smooth' });

  return (
    <section className="overflow-hidden bg-rc-ink py-28 text-rc-cream lg:py-40">
      <Container>
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <Reveal className="max-w-3xl">
            <Eyebrow index="03" tone="cream">The catalogue</Eyebrow>
            <Display className="mt-6">{CATALOG_STATS.cards} cards, <span className="italic text-rc-pistachio">read so you don't have to.</span></Display>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="max-w-[38ch] text-[16px] leading-relaxed text-rc-mist">
              Fees, reward rates, caps and eligibility for every card from {CATALOG_STATS.banks} issuers, side by side.
            </p>
          </Reveal>
        </div>

        <div className="mt-14 flex items-center justify-between gap-6">
          <div role="tablist" aria-label="Filter cards" className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={filter === f.id}
                onClick={() => { setFilter(f.id); scroller.current?.scrollTo({ left: 0 }); }}
                className={cn(
                  'shrink-0 rounded-full px-4 py-2 text-[14px] transition-colors',
                  filter === f.id ? 'bg-rc-cream text-rc-ink' : 'text-rc-mist hover:text-rc-cream',
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="hidden shrink-0 gap-2 md:flex">
            <button type="button" aria-label="Scroll left" onClick={() => scrollBy(-1)} className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 transition-colors hover:border-white/50"><ArrowLeft className="h-4 w-4" /></button>
            <button type="button" aria-label="Scroll right" onClick={() => scrollBy(1)} className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 transition-colors hover:border-white/50"><ArrowRight className="h-4 w-4" /></button>
          </div>
        </div>
      </Container>

      <ul
        ref={scroller}
        className="mt-10 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth px-5 pb-6 sm:px-8 lg:px-[max(3rem,calc((100vw_-_1280px)/2_+_3rem))] lg:scroll-px-[max(3rem,calc((100vw_-_1280px)/2_+_3rem))] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {cards.map((c) => (
          <li key={c.id} className="w-[280px] shrink-0 snap-start">
            <Link to={`/cards/${slugifyCardName(c.name)}`} className="group block">
              <div className="transition-transform duration-500 group-hover:-translate-y-1.5">
                <CardFace name={c.name} bank={c.bank} network={c.network} width={280} />
              </div>
              <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-rc-mist">{bankLabel(c.bank)}</p>
              <p className="mt-1.5 font-serif text-[22px] leading-snug group-hover:underline group-hover:decoration-rc-cream/40 group-hover:underline-offset-4">{shortCardName(c.name, c.bank)}</p>
              <p className="mt-2 text-[14px] text-rc-mist">{bestLine(c)} · {feeLine(c)}</p>
            </Link>
          </li>
        ))}
      </ul>

      <Container className="mt-8">
        <ArrowLink to="/cards" tone="cream">Browse all {CATALOG_STATS.cards} cards</ArrowLink>
      </Container>
    </section>
  );
}
