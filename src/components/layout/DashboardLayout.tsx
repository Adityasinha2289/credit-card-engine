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
  { id: 'home',        path: '/app',            label: 'Home',        Icon: LayoutDashboard },
  { id: 'credit',      path: '/app/credit',     label: 'Credit',      Icon: CreditCard },
  { id: 'wallet',      path: '/app/wallet',     label: 'Wallet',      Icon: Wallet },
  { id: 'marketplace', path: '/app/marketplace', label: 'Marketplace', Icon: Gift },
  { id: 'profile',     path: '/app/profile',    label: 'Profile',     Icon: User },
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
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-[radial-gradient(ellipse_at_center,_rgba(25,184,106,0.03)_0%,_transparent_70%)] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-[20%] w-[60%] h-[60%] bg-[radial-gradient(ellipse_at_center,_rgba(13,107,67,0.05)_0%,_transparent_70%)] rounded-full blur-[140px]" />
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

      {/* ── Mobile Bottom Navigation Bar (10/10 Premium) ───────────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-[68px] bg-white/80 backdrop-blur-xl border-t border-gray-200 z-40 flex items-center justify-around px-2 pb-safe shadow-[0_-8px_30px_rgba(0,0,0,0.04)]">
        {MOBILE_NAV.map((item) => {
          const isActive = isRouteActive(item.path, item.id === 'home');
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className="relative flex flex-1 flex-col items-center justify-center h-full transition-all duration-300 group"
            >
              {/* Animated Top Indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeMobileNav"
                  className="absolute top-0 w-10 h-1 bg-[#2A9D5C] rounded-b-full shadow-[0_2px_8px_rgba(42,157,92,0.4)]"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}

              {/* Icon Container with subtle active background */}
              <div className={cn(
                "relative p-1.5 rounded-xl transition-all duration-300",
                isActive ? "bg-[#2A9D5C]/5 mt-1" : "group-hover:bg-gray-50"
              )}>
                <item.Icon
                  size={24}
                  strokeWidth={isActive ? 2.5 : 1.5}
                  className={cn(
                    'transition-all duration-300',
                    isActive ? 'text-[#2A9D5C]' : 'text-gray-400 group-hover:text-gray-600'
                  )}
                />
              </div>

              {/* Label */}
              <span className={cn(
                'text-[10px] tracking-wide transition-all duration-300 mt-0.5',
                isActive ? 'font-bold text-[#2A9D5C]' : 'font-medium text-gray-400'
              )}>
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
