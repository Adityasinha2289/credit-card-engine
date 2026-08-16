import { motion } from 'framer-motion';
import { fadeUpVariant, staggerContainer } from '../../../motion';
import { Plane, Utensils, ShoppingBag, Fuel, Receipt, Coffee } from 'lucide-react';

const useCases = [
  {
    icon: Plane,
    title: 'Travel',
    description: 'Optimize flights, hotels, and forex markups.',
  },
  {
    icon: Utensils,
    title: 'Dining',
    description: 'Maximize returns on restaurants and food delivery.',
  },
  {
    icon: ShoppingBag,
    title: 'Shopping',
    description: 'Find the best card for online and offline retail.',
  },
  {
    icon: Fuel,
    title: 'Fuel',
    description: 'Navigate fuel surcharges and category multipliers.',
  },
  {
    icon: Receipt,
    title: 'Bills',
    description: 'Earn rewards on utilities and recurring payments.',
  },
  {
    icon: Coffee,
    title: 'Everyday',
    description: 'Elevate baseline returns on routine spending.',
  }
];

export function UseCasesSection() {
  return (
    <section className="relative w-full py-24 md:py-32 bg-[#0A0A0A] text-white overflow-hidden border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col items-center">
        
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-16"
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.h2 variants={fadeUpVariant} className="text-[clamp(2rem,4vw,3.5rem)] font-display font-medium tracking-tight mb-6">
            Intelligence for every transaction.
          </motion.h2>
          <motion.p variants={fadeUpVariant} className="text-gray-400 text-lg md:text-xl font-light leading-relaxed">
            From daily coffee to international flights, RenoCred provides actionable guidance across your entire spending spectrum.
          </motion.p>
        </motion.div>

        <motion.div 
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.1 } }
          }}
          className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 w-full"
        >
          {useCases.map((useCase, i) => (
            <motion.div 
              key={i}
              variants={fadeUpVariant}
              className="bg-[#111] border border-white/5 rounded-2xl p-6 md:p-8 hover:bg-[#151515] hover:border-semantic-brand-strong/30 transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 group-hover:bg-semantic-brand-strong/10 group-hover:scale-110 transition-all duration-300">
                <useCase.icon className="w-6 h-6 text-gray-400 group-hover:text-semantic-brand-strong transition-colors" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">{useCase.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{useCase.description}</p>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
