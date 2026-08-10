import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDashboardStore } from '../../features/dashboard/store/dashboardStore';
import { Button } from '../ui/Button';

// ─────────────────────────────────────────────────────────────────────────────
//  TOP NAV — Contextual Command Bar
// ─────────────────────────────────────────────────────────────────────────────

const ROUTE_CONTEXT: Record<string, { title: string; directive: string }> = {
  '/app/explore':  { title: 'Explore',        directive: 'Discover recommendations and perks.' },
  '/app/credit':   { title: 'Credit',         directive: 'Find the right card.'                },
  '/app/wallet':   { title: 'Wallet',         directive: 'Optimize every transaction.'         },
  '/app/lifestyle':{ title: 'Lifestyle',      directive: 'Plan smarter spending.'              },
  '/app/insights': { title: 'Insights',       directive: 'Analyze your financial health.'      },
  '/app/profile':  { title: 'Profile',        directive: 'Manage your identity.'               },
  '/app':          { title: 'Dashboard',      directive: 'Your financial command center.'      },
};

export function TopNav() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Find closest matching route
  const currentRoute = Object.keys(ROUTE_CONTEXT)
    .sort((a, b) => b.length - a.length)
    .find(route => location.pathname.startsWith(route)) || '/app';
    
  const { title, directive } = ROUTE_CONTEXT[currentRoute] || ROUTE_CONTEXT['/app'];
  
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
    { id: 1, title: 'Optimization Opportunity', desc: 'You are missing out on 5% cashback for Dining.', time: '2h ago', unread: true },
    { id: 2, title: 'Bill Reminder', desc: 'Amex Platinum bill of ₹12,450 is due in 3 days.', time: '5h ago', unread: true },
  ];

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 px-6 lg:px-8 h-16 bg-semantic-canvas/80 backdrop-blur-md border-b border-semantic-border-subtle shrink-0">
      {/* ── Context Identity ──────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0">
        <motion.div
          key={title}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="flex flex-col"
        >
          <h1 className="text-lg font-display font-semibold text-semantic-text-primary tracking-tight truncate">
            {title}
          </h1>
          <p className="text-xs text-semantic-text-muted hidden sm:block font-medium tracking-wide">
            {directive}
          </p>
        </motion.div>
      </div>

      {/* ── Actions ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative w-9 h-9 p-0 rounded-full"
            aria-label="Notifications"
          >
            <Bell size={18} strokeWidth={1.8} className={showNotifications ? 'text-semantic-text-primary' : 'text-semantic-text-muted'} />
            <span className="absolute top-[8px] right-[8px] w-2 h-2 rounded-full bg-semantic-brand border-2 border-semantic-canvas" />
          </Button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ duration: 0.15, ease:"easeOut" }}
                className="absolute right-0 top-[calc(100%+8px)] w-80 bg-semantic-surface-elevated rounded-xl shadow-ag-card border border-semantic-border-strong overflow-hidden z-50"
              >
                <div className="p-4 border-b border-semantic-border-subtle flex justify-between items-center bg-semantic-surface-primary">
                  <h3 className="font-semibold text-semantic-text-primary text-sm">Notifications</h3>
                  <button className="text-[11px] font-semibold text-semantic-brand hover:text-semantic-brand-strong uppercase tracking-wider">Mark Read</button>
                </div>
                <div className="flex flex-col max-h-[300px] overflow-y-auto">
                  {NOTIFICATIONS.map(notif => (
                    <button key={notif.id} className="text-left p-4 hover:bg-semantic-surface-card transition-colors border-b border-semantic-border-subtle last:border-0 relative">
                      {notif.unread && <span className="absolute left-3 top-5 w-1.5 h-1.5 rounded-full bg-semantic-brand" />}
                      <div className={cn("pl-4", !notif.unread &&"opacity-70")}>
                        <h4 className="text-sm font-semibold text-semantic-text-primary mb-1">{notif.title}</h4>
                        <p className="text-xs text-semantic-text-secondary leading-relaxed mb-2">{notif.desc}</p>
                        <p className="text-[10px] text-semantic-text-muted uppercase tracking-wider font-semibold">{notif.time}</p>
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
