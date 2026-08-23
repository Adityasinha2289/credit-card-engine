import { motion } from 'framer-motion';
import { Wallet, TrendingUp, UserCheck } from 'lucide-react';
import { fadeUpVariant, staggerContainer } from '../../../motion';

const features = [
  {
    icon: Wallet,
    title: 'Understand Your Wallet',
    description: 'See your cards, fees, rewards, benefits, and important information in one unified dashboard.'
  },
  {
    icon: TrendingUp,
    title: 'Optimize Your Spending',
    description: 'Identify exactly which card provides the strongest value for any particular transaction.'
  },
  {
    icon: UserCheck,
    title: 'Personalized Recommendations',
    description: 'RenoCred considers your unique profile and circumstances instead of treating every user identically.'
  }
];

export function WhatItDoesSection() {
  return (
    <section id="how-it-works" className="relative w-full py-24 md:py-32 bg-[#050505] text-white overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-semantic-brand-strong/5 via-transparent to-transparent pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-20"
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.h2 variants={fadeUpVariant} className="text-[clamp(2rem,4vw,3.5rem)] font-display font-medium tracking-tight mb-6">
            One place to understand and optimize your wallet.
          </motion.h2>
          <motion.p variants={fadeUpVariant} className="text-gray-400 text-lg md:text-xl font-light leading-relaxed">
            RenoCred brings fragmented financial-product information into a single intelligent experience, helping you make smarter choices.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 hover:bg-[#0f0f0f] hover:border-semantic-brand-strong/20 transition-all duration-300 group cursor-default"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#0f0f0f] border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:border-semantic-brand-strong/30 group-hover:bg-semantic-brand-strong/5 transition-all duration-300">
                <feature.icon className="w-6 h-6 text-gray-400 group-hover:text-semantic-brand-strong transition-colors" />
              </div>
              <h3 className="text-xl font-medium text-white mb-3">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
