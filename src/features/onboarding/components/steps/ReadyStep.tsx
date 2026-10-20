/** The payoff: for each spend you picked, the card to reach for. Then into the app. */
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Loader2 } from 'lucide-react';
import { EASE_OUT } from '../../../../public-platform/site/primitives';
import { displayCardName } from '../../../../public-platform/site/CardFace';
import type { SpendCategory } from '../../../../public-platform/site/swipeMath';
import { NextButton } from '../primitives/OnboardingLayout';
import { SPEND, bestFor, yoursFor } from '../../onboardingData';

export function ReadyStep({ spend, cards, busy, onOpen }: { spend: string[]; cards: string[]; busy: boolean; onOpen: () => void }) {
  const reduce = useReducedMotion();
  const rows = spend.slice(0, 5).map((id) => {
    const top = bestFor(id as SpendCategory);
    const mine = yoursFor(cards, id as SpendCategory);
    return { id, s: SPEND.find((x) => x.id === id), use: mine ?? top, owned: !!mine, top };
  });
  return (
    <div className="mx-auto max-w-[620px] text-center">
      <motion.p initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} className="text-[12px] font-semibold uppercase tracking-[0.2em] text-rc-pistachio">You're set</motion.p>
      <h1 className="mt-3 font-serif text-[clamp(2.4rem,6vw,4rem)] font-semibold leading-[1] tracking-[-0.035em]">
        {rows.length ? <>Here's your <span className="italic text-rc-pistachio">first move.</span></> : <>Your RenoCred <span className="italic text-rc-pistachio">is ready.</span></>}
      </h1>
      <p className="mx-auto mt-4 max-w-[46ch] text-[15px] leading-relaxed text-rc-mist">
        {rows.length
          ? cards.length ? "The card to reach for, from the ones you have." : "The card that pays most for each of your spends. Add yours in the app and we'll pick from them."
          : "Add the cards you have and RenoCred will pick the right one for every spend."}
      </p>

      {rows.length > 0 && (
        <ul className="mt-9 space-y-2 text-left">
          {rows.map((r, i) => (
            <motion.li
              key={r.id}
              initial={reduce ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: EASE_OUT, delay: 0.25 + i * 0.12 }}
              className="flex items-center gap-4 rounded-[22px] border border-white/10 bg-white/[0.03] px-4 py-3.5"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/[0.06] text-rc-pistachio">{r.s && <r.s.icon className="h-5 w-5" />}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] text-rc-mist">{r.s?.title ?? r.id}</span>
                <span className="block truncate text-[15px] font-medium text-rc-cream">{r.use ? `Use ${displayCardName(r.use.card.name)}` : 'No published rate yet'}</span>
                {/* your best card isn't the best there is: say what is, plainly */}
                {r.owned && r.top && r.use && r.top.rate > r.use.rate && (
                  <span className="mt-0.5 block truncate text-[12.5px] text-rc-mist">{displayCardName(r.top.card.name)} pays {r.top.rate}%</span>
                )}
              </span>
              {r.use && <span className="font-serif text-[24px] font-semibold tabular-nums text-rc-pistachio">{r.use.rate}%</span>}
            </motion.li>
          ))}
        </ul>
      )}

      <motion.div
        initial={reduce ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: EASE_OUT, delay: 0.3 + rows.length * 0.12 }}
        className="mt-10"
      >
        <NextButton onClick={onOpen} busy={busy} className="h-14 px-9 text-[16px] lg:w-auto">
          {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> Setting up your wallet</> : <>Open my RenoCred <ArrowRight className="h-4 w-4" /></>}
        </NextButton>
      </motion.div>
    </div>
  );
}
