import React, { type ReactNode, useState } from 'react';
import { motion } from 'framer-motion';
import { DashboardSkeleton } from './DashboardSkeleton';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { InAppProvider } from '../../public-platform/site/SiteLink';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { GlobalTaqdeerButton } from '../../features/taqdeer/components/GlobalTaqdeerButton';
import { TaqdeerDrawer } from '../../features/taqdeer/components/TaqdeerDrawer';
import { APP_NAV, sectionFor } from './appNav';

// ─────────────────────────────────────────────────────────────────────────────
//  DASHBOARD LAYOUT — Root wrapper with Sidebar + TopNav + Content
// ─────────────────────────────────────────────────────────────────────────────

interface DashboardLayoutProps {
  isDark: boolean;
  onToggleTheme: () => void;
  children: ReactNode;
}

export function DashboardLayout({
  isDark,
  onToggleTheme,
  children,
}: DashboardLayoutProps) {
  const [isTaqdeerOpen, setIsTaqdeerOpen] = useState(false);
  const { pathname } = useLocation();
  const section = sectionFor(pathname);

  return (
    // On wide screens the forest sidebar frames the app, and the workspace sits in it as a rounded cream sheet.
    <div className="relative flex min-h-[100dvh] w-full flex-col bg-semantic-canvas lg:bg-rc-night">

      {/* ── Desktop Sidebar ────────────────────────────────────────────── */}
      <Sidebar />

      {/* ── Main Content Area ──────────────────────────────────────────── */}
      <div className="flex min-h-[100dvh] flex-col lg:pl-[232px]">
        <div className="relative flex min-h-[100dvh] flex-1 flex-col bg-semantic-canvas lg:my-3 lg:mr-3 lg:min-h-[calc(100dvh-24px)] lg:overflow-clip lg:rounded-[36px]">
        {/* Contextual Command Bar */}
        <TopNav onAsk={() => setIsTaqdeerOpen(true)} />

        {/* Page content */}
        <main className="flex flex-1 flex-col pb-[96px] lg:pb-0">
          <React.Suspense fallback={<div className="p-6 md:p-12 w-full max-w-7xl mx-auto"><DashboardSkeleton /></div>}>
            <div className="flex-1 flex flex-col w-full animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
              <InAppProvider>{children}</InAppProvider>
            </div>
          </React.Suspense>
        </main>
        </div>
      </div>

      {/* ── Mobile: a floating dark capsule, like the website header ───────────────────── */}
      <nav className="fixed inset-x-3 bottom-3 z-40 flex h-[64px] items-center justify-around rounded-full border border-white/10 bg-rc-ink/95 px-1.5 shadow-[0_18px_40px_-16px_rgba(0,0,0,0.6)] backdrop-blur-xl lg:hidden">
        {APP_NAV.map((item) => {
          const isActive = section === item.id;
          return (
            <Link
              key={item.id}
              to={item.path}
              aria-current={isActive ? 'page' : undefined}
              className="relative flex h-[52px] flex-1 flex-col items-center justify-center rounded-full"
            >
              {isActive && (
                <motion.span layoutId="activeMobileNav" className="absolute inset-0 rounded-full bg-rc-pistachio" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />
              )}
              <item.Icon className={cn('relative h-5 w-5', isActive ? 'stroke-[2] text-rc-ink' : 'stroke-[1.5] text-rc-mist')} />
              <span className={cn('relative mt-0.5 text-[11px]', isActive ? 'font-semibold text-rc-ink' : 'font-medium text-rc-mist')}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* ── Global Taqdeer Layer ───────────────────────────────────────── */}
      <GlobalTaqdeerButton 
        isOpen={isTaqdeerOpen} 
        onClick={() => setIsTaqdeerOpen(!isTaqdeerOpen)} 
      />
      <TaqdeerDrawer 
        isOpen={isTaqdeerOpen} 
        onClose={() => setIsTaqdeerOpen(false)} 
      />
    </div>
  );
}

export default DashboardLayout;
