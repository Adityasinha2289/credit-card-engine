/**
 * The green half of the sign-in page (wide screens): the promise, a live list of
 * everyday spends with the card in the catalogue that earns most on each (a line
 * moves down the rows), and the catalogue's real numbers.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Wordmark } from '../../../public-platform/site/Brand';
import catalogueStats from '../../../public-platform/site/catalogueStats.json';
import type { SpendRow } from './authSpends';

const EASE = [0.22, 1, 0.36, 1] as const;
const inr = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

export function AuthAside() {
  const reduce = useReducedMotion();
  const [rows, setRows] = useState<SpendRow[]>([]);
  const [on, setOn] = useState(0);

  useEffect(() => {
    let live = true;
    void import('./authSpends').then((m) => { if (live) setRows(m.spendRows()); });
    return () => { live = false; };
  }, []);

  useEffect(() => {
    if (reduce || rows.length < 2) return;
    const t = setInterval(() => setOn((i) => (i + 1) % rows.length), 2400);
    return () => clearInterval(t);
  }, [reduce, rows.length]);

  return (
    <aside className="relative hidden overflow-hidden bg-rc-ink text-rc-cream lg:flex lg:flex-col lg:p-14 xl:p-16">
      <div aria-hidden className="pointer-events-none absolute -right-[30%] top-[18%] h-[640px] w-[760px] rounded-full bg-[radial-gradient(closest-side,rgba(227,238,212,0.09),transparent)]" />

      <Link to="/" aria-label="RenoCred home" className="relative w-fit"><Wordmark dark /></Link>

      <div className="relative my-auto py-12">
        <motion.h1
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE }}
          className="max-w-[15ch] font-serif text-[clamp(2.75rem,4.2vw,4.25rem)] font-medium leading-[0.98] tracking-[-0.025em]"
        >
          Every card you own, <span className="italic text-rc-pistachio">working together.</span>
        </motion.h1>

        {/* the spends, full width of the panel */}
        <div className="mt-10 rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
          <div className="flex items-baseline justify-between gap-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-rc-mist/80">
            <span>The best card for</span>
            <span className="normal-case tracking-normal">from {catalogueStats.listed} cards</span>
          </div>
          <ul className="mt-3 min-h-[290px]">
            {rows.map((r, i) => (
              <motion.li
                key={r.label}
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: EASE, delay: 0.15 + i * 0.07 }}
                className="relative flex items-center gap-4 py-3.5"
              >
                <span className="min-w-0 flex-1">
                  <span className={`block truncate text-[15px] transition-colors duration-500 ${i === on ? 'text-rc-cream' : 'text-rc-mist'}`}>{r.label}</span>
                  <span className="block truncate text-[12.5px] text-rc-mist/80">{inr(r.amount)} · {r.card}, {r.rate}%</span>
                </span>
                <span className={`font-serif text-[22px] tabular-nums transition-colors duration-500 ${i === on ? 'text-rc-pistachio' : 'text-rc-cream/70'}`}>+{inr(r.reward)}</span>
                {/* hairline under each row, and the line that moves down them */}
                <span aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-white/[0.08]" />
                <span aria-hidden className={`absolute bottom-0 left-0 h-[1.5px] w-full origin-left bg-rc-pistachio transition-transform duration-[900ms] ease-[cubic-bezier(.22,1,.36,1)] ${i === on ? 'scale-x-100' : 'scale-x-0'}`} />
              </motion.li>
            ))}
          </ul>
        </div>
      </div>

      <div className="relative flex items-end justify-between gap-6 xl:gap-10">
        <dl className="flex shrink-0 gap-7 xl:gap-10">
          {[
            [catalogueStats.listed, 'cards read'],
            [catalogueStats.issuers, 'issuers'],
            ['₹0', 'to use'],
          ].map(([v, k]) => (
            <div key={k}>
              <dt className="sr-only">{k}</dt>
              <dd className="font-serif text-[34px] font-semibold leading-none tabular-nums text-rc-cream">{v}</dd>
              <dd className="mt-1.5 whitespace-nowrap text-[12px] text-rc-mist">{k}</dd>
            </div>
          ))}
        </dl>
        <ul className="space-y-1.5 text-[13px] text-rc-mist">
          {['Never touches your credit score', 'No full card numbers'].map((t) => (
            <li key={t} className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-rc-pistachio" />{t}</li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
