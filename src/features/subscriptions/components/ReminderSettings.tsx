/** How RenoCred reminds you before renewals and card bills: in the app, by email, by push. */
import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useShallow } from 'zustand/shallow';
import { toast } from 'sonner';
import { useDashboardStore } from '../../dashboard/store/dashboardStore';
import { useIsDemo } from '../../demo/DemoAppProvider';
import {
  loadPrefs, savePrefs, pushSupport, enablePush, disablePush, currentPushSubscription, sendTestPush,
  DEFAULT_PREFS, type ReminderPrefs, type PushSupport,
} from '../notifications';
import { cn } from '../../../lib/utils';

function Switch({ on, disabled, onClick, label }: { on: boolean; disabled?: boolean; onClick: () => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} disabled={disabled} onClick={onClick} className="shrink-0 disabled:opacity-40">
      <span className={cn('relative block h-7 w-12 rounded-full transition-colors', on ? 'bg-rc-forest' : 'bg-rc-ink/15')}>
        <span className={cn('absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-[left] duration-300', on ? 'left-6' : 'left-1')} />
      </span>
    </button>
  );
}

const PUSH_REASON: Record<string, string> = {
  denied: 'Blocked in your browser settings',
  'ios-needs-install': 'On iPhone, add RenoCred to your Home Screen first',
  'not-configured': 'Not available yet',
  'no-browser-support': 'This browser doesn’t support it',
};

export function ReminderSettings() {
  const { profile, supabaseClient } = useDashboardStore(useShallow((s) => ({ profile: s.profile, supabaseClient: s.supabaseClient })));
  const isDemo = useIsDemo();
  const { getToken } = useAuth();
  const [prefs, setPrefs] = useState<ReminderPrefs>(DEFAULT_PREFS);
  const [push, setPush] = useState<PushSupport | null>(null);
  const [pushOn, setPushOn] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!profile?.id || isDemo) return;
    void loadPrefs(supabaseClient as never, profile.id).then(setPrefs);
    void pushSupport().then(setPush);
    void currentPushSubscription().then((s) => setPushOn(!!s));
  }, [profile?.id, supabaseClient, isDemo]);

  const toggleEmail = async () => {
    if (!profile) return;
    const next = !prefs.emailEnabled;
    setPrefs((p) => ({ ...p, emailEnabled: next }));
    if (!(await savePrefs(supabaseClient as never, profile.id, { emailEnabled: next }))) {
      toast.error('Couldn’t save that just now.');
      setPrefs((p) => ({ ...p, emailEnabled: !next }));
    }
  };

  const togglePush = async () => {
    setBusy(true);
    try {
      if (pushOn) {
        await disablePush(() => getToken());
        setPushOn(false);
        toast.success('Push reminders are off on this device.');
      } else {
        const r = await enablePush(() => getToken());
        if (r.ok) {
          setPushOn(true);
          toast.success('Push reminders are on for this device.');
        } else {
          toast.error(PUSH_REASON[r.error] ?? `Couldn’t turn on push: ${r.error}`);
          setPush(await pushSupport());
        }
      }
    } finally {
      setBusy(false);
    }
  };

  const pushNote = push && !push.supported ? PUSH_REASON[push.reason] : pushOn ? 'On · quiet from 10pm to 8am' : 'Off';

  return (
    <div className="divide-y divide-rc-ink/[0.07] overflow-hidden rounded-[24px] border border-rc-ink/[0.08] bg-rc-paper">
      <div className="flex items-center gap-4 px-5 py-4">
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-medium text-rc-ink">In RenoCred</p>
          <p className="text-[13px] text-rc-muted">Always on. Overview lists what’s due this week.</p>
        </div>
        <Switch on disabled onClick={() => undefined} label="In-app reminders" />
      </div>
      <div className="flex items-center gap-4 px-5 py-4">
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-medium text-rc-ink">Email</p>
          <p className="truncate text-[13px] text-rc-muted">A morning note to {profile?.email || 'your email'}</p>
        </div>
        <Switch on={prefs.emailEnabled} onClick={() => void toggleEmail()} label="Email reminders" disabled={isDemo} />
      </div>
      <div className="flex items-center gap-4 px-5 py-4">
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-medium text-rc-ink">Push on this device</p>
          <p className="text-[13px] text-rc-muted">{pushNote}</p>
          {pushOn && (
            <button
              type="button"
              onClick={async () => { if (await sendTestPush(() => getToken())) toast.success('Test sent'); else toast.error('Couldn’t send a test. Try turning push off and on.'); }}
              className="mt-1 text-[13px] font-medium text-rc-forest underline underline-offset-2"
            >
              Send a test
            </button>
          )}
        </div>
        <Switch on={pushOn} onClick={() => void togglePush()} label="Push reminders" disabled={isDemo || busy || (!!push && !push.supported && push.reason !== 'denied')} />
      </div>
    </div>
  );
}
