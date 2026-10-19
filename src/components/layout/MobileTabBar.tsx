/** Phones: every My RenoCred section in a bar at the bottom of the screen. */
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CircleUserRound, Home, IndianRupee, Sparkles, Ticket, WalletCards, type LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';
import { MY_RENOCRED } from '../../public-platform/site/nav';

const ICONS: Record<string, LucideIcon> = {
  '/app': Home,
  '/app/wallet': WalletCards,
  '/app/money': IndianRupee,
  '/app/discover': Sparkles,
  '/app/marketplace': Ticket,
  '/app/account': CircleUserRound,
};

/** "Picks for you" is too long for a tab; everything else keeps its name. */
const SHORT: Record<string, string> = { 'Picks for you': 'Picks' };

export function MobileTabBar() {
  const { pathname } = useLocation();
  const active = MY_RENOCRED.find((l) => (l.to === '/app' ? pathname === '/app' || pathname === '/app/' : pathname.startsWith(l.to)));
  return (
    <nav
      aria-label="My RenoCred"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-rc-night/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
    >
      <ul className="mx-auto grid h-16 max-w-[520px] grid-cols-6">
        {MY_RENOCRED.map((l) => {
          const Icon = ICONS[l.to] ?? Home;
          const on = l === active;
          return (
            <li key={l.to} className="relative">
              <Link
                to={l.to}
                aria-current={on ? 'page' : undefined}
                className={cn('flex h-full flex-col items-center justify-center gap-1 text-[10.5px] font-medium transition-colors', on ? 'text-rc-cream' : 'text-rc-mist/70 active:text-rc-cream')}
              >
                <span className="relative flex h-7 w-12 items-center justify-center">
                  {on && <motion.span layoutId="tab-pill" className="absolute inset-0 rounded-full bg-rc-pistachio" transition={{ type: 'spring', stiffness: 500, damping: 38 }} />}
                  <Icon size={18} strokeWidth={on ? 2.2 : 1.8} className={cn('relative', on && 'text-rc-ink')} />
                </span>
                <span className="max-w-full truncate px-0.5">{SHORT[l.label] ?? l.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
