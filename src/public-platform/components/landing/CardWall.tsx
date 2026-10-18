/**
 * "500+ cards. Read so you don't have to." Real cards ride a tilted wall in
 * slow columns on deep forest, and a card machine in front reads one card at a
 * time, pulling its terms out of the dataset. The counts come from the full
 * catalogue (CATALOGUE_STATS).
 */
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useInView, useReducedMotion } from 'framer-motion';
import { ArrowDown, Check, Delete, X } from 'lucide-react';
import { BrandMark } from '../../site/Brand';
import { cn } from '../../../lib/utils';
import { ArrowLink, ButtonLink, Container, CountUp, EASE_OUT, formatINR, useMediaQuery } from '../../site/primitives';
import { CardFace, bankLabel, displayCardName } from '../../site/CardFace';
import { CATALOG, CATALOGUE_STATS, SPEND_CATEGORIES, cardsByIds, slugifyCardName, type FinixCard } from '../../site/swipeMath';

const READING = ['axis_atlas', 'hdfc_swiggy', 'idfc_first_wealth', 'sbi_cashback', 'hdfc_infinia', 'axis_ace', 'icici_amazon_pay', 'hsbc_live_plus'];

const STATS = [
  { value: CATALOGUE_STATS.issuers, label: 'issuers' },
  { value: CATALOGUE_STATS.pagesRead, label: 'issuer pages read' },
  { value: CATALOGUE_STATS.sourcedFacts, label: 'facts, each sourced' },
  { value: CATALOGUE_STATS.feeWaivers, label: 'fee waivers found' },
];

/** What a careful reader would pull out of a card's terms, straight from the dataset. */
function facts(c: FinixCard): { k: string; v: string }[] {
  const out: { k: string; v: string }[] = [];
  const top = [...(c.rewards ?? [])].sort((a, b) => b.rate - a.rate)[0];
  if (top) out.push({ k: 'Best at', v: `${SPEND_CATEGORIES.find((s) => s.id === top.category)?.label ?? top.category}, ${top.rate}%` });
  if (c.baseRewardRate != null) out.push({ k: 'Everything else', v: `${c.baseRewardRate}%` });
  out.push({ k: 'Annual fee', v: c.annualFee === 0 ? 'Lifetime free' : c.annualFee == null ? 'Not published' : formatINR(c.annualFee) });
  if (c.feeWaiverSpend) out.push({ k: 'Fee waived after', v: `${formatINR(c.feeWaiverSpend)} spend` });
  if (c.loungeAccess) out.push({ k: 'Lounge visits', v: `${c.loungeAccess} a year` });
  return out.slice(0, 5);
}

/** The moving wall. Memoised: it never re-renders after mount, the motion is all CSS. */
const Wall = memo(function Wall({ columns, cardW }: { columns: number; cardW: number }) {
  const cols = useMemo(() => {
    const out: FinixCard[][] = Array.from({ length: columns }, () => []);
    CATALOG.forEach((c, i) => out[i % columns].push(c));
    return out;
  }, [columns]);
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute left-1/2 top-1/2 flex gap-5"
      style={{ transform: 'translate(-50%, -50%) rotateX(52deg) rotateZ(-32deg)', transformStyle: 'preserve-3d' }}
    >
      {cols.map((col, i) => (
        <div key={i} className="h-[220vh] overflow-hidden">
          <div
            className={cn('flex flex-col gap-5 will-change-transform', i % 2 ? 'animate-rc-fall' : 'animate-rc-rise')}
            style={{ animationDuration: `${70 + (i % 3) * 14}s` }}
          >
            {[...col, ...col].map((c, j) => (
              <CardFace key={`${c.id}-${j}`} name={c.name} bank={c.bank} network={c.network} width={cardW} lifted={false} className="shadow-[0_18px_34px_-16px_rgba(0,0,0,0.7)]" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
});

type Phase = 'insert' | 'reading' | 'done' | 'eject';

/** How long each phase lasts before the next one starts. */
const PHASE_MS: Record<Phase, number> = { insert: 900, reading: 1300, done: 3600, eject: 600 };
const NEXT: Record<Phase, Phase> = { insert: 'reading', reading: 'done', done: 'eject', eject: 'insert' };

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];

/**
 * A shop-counter card machine. Each card slides into the slot, the screen reads
 * it, lists what it found in the card's terms, then the card pops back out and
 * the next one goes in.
 */
function Terminal({ live }: { live: boolean }) {
  const reduce = useReducedMotion();
  const mobile = !useMediaQuery('(min-width: 640px)');
  const cards = useMemo(() => cardsByIds(READING), []);
  const [i, setI] = useState(0);
  const [phase, setPhase] = useState<Phase>(reduce ? 'done' : 'insert');
  const card = cards[i];
  const rows = facts(card);

  const TW = mobile ? 280 : 304;
  const CW = TW * 0.78;
  const CH = CW / 1.586;
  const ready = 6; // card resting just above the slot
  const inserted = CH * 0.62; // how far in it goes

  useEffect(() => {
    if (!live || reduce) return;
    const t = setTimeout(() => {
      if (phase === 'eject') setI((n) => (n + 1) % cards.length);
      setPhase(NEXT[phase]);
    }, PHASE_MS[phase]);
    return () => clearTimeout(t);
  }, [phase, live, reduce, cards.length]);

  const cardY = phase === 'eject' ? -36 : phase === 'insert' && !reduce ? [-48, ready, ready + inserted] : ready + inserted;

  return (
    <div className="relative mx-auto" style={{ width: TW, paddingTop: CH + ready }}>
      {/* the card, behind the machine so it disappears into the slot */}
      <motion.div
        key={card.id}
        className="absolute left-1/2 top-0 z-0"
        style={{ marginLeft: -CW / 2 }}
        initial={reduce ? false : { y: -48, opacity: 0 }}
        animate={{ y: cardY, opacity: phase === 'eject' ? 0 : 1 }}
        transition={phase === 'insert'
          ? { duration: PHASE_MS.insert / 1000, times: [0, 0.35, 1], ease: [0.22, 1, 0.36, 1] }
          : { duration: 0.5, ease: EASE_OUT }}
      >
        <CardFace name={card.name} bank={card.bank} network={card.network} width={CW} />
      </motion.div>

      <div className="relative z-10 rounded-[34px] bg-gradient-to-b from-[#1d2e24] to-[#0b1610] p-4 pb-5 text-rc-ink shadow-[0_50px_100px_-30px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.08)] ring-1 ring-white/10">
        {/* the slot, on the top edge */}
        <span aria-hidden className="absolute left-1/2 top-0 h-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black shadow-[inset_0_2px_3px_rgba(255,255,255,0.08),0_1px_0_rgba(255,255,255,0.1)]" style={{ width: CW + 22 }} />

        {/* the screen */}
        <div className="relative h-[244px] overflow-hidden rounded-[18px] bg-rc-pistachio px-4 py-3 shadow-[inset_0_2px_10px_rgba(15,42,29,0.35)]" aria-live="polite">
          <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.16em] text-rc-ink/60">
            <span className="flex items-center gap-1.5"><BrandMark size={12} /> RenoCred</span>
            <span className="tabular-nums">{String(i + 1).padStart(2, '0')} / {String(cards.length).padStart(2, '0')}</span>
          </div>
          <div className="mt-2 h-px bg-rc-ink/10" />

          <AnimatePresence mode="wait" initial={false}>
            {phase === 'insert' || phase === 'eject' ? (
              <motion.div key="insert" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="flex h-[200px] flex-col items-center justify-center text-center">
                <motion.span animate={reduce ? undefined : { y: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1 }} className="text-rc-forest"><ArrowDown className="h-5 w-5" /></motion.span>
                <p className="mt-2 font-serif text-[22px] leading-tight">{phase === 'eject' ? 'Remove card' : 'Insert card'}</p>
              </motion.div>
            ) : phase === 'reading' ? (
              <motion.div key="reading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="flex h-[200px] flex-col items-center justify-center text-center">
                <p className="font-serif text-[22px] leading-tight">Reading card</p>
                <p className="mt-1 text-[12px] text-rc-ink/60">{bankLabel(card.bank)}</p>
                <div className="mt-5 h-1.5 w-40 overflow-hidden rounded-full bg-rc-ink/10">
                  <motion.div className="h-full rounded-full bg-rc-forest" initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: PHASE_MS.reading / 1000 - 0.15, ease: 'easeInOut' }} />
                </div>
              </motion.div>
            ) : (
              <motion.div key={`done-${card.id}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                <Link to={`/cards/${slugifyCardName(card.name)}`} className="mt-2.5 block truncate font-serif text-[19px] leading-tight hover:underline">
                  {displayCardName(card.name)}
                </Link>
                <ul className="mt-1.5">
                  {rows.map((r, n) => (
                    <motion.li
                      key={r.k}
                      initial={reduce ? false : { opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, ease: EASE_OUT, delay: 0.1 + n * 0.16 }}
                      className="flex items-center gap-2 border-b border-dashed border-rc-ink/15 py-[7px] text-[12.5px] last:border-0"
                    >
                      <Check className="h-3 w-3 shrink-0 text-rc-forest" strokeWidth={3} />
                      <span className="text-rc-ink/65">{r.k}</span>
                      <span className="ml-auto text-right font-semibold tabular-nums">{r.v}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* keypad */}
        <div aria-hidden className="mt-4 grid grid-cols-3 gap-1.5 px-2">
          {KEYS.map((k) => (
            <span key={k} className="flex h-8 items-center justify-center rounded-[10px] bg-white/[0.06] text-[13px] font-medium text-rc-mist shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">{k}</span>
          ))}
          <span className="flex h-9 items-center justify-center rounded-[10px] bg-rc-mist/80 text-rc-ink"><X className="h-4 w-4" strokeWidth={2.5} /></span>
          <span className="flex h-9 items-center justify-center rounded-[10px] bg-rc-sage text-rc-ink"><Delete className="h-4 w-4" strokeWidth={2.5} /></span>
          <motion.span
            key={`ok-${i}-${phase === 'done'}`}
            animate={phase === 'done' && !reduce ? { scale: [1, 0.9, 1] } : undefined}
            transition={{ duration: 0.3 }}
            className="flex h-9 items-center justify-center rounded-[10px] bg-rc-pistachio text-rc-ink"
          >
            <Check className="h-4 w-4" strokeWidth={3} />
          </motion.span>
        </div>
        <p aria-hidden className="mt-4 flex items-center justify-center gap-1.5 text-[11px] font-semibold tracking-[0.02em] text-rc-mist/70"><BrandMark size={13} tone="pistachio" /> RenoCred</p>
      </div>
    </div>
  );
}

export function CardWall() {
  const reduce = useReducedMotion();
  const desktop = useMediaQuery('(min-width: 1024px)');
  const ref = useRef<HTMLElement>(null);
  const seen = useInView(ref, { once: true, amount: 0.3 });
  const live = useInView(ref, { amount: 0.2 });

  return (
    <section ref={ref} className="relative z-10 -mt-10 overflow-hidden rounded-t-[40px] bg-rc-ink text-rc-cream lg:-mt-14 lg:rounded-t-[56px]">
      {/* the wall, faded out where the words sit */}
      <div className="absolute inset-0" style={{ perspective: 2000 }}>
        <div className="absolute inset-0 opacity-90"><Wall columns={desktop ? 9 : 5} cardW={desktop ? 210 : 150} /></div>
        <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-rc-ink via-rc-ink/70 to-rc-ink lg:bg-gradient-to-r lg:from-rc-ink lg:via-rc-ink/85 lg:to-rc-ink/0" />
        <div aria-hidden className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-rc-ink to-transparent" />
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-rc-ink to-transparent" />
      </div>

      <Container className="relative grid items-center gap-14 py-28 lg:min-h-[100svh] lg:grid-cols-12 lg:py-36">
        <div className="lg:col-span-6">
          <p className="flex items-center gap-3 text-[12px] font-semibold uppercase tracking-[0.2em] text-rc-mist">
            <span aria-hidden className="h-2 w-2 rounded-full bg-rc-pistachio" /> The catalogue
          </p>
          <h2 className="mt-6 font-serif font-semibold tracking-[-0.04em]">
            <span className="block text-[clamp(6rem,17vw,13.5rem)] leading-[0.86] text-rc-pistachio lining-nums tabular-nums">
              <CountUp to={CATALOGUE_STATS.cards} start={seen} duration={1.8} delay={0.1} />
            </span>
            <span className="mt-3 block text-[clamp(2.25rem,4.4vw,3.9rem)] leading-[1] tracking-[-0.03em]">cards. Read so<br />you don't have to.</span>
          </h2>
          <p className="mt-7 max-w-[44ch] text-[17px] leading-relaxed text-rc-mist">
            Every rate, fee and waiver, taken from {CATALOGUE_STATS.pagesRead} of the issuers' own pages and kept in one place, so the answer to “which card?” is a lookup, not an afternoon.
          </p>
          <dl className="mt-10 grid max-w-[520px] grid-cols-2 gap-3 sm:grid-cols-4">
            {STATS.map((s, n) => (
              <motion.div
                key={s.label}
                initial={reduce ? false : { opacity: 0, y: 14 }}
                animate={seen ? { opacity: 1, y: 0 } : undefined}
                transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.5 + n * 0.08 }}
                className="rounded-[20px] border border-white/10 bg-rc-ink/60 px-4 py-3.5 backdrop-blur"
              >
                <dt className="sr-only">{s.label}</dt>
                <dd className="font-serif text-[28px] font-semibold leading-none lining-nums tabular-nums text-rc-cream"><CountUp to={s.value} start={seen} delay={0.6 + n * 0.08} /></dd>
                <dd className="mt-1.5 text-[12px] text-rc-mist">{s.label}</dd>
              </motion.div>
            ))}
          </dl>
          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
            <ButtonLink to="/cards" variant="cream" size="lg">Browse the cards</ButtonLink>
            <ArrowLink to="/methodology" tone="cream">How we rank</ArrowLink>
          </div>
        </div>
        <div className="mx-auto w-full max-w-[400px] lg:col-span-4 lg:col-start-9">
          <Terminal live={live} />
        </div>
      </Container>
    </section>
  );
}
