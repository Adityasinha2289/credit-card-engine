import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Search, Command, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDashboardStore } from '../../features/dashboard/store/dashboardStore';
import { Button } from '../ui/Button';

// ─────────────────────────────────────────────────────────────────────────────
//  TOP NAV — Contextual Command Bar
// ─────────────────────────────────────────────────────────────────────────────

export function TopNav() {
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

  const firstName = profile?.name?.split(' ')[0] || 'Aditya';

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 px-8 h-[88px] bg-transparent shrink-0">
      {/* ── Context Identity / Greeting ─────────────────────────────────── */}
      <div className="flex-1 min-w-0">
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="flex items-center gap-2"
        >
          <CheckCircle2 size={16} strokeWidth={2} className="text-semantic-brand" />
          <h1 className="text-sm font-medium text-semantic-text-secondary tracking-wide truncate">
            Good evening, {firstName}
          </h1>
        </motion.div>
      </div>

      {/* ── Actions ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-6">
        {/* Search Bar / Taqdeer Trigger */}
        <button className="hidden md:flex items-center gap-3 group px-4 py-2 rounded-full hover:bg-[#0D2B1C]/30 transition-all duration-300">
          <Search size={14} className="text-semantic-text-muted group-hover:text-semantic-brand transition-colors" strokeWidth={2} />
          <span className="text-[13px] font-medium text-semantic-text-muted group-hover:text-semantic-text-primary transition-colors tracking-wide">
            Ask Taqdeer anything...
          </span>
          <div className="flex items-center gap-0.5 ml-6 opacity-40 group-hover:opacity-100 transition-opacity">
            <Command size={10} className="text-semantic-text-muted group-hover:text-semantic-brand" strokeWidth={2} />
            <span className="text-[10px] font-bold text-semantic-text-muted group-hover:text-semantic-brand leading-none mt-0.5">K</span>
          </div>
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative w-10 h-10 p-0 rounded-full hover:bg-transparent"
            aria-label="Notifications"
          >
            <Bell size={20} strokeWidth={1.5} className={showNotifications ? 'text-semantic-text-primary' : 'text-semantic-text-muted'} />
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
