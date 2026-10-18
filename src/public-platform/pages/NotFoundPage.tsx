import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { ArrowChip, ButtonLink, Container } from '../site/primitives';
import { CardFace } from '../site/CardFace';
import { PageBody, PageHero } from '../site/PageHero';
import { TOOLS } from '../site/nav';

const ELSEWHERE = [
  { label: 'All cards', to: '/cards', description: 'Fees, rates and perks, side by side.' },
  { label: TOOLS[0].label, to: TOOLS[0].to, description: TOOLS[0].description },
  { label: 'How we rank', to: '/methodology', description: 'The rules behind every answer.' },
];

export function NotFoundPage() {
  return (
    <div className="flex w-full flex-1 flex-col">
      <SEO
        title="Page Not Found | RenoCred"
        description="The page you are looking for does not exist."
        canonicalUrl="https://renocred.com/404"
        robotsDirective="noindex, nofollow"
      />
      <PageHero
        eyebrow="Error 404"
        title={<>This card <span className="italic">was declined.</span></>}
        lede="The page you are looking for doesn't exist or has moved. Try the card directory, or head back home."
        actions={(
          <>
            <ButtonLink to="/" variant="cream" size="lg">Back to home</ButtonLink>
            <ButtonLink to="/cards" variant="outline-cream" size="lg" arrow={false}>Browse cards</ButtonLink>
          </>
        )}
        aside={(
          <div aria-hidden className="relative hidden justify-center lg:flex">
            <div className="rotate-[-8deg] grayscale">
              <CardFace name="Not Found" bank="RenoCred" width={340} />
            </div>
            <span className="absolute right-[8%] top-[-6%] rotate-[10deg] rounded-full border-2 border-rc-pistachio px-5 py-2 font-sans text-[15px] font-bold uppercase tracking-[0.2em] text-rc-pistachio">Declined</span>
          </div>
        )}
      />
      <PageBody>
        <Container className="pb-28 pt-16 lg:pb-36 lg:pt-20">
          <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-rc-muted">Try one of these</p>
          <ul className="mt-5 grid gap-3 sm:grid-cols-3">
            {ELSEWHERE.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="group flex h-full items-start justify-between gap-4 rounded-[24px] border border-rc-ink/10 bg-rc-paper p-5 transition-colors hover:border-rc-ink/30">
                  <span>
                    <span className="block font-serif text-[21px] leading-snug text-rc-ink">{l.label}</span>
                    <span className="mt-1.5 block text-[14px] leading-relaxed text-rc-muted">{l.description}</span>
                  </span>
                  <ArrowChip variant="ink" size="sm" />
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </PageBody>
    </div>
  );
}
