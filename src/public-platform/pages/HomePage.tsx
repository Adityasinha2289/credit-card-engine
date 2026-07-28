import { SEO } from '../components/SEO';
import { HeroSection } from '../components/home/HeroSection';
import { InteractiveDemoSection } from '../components/home/InteractiveDemoSection';
import { WrongCardSection } from '../components/home/WrongCardSection';
import { ProductShowcaseSection } from '../components/home/ProductShowcaseSection';
import { HowTaqdeerThinksSection } from '../components/home/HowTaqdeerThinksSection';
import { TrustSection } from '../components/home/TrustSection';
import { RealSavingsSection } from '../components/home/RealSavingsSection';
import { CtaSection } from '../components/home/CtaSection';

export function HomePage() {
  return (
    <div className="flex-1 flex flex-col relative w-full bg-[#0A0A0A] text-white selection:bg-[#00E599]/30 font-sans">
      <SEO 
        title="RenoCred | The Intelligent Financial Operating System"
        description="RenoCred analyzes your cards, rewards, merchant offers and spending patterns to recommend the smartest payment option before every purchase."
        canonicalUrl="https://www.renocred.com/"
      />
      
      <main className="w-full flex flex-col">
        <HeroSection />
        <InteractiveDemoSection />
        <WrongCardSection />
        <ProductShowcaseSection />
        <HowTaqdeerThinksSection />
        <TrustSection />
        <RealSavingsSection />
        <CtaSection />
      </main>

      {/* Minimal Footer */}
      <footer className="w-full py-12 bg-[#050505] text-center border-t border-white/[0.04] text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} RenoCred. All rights reserved.</p>
      </footer>
    </div>
  );
}
