import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion, useInView, useReducedMotion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { Container, Display, Eyebrow, Reveal, EASE_OUT } from '../../site/primitives';
import { ChatMock, DiscoverMock, MoneyMock, RemindersMock, WalletMock } from './ProductMocks';

interface ChapterDef {
  kicker: string;
  title: ReactNode;
  body: string;
  points: string[];
  visual: ReactNode;
}

const CHAPTERS: ChapterDef[] = [
  {
    kicker: 'Wallet',
    title: <>Know which card <span className="italic">to swipe.</span></>,
    body: 'Tell RenoCred which cards you hold. At checkout it ranks them by what you would actually get back, so dinner goes on the dining card and the flight on the travel card.',
    points: ['Ranks your cards for any merchant or category', 'Accounts for monthly caps where issuers publish them'],
    visual: <WalletMock />,
  },
  {
    kicker: 'Taqdeer',
    title: <>Ask anything. <span className="italic">In Hinglish too.</span></>,
    body: 'Taqdeer is the assistant inside RenoCred. It answers from your cards and our catalogue, shows its working, and says so when it does not know.',
    points: ['Replies in English, Hindi or Hinglish', 'Grounded in real reward rates, not guesses'],
    visual: <ChatMock />,
  },
  {
    kicker: 'Money',
    title: <>See what's <span className="italic">safe to spend.</span></>,
    body: 'Income, budgets, upcoming renewals and savings goals, brought down to one number you can spend this month without second-guessing.',
    points: ['Budgets by category, reset every month', 'Bill due dates and savings goals in the same view'],
    visual: <MoneyMock />,
  },
  {
    kicker: 'Reminders',
    title: <>Never pay for a trial <span className="italic">you forgot.</span></>,
    body: 'RenoCred spots recurring charges in your spending, then reminds you before they renew, by email, push or in the app. If the price went up, you will hear about that too.',
    points: ['Free-trial, renewal and price-rise alerts', 'You choose how many days ahead'],
    visual: <RemindersMock />,
  },
  {
    kicker: 'Discover',
    title: <>Find the card that <span className="italic">pays you back.</span></>,
    body: 'From how you actually spend, RenoCred works out which new card would add the most value after its fee, and what it takes to qualify.',
    points: ['Net value after annual fee, not headline rates', 'Eligibility shown before you apply'],
    visual: <DiscoverMock />,
  },
];

function Chapter({ index, def, active, onActive }: { index: number; def: ChapterDef; active: boolean; onActive: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: '-45% 0px -45% 0px' });
  useEffect(() => { if (inView) onActive(); }, [inView, onActive]);

  return (
    <div ref={ref} className="flex flex-col justify-center py-14 lg:min-h-[78vh] lg:py-0">
      <div className={cn('transition-opacity duration-500', active ? 'lg:opacity-100' : 'lg:opacity-30')}>
        <Eyebrow index={String(index + 1).padStart(2, '0')}>{def.kicker}</Eyebrow>
        <h3 className="mt-6 font-serif text-[clamp(2.1rem,3.4vw,3.25rem)] font-medium leading-[1.02] tracking-[-0.02em] text-rc-ink">{def.title}</h3>
        <p className="mt-6 max-w-[46ch] text-[17px] leading-relaxed text-rc-muted">{def.body}</p>
        <ul className="mt-8 space-y-3">
          {def.points.map((p) => (
            <li key={p} className="flex items-start gap-3 text-[15px] text-rc-ink">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rc-pistachio"><Check className="h-3 w-3 text-rc-forest" /></span>
              {p}
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-10 h-[500px] lg:hidden">{def.visual}</div>
    </div>
  );
}

export function ProductChapters() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const setters = useRef(CHAPTERS.map((_, i) => () => setActive(i)));

  return (
    <section id="product" className="scroll-mt-24 bg-rc-cream py-28 lg:py-40">
      <Container>
        <Reveal className="max-w-4xl">
          <Eyebrow index="02">What RenoCred does</Eyebrow>
          <Display className="mt-6 text-rc-ink">Every card you own, <span className="italic text-rc-forest">finally working together.</span></Display>
        </Reveal>

        <div className="mt-10 lg:mt-16 lg:grid lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            {CHAPTERS.map((def, i) => (
              <Chapter key={def.kicker} index={i} def={def} active={active === i} onActive={setters.current[i]} />
            ))}
          </div>
          <div className="hidden lg:col-span-7 lg:block">
            <div className="sticky top-[14vh] h-[72vh] max-h-[720px] min-h-[540px]">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={active}
                  className="h-full"
                  initial={reduce ? false : { opacity: 0, y: 24, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -24, scale: 0.98 }}
                  transition={{ duration: 0.5, ease: EASE_OUT }}
                >
                  {CHAPTERS[active].visual}
                </motion.div>
              </AnimatePresence>
              {/* progress */}
              <div className="absolute -left-10 top-1/2 flex -translate-y-1/2 flex-col gap-2" aria-hidden>
                {CHAPTERS.map((c, i) => (
                  <span key={c.kicker} className={cn('w-[3px] rounded-full transition-all duration-500', i === active ? 'h-8 bg-rc-ink' : 'h-3 bg-rc-ink/15')} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
