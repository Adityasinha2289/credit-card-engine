/** Question 1: one tap picks the goal and moves on. Keys 1 to 5 work too. */
import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Check } from 'lucide-react';
import { PRIMARY_GOALS } from '../../../../config/goals';
import { EASE_OUT } from '../../../../public-platform/site/primitives';
import { cn } from '../../../../lib/utils';

export function GoalStep({ value, onPick }: { value?: string; onPick: (goal: string) => void }) {
  const reduce = useReducedMotion();
  const [chosen, setChosen] = useState(value);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const pick = (id: string) => {
    setChosen(id);
    clearTimeout(timer.current);
    // long enough to see the row fill, short enough not to wait
    timer.current = setTimeout(() => onPick(id), reduce ? 0 : 480);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const n = Number(e.key);
      if (n >= 1 && n <= PRIMARY_GOALS.length && !e.metaKey && !e.ctrlKey && !(e.target instanceof HTMLInputElement)) pick(PRIMARY_GOALS[n - 1].id);
    };
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); clearTimeout(timer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-rc-pistachio">Let's set you up</p>
      <h1 className="mt-3 font-serif text-[clamp(2.1rem,5vw,3.4rem)] font-semibold leading-[1.02] tracking-[-0.03em]">What should your cards do for you?</h1>
      <p className="mt-3 text-[15px] text-rc-mist">Pick one. It decides which card we put first.</p>

      <div role="radiogroup" aria-label="Your goal" className="mt-7 space-y-2.5">
        {PRIMARY_GOALS.map((g, i) => {
          const on = chosen === g.id;
          const Icon = g.icon;
          return (
            <motion.button
              key={g.id}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => pick(g.id)}
              whileTap={{ scale: 0.985 }}
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: EASE_OUT, delay: 0.05 + i * 0.05 }}
              className={cn(
                'group relative flex w-full items-center gap-4 overflow-hidden rounded-[22px] border px-4 py-3.5 text-left transition-colors duration-300 sm:px-5',
                on ? 'border-rc-pistachio text-rc-ink' : 'border-white/10 bg-white/[0.03] text-rc-cream hover:border-white/25 hover:bg-white/[0.06]',
              )}
            >
              {/* the fill sweeps across the row you pick */}
              <motion.span aria-hidden className="absolute inset-0 origin-left bg-rc-pistachio" initial={false} animate={{ scaleX: on ? 1 : 0 }} transition={{ duration: reduce ? 0 : 0.42, ease: EASE_OUT }} />
              <span className={cn('relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-colors duration-300', on ? 'bg-rc-ink text-rc-pistachio' : 'bg-white/[0.06] text-rc-pistachio')}>
                {on ? <Check className="h-5 w-5" strokeWidth={2.6} /> : <Icon className="h-5 w-5" />}
              </span>
              <span className="relative min-w-0 flex-1">
                <span className="block text-[16px] font-semibold">{g.title}</span>
                <span className={cn('block text-[13px] leading-snug transition-colors duration-300', on ? 'text-rc-ink/70' : 'text-rc-mist')}>{g.description}</span>
              </span>
              <kbd className={cn('relative hidden h-7 w-7 shrink-0 items-center justify-center rounded-lg border font-sans text-[12px] sm:flex', on ? 'border-rc-ink/20 text-rc-ink/60' : 'border-white/15 text-rc-mist')}>{i + 1}</kbd>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
