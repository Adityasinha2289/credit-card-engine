import { motion } from 'framer-motion';
import {
  Squares2X2Icon,
  CreditCardIcon,
  WalletIcon,
  ShoppingBagIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  MapIcon,
  WrenchScrewdriverIcon,
  RectangleStackIcon,
  ArrowUpRightIcon,
} from '@heroicons/react/24/outline';
import { cn } from '../../lib/utils';
import { useDashboardStore } from '../../features/dashboard/store/dashboardStore';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { Wordmark } from '../../public-platform/site/Brand';

const PRIMARY_NAV = [
  { id: 'home',      path: '/app',          label: 'Home',      Icon: Squares2X2Icon },
  { id: 'credit',    path: '/app/credit',   label: 'Credit',    Icon: CreditCardIcon },
  { id: 'wallet',    path: '/app/wallet',   label: 'Wallet',    Icon: WalletIcon },
  { id: 'money',     path: '/app/money',    label: 'Money',     Icon: ShoppingBagIcon },
  { id: 'tools',     path: '/app/tools',    label: 'Tools',     Icon: WrenchScrewdriverIcon },
  { id: 'cards',     path: '/app/cards',    label: 'Cards',     Icon: RectangleStackIcon },
  { id: 'plan',      path: '/app/plan',     label: 'Plan',      Icon: MapIcon },
  { id: 'marketplace', path: '/app/marketplace', label: 'Marketplace', Icon: ShoppingBagIcon },
];

const UTILITY_NAV = [
  { id: 'profile',   path: '/app/profile',  label: 'Profile',   Icon: UserCircleIcon },
  { id: 'settings',  path: '/app/settings', label: 'Settings',  Icon: Cog6ToothIcon },
];

export function Sidebar() {
  const profile = useDashboardStore((s) => s.profile);
  const { isLoaded, user } = useUser();
  const location = useLocation();
  const navigate = useNavigate();

  const isRouteActive = (itemPath: string, exact: boolean = false) => {
    if (exact) {
      return location.pathname === itemPath || location.pathname === `${itemPath}/`;
    }
    return location.pathname.startsWith(itemPath);
  };

  const getInitials = (name: string) => {
    if (!name) return '';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const userName = profile?.name || (isLoaded && user ? user.fullName || user.firstName : '') || '';
  const userInitials = getInitials(userName);

  const item = (entry: (typeof PRIMARY_NAV)[number], exact: boolean) => {
    const isActive = isRouteActive(entry.path, exact);
    return (
      <button
        key={entry.id}
        onClick={() => navigate({ pathname: entry.path, search: location.search })}
        aria-current={isActive ? 'page' : undefined}
        className={cn(
          'group relative flex w-full items-center gap-3.5 rounded-full px-4 py-2.5 text-left transition-colors duration-200',
          isActive ? 'text-rc-ink' : 'text-rc-mist hover:bg-white/[0.06] hover:text-rc-cream',
        )}
      >
        {isActive && (
          <motion.span
            layoutId="activeSidebarNav"
            className="absolute inset-0 rounded-full bg-rc-pistachio"
            transition={{ type: 'spring', stiffness: 420, damping: 36 }}
          />
        )}
        <entry.Icon className="relative h-[18px] w-[18px] stroke-[1.6]" />
        <span className={cn('relative text-[14px]', isActive ? 'font-semibold' : 'font-medium')}>{entry.label}</span>
      </button>
    );
  };

  return (
    <aside
      className="fixed left-0 top-0 z-40 hidden h-[100dvh] w-[240px] flex-col bg-rc-night text-rc-cream lg:flex"
      aria-label="Main navigation"
    >
      <div className="flex h-[88px] shrink-0 items-center px-6">
        <button type="button" onClick={() => navigate({ pathname: '/app', search: location.search })} aria-label="RenoCred home" className="rounded-full">
          <Wordmark dark />
        </button>
      </div>

      <div className="flex flex-1 flex-col justify-between overflow-y-auto py-2">
        <nav className="flex w-full flex-col gap-1 px-3">
          {PRIMARY_NAV.map((entry) => item(entry, entry.id === 'home'))}
        </nav>
        <nav className="flex w-full flex-col gap-1 px-3 pb-4">
          {UTILITY_NAV.map((entry) => item(entry, false))}
          {/* a plain link out to the website; its header has "Open app" to come back */}
          <a href="/" className="group flex w-full items-center gap-3.5 rounded-full px-4 py-2.5 text-rc-mist transition-colors hover:bg-white/[0.06] hover:text-rc-cream">
            <ArrowUpRightIcon className="h-[18px] w-[18px] stroke-[1.6]" />
            <span className="text-[14px] font-medium">RenoCred website</span>
          </a>
        </nav>
      </div>

      <div className="shrink-0 px-3 pb-5">
        <button
          onClick={() => navigate({ pathname: '/app/profile', search: location.search })}
          className="group flex w-full items-center gap-3 rounded-[22px] border border-white/10 bg-white/[0.04] p-3 text-left transition-colors hover:border-white/25"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rc-pistachio text-[12px] font-semibold tracking-wider text-rc-ink">
            {userInitials}
          </span>
          <span className="min-w-0 flex-1">
            {userName ? (
              <>
                <span className="mb-0.5 block truncate text-[13px] font-medium text-rc-cream">{userName}</span>
                <span className="block truncate text-[11px] text-rc-mist transition-colors group-hover:text-rc-cream">View profile →</span>
              </>
            ) : (
              <span className="mt-1 flex animate-pulse flex-col gap-1.5">
                <span className="h-3 w-20 rounded bg-white/10" />
                <span className="h-2 w-12 rounded bg-white/10" />
              </span>
            )}
          </span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
