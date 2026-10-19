import type { ReactNode } from 'react';
import { SiteLink as Link } from './SiteLink';
import { ArrowChip, Container } from './primitives';
import { PageBody, PageHero } from './PageHero';
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
    <div className="flex w-full flex-1 flex-col">
      <PageHero eyebrow="Free tool" title={title} lede={lede} />
      <PageBody>
        <Container className="grid items-start gap-10 pb-16 pt-14 lg:grid-cols-12 lg:gap-16 lg:pb-24 lg:pt-20">
          <div className="lg:col-span-7">{inputs}</div>
          <div className="lg:sticky lg:top-28 lg:col-span-5">
            {result}
            <p className="mt-5 text-[12px] leading-relaxed text-rc-muted">{note}</p>
          </div>
        </Container>
        <section className="pb-28 lg:pb-36">
          <Container>
            <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-rc-muted">Other free tools</p>
            <ul className="mt-5 grid gap-3 sm:grid-cols-3">
              {TOOLS.filter((t) => t.to !== current).map((t) => (
                <li key={t.to}>
                  <Link to={t.to} className="group flex h-full items-start justify-between gap-4 rounded-[24px] border border-rc-ink/10 bg-rc-paper p-5 transition-colors hover:border-rc-ink/30">
                    <span>
                      <span className="block font-serif text-[21px] leading-snug text-rc-ink">{t.label}</span>
                      <span className="mt-1.5 block text-[14px] leading-relaxed text-rc-muted">{t.description}</span>
                    </span>
                    <ArrowChip variant="ink" size="sm" />
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      </PageBody>
    </div>
  );
}
