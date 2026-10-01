import { SEO } from '../components/SEO';
import { getOrganizationSchema, getWebSiteSchema } from '../lib/schemaBuilders';
import { InteractiveHero } from '../components/home/interactive-hero/InteractiveHero';
import { CardRolesSection } from '../components/home/card-roles/CardRolesSection';
import { RenoCredInActionSection } from '../components/home/RenoCredInActionSection';
import { CardsAndRewardsSection } from '../components/home/CardsAndRewardsSection';
import { MoneyAndLifestyleSection } from '../components/home/MoneyAndLifestyleSection';
import { PartnerOfferSection } from '../components/home/PartnerOfferSection';
import { TrustSection } from '../components/home/TrustSection';
import { CtaSection } from '../components/home/CtaSection';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { analytics } from '../../lib/analytics';

function PartnerAnnouncement() {
  const shouldReduceMotion = useReducedMotion();
  
  const handleClick = () => {
    analytics.track('Partner Offer Clicked', { partner: 'greenox' });
  };

  return (
    <motion.div 
      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full pt-[80px] bg-editorial-light-cream relative z-40"
    >
      <div className="w-full bg-[#F5F3E9] border-y border-editorial-soft-sage/30">
        <a 
          href="#greenox-offer"
          onClick={handleClick}
          className="flex items-center justify-between md:justify-center gap-3 md:gap-6 text-editorial-deep-forest group w-full max-w-7xl mx-auto px-5 py-3 md:py-0 md:h-[60px] cursor-pointer focus:outline-none focus:ring-2 focus:ring-editorial-forest/50 transition-colors hover:bg-[#F0EEE2]"
          aria-label="See GreeNox 20% off offer details"
        >
          <div className="w-10 h-10 flex items-center justify-center bg-white rounded-full overflow-hidden shrink-0 border border-editorial-soft-sage/40 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)]">
            <img 
              src="/greenox_logo.png" 
              alt="GreeNox" 
              className="w-[70%] h-[70%] object-contain" 
            />
          </div>

          <div className="hidden md:flex items-center gap-5">
            <span className="text-[11px] font-bold uppercase tracking-widest text-editorial-muted-sage whitespace-nowrap">
              RENO CRED × GREENOX
            </span>
            <div className="w-px h-4 bg-editorial-soft-sage/40 shrink-0" />
            <span className="text-[14px] font-medium text-editorial-deep-forest">
              Get <span className="font-bold">20% off</span> at GreeNox with RenoCred
            </span>
          </div>

          <div className="flex md:hidden flex-col justify-center flex-1 min-w-0 pr-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-editorial-muted-sage truncate">
              GreeNox × RenoCred
            </span>
            <span className="text-xs font-medium text-editorial-deep-forest truncate mt-0.5">
              Get <span className="font-bold">20% off</span> with RenoCred
            </span>
          </div>

          <div className="hidden md:block w-px h-4 bg-editorial-soft-sage/40 shrink-0" />

          <div className="flex items-center gap-1.5 text-xs md:text-sm font-semibold text-editorial-forest transition-transform duration-300 group-hover:translate-x-1 shrink-0">
            <span className="hidden sm:inline">See offer</span>
            <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
          </div>
        </a>
      </div>
    </motion.div>
  );
}

export function HomePage() {
  return (
    <div className="flex flex-col w-full bg-editorial-light-cream text-editorial-deep-forest selection:bg-editorial-soft-sage/30">
      <SEO 
        title="RenoCred | Intelligent Financial Optimization"
        description="RenoCred automatically tracks your spending, categorizes your expenses, and tells you exactly which card to use to maximize your rewards."
        canonicalUrl="https://renocred.com/"
        schemaData={[getOrganizationSchema(), getWebSiteSchema()]}
      />
      <PartnerAnnouncement />
      <InteractiveHero />
      <CardRolesSection />
      <RenoCredInActionSection />
      <CardsAndRewardsSection />
      <MoneyAndLifestyleSection />
      <PartnerOfferSection />
      <TrustSection />
      <CtaSection />
    </div>
  );
}
