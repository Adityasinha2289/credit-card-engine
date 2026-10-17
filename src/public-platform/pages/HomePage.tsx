import { SEO } from '../components/SEO';
import { getOrganizationSchema, getWebSiteSchema } from '../lib/schemaBuilders';
import { Hero } from '../components/landing/Hero';
import { IssuerStrip } from '../components/landing/IssuerStrip';
import { Statement } from '../components/landing/Statement';
import { SwipeSimulator } from '../components/landing/SwipeSimulator';
import { ProductChapters } from '../components/landing/ProductChapters';
import { CardRail } from '../components/landing/CardRail';
import { ToolsGrid } from '../components/landing/ToolsGrid';
import { Perks } from '../components/landing/Perks';
import { Trust } from '../components/landing/Trust';
import { Faq } from '../components/landing/Faq';
import { FinalCta } from '../components/landing/FinalCta';

export function HomePage() {
  return (
    <div className="flex w-full flex-col bg-rc-cream text-rc-ink selection:bg-rc-pistachio">
      <SEO
        title="RenoCred | The right credit card for every spend"
        description="RenoCred knows the reward rules of 144 Indian credit cards. Add the cards you own and it tells you which to swipe, tracks what you spend and reminds you before subscriptions renew."
        canonicalUrl="https://renocred.com/"
        schemaData={[getOrganizationSchema(), getWebSiteSchema()]}
      />
      <Hero />
      <IssuerStrip />
      <Statement />
      <SwipeSimulator />
      <ProductChapters />
      <CardRail />
      <ToolsGrid />
      <Perks />
      <Trust />
      <Faq />
      <FinalCta />
    </div>
  );
}
