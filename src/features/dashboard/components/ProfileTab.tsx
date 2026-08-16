import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Sparkles } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useDashboardStore } from '../store/dashboardStore';
import type { UserSegment, PrimaryGoal, Occupation } from '../types/dashboard.types';
import { PageContainer } from '../../../components/shared/PageContainer';
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

  const [name, setName] = useState(profile?.name || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [avatarSeed, setAvatarSeed] = useState(() => {
    if (!profile?.avatar) return AVATAR_SEEDS[0];
    const match = profile.avatar.match(/seed=([^&]+)/);
    return match ? match[1] : AVATAR_SEEDS[0];
  });

  const [salary, setSalary] = useState(profile?.salary || 1500000);
  const [salaryInput, setSalaryInput] = useState(() => (profile?.salary || 1500000).toString());

  const [creditScore, setCreditScore] = useState(profile?.creditScore || 750);
  const [creditInput, setCreditInput] = useState(() => (profile?.creditScore || 750).toString());

  const [userSegment, setUserSegment] = useState<UserSegment>(profile?.userSegment || 'adult');
  const [primaryGoal, setPrimaryGoal] = useState<PrimaryGoal>(profile?.primaryGoal || 'Maximise Cashback');
  const [occupation, setOccupation] = useState<Occupation | undefined>(profile?.occupation);
  const [isOccupationDropdownOpen, setIsOccupationDropdownOpen] = useState(false);
  const [city, setCity] = useState(profile?.city || '');
  const [spendCategories] = useState<string[]>(profile?.spendCategories || []);

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
      spendCategories,
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
    <PageContainer
      eyebrow="Profile"
      title="Your financial identity."
      subtitle="Keep your profile and financial context up to date so RenoCred can make better decisions for you."
      className="text-[#F2F4F2] font-body selection:bg-[#237E45]/30 selection:text-white"
    >
      {/* Global Background Atmosphere */}
      <div className="fixed inset-0 pointer-events-none z-[-1] bg-[#050806]" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 relative">
        <div className="lg:col-span-8">
          <form onSubmit={handleSave} className="space-y-12">
            
            {/* IDENTITY SECTION */}
            <section className="space-y-8">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] md:text-xs font-bold tracking-widest uppercase text-[#737C77]">Identity</span>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-8 items-start">
                <div className="flex-shrink-0 flex flex-col gap-4">
                  <div className="w-24 h-24 rounded-full overflow-hidden border border-white/[0.08] bg-white/[0.02] shadow-xl">
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex gap-2 overflow-x-auto max-w-[12rem] p-1.5 pb-2.5 -ml-1.5 hide-scrollbar">
                    {AVATAR_SEEDS.map(seed => (
                      <button
                        key={seed}
                        type="button"
                        onClick={() => setAvatarSeed(seed)}
                        className={cn(
                          'w-8 h-8 aspect-square rounded-full flex-shrink-0 transition-all overflow-hidden',
                          avatarSeed === seed
                            ? 'ring-2 ring-offset-2 ring-offset-[#050806] ring-[#237E45]'
                            : 'border border-white/[0.08] hover:border-white/30 opacity-70 hover:opacity-100'
                        )}
                      >
                        <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${seed}&backgroundColor=f8f9fa`} alt={seed} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex-1 space-y-8 w-full">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-[#737C77] uppercase tracking-wider">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-transparent border-b border-white/[0.08] focus:border-[#237E45] pb-2 text-white/90 text-lg outline-none transition-colors"
                      placeholder="Your Name"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                    <div className="space-y-2 sm:col-span-2">
                      <label className="text-xs font-medium text-[#737C77] uppercase tracking-wider">Email Address</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-transparent border-b border-white/[0.08] focus:border-[#237E45] pb-2 text-white/90 text-sm outline-none transition-colors"
                        placeholder="email@example.com"
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-1">
                      <label className="text-xs font-medium text-[#737C77] uppercase tracking-wider">Phone Number</label>
                      <input
                        type="tel"
                        maxLength={10}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                        className="w-full bg-transparent border-b border-white/[0.08] focus:border-[#237E45] pb-2 text-white/90 outline-none transition-colors"
                        placeholder="+91 XXXXX XXXXX"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <hr className="border-white/[0.04]" />

            {/* FINANCIAL PROFILE SECTION */}
            <section className="space-y-8">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] md:text-xs font-bold tracking-widest uppercase text-[#737C77]">Financial Profile</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {/* Income */}
                 <div className="bg-[#07120D] border border-white/[0.04] p-6 rounded-[24px] flex flex-col justify-between gap-6 hover:bg-[#081A12] hover:border-[#237E45]/20 transition-all">
                    <div>
                      <h4 className="text-sm font-medium text-white/50 mb-1">Annual income</h4>
                      <div className="flex items-baseline gap-2">
                         <span className="text-2xl font-display text-white">{formatINR(salary)}</span>
                         <span className="text-sm text-white/40">/ year</span>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                       <div className="flex justify-between items-center relative">
                         <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm">₹</span>
                         <input
                           type="text"
                           value={salaryInput}
                           onChange={handleSalaryInputChange}
                           className="w-full bg-[#050806] border border-white/[0.04] rounded-[12px] py-2 pl-7 pr-3 text-white/90 text-sm outline-none focus:border-[#237E45]/50 transition-colors"
                         />
                       </div>
                       <input
                          type="range"
                          min={100000}
                          max={10000000}
                          step={50000}
                          value={salary}
                          onChange={handleSalarySliderChange}
                          className="w-full h-1 appearance-none rounded-full outline-none cursor-pointer bg-white/[0.04] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#237E45] transition-all"
                          style={{ 
                            backgroundImage: 'linear-gradient(#237E45, #237E45)', 
                            backgroundSize: `${((salary - 100000) * 100) / (10000000 - 100000)}% 100%`, 
                            backgroundRepeat: 'no-repeat' 
                          }}
                        />
                    </div>
                 </div>

                 {/* CIBIL */}
                 <div className="bg-[#07120D] border border-white/[0.04] p-6 rounded-[24px] flex flex-col justify-between gap-6 hover:bg-[#081A12] hover:border-[#237E45]/20 transition-all">
                    <div>
                      <h4 className="text-sm font-medium text-white/50 mb-1">CIBIL score</h4>
                      <div className="flex items-center gap-3">
                         <span className="text-2xl font-display text-white">{creditScore}</span>
                         <span className="text-sm font-medium text-[#237E45]">
                           {creditScore >= 750 ? '· Excellent' : creditScore >= 700 ? '· Good' : creditScore >= 650 ? '· Fair' : '· Poor'}
                         </span>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                       <input
                         type="text"
                         maxLength={3}
                         value={creditInput}
                         onChange={handleCreditInputChange}
                         className="w-full bg-[#050806] border border-white/[0.04] rounded-[12px] py-2 px-3 text-white/90 text-sm outline-none focus:border-[#237E45]/50 transition-colors"
                       />
                       <input
                          type="range"
                          min={300}
                          max={900}
                          step={1}
                          value={creditScore}
                          onChange={handleCreditSliderChange}
                          className="w-full h-1 appearance-none rounded-full outline-none cursor-pointer bg-white/[0.04] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#237E45] transition-all"
                          style={{ 
                            backgroundImage: 'linear-gradient(#237E45, #237E45)', 
                            backgroundSize: `${((creditScore - 300) * 100) / (900 - 300)}% 100%`, 
                            backgroundRepeat: 'no-repeat' 
                          }}
                        />
                    </div>
                 </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                <div className="space-y-3">
                  <label className="text-xs font-medium text-[#737C77] uppercase tracking-wider">Financial Stage</label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setUserSegment('youth')}
                      className={cn(
                        "flex-1 p-4 rounded-[20px] border text-left transition-all",
                        userSegment === 'youth'
                          ? "bg-[#237E45]/5 border-[#237E45]/30"
                          : "bg-[#07120D] border-white/[0.04] hover:bg-white/[0.02]"
                      )}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className={cn("font-medium", userSegment === 'youth' ? "text-[#237E45]" : "text-white/90")}>Youth</div>
                          <div className="text-xs text-white/50 mt-1">18–22</div>
                        </div>
                        {userSegment === 'youth' && <CheckCircle2 size={16} className="text-[#237E45]" />}
                      </div>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setUserSegment('adult')}
                      className={cn(
                        "flex-1 p-4 rounded-[20px] border text-left transition-all",
                        userSegment === 'adult'
                          ? "bg-[#237E45]/5 border-[#237E45]/30"
                          : "bg-[#07120D] border-white/[0.04] hover:bg-white/[0.02]"
                      )}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className={cn("font-medium", userSegment === 'adult' ? "text-[#237E45]" : "text-white/90")}>Adult</div>
                          <div className="text-xs text-white/50 mt-1">22+</div>
                        </div>
                        {userSegment === 'adult' && <CheckCircle2 size={16} className="text-[#237E45]" />}
                      </div>
                    </button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-3">
                    <label className="text-xs font-medium text-[#737C77] uppercase tracking-wider">Occupation</label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsOccupationDropdownOpen(!isOccupationDropdownOpen)}
                        className={cn(
                          "w-full bg-[#07120D] border rounded-[16px] py-3.5 px-4 text-sm text-left transition-colors flex items-center justify-between",
                          isOccupationDropdownOpen ? "border-[#237E45]/50" : "border-white/[0.04]",
                          occupation ? "text-white/90" : "text-white/50"
                        )}
                      >
                        <span>{occupation || "Select Occupation (Optional)"}</span>
                        <div className={cn("opacity-50 transition-transform", isOccupationDropdownOpen && "rotate-180")}>
                          ▼
                        </div>
                      </button>
                      
                      <AnimatePresence>
                        {isOccupationDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.15 }}
                            className="absolute top-full left-0 right-0 mt-2 bg-[#07120D] border border-white/[0.04] rounded-[16px] overflow-hidden shadow-2xl z-50 py-2"
                          >
                            <button
                              type="button"
                              onClick={() => { setOccupation(undefined); setIsOccupationDropdownOpen(false); }}
                              className="w-full text-left px-4 py-2.5 text-sm text-white/50 hover:bg-white/[0.04] transition-colors"
                            >
                              Select Occupation (Optional)
                            </button>
                            {OCCUPATION_LIST.map((occ) => (
                              <button
                                key={occ}
                                type="button"
                                onClick={() => { setOccupation(occ); setIsOccupationDropdownOpen(false); }}
                                className={cn(
                                  "w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between",
                                  occupation === occ ? "text-[#237E45] bg-[#237E45]/5" : "text-white/90 hover:bg-white/[0.04]"
                                )}
                              >
                                <span>{occ}</span>
                                {occupation === occ && <CheckCircle2 size={14} />}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <label className="text-xs font-medium text-[#737C77] uppercase tracking-wider">City</label>
                    <input
                      type="text"
                      placeholder="e.g. Mumbai, Bengaluru"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-[#07120D] border border-white/[0.04] rounded-[16px] py-3.5 px-4 text-white/90 text-sm outline-none focus:border-[#237E45]/50 transition-colors"
                    />
                  </div>
                </div>
              </div>
            </section>

            <hr className="border-white/[0.04]" />

            {/* FINANCIAL GOALS SECTION */}
            <section className="space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] md:text-xs font-bold tracking-widest uppercase text-[#737C77]">Financial Goals</span>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-white/90">What are you optimizing for?</h3>
                <p className="text-sm text-white/50">This helps RenoCred prioritize recommendations around what matters most to you.</p>
              </div>
              
              <div className="flex flex-wrap gap-3">
                {GOAL_LIST.map((goal) => (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => setPrimaryGoal(goal)}
                    className={cn(
                      "py-2.5 px-5 rounded-full border text-sm font-medium transition-all flex items-center gap-2",
                      primaryGoal === goal
                        ? "bg-[#237E45]/10 border-[#237E45]/30 text-[#237E45]"
                        : "bg-[#07120D] border-white/[0.04] text-white/60 hover:text-white/90 hover:bg-white/[0.02]"
                    )}
                  >
                    {primaryGoal === goal && <CheckCircle2 size={14} className="text-[#237E45]" />}
                    {goal}
                  </button>
                ))}
              </div>
            </section>

            <hr className="border-white/[0.04]" />

            {/* TOP SPEND PRIORITIES */}
            <section className="space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] md:text-xs font-bold tracking-widest uppercase text-[#737C77]">Top Spend Priorities</span>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-white/90">Your declared focus areas</h3>
                <p className="text-sm text-white/50">These priorities help shape your card and marketplace recommendations.</p>
              </div>

              <div className="flex flex-wrap gap-3">
                {spendCategories.length > 0 ? spendCategories.map((category) => (
                  <div key={category} className="py-2.5 px-5 rounded-full bg-[#121414] border border-[#237E45]/20 text-[#F2F4F2] text-sm font-medium capitalize">
                    {category}
                  </div>
                )) : (
                  <p className="text-sm text-white/30 italic">No priorities selected during onboarding.</p>
                )}
              </div>
            </section>

            <hr className="border-white/[0.04]" />

            {/* SHARE SECTION */}
            <section className="space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] md:text-xs font-bold tracking-widest uppercase text-[#737C77]">Share</span>
              </div>
              <ShareableScorecard />
            </section>

            <hr className="border-white/[0.04]" />

            {/* SAVE ACTION */}
            <section className="pt-4 pb-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex-1">
                <AnimatePresence>
                  {success && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-sm font-medium text-[#237E45] flex items-center gap-2"
                    >
                      <CheckCircle2 size={16} /> Profile updated successfully!
                    </motion.div>
                  )}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-sm font-medium text-red-400"
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <button
                type="submit"
                className="w-full sm:w-auto bg-emerald-500 text-[#0A0A0A] font-semibold py-3.5 px-8 rounded-full transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 flex items-center justify-center gap-2 text-sm"
              >
                SAVE CHANGES →
              </button>
            </section>
          </form>
        </div>
        
        {/* RIGHT PANEL - INTELLIGENCE OVERVIEW */}
        <div className="lg:col-span-4 relative hidden lg:block">
          <div className="sticky top-24 bg-[#07120D] border border-white/[0.04] rounded-[32px] p-8 space-y-6">
            <div className="flex items-center gap-2 text-[#237E45]">
              <Sparkles size={16} />
              <span className="text-[10px] md:text-xs font-bold tracking-widest uppercase">Your RenoCred Profile</span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed">
              Your profile helps RenoCred understand:
            </p>
            <ul className="space-y-4 text-sm text-white/80">
              <li className="flex items-start gap-3">
                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#237E45]/60 shrink-0" />
                <span>which cards fit your spending</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#237E45]/60 shrink-0" />
                <span>which rewards matter most</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#237E45]/60 shrink-0" />
                <span>which financial opportunities are relevant</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
