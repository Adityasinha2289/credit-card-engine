/**
 * Your profile: the details RenoCred ranks cards on. Grouped into short panels,
 * nothing pre-filled that the user didn't tell us, and a save bar that appears
 * only when something changed.
 */
import { useMemo, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../../../lib/utils';
import { useDashboardStore } from '../store/dashboardStore';
import type { Occupation, PrimaryGoal } from '../types/dashboard.types';
import { PageContainer } from '../../../components/shared/PageContainer';
import { Panel, Pill } from '../../../components/shared/appUi';
import { PRIMARY_GOALS, normalizeGoal } from '../../../config/goals';
import { CATEGORIES_LIST } from '../../finix/lib/recommendEngine';

const OCCUPATIONS: Occupation[] = ['Salaried', 'Self-employed', 'Business Owner', 'Student', 'Other'];

const digits = (s: string) => s.replace(/[^\d]/g, '');
const lakhs = (n: number) => (n >= 100000 ? `₹${(n / 100000).toLocaleString('en-IN', { maximumFractionDigits: 1 })} lakh a year` : '');

function Field({ label, hint, children }: { label: string; hint?: ReactNode; children: ReactNode }) {
  return (
    <label className="block px-4 py-3.5 sm:px-5">
      <span className="block text-[13px] font-medium text-rc-muted">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[12px] text-rc-muted">{hint}</span>}
    </label>
  );
}

const inputCls = 'mt-1 h-10 w-full bg-transparent text-[16px] text-rc-ink outline-none placeholder:text-rc-ink/35';

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={cn('inline-flex h-10 items-center gap-1.5 rounded-full border px-4 text-[14px] transition-colors', on ? 'border-rc-ink bg-rc-ink text-rc-cream' : 'border-rc-ink/15 bg-white text-rc-ink hover:border-rc-ink/35')}
    >
      {on && <Check size={14} className="text-rc-pistachio" />}
      {children}
    </button>
  );
}

function Group({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="text-[15px] font-semibold text-rc-ink">{title}</h3>
      {note && <p className="mt-0.5 text-[13px] text-rc-muted">{note}</p>}
      <div className="mt-3">{children}</div>
    </section>
  );
}

/** `embedded`: the form without its own page frame, inside Account. */
export function ProfileTab({ embedded = false }: { embedded?: boolean } = {}) {
  const profile = useDashboardStore((s) => s.profile);
  const updateProfile = useDashboardStore((s) => s.updateProfile);

  const initial = useMemo(() => ({
    name: profile?.name ?? '',
    phone: profile?.phone ?? '',
    city: profile?.city ?? '',
    occupation: profile?.occupation,
    salary: profile?.salary ? String(profile.salary) : '',
    creditScore: profile?.creditScore ? String(profile.creditScore) : '',
    primaryGoal: (normalizeGoal(profile?.primaryGoal) as PrimaryGoal | undefined) ?? 'maximize_rewards',
    spendCategories: profile?.spendCategories ?? [],
  }), [profile]);

  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));
  const dirty = JSON.stringify(form) !== JSON.stringify(initial);

  const score = Number(form.creditScore);
  const scoreError = form.creditScore !== '' && (score < 300 || score > 900) ? 'CIBIL scores run from 300 to 900.' : '';
  const phoneError = form.phone !== '' && form.phone.length !== 10 ? 'Ten digits, without +91.' : '';

  const save = async () => {
    if (!profile) return;
    if (!form.name.trim()) return void toast.error('Add your name first.');
    if (scoreError || phoneError) return void toast.error(scoreError || phoneError);
    setSaving(true);
    try {
      await updateProfile({
        ...profile,
        name: form.name.trim(),
        phone: form.phone,
        city: form.city.trim() || undefined,
        occupation: form.occupation,
        salary: Number(form.salary) || 0,
        creditScore: Number(form.creditScore) || 0,
        primaryGoal: form.primaryGoal,
        spendCategories: form.spendCategories,
        onboardingCompleted: true,
      });
      toast.success('Saved. Your picks now use these details.');
    } catch {
      toast.error('Couldn’t save just now. Try again in a moment.');
    } finally {
      setSaving(false);
    }
  };

  const toggleCategory = (c: string) =>
    set('spendCategories', form.spendCategories.includes(c) ? form.spendCategories.filter((x) => x !== c) : [...form.spendCategories, c].slice(-4));

  const body = (
    <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
      <div className="space-y-8">
        <Group title="About you">
          <Panel className="divide-y divide-rc-ink/[0.07]">
            <Field label="Name">
              <input value={form.name} onChange={(e) => set('name', e.target.value)} autoComplete="name" className={inputCls} placeholder="Your name" />
            </Field>
            <Field label="Phone" hint={phoneError || 'Optional. Only for reminders you turn on.'}>
              <input value={form.phone} onChange={(e) => set('phone', digits(e.target.value).slice(0, 10))} inputMode="tel" autoComplete="tel-national" className={inputCls} placeholder="10-digit mobile number" />
            </Field>
            <Field label="City">
              <input value={form.city} onChange={(e) => set('city', e.target.value)} autoComplete="address-level2" className={inputCls} placeholder="e.g. Bengaluru" />
            </Field>
          </Panel>
        </Group>

        <Group title="Work" note="Some cards are only for salaried or self-employed applicants.">
          <div className="flex flex-wrap gap-2">
            {OCCUPATIONS.map((o) => <Chip key={o} on={form.occupation === o} onClick={() => set('occupation', form.occupation === o ? undefined : o)}>{o}</Chip>)}
          </div>
        </Group>

        <Group title="For approval checks" note="Used only to filter out cards you’re unlikely to get. We never pull your credit report.">
          <Panel className="divide-y divide-rc-ink/[0.07]">
            <Field label="Annual income" hint={lakhs(Number(form.salary)) || 'Before tax, in rupees.'}>
              <span className="mt-1 flex items-center gap-1">
                <span aria-hidden className="text-[16px] text-rc-ink/45">₹</span>
                <input value={form.salary ? Number(form.salary).toLocaleString('en-IN') : ''} onChange={(e) => set('salary', digits(e.target.value).slice(0, 10))} inputMode="numeric" className={cn(inputCls, 'mt-0')} placeholder="e.g. 12,00,000" />
              </span>
            </Field>
            <Field label="CIBIL score" hint={scoreError || 'Leave empty if you don’t know it.'}>
              <input value={form.creditScore} onChange={(e) => set('creditScore', digits(e.target.value).slice(0, 3))} inputMode="numeric" className={inputCls} placeholder="300 to 900" />
            </Field>
          </Panel>
        </Group>
      </div>

      <div className="space-y-8">
        <Group title="What you want from your cards">
          <div className="grid gap-2">
            {PRIMARY_GOALS.map((g) => {
              const on = form.primaryGoal === g.id;
              const Icon = g.icon;
              return (
                <button
                  key={g.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => set('primaryGoal', g.id as PrimaryGoal)}
                  className={cn('flex items-center gap-3.5 rounded-[20px] border px-4 py-3 text-left transition-colors', on ? 'border-rc-ink bg-rc-ink text-rc-cream' : 'border-rc-ink/[0.08] bg-rc-paper text-rc-ink hover:bg-white')}
                >
                  <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px]', on ? 'bg-rc-pistachio text-rc-ink' : 'bg-rc-ink/[0.06] text-rc-forest')}><Icon size={18} /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-medium">{g.title}</span>
                    <span className={cn('block text-[13px]', on ? 'text-rc-mist' : 'text-rc-muted')}>{g.description}</span>
                  </span>
                  {on && <Check size={18} className="shrink-0 text-rc-pistachio" />}
                </button>
              );
            })}
          </div>
        </Group>

        <Group title="What you spend most on" note="Up to four. Picks for you starts from these.">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES_LIST.map(({ value, label }) => <Chip key={value} on={form.spendCategories.includes(value)} onClick={() => toggleCategory(value)}>{label}</Chip>)}
          </div>
        </Group>
      </div>

      {/* save bar: only when something changed; above the phone tab bar */}
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
              <Pill variant="pistachio" onClick={save} disabled={saving} className="h-10">{saving ? 'Saving…' : 'Save'}</Pill>
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <PageContainer bare={embedded} eyebrow="Profile" title="Your details." subtitle="What RenoCred ranks cards on.">
      {body}
    </PageContainer>
  );
}
