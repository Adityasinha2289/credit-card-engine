import { motion } from 'framer-motion';
import { Shield, Eye, Lock, Brain } from 'lucide-react';

const principles = [
  {
    id: 'independent',
    icon: Shield,
    title: 'Independent.',
    desc: 'We are not a bank. We do not issue cards. Our only incentive is finding you the absolute best value.'
  },
  {
    id: 'transparent',
    icon: Eye,
    title: 'Transparent.',
    desc: 'Every recommendation comes with mathematical proof. See exactly why a card was chosen and how much you save.'
  },
  {
    id: 'private',
    icon: Lock,
    title: 'Private.',
    desc: 'Your financial data never leaves your device. We use on-device processing to ensure absolute privacy.'
  },
  {
    id: 'intelligent',
    icon: Brain,
    title: 'Intelligent.',
    desc: 'Our engine parses millions of reward combinations, hidden caps, and merchant offers in milliseconds.'
  }
];

export function WhyRenoCredSection() {
  return (
    <section className="w-full py-32 bg-[#050505] text-white relative">
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        
        <div className="mb-20 max-w-2xl">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-display font-bold tracking-tight leading-tight"
          >
            Built on principles, <br/>
            not sales targets.
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {principles.map((p, idx) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.6 }}
                className="group relative rounded-[2rem] bg-white/[0.02] border border-white/5 p-10 overflow-hidden hover:bg-white/[0.04] transition-colors"
              >
                {/* Hover gradient flare */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-emerald-muted blur-[80px] rounded-full group-hover:bg-brand-emerald/30 transition-colors duration-500 pointer-events-none" />
                
                <div className="relative z-10 flex flex-col h-full justify-between gap-12">
                  <div className="w-14 h-14 rounded-2xl bg-[#111111] border border-white/10 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-white group-hover:text-brand-emerald transition-colors" />
                  </div>
                  
                  <div>
                    <h3 className="text-3xl font-display font-bold mb-4">{p.title}</h3>
                    <p className="text-gray-400 text-lg leading-relaxed">{p.desc}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
