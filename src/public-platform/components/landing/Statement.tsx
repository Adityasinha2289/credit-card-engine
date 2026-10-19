import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { cn } from '../../../lib/utils';
import { BrandMark } from '../../site/Brand';

/** `*word*` marks a word the highlighter runs over; `@` is the brand. */
const TEXT = 'Every card in your wallet is *brilliant* *at* *one* *thing.* Most of us swipe the same one for everything. @ learns what each of yours is for, and tells you before you pay. So *every* *swipe* *earns* *what* *it* *should.*';
const WORDS = TEXT.split(' ').map((raw) => ({ text: raw.replace(/\*/g, ''), marked: raw.startsWith('*') }));

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

function Word({ progress, from, marked, children }: { progress: MotionValue<number>; from: number; marked: boolean; children: string }) {
  // Function transforms, not range arrays: framer hands range transforms of scroll
  // progress to a native scroll timeline, which does not clamp after the range ends.
  const opacity = useTransform(progress, (p) => 0.2 + 0.8 * clamp01((p - from) / 0.08));
  const ink = useTransform(progress, (p) => clamp01((p - from - 0.04) / 0.06));
  return (
    <motion.span style={{ opacity }} className="relative inline-block">
      {marked && (
        <motion.span
          aria-hidden
          style={{ scaleX: ink }}
          className="absolute -left-[0.1em] -right-[0.2em] bottom-[0.06em] top-[0.18em] -z-0 origin-left -rotate-[0.6deg] rounded-[0.22em] bg-rc-pistachio"
        />
      )}
      <span className={cn('relative', marked && 'italic text-rc-forest')}>
        {children === '@' ? <Brand /> : children}
      </span>
      {' '}
    </motion.span>
  );
}

function Brand() {
  return (
    <span className="inline-flex items-baseline gap-[0.18em] whitespace-nowrap not-italic">
      <span className="relative top-[0.08em] inline-flex h-[0.86em] w-[0.86em] items-center justify-center self-center rounded-[0.22em] bg-rc-ink">
        <BrandMark tone="pistachio" size={20} className="h-[0.6em] w-[0.6em]" />
      </span>
      RenoCred
    </span>
  );
}

/** The manifesto: one paragraph that comes into focus word by word, a highlighter catching the phrases that matter. */
export function Statement() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });

  const body = (
    <div className="mx-auto w-full max-w-[860px] px-6">
      <p className="flex items-center gap-3 text-[12px] font-semibold uppercase tracking-[0.2em] text-rc-muted">
        <span aria-hidden className="h-2 w-2 rounded-full bg-rc-emerald" /> Your wallet, understood
      </p>
      <p className="relative z-0 mt-10 font-serif text-[clamp(1.9rem,3.8vw,3.4rem)] leading-[1.24] tracking-[-0.015em] text-rc-ink">
        {reduce
          ? WORDS.map((w, i) => (
            <span key={i} className={cn(w.marked && 'bg-rc-pistachio italic text-rc-forest')}>{w.text === '@' ? <Brand /> : w.text} </span>
          ))
          : WORDS.map((w, i) => (
            <Word key={i} progress={scrollYProgress} from={(i / WORDS.length) * 0.8} marked={w.marked}>{w.text}</Word>
          ))}
      </p>
    </div>
  );

  const shell = 'relative z-10 -mt-10 rounded-t-[40px] bg-rc-paper text-rc-ink lg:-mt-14 lg:rounded-t-[56px]';
  if (reduce) return <section ref={ref} className={cn(shell, 'py-40')}>{body}</section>;

  return (
    <section ref={ref} className={cn(shell, 'h-[240vh]')}>
      <div className="sticky top-0 flex h-[100svh] items-center">{body}</div>
    </section>
  );
}
