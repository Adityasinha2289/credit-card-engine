import { motion } from 'framer-motion';
import { fadeUpVariant, staggerContainer } from '../../../motion';
import { CreditCard, IndianRupee, PieChart, Calendar } from 'lucide-react';

const walletStats = [
  {
    label: 'Total Cards Managed',
    value: '4',
    icon: CreditCard,
  },
  {
    label: 'Reward Potential',
    value: '₹65,000',
    icon: IndianRupee,
  },
  {
    label: 'Optimized Categories',
    value: '8',
    icon: PieChart,
  },
  {
    label: 'Upcoming Milestones',
    value: '2',
    icon: Calendar,
  }
];

export function WalletUnderstood() {
  return (
    <section className="relative w-full py-24 md:py-32 bg-[#050505] text-white overflow-hidden">
      
      <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col items-center">
        
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-16"
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.h2 variants={fadeUpVariant} className="text-[clamp(2.5rem,4vw,3.5rem)] font-display font-medium tracking-tight mb-6">
            Your wallet. Understood.
          </motion.h2>
          <motion.p variants={fadeUpVariant} className="text-gray-400 text-lg md:text-xl font-light leading-relaxed">
            RenoCred doesn't just look at individual cards. We understand your entire collection of products, finding synergies and opportunities you might miss.
          </motion.p>
        </motion.div>

        {/* Subtle Data Visualization Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="w-full max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
        >
          {walletStats.map((stat, i) => (
            <div key={i} className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-6 flex flex-col items-center justify-center text-center group hover:bg-[#0f0f0f] hover:border-semantic-brand-strong/20 transition-all duration-300">
              <div className="w-10 h-10 rounded-full bg-semantic-brand-strong/10 text-semantic-brand-strong flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <stat.icon className="w-5 h-5" />
              </div>
              <div className="text-2xl md:text-3xl font-display font-medium text-white mb-1">
                {stat.value}
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-widest font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
