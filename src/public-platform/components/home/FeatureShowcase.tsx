import { motion } from 'framer-motion';
import { fadeUpVariant, staggerContainer } from '../../../motion';
import { CreditCard as PhysicalCard } from '../../../features/cards/components/CreditCard';
import { Sparkles, BarChart3, Clock } from 'lucide-react';

export function FeatureShowcase() {
  return (
    <section className="relative w-full py-24 md:py-32 bg-[#050505] text-white overflow-hidden">
      
      <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col gap-32">
        
        {/* Feature 1: Text Left / UI Right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="flex flex-col gap-6"
          >
            <motion.div variants={fadeUpVariant} className="flex items-center gap-2 text-semantic-brand-strong">
              <Sparkles className="w-5 h-5" />
              <span className="text-xs font-bold tracking-widest uppercase">The Engine</span>
            </motion.div>
            <motion.h3 variants={fadeUpVariant} className="text-[clamp(2rem,3vw,2.5rem)] font-display font-medium leading-[1.1]">
              Your entire wallet.<br />Analyzed in real-time.
            </motion.h3>
            <motion.p variants={fadeUpVariant} className="text-gray-400 text-lg leading-relaxed max-w-md">
              RenoCred evaluates the cards you already own against current merchant offers, reward limits, and milestone benefits to guarantee maximum return on every swipe.
            </motion.p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="relative h-[400px] bg-[#0a0a0a] border border-white/5 rounded-[2rem] overflow-hidden flex items-center justify-center p-8"
          >
            {/* Mock UI Composition */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-semantic-brand-strong/10 via-transparent to-transparent opacity-50" />
            <div className="relative z-10 flex -space-x-24 sm:-space-x-32 md:-space-x-24 lg:-space-x-32 rotate-[-5deg] scale-[0.6] sm:scale-75 md:scale-90 lg:scale-[0.85]">
              <motion.div 
                animate={{ y: [0, -10, 0] }} 
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="shadow-2xl z-20"
              >
                <PhysicalCard
                  card={{
                    id: 'rec-sbi',
                    pan: '•••• •••• •••• 1234',
                    cardholderName: 'ADITYA SINHA',
                    expiry: '12/28',
                    network: 'visa',
                    bank: 'SBI Card',
                    status: 'active',
                    availableCredit: 0,
                    creditLimit: 0,
                    label: 'Cashback SBI Card',
                    gradientFrom: '#1E3C72',
                    gradientTo: '#2A5298'
                  }}
                  variant="compact"
                />
              </motion.div>
              <motion.div 
                animate={{ y: [0, 10, 0] }} 
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="shadow-2xl z-10 mt-16 md:mt-24"
              >
                <PhysicalCard
                  card={{
                    id: 'rec-amex',
                    pan: '•••• •••••• •3456',
                    cardholderName: 'ADITYA SINHA',
                    expiry: '09/29',
                    network: 'amex',
                    bank: 'American Express',
                    status: 'active',
                    availableCredit: 0,
                    creditLimit: 0,
                    label: 'Platinum Travel',
                    gradientFrom: '#8E9EAB',
                    gradientTo: '#EEF2F3'
                  }}
                  variant="compact"
                />
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Feature 2: UI Left / Text Right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="order-2 lg:order-1 relative h-[400px] bg-[#0a0a0a] border border-white/5 rounded-[2rem] overflow-hidden flex items-center justify-center p-8"
          >
            {/* Mock UI Composition - Stats */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[#0a0a0a] to-[#111]" />
            <div className="relative z-10 w-full max-w-sm bg-[#151515] border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col gap-6">
               <div className="flex justify-between items-center">
                 <div className="flex flex-col">
                   <span className="text-gray-400 text-xs uppercase tracking-wider">Reward Potential</span>
                   <span className="text-white text-3xl font-display font-medium mt-1">₹42,500</span>
                 </div>
                 <div className="w-12 h-12 rounded-full bg-semantic-brand-strong/10 flex items-center justify-center text-semantic-brand-strong">
                   <BarChart3 className="w-6 h-6" />
                 </div>
               </div>
               
               <div className="flex flex-col gap-3">
                 <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                   <div className="bg-semantic-brand-strong h-full w-[70%]" />
                 </div>
                 <div className="flex justify-between text-xs">
                   <span className="text-semantic-brand-strong font-medium">On track</span>
                   <span className="text-gray-500">₹60,000 Milestone</span>
                 </div>
               </div>
            </div>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="order-1 lg:order-2 flex flex-col gap-6"
          >
            <motion.div variants={fadeUpVariant} className="flex items-center gap-2 text-semantic-brand-strong">
              <Clock className="w-5 h-5" />
              <span className="text-xs font-bold tracking-widest uppercase">Always Ahead</span>
            </motion.div>
            <motion.h3 variants={fadeUpVariant} className="text-[clamp(2rem,3vw,2.5rem)] font-display font-medium leading-[1.1]">
              Know where you stand.<br />Before you spend.
            </motion.h3>
            <motion.p variants={fadeUpVariant} className="text-gray-400 text-lg leading-relaxed max-w-md">
              Keep track of spending milestones, annual fee waivers, and expiring reward points without maintaining complex spreadsheets.
            </motion.p>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
