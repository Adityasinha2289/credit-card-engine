/**
 * A card that leans toward the pointer, with a soft glare that follows it.
 * Used where a single card is the subject of the page.
 */
import { useRef, type PointerEvent } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';
import { CardFace, type CardFaceProps } from './CardFace';

export function TiltCard({ max = 12, rest = -6, ...card }: CardFaceProps & { max?: number; rest?: number }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const hovering = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 150, damping: 18 });
  const sy = useSpring(py, { stiffness: 150, damping: 18 });
  const sh = useSpring(hovering, { stiffness: 150, damping: 20 });
  const rotateY = useTransform(sx, (v) => (v - 0.5) * 2 * max);
  const rotateX = useTransform(sy, (v) => (0.5 - v) * 2 * max);
  const rotateZ = useTransform(sh, (h) => rest * (1 - h));
  const glare = useTransform([sx, sy], ([x, y]) => `radial-gradient(60% 60% at ${(x as number) * 100}% ${(y as number) * 100}%, rgba(255,255,255,0.28), transparent 60%)`);
  const glareOpacity = useTransform(sh, (h) => h);
  const radius = 16 * ((card.width ?? 320) / 320);

  const move = (e: PointerEvent) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  };
  const leave = () => { px.set(0.5); py.set(0.5); hovering.set(0); };

  if (reduce) return <div style={{ transform: `rotate(${rest}deg)` }}><CardFace {...card} /></div>;

  return (
    <div ref={ref} onPointerMove={move} onPointerEnter={() => hovering.set(1)} onPointerLeave={leave} style={{ perspective: 900 }}>
      <motion.div className="relative" style={{ rotateX, rotateY, rotateZ, transformStyle: 'preserve-3d' }}>
        <CardFace {...card} />
        <motion.div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: glare, opacity: glareOpacity, borderRadius: radius }} />
      </motion.div>
    </div>
  );
}
