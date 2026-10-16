import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { useShallow } from 'zustand/shallow';
import { toast } from 'sonner';
import { Bell, BellOff, Pause, Play, Pencil, X, ExternalLink, Sparkles, Mail, Smartphone } from 'lucide-react';
import { useDashboardStore } from '../../../features/dashboard/store/dashboardStore';
import type { Subscription, BillingCycle } from '../../../features/dashboard/types/dashboard.types';
import { PageContainer } from '../../../components/shared/PageContainer';
import { useIsDemo } from '../../../features/demo/DemoAppProvider';
import { formatRupees, toPaise } from '../../../features/money/lib/moneyMath';
import { istDate, addCycles, monthlyCost, yearlyCost, CYCLE_LABEL, daysBetween } from '../../../features/subscriptions/billingCycle';
import { effectiveNextCharge } from '../../../features/subscriptions/reminderPlanner';
import { detectRecurring, type RecurringSuggestion } from '../../../features/subscriptions/recurringDetector';
import { SUBSCRIPTION_PRESETS, findPreset, getCancelUrl } from '../../../features/subscriptions/presets';
import {
  loadPrefs, savePrefs, pushSupport, enablePush, disablePush, currentPushSubscription, sendTestPush,
  DEFAULT_PREFS, type ReminderPrefs, type PushSupport,
} from '../../../features/subscriptions/notifications';

const LEAD_OPTIONS = [7, 3, 1, 0];
const DISMISSED_KEY = 'renocred:dismissed-recurring';

interface FormState {
  id?: string;
  name: string;
  amount: string;
  billingCycle: BillingCycle;
  nextBillingDate: string;
  cardId: string;
  isFreeTrial: boolean;
  trialEndsOn: string;
  reminderDays: number[];
}

function emptyForm(today: string): FormState {
  return {
    name: '', amount: '', billingCycle: 'monthly', nextBillingDate: addCycles(today, 'monthly'),
    cardId: '', isFreeTrial: false, trialEndsOn: '', reminderDays: [3, 1],
  };
}

function readDismissed(): string[] {
  try { return JSON.parse(localStorage.getItem(DISMISSED_KEY) || '[]'); } catch { return []; }
}

function whenLabel(days: number): string {
  if (days < 0) return `${-days}d ago`;
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return `In ${days} days`;
}

export default function SubscriptionsPage() {
  const { subscriptions, userCards, transactions, profile, supabaseClient } = useDashboardStore(useShallow((s) => ({
    subscriptions: s.subscriptions,
    userCards: s.userCards,
    transactions: s.transactions,
    profile: s.profile,
    supabaseClient: s.supabaseClient,
  })));
  const addSubscription = useDashboardStore((s) => s.addSubscription);
  const updateSubscription = useDashboardStore((s) => s.updateSubscription);
  const cancelSubscription = useDashboardStore((s) => s.cancelSubscription);
  const isDemo = useIsDemo();
  const { getToken } = useAuth();

  const today = istDate();
  const [form, setForm] = useState<FormState | null>(null);
  const [dismissed, setDismissed] = useState<string[]>(readDismissed);
  const [prefs, setPrefs] = useState<ReminderPrefs>(DEFAULT_PREFS);
  const [push, setPush] = useState<PushSupport | null>(null);
  const [pushOn, setPushOn] = useState(false);
  const [busy, setBusy] = useState(false);

  // ── data ──────────────────────────────────────────────────────────────────
  const active = useMemo(() => subscriptions.filter((s) => s.status !== 'cancelled'), [subscriptions]);
  const rows = useMemo(() => active
    .map((s) => {
      const due = s.isFreeTrial && s.trialEndsOn ? s.trialEndsOn.slice(0, 10) : effectiveNextCharge(s, today);
      return { s, due, days: due ? daysBetween(today, due) : null };
    })
    .sort((a, b) => (a.s.status === 'paused' ? 1 : 0) - (b.s.status === 'paused' ? 1 : 0) || (a.days ?? 9999) - (b.days ?? 9999)),
  [active, today]);

  const running = active.filter((s) => s.status === 'active');
  const perMonth = running.reduce((sum, s) => sum + monthlyCost(s.amount, s.billingCycle), 0);
  const perYear = running.reduce((sum, s) => sum + yearlyCost(s.amount, s.billingCycle), 0);

  const suggestions = useMemo(
    () => detectRecurring(transactions, subscriptions, today).filter((x) => !dismissed.includes(x.merchantKey)),
    [transactions, subscriptions, today, dismissed],
  );

  // Persist rolled-forward dates once, so stored next-charge dates never go stale.
  const rolledRef = useRef(new Set<string>());
  useEffect(() => {
    for (const { s, due } of rows) {
      if (s.status !== 'active' || s.isFreeTrial || !due || rolledRef.current.has(s.id)) continue;
      if (s.nextBillingDate && s.nextBillingDate.slice(0, 10) !== due && s.nextBillingDate.slice(0, 10) < today) {
        rolledRef.current.add(s.id);
        void updateSubscription(s.id, { nextBillingDate: due });
      }
    }
  }, [rows, today, updateSubscription]);

  useEffect(() => {
    if (!profile?.id || isDemo) return;
    void loadPrefs(supabaseClient as any, profile.id).then(setPrefs);
    void pushSupport().then(setPush);
    void currentPushSubscription().then((s) => setPushOn(!!s));
  }, [profile?.id, supabaseClient, isDemo]);

  // ── actions ───────────────────────────────────────────────────────────────
  const openAdd = (preset?: (typeof SUBSCRIPTION_PRESETS)[number]) => {
    const base = emptyForm(today);
    setForm(preset
      ? { ...base, name: preset.name, amount: String(preset.amount / 100), billingCycle: preset.billingCycle,
          nextBillingDate: addCycles(today, preset.billingCycle), reminderDays: preset.billingCycle === 'yearly' ? [7, 1] : [3, 1] }
      : base);
  };

  const openEdit = (s: Subscription) => setForm({
    id: s.id, name: s.name, amount: String(s.amount / 100), billingCycle: s.billingCycle,
    nextBillingDate: (effectiveNextCharge(s, today) ?? today), cardId: s.cardId || '',
    isFreeTrial: s.isFreeTrial, trialEndsOn: s.trialEndsOn?.slice(0, 10) ?? '',
    reminderDays: s.reminderDays ?? (s.billingCycle === 'yearly' ? [7, 1] : [3, 1]),
  });

  const addFromSuggestion = (x: RecurringSuggestion) => {
    void addSubscription({
      id: `sub-${Date.now().toString(36)}`,
      name: x.name, amount: x.amount, billingCycle: x.billingCycle, nextBillingDate: x.nextBillingDate,
      status: 'active', cardId: userCards.some((c) => c.id === x.cardId) ? x.cardId : '', category: x.category,
      hasPriceHike: x.hasPriceHike, previousAmount: x.previousAmount, isFreeTrial: false,
      reminderDays: x.billingCycle === 'yearly' ? [7, 1] : [3, 1], source: 'detected', cancelUrl: x.cancelUrl,
    });
    toast.success(`Tracking ${x.name}. We'll remind you before it renews.`);
  };

  const dismissSuggestion = (key: string) => {
    const next = [...dismissed, key];
    setDismissed(next);
    try { localStorage.setItem(DISMISSED_KEY, JSON.stringify(next)); } catch { /* private mode */ }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    const amount = toPaise(parseFloat(form.amount));
    if (!form.name.trim() || !(amount > 0) || !form.nextBillingDate) {
      toast.error('Add a name, amount and next charge date.');
      return;
    }
    if (form.isFreeTrial && !form.trialEndsOn) {
      toast.error('When does the free trial end?');
      return;
    }
    const preset = findPreset(form.name);
    const fields = {
      name: form.name.trim(),
      amount,
      billingCycle: form.billingCycle,
      nextBillingDate: form.isFreeTrial ? form.trialEndsOn : form.nextBillingDate,
      cardId: form.cardId,
      isFreeTrial: form.isFreeTrial,
      trialEndsOn: form.isFreeTrial ? form.trialEndsOn : undefined,
      reminderDays: [...form.reminderDays].sort((a, b) => b - a),
      category: preset?.category ?? 'subscriptions',
      cancelUrl: preset?.cancelUrl,
    };
    if (form.id) {
      const before = subscriptions.find((s) => s.id === form.id);
      const hike = before && amount > before.amount ? { hasPriceHike: true, previousAmount: before.amount } : {};
      void updateSubscription(form.id, { ...fields, ...hike });
    } else {
      void addSubscription({ id: `sub-${Date.now().toString(36)}`, status: 'active', hasPriceHike: false, source: 'manual', ...fields });
    }
    setForm(null);
  };

  const cancel = (s: Subscription) => {
    const url = s.cancelUrl ?? getCancelUrl(s.name);
    if (url) window.open(url, '_blank', 'noopener');
    void cancelSubscription(s.id);
    toast.success(url ? `Opened ${s.name}'s cancellation page and stopped tracking it.` : `Stopped tracking ${s.name}.`);
  };

  const togglePref = async (key: keyof Pick<ReminderPrefs, 'emailEnabled'>) => {
    if (!profile) return;
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    if (!(await savePrefs(supabaseClient as any, profile.id, { [key]: next[key] }))) {
      toast.error("Couldn't save reminder settings yet — the reminders migration may not be applied.");
    }
  };

  const togglePush = async () => {
    setBusy(true);
    try {
      if (pushOn) {
        await disablePush(() => getToken());
        setPushOn(false);
        setPrefs((p) => ({ ...p, pushEnabled: false }));
        toast.success('Push reminders turned off on this device.');
      } else {
        const r = await enablePush(() => getToken());
        if (r.ok) {
          setPushOn(true);
          setPrefs((p) => ({ ...p, pushEnabled: true }));
          toast.success('Push reminders are on for this device.');
        } else {
          const msg: Record<string, string> = {
            denied: 'Notifications are blocked for this site. Allow them in your browser settings, then try again.',
            'ios-needs-install': 'On iPhone, add RenoCred to your Home Screen first (Share → Add to Home Screen), then turn on push.',
            'not-configured': 'Push reminders are not set up on the server yet.',
            'no-browser-support': "This browser doesn't support push notifications.",
          };
          toast.error(msg[r.error] ?? `Couldn't turn on push: ${r.error}`);
          setPush(await pushSupport());
        }
      }
    } finally {
      setBusy(false);
    }
  };

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <PageContainer title="Subscriptions" className="pb-safe max-w-3xl mx-auto">
      <div className="py-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

        <Link to="/app/money" className="text-sm text-gray-500 hover:text-gray-900">← Money Manager</Link>

        {/* Summary */}
        <section className="bg-white p-6 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Per month</p>
            <p className="text-2xl font-medium text-gray-900">{formatRupees(perMonth)}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Per year</p>
            <p className="text-2xl font-medium text-gray-900">{formatRupees(perYear)}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Active</p>
            <p className="text-2xl font-medium text-gray-900">{running.length}</p>
          </div>
        </section>

        {/* Detected */}
        {suggestions.length > 0 && (
          <section>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Sparkles size={14} className="text-emerald-600" /> Looks like a subscription
            </h3>
            <div className="space-y-2">
              {suggestions.slice(0, 5).map((x) => (
                <div key={x.merchantKey} className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-emerald-950">{x.name} · {formatRupees(x.amount)}/{CYCLE_LABEL[x.billingCycle]}</p>
                    <p className="text-xs text-emerald-800 mt-0.5">
                      Charged {x.occurrences} times, last on {x.lastChargedOn}. Next expected {x.nextBillingDate}.
                      {x.hasPriceHike && x.previousAmount ? ` Price went up from ${formatRupees(x.previousAmount)}.` : ''}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => dismissSuggestion(x.merchantKey)} className="px-3 py-1.5 text-sm text-emerald-900">Not a subscription</button>
                    <button onClick={() => addFromSuggestion(x)} className="px-4 py-1.5 rounded-xl bg-emerald-700 text-white text-sm">Track it</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* List */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Your subscriptions</h3>
            {!form && <button onClick={() => openAdd()} className="text-xs font-bold text-emerald-700">+ Add</button>}
          </div>

          {form && (
            <form onSubmit={submit} className="bg-white p-5 rounded-2xl border border-gray-200 space-y-3 mb-4">
              {!form.id && (
                <div className="flex flex-wrap gap-1.5">
                  {SUBSCRIPTION_PRESETS.slice(0, 8).map((p) => (
                    <button type="button" key={p.key} onClick={() => openAdd(p)}
                      className={`text-xs px-2.5 py-1 rounded-full border ${form.name === p.name ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 text-gray-600'}`}>
                      {p.name}
                    </button>
                  ))}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="text-xs font-bold text-gray-500">Name
                  <input className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm font-normal text-gray-900" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Netflix" />
                </label>
                <label className="text-xs font-bold text-gray-500">Amount (₹) per charge
                  <input className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm font-normal text-gray-900" inputMode="decimal" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="649" />
                </label>
                <label className="text-xs font-bold text-gray-500">Billed every
                  <select className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm font-normal text-gray-900 bg-white" value={form.billingCycle} onChange={(e) => setForm({ ...form, billingCycle: e.target.value as BillingCycle })}>
                    {(['weekly', 'monthly', 'quarterly', 'yearly'] as const).map((c) => <option key={c} value={c}>{CYCLE_LABEL[c]}</option>)}
                  </select>
                </label>
                <label className="text-xs font-bold text-gray-500">Paid with
                  <select className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm font-normal text-gray-900 bg-white" value={form.cardId} onChange={(e) => setForm({ ...form, cardId: e.target.value })}>
                    <option value="">UPI / bank account</option>
                    {userCards.map((c) => <option key={c.id} value={c.id}>{c.label || c.bank}</option>)}
                  </select>
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700 sm:col-span-2">
                  <input type="checkbox" checked={form.isFreeTrial} onChange={(e) => setForm({ ...form, isFreeTrial: e.target.checked })} />
                  This is a free trial
                </label>
                {form.isFreeTrial ? (
                  <label className="text-xs font-bold text-gray-500">Trial ends on
                    <input type="date" min={today} className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm font-normal" value={form.trialEndsOn} onChange={(e) => setForm({ ...form, trialEndsOn: e.target.value })} />
                  </label>
                ) : (
                  <label className="text-xs font-bold text-gray-500">Next charge on
                    <input type="date" className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm font-normal" value={form.nextBillingDate} onChange={(e) => setForm({ ...form, nextBillingDate: e.target.value })} />
                  </label>
                )}
                <div className="text-xs font-bold text-gray-500">Remind me
                  <div className="mt-1 flex gap-1.5">
                    {LEAD_OPTIONS.map((d) => {
                      const on = form.reminderDays.includes(d);
                      return (
                        <button type="button" key={d} aria-pressed={on}
                          onClick={() => setForm({ ...form, reminderDays: on ? form.reminderDays.filter((x) => x !== d) : [...form.reminderDays, d] })}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border ${on ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-600'}`}>
                          {d === 0 ? 'Same day' : `${d}d before`}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={() => setForm(null)} className="px-3 py-1.5 text-sm text-gray-500">Cancel</button>
                <button type="submit" className="px-4 py-1.5 rounded-xl bg-gray-900 text-white text-sm">{form.id ? 'Save' : 'Add subscription'}</button>
              </div>
            </form>
          )}

          {rows.length === 0 && !form ? (
            <div className="bg-white p-6 rounded-2xl border border-dashed border-gray-200 text-center">
              <p className="text-gray-900 font-medium">No subscriptions tracked yet</p>
              <p className="text-sm text-gray-500 mt-1">Add the ones you pay for and we'll remind you before each renewal — and before free trials turn into charges.</p>
              <button onClick={() => openAdd()} className="mt-4 px-4 py-2 rounded-xl bg-gray-900 text-white text-sm">Add a subscription</button>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-gray-100 divide-y divide-gray-50">
              {rows.map(({ s, due, days }) => {
                const paused = s.status === 'paused';
                const card = userCards.find((c) => c.id === s.cardId);
                const cancelUrl = s.cancelUrl ?? getCancelUrl(s.name);
                return (
                  <div key={s.id} className={`p-4 flex flex-wrap items-center justify-between gap-3 ${paused ? 'opacity-60' : ''}`}>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-gray-900">{s.name}</p>
                        {s.isFreeTrial && <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">Free trial</span>}
                        {s.hasPriceHike && <span className="text-[10px] font-bold uppercase bg-red-100 text-red-700 px-1.5 py-0.5 rounded">Price up</span>}
                        {paused && <span className="text-[10px] font-bold uppercase bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">Paused</span>}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {formatRupees(s.amount)}/{CYCLE_LABEL[s.billingCycle]}
                        {s.billingCycle !== 'yearly' && ` · ${formatRupees(yearlyCost(s.amount, s.billingCycle))}/yr`}
                        {' · '}{card ? (card.label || card.bank) : 'UPI / bank'}
                      </p>
                      {!paused && due && days !== null && (
                        <p className={`text-xs mt-1 ${days <= 3 ? 'text-amber-700 font-medium' : 'text-gray-500'}`}>
                          {s.isFreeTrial ? 'Trial ends' : 'Renews'} {whenLabel(days).toLowerCase()} ({due})
                          {(s.reminderDays?.length ?? 0) === 0 && ' · no reminders'}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button title="Edit" aria-label={`Edit ${s.name}`} onClick={() => openEdit(s)} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"><Pencil size={15} /></button>
                      <button title={paused ? 'Resume' : 'Pause reminders'} aria-label={paused ? `Resume ${s.name}` : `Pause ${s.name}`}
                        onClick={() => void updateSubscription(s.id, { status: paused ? 'active' : 'paused' })}
                        className="p-2 rounded-lg text-gray-500 hover:bg-gray-100">{paused ? <Play size={15} /> : <Pause size={15} />}</button>
                      <button title={cancelUrl ? 'Cancel on website' : 'Stop tracking'} aria-label={`Cancel ${s.name}`} onClick={() => cancel(s)}
                        className="p-2 rounded-lg text-red-500 hover:bg-red-50">{cancelUrl ? <ExternalLink size={15} /> : <X size={15} />}</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Reminder channels */}
        {!isDemo && (
          <section>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">How we remind you</h3>
            <div className="bg-white rounded-3xl border border-gray-100 divide-y divide-gray-50">
              <div className="p-4 flex items-center gap-3">
                <Bell size={16} className="text-gray-500" />
                <span><span className="block text-sm font-medium text-gray-900">In the app</span><span className="block text-xs text-gray-500">Always on: the bell icon and Money Manager show what's renewing this week</span></span>
              </div>
              <label className="p-4 flex items-center justify-between gap-3 cursor-pointer">
                <span className="flex items-center gap-3"><Mail size={16} className="text-gray-500" /><span><span className="block text-sm font-medium text-gray-900">Email</span><span className="block text-xs text-gray-500">One morning digest to {profile?.email || 'your email'}</span></span></span>
                <input type="checkbox" checked={prefs.emailEnabled} onChange={() => void togglePref('emailEnabled')} />
              </label>
              <div className="p-4 flex items-center justify-between gap-3">
                <span className="flex items-center gap-3"><Smartphone size={16} className="text-gray-500" /><span><span className="block text-sm font-medium text-gray-900">Push on this device</span>
                  <span className="block text-xs text-gray-500">
                    {push && !push.supported
                      ? { denied: 'Blocked in browser settings', 'ios-needs-install': 'Add to Home Screen first (iPhone)', 'not-configured': 'Not available yet', 'no-browser-support': 'Not supported in this browser' }[push.reason]
                      : pushOn ? 'On · quiet 10pm–8am' : 'Off'}
                  </span></span></span>
                <div className="flex items-center gap-2">
                  {pushOn && (
                    <button
                      onClick={async () => {
                        if (await sendTestPush(() => getToken())) toast.success('Test notification sent');
                        else toast.error("Couldn't send a test notification. Try turning push off and on again.");
                      }}
                      className="text-xs text-gray-500 hover:text-gray-900"
                    >
                      Test
                    </button>
                  )}
                  <button disabled={busy || (!!push && !push.supported && push.reason !== 'denied')} onClick={() => void togglePush()}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm disabled:opacity-40 ${pushOn ? 'border border-gray-200 text-gray-700' : 'bg-gray-900 text-white'}`}>
                    {pushOn ? <><BellOff size={14} /> Turn off</> : <><Bell size={14} /> Turn on</>}
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </PageContainer>
  );
}
