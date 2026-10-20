/**
 * "What RenoCred knows": fills in as you answer. Each spend you pick shows the
 * card in the catalogue that pays most for it and, once you add your cards,
 * the best of yours next to it.
 */
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Check } from 'lucide-react';
import { BrandMark } from '../../../public-platform/site/Brand';
import { EASE_OUT } from '../../../public-platform/site/primitives';
import { displayCardName } from '../../../public-platform/site/CardFace';
import { PRIMARY_GOALS_CONFIG } from '../../../config/goals';
import { SPEND, bestFor, yoursFor } from '../onboardingData';
import type { SpendCategory } from '../../../public-platform/site/swipeMath';

export function Ledger({ goal, spend, cards }: { goal?: string; spend: string[]; cards: string[] }) {
  const reduce = useReducedMotion();
  const rise = { initial: reduce ? false : { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0 }, transition: { duration: 0.35, ease: EASE_OUT } } as const;
  const empty = !goal && spend.length === 0 && cards.length === 0;
  return (
    <section aria-label="What RenoCred knows so far" className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 lg:p-6">
      <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-rc-mist/80">
        <BrandMark size={14} tone="pistachio" /> What RenoCred knows
      </p>
      {empty ? (
        <p className="mt-4 text-[14px] leading-relaxed text-rc-mist">Answer a couple of questions and this fills in with the card that pays most for each of your spends.</p>
      ) : (
        <ul className="mt-4 space-y-0.5" aria-live="polite">
          <AnimatePresence initial={false}>
            {goal && (
              <motion.li key="goal" layout="position" {...rise} className="flex items-baseline justify-between gap-3 border-b border-white/[0.07] py-2.5 text-[14px]">
                <span className="text-rc-mist">Goal</span>
                <span className="font-medium text-rc-cream">{PRIMARY_GOALS_CONFIG[goal]?.title ?? goal}</span>
              </motion.li>
            )}
            {spend.map((id) => {
              const s = SPEND.find((x) => x.id === id);
              const top = bestFor(id as SpendCategory);
              const mine = yoursFor(cards, id as SpendCategory);
              const yoursIsBest = !!mine && !!top && mine.rate >= top.rate;
              return (
                <motion.li key={id} layout="position" {...rise} className="border-b border-white/[0.07] py-2.5 text-[14px]">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="flex items-center gap-2 text-rc-cream">{s && <s.icon className="h-3.5 w-3.5 text-rc-pistachio" />}{s?.title ?? id}</span>
                    {top && <span className="shrink-0 font-semibold tabular-nums text-rc-pistachio">{top.rate}%</span>}
                  </div>
                  {top && (
                    <p className="mt-0.5 text-[12.5px] leading-snug text-rc-mist">
                      {mine
                        ? yoursIsBest
                          ? <span className="inline-flex items-center gap-1 text-rc-cream"><Check className="h-3 w-3 text-rc-pistachio" strokeWidth={3} /> Yours wins: {displayCardName(mine.card.name)}, {mine.rate}%</span>
                          : <>Yours: {displayCardName(mine.card.name)}, {mine.rate}% · best: {displayCardName(top.card.name)}</>
                        : <>Best: {displayCardName(top.card.name)}</>}
                    </p>
                  )}
                </motion.li>
              );
            })}
            {cards.length > 0 && (
              <motion.li key="wallet" layout="position" {...rise} className="flex items-baseline justify-between gap-3 py-2.5 text-[14px]">
                <span className="text-rc-mist">In your wallet</span>
                <span className="font-medium tabular-nums text-rc-cream">{cards.length} {cards.length === 1 ? 'card' : 'cards'}</span>
              </motion.li>
            )}
          </AnimatePresence>
        </ul>
      )}
    </section>
  );
}
