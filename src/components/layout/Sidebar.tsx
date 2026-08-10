import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Wallet,
  CreditCard,
  Gift,
  User,
  LogOut,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useDashboardStore } from '../../features/dashboard/store/dashboardStore';
import { useLocation, useNavigate } from 'react-router-dom';
import { useClerk } from '@clerk/clerk-react';

const PRIMARY_NAV = [
  { id: 'home',      path: '/app',          label: 'Home',      Icon: LayoutDashboard },
  { id: 'credit',    path: '/app/credit',   label: 'Credit',    Icon: CreditCard },
  { id: 'wallet',    path: '/app/wallet',   label: 'Wallet',    Icon: Wallet },
  { id: 'lifestyle', path: '/app/lifestyle',label: 'Lifestyle', Icon: Gift },
];

const UTILITY_NAV = [
  { id: 'profile',   path: '/app/profile',  label: 'Profile',   Icon: User },
];

export function Sidebar() {
  const profile = useDashboardStore((s) => s.profile);
  const logout = useDashboardStore((s) => s.logout);
  const { signOut } = useClerk();
  const location = useLocation();
  const navigate = useNavigate();

  const isRouteActive = (itemPath: string, exact: boolean = false) => {
    if (exact) {
      return location.pathname === itemPath || location.pathname === `${itemPath}/`;
    }
    return location.pathname.startsWith(itemPath);
  };

  return (
    <aside
      className="hidden lg:flex fixed top-0 left-0 h-screen w-[240px] z-40 flex-col bg-semantic-shell border-r border-semantic-border-subtle"
      aria-label="Main navigation"
    >
      {/* ── Brand Area ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col justify-center px-6 h-[72px] shrink-0 border-b border-semantic-border-subtle">
        <h1 className="text-xl font-display font-bold text-semantic-text-primary tracking-tight">
          renocred
        </h1>
        <p className="text-[9px] font-medium text-semantic-text-muted tracking-widest uppercase mt-0.5">
          Financial Intelligence
        </p>
      </div>

      {/* ── Navigation ─────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-8">
        
        {/* Primary */}
        <nav className="flex flex-col gap-1">
          <p className="px-6 text-[10px] font-semibold tracking-widest uppercase text-semantic-text-muted mb-2">
            Workspace
          </p>
          {PRIMARY_NAV.map((item) => {
            const isActive = isRouteActive(item.path, item.id === 'home');
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={cn(
                  'group relative flex items-center gap-3 px-6 py-2.5 transition-all duration-150',
                  isActive
                    ? 'bg-semantic-surface-intelligence text-semantic-text-primary'
                    : 'text-semantic-text-muted hover:text-semantic-text-primary hover:bg-semantic-surface-primary'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeSidebarNav"
                    className="absolute left-0 top-0 bottom-0 w-[3px] bg-semantic-brand"
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                  />
                )}
                <item.Icon
                  size={18}
                  strokeWidth={isActive ? 2 : 1.5}
                  className={cn(
                    'transition-colors duration-150',
                    isActive ? 'text-semantic-brand drop-shadow-[0_0_8px_rgba(0,229,153,0.3)]' : 'text-semantic-text-muted group-hover:text-semantic-text-secondary'
                  )}
                />
                <span className={cn('text-sm font-medium tracking-wide', isActive && 'font-semibold')}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Utility */}
        <nav className="flex flex-col gap-1">
          <p className="px-6 text-[10px] font-semibold tracking-widest uppercase text-semantic-text-muted mb-2">
            System
          </p>
          {UTILITY_NAV.map((item) => {
            const isActive = isRouteActive(item.path);
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={cn(
                  'group relative flex items-center gap-3 px-6 py-2.5 transition-all duration-150',
                  isActive
                    ? 'bg-semantic-surface-intelligence text-semantic-text-primary'
                    : 'text-semantic-text-muted hover:text-semantic-text-primary hover:bg-semantic-surface-primary'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeSidebarNav"
                    className="absolute left-0 top-0 bottom-0 w-[3px] bg-semantic-brand"
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                  />
                )}
                <item.Icon
                  size={18}
                  strokeWidth={isActive ? 2 : 1.5}
                  className={cn(
                    'transition-colors duration-150',
                    isActive ? 'text-semantic-brand drop-shadow-[0_0_8px_rgba(0,229,153,0.3)]' : 'text-semantic-text-muted group-hover:text-semantic-text-secondary'
                  )}
                />
                <span className={cn('text-sm font-medium tracking-wide', isActive && 'font-semibold')}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* ── User Profile ──────────────────────────────── */}
      <div className="p-4 border-t border-semantic-border-subtle shrink-0 bg-semantic-shell">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-semantic-surface-primary transition-colors cursor-pointer group">
          <div className="w-8 h-8 rounded-full bg-semantic-surface-elevated overflow-hidden shrink-0 border border-semantic-border-subtle group-hover:border-semantic-brand transition-colors">
            <img
              src={profile?.avatar || "https://api.dicebear.com/7.x/notionists/svg?seed=Atharva&backgroundColor=f8f9fa"}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-semantic-text-primary truncate">
              {profile?.name || "Atharva Kulkarni"}
            </p>
            <p className="text-[10px] font-medium text-semantic-text-muted uppercase tracking-widest truncate">
              {profile ? `Score: ${profile.creditScore}` : "Premium Member"}
            </p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); logout(); signOut(); }}
            className="text-semantic-text-muted hover:text-red-400 p-1 transition-colors"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
