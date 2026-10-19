import { SEO } from '../components/SEO';
import { getOrganizationSchema, getWebSiteSchema } from '../lib/schemaBuilders';
import { Hero } from '../components/landing/Hero';
import { Statement } from '../components/landing/Statement';
import { CardJobs } from '../components/landing/CardJobs';
import { PhoneReveal } from '../components/landing/PhoneReveal';
import { FeatureDeck } from '../components/landing/FeatureDeck';
import { TryIt } from '../components/landing/TryIt';
import { CardWall } from '../components/landing/CardWall';
import { Closer, FaqToggle, FloatingStart, TrustStatement } from '../components/landing/Closing';

/**
 * One idea per screen. Sections overlap with rounded tops, alternating forest and
 * cream: hero, manifesto, card jobs, the app, features, try it, the catalogue,
 * the fine print, then a card you can actually swipe.
 */
export function HomePage() {
  return (
    <div className="flex w-full flex-col bg-rc-night text-rc-cream">
      <SEO
        title="RenoCred | The right credit card for every spend"
        description="RenoCred has read the terms of 500+ Indian credit cards. Add the cards you own and it tells you which to swipe, tracks what you spend and reminds you before subscriptions renew."
        canonicalUrl="https://renocred.com/"
        schemaData={[getOrganizationSchema(), getWebSiteSchema()]}
      />
      <Hero />
      <Statement />
      <CardJobs />
      <PhoneReveal />
      <FeatureDeck />
      <TryIt />
      <CardWall />
      <TrustStatement />
      <Closer />
      <FaqToggle />
      <FloatingStart />
    </div>
  );
}
