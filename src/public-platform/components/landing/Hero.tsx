/**
 * The first screen is a wallet: a leather card holder with five real cards in
 * it. For each spend, RenoCred pulls the card that earns the most up and out,
 * and the reward is written beside it. Click any card to pull it yourself.
 */
import { useEffect, useId, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion, type Variants } from 'framer-motion';
import { cn } from '../../../lib/utils';
import { ButtonLink, Container, EASE_OUT, formatINR, useMediaQuery } from '../../site/primitives';
import { CardFace, displayCardName } from '../../site/CardFace';
import { HERO_MOMENTS, SAMPLE_WALLET_IDS, SPEND_CATEGORIES, cardsByIds, rankCards } from '../../site/swipeMath';
import { SIGN_UP } from '../../site/nav';

const ROTATE_MS = 3800;

/** Resting fan inside the holder, at the 280px design width. */
const FAN = [{ x: -112, r: -7 }, { x: -56, r: -3.5 }, { x: 0, r: 0 }, { x: 56, r: 3.5 }, { x: 112, r: 7 }];

const letter: Variants = {
  hidden: { y: '115%', opacity: 0, rotateX: -75 },
  shown: (i: number) => ({ y: '0%', opacity: 1, rotateX: 0, transition: { duration: 0.85, ease: EASE_OUT, delay: 0.1 + i * 0.03 } }),
  gone: (i: number) => ({ y: '-115%', opacity: 0, rotateX: 60, transition: { duration: 0.5, ease: [0.6, 0, 0.8, 0.3], delay: i * 0.012 } }),
};

/**
 * Outline of the holder's front, inset by `d`: a rounded rectangle with a thumb
 * notch scooped out of the top edge. d = 0 is the cut edge; d > 0 is a stitch line.
 */
function holderPath(w: number, h: number, r: number, n: number, d: number) {
  const rr = r - d;
  const nn = n + d;
  return [
    `M ${d + rr} ${d}`,
    `L ${w / 2 - nn} ${d}`,
    `A ${nn} ${nn} 0 0 0 ${w / 2 + nn} ${d}`,
    `L ${w - d - rr} ${d}`,
    `A ${rr} ${rr} 0 0 1 ${w - d} ${d + rr}`,
    `L ${w - d} ${h - d - rr}`,
    `A ${rr} ${rr} 0 0 1 ${w - d - rr} ${h - d}`,
    `L ${d + rr} ${h - d}`,
    `A ${rr} ${rr} 0 0 1 ${d} ${h - d - rr}`,
    `L ${d} ${d + rr}`,
    `A ${rr} ${rr} 0 0 1 ${d + rr} ${d}`,
    'Z',
  ].join(' ');
}

/** A forest-green leather card holder: grain, painted edges, stitching, a stitched lower pocket and a debossed name. */
function HolderFront({ w, h }: { w: number; h: number }) {
  const id = useId().replace(/:/g, '');
  const r = h * 0.15;
  const n = h * 0.24;
  const seam = h * 0.56;
  const outline = holderPath(w, h, r, n, 0);
  const stitch = holderPath(w, h, r, n, 9);
  const s = 9;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="absolute inset-0 overflow-visible" style={{ pointerEvents: 'none' }} aria-hidden>
      <defs>
        <linearGradient id={`${id}-leather`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#386544" />
          <stop offset="0.55" stopColor="#264C30" />
          <stop offset="1" stopColor="#17331F" />
        </linearGradient>
        <linearGradient id={`${id}-pocket`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#21432B" />
          <stop offset="1" stopColor="#122A1A" />
        </linearGradient>
        <linearGradient id={`${id}-sheen`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.16" />
          <stop offset="0.4" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <filter id={`${id}-grain`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer><feFuncA type="table" tableValues="0 0.3" /></feComponentTransfer>
        </filter>
        <clipPath id={`${id}-clip`}><path d={outline} /></clipPath>
      </defs>

      <path d={outline} fill={`url(#${id}-leather)`} style={{ pointerEvents: 'visiblePainted' }} />
      <g clipPath={`url(#${id}-clip)`}>
        {/* the lower pocket: a second piece of leather sewn across */}
        <path d={`M 0 ${seam} Q ${w / 2} ${seam - 12} ${w} ${seam} L ${w} ${h} L 0 ${h} Z`} fill={`url(#${id}-pocket)`} />
        <path d={`M 0 ${seam} Q ${w / 2} ${seam - 12} ${w} ${seam}`} fill="none" stroke="rgba(0,0,0,0.45)" strokeWidth="1.5" />
        <path d={`M 0 ${seam + 1.5} Q ${w / 2} ${seam - 10.5} ${w} ${seam + 1.5}`} fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="1" />
        <path d={`M ${s} ${seam + 8} Q ${w / 2} ${seam - 4} ${w - s} ${seam + 8}`} fill="none" stroke="#E3EED4" strokeOpacity="0.4" strokeWidth="1.4" strokeDasharray="5 4" strokeLinecap="round" />
        <rect width={w} height={h} fill={`url(#${id}-sheen)`} />
        <rect width={w} height={h} filter={`url(#${id}-grain)`} style={{ mixBlendMode: 'soft-light' }} />
      </g>

      {/* debossed name on the pocket */}
      <text x={w / 2} y={seam + (h - seam) / 2 + 6} textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight="700" fontSize={h * 0.075} letterSpacing="0.32em" fill="rgba(255,255,255,0.08)" dy="1">RENOCRED</text>
      <text x={w / 2} y={seam + (h - seam) / 2 + 6} textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight="700" fontSize={h * 0.075} letterSpacing="0.32em" fill="rgba(0,0,0,0.32)">RENOCRED</text>

      {/* stitching, then the painted edge */}
      <path d={stitch} fill="none" stroke="#E3EED4" strokeOpacity="0.45" strokeWidth="1.4" strokeDasharray="5 4" strokeLinecap="round" />
      <path d={outline} fill="none" stroke="#0A1F15" strokeOpacity="0.9" strokeWidth="2" />
      <path d={holderPath(w, h, r, n, 2)} fill="none" stroke="#fff" strokeOpacity="0.08" strokeWidth="1" />
    </svg>
  );
}

export function Hero() {
  const reduce = useReducedMotion();
  const wide = useMediaQuery('(min-width: 768px)');
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [peek, setPeek] = useState<number | null>(null);
  const wallet = useMemo(() => cardsByIds(SAMPLE_WALLET_IDS), []);
  const winners = useMemo(() => HERO_MOMENTS.map((m) => rankCards(wallet, m.category, m.amount)[0]), [wallet]);
  const moment = HERO_MOMENTS[index];
  const best = winners[index];
  const winnerSlot = wallet.findIndex((c) => c.id === best.card.id);
  const category = SPEND_CATEGORIES.find((c) => c.id === moment.category)?.label.toLowerCase() ?? moment.category;

  const W = wide ? 280 : 176;
  const k = W / 280;
  const cardH = W / 1.586;
  const peekH = 66 * k;
  const holderW = wide ? 540 : 330;
  const holderH = wide ? 210 : 140;
  const holderTop = cardH + 30 * k; // room for the pulled card above the holder

  useEffect(() => {
    if (paused || reduce) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % HERO_MOMENTS.length), ROTATE_MS);
    return () => clearInterval(t);
  }, [paused, reduce]);

  const pull = (slot: number) => {
    const m = winners.findIndex((w) => w.card.id === wallet[slot].id);
    if (m >= 0) setIndex(m);
    setPaused(true);
  };

  const spring = reduce ? { duration: 0 } : { type: 'spring' as const, stiffness: 120, damping: 17, mass: 0.9 };

  const note = (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={index}
        initial={reduce ? false : { opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 6 }}
        transition={{ duration: 0.45, ease: EASE_OUT, delay: 0.25 }}
        className="whitespace-nowrap text-center md:text-left"
      >
        <p className="font-serif text-[40px] font-semibold leading-none text-rc-pistachio tabular-nums md:text-[52px]">+{formatINR(best.reward)}</p>
        <p className="mt-2 text-[13px] text-rc-cream">{best.rate}% back on {category}</p>
        <p className="mt-0.5 text-[13px] text-rc-mist">{moment.label} · {formatINR(moment.amount)}</p>
        <p className="mt-0.5 text-[13px] text-rc-mist">with {displayCardName(best.card.name)}</p>
      </motion.div>
    </AnimatePresence>
  );

  return (
    <section className="relative overflow-hidden bg-rc-night text-rc-cream">
      {/* a pool of light over the wallet */}
      <div aria-hidden className="pointer-events-none absolute bottom-[-25%] left-1/2 h-[760px] w-[1100px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(227,238,212,0.13),transparent)]" />

      <Container className="relative flex flex-col items-center pb-24 pt-8 text-center lg:min-h-[calc(100svh-76px)] lg:pb-20 lg:pt-6">
        <h1 className="font-serif font-semibold tracking-[-0.035em]">
          <span className="block text-[clamp(1.9rem,4vw,3.4rem)] leading-[1.05]">The right card for every</span>
          <span className="sr-only"> {moment.phrase}</span>
          {/* padding inside the clip keeps ascenders and descenders whole while letters roll through */}
          <span aria-hidden className="relative block w-[min(94vw,1100px)] overflow-hidden py-[0.1em] text-[clamp(3.1rem,8.6vw,7.6rem)] italic leading-[1.02] text-rc-pistachio">
            <span className="invisible block">&nbsp;</span>
            <AnimatePresence initial={false}>
              <motion.span
                key={index}
                className="absolute inset-x-0 top-[0.1em] flex justify-center whitespace-nowrap"
                style={{ perspective: 700 }}
                initial="hidden"
                animate="shown"
                exit="gone"
              >
                {Array.from(moment.phrase).map((ch, i) => (
                  <motion.span key={i} custom={i} variants={reduce ? undefined : letter} className="inline-block origin-bottom" style={{ whiteSpace: 'pre' }}>
                    {ch}
                  </motion.span>
                ))}
              </motion.span>
            </AnimatePresence>
          </span>
        </h1>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <ButtonLink to={SIGN_UP} variant="cream" size="lg">Start free</ButtonLink>
          <ButtonLink href="#try-it" variant="outline-cream" size="lg" arrow={false}>Try a spend</ButtonLink>
        </div>

        <div
          className="relative mt-auto w-full pt-10"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => { setPaused(false); setPeek(null); }}
        >
          {!wide && <div className="mb-3" aria-live="polite">{note}</div>}
          <div className="relative mx-auto" style={{ width: holderW, height: holderTop + holderH }}>
            {/* the back of the holder, seen through the thumb notch */}
            <div aria-hidden className="absolute rounded-[28px] bg-gradient-to-b from-[#1d3a27] to-[#10261a]" style={{ top: holderTop, left: 0, right: 0, height: holderH }} />

            {wallet.map((card, slot) => {
              const pulled = slot === winnerSlot;
              const f = FAN[slot];
              return (
                <motion.button
                  key={card.id}
                  type="button"
                  tabIndex={-1}
                  aria-hidden
                  onClick={() => pull(slot)}
                  onMouseEnter={() => setPeek(slot)}
                  onMouseLeave={() => setPeek(null)}
                  className="absolute left-1/2 cursor-pointer"
                  style={{ top: holderTop - peekH, marginLeft: -W / 2, zIndex: pulled ? 20 : 10 - Math.abs(slot - 2) }}
                  animate={pulled
                    ? { x: 0, y: -(cardH - peekH) - 20 * k, rotate: -2, scale: 1.04 }
                    : { x: f.x * k, y: peek === slot ? -20 * k : 0, rotate: f.r, scale: 1 }}
                  transition={spring}
                >
                  <CardFace name={card.name} bank={card.bank} network={card.network} width={W} />
                </motion.button>
              );
            })}

            {/* the front of the holder: cards go in behind it */}
            <div className="absolute inset-x-0 z-30 drop-shadow-[0_30px_30px_rgba(0,0,0,0.55)]" style={{ top: holderTop, height: holderH }}>
              <HolderFront w={holderW} h={holderH} />
            </div>

            {/* the annotation beside the pulled card */}
            {wide && (
              <div className="absolute z-30 flex items-start gap-4" style={{ left: `calc(50% + ${W / 2 + 30}px)`, top: 6 }} aria-live="polite">
                <span aria-hidden className="mt-6 flex items-center">
                  <span className="h-1.5 w-1.5 rounded-full bg-rc-pistachio" />
                  <span className="h-px w-10 bg-rc-pistachio/50" />
                </span>
                {note}
              </div>
            )}
          </div>

          <div role="tablist" aria-label="Example spends" className="mt-8 flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] md:justify-center [&::-webkit-scrollbar]:hidden">
            {HERO_MOMENTS.map((m, i) => {
              const on = i === index;
              return (
                <button
                  key={m.phrase}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  aria-label={`${m.label}, ${formatINR(m.amount)}`}
                  onClick={() => { setIndex(i); setPaused(true); }}
                  className={cn(
                    'relative shrink-0 overflow-hidden rounded-full border px-4 py-2 text-[13px] font-medium transition-colors duration-300',
                    on ? 'border-rc-pistachio bg-rc-pistachio text-rc-ink' : 'border-white/10 text-rc-mist hover:border-white/30 hover:text-rc-cream',
                  )}
                >
                  {on && !paused && !reduce && (
                    <motion.span
                      key={index}
                      aria-hidden
                      className="absolute bottom-0 left-0 h-[2px] bg-rc-forest"
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: ROTATE_MS / 1000, ease: 'linear' }}
                    />
                  )}
                  {m.short}
                </button>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
