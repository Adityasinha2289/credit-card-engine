/**
 * Your cards in the leather holder from the landing page. The card that earns
 * most on the current spend rises out of it; tap any card to pull it yourself.
 */
import { motion, useReducedMotion } from 'framer-motion';
import { CardFace } from '../../../public-platform/site/CardFace';
import { HolderFront } from '../../../public-platform/site/Holder';
import { useMediaQuery } from '../../../public-platform/site/primitives';
import type { FinixCard } from '../../../public-platform/site/swipeMath';

export function WalletHolder({ cards, pulledId, onPull, children }: {
  cards: FinixCard[];
  pulledId: string | null;
  onPull?: (card: FinixCard) => void;
  /** shown inside the empty holder */
  children?: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  const wide = useMediaQuery('(min-width: 768px)');
  const W = wide ? 236 : 168;
  const k = W / 280;
  const cardH = W / 1.586;
  const peekH = 66 * k;
  const holderW = wide ? 470 : 318;
  const holderH = wide ? 182 : 132;
  const holderTop = cardH + 28 * k;
  const n = cards.length;
  const spring = reduce ? { duration: 0 } : { type: 'spring' as const, stiffness: 130, damping: 17, mass: 0.9 };

  return (
    <div className="relative mx-auto" style={{ width: holderW, height: holderTop + holderH }}>
      {/* the back of the holder, seen through the thumb notch */}
      <div aria-hidden className="absolute rounded-[26px] bg-gradient-to-b from-[#1d3a27] to-[#10261a]" style={{ top: holderTop, left: 0, right: 0, height: holderH }} />

      {cards.map((card, slot) => {
        const pulled = card.id === pulledId;
        const off = slot - (n - 1) / 2;
        return (
          <motion.button
            key={card.id}
            type="button"
            aria-label={`Use ${card.name}`}
            onClick={() => onPull?.(card)}
            className="absolute left-1/2 cursor-pointer rounded-[12px] will-change-transform focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-rc-pistachio"
            style={{ top: holderTop - peekH, marginLeft: -W / 2, zIndex: pulled ? 20 : 10 - Math.abs(Math.round(off)) }}
            initial={reduce ? false : { y: 40, opacity: 0 }}
            animate={pulled
              ? { x: 0, y: -(cardH - peekH) - 18 * k, rotate: -2, scale: 1.04, opacity: 1 }
              : { x: off * 54 * k * (n > 4 ? 1 : 1.15), y: 0, rotate: off * 3.5, scale: 1, opacity: 1 }}
            transition={spring}
            whileHover={pulled || reduce ? undefined : { y: -16 * k }}
          >
            <CardFace name={card.name} bank={card.bank} network={card.network} width={W} />
          </motion.button>
        );
      })}

      {/* the front: cards sit behind it */}
      <div className="pointer-events-none absolute inset-x-0 z-30 drop-shadow-[0_30px_30px_rgba(0,0,0,0.55)]" style={{ top: holderTop, height: holderH }}>
        <HolderFront w={holderW} h={holderH} />
      </div>

      {n === 0 && children && (
        <div className="absolute inset-x-0 z-40 flex justify-center" style={{ top: holderTop - 26 }}>{children}</div>
      )}
    </div>
  );
}
