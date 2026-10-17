import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Container, Eyebrow } from './primitives';
import { TOOLS } from './nav';

/** Shared frame for the calculators: header, inputs on the left, a sticky answer on the right. */
export function CalculatorShell({ title, lede, inputs, result, note, current }: {
  title: ReactNode;
  lede: string;
  inputs: ReactNode;
  result: ReactNode;
  note: string;
  /** route of this calculator, to list the others */
  current: string;
}) {
  return (
    <div className="w-full">
      <header className="border-b border-rc-ink/10">
        <Container className="pb-14 pt-16 lg:pb-20 lg:pt-24">
          <Eyebrow>Free tool</Eyebrow>
          <h1 className="mt-6 max-w-[16ch] font-serif text-[clamp(2.75rem,6vw,5.25rem)] font-medium leading-[0.98] tracking-[-0.025em] text-rc-ink">{title}</h1>
          <p className="mt-7 max-w-[54ch] text-[18px] leading-relaxed text-rc-muted">{lede}</p>
        </Container>
      </header>
      <Container className="grid items-start gap-10 py-14 lg:grid-cols-12 lg:gap-16 lg:py-20">
        <div className="lg:col-span-7">{inputs}</div>
        <div className="lg:sticky lg:top-28 lg:col-span-5">
          {result}
          <p className="mt-5 text-[12px] leading-relaxed text-rc-muted">{note}</p>
        </div>
      </Container>
      <section className="border-t border-rc-ink/10 py-14">
        <Container className="flex flex-wrap items-center gap-x-8 gap-y-3">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-rc-muted">Other tools</span>
          {TOOLS.filter((t) => t.to !== current).map((t) => (
            <Link key={t.to} to={t.to} className="text-[15px] text-rc-ink underline decoration-rc-ink/25 underline-offset-[6px] hover:decoration-rc-ink">{t.label}</Link>
          ))}
        </Container>
      </section>
    </div>
  );
}
