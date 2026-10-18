import { SEO } from '../components/SEO';
import { ButtonLink, Container, Display, Eyebrow, Reveal } from '../site/primitives';
import { PageBody, PageHero } from '../site/PageHero';

const SPLIT = [
  { label: 'RenoCred distribution', detail: 'Website, social, content', value: 40, cls: 'bg-rc-ink' },
  { label: 'Customer incentive', detail: 'Discount, coupon, exclusive offer', value: 30, cls: 'bg-rc-forest' },
  { label: 'Brand saving', detail: 'Stays with you', value: 30, cls: 'bg-rc-emerald' },
];

const CAPABILITIES = [
  { k: 'Website', v: 'Your brand and offer placed where RenoCred members look for value.' },
  { k: 'Social', v: 'Campaign amplification across our channels.' },
  { k: 'Content', v: 'Creative built in-house, in the RenoCred voice.' },
  { k: 'Offers', v: 'Customer incentives matched to the cards and categories members use.' },
  { k: 'Tracking', v: 'Clicks, redemptions and conversions, measured end to end.' },
];

const PILOT = ['Define CAC', 'Set budget', 'Create offer', 'Launch', 'Measure', 'Scale'];

const WINS = [
  { who: 'Brand', points: ['More efficient acquisition', 'A new distribution channel'] },
  { who: 'Customer', points: ['Exclusive value', 'Offers that fit how they spend'] },
  { who: 'RenoCred', points: ['A lasting acquisition partnership', 'Sustainable revenue'] },
];

const PARTNER = '/contact?intent=partner';

export function BusinessPartnerPage() {
  return (
    <div className="flex w-full flex-1 flex-col">
      <SEO
        title="RenoCred for Business | Customer Acquisition Partnerships"
        description="Turn your customer acquisition budget into a measurable growth channel with RenoCred: distribution, customer incentives and tracking in one partnership."
        canonicalUrl="https://renocred.com/business"
      />

      <PageHero
        eyebrow="RenoCred for business"
        title={<>Acquire customers. <span className="italic">Spend less.</span> Grow more.</>}
        lede="Turn your customer acquisition budget into a measurable growth channel."
        actions={(
          <>
            <ButtonLink to={PARTNER} variant="cream" size="lg">Become a partner</ButtonLink>
            <ButtonLink href="#how-it-works" variant="outline-cream" size="lg" arrow={false}>See how it works</ButtonLink>
          </>
        )}
        aside={(
          <div className="relative overflow-hidden rounded-[40px] bg-rc-pistachio p-8 text-rc-ink">
            <div aria-hidden className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/50 blur-2xl" />
            <p className="relative flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-rc-ink/60">
              <span className="relative flex h-2 w-2"><span className="absolute inset-0 animate-ping rounded-full bg-rc-emerald/60" /><span className="relative h-2 w-2 rounded-full bg-rc-emerald" /></span>
              Live partnership
            </p>
            <span className="relative mt-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white"><img src="/greenox_logo.png" alt="GreeNox" className="h-11 w-11 object-contain" /></span>
            <p className="relative mt-6 font-serif text-[64px] font-semibold leading-none tracking-[-0.03em]">20%</p>
            <p className="relative mt-2 text-[16px] text-rc-ink/75">off at GreeNox for RenoCred members</p>
          </div>
        )}
      />

      <PageBody>
      <section id="how-it-works" className="scroll-mt-24 py-24 lg:py-32">
        <Container>
          <Reveal className="max-w-3xl">
            <Eyebrow index="01">The model</Eyebrow>
            <Display className="mt-6 text-rc-ink">Every customer has a cost. <span className="italic text-rc-forest">We change how it is spent.</span></Display>
            <p className="mt-6 max-w-[54ch] text-[17px] leading-relaxed text-rc-muted">Brands spend on ads, influencers, agencies, content and discounts to win a customer. Here is the same ₹100 of acquisition spend, two ways.</p>
          </Reveal>

          <div className="mt-16 space-y-12">
            <Reveal>
              <div className="mb-3 flex items-baseline justify-between text-[14px]"><span className="font-medium text-rc-ink">Traditional</span><span className="text-rc-muted">₹100 to ads, content, influencers and platforms</span></div>
              <div className="flex h-14 overflow-hidden rounded-2xl bg-rc-ink/10"><div className="flex w-full items-center px-5 text-[14px] text-rc-muted">Paid reach, clicks, maybe a customer</div></div>
            </Reveal>
            <Reveal delay={0.08}>
              <div className="mb-3 flex items-baseline justify-between text-[14px]"><span className="font-medium text-rc-ink">With RenoCred</span><span className="text-rc-muted">₹100, split three ways</span></div>
              <div className="flex h-14 overflow-hidden rounded-2xl">
                {SPLIT.map((s) => (
                  <div key={s.label} className={`${s.cls} flex items-center px-5 text-[14px] font-medium text-rc-cream`} style={{ width: `${s.value}%` }}>₹{s.value}</div>
                ))}
              </div>
              <dl className="mt-6 grid gap-6 sm:grid-cols-3">
                {SPLIT.map((s) => (
                  <div key={s.label} className="flex gap-3">
                    <span className={`${s.cls} mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full`} />
                    <div>
                      <dt className="text-[15px] font-medium text-rc-ink">{s.label}</dt>
                      <dd className="text-[14px] text-rc-muted">{s.detail}</dd>
                    </div>
                  </div>
                ))}
              </dl>
            </Reveal>
            <p className="text-[12px] text-rc-muted">Illustrative model. Actual commercial terms and savings vary by campaign.</p>
          </div>
        </Container>
      </section>

      <section className="mx-3 rounded-[40px] bg-rc-ink py-24 text-rc-cream sm:mx-5 lg:rounded-[56px] lg:py-32 2xl:mx-auto 2xl:max-w-[1360px]">
        <Container>
          <Reveal className="max-w-3xl">
            <Eyebrow index="02" tone="cream">What we handle</Eyebrow>
            <Display className="mt-6">One partnership. <span className="italic text-rc-pistachio">One acquisition layer.</span></Display>
          </Reveal>
          <div className="mt-16 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-5">
            {CAPABILITIES.map((c, i) => (
              <Reveal key={c.k} delay={i * 0.05} className="border-t border-white/15 pt-6">
                <p className="text-[12px] tabular-nums text-rc-mist">{String(i + 1).padStart(2, '0')}</p>
                <p className="mt-4 font-serif text-[24px] leading-tight">{c.k}</p>
                <p className="mt-3 text-[14px] leading-relaxed text-rc-mist">{c.v}</p>
              </Reveal>
            ))}
          </div>
          <p className="mt-20 max-w-[24ch] font-serif text-[clamp(2rem,4vw,3.5rem)] leading-[1.05]">
            You're not buying impressions. <span className="italic text-rc-pistachio">You're building another path to the customer.</span>
          </p>
        </Container>
      </section>

      <section className="py-24 lg:py-32">
        <Container>
          <Reveal className="max-w-3xl">
            <Eyebrow index="03">How we start</Eyebrow>
            <Display className="mt-6 text-rc-ink">Start with a pilot. <span className="italic text-rc-forest">Scale with proof.</span></Display>
            <p className="mt-6 max-w-[54ch] text-[17px] leading-relaxed text-rc-muted">We don't ask brands to move their whole marketing budget. We start small, measure the economics, and scale what works.</p>
          </Reveal>
          <ol className="mt-16 grid gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
            {PILOT.map((step, i) => (
              <Reveal as="li" key={step} delay={i * 0.06} className="rounded-[24px] border border-rc-ink/10 bg-rc-paper p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-rc-ink font-serif text-[16px] font-semibold text-rc-pistachio tabular-nums">{i + 1}</span>
                <p className="mt-8 font-serif text-[20px] font-semibold leading-snug text-rc-ink">{step}</p>
              </Reveal>
            ))}
          </ol>
        </Container>
      </section>

      <section className="py-24 lg:py-32">
        <Container className="grid gap-14 lg:grid-cols-12">
          <Reveal className="lg:col-span-4">
            <Eyebrow index="04">Why it works</Eyebrow>
            <Display size="md" className="mt-6 text-rc-ink">Everyone wins when <span className="italic text-rc-forest">the economics work.</span></Display>
          </Reveal>
          <div className="grid gap-10 sm:grid-cols-3 lg:col-span-7 lg:col-start-6">
            {WINS.map((w) => (
              <div key={w.who} className="border-t border-rc-ink/15 pt-6">
                <p className="font-serif text-[26px] text-rc-ink">{w.who}</p>
                <ul className="mt-4 space-y-2 text-[15px] text-rc-muted">
                  {w.points.map((p) => <li key={p}>{p}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="mx-3 mb-24 rounded-[40px] bg-rc-ink py-28 text-center text-rc-cream sm:mx-5 lg:mb-32 lg:rounded-[56px] lg:py-36 2xl:mx-auto 2xl:max-w-[1360px]">
        <Container>
          <Display className="mx-auto max-w-[16ch]">Your next customer could come <span className="italic text-rc-pistachio">through RenoCred.</span></Display>
          <p className="mx-auto mt-7 max-w-[40ch] text-[18px] text-rc-mist">Let's build an acquisition channel that works for both sides.</p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <ButtonLink to={PARTNER} variant="cream" size="lg">Become a partner</ButtonLink>
            <ButtonLink to="/contact" variant="outline-cream" size="lg" arrow={false}>Talk to the team</ButtonLink>
          </div>
        </Container>
      </section>
      </PageBody>
    </div>
  );
}
