import { useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { useDashboardStore } from '../../dashboard/store/dashboardStore';

/**
 * Optional, in-app follow-up to the 2-step onboarding. Income, CIBIL and age
 * only sharpen card-approval odds and safe-to-spend, so we ask here — once,
 * dismissibly — instead of blocking sign-up on them.
 */
const CIBIL_BANDS: { id: string; label: string; score: number }[] = [
  { id: 'unknown', label: "I don't know", score: 0 },
  { id: '<650', label: 'Below 650', score: 600 },
  { id: '650-699', label: '650–699', score: 650 },
  { id: '700-749', label: '700–749', score: 700 },
  { id: '750+', label: '750+', score: 750 },
];
const AGE_BANDS = ['18-22', '23-30', '31-45', '46+'];
const DISMISS_KEY = 'renocred:sharpen-dismissed';

export function SharpenProfileCard() {
  const profile = useDashboardStore((s) => s.profile);
  const updateProfile = useDashboardStore((s) => s.updateProfile);
  const [dismissed, setDismissed] = useState(() => {
    try { return localStorage.getItem(DISMISS_KEY) === '1'; } catch { return false; }
  });
  const [income, setIncome] = useState('');
  const [cibil, setCibil] = useState<string>(profile?.cibilBand ?? '');
  const [age, setAge] = useState<string>(profile?.ageBand ?? '');

  const missingIncome = !profile?.salary;
  const missingCibil = !profile?.creditScore && profile?.cibilBand !== 'unknown';
  const missingAge = !profile?.ageBand;
  if (!profile || dismissed || (!missingIncome && !missingCibil && !missingAge)) return null;

  const dismiss = () => {
    setDismissed(true);
    try { localStorage.setItem(DISMISS_KEY, '1'); } catch { /* private mode */ }
  };

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const monthly = parseFloat(income.replace(/,/g, ''));
    const band = CIBIL_BANDS.find((b) => b.id === cibil);
    void updateProfile({
      ...profile,
      // Lower bound of the band — conservative for eligibility checks.
      salary: monthly > 0 ? Math.round(monthly * 12) : profile.salary,
      creditScore: band ? band.score || profile.creditScore : profile.creditScore,
      cibilBand: band?.id ?? profile.cibilBand,
      ageBand: age || profile.ageBand,
      userSegment: age === '18-22' ? 'youth' : age ? 'adult' : profile.userSegment,
    });
    dismiss();
  };

  return (
    <section className="relative z-10 bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
      <button onClick={dismiss} aria-label="Dismiss" className="absolute top-3 right-3 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100">
        <X size={14} />
      </button>
      <div className="flex items-start gap-3 mb-4">
        <div className="w-9 h-9 rounded-full bg-[#2A9D5C]/10 flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4 text-[#2A9D5C]" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-900">Sharpen your recommendations</h3>
          <p className="text-sm text-gray-600">Optional. Helps us show cards you're likely to be approved for and what's safe to spend.</p>
        </div>
      </div>
      <form onSubmit={save} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {missingIncome && (
          <label className="text-xs font-bold text-gray-500">Monthly take-home (₹)
            <input inputMode="numeric" value={income} onChange={(e) => setIncome(e.target.value)} placeholder="e.g. 75,000"
              className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm font-normal text-gray-900" />
          </label>
        )}
        {missingCibil && (
          <label className="text-xs font-bold text-gray-500">Credit score (CIBIL)
            <select value={cibil} onChange={(e) => setCibil(e.target.value)}
              className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm font-normal text-gray-900 bg-white">
              <option value="">Select…</option>
              {CIBIL_BANDS.map((b) => <option key={b.id} value={b.id}>{b.label}</option>)}
            </select>
          </label>
        )}
        {missingAge && (
          <label className="text-xs font-bold text-gray-500">Age
            <select value={age} onChange={(e) => setAge(e.target.value)}
              className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm font-normal text-gray-900 bg-white">
              <option value="">Select…</option>
              {AGE_BANDS.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </label>
        )}
        <div className="sm:col-span-3 flex justify-end">
          <button type="submit" disabled={!income && !cibil && !age}
            className="px-4 py-2 rounded-xl bg-gray-900 text-white text-sm font-medium disabled:opacity-40">
            Save
          </button>
        </div>
      </form>
    </section>
  );
}
