/** A perk on one of your cards, printed as a ticket: the perk on the left, the card on the stub. */
import { motion, useReducedMotion } from 'framer-motion';
import { CardFace, displayCardName } from '../../public-platform/site/CardFace';
import { EASE_OUT } from '../../public-platform/site/primitives';
import type { FinixCard } from '../../public-platform/site/swipeMath';

export interface Perk { key: string; kind: string; big: string; unit: string; card: FinixCard }

export function PerkTicket({ perk, i }: { perk: Perk; i: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 24, rotate: -2 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.1 + i * 0.08 }}
      whileHover={reduce ? undefined : { y: -4, rotate: -0.6 }}
      className="relative flex h-[132px] w-[280px] shrink-0 snap-start text-rc-ink drop-shadow-[0_20px_30px_rgba(0,0,0,0.35)]"
    >
      {/* the perk */}
      <div className="relative flex flex-1 flex-col justify-between rounded-l-[18px] bg-rc-cream px-4 py-3.5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-rc-forest">{perk.kind}</p>
        <div>
          <p className="font-serif text-[30px] font-semibold leading-none tabular-nums lining-nums">{perk.big}</p>
          <p className="mt-1 text-[12px] leading-snug text-rc-ink/70">{perk.unit}</p>
        </div>
        <p className="truncate text-[11px] font-medium text-rc-ink/55">{displayCardName(perk.card.name)}</p>
      </div>
      {/* perforation, with the notches cut out of the paper */}
      <div aria-hidden className="relative w-0">
        <span className="absolute -left-[9px] -top-[9px] h-[18px] w-[18px] rounded-full bg-rc-night" />
        <span className="absolute -bottom-[9px] -left-[9px] h-[18px] w-[18px] rounded-full bg-rc-night" />
        <span className="absolute inset-y-3 left-0 border-l-2 border-dashed border-rc-ink/20" />
      </div>
      {/* the stub */}
      <div className="flex w-[92px] items-center justify-center rounded-r-[18px] bg-rc-pistachio">
        <div className="-rotate-90">
          <CardFace name={perk.card.name} bank={perk.card.bank} network={perk.card.network} width={96} lifted={false} />
        </div>
      </div>
    </motion.div>
  );
}
