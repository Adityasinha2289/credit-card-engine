import { ButtonLink, Container, Display, Reveal } from '../../site/primitives';
import { CardFace } from '../../site/CardFace';
import { SIGN_UP } from '../../site/nav';

export function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-rc-ink py-32 text-rc-cream lg:py-44">
      {/* two cards drifting at the edges frame the headline */}
      <div aria-hidden className="pointer-events-none absolute -left-24 top-16 hidden rotate-[14deg] opacity-80 lg:block">
        <CardFace name="Axis Bank ATLAS Credit Card" bank="AXIS" width={300} />
      </div>
      <div aria-hidden className="pointer-events-none absolute -right-20 bottom-14 hidden rotate-[-12deg] opacity-80 lg:block">
        <CardFace name="Swiggy HDFC" bank="HDFC" width={300} />
      </div>
      <Container className="relative text-center">
        <Reveal>
          <Display size="xl" className="mx-auto max-w-[12ch]">Make every swipe <span className="italic text-rc-pistachio">count.</span></Display>
          <p className="mx-auto mt-8 max-w-[40ch] text-[18px] leading-relaxed text-rc-mist">Free to use. Add your cards in about a minute and see what each one is really for.</p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <ButtonLink to={SIGN_UP} variant="cream" size="lg">Get started</ButtonLink>
            <ButtonLink to="/cards" variant="outline-cream" size="lg" arrow={false}>Explore cards</ButtonLink>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
