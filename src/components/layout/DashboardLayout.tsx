import { type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { GlobalTaqdeerButton } from '../../features/taqdeer/components/GlobalTaqdeerButton';
import { TaqdeerDrawer } from '../../features/taqdeer/components/TaqdeerDrawer';
import { LayoutDashboard, CreditCard, Wallet, Gift, User } from 'lucide-react';
import { useState } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
//  DASHBOARD LAYOUT — Root wrapper with Sidebar + TopNav + Content
// ─────────────────────────────────────────────────────────────────────────────

interface DashboardLayoutProps {
  isDark: boolean;
  onToggleTheme: () => void;
  children: ReactNode;
}

const MOBILE_NAV = [
  { id: 'home',      path: '/app',          label: 'Home',      Icon: LayoutDashboard },
  { id: 'credit',    path: '/app/credit',   label: 'Credit',    Icon: CreditCard },
  { id: 'wallet',    path: '/app/wallet',   label: 'Wallet',    Icon: Wallet },
  { id: 'lifestyle', path: '/app/lifestyle',label: 'Lifestyle', Icon: Gift },
  { id: 'profile',   path: '/app/profile',  label: 'Profile',   Icon: User },
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
    <div className="bg-semantic-canvas min-h-[100dvh] w-full relative flex flex-col">
      {/* ── Atmospheric Background ─────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[radial-gradient(ellipse_at_center,_rgba(0,229,153,0.03)_0%,_transparent_70%)] rounded-full blur-[100px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[radial-gradient(ellipse_at_center,_rgba(4,77,51,0.08)_0%,_transparent_70%)] rounded-full blur-[120px]" />
      </div>

      {/* ── Desktop Sidebar ────────────────────────────────────────────── */}
      <Sidebar />

      {/* ── Main Content Area ──────────────────────────────────────────── */}
      <div className="flex flex-col min-h-[100dvh] lg:pl-[240px]">
        {/* Contextual Command Bar */}
        <TopNav />

        {/* Page content */}
        <main className="flex-1 flex flex-col pb-[80px] lg:pb-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
              className="flex-1 flex flex-col w-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* ── Mobile Bottom Navigation Bar ───────────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-[64px] bg-semantic-shell border-t border-semantic-border-subtle z-40 flex items-center justify-around px-2 pb-safe">
        {MOBILE_NAV.map((item) => {
          const isActive = isRouteActive(item.path, item.id === 'home');
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={cn(
                'flex flex-col items-center justify-center w-full h-full gap-1 transition-colors duration-150',
                isActive ? 'text-semantic-brand' : 'text-semantic-text-muted'
              )}
            >
              <item.Icon
                size={22}
                strokeWidth={isActive ? 2 : 1.5}
                className={cn(
                  'transition-colors duration-150',
                  isActive ? 'drop-shadow-[0_0_8px_rgba(0,229,153,0.3)]' : ''
                )}
              />
              <span className={cn('text-[10px] tracking-wide', isActive ? 'font-semibold' : 'font-medium')}>
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
