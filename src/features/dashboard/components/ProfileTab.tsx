import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, ShieldCheck, Coins, Mail, Phone, CheckCircle2, UserCheck, Sparkles, Target, Briefcase, MapPin } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useDashboardStore } from '../store/dashboardStore';
import type { UserSegment, PrimaryGoal, Occupation } from '../types/dashboard.types';
import { ShareableScorecard } from './ShareableScorecard';

const AVATAR_SEEDS = ['Atharva', 'Aria', 'Kabir', 'Zoe', 'Rohan', 'Elena'];

const GOAL_LIST: PrimaryGoal[] = [
  'Maximise Cashback',
  'Travel Rewards',
  'Save More Money',
  'Build Credit Score',
  'Earn Reward Points',
];

const OCCUPATION_LIST: Occupation[] = [
  'Student',
  'Salaried',
  'Self-employed',
  'Business Owner',
  'Other',
];

function formatINR(val: number) {
  if (val >= 10000000) {
    return `₹${(val / 10000000).toFixed(1)} Cr`;
  }
  if (val >= 100000) {
    return `₹${(val / 100000).toFixed(1)} Lakh`;
  }
  return `₹${val.toLocaleString('en-IN')}`;
}

export function ProfileTab() {
  const profile = useDashboardStore((s) => s.profile);
  const updateProfile = useDashboardStore((s) => s.updateProfile);

  // Initial form values from store
  const [name, setName] = useState(profile?.name || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [avatarSeed, setAvatarSeed] = useState(() => {
    if (!profile?.avatar) return AVATAR_SEEDS[0];
    const match = profile.avatar.match(/seed=([^&]+)/);
    return match ? match[1] : AVATAR_SEEDS[0];
  });

  // Salary state (manual + slider)
  const [salary, setSalary] = useState(profile?.salary || 1500000);
  const [salaryInput, setSalaryInput] = useState(() => (profile?.salary || 1500000).toString());

  // Credit Score state (manual + slider)
  const [creditScore, setCreditScore] = useState(profile?.creditScore || 750);
  const [creditInput, setCreditInput] = useState(() => (profile?.creditScore || 750).toString());

  // User Segment & Personalization state
  const [userSegment, setUserSegment] = useState<UserSegment>(profile?.userSegment || 'adult');
  const [primaryGoal, setPrimaryGoal] = useState<PrimaryGoal>(profile?.primaryGoal || 'Maximise Cashback');
  const [occupation, setOccupation] = useState<Occupation | undefined>(profile?.occupation);
  const [city, setCity] = useState(profile?.city || '');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const avatarUrl = `https://api.dicebear.com/7.x/notionists/svg?seed=${avatarSeed}&backgroundColor=f8f9fa`;

  const handleSalarySliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setSalary(val);
    setSalaryInput(val.toString());
  };

  const handleSalaryInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valStr = e.target.value.replace(/[^0-9]/g, '');
    setSalaryInput(valStr);
    const val = parseInt(valStr, 10);
    if (!isNaN(val)) {
      setSalary(Math.min(100000000, Math.max(0, val)));
    }
  };

  const handleCreditSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setCreditScore(val);
    setCreditInput(val.toString());
  };

  const handleCreditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valStr = e.target.value.replace(/[^0-9]/g, '');
    setCreditInput(valStr);
    const val = parseInt(valStr, 10);
    if (!isNaN(val)) {
      setCreditScore(Math.min(900, Math.max(300, val)));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError('Please enter your name.');
    if (!email.trim() || !email.includes('@')) return setError('Please enter a valid email.');
    if (phone.length < 10) return setError('Please enter a valid 10-digit phone number.');

    updateProfile({
      id: profile?.id || '',
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      avatar: avatarUrl,
      salary,
      creditScore,
      userSegment,
      primaryGoal,
      occupation,
      city: city.trim() || undefined,
      onboardingCompleted: true,
    });
    setSuccess(true);
    setError('');

    setTimeout(() => {
      setSuccess(false);
    }, 3000);
  };

  return (
    <div className="flex flex-col gap-6 text-left max-w-2xl mx-auto py-4">
      <div>
        <h1 className="text-3xl font-display font-extrabold text-text-primary tracking-tight">
          Profile Settings
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Review and update your financial goals, income details, and personal contacts.
        </p>
      </div>

      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 p-4 bg-profit/10 border border-profit/25 rounded-2xl text-profit shadow-ag-glow-profit"
          >
            <CheckCircle2 size={18} />
            <p className="text-sm font-bold">Profile updated successfully!</p>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSave} className="surface-card p-6 lg:p-8 flex flex-col gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-36 h-36 bg-brand-emerald/5 rounded-full blur-2xl pointer-events-none" />

        {/* Name & Contact */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-text-secondary flex items-center gap-2">
              <User size={13} className="text-brand-emerald" /> Full Name
            </label>
            <input
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-premium w-full text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-text-secondary flex items-center gap-2">
                <Mail size={13} className="text-brand-emerald" /> Email Address
              </label>
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-premium w-full text-sm"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-text-secondary flex items-center gap-2">
                <Phone size={13} className="text-brand-emerald" /> Phone Number
              </label>
              <input
                type="tel"
                placeholder="10-digit number"
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                className="input-premium w-full text-sm"
                required
              />
            </div>
          </div>
        </div>

        {/* Avatar Select */}
        <div className="flex flex-col gap-1.5 border-t border-border-subtle  pt-4">
          <label className="text-xs font-bold text-text-secondary">Select Profile Avatar</label>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-brand-emerald bg-surface-secondary flex-shrink-0 shadow-ag-base">
              <img src={avatarUrl} alt="Preview Avatar" className="w-full h-full object-cover" />
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1 max-w-md">
              {AVATAR_SEEDS.map((seed) => (
                <button
                  key={seed}
                  type="button"
                  onClick={() => setAvatarSeed(seed)}
                  className={cn(
                    'w-9 h-9 rounded-full border flex-shrink-0 text-xs font-semibold flex items-center justify-center transition-all overflow-hidden',
                    avatarSeed === seed
                      ? 'border-brand-emerald shadow-ag-glow-primary ring-1 ring-brand-emerald/30'
                      : 'border-border-subtle hover:border-text-muted bg-surface-primary'
                  )}
                >
                  <img
                    src={`https://api.dicebear.com/7.x/notionists/svg?seed=${seed}&backgroundColor=f8f9fa`}
                    alt={seed}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Salary: Manual + Slider */}
        <div className="flex flex-col gap-1.5 pt-4 border-t border-border-subtle">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-text-secondary flex items-center gap-1.5">
              <Coins size={13} className="text-caution" /> Annual Income
            </label>
            <div className="relative w-36">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-text-muted">₹</span>
              <input
                type="text"
                value={salaryInput}
                onChange={handleSalaryInputChange}
                className="w-full input-premium py-1 pl-6 pr-2 text-right text-xs font-semibold"
              />
            </div>
          </div>
          <p className="text-[10px] text-brand-emerald font-bold self-end mt-0.5">
            Formatted: {formatINR(salary)} / year
          </p>
          <input
            type="range"
            min={100000}
            max={10000000}
            step={50000}
            value={salary}
            onChange={handleSalarySliderChange}
            className="w-full h-1.5 appearance-none rounded-lg outline-none cursor-pointer mt-1 bg-surface-elevated border border-border-subtle focus-visible:ring-2 focus-visible:ring-brand-emerald/50 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-brand-emerald [&::-webkit-slider-thumb]:shadow-ag-glow-primary hover:[&::-webkit-slider-thumb]:scale-110 transition-all"
            style={{ 
              backgroundImage: 'linear-gradient(#00E599, #00E599)', 
              backgroundSize: `${((salary - 100000) * 100) / (10000000 - 100000)}% 100%`, 
              backgroundRepeat: 'no-repeat' 
            }}
          />
        </div>

        {/* Credit Score: Manual + Slider */}
        <div className="flex flex-col gap-1.5 pt-4 border-t border-border-subtle">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-text-secondary flex items-center gap-1.5">
              <ShieldCheck size={13} className="text-profit" /> Credit Score (CIBIL)
            </label>
            <input
              type="text"
              maxLength={3}
              value={creditInput}
              onChange={handleCreditInputChange}
              className="w-20 input-premium py-1 px-2 text-right text-xs font-semibold"
            />
          </div>
          <p className="text-[10px] text-profit font-bold self-end mt-0.5">
            Rating: {creditScore >= 750 ? 'Excellent' : creditScore >= 700 ? 'Good' : creditScore >= 650 ? 'Fair' : 'Poor'}
          </p>
          <input
            type="range"
            min={300}
            max={900}
            step={1}
            value={creditScore}
            onChange={handleCreditSliderChange}
            className="w-full h-1.5 appearance-none rounded-lg outline-none cursor-pointer mt-1 bg-surface-elevated border border-border-subtle focus-visible:ring-2 focus-visible:ring-brand-emerald/50 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-brand-emerald [&::-webkit-slider-thumb]:shadow-ag-glow-primary hover:[&::-webkit-slider-thumb]:scale-110 transition-all"
            style={{ 
              backgroundImage: 'linear-gradient(#00E599, #00E599)', 
              backgroundSize: `${((creditScore - 300) * 100) / (900 - 300)}% 100%`, 
              backgroundRepeat: 'no-repeat' 
            }}
          />
        </div>

        {/* User Stage / Segment Selector */}
        <div className="flex flex-col gap-2 pt-4 border-t border-border-subtle">
          <label className="text-xs font-bold text-text-secondary flex items-center gap-1.5">
            <Sparkles size={13} className="text-brand-emerald" /> Financial Stage Segment
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setUserSegment('youth')}
              className={cn(
"flex-1 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-between cursor-pointer",
                userSegment === 'youth'
                  ?"bg-brand-emerald-muted border-brand-emerald text-brand-emerald shadow-[0_0_20px_rgba(4,59,39,0.3)]"
                  :"bg-surface border-border-subtle  text-text-muted hover:text-text-secondary"
              )}
            >
              <span>Youth (18–22)</span>
              {userSegment === 'youth' && <CheckCircle2 size={14} className="text-brand-emerald" />}
            </button>
            <button
              type="button"
              onClick={() => setUserSegment('adult')}
              className={cn(
"flex-1 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-between cursor-pointer",
                userSegment === 'adult'
                  ?"bg-brand-emerald-muted border-brand-emerald text-brand-emerald shadow-[0_0_20px_rgba(4,59,39,0.3)]"
                  :"bg-surface border-border-subtle  text-text-muted hover:text-text-secondary"
              )}
            >
              <span>Adult (22+)</span>
              {userSegment === 'adult' && <CheckCircle2 size={14} className="text-brand-emerald" />}
            </button>
          </div>
        </div>

        {/* Primary Goal Selector */}
        <div className="flex flex-col gap-2 pt-4 border-t border-border-subtle">
          <label className="text-xs font-bold text-text-secondary flex items-center gap-1.5">
            <Target size={13} className="text-brand-emerald" /> Primary Financial Goal
          </label>
          <div className="flex flex-wrap gap-2">
            {GOAL_LIST.map((goal) => (
              <button
                key={goal}
                type="button"
                onClick={() => setPrimaryGoal(goal)}
                className={cn(
"py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5",
                  primaryGoal === goal
                    ?"bg-brand-emerald-muted border-brand-emerald text-brand-emerald ring-1 ring-brand-emerald-glow shadow-[0_0_20px_rgba(4,59,39,0.3)]"
                    :"bg-surface border-border-subtle  text-text-muted hover:text-text-secondary"
                )}
              >
                <span>{goal}</span>
                {primaryGoal === goal && <CheckCircle2 size={12} className="text-brand-emerald" />}
              </button>
            ))}
          </div>
        </div>

        {/* Occupation & City */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border-subtle">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-text-secondary flex items-center gap-1.5">
              <Briefcase size={13} className="text-brand-emerald" /> Occupation
            </label>
            <select
              value={occupation || ''}
              onChange={(e) => setOccupation((e.target.value as Occupation) || undefined)}
              className="input-premium w-full text-xs py-2 bg-surface-primary"
            >
              <option value="">Select Occupation (Optional)</option>
              {OCCUPATION_LIST.map((occ) => (
                <option key={occ} value={occ}>{occ}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-text-secondary flex items-center gap-1.5">
              <MapPin size={13} className="text-brand-emerald" /> City
            </label>
            <input
              type="text"
              placeholder="e.g. Mumbai, Bengaluru"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="input-premium w-full text-xs py-2 bg-surface-primary"
            />
          </div>
        </div>

        {error && <p className="text-xs font-bold text-loss mt-1">{error}</p>}

        <button
          type="submit"
          className="mt-4 w-full btn-primary py-3 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(4,59,39,0.3)] active:scale-[0.98]"
        >
          <UserCheck size={16} /> Save Changes
        </button>
      </form>

      {/* ── Shareable Scorecard ─────────────────────────────────── */}
      <div className="mt-2 pt-5 border-t border-border-subtle">
        <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Share</p>
        <ShareableScorecard />
      </div>
    </div>
  );
}
