import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { useShallow } from 'zustand/shallow';
import { toast } from 'sonner';
import { Bell, Pause, Play, Pencil, Plus, Repeat, X, ExternalLink, Sparkles, Mail, Smartphone } from 'lucide-react';
import { Amount, EmptyState, HeadAction, IconTile, Pill, Row, RowList, SectionHead } from '../../../components/shared/appUi';
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

export default function SubscriptionsPage({ embedded = false }: { embedded?: boolean }) {
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
  const field = 'mt-1.5 h-12 w-full rounded-full border border-rc-ink/15 bg-white px-5 text-[16px] font-normal text-rc-ink outline-none focus:border-rc-forest/50';
  const fieldLabel = 'block text-[13px] font-medium text-rc-muted';
  const toggleCls = (on: boolean) => `relative h-7 w-12 shrink-0 rounded-full transition-colors ${on ? 'bg-rc-forest' : 'bg-rc-ink/15'}`;
  const knob = (on: boolean) => `absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-[left] duration-300 ${on ? 'left-6' : 'left-1'}`;

  return (
    <PageContainer bare={embedded} eyebrow="Money" title={<>Every renewal, <span className="italic">before it hits.</span></>} subtitle="Track what you pay for and we'll remind you before each charge, and before free trials turn paid." className="pb-safe">
      <div className="grid gap-9 lg:grid-cols-[1.3fr_1fr] lg:gap-10">
        <div className="space-y-9">
          {/* what it all costs */}
          <section aria-label="Totals" className="grid grid-cols-3 gap-2.5 sm:gap-4">
            {[
              { value: formatRupees(perMonth), label: 'a month' },
              { value: formatRupees(perYear), label: 'a year' },
              { value: running.length, label: running.length === 1 ? 'active' : 'active' },
            ].map((t) => (
              <div key={t.label + String(t.value)} className="rounded-[22px] border border-rc-ink/[0.08] bg-rc-paper px-3.5 py-4 sm:px-5">
                <p className="truncate font-serif text-[22px] font-semibold leading-none tabular-nums lining-nums text-rc-ink sm:text-[30px]">{t.value}</p>
                <p className="mt-2 text-[12px] text-rc-muted sm:text-[13px]">{t.label}</p>
              </div>
            ))}
          </section>

          {/* found in your transactions */}
          {suggestions.length > 0 && (
            <section>
              <SectionHead title="Looks like a subscription" note="Charged the same amount on a regular cycle." />
              <RowList>
                {suggestions.slice(0, 5).map((x) => (
                  <div key={x.merchantKey} className="px-4 py-3.5 sm:px-5">
                    <div className="flex items-start gap-3.5">
                      <IconTile icon={Sparkles} tone="good" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[15px] font-medium text-rc-ink">{x.name} · {formatRupees(x.amount)}/{CYCLE_LABEL[x.billingCycle]}</p>
                        <p className="mt-0.5 text-[13px] leading-snug text-rc-muted">
                          Charged {x.occurrences} times, last on {x.lastChargedOn}. Next expected {x.nextBillingDate}.
                          {x.hasPriceHike && x.previousAmount ? ` Price went up from ${formatRupees(x.previousAmount)}.` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex justify-end gap-2">
                      <Pill variant="ghost" className="h-10" onClick={() => dismissSuggestion(x.merchantKey)}>Not one</Pill>
                      <Pill className="h-10" onClick={() => addFromSuggestion(x)}>Track it</Pill>
                    </div>
                  </div>
                ))}
              </RowList>
            </section>
          )}

          {/* the list */}
          <section>
            <SectionHead title="Your subscriptions" action={!form && <HeadAction onClick={() => openAdd()}><Plus size={14} /> Add</HeadAction>} />

            {form && (
              <form onSubmit={submit} className="mb-4 rounded-[26px] border border-rc-ink/[0.08] bg-rc-paper p-4 sm:p-5">
                {!form.id && (
                  <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] sm:-mx-5 sm:px-5 [&::-webkit-scrollbar]:hidden">
                    {SUBSCRIPTION_PRESETS.slice(0, 10).map((p) => (
                      <button type="button" key={p.key} onClick={() => openAdd(p)}
                        className={`h-9 shrink-0 rounded-full border px-3.5 text-[13px] ${form.name === p.name ? 'border-rc-ink bg-rc-ink text-rc-cream' : 'border-rc-ink/15 bg-white text-rc-ink'}`}>
                        {p.name}
                      </button>
                    ))}
                  </div>
                )}
                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                  <label className={fieldLabel}>Name
                    <input className={field} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Netflix" />
                  </label>
                  <label className={fieldLabel}>Amount per charge
                    <input className={field} inputMode="decimal" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="₹649" />
                  </label>
                  <label className={fieldLabel}>Billed every
                    <select className={field} value={form.billingCycle} onChange={(e) => setForm({ ...form, billingCycle: e.target.value as BillingCycle })}>
                      {(['weekly', 'monthly', 'quarterly', 'yearly'] as const).map((c) => <option key={c} value={c}>{CYCLE_LABEL[c]}</option>)}
                    </select>
                  </label>
                  <label className={fieldLabel}>Paid with
                    <select className={field} value={form.cardId} onChange={(e) => setForm({ ...form, cardId: e.target.value })}>
                      <option value="">UPI / bank account</option>
                      {userCards.map((c) => <option key={c.id} value={c.id}>{c.label || c.bank}</option>)}
                    </select>
                  </label>
                  <button type="button" role="switch" aria-checked={form.isFreeTrial} onClick={() => setForm({ ...form, isFreeTrial: !form.isFreeTrial })} className="flex items-center justify-between gap-3 rounded-full border border-rc-ink/15 bg-white py-2 pl-5 pr-2 text-left text-[15px] text-rc-ink sm:col-span-2">
                    This is a free trial
                    <span className={toggleCls(form.isFreeTrial)}><span className={knob(form.isFreeTrial)} /></span>
                  </button>
                  {form.isFreeTrial ? (
                    <label className={fieldLabel}>Trial ends on
                      <input type="date" min={today} className={field} value={form.trialEndsOn} onChange={(e) => setForm({ ...form, trialEndsOn: e.target.value })} />
                    </label>
                  ) : (
                    <label className={fieldLabel}>Next charge on
                      <input type="date" className={field} value={form.nextBillingDate} onChange={(e) => setForm({ ...form, nextBillingDate: e.target.value })} />
                    </label>
                  )}
                  <div className={fieldLabel}>Remind me
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {LEAD_OPTIONS.map((d) => {
                        const on = form.reminderDays.includes(d);
                        return (
                          <button type="button" key={d} aria-pressed={on}
                            onClick={() => setForm({ ...form, reminderDays: on ? form.reminderDays.filter((x) => x !== d) : [...form.reminderDays, d] })}
                            className={`h-10 rounded-full border px-3.5 text-[13px] font-medium ${on ? 'border-rc-ink bg-rc-ink text-rc-cream' : 'border-rc-ink/15 bg-white text-rc-ink'}`}>
                            {d === 0 ? 'Same day' : `${d} days before`}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div className="mt-5 flex justify-end gap-2">
                  <Pill variant="ghost" onClick={() => setForm(null)}>Cancel</Pill>
                  <Pill type="submit">{form.id ? 'Save' : 'Add subscription'}</Pill>
                </div>
              </form>
            )}

            {rows.length === 0 && !form ? (
              <EmptyState icon={Repeat} title="Nothing tracked yet" note="Add what you pay for and we’ll remind you before each renewal, and before free trials turn into charges." action={<Pill onClick={() => openAdd()}><Plus size={16} /> Add a subscription</Pill>} />
            ) : (
              <RowList>
                {rows.map(({ s, due, days }) => {
                  const paused = s.status === 'paused';
                  const card = userCards.find((c) => c.id === s.cardId);
                  const cancelUrl = s.cancelUrl ?? getCancelUrl(s.name);
                  return (
                    <div key={s.id} className={`px-4 py-3.5 sm:px-5 ${paused ? 'opacity-60' : ''}`}>
                      <div className="flex items-start gap-3.5">
                        <span aria-hidden className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-rc-ink font-serif text-[18px] font-semibold text-rc-pistachio">{s.name.charAt(0).toUpperCase()}</span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <p className="text-[15px] font-medium text-rc-ink">{s.name}</p>
                            {s.isFreeTrial && <span className="rounded-full bg-[#B7791F]/12 px-2 py-0.5 text-[11px] font-semibold text-[#9A6412]">Free trial</span>}
                            {s.hasPriceHike && <span className="rounded-full bg-[#C2410C]/10 px-2 py-0.5 text-[11px] font-semibold text-[#C2410C]">Price up</span>}
                            {paused && <span className="rounded-full bg-rc-ink/[0.06] px-2 py-0.5 text-[11px] font-semibold text-rc-muted">Paused</span>}
                          </div>
                          <p className="mt-0.5 truncate text-[13px] text-rc-muted">
                            {card ? (card.label || card.bank) : 'UPI / bank'}
                            {s.billingCycle !== 'yearly' && ` · ${formatRupees(yearlyCost(s.amount, s.billingCycle))} a year`}
                          </p>
                          {!paused && due && days !== null && (
                            <p className={`mt-0.5 text-[13px] ${days <= 3 ? 'font-medium text-[#9A6412]' : 'text-rc-muted'}`}>
                              {s.isFreeTrial ? 'Trial ends' : 'Renews'} {whenLabel(days).toLowerCase()}
                              {(s.reminderDays?.length ?? 0) === 0 && ' · no reminders'}
                            </p>
                          )}
                        </div>
                        <p className="shrink-0 text-right"><Amount>{formatRupees(s.amount)}</Amount><span className="block text-[12px] text-rc-muted">/{CYCLE_LABEL[s.billingCycle]}</span></p>
                      </div>
                      <div className="mt-2 flex justify-end gap-1">
                        <button title="Edit" aria-label={`Edit ${s.name}`} onClick={() => openEdit(s)} className="flex h-9 items-center gap-1.5 rounded-full px-3 text-[13px] text-rc-ink hover:bg-rc-ink/[0.06]"><Pencil size={14} /> Edit</button>
                        <button aria-label={paused ? `Resume ${s.name}` : `Pause ${s.name}`}
                          onClick={() => void updateSubscription(s.id, { status: paused ? 'active' : 'paused' })}
                          className="flex h-9 items-center gap-1.5 rounded-full px-3 text-[13px] text-rc-ink hover:bg-rc-ink/[0.06]">{paused ? <><Play size={14} /> Resume</> : <><Pause size={14} /> Pause</>}</button>
                        <button aria-label={`Cancel ${s.name}`} onClick={() => cancel(s)}
                          className="flex h-9 items-center gap-1.5 rounded-full px-3 text-[13px] text-[#C2410C] hover:bg-[#C2410C]/10">{cancelUrl ? <><ExternalLink size={14} /> Cancel</> : <><X size={14} /> Stop</>}</button>
                      </div>
                    </div>
                  );
                })}
              </RowList>
            )}
          </section>
        </div>

        {/* how we remind you */}
        {!isDemo && (
          <section className="lg:pt-[118px]">
            <SectionHead title="How we remind you" />
            <RowList>
              <Row icon={Bell} title="In RenoCred" note="Always on: Overview and Money show what renews this week" />
              <button type="button" role="switch" aria-checked={prefs.emailEnabled} onClick={() => void togglePref('emailEnabled')} className="flex w-full items-center gap-3.5 px-4 py-3.5 text-left sm:px-5">
                <IconTile icon={Mail} />
                <span className="min-w-0 flex-1"><span className="block text-[15px] font-medium text-rc-ink">Email</span><span className="block truncate text-[13px] text-rc-muted">A morning digest to {profile?.email || 'your email'}</span></span>
                <span className={toggleCls(prefs.emailEnabled)}><span className={knob(prefs.emailEnabled)} /></span>
              </button>
              <div className="flex items-center gap-3.5 px-4 py-3.5 sm:px-5">
                <IconTile icon={Smartphone} />
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-medium text-rc-ink">Push on this device</span>
                  <span className="block text-[13px] text-rc-muted">
                    {push && !push.supported
                      ? { denied: 'Blocked in browser settings', 'ios-needs-install': 'Add to Home Screen first (iPhone)', 'not-configured': 'Not available yet', 'no-browser-support': 'Not supported in this browser' }[push.reason]
                      : pushOn ? 'On · quiet 10pm–8am' : 'Off'}
                  </span>
                  {pushOn && (
                    <button
                      type="button"
                      onClick={async () => {
                        if (await sendTestPush(() => getToken())) toast.success('Test notification sent');
                        else toast.error("Couldn't send a test notification. Try turning push off and on again.");
                      }}
                      className="mt-1 text-[13px] font-medium text-rc-forest underline underline-offset-2"
                    >
                      Send a test
                    </button>
                  )}
                </span>
                <button type="button" role="switch" aria-checked={pushOn} aria-label="Push notifications" disabled={busy || (!!push && !push.supported && push.reason !== 'denied')} onClick={() => void togglePush()} className="disabled:opacity-40">
                  <span className={`${toggleCls(pushOn)} block`}><span className={knob(pushOn)} /></span>
                </button>
              </div>
            </RowList>
          </section>
        )}
      </div>
    </PageContainer>
  );
}
