import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { cn } from '../../lib/utils';
import { useDashboardStore } from '../../features/dashboard/store/dashboardStore';
import { Wordmark } from '../../public-platform/site/Brand';
import { APP_NAV, sectionFor } from './appNav';

const initials = (name: string) => name.split(' ').filter(Boolean).map((n) => n[0]).join('').toUpperCase().slice(0, 2);

/** Four sections and your account. Nothing else competes for attention. */
export function Sidebar() {
  const profile = useDashboardStore((s) => s.profile);
  const { isLoaded, user } = useUser();
  const { pathname } = useLocation();
  const section = sectionFor(pathname);
  const userName = profile?.name || (isLoaded && user ? user.fullName || user.firstName : '') || '';

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-[100dvh] w-[232px] flex-col bg-rc-night text-rc-cream lg:flex" aria-label="Main navigation">
      <div className="flex h-[88px] shrink-0 items-center px-6">
        <Link to="/app" aria-label="RenoCred, today" className="rounded-full"><Wordmark dark /></Link>
      </div>

      <nav className="flex flex-col gap-1 px-3 pt-2">
        {APP_NAV.map((item) => {
          const active = section === item.id;
          return (
            <Link
              key={item.id}
              to={item.path}
              aria-current={active ? 'page' : undefined}
              className={cn('relative flex items-center gap-3.5 rounded-full px-4 py-3 transition-colors duration-200', active ? 'text-rc-ink' : 'text-rc-mist hover:bg-white/[0.06] hover:text-rc-cream')}
            >
              {active && <motion.span layoutId="activeSidebarNav" className="absolute inset-0 rounded-full bg-rc-pistachio" transition={{ type: 'spring', stiffness: 420, damping: 36 }} />}
              <item.Icon className="relative h-[19px] w-[19px] stroke-[1.6]" />
              <span className={cn('relative text-[15px]', active ? 'font-semibold' : 'font-medium')}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto px-3 pb-5">
        <Link
          to="/app/account"
          aria-current={section === 'account' ? 'page' : undefined}
          className={cn('flex items-center gap-3 rounded-[22px] border p-3 transition-colors', section === 'account' ? 'border-rc-pistachio/40 bg-white/[0.08]' : 'border-white/10 bg-white/[0.04] hover:border-white/25')}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rc-pistachio text-[12px] font-semibold tracking-wider text-rc-ink">{initials(userName)}</span>
          <span className="min-w-0 flex-1">
            {userName ? (
              <>
                <span className="block truncate text-[14px] font-medium text-rc-cream">{userName}</span>
                <span className="block truncate text-[12px] text-rc-mist">Account and settings</span>
              </>
            ) : (
              <span className="mt-1 flex animate-pulse flex-col gap-1.5">
                <span className="h-3 w-20 rounded bg-white/10" />
                <span className="h-2 w-12 rounded bg-white/10" />
              </span>
            )}
          </span>
        </Link>
      </div>
    </aside>
  );
}

export default Sidebar;
