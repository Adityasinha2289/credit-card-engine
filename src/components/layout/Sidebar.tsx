import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Wallet,
  CreditCard,
  Compass,
  User,
  Settings,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useDashboardStore } from '../../features/dashboard/store/dashboardStore';
import { useLocation, useNavigate } from 'react-router-dom';

const PRIMARY_NAV = [
  { id: 'home',      path: '/app',          label: 'Home',      Icon: LayoutDashboard },
  { id: 'credit',    path: '/app/credit',   label: 'Credit',    Icon: CreditCard },
  { id: 'wallet',    path: '/app/wallet',   label: 'Wallet',    Icon: Wallet },
  { id: 'lifestyle', path: '/app/lifestyle',label: 'Lifestyle', Icon: Compass },
];

const UTILITY_NAV = [
  { id: 'profile',   path: '/app/profile',  label: 'Profile',   Icon: User },
  { id: 'settings',  path: '/app/settings', label: 'Settings',  Icon: Settings },
];

export function Sidebar() {
  const profile = useDashboardStore((s) => s.profile);
  const location = useLocation();
  const navigate = useNavigate();

  const isRouteActive = (itemPath: string, exact: boolean = false) => {
    if (exact) {
      return location.pathname === itemPath || location.pathname === `${itemPath}/`;
    }
    return location.pathname.startsWith(itemPath);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const userName = profile?.name || "Aditya Sinha";
  const userInitials = getInitials(userName);

  return (
    <aside
      className="hidden lg:flex fixed top-0 left-0 h-screen w-[240px] z-40 flex-col bg-[#060A08]"
      aria-label="Main navigation"
    >
      {/* ── Brand Area ───────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-6 h-[88px] shrink-0">
        <div className="w-8 h-8 rounded-lg bg-semantic-brand/10 border border-semantic-brand/20 flex items-center justify-center shrink-0">
          <span className="text-semantic-brand font-display font-bold text-xl">R</span>
        </div>
        <h1 className="text-xl font-display font-medium text-semantic-text-primary tracking-tight">
          RenoCred
        </h1>
      </div>

      {/* ── Navigation ─────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto py-2 flex flex-col justify-between">
        <nav className="flex flex-col gap-1 w-full px-2">
          {PRIMARY_NAV.map((item) => {
            const isActive = isRouteActive(item.path, item.id === 'home');
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={cn(
                  'group relative flex items-center gap-4 px-4 py-3 transition-all duration-150 w-full rounded-xl',
                  isActive
                    ? 'bg-[#0D6B43]/15 text-semantic-text-primary'
                    : 'text-semantic-text-muted hover:text-semantic-text-primary hover:bg-semantic-surface-primary'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeSidebarNav"
                    className="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-semantic-brand"
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                  />
                )}
                <item.Icon
                  size={18}
                  strokeWidth={1.5}
                  className={cn(
                    'transition-colors duration-150',
                    isActive ? 'text-semantic-brand' : 'text-semantic-text-muted group-hover:text-semantic-text-secondary'
                  )}
                />
                <span className={cn('text-[13px] font-medium tracking-wide', isActive && 'font-medium')}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        <nav className="flex flex-col gap-1 w-full px-2 pb-6">
          {UTILITY_NAV.map((item) => {
            const isActive = isRouteActive(item.path);
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={cn(
                  'group relative flex items-center gap-4 px-4 py-3 transition-all duration-150 w-full rounded-xl',
                  isActive
                    ? 'bg-[#0D6B43]/15 text-semantic-text-primary'
                    : 'text-semantic-text-muted hover:text-semantic-text-primary hover:bg-semantic-surface-primary'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeSidebarNav"
                    className="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-semantic-brand"
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                  />
                )}
                <item.Icon
                  size={18}
                  strokeWidth={1.5}
                  className={cn(
                    'transition-colors duration-150',
                    isActive ? 'text-semantic-brand' : 'text-semantic-text-muted group-hover:text-semantic-text-secondary'
                  )}
                />
                <span className={cn('text-[13px] font-medium tracking-wide', isActive && 'font-medium')}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* ── User Profile ──────────────────────────────── */}
      <div className="px-4 pb-6 shrink-0 flex flex-col gap-2">
        {/* User Profile Block */}
        <button 
          onClick={() => navigate('/app/profile')}
          className="flex items-center gap-3 p-3 rounded-2xl hover:bg-semantic-surface-primary transition-colors text-left group"
        >
          <div className="w-9 h-9 rounded-full bg-[#10241A] text-semantic-brand flex items-center justify-center shrink-0 border border-semantic-brand/20 font-semibold text-xs tracking-wider">
            {userInitials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-semantic-text-primary truncate mb-0.5">
              {userName}
            </p>
            <p className="text-[10px] font-medium text-semantic-text-muted truncate group-hover:text-semantic-text-secondary transition-colors">
              View Profile →
            </p>
          </div>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
