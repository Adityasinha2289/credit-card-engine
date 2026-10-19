import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, animate, motion, useInView, useMotionValue, useReducedMotion, useScroll, useTransform, type AnimationPlaybackControls } from 'framer-motion';
import { ArrowRight, RotateCcw } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { ButtonLink, Container, EASE_OUT, formatINR, useMediaQuery } from '../../site/primitives';
import { CardFace, displayCardName } from '../../site/CardFace';
import { BrandMark } from '../../site/Brand';
import { FAQSchema } from '../FAQSchema';
import { Accordion } from '../../site/Accordion';
import { CATALOGUE_STATS, HERO_MOMENTS, SAMPLE_WALLET_IDS, cardsByIds, rankCards } from '../../site/swipeMath';
import { SIGN_UP } from '../../site/nav';
import { useSignedInHint } from '../../site/SiteLink';

const RECEIPT = [
  { k: 'Credit report pulls', v: '0' },
  { k: 'Full card numbers asked for', v: '0' },
  { k: 'Your records', v: 'locked to you' },
  { k: 'How we rank cards', v: 'public' },
  { k: 'Price to use RenoCred', v: '₹0' },
];

/** Zig-zag tear along the bottom edge of the receipt. */
const TEAR = 'conic-gradient(from -45deg at bottom, #0000, #000 1deg 89deg, #0000 90deg) 50% / 16px 100%';

/** The privacy promise, itemised: a receipt that prints out of a slot as you scroll to it. */
export function TrustStatement() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.95', 'start 0.25'] });
  const y = useTransform(scrollYProgress, (p) => `${(Math.min(1, Math.max(0, p)) - 1) * 100}%`);

  return (
    <section className="relative z-10 -mt-10 rounded-t-[40px] bg-rc-cream py-28 text-rc-ink lg:-mt-14 lg:rounded-t-[56px] lg:py-40">
      <Container className="grid items-center gap-16 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <p className="flex items-center gap-3 text-[12px] font-semibold uppercase tracking-[0.2em] text-rc-muted">
            <span aria-hidden className="h-2 w-2 rounded-full bg-rc-emerald" /> The fine print
          </p>
          <h2 className="mt-6 font-serif text-[clamp(2.75rem,4.9vw,4.4rem)] font-semibold leading-[0.98] tracking-[-0.035em]">Your money data<br />stays yours.</h2>
          <p className="mt-7 max-w-[42ch] text-[17px] leading-relaxed text-rc-muted">
            We never pull your credit report and never ask for your full card number. Every record you add is locked to your account, and the way we rank cards is public.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <ButtonLink to="/privacy" variant="outline" arrow={false}>Privacy policy</ButtonLink>
            <ButtonLink to="/methodology" variant="outline" arrow={false}>How we rank</ButtonLink>
          </div>
        </div>

        <div ref={ref} className="mx-auto w-full max-w-[400px] lg:col-span-5 lg:col-start-8">
          {/* the printer's slot */}
          <div className="relative z-10 h-5 rounded-full bg-rc-ink shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)]" />
          <div className="-mt-2.5 overflow-hidden px-4 pt-2.5">
            <motion.div style={reduce ? undefined : { y }} className="font-mono text-rc-ink">
              <div className="bg-white px-6 pb-10 pt-8 shadow-[0_30px_60px_-30px_rgba(15,42,29,0.35)]" style={{ mask: TEAR, WebkitMask: TEAR }}>
                <div className="flex items-center justify-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rc-ink"><BrandMark tone="pistachio" size={16} /></span>
                  <span className="font-sans text-[15px] font-semibold tracking-[-0.01em]">RenoCred</span>
                </div>
                <p className="mt-3 text-center text-[11px] uppercase tracking-[0.2em] text-rc-muted">Your data, itemised</p>
                <div className="my-5 border-t border-dashed border-rc-ink/30" />
                <ul className="space-y-3 text-[13px]">
                  {RECEIPT.map((r) => (
                    <li key={r.k} className="flex items-baseline gap-2">
                      <span>{r.k}</span>
                      <span aria-hidden className="mb-1 flex-1 border-b border-dotted border-rc-ink/40" />
                      <span className="font-semibold">{r.v}</span>
                    </li>
                  ))}
                </ul>
                <div className="my-5 border-t border-dashed border-rc-ink/30" />
                <p className="flex justify-between text-[13px] font-semibold uppercase"><span>Cards read</span><span>{CATALOGUE_STATS.listed}</span></p>
                <p className="mt-6 text-center text-[11px] leading-relaxed text-rc-muted">Thank you for reading the fine print.<br />Most people don't.</p>
                {/* barcode */}
                <div aria-hidden className="mx-auto mt-5 flex h-10 w-[200px] items-stretch justify-between">
                  {Array.from({ length: 38 }, (_, i) => (
                    <span key={i} className="bg-rc-ink" style={{ width: [1, 2, 1, 3, 1, 2][i % 6], opacity: i % 7 === 3 ? 0 : 1 }} />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </Container>
    </section>
  );
}

interface Swipe { label: string; card: string; reward: number }

/**
 * "Make every swipe count", literally: drag the card through the reader (or press
 * the button) and RenoCred's pick for that spend books the reward. Five spends,
 * each with the best card from the same sample wallet the hero uses.
 */
function SwipeReader() {
  const reduce = useReducedMotion();
  const wide = useMediaQuery('(min-width: 640px)');
  const wallet = useMemo(() => cardsByIds(SAMPLE_WALLET_IDS), []);
  const plays = useMemo(() => HERO_MOMENTS.map((m) => ({ moment: m, best: rankCards(wallet, m.category, m.amount)[0] })), [wallet]);
  const [step, setStep] = useState(0);
  const [ledger, setLedger] = useState<Swipe[]>([]);
  const [phase, setPhase] = useState<'ready' | 'approved'>('ready');
  const [touched, setTouched] = useState(false);

  const track = useRef<HTMLDivElement>(null);
  const inView = useInView(track, { amount: 0.6 });
  const [trackW, setTrackW] = useState(0);
  const cardW = wide ? 210 : 150;
  const max = Math.max(0, trackW - cardW - 16);
  const x = useMotionValue(0);
  const fill = useTransform(x, (v) => v + cardW + 8);
  const hint = useRef<AnimationPlaybackControls | null>(null);

  const done = step >= plays.length;
  const play = plays[Math.min(step, plays.length - 1)];
  const total = ledger.reduce((s, l) => s + l.reward, 0);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setTrackW(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // until someone tries it, the card nudges towards the reader
  useEffect(() => {
    if (touched || reduce || !inView || done || phase !== 'ready') return;
    hint.current = animate(x, [0, 34, 0], { duration: 1.3, ease: 'easeInOut', repeat: Infinity, repeatDelay: 1.4 });
    return () => hint.current?.stop();
  }, [touched, reduce, inView, done, phase, x]);

  const approve = () => {
    setPhase('approved');
    setLedger((l) => [...l, { label: play.moment.label, card: displayCardName(play.best.card.name), reward: play.best.reward }]);
    setTimeout(() => {
      x.set(0);
      setPhase('ready');
      setStep((s) => s + 1);
    }, 1500);
  };

  const swipe = () => {
    if (phase !== 'ready' || done) return;
    setTouched(true);
    hint.current?.stop();
    animate(x, max, { duration: reduce ? 0 : 0.45, ease: EASE_OUT }).then(approve);
  };

  const release = () => {
    if (x.get() > max * 0.72) animate(x, max, { duration: 0.2, ease: EASE_OUT }).then(approve);
    else animate(x, 0, { type: 'spring', stiffness: 300, damping: 24 });
  };

  const restart = () => { setLedger([]); setStep(0); setPhase('ready'); x.set(0); };

  return (
    <div className="rounded-[36px] bg-rc-ink p-4 text-rc-cream shadow-[0_50px_100px_-40px_rgba(0,0,0,0.6)] sm:p-5">
      {/* the reader's screen */}
      <div className="rounded-[24px] bg-rc-night px-5 py-4 ring-1 ring-white/[0.06]" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          {done ? (
            <motion.div key="done" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[12px] text-rc-mist">Five swipes, the right card each time</p>
                <p className="mt-1 font-serif text-[30px] font-semibold leading-none text-rc-pistachio tabular-nums">+{formatINR(total)}</p>
              </div>
              <button type="button" onClick={restart} className="flex h-11 items-center gap-2 rounded-full border border-white/15 px-4 text-[13px] transition-colors hover:border-white/50">
                <RotateCcw className="h-3.5 w-3.5" /> Again
              </button>
            </motion.div>
          ) : phase === 'approved' ? (
            <motion.div key={`ok-${step}`} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-[12px] text-rc-pistachio"><span className="h-1.5 w-1.5 rounded-full bg-rc-pistachio" /> Approved</p>
                <p className="mt-1 truncate text-[14px] text-rc-mist">with {displayCardName(play.best.card.name)}</p>
              </div>
              <p className="font-serif text-[30px] font-semibold leading-none text-rc-pistachio tabular-nums">+{formatINR(play.best.reward)}</p>
            </motion.div>
          ) : (
            <motion.div key={`ready-${step}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[12px] text-rc-mist">Spend {step + 1} of {plays.length}</p>
                <p className="mt-1 truncate text-[16px]">{play.moment.label}</p>
              </div>
              <p className="font-serif text-[30px] leading-none tabular-nums">{formatINR(play.moment.amount)}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* the track: drag the card all the way through */}
      <div ref={track} className="relative mt-4 overflow-hidden rounded-[24px] bg-black/30 ring-1 ring-inset ring-white/[0.06]" style={{ height: cardW / 1.586 + 16 }}>
        <motion.div
          aria-hidden
          className={cn('absolute bottom-2 left-2 top-2 rounded-[18px] transition-colors duration-500', phase === 'approved' ? 'bg-rc-pistachio/40' : 'bg-rc-pistachio/[0.12]')}
          style={{ width: fill }}
        />
        <div aria-hidden className="absolute inset-y-0 right-5 flex items-center gap-1.5 text-[12px] font-medium uppercase tracking-[0.16em] text-rc-mist/70">
          {!done && phase === 'ready' && <>Swipe <ArrowRight className="h-3.5 w-3.5" /></>}
        </div>
        <AnimatePresence initial={false}>
          {!done && (
            <motion.div
              key={step}
              aria-hidden
              className="absolute left-2 top-2 cursor-grab touch-pan-y active:cursor-grabbing"
              style={{ x }}
              drag={phase === 'ready' ? 'x' : false}
              dragConstraints={{ left: 0, right: max }}
              dragElastic={0.04}
              dragMomentum={false}
              onDragStart={() => { setTouched(true); hint.current?.stop(); }}
              onDragEnd={release}
              initial={{ opacity: 0, scale: 0.9, rotate: -4 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, x: max + 60, transition: { duration: 0.3 } }}
              transition={{ type: 'spring', stiffness: 220, damping: 20 }}
            >
              <CardFace name={play.best.card.name} bank={play.best.card.bank} network={play.best.card.network} width={cardW} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-4 flex items-center justify-between gap-4 px-1">
        <button
          type="button"
          onClick={swipe}
          disabled={done || phase !== 'ready'}
          className="rounded-full bg-rc-cream px-5 py-2.5 text-[13px] font-medium text-rc-ink transition-colors hover:bg-white disabled:opacity-40"
        >
          {done ? 'All five swiped' : `Swipe the ${displayCardName(play.best.card.name)}`}
        </button>
        <p className="text-right text-[12px] text-rc-mist">Earned <span className="font-semibold tabular-nums text-rc-cream">{formatINR(total)}</span></p>
      </div>

      {ledger.length > 0 && (
        <ul className="mt-4 space-y-1.5 border-t border-white/10 px-1 pt-4">
          {ledger.map((l, i) => (
            <motion.li key={i} initial={reduce ? false : { opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="flex items-baseline gap-3 text-[13px]">
              <span className="truncate text-rc-mist">{l.label} <span className="text-rc-mist/60">· {l.card}</span></span>
              <span className="ml-auto shrink-0 font-medium tabular-nums text-rc-pistachio">+{formatINR(l.reward)}</span>
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function Closer() {
  return (
    <section className="relative z-10 -mt-10 rounded-t-[40px] bg-rc-night px-3 pb-28 pt-10 sm:px-5 lg:-mt-14 lg:rounded-t-[56px] lg:pb-36 lg:pt-14">
      <div className="mx-auto max-w-[1360px] overflow-hidden rounded-[40px] bg-rc-pistachio text-rc-ink lg:rounded-[56px]">
        <Container className="grid items-center gap-14 py-20 lg:grid-cols-12 lg:py-28">
          <div className="lg:col-span-5">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rc-ink"><BrandMark tone="pistachio" size={26} /></span>
            <h2 className="mt-8 font-serif text-[clamp(3rem,6vw,5.5rem)] font-semibold leading-[0.95] tracking-[-0.035em]">Make every<br />swipe count.</h2>
            <p className="mt-7 max-w-[34ch] text-[17px] leading-relaxed text-rc-ink/75">Free to use. Add your cards in about a minute and see what each one is really for.</p>
            <ButtonLink to={SIGN_UP} size="lg" className="mt-10">Get started</ButtonLink>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <SwipeReader />
          </div>
        </Container>
      </div>
    </section>
  );
}

const FAQ_ITEMS = [
  { question: 'Is RenoCred free?', answer: 'Yes. Comparing cards, tracking your spending, reminders and Taqdeer are all free to use.' },
  { question: 'Will using RenoCred affect my credit score?', answer: 'No. We never pull your credit report. Eligibility estimates are based on the income and credit-score range you tell us, so nothing shows up with the credit bureaus.' },
  { question: 'Do I need to share my card numbers?', answer: 'No. You add cards by picking them from our catalogue. If you want SMS alerts matched to a card automatically, you can add its last four digits, never the full number or CVV.' },
  { question: 'Where do the reward rates come from?', answer: `From each issuer's own published terms: ${CATALOGUE_STATS.listed} cards from ${CATALOGUE_STATS.issuers} issuers so far. Our methodology page explains how we turn rates, caps and fees into a ranking.` },
  { question: 'How does RenoCred make money?', answer: 'Some card and partner links may earn us a commission when you apply or buy. That never changes how cards are ranked; our affiliate disclosure explains how it works.' },
  { question: 'Which languages does Taqdeer speak?', answer: 'English, Hindi and Hinglish. Ask the way you would ask a friend; it replies in the same language.' },
];

export function FaqToggle() {
  return (
    <section className="relative z-10 -mt-10 rounded-t-[40px] bg-rc-cream pb-28 pt-24 text-rc-ink lg:-mt-14 lg:rounded-t-[56px] lg:pb-36 lg:pt-32">
      <FAQSchema items={FAQ_ITEMS} />
      <Container className="grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <h2 className="font-serif text-[clamp(2.5rem,4.6vw,4rem)] font-semibold leading-[1] tracking-[-0.03em]">Questions,<br />answered.</h2>
          <p className="mt-6 max-w-[30ch] text-[15px] leading-relaxed text-rc-muted">
            Something else? <Link to="/contact" className="font-medium text-rc-ink underline decoration-rc-ink/25 underline-offset-4 hover:decoration-rc-ink">Write to us</Link>.
          </p>
        </div>
        <Accordion className="lg:col-span-8" items={FAQ_ITEMS} />
      </Container>
    </section>
  );
}

/** A quiet way back to sign-up once the hero has scrolled away. */
export function FloatingStart() {
  const signedIn = useSignedInHint();
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => {
      const nearEnd = window.innerHeight + window.scrollY > document.documentElement.scrollHeight - 1600;
      setShow(window.scrollY > window.innerHeight * 0.8 && !nearEnd);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.96 }}
          transition={{ duration: 0.4, ease: EASE_OUT }}
          className="fixed bottom-6 right-6 z-40 hidden lg:block"
        >
          <Link to={signedIn ? '/app' : SIGN_UP} className="group flex items-center gap-3 rounded-full border border-white/15 bg-rc-ink/90 py-2 pl-2 pr-5 text-rc-cream shadow-[0_20px_40px_-20px_rgba(0,0,0,0.7)] backdrop-blur-md transition-colors hover:border-white/40">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-rc-pistachio"><BrandMark size={20} /></span>
            <span>
              <span className="block text-[14px] font-medium leading-tight">{signedIn ? 'Open the app' : 'Start free'}</span>
              <span className="block text-[12px] leading-tight text-rc-mist">{signedIn ? 'Back to your wallet' : 'Takes about a minute'}</span>
            </span>
            <ArrowRight className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
