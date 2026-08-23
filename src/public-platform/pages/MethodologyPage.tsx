import { SEO } from '../components/SEO';
import { getBreadcrumbSchema } from '../lib/schemaBuilders';
import { ContentMeta } from '../components/ContentMeta';
import { FAQSchema } from '../components/FAQSchema';
import { motion } from 'framer-motion';
import { Shield, Target, PieChart as PieChartIcon, Zap, CheckCircle2, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

// Mock data for the charts
const valueComparisonData = [
  { name: 'Travel', value: 450, fill: '#34d399' },
  { name: 'Cashback', value: 320, fill: '#60a5fa' },
  { name: 'Base', value: 150, fill: '#94a3b8' },
];

const scoringWeightsData = [
  { name: 'Reward Rate', value: 40 },
  { name: 'Annual Fees', value: 20 },
  { name: 'Sign-up Bonus', value: 25 },
  { name: 'Perks', value: 15 },
];
const COLORS = ['#34d399', '#f43f5e', '#60a5fa', '#fbbf24'];

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

export function MethodologyPage() {
  return (
    <div className="w-full relative overflow-hidden bg-white text-gray-900 selection:bg-emerald-500/30">
      <SEO 
        title="Evaluation Methodology | How Renocred Compares Credit Cards"
        description="Read how Renocred uses structured data and rule-based models to evaluate and recommend credit cards."
        canonicalUrl="https://renocred.com/methodology"
        schemaData={getBreadcrumbSchema([
          { name: 'Home', item: '/' },
          { name: 'Methodology', item: '/methodology' }
        ])}
      />
      
      {/* Background Effects */}
      <div className="absolute top-0 right-0 w-full h-[500px] bg-gradient-to-b from-emerald-500/10 to-transparent pointer-events-none" />
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Hero Section with Logo */}
      <section className="relative w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-12 text-center z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="flex justify-center mb-8"
        >
          {/* Renocred Logo Badge */}
          <div className="w-20 h-20 bg-white border border-gray-200 rounded-[1.5rem] flex items-center justify-center shadow-[0_0_50px_rgba(52,211,153,0.15)] relative overflow-hidden group">
             <div className="absolute inset-0 bg-emerald-500/10 blur-xl group-hover:bg-emerald-500/20 transition-colors" />
             <img src="/logo.jpg" alt="RenoCred Logo" className="w-12 h-12 rounded-xl object-cover relative z-10" />
          </div>
        </motion.div>

        <motion.h1 
          className="text-4xl md:text-6xl font-display font-bold mb-6 tracking-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">Methodology</span>
        </motion.h1>
        
        <motion.p 
          className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          We use structured data and clear, rule-based models to evaluate credit cards. No opaque AI, just transparent math tailored to your spending habits.
        </motion.p>
        <div className="max-w-2xl mx-auto mt-6">
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 z-10 relative">
        
        {/* Step 1: Structured Data */}
        <motion.div 
          variants={fadeIn} initial="initial" whileInView="animate" viewport={{ once: true, margin: "-50px" }}
          className="mb-12 bg-gray-50 border border-gray-200 rounded-[2rem] p-6 sm:p-10 md:p-12 overflow-hidden relative"
        >
          <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-blue-500/5 to-transparent pointer-events-none" />
          
          <div className="flex flex-col lg:flex-row gap-12 items-center relative z-10">
            <div className="flex-1 w-full">
              <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/20">
                <Target className="w-7 h-7 text-blue-400" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">How We Structure Data</h2>
              <p className="text-gray-600 leading-relaxed text-base md:text-lg mb-6">
                We collect and organize credit card information, such as fees, reward rates, category multipliers, and eligibility criteria. This normalized data forms the strict foundation of our comparison tools.
              </p>
              <ul className="space-y-4">
                {['Card Rewards', 'Fee Waivers', 'Milestone Benefits', 'Welcome Bonus'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-700 font-medium">
                    <CheckCircle2 className="w-5 h-5 text-blue-400" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="w-full lg:w-1/2 h-[350px] bg-white rounded-3xl p-4 border border-gray-200 shadow-sm">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={scoringWeightsData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {scoringWeightsData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                    itemStyle={{ color: '#111827' }}
                  />
                  <Legend verticalAlign="bottom" height={40} iconType="circle" wrapperStyle={{ fontSize: '14px', paddingTop: '10px', color: '#374151' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        {/* Step 2: Evaluating Value */}
        <motion.div 
          variants={fadeIn} initial="initial" whileInView="animate" viewport={{ once: true, margin: "-50px" }}
          className="mb-12 bg-gray-50 border border-gray-200 rounded-[2rem] p-6 sm:p-10 md:p-12 overflow-hidden relative"
        >
          <div className="absolute left-0 top-0 w-1/2 h-full bg-gradient-to-r from-emerald-500/5 to-transparent pointer-events-none" />
          
          <div className="flex flex-col lg:flex-row-reverse gap-12 items-center relative z-10">
            <div className="flex-1 w-full">
              <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 border border-emerald-500/20">
                <PieChartIcon className="w-7 h-7 text-emerald-400" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Evaluating Value</h2>
              <p className="text-gray-600 leading-relaxed text-base md:text-lg mb-6">
                The "best" credit card depends entirely on the individual. A premium travel card might offer massive value to a frequent flyer, but result in a net loss for someone who rarely travels.
              </p>
              <p className="text-gray-600 leading-relaxed text-base md:text-lg">
                Our tools aim to evaluate cards based on user-defined spending categories and habits, calculating a realistic projected net value.
              </p>
            </div>

            <div className="w-full lg:w-1/2 h-[350px] bg-white rounded-3xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-500 mb-6 text-center uppercase tracking-wider">Projected Net Value</h3>
              <ResponsiveContainer width="100%" height="80%">
                <BarChart data={valueComparisonData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                  <XAxis dataKey="name" stroke="rgba(0,0,0,0.4)" tick={{fill: 'rgba(0,0,0,0.5)', fontSize: 13, fontWeight: 500}} axisLine={false} tickLine={false} dy={10} />
                  <YAxis stroke="rgba(0,0,0,0.4)" tick={{fill: 'rgba(0,0,0,0.5)', fontSize: 12}} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val}`} />
                  <Tooltip 
                    cursor={{fill: 'rgba(0,0,0,0.03)'}}
                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                    itemStyle={{ color: '#111827' }}
                    formatter={(value) => [`₹${value}`, 'Net Value']}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={60}>
                    {valueComparisonData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        {/* Step 3 & 4: Rules & Limits */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <motion.div 
            variants={fadeIn} initial="initial" whileInView="animate" viewport={{ once: true, margin: "-50px" }}
            className="bg-gray-50 border border-gray-200 rounded-[2rem] p-8 md:p-10 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6 border border-purple-500/20">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">Rule-Based Engine</h3>
              <p className="text-gray-600 leading-relaxed">
                Our recommendation engine uses structured rules rather than opaque machine learning. By mapping your stated spending profile against known card reward structures, we estimate potential value and highlight cards that align with your lifestyle.
              </p>
            </div>
          </motion.div>

          <motion.div 
            variants={fadeIn} initial="initial" whileInView="animate" viewport={{ once: true, margin: "-50px" }}
            className="bg-gray-50 border border-gray-200 rounded-[2rem] p-8 md:p-10 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center mb-6 border border-red-500/20">
                <Shield className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">Important Limitations</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Our tools are designed to support your decisions, not replace personal financial judgment. Credit card terms, fees, and reward structures change frequently. We strongly encourage verifying complete product details directly with the issuer.
              </p>
              <div className="flex gap-4 text-sm font-medium">
                <Link to="/editorial-policy" className="text-emerald-400 hover:text-emerald-300 transition-colors">Editorial Policy</Link>
                <Link to="/disclaimer" className="text-emerald-400 hover:text-emerald-300 transition-colors">Disclaimer</Link>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Category specific methodologies */}
        <motion.div 
          variants={fadeIn} initial="initial" whileInView="animate" viewport={{ once: true }}
          className="space-y-8 mt-24 mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">Category-Specific Logic</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">See exactly how we calculate maximum value across different spending scenarios.</p>
          </div>
          
          {/* Food */}
          <div id="food" className="relative h-[400px] md:h-[450px] w-full rounded-[2.5rem] overflow-hidden group scroll-mt-32">
            <div className="absolute inset-0 z-0">
              <img src="/images/features/food.webp" alt="Food & Dining Methodology" loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-white/40" />
              <div className="absolute inset-0 bg-gradient-to-t from-white via-white/90 to-transparent opacity-95" />
            </div>
            <div className="relative z-10 h-full flex flex-col justify-end p-8 md:p-16">
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 drop-shadow-sm">Food & Dining</h3>
              <p className="text-gray-700 text-lg md:text-xl max-w-3xl leading-relaxed">
                When evaluating cards for food and dining, we strictly analyze Merchant Category Codes (MCCs) used by major aggregators like Zomato, Swiggy, and local restaurants. We factor in monthly cashback caps and minimum spend requirements to ensure you get the absolute maximum net value from every meal.
              </p>
            </div>
          </div>

          {/* Flights */}
          <div id="flights" className="relative h-[400px] md:h-[450px] w-full rounded-[2.5rem] overflow-hidden group scroll-mt-32">
            <div className="absolute inset-0 z-0">
              <img src="/images/features/travel.webp" alt="Travel & Flights Methodology" loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-white/40" />
              <div className="absolute inset-0 bg-gradient-to-t from-white via-white/90 to-transparent opacity-95" />
            </div>
            <div className="relative z-10 h-full flex flex-col justify-end p-8 md:p-16">
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 drop-shadow-sm">Travel & Flights</h3>
              <p className="text-gray-700 text-lg md:text-xl max-w-3xl leading-relaxed">
                Air miles optimization is complex. We convert proprietary reward points (like Edge Rewards or MR points) into exact cash equivalents based on real-time transfer ratios to airline partners. This allows us to instantly compare a premium travel card against a flat cashback card to tell you exactly which one saves you more money on a flight booking.
              </p>
            </div>
          </div>

          {/* Fuel */}
          <div id="fuel" className="relative h-[400px] md:h-[450px] w-full rounded-[2.5rem] overflow-hidden group scroll-mt-32">
            <div className="absolute inset-0 z-0">
              <img src="/images/features/fuel.webp" alt="Fuel Stations Methodology" loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-white/40" />
              <div className="absolute inset-0 bg-gradient-to-t from-white via-white/90 to-transparent opacity-95" />
            </div>
            <div className="relative z-10 h-full flex flex-col justify-end p-8 md:p-16">
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 drop-shadow-sm">Fuel Stations</h3>
              <p className="text-gray-700 text-lg md:text-xl max-w-3xl leading-relaxed">
                Fuel surcharges can eat into your rewards. Our model tracks exact MCCs used by HPCL, BPCL, and IndianOil. We calculate the net benefit by factoring in the 1% surcharge waiver, minus any applicable GST on that waiver, combined with the co-branded reward points you earn at the pump.
              </p>
            </div>
          </div>

          {/* Shopping */}
          <div id="shopping" className="relative h-[400px] md:h-[450px] w-full rounded-[2.5rem] overflow-hidden group scroll-mt-32">
            <div className="absolute inset-0 z-0">
              <img src="/images/features/shopping.webp" alt="Online Shopping Methodology" loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-white/40" />
              <div className="absolute inset-0 bg-gradient-to-t from-white via-white/90 to-transparent opacity-95" />
            </div>
            <div className="relative z-10 h-full flex flex-col justify-end p-8 md:p-16">
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 drop-shadow-sm">Online Shopping</h3>
              <p className="text-gray-700 text-lg md:text-xl max-w-3xl leading-relaxed">
                E-commerce rewards fluctuate rapidly. Our engine dynamically accounts for instant bank discounts during major sale events, accelerated rewards on preferred platforms (like Amazon or Flipkart), and smart routing through affiliate platforms like SmartBuy or Gyftr to maximize your return on every cart checkout.
              </p>
            </div>
          </div>

        </motion.div>

        {/* FAQ Section — SEO: FAQPage schema for Google rich results */}
        <MethodologyFAQ />

      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  FAQ SECTION — Google FAQPage rich results + AI search citation target
// ─────────────────────────────────────────────────────────────────────────────

const METHODOLOGY_FAQS = [
  {
    question: 'How does RenoCred evaluate credit cards?',
    answer: 'RenoCred uses a structured, rule-based scoring engine called Taqdeer that evaluates each credit card across multiple dimensions: reward rates per spending category, annual fees and fee waiver thresholds, welcome bonuses, lounge access, minimum eligibility criteria (income and CIBIL score), and network benefits. Each card receives a composite match score personalized to your spending profile.',
  },
  {
    question: 'Is RenoCred a financial advisor?',
    answer: 'No. RenoCred is an informational and analytical tool, not a licensed financial advisor. Our recommendations are based on structured data comparisons and mathematical models. We strongly encourage users to verify all product details directly with the issuing bank before making any financial decisions.',
  },
  {
    question: 'How often is the credit card data updated?',
    answer: 'Our credit card database of 133+ cards is reviewed and updated regularly. Reward structures, fees, and eligibility criteria are verified against official issuer sources. The last comprehensive update was performed in July 2026. If you notice any outdated information, please contact us.',
  },
  {
    question: 'What data does RenoCred collect about me?',
    answer: 'RenoCred collects your salary range and CIBIL score band solely to personalize card recommendations. We do not sell, rent, or share your personal financial data with third-party advertisers. All data is encrypted and stored securely. Read our full Privacy Policy for details.',
  },
  {
    question: 'How does the Wallet Optimizer work?',
    answer: 'The Wallet Optimizer analyzes the credit cards in your wallet and cross-references them with your spending categories. It identifies which card gives the highest reward rate for each type of purchase (dining, travel, shopping, fuel, etc.) and flags optimization opportunities where a different card in your wallet — or a new card — could earn you more cashback or reward points.',
  },
];

function MethodologyFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <motion.div
      variants={fadeIn}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, margin: '-50px' }}
      className="mt-16"
    >
      <FAQSchema items={METHODOLOGY_FAQS} />
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">
        Frequently Asked Questions
      </h2>
      <div className="space-y-3 max-w-3xl mx-auto">
        {METHODOLOGY_FAQS.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden transition-colors hover:border-gray-300"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                aria-expanded={isOpen}
              >
                <span className="text-sm md:text-base font-semibold text-gray-900 leading-snug">
                  {faq.question}
                </span>
                <ChevronDown
                  size={18}
                  className={`flex-shrink-0 text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                />
              </button>
              <motion.div
                initial={false}
                animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
                transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="overflow-hidden"
              >
                <p className="px-6 pb-5 text-sm text-gray-600 leading-relaxed">
                  {faq.answer}
                </p>
              </motion.div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
