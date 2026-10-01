import { motion, MotionValue, useTransform } from 'framer-motion';
import { OfferCard, DEMO_OFFERS } from './OfferCard';
import { cn } from '../../../../lib/utils';

interface OfferStackProps {
  emergenceProgress: MotionValue<number>; // 0 to 1
  swipeProgress: MotionValue<number>;     // 0 to 1
  className?: string;
  isMobile?: boolean;
}

export function OfferStack({ emergenceProgress, swipeProgress, className, isMobile = false }: OfferStackProps) {
  // Emergence animation: Stack rises from below
  const stackY = useTransform(emergenceProgress, [0, 1], [300, 0]);
  const stackOpacity = useTransform(emergenceProgress, [0, 0.5, 1], [0, 1, 1]);
  const stackScale = useTransform(emergenceProgress, [0, 1], [0.8, 1]);

  return (
    <motion.div
      style={{
        y: stackY,
        opacity: stackOpacity,
        scale: stackScale,
      }}
      className={cn("relative perspective-[1200px] flex items-center justify-center transform-style-3d", className)}
    >
      {DEMO_OFFERS.map((offer, index) => {
        // Calculate the specific progress window for this card to be swiped away
        const totalCards = DEMO_OFFERS.length;
        const swipeStart = index / totalCards;
        const swipeEnd = (index + 1) / totalCards;
        
        // This card's individual swipe progress (0 to 1)
        const cardSwipeProgress = useTransform(
          swipeProgress, 
          [swipeStart, swipeEnd], 
          [0, 1]
        );

        // Calculate if this card has already been swiped away completely
        const isSwipedAway = useTransform(swipeProgress, (p) => p > swipeEnd);
        
        // Calculate the card's visual state based on its position in the deck
        // When swipeProgress < swipeStart, the card is in the deck.
        // It moves forward in the deck as previous cards are swiped.
        
        // "deck position" is how far back it is from the front (0 = front, 1 = next, etc.)
        const deckPosition = useTransform(swipeProgress, (p) => {
          const currentFrontCardIndex = p * totalCards;
          const dist = index - currentFrontCardIndex;
          return Math.max(0, dist);
        });

        // Map deck position to visual properties
        const yOffset = useTransform(deckPosition, [0, 1, 2, 3], [0, -30, -55, -75]);
        const zOffset = useTransform(deckPosition, [0, 1, 2, 3], [0, -60, -120, -180]);
        const scaleOffset = useTransform(deckPosition, [0, 1, 2, 3], [1, 0.95, 0.9, 0.85]);
        const opacityOffset = useTransform(deckPosition, [0, 1, 2, 3], [1, 0.8, 0.5, 0]);

        // Map swipe progress to swipe-away animation
        const swipeDistance = isMobile ? 250 : 500;
        const swipeX = useTransform(
          cardSwipeProgress,
          [0, 1],
          [0, offer.direction === 'left' ? -swipeDistance : swipeDistance]
        );
        
        const swipeRotate = useTransform(
          cardSwipeProgress,
          [0, 1],
          [0, offer.direction === 'left' ? -15 : 15]
        );

        const swipeOpacity = useTransform(
          cardSwipeProgress,
          [0, 0.8, 1],
          [1, 1, 0] // Fade out at the very end of the swipe
        );

        // Combine deck state and swipe state
        const finalX = swipeX;
        const finalY = yOffset;
        const finalZ = zOffset;
        const finalRotate = swipeRotate;
        const finalScale = scaleOffset;
        
        // The opacity is determined by both how far back it is, and if it's being swiped
        const finalOpacity = useTransform(
          [opacityOffset, swipeOpacity, isSwipedAway],
          ([o1, o2, swiped]) => {
            if (swiped) return 0;
            return Math.min(o1 as number, o2 as number);
          }
        );

        // Sort DOM order so active card is always on top.
        // Highest z-index goes to the card currently being swiped or at the front.
        const zIndex = totalCards - index;

        return (
          <motion.div
            key={offer.id}
            style={{
              x: finalX,
              y: finalY,
              z: finalZ,
              rotateZ: finalRotate,
              scale: finalScale,
              opacity: finalOpacity,
              zIndex: zIndex
            }}
            className="absolute transform-style-3d will-change-transform"
          >
            <OfferCard data={offer} index={index} progress={cardSwipeProgress} />
          </motion.div>
        );
      })}
    </motion.div>
  );
}
