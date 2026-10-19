import type { ReactNode } from 'react';
import { Container } from './primitives';
import { PageBody, PageHero } from './PageHero';
import { ToolsNav } from './ToolsNav';

/** Shared frame for the free tools: header with the tool switcher, inputs on the left, a sticky answer on the right. */
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
      <PageHero eyebrow="Free tools" title={title} lede={lede} actions={<ToolsNav current={current} />} />
      <PageBody>
        <Container className="grid items-start gap-10 pb-28 pt-12 lg:grid-cols-12 lg:gap-16 lg:pb-36 lg:pt-20">
          <div className="lg:col-span-7">{inputs}</div>
          <div className="lg:sticky lg:top-28 lg:col-span-5">
            {result}
            <p className="mt-5 text-[12px] leading-relaxed text-rc-muted">{note}</p>
          </div>
        </Container>
      </PageBody>
    </div>
  );
}
