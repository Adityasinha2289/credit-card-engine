/** The app's four sections. Every other screen hangs off one of these. */
import { CalendarDaysIcon, ChartPieIcon, MagnifyingGlassIcon, WalletIcon } from '@heroicons/react/24/outline';

export const APP_NAV = [
  { id: 'today', path: '/app', label: 'Today', Icon: CalendarDaysIcon, exact: true },
  { id: 'wallet', path: '/app/wallet', label: 'Wallet', Icon: WalletIcon, exact: false },
  { id: 'money', path: '/app/money', label: 'Money', Icon: ChartPieIcon, exact: false },
  { id: 'discover', path: '/app/discover', label: 'Discover', Icon: MagnifyingGlassIcon, exact: false },
] as const;

/** Which section a path belongs to, so detail screens light up their parent tab. */
export function sectionFor(pathname: string): string {
  if (pathname.startsWith('/app/wallet')) return 'wallet';
  if (pathname.startsWith('/app/money')) return 'money';
  if (pathname.startsWith('/app/discover') || pathname.startsWith('/app/cards') || pathname.startsWith('/app/tools')) return 'discover';
  if (pathname.startsWith('/app/account')) return 'account';
  if (pathname === '/app' || pathname === '/app/') return 'today';
  return '';
}
