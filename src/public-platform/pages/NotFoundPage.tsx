import { SEO } from '../components/SEO';
import { ButtonLink, Container, Eyebrow } from '../site/primitives';
import { CardFace } from '../site/CardFace';

export function NotFoundPage() {
  return (
    <section className="flex flex-1 items-center py-24 lg:py-32">
      <SEO
        title="Page Not Found | RenoCred"
        description="The page you are looking for does not exist."
        canonicalUrl="https://renocred.com/404"
        robotsDirective="noindex, nofollow"
      />
      <Container className="grid items-center gap-16 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <Eyebrow>Error 404</Eyebrow>
          <h1 className="mt-6 font-serif text-[clamp(3rem,7vw,6rem)] font-medium leading-[0.95] tracking-[-0.03em] text-rc-ink">
            This card <span className="italic text-rc-forest">was declined.</span>
          </h1>
          <p className="mt-7 max-w-[44ch] text-[18px] leading-relaxed text-rc-muted">
            The page you are looking for doesn't exist or has moved. Try the card directory, or head back home.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <ButtonLink to="/" size="lg">Back to home</ButtonLink>
            <ButtonLink to="/cards" variant="outline" size="lg" arrow={false}>Browse cards</ButtonLink>
          </div>
        </div>
        <div aria-hidden className="hidden justify-center lg:col-span-5 lg:flex">
          <div className="rotate-[-8deg] opacity-90 grayscale">
            <CardFace name="Not Found" bank="RenoCred" width={340} />
          </div>
        </div>
      </Container>
    </section>
  );
}
