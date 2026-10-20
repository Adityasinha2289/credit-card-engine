import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { Container, useMediaQuery } from '../../site/primitives';
import { Phone, RemindersScreen, TaqdeerScreen, WalletScreen } from '../../site/Phone';

/** Clamp-and-map a scroll progress window to [0, 1] (function form, see Statement). */
const win = (p: number, from: number, to: number) => Math.min(1, Math.max(0, (p - from) / (to - from)));

export function PhoneReveal() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const wide = useMediaQuery('(min-width: 1024px)');
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });

  const rise = useTransform(scrollYProgress, (p) => (1 - win(p, 0, 0.35)) * 260);
  const spread = useTransform(scrollYProgress, (p) => win(p, 0.32, 0.62));
  const leftX = useTransform(spread, (s) => -s * 330);
  const rightX = useTransform(spread, (s) => s * 330);
  const leftR = useTransform(spread, (s) => -s * 7);
  const rightR = useTransform(spread, (s) => s * 7);
  const sideOpacity = useTransform(spread, (s) => Math.min(1, s * 1.6));

  const headline = (
    <div className="text-center">
      <h2 className="font-serif text-[clamp(2.75rem,6vw,5.5rem)] font-semibold leading-[0.95] tracking-[-0.035em] text-rc-cream">One app.<br />Every card you own.</h2>
      <p className="mx-auto mt-6 max-w-[44ch] text-[16px] leading-relaxed text-rc-mist">Your cards, your spending and your renewals in one place, with a clear next move.</p>
    </div>
  );

  if (reduce || !wide) {
    return (
      <section data-cv="off" ref={ref} className="overflow-hidden bg-rc-night pt-32">
        <Container>{headline}</Container>
        <div className="mt-16 flex justify-center pb-0">
          <div className="-mb-40"><Phone width={wide ? 300 : 260}><WalletScreen /></Phone></div>
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} className="relative h-[260vh] bg-rc-night">
      <div className="sticky top-0 flex h-[100svh] flex-col overflow-hidden pt-24">
        <Container>{headline}</Container>
        <div className="relative mt-14 flex flex-1 justify-center">
          <motion.div className="absolute top-0 z-[1]" style={{ x: leftX, rotate: leftR, opacity: sideOpacity, y: rise }}>
            <Phone width={290}><TaqdeerScreen /></Phone>
          </motion.div>
          <motion.div className="absolute top-0 z-[1]" style={{ x: rightX, rotate: rightR, opacity: sideOpacity, y: rise }}>
            <Phone width={290}><RemindersScreen /></Phone>
          </motion.div>
          <motion.div className="absolute top-0 z-10" style={{ y: rise }}>
            <Phone width={300}><WalletScreen /></Phone>
          </motion.div>
          {/* glow pooling behind the phones */}
          <div aria-hidden className="pointer-events-none absolute left-1/2 top-[30%] z-0 h-[420px] w-[900px] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgba(42,157,92,0.22),transparent)] blur-2xl" />
        </div>
      </div>
    </section>
  );
}
