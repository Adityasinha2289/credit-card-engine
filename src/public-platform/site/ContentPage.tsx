import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Container } from './primitives';
import { PageBody, PageHero } from './PageHero';

/**
 * Layout for text pages (legal, policy, contact): the dark page hero, then a
 * single readable column on cream. Body copy uses plain elements styled by .rc-prose.
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
    <article className="flex flex-1 flex-col">
      <PageHero
        eyebrow={eyebrow}
        title={title}
        lede={lede}
        meta={updated && (
          <>
            Last updated{' '}
            <time dateTime={updated} className="text-rc-cream">
              {new Date(updated).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
            </time>
          </>
        )}
      />
      <PageBody>
        <Container className="grid gap-14 pb-28 pt-16 lg:grid-cols-12 lg:pb-36 lg:pt-24">
          <div className="rc-prose lg:col-span-8">{children}</div>
          {aside && <aside className="lg:col-span-3 lg:col-start-10">{aside}</aside>}
        </Container>
      </PageBody>
    </article>
  );
}

/** Small "related reading" list for the content page sidebar. */
export function RelatedLinks({ links }: { links: { label: string; to: string }[] }) {
  return (
    <div className="lg:sticky lg:top-28">
      <p className="mb-4 text-[12px] font-semibold uppercase tracking-[0.2em] text-rc-muted">Related</p>
      <ul className="space-y-2">
        {links.map((l) => (
          <li key={l.to}>
            <Link to={l.to} className="flex items-center justify-between rounded-2xl border border-rc-ink/10 px-4 py-3 text-[14px] text-rc-ink transition-colors hover:border-rc-ink/30 hover:bg-rc-paper">
              {l.label}
              <span aria-hidden className="text-rc-muted">→</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
