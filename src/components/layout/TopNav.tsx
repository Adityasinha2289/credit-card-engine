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
import { Wordmark } from '../../public-platform/site/Brand';

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
    <header className="sticky top-0 z-30 flex h-[64px] shrink-0 items-center justify-between gap-4 bg-semantic-canvas/85 px-4 backdrop-blur-md md:px-8">
      {/* the sidebar carries the brand on wide screens; on phones it lives here */}
      <div className="min-w-0 flex-1">
        <button type="button" onClick={() => navigate({ pathname: '/app', search: location.search })} aria-label="RenoCred home" className="rounded-full lg:hidden">
          <Wordmark dark={false} />
        </button>
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
            className="relative h-10 w-10 rounded-full border border-semantic-border-subtle p-0 hover:bg-white"
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
                className="absolute right-0 top-[calc(100%+8px)] z-50 w-[calc(100vw-4rem)] overflow-hidden rounded-[24px] border border-semantic-border-subtle bg-semantic-surface-card shadow-[0_30px_60px_-30px_rgba(15,42,29,0.45)] sm:w-80"
              >
                <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-transparent">
                  <h3 className="font-semibold text-gray-900 text-[15px]">Notifications</h3>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="rounded-full px-2.5 py-1 text-[12px] font-medium text-rc-forest hover:bg-rc-pistachio">Mark all read</button>
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
                      className="group relative border-b border-gray-100 p-5 text-left transition-colors last:border-0 hover:bg-gray-50"
                    >
                      {notif.unread && <span className="absolute left-4 top-[26px] h-1.5 w-1.5 rounded-full bg-rc-emerald" />}
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
