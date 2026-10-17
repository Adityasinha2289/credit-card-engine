import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Container, Eyebrow } from './primitives';

/**
 * Layout for text pages (legal, policy, about, contact): an editorial header
 * and a single readable column. Body copy uses plain elements styled by .rc-prose.
 */
export function ContentPage({ eyebrow, title, lede, updated, aside, children }: {
  eyebrow: string;
  title: ReactNode;
  lede?: ReactNode;
  /** ISO date, shown as "Last updated" */
  updated?: string;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <article className="pb-28 lg:pb-36">
      <header className="border-b border-rc-ink/10">
        <Container className="pb-14 pt-16 lg:pb-20 lg:pt-24">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="mt-6 max-w-[18ch] font-serif text-[clamp(2.75rem,6vw,5.25rem)] font-medium leading-[0.98] tracking-[-0.025em] text-rc-ink">
            {title}
          </h1>
          {lede && <p className="mt-7 max-w-[56ch] text-[18px] leading-relaxed text-rc-muted">{lede}</p>}
          {updated && (
            <p className="mt-8 text-[13px] text-rc-muted">
              Last updated{' '}
              <time dateTime={updated} className="text-rc-ink">
                {new Date(updated).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
              </time>
            </p>
          )}
        </Container>
      </header>
      <Container className="grid gap-14 pt-14 lg:grid-cols-12 lg:pt-20">
        <div className="rc-prose lg:col-span-8">{children}</div>
        {aside && <aside className="lg:col-span-3 lg:col-start-10">{aside}</aside>}
      </Container>
    </article>
  );
}

/** Small "related reading" list for the content page sidebar. */
export function RelatedLinks({ links }: { links: { label: string; to: string }[] }) {
  return (
    <div className="lg:sticky lg:top-28">
      <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-rc-muted">Related</p>
      <ul className="space-y-3 border-l border-rc-ink/10 pl-5">
        {links.map((l) => (
          <li key={l.to}>
            <Link to={l.to} className="text-[14px] text-rc-ink underline decoration-rc-ink/20 underline-offset-4 hover:decoration-rc-ink">{l.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
