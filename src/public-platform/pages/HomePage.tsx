import { SEO } from '../components/SEO';
import { getOrganizationSchema, getWebSiteSchema } from '../lib/schemaBuilders';
import { HeroSection } from '../components/home/HeroSection';
import { WhatItDoesSection } from '../components/home/WhatItDoesSection';
import { SmartRecommendations } from '../components/home/SmartRecommendations';
import { TrustSection } from '../components/home/TrustSection';
import { CtaSection } from '../components/home/CtaSection';

export function HomePage() {
  return (
    <div className="flex-1 flex flex-col relative w-full bg-[#050505] text-white selection:bg-brand-emerald-glow font-sans">
      <SEO 
        title="RenoCred | Intelligent Financial Optimization"
        description="RenoCred understands your cards, spending, and financial preferences to provide personalized recommendations. Stop leaving money on the table."
        canonicalUrl="https://renocred.com/"
        schemaData={[getOrganizationSchema(), getWebSiteSchema()]}
      />
      
      <main className="w-full flex flex-col">
        <HeroSection />
        <WhatItDoesSection />
        <SmartRecommendations />
        <TrustSection />
        <CtaSection />
      </main>
    </div>
  );
}
