/** Rounded question-and-answer list, one open at a time (the home page FAQ style). */
import { useId, useState, type ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { cn } from '../../lib/utils';
import { EASE_OUT } from './primitives';

export function Accordion({ items, defaultOpen = 0, className }: {
  items: { question: string; answer: ReactNode }[];
  defaultOpen?: number | null;
  className?: string;
}) {
  const [open, setOpen] = useState<number | null>(defaultOpen);
  const reduce = useReducedMotion();
  const id = useId();
  return (
    <ul className={cn('space-y-2.5', className)}>
      {items.map((f, i) => {
        const isOpen = open === i;
        return (
          <li key={f.question} className={cn('rounded-[24px] border transition-colors duration-300', isOpen ? 'border-transparent bg-rc-paper shadow-[0_20px_40px_-30px_rgba(15,42,29,0.4)]' : 'border-rc-ink/10 hover:border-rc-ink/25')}>
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={`${id}-${i}`}
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left"
            >
              <span className="font-serif text-[19px] leading-snug sm:text-[21px]">{f.question}</span>
              <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-[transform,background-color] duration-500 ease-[cubic-bezier(.22,1,.36,1)]', isOpen ? 'rotate-45 bg-rc-ink text-rc-pistachio' : 'bg-rc-ink/[0.06]')}>
                <Plus className="h-4 w-4" />
              </span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={`${id}-${i}`}
                  initial={reduce ? false : { height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.45, ease: EASE_OUT }}
                  className="overflow-hidden"
                >
                  <div className="max-w-[62ch] px-6 pb-6 text-[15px] leading-relaxed text-rc-muted">{f.answer}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        );
      })}
    </ul>
  );
}
