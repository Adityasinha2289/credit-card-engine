/**
 * "Do more with every card": six features as a deck of tall panels. One is open
 * at a time; the others stay folded to a spine with their name on it. The deck
 * deals itself (one panel every few seconds) until you take over.
 */
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useInView, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Bell, CreditCard, Gift, MessageCircle, PiggyBank, Sparkles } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { ArrowChip, Container, CountUp, EASE_OUT, formatINR, useMediaQuery } from '../../site/primitives';
import { CardFace, displayCardName } from '../../site/CardFace';
import { cardsByIds, rewardFor, topCardsForProfile } from '../../site/swipeMath';
import { SIGN_UP } from '../../site/nav';

const DEAL_MS = 6000;

const pop = (delay: number) => ({
  initial: { opacity: 0, y: 18, scale: 0.94 },
  animate: { opacity: 1, y: 0, scale: 1 },
  transition: { type: 'spring' as const, stiffness: 220, damping: 22, delay },
});

function WalletVisual() {
  const cards = useMemo(() => cardsByIds(['axis_ace', 'sbi_cashback', 'hdfc_swiggy']), []);
  const order = 1850;
  const earned = rewardFor(cards[2], 'dining', order).reward;
  const fan = [{ x: -70, r: -12 }, { x: 0, r: -3 }, { x: 70, r: 7 }];
  return (
    <div className="relative flex h-full items-center justify-center">
      {cards.map((c, i) => (
        <motion.div
          key={c.id}
          className="absolute"
          initial={{ x: 0, rotate: 0, y: 30, opacity: 0 }}
          animate={{ x: fan[i].x, rotate: fan[i].r, y: i === 2 ? -14 : 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 120, damping: 16, delay: 0.25 + i * 0.08 }}
          style={{ zIndex: i }}
        >
          <CardFace name={c.name} bank={c.bank} network={c.network} width={200} />
        </motion.div>
      ))}
      <motion.span {...pop(0.9)} className="absolute bottom-[10%] right-[8%] z-10 rounded-full bg-rc-cream px-4 py-2 text-[13px] font-semibold text-rc-forest shadow-[0_14px_30px_-14px_rgba(0,0,0,0.7)]">
        +{formatINR(earned)} on a {formatINR(order)} Swiggy order
      </motion.span>
    </div>
  );
}

function ChatVisual() {
  return (
    <div className="flex h-full flex-col justify-center gap-3 px-6 sm:px-8">
      <motion.p {...pop(0.3)} className="ml-auto max-w-[80%] rounded-[20px] rounded-br-md bg-rc-ink px-4 py-3 text-[15px] leading-snug text-rc-cream">Petrol ke liye kaunsa card?</motion.p>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 1, 0] }}
        transition={{ duration: 1.1, delay: 0.7, times: [0, 0.15, 0.8, 1] }}
        className="flex w-fit gap-1 rounded-full bg-white px-4 py-3"
      >
        {[0, 1, 2].map((d) => (
          <motion.span key={d} className="h-1.5 w-1.5 rounded-full bg-rc-ink/50" animate={{ y: [0, -3, 0] }} transition={{ repeat: 1, duration: 0.6, delay: 0.7 + d * 0.12 }} />
        ))}
      </motion.span>
      <motion.p {...pop(1.8)} className="-mt-12 max-w-[86%] rounded-[20px] rounded-bl-md bg-white px-4 py-3 text-[15px] leading-snug text-rc-ink">
        Your IndianOil HDFC: 5% back, ₹150 on a ₹3,000 fill.
      </motion.p>
    </div>
  );
}

function MoneyVisual() {
  const bars = [{ w: 22, c: 'bg-rc-cream/90' }, { w: 19, c: 'bg-rc-mist' }, { w: 17, c: 'bg-rc-sage' }, { w: 42, c: 'bg-rc-pistachio' }];
  return (
    <div className="flex h-full flex-col justify-end p-6 sm:p-8">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-rc-pistachio/80">Safe to spend</p>
      <p className="mt-2 font-serif text-[56px] font-semibold leading-none tabular-nums text-rc-cream">
        <CountUp to={35612} format={(n) => formatINR(n)} />
      </p>
      <div className="mt-6 flex h-2.5 gap-1 overflow-hidden">
        {bars.map((b, i) => (
          <motion.span key={i} className={cn('h-full rounded-full', b.c)} initial={{ width: 0 }} animate={{ width: `${b.w}%` }} transition={{ duration: 0.9, ease: EASE_OUT, delay: 0.4 + i * 0.1 }} />
        ))}
      </div>
    </div>
  );
}

function ReminderVisual() {
  return (
    <div className="relative flex h-full items-center px-5 sm:px-8">
      <motion.div {...pop(0.2)} className="absolute inset-x-10 top-[22%] h-16 rounded-[20px] bg-white/60" />
      <motion.div
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.45 }}
        className="relative w-full rounded-[22px] bg-white p-4 shadow-[0_24px_44px_-24px_rgba(10,31,21,0.55)]"
      >
        <p className="flex items-center gap-1.5 text-[11px] text-rc-muted"><Bell className="h-3 w-3" /> RenoCred · now</p>
        <p className="mt-1.5 text-[15px] font-semibold text-rc-ink">Cult.fit trial ends tomorrow</p>
        <p className="text-[13px] text-rc-muted">₹1,200 will be charged unless you cancel.</p>
      </motion.div>
    </div>
  );
}

function DiscoverVisual() {
  const top = useMemo(() => topCardsForProfile({ dining: 6000, travel: 5000, shopping: 8000, utilities: 3000, groceries: 6000, fuel: 2000 }, 1)[0], []);
  return (
    <div className="flex h-full flex-col items-center justify-center gap-5" style={{ perspective: 900 }}>
      <motion.div initial={{ rotateY: -100, opacity: 0 }} animate={{ rotateY: -8, opacity: 1 }} transition={{ type: 'spring', stiffness: 90, damping: 14, delay: 0.3 }}>
        <CardFace name={top.card.name} bank={top.card.bank} network={top.card.network} width={230} />
      </motion.div>
      <p className="text-center text-[14px] text-rc-ink/75">
        {displayCardName(top.card.name)} · <span className="font-semibold text-rc-forest">+<CountUp to={top.net} format={(n) => formatINR(n)} /> a year</span>
      </p>
    </div>
  );
}

function PerkVisual() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <motion.img {...pop(0.25)} src="/greenox_logo.png" alt="GreeNox" className="h-16 w-auto object-contain" />
      <p className="font-serif text-[72px] font-semibold leading-none text-rc-ink"><CountUp to={20} format={(n) => `${Math.round(n)}%`} duration={1} /></p>
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-rc-muted">off for members</p>
    </div>
  );
}

interface Panel { icon: typeof Bell; label: string; title: string; body: string; to: string; bg: string; dark: boolean; visual: () => ReactNode }

const PANELS: Panel[] = [
  { icon: CreditCard, label: 'Wallet', title: 'Know which card to swipe.', body: 'Add the cards you own. Before you pay, see which one earns the most.', to: SIGN_UP, bg: 'bg-gradient-to-br from-rc-forest to-rc-night', dark: true, visual: () => <WalletVisual /> },
  { icon: MessageCircle, label: 'Reni', title: 'Ask anything. In Hinglish too.', body: 'Reni answers from your own cards, in the language you asked in.', to: SIGN_UP, bg: 'bg-rc-pistachio', dark: false, visual: () => <ChatVisual /> },
  { icon: PiggyBank, label: 'Money', title: "See what's safe to spend.", body: 'Your spending by category, and what is left after this month’s bills.', to: SIGN_UP, bg: 'bg-gradient-to-b from-rc-moss to-rc-forest', dark: true, visual: () => <MoneyVisual /> },
  { icon: Bell, label: 'Reminders', title: 'Never pay for a trial you forgot.', body: 'A nudge before a subscription renews, so you decide, not the auto-debit.', to: SIGN_UP, bg: 'bg-rc-cream', dark: false, visual: () => <ReminderVisual /> },
  { icon: Sparkles, label: 'Discover', title: 'Find the card that pays you back.', body: 'Ranked on what you actually spend, after the annual fee.', to: '/cards', bg: 'bg-rc-mist', dark: false, visual: () => <DiscoverVisual /> },
  { icon: Gift, label: 'Perks', title: 'Member offers, matched to you.', body: 'Partner offers for RenoCred members, starting with GreeNox.', to: SIGN_UP, bg: 'bg-rc-paper', dark: false, visual: () => <PerkVisual /> },
];

/** Phones: one feature at a time, full size, swiped sideways. */
function SwipeDeck({ index, onIndex }: { index: number; onIndex: (i: number) => void }) {
  const ref = useRef<HTMLUListElement>(null);
  // follow the swipe: the card nearest the left edge is the current one
  const onScroll = () => {
    const el = ref.current;
    if (!el) return;
    const card = el.querySelector('li');
    const w = card ? card.getBoundingClientRect().width + 12 : el.clientWidth;
    const i = Math.round(el.scrollLeft / w);
    if (i !== index) onIndex(Math.max(0, Math.min(PANELS.length - 1, i)));
  };
  // arrows and dots move the row
  useEffect(() => {
    const el = ref.current;
    const card = el?.querySelectorAll('li')[index] as HTMLElement | undefined;
    if (el && card && Math.abs(el.scrollLeft - (card.offsetLeft - el.offsetLeft - 20)) > 8) el.scrollTo({ left: card.offsetLeft - 20, behavior: 'smooth' });
  }, [index]);
  return (
    <>
      <ul ref={ref} onScroll={onScroll} className="-mx-5 mt-10 flex snap-x snap-mandatory scroll-px-5 gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {PANELS.map((p, i) => {
          const sub = p.dark ? 'text-rc-mist' : 'text-rc-ink/65';
          return (
            <li key={p.label} aria-current={i === index ? 'true' : undefined} className={cn('flex h-[540px] w-[86%] max-w-[360px] shrink-0 snap-start flex-col overflow-hidden rounded-[28px]', p.bg, p.dark ? 'text-rc-cream' : 'text-rc-ink')}>
              <div className="p-6">
                <p className={cn('flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.18em]', sub)}>
                  <p.icon className="h-3.5 w-3.5" strokeWidth={2} /> {p.label}
                </p>
                <p className="mt-3 font-serif text-[27px] font-semibold leading-[1.06] tracking-[-0.02em]">{p.title}</p>
                <p className={cn('mt-2.5 text-[15px] leading-relaxed', sub)}>{p.body}</p>
              </div>
              <div className="relative min-h-0 flex-1">{i === index || Math.abs(i - index) === 1 ? p.visual() : null}</div>
            </li>
          );
        })}
      </ul>
      <div className="mt-5 flex justify-center gap-1.5" aria-hidden>
        {PANELS.map((p, i) => (
          <button key={p.label} type="button" tabIndex={-1} onClick={() => onIndex(i)} className={cn('h-1.5 rounded-full transition-all duration-300', i === index ? 'w-6 bg-rc-pistachio' : 'w-1.5 bg-white/25')} />
        ))}
      </div>
    </>
  );
}

export function FeatureDeck() {
  const reduce = useReducedMotion();
  const desktop = useMediaQuery('(min-width: 1024px)');
  const phone = !useMediaQuery('(min-width: 640px)');
  const ref = useRef<HTMLUListElement>(null);
  const inView = useInView(ref, { amount: 0.4 });
  const [active, setActive] = useState(0);
  const [held, setHeld] = useState(false);
  const [taken, setTaken] = useState(false);

  const dealing = inView && !held && !taken && !reduce;
  useEffect(() => {
    if (!dealing) return;
    const t = setTimeout(() => setActive((a) => (a + 1) % PANELS.length), DEAL_MS);
    return () => clearTimeout(t);
  }, [dealing, active]);

  const go = (i: number) => { setActive((i + PANELS.length) % PANELS.length); setTaken(true); };

  return (
    <section data-cv="off" className="bg-rc-night py-20 text-rc-cream sm:py-28 lg:py-40">
      <Container>
        <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="flex items-center gap-3 text-[12px] font-semibold uppercase tracking-[0.2em] text-rc-mist">
              <span aria-hidden className="h-2 w-2 rounded-full bg-rc-pistachio" /> Inside the app
            </p>
            <h2 className="mt-6 font-serif text-[clamp(2.75rem,5.6vw,5rem)] font-semibold leading-[0.98] tracking-[-0.035em]">Do more with<br />every card.</h2>
          </div>
          <div className="flex items-center gap-4">
            <p aria-live="polite" className="text-[13px] tabular-nums text-rc-mist">
              <span className="text-rc-cream">{String(active + 1).padStart(2, '0')}</span> / {String(PANELS.length).padStart(2, '0')}
            </p>
            <button type="button" aria-label="Previous feature" onClick={() => go(active - 1)} className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 transition-colors hover:border-white/50 hover:bg-white/[0.06]"><ArrowLeft className="h-4 w-4" /></button>
            <button type="button" aria-label="Next feature" onClick={() => go(active + 1)} className="flex h-12 w-12 items-center justify-center rounded-full bg-rc-cream text-rc-ink transition-colors hover:bg-white"><ArrowRight className="h-4 w-4" /></button>
          </div>
        </div>

        {phone ? <SwipeDeck index={active} onIndex={(i) => { setActive(i); setTaken(true); }} /> : (
        <ul
          ref={ref}
          className="mt-14 flex h-[880px] flex-col gap-2.5 lg:h-[600px] lg:flex-row lg:gap-3"
          onMouseEnter={() => setHeld(true)}
          onMouseLeave={() => setHeld(false)}
          onFocus={() => setHeld(true)}
          onBlur={() => setHeld(false)}
        >
          {PANELS.map((p, i) => {
            const open = i === active;
            const tone = p.dark ? 'text-rc-cream' : 'text-rc-ink';
            const sub = p.dark ? 'text-rc-mist' : 'text-rc-ink/65';
            return (
              <li
                key={p.label}
                className={cn('relative min-h-0 min-w-0 basis-0 overflow-hidden rounded-[28px] transition-[flex-grow] duration-[900ms] ease-[cubic-bezier(.22,1,.36,1)]', p.bg, tone)}
                style={{ flexGrow: open ? (desktop ? 6.5 : 7) : 1 }}
              >
                {/* folded: a spine with the number and name */}
                <button
                  type="button"
                  onClick={() => go(i)}
                  aria-expanded={open}
                  aria-label={`${p.label}: ${p.title}`}
                  tabIndex={open ? -1 : 0}
                  className={cn(
                    'group absolute inset-0 flex items-center gap-3 px-5 text-left transition-opacity duration-300 lg:flex-col lg:items-center lg:justify-between lg:px-0 lg:py-6',
                    open ? 'pointer-events-none opacity-0' : 'opacity-100 delay-300',
                  )}
                >
                  <span className={cn('text-[12px] tabular-nums', sub)}>{String(i + 1).padStart(2, '0')}</span>
                  <span className="flex items-center gap-3 lg:flex-col-reverse">
                    <p.icon className="h-4 w-4 shrink-0 transition-transform duration-500 group-hover:scale-125" strokeWidth={2} />
                    <span className="text-[13px] font-semibold uppercase tracking-[0.2em] lg:[writing-mode:vertical-rl] lg:rotate-180">{p.label}</span>
                  </span>
                  <span className={cn('ml-auto truncate text-[14px] lg:hidden', sub)}>{p.title}</span>
                </button>

                {/* open: the story and its moving picture */}
                <AnimatePresence>
                  {open && (
                    <motion.div
                      key="open"
                      className="absolute inset-y-0 left-0 flex w-full flex-col lg:min-w-[500px]"
                      initial={reduce ? false : { opacity: 0 }}
                      animate={{ opacity: 1, transition: { duration: 0.5, delay: 0.25 } }}
                      exit={{ opacity: 0, transition: { duration: 0.15 } }}
                    >
                      {dealing && (
                        <motion.span
                          key={`bar-${active}`}
                          aria-hidden
                          className={cn('absolute left-0 top-0 h-[3px] rounded-full', p.dark ? 'bg-rc-pistachio' : 'bg-rc-ink')}
                          initial={{ width: '0%' }}
                          animate={{ width: '100%' }}
                          transition={{ duration: DEAL_MS / 1000, ease: 'linear' }}
                        />
                      )}
                      <motion.div
                        className="p-6 sm:p-8"
                        initial={reduce ? false : { y: 16, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.7, ease: EASE_OUT, delay: 0.3 }}
                      >
                        <p className={cn('flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em]', sub)}>
                          <p.icon className="h-3.5 w-3.5" strokeWidth={2} /> {p.label}
                        </p>
                        <p className="mt-4 max-w-[16ch] font-serif text-[clamp(1.75rem,2.6vw,2.4rem)] font-semibold leading-[1.04] tracking-[-0.02em]">{p.title}</p>
                        <p className={cn('mt-3 max-w-[40ch] text-[15px] leading-relaxed', sub)}>{p.body}</p>
                        <Link to={p.to} className={cn('group mt-5 inline-flex items-center gap-3 rounded-full py-1 pl-1 pr-4 text-[13px] font-semibold', p.dark ? 'bg-white/10 hover:bg-white/15' : 'bg-rc-ink/[0.07] hover:bg-rc-ink/[0.12]')}>
                          <ArrowChip variant={p.dark ? 'outline-cream' : 'outline'} size="sm" />
                          Know more
                        </Link>
                      </motion.div>
                      <div className="relative min-h-0 flex-1">{p.visual()}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
        )}
      </Container>
    </section>
  );
}
