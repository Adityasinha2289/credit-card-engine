import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { ButtonLink, Container, Eyebrow, EASE_OUT, formatINR } from '../../site/primitives';
import { CardFace, displayCardName } from '../../site/CardFace';
import { HERO_MOMENTS, SAMPLE_WALLET_IDS, CATALOG_STATS, cardsByIds, rankCards } from '../../site/swipeMath';
import { SIGN_UP } from '../../site/nav';

const ROTATE_MS = 3200;

/** Where each card sits in the stack by rank: the winner is in front, the rest recede behind it. */
const STACK = [
  { x: 0, y: 0, scale: 1, rotate: 0, opacity: 1 },
  { x: 22, y: -34, scale: 0.93, rotate: 3, opacity: 0.92 },
  { x: 40, y: -62, scale: 0.86, rotate: 6, opacity: 0.78 },
  { x: 54, y: -86, scale: 0.79, rotate: 9, opacity: 0.6 },
  { x: 64, y: -106, scale: 0.72, rotate: 12, opacity: 0.4 },
];

function HeroWallet({ index, onPick }: { index: number; onPick: (i: number) => void }) {
  const reduce = useReducedMotion();
  const wallet = useMemo(() => cardsByIds(SAMPLE_WALLET_IDS), []);
  const moment = HERO_MOMENTS[index];
  const ranked = useMemo(() => rankCards(wallet, moment.category, moment.amount), [wallet, moment]);
  const [best, next] = ranked;
  const rankOf = new Map(ranked.map((r, i) => [r.card.id, i]));

  return (
    <div className="relative mx-auto w-full max-w-[460px]">
      {/* card stack */}
      <div className="relative mx-auto h-[300px] w-[320px] origin-top scale-[0.86] sm:scale-100">
        {wallet.map((card) => {
          const pos = STACK[rankOf.get(card.id) ?? STACK.length - 1];
          return (
            <motion.div
              key={card.id}
              className="absolute left-0 top-[110px]"
              style={{ zIndex: 10 - (rankOf.get(card.id) ?? 9) }}
              animate={{ x: pos.x, y: pos.y, scale: pos.scale, rotate: pos.rotate, opacity: pos.opacity }}
              transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 170, damping: 24, mass: 0.9 }}
            >
              <CardFace name={card.name} bank={card.bank} network={card.network} width={320} />
            </motion.div>
          );
        })}
      </div>

      {/* receipt: the spend and the answer */}
      <div className="relative z-20 -mt-2 rounded-[22px] border border-rc-ink/10 bg-rc-paper p-5 shadow-[0_30px_60px_-30px_rgba(10,31,21,0.35)] sm:p-6">
        <div className="flex items-baseline justify-between gap-4 border-b border-dashed border-rc-ink/15 pb-4">
          <AnimatePresence mode="wait" initial={false}>
            <motion.p key={moment.label} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="text-[14px] text-rc-muted">
              {moment.label}
            </motion.p>
          </AnimatePresence>
          <p className="text-[15px] font-medium tabular-nums text-rc-ink">{formatINR(moment.amount)}</p>
        </div>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={best.card.id + index}
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: EASE_OUT }}
            className="pt-4"
          >
            <div className="flex items-end justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-rc-muted">Use</p>
                <p className="mt-1 truncate font-serif text-[24px] leading-tight text-rc-ink">{displayCardName(best.card.name)}</p>
              </div>
              <p className="shrink-0 text-right">
                <span className="block font-serif text-[30px] leading-none text-rc-emerald tabular-nums">+{formatINR(best.reward)}</span>
                <span className="text-[12px] text-rc-muted">back · {best.rate}%</span>
              </p>
            </div>
            {next && best.reward > next.reward && (
              <p className="mt-3 text-[13px] leading-relaxed text-rc-muted">
                {formatINR(best.reward - next.reward)} more than your next best card, {displayCardName(next.card.name)}.
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* manual control: pick a moment */}
      <div role="tablist" aria-label="Example spends" className="mt-5 flex flex-wrap justify-center gap-1.5">
        {HERO_MOMENTS.map((m, i) => (
          <button
            key={m.label}
            role="tab"
            type="button"
            aria-selected={i === index}
            onClick={() => onPick(i)}
            className={cn(
              'rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-colors',
              i === index ? 'bg-rc-ink text-rc-cream' : 'text-rc-muted hover:bg-rc-ink/[0.05] hover:text-rc-ink',
            )}
          >
            {m.short}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Hero() {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [hovering, setHovering] = useState(false);
  const [picked, setPicked] = useState(false);
  const paused = hovering || picked;

  useEffect(() => {
    if (paused || reduce) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % HERO_MOMENTS.length), ROTATE_MS);
    return () => clearInterval(t);
  }, [paused, reduce]);

  const pick = (i: number) => { setIndex(i); setPicked(true); };

  return (
    <section className="relative overflow-hidden">
      <Container className="grid items-center gap-14 pb-20 pt-12 lg:min-h-[calc(100svh-112px)] lg:grid-cols-12 lg:gap-8 lg:pb-24 lg:pt-6">
        <div className="lg:col-span-7">
          <Reveal0>
            <Eyebrow>Credit card intelligence for India</Eyebrow>
          </Reveal0>
          <h1 className="mt-7 font-serif text-[clamp(3rem,7vw,6.5rem)] font-medium leading-[0.95] tracking-[-0.03em] text-rc-ink">
            <span className="block">The right card</span>
            <span className="block">
              for every<span className="sr-only"> spend.</span>
            </span>
            <span aria-hidden className="relative block h-[1.08em] overflow-hidden">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={index}
                  className="absolute inset-x-0 top-0 block italic text-rc-forest"
                  initial={reduce ? false : { y: '100%' }}
                  animate={{ y: '0%' }}
                  exit={{ y: '-100%' }}
                  transition={{ duration: 0.7, ease: EASE_OUT }}
                >
                  {HERO_MOMENTS[index].phrase}
                </motion.span>
              </AnimatePresence>
            </span>
          </h1>
          <p className="mt-8 max-w-[44ch] text-[17px] leading-relaxed text-rc-muted sm:text-[18px]">
            RenoCred knows the reward rules of {CATALOG_STATS.cards} Indian credit cards. Add the ones you own and it tells you which to swipe, before you pay.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <ButtonLink to={SIGN_UP} size="lg">Get started, it's free</ButtonLink>
            <ButtonLink href="#try" variant="outline" size="lg" arrow={false}>Try it with your cards</ButtonLink>
          </div>
          <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-rc-muted">
            {['Free to use', 'Never touches your credit score', 'No full card numbers'].map((t) => (
              <li key={t} className="inline-flex items-center gap-1.5">
                <Check aria-hidden className="h-3.5 w-3.5 text-rc-forest" /> {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="lg:col-span-5" onMouseEnter={() => setHovering(true)} onMouseLeave={() => setHovering(false)}>
          <HeroWallet index={index} onPick={pick} />
        </div>
      </Container>
    </section>
  );
}

/** Entrance for above-the-fold content (Reveal waits for scroll; this plays on load). */
function Reveal0({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE_OUT }}>
      {children}
    </motion.div>
  );
}
