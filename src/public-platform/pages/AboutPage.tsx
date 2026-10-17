import { SEO } from '../components/SEO';
import { ButtonLink, Container, Display, Eyebrow, Reveal } from '../site/primitives';
import { CATALOG_STATS } from '../site/swipeMath';
import { SIGN_UP } from '../site/nav';

const PRINCIPLES = [
  {
    title: 'Clarity over hype',
    body: 'Reward structures, caps, fee waivers and eligibility rules, written so you can act on them. No "up to" headlines without the fine print next to them.',
  },
  {
    title: 'Your interest first',
    body: 'Cards are ranked by the value they add to your wallet after fees. Commercial relationships never change that order.',
  },
  {
    title: 'Show the working',
    body: 'Every estimate traces back to a published rate and your own numbers. When we do not know something, we say so.',
  },
];

export function AboutPage() {
  return (
    <>
      <SEO
        title="About RenoCred | Credit card intelligence for India"
        description="RenoCred's mission is to bring clarity and transparency to the Indian credit card ecosystem."
        canonicalUrl="https://renocred.com/about"
      />

      <section className="border-b border-rc-ink/10">
        <Container className="pb-20 pt-16 lg:pb-28 lg:pt-24">
          <Eyebrow>About RenoCred</Eyebrow>
          <Display as="h1" size="xl" className="mt-7 max-w-[14ch] text-rc-ink">
            Choosing a card shouldn't need <span className="italic text-rc-forest">a spreadsheet.</span>
          </Display>
          <p className="mt-9 max-w-[54ch] text-[19px] leading-relaxed text-rc-muted">
            We built RenoCred to solve a simple problem: getting real value from credit cards in India is far too complicated.
          </p>
        </Container>
      </section>

      <section className="py-24 lg:py-32">
        <Container className="grid gap-14 lg:grid-cols-12">
          <Reveal className="lg:col-span-4">
            <Eyebrow index="01">Why we exist</Eyebrow>
          </Reveal>
          <Reveal delay={0.08} className="rc-prose lg:col-span-7 lg:col-start-6">
            <p>The credit card ecosystem in India is full of hidden benefits, complex reward structures, shifting eligibility rules and opaque terms. For most people, a confident decision about which card to use, or which to apply for next, means building a spreadsheet.</p>
            <blockquote>By matching how each card works to how you actually spend, RenoCred makes sure no swipe leaves money on the table.</blockquote>
            <p>We are building RenoCred to be the place where you manage the cards you have, get more from everyday spending, and make data-driven decisions at a glance, starting with {CATALOG_STATS.cards} cards from {CATALOG_STATS.banks} issuers.</p>
          </Reveal>
        </Container>
      </section>

      <section className="bg-rc-ink py-24 text-rc-cream lg:py-32">
        <Container>
          <Reveal>
            <Eyebrow index="02" tone="cream">What we believe</Eyebrow>
            <Display className="mt-6 max-w-[18ch]">Three rules we <span className="italic text-rc-pistachio">don't break.</span></Display>
          </Reveal>
          <div className="mt-16 grid gap-12 md:grid-cols-3">
            {PRINCIPLES.map((p, i) => (
              <Reveal key={p.title} delay={i * 0.08} className="border-t border-white/15 pt-6">
                <p className="text-[12px] tabular-nums text-rc-mist">{String(i + 1).padStart(2, '0')}</p>
                <p className="mt-4 font-serif text-[28px] leading-tight">{p.title}</p>
                <p className="mt-3 text-[15px] leading-relaxed text-rc-mist">{p.body}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-24 lg:py-32">
        <Container className="flex flex-col items-start gap-8 lg:flex-row lg:items-end lg:justify-between">
          <Display size="md" className="max-w-[20ch] text-rc-ink">See how it works with <span className="italic text-rc-forest">your own cards.</span></Display>
          <div className="flex flex-wrap gap-3">
            <ButtonLink to={SIGN_UP} size="lg">Get started</ButtonLink>
            <ButtonLink to="/methodology" variant="outline" size="lg" arrow={false}>How we rank cards</ButtonLink>
          </div>
        </Container>
      </section>
    </>
  );
}
