import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring, useTransform, type MotionValue, type Variants } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { ButtonLink, Container, EASE_OUT, formatINR, useMediaQuery } from '../../site/primitives';
import { CardFace, displayCardName, themeFor } from '../../site/CardFace';
import { BrandMark } from '../../site/Brand';
import { CATALOG_STATS, HERO_MOMENTS, SAMPLE_WALLET_IDS, cardsByIds, rankCards, type FinixCard } from '../../site/swipeMath';
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
  const shade = useTransform(spin, (a) => (1 - Math.cos(((a + slot * step) * Math.PI) / 180)) * 0.34);
  const u = width / 320;
  return (
    <motion.div className="absolute left-1/2 top-1/2" style={{ width, height: width / 1.586, marginLeft: -width / 2, marginTop: -width / 1.586 / 2, transform, transformStyle: 'preserve-3d' }}>
      <motion.div
        className="relative h-full w-full"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ y: winner ? -16 * u : 0, scale: winner ? 1.04 : 1 }}
        transition={{ type: 'spring', stiffness: 140, damping: 18 }}
      >
        <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}>
          <CardFace name={card.name} bank={card.bank} network={card.network} width={width} />
          <motion.div className="pointer-events-none absolute inset-0 bg-rc-night" style={{ opacity: shade, borderRadius: 16 * u }} />
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

  const width = wide ? 300 : 200;
  const radius = width * 1.04;
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

  const chars = Array.from(moment.phrase);

  return (
    <section className="relative overflow-hidden bg-rc-night text-rc-cream">
      {/* stage light from above, and the faint track the cards ride on */}
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-[-35%] h-[900px] w-[1200px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(227,238,212,0.12),transparent)]" />
      <BrandMark tone="pistachio" size={760} className="pointer-events-none absolute -right-[260px] top-[14%] hidden opacity-[0.025] lg:block" />

      <Container className="relative flex min-h-[calc(100svh-4rem)] flex-col items-center justify-center pb-16 pt-8 text-center lg:min-h-[calc(100svh-76px)]">
        <Link
          to="/cards"
          className="group inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] py-1.5 pl-1.5 pr-4 text-[13px] text-rc-mist transition-colors hover:border-white/25 hover:text-rc-cream"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-rc-pistachio"><BrandMark size={16} /></span>
          <span>RenoCred reads <span className="text-rc-cream">{CATALOG_STATS.cards} cards</span> from {CATALOG_STATS.banks} banks</span>
          <ArrowRight aria-hidden className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
        </Link>

        {/* the wallet as a ring: drag it, or let it turn to the best card for each spend */}
        <motion.div
          className="relative mt-6 w-full cursor-grab touch-pan-y select-none active:cursor-grabbing"
          style={{ height: width / 1.586 + 120 * (width / 300), perspective: wide ? 1500 : 1000 }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onPanStart={() => { panFrom.current = base.get(); setPaused(true); }}
          onPan={(_, info) => base.set(panFrom.current + info.offset.x * 0.32)}
          onPanEnd={settle}
          aria-hidden
        >
          <div aria-hidden className="pointer-events-none absolute left-1/2 top-[62%] h-[90px] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgba(42,157,92,0.32),transparent)] blur-2xl" style={{ width: radius * 3 }} />
          <div aria-hidden className="pointer-events-none absolute left-1/2 top-[56%] -translate-x-1/2 rounded-[50%] border border-white/[0.07]" style={{ width: radius * 2.5, height: radius * 0.42 }} />
          <div className="absolute inset-0" style={{ transformStyle: 'preserve-3d', transform: 'rotateX(-11deg)' }}>
            {wallet.map((card, i) => (
              <RingCard key={card.id} card={card} slot={i} count={wallet.length} spin={reduce ? base : spin} radius={radius} width={width} winner={i === winnerSlot} />
            ))}
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={index}
              initial={reduce ? false : { opacity: 0, y: 14, scale: 0.92, rotate: -4 }}
              animate={{ opacity: 1, y: 0, scale: 1, rotate: -2 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.5, ease: EASE_OUT, delay: 0.35 }}
              className="absolute right-2 top-0 z-30 rounded-2xl sm:left-1/2 sm:right-auto sm:top-[6%] bg-rc-cream py-2.5 pl-3 pr-4 text-left text-rc-ink shadow-[0_24px_50px_-18px_rgba(0,0,0,0.7)]"
              style={wide ? { marginLeft: width * 0.36 } : undefined}
            >
              <span className="block whitespace-nowrap text-[11px] text-rc-muted">{moment.label} · {formatINR(moment.amount)}</span>
              <span className="mt-0.5 block font-serif text-[24px] font-semibold leading-none text-rc-emerald tabular-nums sm:text-[28px]">+{formatINR(best.reward)}</span>
              <span className="mt-1 block max-w-[18ch] truncate text-[11px] font-medium text-rc-ink/80">with {displayCardName(best.card.name)}</span>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        <h1 className="mt-6 sm:mt-10">
          <span className="block text-[15px] text-rc-mist sm:text-[18px]">The right card for every</span>
          <span className="sr-only">{moment.phrase}</span>
          {/* padding inside the clip keeps ascenders and descenders whole while letters roll through */}
          <span
            aria-hidden
            className="relative mt-1 block w-[min(94vw,1120px)] overflow-hidden py-[0.14em] font-serif text-[clamp(2.4rem,8.4vw,7rem)] font-semibold leading-[1.06] tracking-[-0.035em]"
          >
            <span className="invisible block">&nbsp;</span>
            <AnimatePresence initial={false}>
              <motion.span
                key={index}
                className="absolute inset-x-0 top-[0.14em] flex justify-center whitespace-nowrap"
                style={{ perspective: 700 }}
                initial="hidden"
                animate="shown"
                exit="gone"
              >
                {chars.map((ch, i) => (
                  <motion.span key={i} custom={i} variants={reduce ? undefined : letter} className="inline-block origin-bottom" style={{ whiteSpace: 'pre' }}>
                    {ch}
                  </motion.span>
                ))}
              </motion.span>
            </AnimatePresence>
          </span>
        </h1>

        <div role="tablist" aria-label="Example spends" className="mt-6 flex items-center gap-2">
          {HERO_MOMENTS.map((m, i) => (
            <button
              key={m.phrase}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={m.label}
              onClick={() => { setIndex(i); setPaused(true); }}
              className={cn('relative h-1.5 overflow-hidden rounded-full transition-all duration-500', i === index ? 'w-10 bg-white/20' : 'w-1.5 bg-white/25 hover:bg-white/50')}
            >
              {i === index && (
                <motion.span
                  key={`${index}-${paused}`}
                  className="absolute inset-y-0 left-0 rounded-full bg-rc-pistachio"
                  initial={{ width: paused || reduce ? '100%' : '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: paused || reduce ? 0 : ROTATE_MS / 1000, ease: 'linear' }}
                />
              )}
            </button>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <ButtonLink to={SIGN_UP} variant="cream" size="lg">Start free</ButtonLink>
          <ButtonLink href="#try-it" variant="outline-cream" size="lg" arrow={false}>Try a spend</ButtonLink>
        </div>
      </Container>
    </section>
  );
}
