/**
 * The wallet as a stack: every card's top edge peeks out, the chosen card sits
 * in front at full size. Tap an edge and that card slides down to the front.
 */
import { motion, useReducedMotion } from 'framer-motion';
import { CardFace } from '../../../public-platform/site/CardFace';
import { useMediaQuery } from '../../../public-platform/site/primitives';
import type { CardData } from '../../../features/cards/types/card.types';

export function CardStack({ cards, selectedId, onSelect }: { cards: CardData[]; selectedId: string | null; onSelect: (id: string) => void }) {
  const reduce = useReducedMotion();
  const wide = useMediaQuery('(min-width: 768px)');
  const W = wide ? 340 : 300;
  const H = W / 1.586;
  const STRIP = wide ? 50 : 44;
  const behind = cards.filter((c) => c.id !== selectedId);
  const front = cards.find((c) => c.id === selectedId) ?? null;
  const order = front ? [...behind, front] : behind;
  const height = Math.max(0, order.length - 1) * STRIP + H;

  return (
    <div className="relative mx-auto" style={{ width: W, height }}>
      {order.map((card, i) => {
        const isFront = card.id === front?.id;
        return (
          <motion.button
            key={card.id}
            type="button"
            onClick={() => onSelect(card.id)}
            aria-label={isFront ? `${card.label}, selected` : `Show ${card.label}`}
            aria-pressed={isFront}
            className="absolute left-0 top-0 rounded-[14px] text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-rc-pistachio"
            style={{ zIndex: i + 1 }}
            initial={reduce ? false : { y: i * STRIP + 30, opacity: 0 }}
            animate={{ y: i * STRIP, opacity: 1, scale: isFront ? 1 : 0.94 + (i / Math.max(1, order.length)) * 0.05 }}
            whileHover={isFront || reduce ? undefined : { y: i * STRIP - 8 }}
            transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 260, damping: 28 }}
          >
            <CardFace name={card.label || 'Credit card'} bank={card.bank || ''} network={card.network} width={W} lifted={isFront} className={card.status !== 'active' ? 'grayscale' : undefined} />
          </motion.button>
        );
      })}
    </div>
  );
}
