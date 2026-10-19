/** A hand of cards fanned out from one corner; it opens wider on hover. */
import type { CSSProperties } from 'react';
import { cn } from '../../lib/utils';
import { CardFace } from './CardFace';

export function CardFan({ cards, width = 250, className }: {
  cards: { id: string; name: string; bank: string; network?: string }[];
  width?: number;
  className?: string;
}) {
  const n = cards.length;
  const mid = (n - 1) / 2;
  return (
    <div className={cn('group relative mx-auto', className)} style={{ width: width * 1.9, height: (width / 1.586) * 1.75 }}>
      {cards.map((c, i) => {
        const o = i - mid;
        return (
          <div
            key={c.id}
            className="absolute bottom-0 left-1/2 origin-[50%_140%] transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] [transform:translateX(-50%)_rotate(var(--r))] group-hover:[transform:translateX(-50%)_rotate(var(--rh))]"
            style={{ '--r': `${o * 9}deg`, '--rh': `${o * 14}deg`, zIndex: i } as CSSProperties}
          >
            <CardFace name={c.name} bank={c.bank} network={c.network} width={width} />
          </div>
        );
      })}
    </div>
  );
}
