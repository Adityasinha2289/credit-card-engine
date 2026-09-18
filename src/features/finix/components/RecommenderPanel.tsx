import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  Star,
  BookOpen,
  X,
  ChevronDown,
  ChevronUp,
  Utensils,
  ShoppingBag,
  Plane,
  ShoppingCart,
  Fuel,
  Film,
  Zap,
  HeartPulse,
  Car,
  Music,
  Tag,
  ExternalLink
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useDashboardStore } from '../../dashboard/store/dashboardStore';
import { analytics } from '../../../lib/analytics';
import {
  recommendCards,
  CATEGORIES_LIST,
  type UserProfile,
  type RecommendedCard,
} from '../lib/recommendEngine';
import type { SpendCategory } from '../data/cardDataset';
import { TactileChip } from '../../../components/shared/TactileChip';
import { DecisionCard } from '../../../components/shared/DecisionCard';

function formatINR(val: number) {
  if (val >= 10000000) {
    return `₹${(val / 10000000).toFixed(1)} Cr`;
  }
  if (val >= 100000) {
    return `₹${(val / 100000).toFixed(1)} Lakh`;
  }
  return `₹${val.toLocaleString('en-IN')}`;
}

const BANK_APPLY_URLS: Record<string, string> = {
  'HDFC':    'https://www.hdfcbank.com/personal/pay/cards/credit-cards',
  'SBI':     'https://www.sbicard.com/en/apply-now.page',
  'ICICI':   'https://www.icicibank.com/card/credit-cards',
  'Axis':    'https://www.axisbank.com/retail/cards/credit-card',
  'Kotak':   'https://www.kotak.com/en/personal-banking/cards/credit-cards.html',
  'AMEX':    'https://www.americanexpress.com/in/credit-cards/',
  'RBL':     'https://www.rblbank.com/credit-cards',
  'IndusInd':'https://www.indusind.com/in/en/personal/cards/credit-card.html',
  'YES':     'https://www.yesbank.in/personal-banking/yes-individual/cards/credit-cards',
  'BOB':     'https://www.bankofbaroda.in/personal-banking/digital-products/cards/credit-cards',
  'HSBC':    'https://www.hsbc.co.in/credit-cards/',
  'Citi':    'https://www.online.citibank.co.in/products-services/credit-cards/credit-cards.htm',
  'SC':      'https://www.sc.com/in/credit-cards/',
  'IOB':     'https://www.iob.in/Credit-Card',
  'PNB':     'https://www.pnbcard.in/',
  'AU':      'https://www.aubank.in/personal-banking/credit-card',
  'Federal': 'https://www.federalbank.co.in/credit-card',
  'IDFC':    'https://www.idfcfirstbank.com/credit-card',
  'OneCard': 'https://www.getonecard.app/',
  'Uni':     'https://www.uni.cards/',
};

function getApplyUrl(bank: string): string | null {
  return BANK_APPLY_URLS[bank] || null;
}

const CATEGORY_ICONS: Record<string, any> = {
  dining: Utensils,
  shopping: ShoppingBag,
  travel: Plane,
  groceries: ShoppingCart,
  fuel: Fuel,
  entertainment: Film,
  utilities: Zap,
  health: HeartPulse,
  transport: Car,
  subscriptions: Music,
  other: Tag
};

const CATEGORY_LABELS: Record<string, string> = {
  dining: 'Dining & Food',
  shopping: 'Online Shopping',
  travel: 'Travel & Flights',
  groceries: 'Groceries',
  fuel: 'Fuel',
  entertainment: 'Entertainment',
  utilities: 'Utilities & Bills',
  health: 'Health & Medical',
  transport: 'Cab & Transport',
  subscriptions: 'Subscriptions',
  other: 'Other'
};

// ─────────────────────────────────────────────────────────────────────────────
//  RESULT CARD (Now using DecisionCard)
// ─────────────────────────────────────────────────────────────────────────────

function ResultCard({
  card,
  rank,
  income,
  cibil,
  categories,
  wantsLounge
}: {
  card: RecommendedCard;
  rank: number;
  income: number;
  cibil: number;
  categories: SpendCategory[];
  wantsLounge: boolean;
}) {
  const estimatedImpact = card.annualFee === 0 ? "₹1,500+ Saved" : "High Reward Rate";
  const title = rank === 0 ? "Top Recommendation" : `Alternative #${rank}`;
  const why = `Offers ${card.baseRewardRate}% base rewards with high match for your spending profile.`;
  const tradeoff = `Annual fee is ${card.annualFee === 0 ? 'Lifetime Free' : `₹${card.annualFee}`}. Minimum CIBIL required: ${card.minCibil || 700}.`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.08, duration: 0.35 }}
      className="w-full"
    >
      <DecisionCard 
        title={title}
        bestFit={card.name}
        why={why}
        expectedValue={estimatedImpact}
        tradeoff={tradeoff}
        confidence={card.matchPercent}
        actionText="Apply Now"
        onAction={() => {
          const url = getApplyUrl(card.bank);
          if (url) {
            analytics.track('Recommendation Accepted', {
              bank: card.bank,
              network: card.network,
              cardName: card.name
            });
            window.open(url, '_blank', 'noopener,noreferrer');
          }
        }}
      />
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export function RecommenderPanel() {
  const profile = useDashboardStore((s) => s.profile);
  const userSalary = profile?.salary || 1500000;
  const userCibil = profile?.creditScore || 750;

  const [step, setStep] = useState(0);
  const [categories, setCategories] = useState<SpendCategory[]>([]);
  const [wantsLounge, setWantsLounge] = useState(false);
  const [results, setResults] = useState<RecommendedCard[]>([]);

  // Blog modal state
  const [showBlog, setShowBlog] = useState(false);

  const OPTIMIZATION_GOALS = [
    { id: 'cashback', label: 'Cashback', icon: <Zap size={18} /> },
    { id: 'travel', label: 'Travel', icon: <Plane size={18} /> },
    { id: 'low_fees', label: 'Low Fees', icon: <Tag size={18} /> },
    { id: 'rewards', label: 'Rewards', icon: <Star size={18} /> },
    { id: 'lifestyle', label: 'Lifestyle', icon: <Film size={18} /> },
    { id: 'credit_health', label: 'Credit Health', icon: <HeartPulse size={18} /> },
  ];

  const [activeGoals, setActiveGoals] = useState<string[]>([]);

  const toggleGoal = useCallback((goalId: string) => {
    setActiveGoals((prev) =>
      prev.includes(goalId) ? prev.filter((g) => g !== goalId) : [...prev, goalId].slice(0, 3)
    );
  }, []);

  function handleSubmit() {
    // Map goals to categories and lounge prefs
    let mappedCategories: SpendCategory[] = [];
    let mappedLounge = false;
    let mappedFeeLimit = 0;

    if (activeGoals.includes('cashback')) mappedCategories.push('shopping', 'dining', 'groceries');
    if (activeGoals.includes('travel')) { mappedCategories.push('travel'); mappedLounge = true; }
    if (activeGoals.includes('low_fees')) mappedFeeLimit = 500;
    if (activeGoals.includes('rewards')) mappedCategories.push('shopping', 'entertainment');
    if (activeGoals.includes('lifestyle')) mappedCategories.push('dining', 'entertainment', 'subscriptions');

    // Remove duplicates
    mappedCategories = Array.from(new Set(mappedCategories)).slice(0, 4);

    const userProfile: UserProfile = {
      annualIncome: userSalary,
      cibilScore: userCibil,
      topCategories: mappedCategories,
      maxAnnualFee: mappedFeeLimit,
      wantsLounge: mappedLounge,
    };
    const newResults = recommendCards(userProfile);
    setResults(newResults);
    setStep(1);
  }

  function reset() {
    setStep(0);
    setActiveGoals([]);
    setResults([]);
  }

  return (
    <div className="flex flex-col h-full relative">
      <AnimatePresence mode="wait">
        {/* STEP 0 — Categories & Preferences */}
        {step === 0 && (
          <motion.div
            key="categories"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col gap-6 text-left max-w-2xl mx-auto w-full"
          >
            <div>
              <h3 className="text-3xl font-display font-extrabold text-text-primary tracking-tight">What are you optimizing for?</h3>
              <p className="text-base text-text-secondary mt-2">Select your primary goals to find the best fit.</p>
            </div>

            {/* Tactile Chips Grid */}
            <div className="flex flex-wrap gap-3">
              {OPTIMIZATION_GOALS.map((goal) => (
                <TactileChip
                  key={goal.id}
                  id={goal.id}
                  label={goal.label}
                  icon={goal.icon}
                  selected={activeGoals.includes(goal.id)}
                  onClick={toggleGoal}
                />
              ))}
            </div>

            <button
              onClick={handleSubmit}
              disabled={activeGoals.length === 0}
              className={cn(
                'w-full flex items-center justify-center gap-2 font-bold text-base py-4 rounded-2xl transition-all duration-150 active:scale-95 mt-4',
                activeGoals.length > 0
                  ? 'bg-brand-emerald hover:bg-brand-600 text-gray-900 shadow-[0_0_20px_rgba(4,59,39,0.3)]'
                  : 'bg-surface-secondary text-text-muted cursor-not-allowed border border-border-subtle'
              )}
            >
              Analyze My Best Fit <ChevronRight size={18} />
            </button>
          </motion.div>
        )}

        {/* STEP 1 — Results */}
        {step === 1 && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-4 text-left"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-display font-bold text-text-primary">Your Matches</h3>
                <p className="text-sm text-text-muted">{results.length} cards ranked for your profile</p>
              </div>
              <button
                onClick={reset}
                className="text-xs font-semibold text-brand-emerald hover:text-brand-650 bg-brand-50 dark:bg-brand-emerald-muted px-3.5 py-1.5 rounded-full transition-colors"
              >
                Redo
              </button>
            </div>
            {results.map((card, i) => (
              <ResultCard
                key={card.id}
                card={card}
                rank={i}
                income={userSalary}
                cibil={userCibil}
                categories={categories}
                wantsLounge={wantsLounge}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Credit Blog Modal */}
      <AnimatePresence>
        {showBlog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBlog(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-surface-primary  rounded-[2rem] p-6 shadow-ag-modal border border-border-subtle  overflow-hidden flex flex-col max-h-[85vh]"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4 border-b border-border-subtle  pb-3">
                <h3 className="text-lg font-display font-bold text-text-primary flex items-center gap-2">
                  <BookOpen className="text-brand-emerald" size={18} /> Credit Health Guide
                </h3>
                <button
                  onClick={() => setShowBlog(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-text-muted hover:text-text-secondary hover:bg-surface-secondary dark:hover:bg-white/[0.04]"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Scrollable Blog Content */}
              <div className="flex-1 overflow-y-auto pr-2 text-sm leading-relaxed text-text-secondary flex flex-col gap-4">
                <div>
                  <h4 className="font-bold text-text-primary text-base">What is a CIBIL Credit Score?</h4>
                  <p className="mt-1">
                    Your CIBIL score is a 3-digit numeric summary of your credit history, rating your borrowing and repayment habits. It ranges from <strong>300 to 900</strong>. A higher score represents lower risk to credit card issuers and loan providers, unlocking premium card approvals, higher limits, and lower interest rates.
                  </p>
                </div>

                <div className="bg-surface-primary  rounded-2xl p-4 border border-border-subtle">
                  <h5 className="font-bold text-text-primary text-xs uppercase tracking-wider mb-2">CIBIL Score Ranges</h5>
                  <ul className="flex flex-col gap-1.5 text-xs">
                    <li className="flex justify-between border-b border-border-subtle pb-1">
                      <span className="font-semibold text-loss">Below 650: Poor</span>
                      <span className="text-text-muted">Difficult to get approved</span>
                    </li>
                    <li className="flex justify-between border-b border-border-subtle pb-1">
                      <span className="font-semibold text-caution">650 - 699: Average</span>
                      <span className="text-text-muted">Limited/Entry-level cards only</span>
                    </li>
                    <li className="flex justify-between border-b border-border-subtle pb-1">
                      <span className="font-semibold text-brand-emerald">700 - 749: Good</span>
                      <span className="text-text-muted">Easy approval for standard cards</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="font-semibold text-profit">750 - 900: Excellent</span>
                      <span className="text-text-muted">Qualifies for premium, high-reward cards</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-text-primary text-base">How to Check Your Score</h4>
                  <p className="mt-1">
                    You can pull your official credit report directly from CIBIL (www.cibil.com) or download apps that offer free soft pulls (like RenoCred, Experian, or CRIF). Free soft checks do not hurt your credit rating.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-text-primary text-base">5 Rules to Build an Excellent Credit Score</h4>
                  <ol className="list-decimal pl-4 flex flex-col gap-2 mt-2">
                    <li>
                      <strong>Pay All Bills on Time:</strong> Repayment history accounts for 35% of your score. Even a single delay of 30 days can drop your score significantly.
                    </li>
                    <li>
                      <strong>Keep Credit Utilization Low:</strong> Try not to spend more than 30% of your total credit limit on any card. If your limit is ₹1 Lakh, keep outstanding balances below ₹30,000.
                    </li>
                    <li>
                      <strong>Maintain a Healthy Credit Age:</strong> Keep your oldest credit card active. The longer your history, the more reliable you appear to lenders.
                    </li>
                    <li>
                      <strong>Mix Secure and Unsecure Debt:</strong> A healthy combination of unsecured credit (like credit cards) and secured credit (like home/car loans) benefits your rating.
                    </li>
                    <li>
                      <strong>Avoid Spamming Applications:</strong> Every card or loan application triggers a"hard inquiry". Multiple inquiries in a short window signal credit-hunger and drop your score.
                    </li>
                  </ol>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-4 pt-3 border-t border-border-subtle  text-center">
                <button
                  onClick={() => setShowBlog(false)}
                  className="btn-primary active:scale-95"
                >
                  Got It, Thanks!
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default RecommenderPanel;
