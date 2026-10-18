import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring, useTransform, type MotionValue, type Variants } from 'framer-motion';
import { Hand } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { ButtonLink, Container, EASE_OUT, formatINR, useMediaQuery } from '../../site/primitives';
import { CardFace, displayCardName, themeFor } from '../../site/CardFace';
import { HERO_MOMENTS, SAMPLE_WALLET_IDS, SPEND_CATEGORIES, cardsByIds, rankCards, type FinixCard } from '../../site/swipeMath';
import { SIGN_UP } from '../../site/nav';

const ROTATE_MS = 3600;

/** Shortest signed turn (degrees) from one angle to another. */
const turn = (from: number, to: number) => ((((to - from) % 360) + 540) % 360) - 180;

function CardBack({ card, width }: { card: FinixCard; width: number }) {
  const theme = themeFor(card.name, card.bank);
  const u = width / 320;
  return (
    <div
      className="relative overflow-hidden"
      style={{ width, height: width / 1.586, borderRadius: 16 * u, background: `linear-gradient(320deg, ${theme.primary}, ${theme.secondary})` }}
    >
      <div className="absolute inset-0 bg-black/45" />
      <div className="absolute inset-x-0 bg-black/80" style={{ top: 22 * u, height: 40 * u }} />
      <div className="absolute rounded-[3px] bg-white/80" style={{ left: 20 * u, top: 80 * u, width: 150 * u, height: 26 * u }} />
      <div className="absolute inset-0" style={{ borderRadius: 16 * u, boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.12)' }} />
    </div>
  );
}

/** One card on the ring: front and back faces, dimmed as it turns away from you. */
function RingCard({ card, slot, count, spin, radius, width, winner }: {
  card: FinixCard; slot: number; count: number; spin: MotionValue<number>; radius: number; width: number; winner: boolean;
}) {
  const step = 360 / count;
  const transform = useTransform(spin, (a) => `rotateY(${a + slot * step}deg) translateZ(${radius}px)`);
  const shade = useTransform(spin, (a) => (1 - Math.cos(((a + slot * step) * Math.PI) / 180)) * 0.3);
  const u = width / 320;
  return (
    <motion.div className="absolute left-1/2 top-1/2" style={{ width, height: width / 1.586, marginLeft: -width / 2, marginTop: -width / 1.586 / 2, transform, transformStyle: 'preserve-3d' }}>
      <motion.div
        className="relative h-full w-full"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ y: winner ? -16 * u : 0, scale: winner ? 1.05 : 1 }}
        transition={{ type: 'spring', stiffness: 140, damping: 18 }}
      >
        <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}>
          <CardFace name={card.name} bank={card.bank} network={card.network} width={width} />
          <motion.div className="pointer-events-none absolute inset-0 bg-rc-ink" style={{ opacity: shade, borderRadius: 16 * u }} />
        </div>
        <div className="absolute inset-0" style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}>
          <CardBack card={card} width={width} />
        </div>
      </motion.div>
    </motion.div>
  );
}

const letter: Variants = {
  hidden: { y: '115%', opacity: 0, rotateX: -75 },
  shown: (i: number) => ({ y: '0%', opacity: 1, rotateX: 0, transition: { duration: 0.85, ease: EASE_OUT, delay: 0.1 + i * 0.03 } }),
  gone: (i: number) => ({ y: '-115%', opacity: 0, rotateX: 60, transition: { duration: 0.5, ease: [0.6, 0, 0.8, 0.3], delay: i * 0.012 } }),
};

export function Hero() {
  const reduce = useReducedMotion();
  const wide = useMediaQuery('(min-width: 640px)');
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const wallet = useMemo(() => cardsByIds(SAMPLE_WALLET_IDS), []);
  const moment = HERO_MOMENTS[index];
  const best = useMemo(() => rankCards(wallet, moment.category, moment.amount)[0], [wallet, moment]);
  const winnerSlot = wallet.findIndex((c) => c.id === best.card.id);
  const step = 360 / wallet.length;
  const category = SPEND_CATEGORIES.find((c) => c.id === moment.category)?.label.toLowerCase() ?? moment.category;

  const width = wide ? 236 : 168;
  const radius = width * 0.92;
  const base = useMotionValue(-winnerSlot * step);
  const spin = useSpring(base, { stiffness: 60, damping: 17, mass: 1.1 });
  const panFrom = useRef(0);

  // turn the ring the short way round so the winning card faces you
  useEffect(() => {
    const now = base.get();
    base.set(now + turn(now, -winnerSlot * step));
  }, [winnerSlot, step, base]);

  useEffect(() => {
    if (paused || reduce) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % HERO_MOMENTS.length), ROTATE_MS);
    return () => clearInterval(t);
  }, [paused, reduce]);

  /** After a drag, settle on the nearest card and show the spend it wins. */
  const settle = () => {
    const slot = ((Math.round(-base.get() / step) % wallet.length) + wallet.length) % wallet.length;
    const m = HERO_MOMENTS.findIndex((mo) => rankCards(wallet, mo.category, mo.amount)[0].card.id === wallet[slot].id);
    if (m >= 0 && m !== index) setIndex(m);
    else base.set(base.get() + turn(base.get(), -winnerSlot * step));
  };

  return (
    <section className="relative overflow-hidden bg-rc-night text-rc-cream">
      <div aria-hidden className="pointer-events-none absolute -left-[10%] -top-[30%] h-[900px] w-[900px] rounded-full bg-[radial-gradient(closest-side,rgba(227,238,212,0.09),transparent)]" />

      <Container className="relative grid items-center gap-12 pb-20 pt-10 lg:min-h-[calc(100svh-76px)] lg:grid-cols-12 lg:gap-10 lg:pb-16 lg:pt-4">
        <div className="lg:col-span-6">
          <p className="flex items-center gap-3 text-[12px] font-semibold uppercase tracking-[0.2em] text-rc-mist">
            <span aria-hidden className="h-2 w-2 rounded-full bg-rc-pistachio" /> Before you pay
          </p>
          <h1 className="mt-7 font-serif text-[clamp(2.9rem,5.6vw,5.4rem)] font-semibold leading-[1] tracking-[-0.035em]">
            The right card<br />for every
            <span className="sr-only"> {moment.phrase}</span>
            {/* padding inside the clip keeps ascenders and descenders whole while letters roll through */}
            <span aria-hidden className="relative -mt-[0.1em] block overflow-hidden py-[0.12em] italic text-rc-pistachio">
              <span className="invisible block">&nbsp;</span>
              <AnimatePresence initial={false}>
                <motion.span
                  key={index}
                  className="absolute inset-x-0 top-[0.12em] flex whitespace-nowrap"
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
          <p className="mt-6 max-w-[40ch] text-[17px] leading-relaxed text-rc-mist">
            Add the cards you own. Before you pay, RenoCred tells you which one earns the most, and by how much.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <ButtonLink to={SIGN_UP} variant="cream" size="lg">Start free</ButtonLink>
            <ButtonLink href="#try-it" variant="outline-cream" size="lg" arrow={false}>Try a spend</ButtonLink>
          </div>
        </div>

        {/* the sample wallet, on a ring that turns the best card for each spend to the front */}
        <div
          className="relative overflow-hidden rounded-[36px] bg-rc-pistachio text-rc-ink lg:col-span-6 lg:rounded-[44px]"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_55%_at_50%_38%,rgba(255,255,255,0.75),transparent)]" />
          <div className="relative flex items-center justify-between px-5 pt-5 text-[12px] sm:px-7 sm:pt-6">
            <span className="font-semibold uppercase tracking-[0.18em] text-rc-ink/60">A sample wallet</span>
            <span className="hidden items-center gap-1.5 text-rc-ink/50 sm:flex"><Hand className="h-3.5 w-3.5" /> Drag to turn</span>
          </div>

          <motion.div
            aria-hidden
            className="relative cursor-grab touch-pan-y select-none active:cursor-grabbing"
            style={{ height: width / 1.586 + (wide ? 150 : 110), perspective: wide ? 1300 : 900 }}
            onPanStart={() => { panFrom.current = base.get(); setPaused(true); }}
            onPan={(_, info) => base.set(panFrom.current + info.offset.x * 0.32)}
            onPanEnd={settle}
          >
            <div className="pointer-events-none absolute left-1/2 top-[64%] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgba(15,42,29,0.22),transparent)] blur-xl" style={{ width: radius * 2.6, height: 70 }} />
            <div className="pointer-events-none absolute left-1/2 top-[56%] -translate-x-1/2 rounded-[50%] border border-rc-ink/10" style={{ width: radius * 2.4, height: radius * 0.42 }} />
            <div className="absolute inset-0" style={{ transformStyle: 'preserve-3d', transform: 'rotateX(-11deg)' }}>
              {wallet.map((card, i) => (
                <RingCard key={card.id} card={card} slot={i} count={wallet.length} spin={reduce ? base : spin} radius={radius} width={width} winner={i === winnerSlot} />
              ))}
            </div>
          </motion.div>

          <div className="relative px-3 pb-3 sm:px-4 sm:pb-4">
            {/* what RenoCred would say for this spend */}
            <div className="overflow-hidden rounded-[26px] bg-rc-ink px-4 py-3.5 text-rc-cream sm:px-5" aria-live="polite">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={index}
                  initial={reduce ? false : { opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4, ease: EASE_OUT, delay: 0.1 }}
                  className="flex items-center gap-3.5"
                >
                  <CardFace name={best.card.name} bank={best.card.bank} network={best.card.network} width={54} lifted={false} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12px] text-rc-mist">{moment.label} · {formatINR(moment.amount)}</p>
                    <p className="truncate text-[15px] font-medium">Swipe {displayCardName(best.card.name)}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-serif text-[26px] font-semibold leading-none tabular-nums text-rc-pistachio sm:text-[30px]">+{formatINR(best.reward)}</p>
                    <p className="mt-1 text-[11px] text-rc-mist">{best.rate}% on {category}</p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <div role="tablist" aria-label="Example spends" className="mt-3 flex gap-1.5 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
                      'relative shrink-0 overflow-hidden rounded-full px-4 py-2 text-[13px] font-medium transition-colors duration-300',
                      on ? 'bg-rc-ink text-rc-cream' : 'bg-rc-ink/[0.07] text-rc-ink/70 hover:bg-rc-ink/[0.12] hover:text-rc-ink',
                    )}
                  >
                    {on && !paused && !reduce && (
                      <motion.span
                        key={index}
                        aria-hidden
                        className="absolute bottom-0 left-0 h-[2px] bg-rc-pistachio"
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
        </div>
      </Container>
    </section>
  );
}
