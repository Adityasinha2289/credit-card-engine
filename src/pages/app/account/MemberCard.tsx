/**
 * Your RenoCred membership as a card: your name embossed, when you joined and
 * how many cards you've added. It leans toward the pointer and catches the light.
 */
import { useRef, type PointerEvent } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';
import { BrandMark } from '../../../public-platform/site/Brand';
import { useMediaQuery } from '../../../public-platform/site/primitives';
import { Avatar } from './AvatarPicker';

export function MemberCard({ name, since, cards, avatar }: { name: string; since: string | null; cards: number; avatar?: string | null }) {
  const reduce = useReducedMotion();
  const wide = useMediaQuery('(min-width: 640px)');
  const W = wide ? 380 : 320;
  const ref = useRef<HTMLDivElement>(null);
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const sx = useSpring(px, { stiffness: 140, damping: 18 });
  const sy = useSpring(py, { stiffness: 140, damping: 18 });
  const rotateY = useTransform(sx, (v) => (v - 0.5) * 18);
  const rotateX = useTransform(sy, (v) => (0.5 - v) * 18);
  const glare = useTransform([sx, sy], ([x, y]) => `radial-gradient(55% 55% at ${(x as number) * 100}% ${(y as number) * 100}%, rgba(255,255,255,0.22), transparent 60%)`);

  const move = (e: PointerEvent) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  };

  return (
    <div ref={ref} onPointerMove={reduce ? undefined : move} onPointerLeave={() => { px.set(0.5); py.set(0.5); }} style={{ perspective: 1000 }} className="mx-auto w-fit">
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 30, rotateX: 25 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        style={{ rotateX: reduce ? 0 : rotateX, rotateY: reduce ? 0 : rotateY, width: W, height: W / 1.586, transformStyle: 'preserve-3d' }}
        className="relative overflow-hidden rounded-[20px] text-rc-cream shadow-[0_40px_80px_-30px_rgba(0,0,0,0.9)]"
      >
        {/* forest card stock with a fine guilloche */}
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(135deg,#2E5A3B_0%,#173723_50%,#0C2216_100%)]" />
        <svg aria-hidden viewBox="0 0 380 240" className="absolute inset-0 h-full w-full opacity-[0.16]">
          {Array.from({ length: 14 }).map((_, i) => (
            <ellipse key={i} cx="330" cy="40" rx={40 + i * 22} ry={24 + i * 13} fill="none" stroke="#E3EED4" strokeWidth="0.7" />
          ))}
        </svg>
        <div aria-hidden className="absolute inset-0 rounded-[20px] shadow-[inset_0_0_0_1px_rgba(227,238,212,0.16)]" />
        {!reduce && (
          <motion.div aria-hidden className="absolute inset-y-0 -left-1/2 w-1/2 bg-[linear-gradient(105deg,transparent,rgba(227,238,212,0.18),transparent)]" animate={{ x: ['0%', '400%'] }} transition={{ duration: 2.4, delay: 0.9, ease: 'easeInOut', repeat: Infinity, repeatDelay: 5 }} />
        )}
        <motion.div aria-hidden className="absolute inset-0" style={{ background: glare }} />

        <div className="relative flex h-full flex-col justify-between p-5 sm:p-6">
          <div className="flex items-start justify-between">
            <span className="flex items-center gap-2 text-[15px] font-semibold"><BrandMark size={22} tone="pistachio" /> RenoCred</span>
            <span className="rounded-full border border-rc-pistachio/40 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-rc-pistachio">Member</span>
          </div>
          <span aria-hidden className="h-[26px] w-[34px] rounded-[6px] bg-gradient-to-br from-[#efe6bd] to-[#b7a35e] opacity-90" />
          <div className="flex items-end justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <Avatar src={avatar ?? null} name={name} size={wide ? 44 : 38} className="ring-2 ring-rc-pistachio/40" />
              <div className="min-w-0">
              <p className="truncate text-[17px] font-semibold uppercase tracking-[0.14em] [text-shadow:0_1px_0_rgba(0,0,0,0.4)] sm:text-[19px]">{name || 'Member'}</p>
              {since && <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-rc-mist">Since {since}</p>}
              </div>
            </div>
            <p className="shrink-0 text-right">
              <span className="block font-serif text-[26px] font-semibold leading-none tabular-nums text-rc-pistachio">{cards}</span>
              <span className="text-[10px] uppercase tracking-[0.16em] text-rc-mist">{cards === 1 ? 'card' : 'cards'}</span>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
