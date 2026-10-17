import { useReducedMotion } from 'framer-motion';
import { Container } from '../../site/primitives';
import { bankLabel } from '../../site/CardFace';
import { CATALOG, CATALOG_STATS } from '../../site/swipeMath';

/** Issuers ordered by how many of their cards we cover, so the big names lead. */
const ISSUERS = (() => {
  const counts = new Map<string, number>();
  for (const c of CATALOG) counts.set(c.bank, (counts.get(c.bank) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([bank]) => bankLabel(bank));
})();

export function IssuerStrip() {
  const reduce = useReducedMotion();
  const row = (
    <ul className="flex shrink-0 items-center">
      {ISSUERS.map((name) => (
        <li key={name} className="flex items-center whitespace-nowrap font-serif text-[22px] text-rc-ink/70 sm:text-[26px]">
          <span className="px-6 sm:px-8">{name}</span>
          <span aria-hidden className="h-1.5 w-1.5 rotate-45 bg-rc-sage/60" />
        </li>
      ))}
    </ul>
  );

  return (
    <section aria-label="Issuers covered" className="border-y border-rc-ink/10 py-8">
      <Container className="mb-6 flex items-center justify-between gap-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-rc-muted">
          {CATALOG_STATS.cards} cards from {CATALOG_STATS.banks} issuers
        </p>
        <p className="hidden text-[13px] text-rc-muted sm:block">From each issuer's published terms</p>
      </Container>
      <div className="relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
        {reduce ? (
          <div className="overflow-x-auto">{row}</div>
        ) : (
          <div className="flex w-max animate-rc-marquee hover:[animation-play-state:paused]">
            {row}
            <div aria-hidden className="flex">{row}</div>
          </div>
        )}
      </div>
    </section>
  );
}
