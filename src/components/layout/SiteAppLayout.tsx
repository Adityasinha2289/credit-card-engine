/**
 * Signed-in pages live on the website: the same header, footer and look as every
 * other page. The header's logo goes home, its nav reaches every tool, and
 * "My RenoCred" brings you back here.
 */
import { Suspense, useState, type ReactNode } from 'react';
import { PublicHeader } from '../../public-platform/components/PublicHeader';
import { PublicFooter } from '../../public-platform/components/PublicFooter';
import { GlobalTaqdeerButton } from '../../features/taqdeer/components/GlobalTaqdeerButton';
import { TaqdeerDrawer } from '../../features/taqdeer/components/TaqdeerDrawer';

export function SiteAppLayout({ children }: { children: ReactNode }) {
  const [askOpen, setAskOpen] = useState(false);
  return (
    <div className="flex min-h-[100dvh] flex-col bg-rc-night font-sans text-rc-cream selection:bg-rc-pistachio selection:text-rc-ink">
      <PublicHeader />
      <main className="flex flex-1 flex-col">
        <Suspense fallback={<PageSkeleton />}>{children}</Suspense>
      </main>
      <PublicFooter />
      <GlobalTaqdeerButton isOpen={askOpen} onClick={() => setAskOpen((o) => !o)} />
      <TaqdeerDrawer isOpen={askOpen} onClose={() => setAskOpen(false)} />
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="mx-auto w-full max-w-[1280px] px-5 pb-20 pt-10 sm:px-8 lg:px-12">
        <div className="h-3 w-24 animate-pulse rounded-full bg-white/10" />
        <div className="mt-6 h-12 w-2/3 max-w-xl animate-pulse rounded-2xl bg-white/10" />
      </div>
      <div className="flex-1 rounded-t-[40px] bg-rc-cream lg:rounded-t-[56px]" />
    </div>
  );
}
