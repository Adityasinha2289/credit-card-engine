import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Container, EASE_OUT, formatINR } from '../../site/primitives';
import { displayCardName } from '../../site/CardFace';
import { CATALOG_STATS, bestInCatalog, slugifyCardName, type SpendCategory } from '../../site/swipeMath';

const OPTIONS: { id: SpendCategory; label: string }[] = [
  { id: 'dining', label: 'dining' },
  { id: 'travel', label: 'travel' },
  { id: 'shopping', label: 'online shopping' },
  { id: 'groceries', label: 'groceries' },
  { id: 'fuel', label: 'fuel' },
  { id: 'utilities', label: 'bills' },
  { id: 'entertainment', label: 'movies' },
];

/** One sentence, two inputs, one answer: the best card in the catalogue for a spend. */
export function TryIt() {
  const reduce = useReducedMotion();
  const [amount, setAmount] = useState(2500);
  const [category, setCategory] = useState<SpendCategory>('dining');
  const best = useMemo(() => bestInCatalog(category, Math.max(amount, 1)), [category, amount]);
  const label = OPTIONS.find((o) => o.id === category)!.label;

  return (
    <section id="try-it" className="relative z-10 -mt-10 scroll-mt-10 rounded-t-[40px] bg-rc-pistachio pb-36 pt-32 text-rc-ink lg:-mt-14 lg:rounded-t-[56px] lg:pb-52 lg:pt-44">
      <Container className="text-center">
        <p className="inline-flex items-center gap-2 rounded-full bg-rc-ink px-4 py-1.5 text-[12px] font-semibold uppercase tracking-[0.18em] text-rc-pistachio">Try it</p>
        <p className="mx-auto mt-10 max-w-[18ch] font-serif text-[clamp(2.2rem,5vw,4.25rem)] leading-[1.12] tracking-[-0.02em] sm:max-w-none">
          I'm spending{' '}
          {/* each control sizes itself to its text: an invisible copy sets the width, the control sits on top */}
          <span className="relative inline-block border-b-2 border-rc-ink/80">
            <span aria-hidden className="invisible whitespace-pre">₹{(amount || 0).toLocaleString('en-IN')}</span>
            <span className="absolute inset-0 flex">
              <span>₹</span>
              <input
                aria-label="Amount in rupees"
                inputMode="numeric"
                size={1}
                value={amount ? amount.toLocaleString('en-IN') : ''}
                onChange={(e) => setAmount(Math.min(10_000_000, Number(e.target.value.replace(/[^\d]/g, '')) || 0))}
                className="w-full min-w-0 bg-transparent p-0 text-left tabular-nums outline-none"
              />
            </span>
          </span>{' '}
          on{' '}
          <label className="relative inline-block border-b-2 border-rc-ink/80">
            <span className="sr-only">Category</span>
            <span aria-hidden className="invisible whitespace-pre">{label}</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as SpendCategory)}
              className="absolute inset-0 w-full cursor-pointer appearance-none bg-transparent p-0 text-center outline-none"
            >
              {OPTIONS.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
            </select>
          </label>
        </p>

        <div className="mt-16 min-h-[200px]" aria-live="polite">
          {best && amount > 0 && (
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={best.card.id}
                initial={reduce ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.45, ease: EASE_OUT }}
              >
                <p className="text-[15px] text-rc-muted">swipe the</p>
                <Link to={`/cards/${slugifyCardName(best.card.name)}`} className="mt-2 inline-block font-serif text-[clamp(2.75rem,7vw,6rem)] font-semibold leading-[0.98] tracking-[-0.035em] text-rc-forest hover:underline hover:decoration-2 hover:underline-offset-8">
                  {displayCardName(best.card.name)}.
                </Link>
                <p className="mt-6 text-[16px] text-rc-muted">
                  <span className="font-semibold text-rc-emerald">+{formatINR(best.reward)} back</span>, {best.rate}% on {label}. The most of the {CATALOG_STATS.cards} cards we track.
                </p>
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        <div className="mt-12 flex flex-wrap justify-center gap-x-8 gap-y-3 text-[14px]">
          <Link to="/calculators/which-card-to-use" className="inline-flex items-center gap-1.5 font-medium text-rc-ink underline decoration-rc-ink/25 underline-offset-[6px] hover:decoration-rc-ink">
            Compare the cards you own <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link to="/methodology" className="text-rc-muted underline decoration-rc-ink/20 underline-offset-[6px] hover:text-rc-ink">How we rank</Link>
        </div>
      </Container>
    </section>
  );
}
