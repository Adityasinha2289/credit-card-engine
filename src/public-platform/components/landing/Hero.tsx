/**
 * The first screen is a wallet. Five real cards peek out of a stitched leather
 * pocket; for each spend, RenoCred pulls the card that earns the most up and
 * out, and the reward is written beside it. Click any card to pull it yourself.
 */
import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion, type Variants } from 'framer-motion';
import { cn } from '../../../lib/utils';
import { ButtonLink, Container, EASE_OUT, formatINR, useMediaQuery } from '../../site/primitives';
import { CardFace, displayCardName } from '../../site/CardFace';
import { BrandMark } from '../../site/Brand';
import { HERO_MOMENTS, SAMPLE_WALLET_IDS, SPEND_CATEGORIES, cardsByIds, rankCards } from '../../site/swipeMath';
import { SIGN_UP } from '../../site/nav';

const ROTATE_MS = 3800;

/** Resting fan inside the pocket, at the 300px design width. */
const FAN = [{ x: -168, r: -10 }, { x: -84, r: -5 }, { x: 0, r: 0 }, { x: 84, r: 5 }, { x: 168, r: 10 }];

const letter: Variants = {
  hidden: { y: '115%', opacity: 0, rotateX: -75 },
  shown: (i: number) => ({ y: '0%', opacity: 1, rotateX: 0, transition: { duration: 0.85, ease: EASE_OUT, delay: 0.1 + i * 0.03 } }),
  gone: (i: number) => ({ y: '-115%', opacity: 0, rotateX: 60, transition: { duration: 0.5, ease: [0.6, 0, 0.8, 0.3], delay: i * 0.012 } }),
};

/** A dashed stitch line inset from the pocket's edge. */
function Stitch({ className }: { className?: string }) {
  return <span aria-hidden className={cn('pointer-events-none absolute rounded-[inherit] border-[1.5px] border-dashed border-rc-pistachio/25', className)} />;
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

  const W = wide ? 300 : 186;
  const k = W / 300;
  const cardH = W / 1.586;
  const peekH = 74 * k;
  const pocketTop = cardH + 34 * k; // room for the pulled card above the pocket
  const pocketH = wide ? 196 : 150;
  const pocketW = wide ? 640 : Math.min(360, 640 * k + 60);

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
      <div aria-hidden className="pointer-events-none absolute bottom-[-20%] left-1/2 h-[700px] w-[1100px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(227,238,212,0.12),transparent)]" />

      <Container className="relative flex flex-col items-center pt-8 text-center lg:min-h-[calc(100svh-76px)] lg:pt-6">
        <h1 className="font-serif font-semibold tracking-[-0.035em]">
          <span className="block text-[clamp(1.9rem,4.1vw,3.6rem)] leading-[1.05]">The right card for every</span>
          <span className="sr-only"> {moment.phrase}</span>
          {/* padding inside the clip keeps ascenders and descenders whole while letters roll through */}
          <span aria-hidden className="relative block w-[min(94vw,1100px)] overflow-hidden py-[0.1em] text-[clamp(3.1rem,9.4vw,8.4rem)] italic leading-[1.02] text-rc-pistachio">
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

        {/* the wallet: it sits on the bottom edge, and the next section's rounded top tucks over it */}
        <div
          className="relative mt-auto w-full pt-10"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => { setPaused(false); setPeek(null); }}
        >
          {!wide && <div className="mb-3" aria-live="polite">{note}</div>}
          <div className="relative mx-auto" style={{ width: pocketW, height: pocketTop + pocketH }}>
            {/* inside of the wallet */}
            <div aria-hidden className="absolute inset-x-[3%] rounded-t-[30px] bg-[#0b2117] shadow-[inset_0_10px_30px_rgba(0,0,0,0.5)]" style={{ top: pocketTop - 44 * k, bottom: 0 }} />

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
                  style={{ top: pocketTop - peekH, marginLeft: -W / 2, zIndex: pulled ? 20 : 10 - Math.abs(slot - 2) }}
                  animate={pulled
                    ? { x: 0, y: -(cardH - peekH) - 22 * k, rotate: -2, scale: 1.04 }
                    : { x: f.x * k, y: peek === slot ? -22 * k : 0, rotate: f.r, scale: 1 }}
                  transition={spring}
                >
                  <CardFace name={card.name} bank={card.bank} network={card.network} width={W} />
                </motion.button>
              );
            })}

            {/* the pocket's lip casts a little shadow onto the cards */}
            <div aria-hidden className="pointer-events-none absolute inset-x-[2%] z-[25] h-5 bg-gradient-to-t from-black/35 to-transparent" style={{ top: pocketTop - 20 }} />

            {/* the pocket front, stitched, with the spends on it */}
            <div className="absolute inset-x-0 z-30 rounded-t-[34px] bg-gradient-to-b from-rc-forest to-[#244a30] shadow-[0_-18px_40px_-20px_rgba(0,0,0,0.6)]" style={{ top: pocketTop, height: pocketH }}>
              <div aria-hidden className="absolute inset-0 rounded-[inherit] bg-[radial-gradient(90%_70%_at_30%_0%,rgba(227,238,212,0.16),transparent_60%)]" />
              <div aria-hidden className="absolute inset-x-6 top-0 h-px bg-white/25" />
              <Stitch className="inset-2.5 bottom-[-20px]" />
              <BrandMark tone="pistachio" size={wide ? 26 : 20} className="absolute left-1/2 top-4 -translate-x-1/2 opacity-40" />
              <div role="tablist" aria-label="Example spends" className="relative mt-12 flex gap-1.5 overflow-x-auto px-5 md:justify-center pb-1 [scrollbar-width:none] md:mt-14 [&::-webkit-scrollbar]:hidden">
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
                        'relative shrink-0 overflow-hidden rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-colors duration-300 md:px-4 md:py-2 md:text-[13px]',
                        on ? 'bg-rc-pistachio text-rc-ink' : 'bg-black/20 text-rc-mist hover:bg-black/30 hover:text-rc-cream',
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

            {/* the annotation beside the pulled card */}
            {wide && (
              <div className="absolute z-30 flex items-start gap-4" style={{ left: `calc(50% + ${W / 2 + 26}px)`, top: 6 }} aria-live="polite">
                <span aria-hidden className="mt-6 flex items-center">
                  <span className="h-1.5 w-1.5 rounded-full bg-rc-pistachio" />
                  <span className="h-px w-10 bg-rc-pistachio/50" />
                </span>
                {note}
              </div>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
