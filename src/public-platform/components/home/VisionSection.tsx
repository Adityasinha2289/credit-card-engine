import { motion } from 'framer-motion';
import { fadeUpVariant, staggerContainer } from '../../../motion';
import { ArrowRight, CreditCard, Sparkles, Brain } from 'lucide-react';

const trajectory = [
  {
    phase: 'Today',
    title: 'Wallet Intelligence',
    description: 'Credit cards, rewards, and intelligent payment optimization.',
    icon: CreditCard,
    active: true
  },
  {
    phase: 'Next',
    title: 'Spending Optimization',
    description: 'Deep financial intelligence and behavioral insights.',
    icon: Sparkles,
    active: false
  },
  {
    phase: 'Vision',
    title: 'Personal Financial Copilot',
    description: 'A proactive intelligence layer for all everyday financial decisions.',
    icon: Brain,
    active: false
  }
];

export function VisionSection() {
  return (
    <section className="relative w-full py-24 md:py-32 bg-[#050505] text-white overflow-hidden border-t border-white/5">
      <div className="max-w-5xl mx-auto px-6 relative z-10 flex flex-col items-center">
        
        <motion.div 
          className="text-center w-full mb-20"
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.h2 variants={fadeUpVariant} className="text-[clamp(2.5rem,4vw,3.5rem)] font-display font-medium tracking-tight mb-6">
            From better cards<br className="md:hidden" /> to better decisions.
          </motion.h2>
          <motion.p variants={fadeUpVariant} className="text-gray-400 text-lg md:text-xl font-light leading-relaxed max-w-2xl mx-auto">
            RenoCred is starting with credit cards, but our trajectory is much larger. We are building the intelligence layer for your entire financial life.
          </motion.p>
        </motion.div>

        <motion.div 
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.2 } }
          }}
          className="w-full flex flex-col md:flex-row items-center md:items-start justify-between gap-8 md:gap-4 relative"
        >
          {/* Connecting line (Desktop) */}
          <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-[1px] bg-white/10" />

          {trajectory.map((item, i) => (
            <motion.div 
              key={i}
              variants={fadeUpVariant}
              className="relative w-full md:w-1/3 flex flex-col items-center text-center group"
            >
              {/* Desktop specific line indicator */}
              <div className={`hidden md:block w-24 h-[1px] absolute top-12 ${i === 0 ? 'right-0' : i === 2 ? 'left-0' : 'left-0 right-0 mx-auto'} ${item.active ? 'bg-semantic-brand-strong' : 'bg-transparent'}`} />
              
              <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 relative z-10 transition-all duration-500 ${item.active ? 'bg-[#0f0f0f] border-2 border-semantic-brand-strong shadow-[0_0_30px_rgba(42,157,92,0.3)]' : 'bg-[#0a0a0a] border border-white/10 group-hover:border-white/30'}`}>
                 <item.icon className={`w-8 h-8 ${item.active ? 'text-semantic-brand-strong' : 'text-gray-500 group-hover:text-gray-300'} transition-colors duration-300`} />
              </div>
              
              <div className={`text-xs font-bold uppercase tracking-widest mb-2 ${item.active ? 'text-semantic-brand-strong' : 'text-gray-600'}`}>
                {item.phase}
              </div>
              
              <h3 className="text-xl font-medium text-white mb-3">{item.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed max-w-[250px]">{item.description}</p>
              
              {/* Mobile connecting arrow */}
              {i < trajectory.length - 1 && (
                <div className="md:hidden my-6 text-gray-700">
                  <ArrowRight className="w-5 h-5 rotate-90" />
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
