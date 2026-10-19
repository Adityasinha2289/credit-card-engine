/**
 * Signed-in pages live on the website: the same header, footer and look as every
 * other page. The header's logo goes home, its nav reaches every tool, and
 * "My RenoCred" brings you back here. On phones a tab bar keeps every section
 * one tap away, and Taqdeer opens from the page header instead of a floating
 * button that would sit over the content.
 */
import { Suspense, createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { PublicHeader } from '../../public-platform/components/PublicHeader';
import { PublicFooter } from '../../public-platform/components/PublicFooter';
import { GlobalTaqdeerButton } from '../../features/taqdeer/components/GlobalTaqdeerButton';
import { TaqdeerDrawer } from '../../features/taqdeer/components/TaqdeerDrawer';
import { MobileTabBar } from './MobileTabBar';
import { LoaderHold } from '../BrandLoader';

const AskContext = createContext<(() => void) | null>(null);

/** Opens Taqdeer, when inside the signed-in layout. */
export const useAskTaqdeer = () => useContext(AskContext);

/** The six sections, fetched while the first one is read so switching is instant. */
const SECTIONS = [
  () => import('../../pages/app/HomePage'),
  () => import('../../pages/app/WalletPage'),
  () => import('../../pages/app/money/MoneyManagerPage'),
  () => import('../../pages/app/DiscoverPage'),
  () => import('../../pages/marketplace/MarketplaceHome'),
  () => import('../../pages/app/AccountPage'),
];

export function SiteAppLayout({ children }: { children: ReactNode }) {
  const [askOpen, setAskOpen] = useState(false);
  useEffect(() => {
    const w = window as Window & { requestIdleCallback?: (cb: () => void) => number };
    const warm = () => SECTIONS.forEach((load) => void load().catch(() => undefined));
    const t = setTimeout(() => (w.requestIdleCallback ? w.requestIdleCallback(warm) : warm()), 1200);
    return () => clearTimeout(t);
  }, []);
  return (
    <AskContext.Provider value={() => setAskOpen(true)}>
      <div className="flex min-h-[100dvh] flex-col bg-rc-night pb-[calc(64px+env(safe-area-inset-bottom))] font-sans text-rc-cream selection:bg-rc-pistachio selection:text-rc-ink md:pb-0">
        <PublicHeader />
        <main className="flex flex-1 flex-col">
          <Suspense fallback={<LoaderHold />}>{children}</Suspense>
        </main>
        <PublicFooter />
        <div className="hidden md:block">
          <GlobalTaqdeerButton isOpen={askOpen} onClick={() => setAskOpen((o) => !o)} />
        </div>
        <MobileTabBar />
        <TaqdeerDrawer isOpen={askOpen} onClose={() => setAskOpen(false)} />
      </div>
    </AskContext.Provider>
  );
}
