import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MotionButton, fadeUpVariant, springSmooth } from '../../motion';
import { Bell, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDashboardStore } from '../../features/dashboard/store/dashboardStore';

// ─────────────────────────────────────────────────────────────────────────────
//  TOP NAV — Sticky header for main content area
// ─────────────────────────────────────────────────────────────────────────────

const ROUTE_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/app':          { title: 'Dashboard',      subtitle: 'Your financial overview at a glance'      },
  '/app/explore':  { title: 'Explore',        subtitle: 'Recommendations & Perks'                  },
  '/app/wallet':   { title: 'Wallet',         subtitle: 'Optimize payments & track bills'          },
  '/app/taqdeer':  { title: 'Taqdeer AI',     subtitle: 'Your AI Financial Copilot'                },
  '/app/insights': { title: 'Insights',       subtitle: 'Spend analysis & credit health'           },
  '/app/profile':  { title: 'Profile Settings', subtitle: 'Manage your credit profile and preferences' },
};

interface TopNavProps {
  isDark: boolean;
  onToggleTheme: () => void;
}

export function TopNav({ isDark: _isDark, onToggleTheme: _onToggleTheme }: TopNavProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const currentRoute = ROUTE_TITLES[location.pathname] || { title: 'Dashboard', subtitle: '' };
  const { title, subtitle } = currentRoute;
  const profile = useDashboardStore((s) => s.profile);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  const NOTIFICATIONS = [
    { id: 1, title: 'Budget Alert', desc: 'You reached 85% of your Dining budget.', time: '2 hours ago', unread: true },
    { id: 2, title: 'Upcoming Renewal', desc: 'Netflix will renew tomorrow for ₹649.', time: '5 hours ago', unread: true },
    { id: 3, title: 'Milestone Unlocked', desc: 'You unlocked 5,000 bonus points on Amex.', time: '1 day ago', unread: false },
  ];

  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex items-center justify-between gap-4',
        'px-6 lg:px-8 h-16',
        'topnav-glass',
      )}
    >
      {/* ── Page Title ──────────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0">
        <motion.div
          key={location.pathname}
          variants={fadeUpVariant}
          initial="hidden"
          animate="show"
        >
          <h1 className="text-lg font-display font-bold text-text-primary tracking-tight truncate">
            {title}
          </h1>
          <p className="text-xs text-text-muted hidden sm:block">{subtitle}</p>
        </motion.div>
      </div>

      {/* ── Actions ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        {/* Mobile-only Ask RenoCred */}
        <button
          onClick={() => navigate('/app/taqdeer')}
          className="lg:hidden h-9 px-3 rounded-full bg-brand-emerald/10 border border-brand-emerald/20 text-brand-emerald flex items-center gap-1.5 hover:bg-brand-emerald/20 transition-colors"
        >
          <Sparkles size={14} />
          <span className="text-[10px] font-bold tracking-wider uppercase hidden sm:inline">Ask RenoCred</span>
        </button>

        {/* Mobile-only profile avatar (visible < lg) */}
        <button
          onClick={() => navigate('/app/profile')}
          className="lg:hidden w-9 h-9 rounded-full bg-surface-secondary dark:bg-surface-elevated overflow-hidden ring-1 ring-canvas-300 dark:ring-white/[0.06] hover:ring-brand-emerald-glow transition-all cursor-pointer"
        >
          <img
            src={profile?.avatar ||"https://api.dicebear.com/7.x/notionists/svg?seed=Atharva&backgroundColor=f8f9fa"}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <MotionButton
            intent="secondary"
            onClick={() => setShowNotifications(!showNotifications)}
            className={cn(
              'relative w-9 h-9 rounded-full flex items-center justify-center',
              'text-text-muted hover:text-text-secondary',
              'hover:bg-surface-secondary/70 dark:hover:bg-white/[0.04]',
              showNotifications && 'bg-surface-secondary/70 dark:bg-white/[0.04] text-text-primary',
              'transition-colors duration-200',
            )}
            aria-label="Notifications"
          >
            <Bell size={17} strokeWidth={1.8} />
            {/* Badge dot */}
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-emerald border-2 border-canvas-100 dark:border-canvas-50" />
          </MotionButton>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15, ease:"easeOut" }}
                className="absolute right-0 top-full mt-2 w-80 panel-glass bg-surface-primary/95 dark:bg-surface-elevated/95 rounded-2xl shadow-ag-modal border border-border-subtle  overflow-hidden z-50"
              >
                <div className="p-4 border-b border-border-subtle  flex justify-between items-center bg-surface-primary/50 dark:bg-black/10">
                  <h3 className="font-bold text-text-primary text-sm">Notifications</h3>
                  <button className="text-xs font-semibold text-brand-emerald hover:text-brand-600">Mark all as read</button>
                </div>
                <div className="flex flex-col max-h-[300px] overflow-y-auto">
                  {NOTIFICATIONS.map(notif => (
                    <button key={notif.id} className="text-left p-4 hover:bg-surface-primary dark:hover:bg-white/[0.02] transition-colors border-b border-border-subtle  last:border-0 relative">
                      {notif.unread && <span className="absolute left-3 top-5 w-1.5 h-1.5 rounded-full bg-brand-emerald" />}
                      <div className={cn("pl-4", !notif.unread &&"opacity-70")}>
                        <h4 className="text-sm font-bold text-text-primary mb-1">{notif.title}</h4>
                        <p className="text-xs text-text-secondary leading-relaxed mb-2">{notif.desc}</p>
                        <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">{notif.time}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}

export default TopNav;

