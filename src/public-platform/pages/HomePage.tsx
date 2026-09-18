import { SEO } from '../components/SEO';
import { getOrganizationSchema, getWebSiteSchema } from '../lib/schemaBuilders';
import { HeroSection } from '../components/home/HeroSection';
import { WhatItDoesSection } from '../components/home/WhatItDoesSection';
import { RenoCredInActionSection } from '../components/home/RenoCredInActionSection';
import { CardsAndRewardsSection } from '../components/home/CardsAndRewardsSection';
import { MoneyAndLifestyleSection } from '../components/home/MoneyAndLifestyleSection';
import { TrustSection } from '../components/home/TrustSection';
import { CtaSection } from '../components/home/CtaSection';

export function HomePage() {
  return (
    <div className="flex flex-col w-full bg-black text-white selection:bg-semantic-brand/30">
      <SEO 
        title="RenoCred | Intelligent Financial Optimization"
        description="RenoCred automatically tracks your spending, categorizes your expenses, and tells you exactly which card to use to maximize your rewards."
        canonicalUrl="https://renocred.com/"
        schemaData={[getOrganizationSchema(), getWebSiteSchema()]}
      />
      
      <HeroSection />
      <WhatItDoesSection />
      <RenoCredInActionSection />
      <CardsAndRewardsSection />
      <MoneyAndLifestyleSection />
      <TrustSection />
      <CtaSection />
    </div>
  );
}
