/**
 * The card machine from the landing page, reading your picks: the card goes in,
 * the screen reads it, then shows what it would add to your wallet. The keys
 * step through the picks; the tick opens the card's page.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { BrandMark } from '../../../public-platform/site/Brand';
import { CardFace, bankLabel, displayCardName } from '../../../public-platform/site/CardFace';
import { EASE_OUT, formatINR, useMediaQuery } from '../../../public-platform/site/primitives';
import { slugifyCardName } from '../../../public-platform/site/swipeMath';
import type { Pick } from './picks';

type Phase = 'insert' | 'reading' | 'done';

export function PickTerminal({ picks, index, onIndex }: { picks: Pick[]; index: number; onIndex: (i: number) => void }) {
  const reduce = useReducedMotion();
  const mobile = !useMediaQuery('(min-width: 640px)');
  const pick = picks[index];
  const [phase, setPhase] = useState<Phase>(reduce ? 'done' : 'insert');

  // each new card: slide in, read, show
  useEffect(() => {
    if (reduce) { setPhase('done'); return; }
    setPhase('insert');
    const a = setTimeout(() => setPhase('reading'), 550);
    const b = setTimeout(() => setPhase('done'), 1250);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, [pick?.card.id, reduce]);

  const TW = mobile ? 300 : 320;
  const CW = TW * 0.76;
  const CH = CW / 1.586;
  const ready = 6;
  const inserted = CH * 0.6;

  const rows = pick ? [
    ...pick.wins.slice(0, 2).map((w) => ({ k: w.label, v: `${w.rate}% vs your ${w.yourRate}%` })),
    { k: 'Annual fee', v: pick.fee === 0 ? (pick.feeWaived ? 'Waived on your spend' : 'Lifetime free') : formatINR(pick.fee) },
    ...(pick.needs?.cibil ? [{ k: 'Needs CIBIL', v: `${pick.needs.cibil}+` }] : []),
    ...(pick.needs?.income ? [{ k: 'Needs income', v: `${formatINR(pick.needs.income)} a year` }] : []),
    ...(pick.card.loungeAccess ? [{ k: 'Lounge visits', v: `${pick.card.loungeAccess} a year` }] : []),
  ].slice(0, 4) : [];

  return (
    <div className="relative mx-auto" style={{ width: TW, paddingTop: CH + ready }}>
      {pick && (
        <motion.div
          key={pick.card.id}
          className="absolute left-1/2 top-0 z-0"
          style={{ marginLeft: -CW / 2 }}
          initial={reduce ? false : { y: -40, opacity: 0 }}
          animate={{ y: phase === 'insert' ? [-40, ready, ready + inserted] : ready + inserted, opacity: 1 }}
          transition={phase === 'insert' ? { duration: 0.55, times: [0, 0.35, 1], ease: [0.22, 1, 0.36, 1] } : { duration: 0.4, ease: EASE_OUT }}
        >
          <CardFace name={pick.card.name} bank={pick.card.bank} network={pick.card.network} width={CW} />
        </motion.div>
      )}

      <div className="relative z-10 rounded-[34px] bg-gradient-to-b from-[#1d2e24] to-[#0b1610] p-4 pb-5 text-rc-ink shadow-[0_50px_100px_-30px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.08)] ring-1 ring-white/10">
        <span aria-hidden className="absolute left-1/2 top-0 h-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black shadow-[inset_0_2px_3px_rgba(255,255,255,0.08),0_1px_0_rgba(255,255,255,0.1)]" style={{ width: CW + 22 }} />

        <div className="relative h-[232px] overflow-hidden rounded-[18px] bg-rc-pistachio px-4 py-3 shadow-[inset_0_2px_10px_rgba(15,42,29,0.35)]" aria-live="polite">
          <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.16em] text-rc-ink/60">
            <span className="flex items-center gap-1.5"><BrandMark size={12} /> Your picks</span>
            <span className="tabular-nums">{picks.length ? `${String(index + 1).padStart(2, '0')} / ${String(picks.length).padStart(2, '0')}` : '00 / 00'}</span>
          </div>
          <div className="mt-2 h-px bg-rc-ink/10" />

          <AnimatePresence mode="wait" initial={false}>
            {!pick ? (
              <motion.div key="none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex h-[190px] flex-col items-center justify-center text-center">
                <p className="font-serif text-[21px] leading-tight">No card adds more</p>
                <p className="mt-1.5 max-w-[22ch] text-[12px] text-rc-ink/60">Your wallet already beats every card that fits these filters.</p>
              </motion.div>
            ) : phase !== 'done' ? (
              <motion.div key="reading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} className="flex h-[190px] flex-col items-center justify-center text-center">
                <p className="font-serif text-[21px] leading-tight">{phase === 'insert' ? 'Card in' : 'Reading terms'}</p>
                <p className="mt-1 text-[12px] text-rc-ink/60">{bankLabel(pick.card.bank)}</p>
                <div className="mt-4 h-1.5 w-36 overflow-hidden rounded-full bg-rc-ink/10">
                  <motion.div className="h-full rounded-full bg-rc-forest" initial={{ width: '0%' }} animate={{ width: phase === 'reading' ? '100%' : '25%' }} transition={{ duration: phase === 'reading' ? 0.65 : 0.4, ease: 'easeInOut' }} />
                </div>
              </motion.div>
            ) : (
              <motion.div key={`done-${pick.card.id}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                <p className="mt-2 truncate font-serif text-[18px] leading-tight">{displayCardName(pick.card.name)}</p>
                <p className="mt-1 flex items-baseline gap-1.5">
                  <span className="font-serif text-[30px] font-semibold leading-none tabular-nums text-rc-forest">{pick.net >= 0 ? '+' : '−'}{formatINR(Math.abs(pick.net))}</span>
                  <span className="text-[11px] text-rc-ink/60">a year, after fee</span>
                </p>
                <ul className="mt-1.5">
                  {rows.map((r, n) => (
                    <motion.li
                      key={r.k}
                      initial={reduce ? false : { opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, ease: EASE_OUT, delay: 0.08 + n * 0.12 }}
                      className="flex items-center gap-2 border-b border-dashed border-rc-ink/15 py-[6px] text-[12px] last:border-0"
                    >
                      <Check className="h-3 w-3 shrink-0 text-rc-forest" strokeWidth={3} />
                      <span className="truncate text-rc-ink/65">{r.k}</span>
                      <span className="ml-auto shrink-0 text-right font-semibold tabular-nums">{r.v}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* the keys do something: previous, see the card, next */}
        <div className="mt-4 grid grid-cols-[1fr_1.3fr_1fr] gap-2 px-1">
          <button type="button" disabled={index === 0} onClick={() => onIndex(index - 1)} aria-label="Previous pick" className="flex h-11 items-center justify-center rounded-[12px] bg-white/[0.07] text-rc-mist shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-colors hover:bg-white/[0.12] hover:text-rc-cream disabled:opacity-30">
            <ChevronLeft size={18} />
          </button>
          {pick ? (
            <Link to={`/cards/${slugifyCardName(pick.card.name)}`} className="flex h-11 items-center justify-center gap-1.5 rounded-[12px] bg-rc-pistachio text-[13px] font-semibold text-rc-ink">
              <Check size={15} strokeWidth={3} /> See card
            </Link>
          ) : <span className="h-11 rounded-[12px] bg-white/[0.04]" />}
          <button type="button" disabled={index >= picks.length - 1} onClick={() => onIndex(index + 1)} aria-label="Next pick" className="flex h-11 items-center justify-center rounded-[12px] bg-white/[0.07] text-rc-mist shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-colors hover:bg-white/[0.12] hover:text-rc-cream disabled:opacity-30">
            <ChevronRight size={18} />
          </button>
        </div>
        <p aria-hidden className="mt-4 flex items-center justify-center gap-1.5 text-[11px] font-semibold text-rc-mist/70"><BrandMark size={13} tone="pistachio" /> RenoCred</p>
      </div>
    </div>
  );
}
