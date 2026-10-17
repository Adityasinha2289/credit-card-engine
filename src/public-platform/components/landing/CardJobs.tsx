/**
 * "Every card has a job": a scroll story. Four real cards start as a stack, fan
 * out, step forward one at a time with the job they're best at (and the actual
 * rate, from the dataset), then line up as a wallet where every card has a role.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, transform, useMotionValueEvent, useReducedMotion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { cn } from '../../../lib/utils';
import { Container, Display, Eyebrow, useMediaQuery } from '../../site/primitives';
import { CardFace, displayCardName } from '../../site/CardFace';
import { cardsByIds, rewardFor, type FinixCard, type SpendCategory } from '../../site/swipeMath';

const JOBS: { id: string; job: string; category: SpendCategory }[] = [
  { id: 'hdfc_swiggy', job: 'Dining', category: 'dining' },
  { id: 'icici_amazon_pay', job: 'Shopping', category: 'shopping' },
  { id: 'axis_atlas', job: 'Travel', category: 'travel' },
  { id: 'axis_ace', job: 'Bills', category: 'utilities' },
];

// Scroll keyframes: stack → fan → each card in focus → line-up.
const TIMES = [0, 0.12, 0.24, 0.31, 0.4, 0.46, 0.55, 0.61, 0.7, 0.76, 0.85, 0.94, 1];
// keyframe index at which each card is in focus (it holds focus for two keyframes)
const FOCUS_AT = [3, 5, 7, 9];
const LINEUP_FROM = 11;
// progress windows for the "current job" indicator
const FOCUS_WINDOWS: [number, number][] = [[0.27, 0.43], [0.43, 0.58], [0.58, 0.73], [0.73, 0.88]];

interface Pose { x: number; y: number; rotate: number; scale: number; opacity: number; label: number }

function poses(i: number, mobile: boolean, shift: number, cardW: number): Pose[] {
  const cardH = cardW / 1.586;
  return TIMES.map((_, t) => {
    if (t <= 1) {
      // neat stack
      return { x: shift + i * 6, y: i * (mobile ? 10 : 14), rotate: i * -2, scale: 1 - i * 0.04, opacity: 1, label: 0 };
    }
    if (t === 2) {
      // fan
      const sx = mobile ? 26 : 64;
      const sy = mobile ? 26 : 34;
      return { x: shift + (i - 1.5) * sx, y: (i - 1.5) * sy, rotate: (i - 1.5) * 8, scale: 0.9, opacity: 1, label: 0 };
    }
    if (t >= LINEUP_FROM) {
      if (mobile) {
        // 2 × 2 grid
        const s = 0.6;
        return {
          x: ((i % 2) - 0.5) * (cardW * s + 18),
          y: (Math.floor(i / 2) - 0.5) * (cardH * s + 58) + 16,
          rotate: 0, scale: s, opacity: 1, label: 1,
        };
      }
      return { x: (i - 1.5) * (cardW * 0.72 + 32), y: -20, rotate: 0, scale: 0.72, opacity: 1, label: 1 };
    }
    const focus = FOCUS_AT[i];
    if (t === focus || t === focus + 1) {
      return { x: shift, y: mobile ? 8 : 0, rotate: 0, scale: mobile ? 1 : 1.08, opacity: 1, label: 1 };
    }
    // waiting in the wings: before its turn it sits to the right, after its turn to the left
    const past = t > focus + 1;
    return {
      x: shift + (past ? -1 : 1) * (mobile ? 70 : 170) + i * 8,
      y: (past ? -1 : 1) * (mobile ? 40 : 24) + i * 8,
      rotate: past ? -9 : 9,
      scale: 0.62,
      opacity: 0.35,
      label: 0,
    };
  });
}

function JobCard({ card, job, rate, index, progress, mobile, shift, width }: {
  card: FinixCard; job: string; rate: number; index: number; progress: MotionValue<number>;
  mobile: boolean; shift: number; width: number;
}) {
  // Function transforms keep this on the JS path (framer's native scroll timelines
  // don't clamp range transforms correctly), and are cheap at four cards.
  const fns = useMemo(() => {
    const p = poses(index, mobile, shift, width);
    const make = (k: keyof Pose) => transform(TIMES, p.map((v) => v[k]));
    return { x: make('x'), y: make('y'), rotate: make('rotate'), scale: make('scale'), opacity: make('opacity'), label: make('label') };
  }, [index, mobile, shift, width]);

  const x = useTransform(progress, (v) => fns.x(v));
  const y = useTransform(progress, (v) => fns.y(v));
  const rotate = useTransform(progress, (v) => fns.rotate(v));
  const scale = useTransform(progress, (v) => fns.scale(v));
  const opacity = useTransform(progress, (v) => fns.opacity(v));
  const labelOpacity = useTransform(progress, (v) => fns.label(v));
  const zIndex = useTransform(progress, (v) => {
    const [from, to] = FOCUS_WINDOWS[index];
    if (v >= from && v < to) return 50;
    return 10 - index;
  });

  return (
    <motion.div
      className="absolute left-1/2 top-1/2 will-change-transform"
      style={{ x, y, rotate, scale, opacity, zIndex, width, marginLeft: -width / 2, marginTop: -width / 1.586 / 2 }}
    >
      <motion.div style={{ opacity: labelOpacity }} className="pointer-events-none absolute bottom-full left-1/2 mb-4 flex -translate-x-1/2 flex-col items-center whitespace-nowrap">
        <span className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-rc-forest">Best for</span>
        <span className="relative rounded-md bg-rc-ink px-4 py-1.5 text-[13px] font-medium uppercase tracking-[0.14em] text-rc-cream shadow-[0_10px_24px_-12px_rgba(10,31,21,0.6)]">
          {job}<span className="ml-2 text-rc-pistachio">{rate}%</span>
          <span aria-hidden className="absolute -bottom-1 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rotate-45 bg-rc-ink" />
        </span>
      </motion.div>
      <CardFace name={card.name} bank={card.bank} network={card.network} width={width} />
    </motion.div>
  );
}

export function CardJobs() {
  const reduce = useReducedMotion();
  const mobile = !useMediaQuery('(min-width: 1024px)');
  const ref = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [stageW, setStageW] = useState(0);
  const [active, setActive] = useState(-1);

  const cards = useMemo(() => {
    const byId = new Map(cardsByIds(JOBS.map((j) => j.id)).map((c) => [c.id, c]));
    return JOBS.flatMap((j) => {
      const card = byId.get(j.id);
      return card ? [{ ...j, card, rate: rewardFor(card, j.category, 1000).rate }] : [];
    });
  }, []);

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const textOpacity = useTransform(scrollYProgress, (v) => (v < 0.82 ? 1 : Math.max(0, 1 - (v - 0.82) / 0.07)));
  const payoffOpacity = useTransform(scrollYProgress, (v) => Math.min(1, Math.max(0, (v - 0.9) / 0.05)));

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const i = FOCUS_WINDOWS.findIndex(([from, to]) => v >= from && v < to);
    setActive((prev) => (prev === i ? prev : i));
  });

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setStageW(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, [reduce]);

  const heading = (
    <>
      <Eyebrow>Your wallet</Eyebrow>
      <Display className="mt-6 text-rc-ink">Every card <span className="italic text-rc-forest">has a job.</span></Display>
      <p className="mt-6 max-w-[34ch] text-[17px] leading-relaxed text-rc-muted">RenoCred helps you understand which card belongs in which moment.</p>
    </>
  );
  const payoff = (
    <p className="font-serif text-[clamp(1.6rem,3vw,2.6rem)] leading-[1.12] tracking-[-0.015em] text-rc-ink">
      Your wallet isn't a collection of cards. <span className="italic text-rc-forest">It's a collection of better moves.</span>
    </p>
  );

  if (reduce) {
    return (
      <section className="bg-rc-pistachio py-28">
        <Container>
          {heading}
          <ul className="mt-20 grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((c) => (
              <li key={c.id} className="flex flex-col items-center">
                <span className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-rc-forest">Best for</span>
                <span className="mb-5 rounded-md bg-rc-ink px-4 py-1.5 text-[13px] font-medium uppercase tracking-[0.14em] text-rc-cream">{c.job} <span className="text-rc-pistachio">{c.rate}%</span></span>
                <CardFace name={c.card.name} bank={c.card.bank} network={c.card.network} width={260} />
              </li>
            ))}
          </ul>
          <div className="mx-auto mt-20 max-w-3xl text-center">{payoff}</div>
        </Container>
      </section>
    );
  }

  // desktop: cards live in the right part of the stage until they line up centred
  const shift = mobile ? 0 : stageW * 0.2;
  const cardW = mobile ? 220 : 320;

  return (
    <section ref={ref} className="relative h-[400vh] bg-rc-pistachio">
      <div className="sticky top-16 h-[calc(100svh-4rem)] overflow-hidden lg:top-[72px] lg:h-[calc(100svh-72px)]">
        <Container className="relative h-full">
          <motion.div style={{ opacity: textOpacity }} className="relative z-30 pt-10 lg:absolute lg:inset-y-0 lg:left-12 lg:flex lg:w-[38%] lg:flex-col lg:justify-center lg:pt-0">
            {heading}
            <ol className="mt-10 hidden space-y-3 lg:block" aria-label="Card jobs">
              {cards.map((c, i) => (
                <li key={c.id} className={cn('flex items-baseline gap-4 transition-opacity duration-500', active === i ? 'opacity-100' : 'opacity-35')}>
                  <span className="w-6 text-[12px] tabular-nums text-rc-forest">{String(i + 1).padStart(2, '0')}</span>
                  <span className="w-20 text-[15px] font-medium text-rc-ink">{c.job}</span>
                  <span className="text-[14px] text-rc-muted">{displayCardName(c.card.name)} · {c.rate}%</span>
                </li>
              ))}
            </ol>
          </motion.div>
        </Container>

        <div ref={stage} aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 top-[42%] lg:inset-0">
          {stageW > 0 && cards.map((c, i) => (
            <JobCard key={c.id} card={c.card} job={c.job} rate={c.rate} index={i} progress={scrollYProgress} mobile={mobile} shift={shift} width={cardW} />
          ))}
        </div>

        <motion.div style={{ opacity: payoffOpacity }} className="pointer-events-none absolute inset-x-0 top-[10%] z-40 lg:bottom-[11%] lg:top-auto">
          <Container className="mx-auto max-w-4xl text-center">{payoff}</Container>
        </motion.div>
      </div>
    </section>
  );
}
