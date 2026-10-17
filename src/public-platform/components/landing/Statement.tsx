import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { Container, Eyebrow } from '../../site/primitives';

const TEXT = 'Every card in your wallet is *brilliant* *at* *one* *thing.* Most of us swipe the same one for everything. RenoCred learns what each of yours is for, and tells you before you pay.';
const WORDS = TEXT.split(' ').map((w) => ({ text: w.replace(/\*/g, ''), accent: w.startsWith('*') }));

function Word({ progress, range, accent, children }: {
  progress: MotionValue<number>; range: [number, number]; accent: boolean; children: string;
}) {
  // A function transform, not range arrays: framer hands range transforms of scroll
  // progress to a native scroll timeline, which does not clamp after the range ends
  // (words faded back out as you kept scrolling).
  const [from, to] = range;
  const opacity = useTransform(progress, (p) => 0.14 + 0.86 * Math.min(1, Math.max(0, (p - from) / (to - from))));
  return (
    <motion.span style={{ opacity }} className={accent ? 'italic text-rc-pistachio' : undefined}>
      {children}{' '}
    </motion.span>
  );
}

/** A single sentence that lights up word by word as you scroll through it. */
export function Statement() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });

  const sentence = (
    <p className="mt-10 max-w-[22ch] font-serif text-[clamp(2.1rem,4.8vw,4.5rem)] leading-[1.06] tracking-[-0.02em] sm:max-w-[24ch]">
      {reduce
        ? WORDS.map((w, i) => <span key={i} className={w.accent ? 'italic text-rc-pistachio' : undefined}>{w.text} </span>)
        : WORDS.map((w, i) => {
          const start = (i / WORDS.length) * 0.85;
          return <Word key={i} progress={scrollYProgress} range={[start, start + 0.12]} accent={w.accent}>{w.text}</Word>;
        })}
    </p>
  );

  if (reduce) {
    return (
      <section ref={ref} className="bg-rc-night py-32 text-rc-cream">
        <Container><Eyebrow tone="cream">Why RenoCred</Eyebrow>{sentence}</Container>
      </section>
    );
  }

  return (
    <section ref={ref} className="relative h-[240vh] bg-rc-night text-rc-cream">
      <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden">
        {/* faint concentric rings give the dark stage some depth */}
        <div aria-hidden className="pointer-events-none absolute -right-[20vw] top-1/2 h-[70vw] w-[70vw] -translate-y-1/2 rounded-full border border-white/[0.05]" />
        <div aria-hidden className="pointer-events-none absolute -right-[10vw] top-1/2 h-[50vw] w-[50vw] -translate-y-1/2 rounded-full border border-white/[0.04]" />
        <Container>
          <Eyebrow tone="cream">Why RenoCred</Eyebrow>
          {sentence}
        </Container>
      </div>
    </section>
  );
}
