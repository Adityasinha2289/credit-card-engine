import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { Container, ButtonLink } from '../site/primitives';
import { CARD_NEEDS, COMPANY, LEGAL, SIGN_UP, SOCIAL, TOOLS } from '../site/nav';

function Column({ title, links }: { title: string; links: { label: string; to: string }[] }) {
  return (
    <div>
      <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-rc-mist/70">{title}</p>
      <ul className="space-y-3">
        {links.map((l) => (
          <li key={l.to}>
            <Link to={l.to} className="text-[14px] text-rc-mist transition-colors hover:text-rc-cream">{l.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PublicFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="overflow-hidden bg-rc-night text-rc-cream">
      <Container className="pt-20 lg:pt-28">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <img src="/logo.jpg" alt="" width={32} height={32} className="h-8 w-8 rounded-[9px] object-cover ring-1 ring-white/10" />
              <span className="text-[17px] font-semibold tracking-[-0.01em]">RenoCred</span>
            </Link>
            <p className="mt-6 max-w-[30ch] text-[15px] leading-relaxed text-rc-mist">
              Credit card intelligence for India. Know which card to use, what you earn and what's about to renew.
            </p>
            <ButtonLink to={SIGN_UP} variant="cream" className="mt-8">Get started, it's free</ButtonLink>
          </div>
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-4 lg:col-span-8">
            <Column title="Cards" links={[{ label: 'All cards', to: '/cards' }, ...CARD_NEEDS.slice(0, 6)]} />
            <Column title="Tools" links={TOOLS.map(({ label, to }) => ({ label, to }))} />
            <Column title="Company" links={COMPANY} />
            <Column title="Trust" links={LEGAL} />
          </div>
        </div>
      </Container>

      {/* oversized wordmark, the site's sign-off */}
      <div aria-hidden className="mt-20 select-none whitespace-nowrap pb-[0.06em] text-center font-serif leading-[0.9] tracking-[-0.04em] text-rc-moss" style={{ fontSize: 'clamp(5rem, 21vw, 19rem)' }}>
        RenoCred
      </div>

      <Container className="border-t border-white/10 py-8">
        <div className="flex flex-col gap-6 text-[12px] leading-relaxed text-rc-mist/70 lg:flex-row lg:items-start lg:justify-between">
          <p>© {year} RenoCred. All rights reserved.</p>
          <p className="max-w-2xl lg:text-center">
            RenoCred provides information and analysis, not financial advice. Reward rates, fees and eligibility change; confirm details with the issuer before applying.
          </p>
          <div className="flex gap-5">
            {SOCIAL.map((s) => (
              <a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-rc-mist transition-colors hover:text-rc-cream">
                {s.label} <ArrowUpRight className="h-3 w-3" />
              </a>
            ))}
          </div>
        </div>
      </Container>
    </footer>
  );
}
