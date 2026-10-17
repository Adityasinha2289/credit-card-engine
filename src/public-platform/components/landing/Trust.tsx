import { Link } from 'react-router-dom';
import { Container, Display, Eyebrow, Reveal } from '../../site/primitives';

const COMMITMENTS = [
  {
    title: 'Never touches your credit score',
    body: "We don't pull credit reports. Eligibility estimates use the income and score range you choose to share.",
  },
  {
    title: 'No full card numbers',
    body: 'You pick your cards from our catalogue. At most we ask for the last four digits, to match your SMS alerts.',
  },
  {
    title: 'Locked to your account',
    body: 'Every row of your data is readable only by you, enforced inside the database itself, not just the app.',
  },
  {
    title: 'Rankings you can check',
    body: 'Cards are ordered by value to you. How we rank is public, and partner relationships are disclosed.',
  },
];

const LINKS = [
  { label: 'How we rank cards', to: '/methodology' },
  { label: 'Editorial policy', to: '/editorial-policy' },
  { label: 'Affiliate disclosure', to: '/affiliate-disclosure' },
  { label: 'Privacy', to: '/privacy' },
];

export function Trust() {
  return (
    <section className="bg-rc-night py-28 text-rc-cream lg:py-40">
      <Container>
        <Reveal className="max-w-3xl">
          <Eyebrow index="06" tone="cream">Trust</Eyebrow>
          <Display className="mt-6">Your money data <span className="italic text-rc-pistachio">is yours.</span></Display>
        </Reveal>
        <div className="mt-16 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {COMMITMENTS.map((c, i) => (
            <Reveal key={c.title} delay={i * 0.06} className="border-t border-white/15 pt-6">
              <p className="text-[12px] tabular-nums text-rc-mist">{String(i + 1).padStart(2, '0')}</p>
              <p className="mt-4 font-serif text-[24px] leading-tight">{c.title}</p>
              <p className="mt-3 text-[15px] leading-relaxed text-rc-mist">{c.body}</p>
            </Reveal>
          ))}
        </div>
        <div className="mt-16 flex flex-wrap gap-x-8 gap-y-3 text-[14px]">
          {LINKS.map((l) => (
            <Link key={l.to} to={l.to} className="text-rc-mist underline decoration-white/20 underline-offset-[6px] transition-colors hover:text-rc-cream hover:decoration-white/60">{l.label}</Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
