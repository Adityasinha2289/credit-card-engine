import { motion } from 'framer-motion';
import { ArrowRight, TrendingDown, TrendingUp, AlertTriangle, Zap } from 'lucide-react';

const UPDATES = [
  {
    type: 'devaluation',
    icon: TrendingDown,
    title: 'Axis Atlas Offline Spends Devalued',
    description: 'Base earn rate for offline transactions reduced from 2 EDGE Miles to 1 EDGE Mile per ₹100.',
    date: '2 Days Ago',
    color: 'text-red-500',
    bgColor: 'bg-red-500/10'
  },
  {
    type: 'multiplier',
    icon: TrendingUp,
    title: 'New 10X on Swiggy for Infinia',
    description: 'HDFC Infinia users now get 10X reward points on Swiggy via SmartBuy until the end of the month.',
    date: '5 Days Ago',
    color: 'text-green-600',
    bgColor: 'bg-green-600/10'
  },
  {
    type: 'alert',
    icon: AlertTriangle,
    title: 'Amex Platinum Lounge Access Changes',
    description: 'Guest access policy updated for domestic Centurion lounges. Priority Pass rules remain unchanged.',
    date: '1 Week Ago',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-600/10'
  },
  {
    type: 'flash',
    icon: Zap,
    title: 'SBI Cashback Cap Reset',
    description: 'Monthly cashback cap of ₹5,000 resets in 3 days. Optimize your large online purchases now.',
    date: 'Just Now',
    color: 'text-blue-600',
    bgColor: 'bg-blue-600/10'
  }
];

export function LatestUpdatesSection() {
  return (
    <section className="py-24 md:py-32 bg-editorial-light-cream text-editorial-deep-forest relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="max-w-2xl">
            <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-serif font-medium tracking-tight mb-6">
              Insights & Updates.
            </h2>
            <p className="text-editorial-muted-sage text-lg md:text-xl font-light leading-relaxed">
              Explore our editorial examples of devaluations, new multipliers, and hidden offers. (Demo Content)
            </p>
          </div>
          <button className="inline-flex items-center gap-2 px-6 py-3.5 bg-transparent border border-editorial-soft-sage/30 text-editorial-deep-forest rounded-full font-medium hover:bg-white transition-colors shrink-0">
            View Editorial Insights <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Bento Box Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Featured Large Update */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2 bg-editorial-forest text-editorial-light-cream rounded-[2rem] p-8 md:p-10 relative overflow-hidden flex flex-col justify-between min-h-[320px] group cursor-pointer"
          >
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-editorial-soft-sage/20 blur-[100px] rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 border border-white/20 text-[10px] uppercase tracking-widest font-semibold rounded-full mb-6">
                <AlertTriangle className="w-3 h-3" /> Editorial Insight
              </div>
              <h3 className="text-3xl md:text-4xl font-serif font-medium mb-4">Understanding Card Devaluations.</h3>
              <p className="text-editorial-soft-sage text-lg max-w-lg mb-8">
                Example analysis: When banks announce structural changes to a flagship card, it impacts milestone benefits and transfer ratios. Is it time to downgrade?
              </p>
            </div>
            
            <div className="relative z-10 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-editorial-warm-cream group-hover:translate-x-2 transition-transform">
              Read the Full Breakdown <ArrowRight className="w-4 h-4" />
            </div>
          </motion.div>

          {/* Grid of smaller updates */}
          <div className="flex flex-col gap-6">
            {UPDATES.slice(0, 2).map((update, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * (idx + 1) }}
                className="bg-white border border-editorial-soft-sage/30 rounded-[2rem] p-6 flex-1 flex flex-col hover:shadow-lg transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl ${update.bgColor} flex items-center justify-center`}>
                    <update.icon className={`w-5 h-5 ${update.color}`} />
                  </div>
                  <span className="text-xs text-editorial-muted-sage font-medium">{update.date}</span>
                </div>
                <h4 className="text-lg font-bold text-editorial-deep-forest mb-2">{update.title}</h4>
                <p className="text-sm text-editorial-muted-sage leading-relaxed">{update.description}</p>
              </motion.div>
            ))}
          </div>

          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
            {UPDATES.slice(2, 4).map((update, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 * (idx + 1) }}
                className="bg-white border border-editorial-soft-sage/30 rounded-[2rem] p-6 flex items-start gap-5 hover:shadow-lg transition-all duration-300 cursor-pointer"
              >
                <div className={`w-12 h-12 rounded-xl ${update.bgColor} flex items-center justify-center shrink-0`}>
                  <update.icon className={`w-6 h-6 ${update.color}`} />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-lg font-bold text-editorial-deep-forest">{update.title}</h4>
                  </div>
                  <p className="text-sm text-editorial-muted-sage leading-relaxed mb-2">{update.description}</p>
                  <span className="text-xs text-editorial-muted-sage font-medium">{update.date}</span>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
