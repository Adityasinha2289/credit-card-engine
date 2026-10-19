/**
 * Your details on Account: name, phone, city and work. (Income lives on the
 * Money receipt and your CIBIL score next to Picks, where they're used.)
 * A save bar appears only when something changed.
 */
import { useMemo, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../../../lib/utils';
import { useDashboardStore } from '../store/dashboardStore';
import type { Occupation } from '../types/dashboard.types';

const OCCUPATIONS: Occupation[] = ['Salaried', 'Self-employed', 'Business Owner', 'Student', 'Other'];
const digits = (s: string) => s.replace(/[^\d]/g, '');
const inputCls = 'mt-1 h-10 w-full bg-transparent text-[16px] text-rc-ink outline-none placeholder:text-rc-ink/35';

function Field({ label, hint, children }: { label: string; hint?: ReactNode; children: ReactNode }) {
  return (
    <label className="block px-5 py-3.5">
      <span className="block text-[13px] font-medium text-rc-muted">{label}</span>
      {children}
      {hint && <span className="mt-0.5 block text-[12px] text-rc-muted">{hint}</span>}
    </label>
  );
}

export function ProfileTab(_props: { embedded?: boolean } = {}) {
  const profile = useDashboardStore((s) => s.profile);
  const updateProfile = useDashboardStore((s) => s.updateProfile);

  const initial = useMemo(() => ({
    name: profile?.name ?? '',
    phone: profile?.phone ?? '',
    city: profile?.city ?? '',
    occupation: profile?.occupation,
  }), [profile]);
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));
  const dirty = JSON.stringify(form) !== JSON.stringify(initial);
  const phoneError = form.phone !== '' && form.phone.length !== 10 ? 'Ten digits, without +91.' : '';

  const save = async () => {
    if (!profile) return;
    if (!form.name.trim()) return void toast.error('Add your name first.');
    if (phoneError) return void toast.error(phoneError);
    setSaving(true);
    try {
      await updateProfile({ ...profile, name: form.name.trim(), phone: form.phone, city: form.city.trim() || undefined, occupation: form.occupation, onboardingCompleted: true });
      toast.success('Saved');
    } catch {
      toast.error('Couldn’t save just now. Try again in a moment.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="divide-y divide-rc-ink/[0.07] overflow-hidden rounded-[24px] border border-rc-ink/[0.08] bg-rc-paper">
        <Field label="Name">
          <input value={form.name} onChange={(e) => set('name', e.target.value)} autoComplete="name" className={inputCls} placeholder="Your name" />
        </Field>
        <Field label="Phone" hint={phoneError || 'Optional. Only for reminders you turn on.'}>
          <input value={form.phone} onChange={(e) => set('phone', digits(e.target.value).slice(0, 10))} inputMode="tel" autoComplete="tel-national" className={inputCls} placeholder="10-digit mobile number" />
        </Field>
        <Field label="City">
          <input value={form.city} onChange={(e) => set('city', e.target.value)} autoComplete="address-level2" className={inputCls} placeholder="e.g. Bengaluru" />
        </Field>
      </div>

      <div>
        <p className="text-[13px] font-medium text-rc-muted">Work <span className="font-normal">· some cards are only for salaried or self-employed people</span></p>
        <div className="mt-2 flex flex-wrap gap-2">
          {OCCUPATIONS.map((o) => {
            const on = form.occupation === o;
            return (
              <button key={o} type="button" aria-pressed={on} onClick={() => set('occupation', on ? undefined : o)}
                className={cn('inline-flex h-10 items-center gap-1.5 rounded-full border px-4 text-[14px] transition-colors', on ? 'border-rc-ink bg-rc-ink text-rc-cream' : 'border-rc-ink/15 bg-white text-rc-ink hover:border-rc-ink/35')}>
                {on && <Check size={14} className="text-rc-pistachio" />}{o}
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {dirty && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 34 }}
            className="fixed inset-x-3 bottom-[calc(76px+env(safe-area-inset-bottom))] z-50 mx-auto flex max-w-md items-center justify-between gap-3 rounded-full bg-rc-ink py-2 pl-5 pr-2 text-rc-cream shadow-[0_20px_50px_-15px_rgba(0,0,0,0.6)] md:bottom-8"
          >
            <span className="text-[14px]">Unsaved changes</span>
            <span className="flex gap-1.5">
              <button type="button" onClick={() => setForm(initial)} className="h-10 rounded-full px-4 text-[14px] text-rc-mist hover:text-rc-cream">Undo</button>
              <button type="button" onClick={() => void save()} disabled={saving} className="h-10 rounded-full bg-rc-pistachio px-5 text-[14px] font-semibold text-rc-ink disabled:opacity-50">{saving ? 'Saving…' : 'Save'}</button>
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
