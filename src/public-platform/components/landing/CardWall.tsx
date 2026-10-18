/**
 * "500+ cards. Read so you don't have to." Real cards ride a tilted wall in
 * slow columns on deep forest, while a scan line passes over them, and a panel
 * in front reads one card at a time, pulling its terms out of the dataset. The
 * counts come from the full catalogue (CATALOGUE_STATS).
 */
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useInView, useReducedMotion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { ArrowLink, ButtonLink, Container, CountUp, EASE_OUT, formatINR, useMediaQuery } from '../../site/primitives';
import { CardFace, bankLabel, displayCardName } from '../../site/CardFace';
import { CATALOG, CATALOGUE_STATS, SPEND_CATEGORIES, cardsByIds, slugifyCardName, type FinixCard } from '../../site/swipeMath';

const READ_MS = 3400;
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

function Reader({ live }: { live: boolean }) {
  const reduce = useReducedMotion();
  const cards = useMemo(() => cardsByIds(READING), []);
  const [i, setI] = useState(0);
  const card = cards[i];
  const rows = facts(card);

  useEffect(() => {
    if (!live || reduce) return;
    const t = setTimeout(() => setI((n) => (n + 1) % cards.length), READ_MS);
    return () => clearTimeout(t);
  }, [i, live, reduce, cards.length]);

  return (
    <div className="relative rounded-[32px] bg-rc-paper p-5 text-rc-ink shadow-[0_40px_90px_-30px_rgba(0,0,0,0.75)] sm:p-6">
      <div className="flex items-center justify-between text-[12px]">
        <span className="flex items-center gap-2 font-semibold uppercase tracking-[0.18em] text-rc-muted">
          <span className="relative flex h-2 w-2">
            <span className="absolute inset-0 animate-ping rounded-full bg-rc-emerald/60" />
            <span className="relative h-2 w-2 rounded-full bg-rc-emerald" />
          </span>
          Reading now
        </span>
        <span className="tabular-nums text-rc-muted">{String(i + 1).padStart(2, '0')} / {String(cards.length).padStart(2, '0')}</span>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={card.id} initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
          <Link to={`/cards/${slugifyCardName(card.name)}`} className="group relative mt-5 block overflow-hidden rounded-[18px]">
            <motion.div initial={reduce ? false : { rotate: -6, y: 18, scale: 0.94 }} animate={{ rotate: 0, y: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 160, damping: 18 }}>
              <CardFace name={card.name} bank={card.bank} network={card.network} width={320} lifted={false} className="!h-auto !w-full aspect-[1.586]" />
            </motion.div>
            {!reduce && (
              <motion.span
                aria-hidden
                className="pointer-events-none absolute inset-x-0 h-16 bg-gradient-to-b from-transparent to-rc-pistachio/70"
                style={{ borderBottom: '2px solid #E3EED4' }}
                initial={{ top: '-30%' }}
                animate={{ top: '110%' }}
                transition={{ duration: 1.2, ease: 'easeInOut', delay: 0.15 }}
              />
            )}
          </Link>
          <p className="mt-4 flex items-baseline justify-between gap-3">
            <span className="font-serif text-[22px] leading-tight text-rc-ink">{displayCardName(card.name)}</span>
            <span className="shrink-0 text-[12px] text-rc-muted">{bankLabel(card.bank)}</span>
          </p>
          <ul className="mt-3 min-h-[214px] divide-y divide-rc-ink/[0.07]">
            {rows.map((r, n) => (
              <motion.li
                key={r.k}
                initial={reduce ? false : { opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, ease: EASE_OUT, delay: 0.7 + n * 0.22 }}
                className="flex items-center gap-3 py-2.5 text-[14px]"
              >
                <motion.span
                  initial={reduce ? false : { scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 18, delay: 0.8 + n * 0.22 }}
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rc-ink text-rc-pistachio"
                >
                  <Check className="h-3 w-3" strokeWidth={3} />
                </motion.span>
                <span className="text-rc-muted">{r.k}</span>
                <span className="ml-auto text-right font-medium tabular-nums text-rc-ink">{r.v}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </AnimatePresence>
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
        {!reduce && (
          <div aria-hidden className="pointer-events-none absolute inset-0 animate-rc-scan">
            <div className="absolute inset-x-0 bottom-1/2 h-48 bg-gradient-to-b from-transparent to-rc-pistachio/[0.16]" />
            <div className="absolute inset-x-0 bottom-1/2 h-[2px] bg-rc-pistachio/80 shadow-[0_0_30px_8px_rgba(227,238,212,0.45)]" />
          </div>
        )}
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
          <Reader live={live} />
        </div>
      </Container>
    </section>
  );
}
