import { useState, useRef, useEffect, useMemo } from 'react';
import { useShallow } from 'zustand/shallow';
import { upcomingCharges } from '../../features/subscriptions/reminderPlanner';
import { istDate } from '../../features/subscriptions/billingCycle';
import { CardDueEngine } from '../../features/money/engines/SafeToSpendEngine';
import { formatRupees } from '../../features/money/lib/moneyMath';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Search, Command, CheckCircle2, Settings } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDashboardStore } from '../../features/dashboard/store/dashboardStore';
import { Button } from '../ui/Button';

// ─────────────────────────────────────────────────────────────────────────────
//  TOP NAV — Contextual Command Bar
// ─────────────────────────────────────────────────────────────────────────────

export function TopNav() {
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

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

  const { subscriptions, creditAccounts, userCards } = useDashboardStore(useShallow((s) => ({
    subscriptions: s.subscriptions,
    creditAccounts: s.creditAccounts,
    userCards: s.userCards,
  })));
  const [seen, setSeen] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('renocred:notif-seen') || '[]'); } catch { return []; }
  });

  // Real, actionable items only: bills due and renewals / trial endings this week.
  const NOTIFICATIONS = useMemo(() => {
    const today = istDate();
    const names: Record<string, string> = {};
    userCards.forEach((c) => { names[c.id] = c.label || c.bank || 'Card'; });
    const dues = CardDueEngine.evaluate(creditAccounts, names)
      .filter((d) => d.state === 'OVERDUE' || d.state === 'DUE_TODAY' || d.state === 'DUE_SOON')
      .map((d) => ({
        id: `due-${d.cardId}-${d.dueDate}`,
        title: d.state === 'OVERDUE' ? `${d.name} bill is overdue` : `${d.name} bill due ${d.daysRemaining === 0 ? 'today' : `in ${d.daysRemaining} days`}`,
        desc: `${formatRupees(d.totalDue)} outstanding. Pay in full to avoid interest.`,
        time: d.dueDate ?? '',
        to: '/app/money',
      }));
    const renewals = upcomingCharges(subscriptions, today, 7).map((u) => ({
      id: `sub-${u.subscription.id}-${u.dueOn}`,
      title: u.kind === 'trial_ending'
        ? `${u.subscription.name} trial ends ${u.daysLeft === 0 ? 'today' : u.daysLeft === 1 ? 'tomorrow' : `in ${u.daysLeft} days`}`
        : `${u.subscription.name} renews ${u.daysLeft === 0 ? 'today' : u.daysLeft === 1 ? 'tomorrow' : `in ${u.daysLeft} days`}`,
      desc: `${formatRupees(u.subscription.amount)} on ${u.dueOn}${u.subscription.hasPriceHike ? ' · price went up' : ''}`,
      time: u.dueOn,
      to: '/app/money/subscriptions',
    }));
    return [...dues, ...renewals].map((n) => ({ ...n, unread: !seen.includes(n.id) }));
  }, [subscriptions, creditAccounts, userCards, seen]);
  const unreadCount = NOTIFICATIONS.filter((n) => n.unread).length;

  const markAllRead = () => {
    const ids = Array.from(new Set([...seen, ...NOTIFICATIONS.map((n) => n.id)])).slice(-200);
    setSeen(ids);
    try { localStorage.setItem('renocred:notif-seen', JSON.stringify(ids)); } catch { /* private mode */ }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 px-4 md:px-8 h-[60px] bg-white/80 backdrop-blur-md border-b border-gray-200 shrink-0">
      {/* ── Context Identity / Greeting ─────────────────────────────────── */}
      <div className="flex-1 min-w-0">
      </div>

      {/* ── Actions ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4">
        {/* Settings (Mobile Only) */}
        <div className="lg:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ pathname: '/app/settings', search: location.search })}
            className="relative w-10 h-10 p-0 rounded-full hover:bg-transparent"
            aria-label="Settings"
          >
            <Settings size={20} strokeWidth={1.5} className="text-semantic-text-muted" />
          </Button>
        </div>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative w-10 h-10 p-0 rounded-full hover:bg-transparent"
            aria-label={unreadCount > 0 ? `Notifications (${unreadCount} new)` : 'Notifications'}
          >
            <Bell size={20} strokeWidth={1.5} className={showNotifications ? 'text-semantic-text-primary' : 'text-semantic-text-muted'} />
            {unreadCount > 0 && (
              <span className="absolute top-[8px] right-[8px] w-2 h-2 rounded-full bg-semantic-brand border-2 border-semantic-canvas" />
            )}
          </Button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ duration: 0.15, ease:"easeOut" }}
                className="absolute right-0 top-[calc(100%+8px)] w-[calc(100vw-4rem)] sm:w-80 bg-white rounded-2xl shadow-2xl border border-gray-300 overflow-hidden z-50"
              >
                <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-transparent">
                  <h3 className="font-semibold text-gray-900 text-[15px]">Notifications</h3>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="text-[11px] font-bold text-[#2A9D5C] hover:text-[#2A9D5C]/80 uppercase tracking-widest">MARK READ</button>
                  )}
                </div>
                <div className="flex flex-col max-h-[350px] overflow-y-auto hide-scrollbar">
                  {NOTIFICATIONS.length === 0 && (
                    <p className="p-5 text-[13px] text-gray-500">You're all caught up. Bills due and subscription renewals will show up here.</p>
                  )}
                  {NOTIFICATIONS.map(notif => (
                    <button
                      key={notif.id}
                      onClick={() => { setShowNotifications(false); navigate({ pathname: notif.to, search: location.search }); }}
                      className="text-left p-5 bg-white hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0 relative group"
                    >
                      {notif.unread && <span className="absolute left-4 top-[26px] w-1.5 h-1.5 rounded-full bg-[#2A9D5C]" />}
                      <div className={cn("pl-5", !notif.unread &&"opacity-50")}>
                        <h4 className="text-[14px] font-semibold text-gray-900 mb-1.5">{notif.title}</h4>
                        <p className="text-[13px] text-gray-600 leading-relaxed mb-3">{notif.desc}</p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">{notif.time}</p>
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
