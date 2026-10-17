import { useEffect, useRef } from 'react';
import { useInView } from 'framer-motion';
import { ButtonLink, Container, Display, Eyebrow, Reveal } from '../../site/primitives';
import { SIGN_UP } from '../../site/nav';
import { analytics } from '../../../lib/analytics';

export function Perks() {
  const ref = useRef<HTMLElement>(null);
  const seen = useInView(ref, { once: true, amount: 0.4 });
  useEffect(() => { if (seen) analytics.track('Partner Section Viewed', { partner: 'greenox' }); }, [seen]);

  return (
    <section id="perks" ref={ref} className="scroll-mt-24 bg-rc-pistachio py-24 lg:py-32">
      <Container className="grid items-center gap-14 lg:grid-cols-12">
        <Reveal className="lg:col-span-6">
          <Eyebrow index="05">Member perks</Eyebrow>
          <Display size="md" className="mt-6 text-rc-ink">Good food. <span className="italic text-rc-forest">Better value.</span></Display>
          <p className="mt-6 max-w-[42ch] text-[17px] leading-relaxed text-rc-muted">
            RenoCred members get 20% off at GreeNox. More partner offers land in the app as we add them, matched to the cards you hold.
          </p>
          <ButtonLink
            to={SIGN_UP}
            className="mt-9"
            onClick={() => analytics.track('Partner Offer Clicked', { partner: 'greenox', placement: 'perks' })}
          >
            Join to claim the offer
          </ButtonLink>
        </Reveal>
        <Reveal delay={0.1} className="lg:col-span-5 lg:col-start-8">
          <div className="relative overflow-hidden rounded-[28px] bg-rc-paper p-10 text-center shadow-[0_30px_60px_-36px_rgba(10,31,21,0.45)]">
            <img src="/greenox_logo.png" alt="GreeNox" className="mx-auto h-14 w-auto object-contain" />
            <p className="mt-8 font-serif text-[clamp(5rem,10vw,8rem)] leading-[0.85] tracking-[-0.04em] text-rc-ink">20%</p>
            <p className="mt-3 text-[13px] font-semibold uppercase tracking-[0.2em] text-rc-muted">off at GreeNox</p>
            <div className="mt-8 border-t border-dashed border-rc-ink/20 pt-5 text-[13px] text-rc-muted">For RenoCred members · Terms apply</div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
