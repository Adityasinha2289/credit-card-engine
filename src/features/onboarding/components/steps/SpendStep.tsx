/**
 * Question 2: where the money goes. Each spend you tap turns over to show the
 * card in the catalogue that pays most for it.
 */
import { motion, useReducedMotion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { EASE_OUT } from '../../../../public-platform/site/primitives';
import { displayCardName } from '../../../../public-platform/site/CardFace';
import { cn } from '../../../../lib/utils';
import { GOAL_ECHO, SPEND, bestFor } from '../../onboardingData';

export function SpendStep({ goal, value, onToggle }: { goal?: string; value: string[]; onToggle: (id: string) => void }) {
  const reduce = useReducedMotion();
  return (
    <div>
      <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-rc-pistachio">{(goal && GOAL_ECHO[goal]) ?? 'Next'}</p>
      <h1 className="mt-3 font-serif text-[clamp(2.1rem,5vw,3.4rem)] font-semibold leading-[1.02] tracking-[-0.03em]">Where does your money go?</h1>
      <p className="mt-3 text-[15px] text-rc-mist">Tap what you spend on most. Each one shows the card that pays most for it.</p>

      <div className="mt-7 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {SPEND.map((s, i) => {
          const on = value.includes(s.id);
          const top = bestFor(s.id);
          return (
            <motion.button
              key={s.id}
              type="button"
              aria-pressed={on}
              onClick={() => onToggle(s.id)}
              whileTap={{ scale: 0.97 }}
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: EASE_OUT, delay: 0.04 + i * 0.035 }}
              className={cn(
                'relative flex h-[128px] flex-col justify-between overflow-hidden rounded-[22px] border p-4 text-left transition-colors duration-300',
                on ? 'border-rc-pistachio bg-rc-pistachio text-rc-ink' : 'border-white/10 bg-white/[0.03] text-rc-cream hover:border-white/25 hover:bg-white/[0.06]',
              )}
            >
              <span className="flex items-start justify-between gap-2">
                <s.icon className={cn('h-5 w-5', on ? 'text-rc-forest' : 'text-rc-pistachio')} />
                {!on && <Plus className="h-4 w-4 text-rc-mist" />}
              </span>
              <span>
                <span className="block text-[14px] font-semibold leading-tight">{s.title}</span>
                {/* the reveal: what the best card in the catalogue pays for this */}
                <motion.span
                  initial={false}
                  animate={on ? { opacity: 1, y: 0, height: 'auto' } : { opacity: 0, y: 6, height: 0 }}
                  transition={{ duration: reduce ? 0 : 0.35, ease: EASE_OUT }}
                  className="block overflow-hidden"
                >
                  {top && (
                    <span className="mt-1 flex items-baseline gap-1.5">
                      <span className="font-serif text-[22px] font-semibold leading-none tabular-nums">{top.rate}%</span>
                      <span className="truncate text-[11.5px] text-rc-ink/70">{displayCardName(top.card.name)}</span>
                    </span>
                  )}
                </motion.span>
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
