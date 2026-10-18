import React, { type ReactNode, useState } from 'react';
import { motion } from 'framer-motion';
import { DashboardSkeleton } from './DashboardSkeleton';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { GlobalTaqdeerButton } from '../../features/taqdeer/components/GlobalTaqdeerButton';
import { TaqdeerDrawer } from '../../features/taqdeer/components/TaqdeerDrawer';
import { Squares2X2Icon, CreditCardIcon, WalletIcon, ShoppingBagIcon, UserCircleIcon } from '@heroicons/react/24/outline';

// ─────────────────────────────────────────────────────────────────────────────
//  DASHBOARD LAYOUT — Root wrapper with Sidebar + TopNav + Content
// ─────────────────────────────────────────────────────────────────────────────

interface DashboardLayoutProps {
  isDark: boolean;
  onToggleTheme: () => void;
  children: ReactNode;
}

const MOBILE_NAV = [
  { id: 'home',        path: '/app',            label: 'Home',        Icon: Squares2X2Icon },
  { id: 'credit',      path: '/app/credit',     label: 'Credit',      Icon: CreditCardIcon },
  { id: 'wallet',      path: '/app/wallet',     label: 'Wallet',      Icon: WalletIcon },
  { id: 'money',       path: '/app/money',      label: 'Money',       Icon: ShoppingBagIcon },
  { id: 'profile',     path: '/app/profile',    label: 'Profile',     Icon: UserCircleIcon },
];

export function DashboardLayout({
  isDark,
  onToggleTheme,
  children,
}: DashboardLayoutProps) {
  const [isTaqdeerOpen, setIsTaqdeerOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isRouteActive = (itemPath: string, exact: boolean = false) => {
    if (exact) {
      return location.pathname === itemPath || location.pathname === `${itemPath}/`;
    }
    return location.pathname.startsWith(itemPath);
  };

  return (
    // On wide screens the forest sidebar frames the app, and the workspace sits in it as a rounded cream sheet.
    <div className="relative flex min-h-[100dvh] w-full flex-col bg-semantic-canvas lg:bg-rc-night">

      {/* ── Desktop Sidebar ────────────────────────────────────────────── */}
      <Sidebar />

      {/* ── Main Content Area ──────────────────────────────────────────── */}
      <div className="flex min-h-[100dvh] flex-col lg:pl-[240px]">
        <div className="relative flex min-h-[100dvh] flex-1 flex-col bg-semantic-canvas lg:my-3 lg:mr-3 lg:min-h-[calc(100dvh-24px)] lg:overflow-clip lg:rounded-[36px]">
        {/* Contextual Command Bar */}
        <TopNav />

        {/* Page content */}
        <main className="flex flex-1 flex-col pb-[96px] lg:pb-0">
          <React.Suspense fallback={<div className="p-6 md:p-12 w-full max-w-7xl mx-auto"><DashboardSkeleton /></div>}>
            <div className="flex-1 flex flex-col w-full animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
              {children}
            </div>
          </React.Suspense>
        </main>
        </div>
      </div>

      {/* ── Mobile: a floating dark capsule, like the website header ───────────────────── */}
      <nav className="fixed inset-x-3 bottom-3 z-40 flex h-[64px] items-center justify-around rounded-full border border-white/10 bg-rc-ink/95 px-1.5 shadow-[0_18px_40px_-16px_rgba(0,0,0,0.6)] backdrop-blur-xl lg:hidden">
        {MOBILE_NAV.map((item) => {
          const isActive = isRouteActive(item.path, item.id === 'home');
          return (
            <button
              key={item.id}
              onClick={() => navigate({ pathname: item.path, search: location.search })}
              aria-current={isActive ? 'page' : undefined}
              className="relative flex h-[52px] flex-1 flex-col items-center justify-center rounded-full"
            >
              {isActive && (
                <motion.span
                  layoutId="activeMobileNav"
                  className="absolute inset-0 rounded-full bg-rc-pistachio"
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                />
              )}
              <item.Icon className={cn('relative h-5 w-5', isActive ? 'stroke-[2] text-rc-ink' : 'stroke-[1.5] text-rc-mist')} />
              <span className={cn('relative mt-0.5 text-[10px] tracking-wide', isActive ? 'font-semibold text-rc-ink' : 'font-medium text-rc-mist')}>
                {item.label}
              </span>
            </button>
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
